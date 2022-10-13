import { withRequestValidation } from '@helpers/api';
import { idToUri, removeEmptyObjects, getQueryObject } from '@helpers/utils';
import { fillWithVocabularies } from '@helpers/vocabulary';
import { getSessionUser, getUserLists } from '@helpers/database';
import SparqlClient from '@helpers/sparql';
import config from '~/config';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

const getEntityQuery = (route, query) => {
  if (!route) {
    return null;
  }
  const jsonQuery = route.details && route.details.query ? route.details.query : route.query;
  const searchQuery = JSON.parse(JSON.stringify(getQueryObject(jsonQuery, { params: query })));
  searchQuery.$filter = searchQuery.$filter || [];
  if (!searchQuery.$values) {
    searchQuery.$values = {};
  }
  if (!searchQuery.$values['?id']) {
    searchQuery.$values['?id'] = [
      idToUri(query.id, {
        base: route.uriBase,
      }),
    ];
  }
  return searchQuery;
};

export const getEntity = async (query) => {
  const route = config.routes[query.type];
  if (!route) {
    return null;
  }

  const searchQuery = await getEntityQuery(route, query);
  if (!searchQuery) {
    return null;
  }

  const queryRes = await SparqlClient.query(searchQuery, {
    endpoint: config.api.endpoint,
    debug: config.debug,
    params: config.api.params,
  });

  const result = queryRes && queryRes['@graph'][0] && removeEmptyObjects(queryRes['@graph'][0]);
  if (result) {
    await fillWithVocabularies(result, { params: query });
  }

  return result;
};

export default withRequestValidation({
  allowedMethods: ['GET'],
})(async (req, res) => {
  const { query } = req;

  const route = config.routes[query.type];
  if (!route) {
    res.status(404).json({ error: { message: 'Route not found' } });
    return;
  }

  const entity = await getEntity(query);

  const returnValue = {
    result: entity,
    inList: false,
  };

  if (config.debug) {
    const searchQuery = await getEntityQuery(route, query);
    returnValue.debugSparqlQuery = await SparqlClient.getSparqlQuery(searchQuery);
  }

  if (req) {
    const session = await unstable_getServerSession(req, res, authOptions);
    const user = await getSessionUser(session);
    if (user) {
      // Check if this item is in a user list and flag it accordingly.
      const loadedLists = await getUserLists(user);
      returnValue.inList = loadedLists.some((list) =>
        list.items.some((it) => it.uri === entity['@id'] && it.type === query.type)
      );
    }
  }

  res.status(200).json(returnValue);
});
