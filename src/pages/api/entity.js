import { withRequestValidation } from '@helpers/api';
import { idToUri, removeEmptyObjects, getQueryObject } from '@helpers/utils';
import { fillWithVocabularies } from '@helpers/vocabulary';
import { getSessionUser, getUserLists } from '@helpers/database';
import SparqlClient from '@helpers/sparql';
import config from '~/config';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

const getEntityQuery = (route, language, query) => {
  if (!route) {
    return null;
  }
  const jsonQuery = route.details && route.details.query ? route.details.query : route.query;
  const searchQuery = JSON.parse(
    JSON.stringify(getQueryObject(jsonQuery, { language, params: query }))
  );
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

export const getEntity = async (query, language) => {
  const route = config.routes[query.type];
  if (!route) {
    return null;
  }

  const searchQuery = await getEntityQuery(route, language, query);
  if (!searchQuery) {
    return null;
  }

  const queryRes = await SparqlClient.query(searchQuery, {
    endpoint: config.api.endpoint,
    debug: config.debug,
    params: config.api.params,
  });

  const entity = queryRes && queryRes['@graph'][0] && removeEmptyObjects(queryRes['@graph'][0]);
  if (entity) {
    await fillWithVocabularies(entity, { params: query });
  }

  return entity;
};

export const isEntityInList = async (entityId, query, req, res) => {
  if (!entityId || !req) return false;

  const session = await unstable_getServerSession(req, res, authOptions);
  const user = await getSessionUser(session);
  if (!user) {
    return false;
  }

  // Check if this item is in a user list and flag it accordingly.
  const loadedLists = await getUserLists(user);
  return loadedLists.some((list) =>
    list.items.some((it) => it.uri === entityId && it.type === query.type)
  );
};

export const getEntityDebugQuery = async (query, language) => {
  const route = config.routes[query.type];
  const searchQuery = await getEntityQuery(route, language, query);
  return SparqlClient.getSparqlQuery(searchQuery);
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

  const language = query.hl || req.headers['accept-language'];

  const entity = await getEntity(query, language);

  const returnValue = {
    result: entity,
    inList: await isEntityInList(entity['@id'], query, req),
  };

  if (config.debug) {
    returnValue.debugSparqlQuery = await getEntityDebugQuery(query, language);
  }

  res.status(200).json(returnValue);
});
