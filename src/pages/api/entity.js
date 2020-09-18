import NextAuth from 'next-auth/client';

import { withRequestValidation } from '@helpers/api';
import { idToUri } from '@helpers/utils';
import { fillWithVocabularies } from '@helpers/explorer';
import { getSessionUser, getUserLists } from '@helpers/database';
import SparqlClient from '@helpers/sparql';
import config from '~/config';

export default withRequestValidation({
  allowedMethods: ['GET'],
})(async (req, res) => {
  const { query } = req;

  const route = config.routes[query.type];
  if (!route) {
    res.status(404).json({ error: { message: 'Route not found' } });
    return;
  }

  const jsonQuery = route.details && route.details.query ? route.details.query : route.query;
  const searchQuery = JSON.parse(JSON.stringify(jsonQuery));
  searchQuery.$filter = searchQuery.$filter || [];
  searchQuery.$filter.push(
    `?id = <${idToUri(query.id, {
      base: route.uriBase,
    })}>`
  );

  const returnValue = {
    result: null,
    inList: false,
  };

  if (config.debug) {
    returnValue.debugSparqlQuery = await SparqlClient.getSparqlQuery(searchQuery);
  }

  const queryRes = await SparqlClient.query(searchQuery, {
    endpoint: config.api.endpoint,
    debug: config.debug,
  });

  const result = queryRes && queryRes['@graph'][0];
  if (result) {
    await fillWithVocabularies(result);

    if (req) {
      const session = await NextAuth.getSession({ req });
      const user = await getSessionUser(session);
      if (user) {
        // Check if this item is in a user list and flag it accordingly.
        const loadedLists = await getUserLists(user);
        returnValue.inList = loadedLists.some((list) =>
          list.items.some((it) => it.uri === result['@id'] && it.type === query.type)
        );
      }
    }

    returnValue.result = result;
  }

  res.status(200).json(returnValue);
});
