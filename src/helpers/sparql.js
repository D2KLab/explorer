import sparqlTransformer from 'sparql-transformer';

import cache from './cache';

import config from '~/config';

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
        return Promise.reject(new Error('Getting only SPARQL string'));
      },
    });
  } catch (err) {
    // Log unexpected errors
    if (err.message !== 'Getting only SPARQL string') {
      console.error('Error generating SPARQL query:', err);
    }
  }
  return sparqlQuery;
};

/**
 * Retrieves results from cache if available
 * @param {string} cacheKey - Key to check in cache
 * @returns {Object|null} The cached result or null if not found
 */
const getFromCache = async (cacheKey) => {
  const exists = await cache.exists(cacheKey);
  if (exists === 1) {
    const cachedData = await cache.get(cacheKey);
    return JSON.parse(cachedData);
  }
  return null;
};

/**
 * Stores results in cache
 * @param {string} cacheKey - Key to use for caching
 * @param {Object} data - Data to cache
 */
const storeInCache = async (cacheKey, data) => {
  if (data) {
    await cache.set(cacheKey, JSON.stringify(data));
  }
};

/**
 * Takes in a query object and returns the results of the query.
 * @param {object} queryObject - the query object
 * @param {object} options - query options
 * @param {string} [options.endpoint="https://query.wikidata.org/sparql"] - the endpoint to query
 * @param {boolean} [options.debug=false] - whether to log the query information
 * @param {object} [options.params={}] - the parameters to pass to the endpoint
 * @returns {object|null} the results of the query or null if the query failed
 */
export const query = async (queryObject, { endpoint, debug = false, params = {} } = {}) => {
  const sparqlQuery = await getSparqlQuery(queryObject);
  if (!sparqlQuery) {
    return null;
  }

  const cacheKey = JSON.stringify(sparqlQuery);

  // Try to get from cache first
  const cachedResult = await getFromCache(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }

  // If not in cache, execute the query
  try {
    const resQuery = await sparqlTransformer(queryObject, {
      endpoint,
      debug,
      params,
      sparqlFunction: (sparql) => {
        const fetchOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/sparql-query',
            Accept: 'application/json',
          },
          signal: AbortSignal.timeout(60 * 1000),
          body: sparql,
        };
        return fetch(endpoint, fetchOptions)
          .then((response) => {
            if (!response.ok) {
              if (debug) {
                console.error('Network response was not ok:', response.statusText);
                console.error('SPARQL query:', sparql);
                console.error('Fetch options:', fetchOptions);
              }
              throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json();
          })
          .then((data) => {
            if (debug) {
              console.log('SPARQL response:', data);
            }
            return data;
          });
      },
    });

    // Cache the result
    await storeInCache(cacheKey, resQuery);
    return resQuery;
  } catch (err) {
    console.error('Error executing SPARQL query:', err);
    return null;
  }
};

/**
 * Utility functions for executing and manipulating SPARQL queries
 * @namespace
 * @property {Function} getSparqlQuery - Convert a query object to a SPARQL string
 * @property {Function} query - Execute a SPARQL query and return the results
 */
const sparql = {
  getSparqlQuery,
  query,
};

export default sparql;
