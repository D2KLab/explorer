const sparqlTransformer = require('sparql-transformer').default;

const cache = require('./cache');
const config = require('../../config');

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
  } catch (err) {}
  return sparqlQuery;
};

export const query = async (queryObject, { endpoint, debug = false, params = {} } = {}) => {
  const sparqlQuery = await getSparqlQuery(queryObject);
  let results = null;
  if (sparqlQuery) {
    const cacheKey = JSON.stringify(sparqlQuery);
    await cache.exists(cacheKey).then(async (reply) => {
      if (reply !== 1) {
        const resQuery = await sparqlTransformer(queryObject, {
          endpoint,
          debug,
          params,
        });
        if (resQuery) {
          await cache.set(cacheKey, JSON.stringify(resQuery));
        }
        results = resQuery;
      } else {
        results = JSON.parse(await cache.get(cacheKey));
      }
    });
  }
  return results;
};

const sparql = {
  getSparqlQuery,
  query,
};

export default sparql;
