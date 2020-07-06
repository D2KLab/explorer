import NextAuth from 'next-auth/client';

import { withRequestValidation } from '@helpers/api';
import { absoluteUrl, idToUri } from '@helpers/utils';
import { fillWithVocabularies } from '@helpers/explorer';
import SparqlClient from '@helpers/sparql';
import config from '~/config';

export default withRequestValidation({
  allowedMethods: ['GET'],
})(async (req, res) => {
  const { query } = req;

  const route = config.routes[query.type];
  const jsonQuery = route.details && route.details.query ? route.details.query : route.query;
  const searchQuery = JSON.parse(JSON.stringify(jsonQuery));
  searchQuery.$filter = `?id = <${idToUri(query.id, {
    base: route.uriBase,
    encoding: !route.uriBase,
  })}>`;

  let inList = false;

  const queryRes = await SparqlClient.query(searchQuery, {
    endpoint: config.api.endpoint,
    debug: config.debug,
  });

  const result = queryRes && queryRes['@graph'][0];
  if (result) {
    await fillWithVocabularies(result);

    if (req) {
      const session = await NextAuth.getSession({ req });
      if (session) {
        // Check if this item is in a user list and flag it accordingly.
        const loadedLists = await (
          await fetch(`${absoluteUrl(req)}/api/profile/lists`, {
            headers:
              req && req.headers
                ? {
                    cookie: req.headers.cookie,
                  }
                : undefined,
          })
        ).json();
        inList = loadedLists.some((list) => list.items.includes(result['@id']));
      }
    }
  }

  res.status(200).json({
    result,
    inList,
  });
});
