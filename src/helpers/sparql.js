const sparqlTransformer = require('sparql-transformer').default;

const cache = require("./cache");
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
  } catch (err) {
    // eslint-disable-next-line no-empty
  }
  return sparqlQuery;
};

export const query = async (queryObject, { endpoint, debug } = {}) => {
  const sparqlQuery = await getSparqlQuery(queryObject);
  let results = null;
  if (sparqlQuery) {
    const cacheKey = JSON.stringify(sparqlQuery);
    await cache.exists(cacheKey).then(async (reply) => {
      if (reply !== 1) {
        const resQuery = await sparqlTransformer(queryObject, {
          endpoint,
          debug,
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

export default {
  getSparqlQuery,
  query,
};
