const sparqlTransformer = require('sparql-transformer').default;

const cache = require('./cache');

const config = require('~/config');

/**
 * Takes in a SPARQL query and returns the transformed query using sparql-transformer
 * @param {string} query - the SPARQL query to transform
 * @returns {string} the transformed query
 */
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

/**
 * Takes in a query object and returns the results of the query.
 * @param {object} queryObject - the query object
 * @param {string} [endpoint="https://query.wikidata.org/sparql"] - the endpoint to query
 * @param {boolean} [debug=false] - whether to print the query to the console
 * @param {object} [params={}] - the parameters to pass to the endpoint
 * @returns {object} the results of the query
 */
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
