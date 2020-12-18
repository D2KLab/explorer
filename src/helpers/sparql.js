const NodeCache = require('node-cache');
const sparqlTransformer = require('sparql-transformer').default;
const config = require('../../config');

if (!(global.sparqlCache instanceof NodeCache)) {
  global.sparqlCache = global.sparqlCache || new NodeCache();
}

export const getSparqlQuery = async (query) => {
  let sparqlQuery = null;
  if (config && config.api && config.api.prefixes) {
    query.$prefixes = { ...config.api.prefixes, ...query.$prefixes };
  }
  try {
    await sparqlTransformer(query, {
      debug: false,
      sparqlFunction: (sparql) => {
        sparqlQuery = sparql.trim();
        return Promise.reject();
      },
    });
  } catch (err) {
    // eslint-disable-next-line no-empty
  }
  return sparqlQuery;
};

export const query = async (queryObject, { endpoint, debug, ttl = 0 } = {}) => {
  const sparqlQuery = await getSparqlQuery(queryObject);
  if (sparqlQuery) {
    const cachedRes = global.sparqlCache.get(sparqlQuery);
    if (typeof cachedRes !== 'undefined') {
      return cachedRes;
    }
  }
  try {
    const res = await sparqlTransformer(queryObject, {
      endpoint,
      debug,
    });
    if (sparqlQuery) {
      global.sparqlCache.set(sparqlQuery, res, ttl);
    }
    return res;
  } catch (err) {
    console.error(err);
  }
  return null;
};

export default {
  getSparqlQuery,
  query,
};
