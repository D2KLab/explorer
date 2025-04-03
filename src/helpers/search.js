import fs from 'fs';

import { mapLimit } from 'async';

import { getSessionUser, getUserLists } from '@helpers/database';
import SparqlClient from '@helpers/sparql';
import { getQueryObject, idToUri, removeEmptyObjects } from '@helpers/utils';
import { fillWithVocabularies } from '@helpers/vocabulary';
import { getEntity } from '@pages/api/entity';
import config from '~/config';

const conditions = {
  and: ' && ',
  or: ' || ',
};

/**
 * Executes a SPARQL query with timeout protection
 * @param {Object} query - SPARQL query object
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Query result
 */
async function safeQueryWithTimeout(query, options = {}) {
  const timeout = options.timeout || 15000; // 15 seconds default timeout

  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`SPARQL query timed out after ${timeout}ms`)), timeout);
    });

    const queryPromise = SparqlClient.query(query, {
      endpoint: config.api.endpoint,
      debug: config.debug,
      params: config.api.params,
      ...options,
    });

    return await Promise.race([queryPromise, timeoutPromise]);
  } catch (error) {
    console.error('SPARQL query error:', error.message);
    return null;
  }
}

/**
 * Gets the filters for the given route with enhanced error handling
 * @param {Object} query - Query parameters
 * @param {Object} options - Options including language
 * @returns {Promise<Filter[]>} - Array of filters
 */
export const getFilters = async (query, { language }) => {
  try {
    if (!query || !query.type) {
      console.warn('getFilters called with invalid query');
      return [];
    }

    const route = config.routes[query.type];
    if (!route || !Array.isArray(route.filters)) {
      return [];
    }

    const filters = [];
    const filterPromises = [];

    for (let i = 0; i < route.filters.length; i += 1) {
      const filter = route.filters[i];

      filterPromises.push(
        (async () => {
          try {
            let filterValues = Array.isArray(filter.values) ? [...filter.values] : [];

            if (filter.isAutocomplete !== false) {
              let filterQuery = null;

              if (filter.query) {
                filterQuery = getQueryObject(filter.query, { language, params: query });
              } else if (filter.vocabulary) {
                const vocabulary = config.vocabularies[filter.vocabulary];
                if (vocabulary) {
                  filterQuery = getQueryObject(vocabulary.query, { language, params: query });
                }
              }

              if (filterQuery) {
                const resQuery = await safeQueryWithTimeout(filterQuery);

                if (resQuery && resQuery['@graph'] && Array.isArray(resQuery['@graph'])) {
                  for (let j = 0; j < resQuery['@graph'].length; j += 1) {
                    const row = resQuery['@graph'][j];

                    // Skip invalid rows
                    if (!row || !row['@id']) continue;

                    const value = row['@id']['@value'] || row['@id'];
                    const label = []
                      .concat(row.label ? row.label['@value'] || row.label : value)
                      .filter((x) => x)
                      .join(', ');
                    const altLabel = []
                      .concat(row.altLabel ? row.altLabel['@value'] || row.altLabel : null)
                      .filter((x) => x)
                      .join(', ');
                    filterValues.push({
                      label,
                      value,
                      altLabel,
                    });
                  }

                  filterValues.sort(
                    (a, b) =>
                      typeof a.label === 'string' &&
                      a.label.localeCompare(b.label, undefined, {
                        numeric: true,
                        sensitivity: 'base',
                      }),
                  );
                }
              }
            }

            const serializedFilter = {
              ...filter,
              values: filterValues,
            };

            // Remove function properties that can't be serialized
            Object.entries(serializedFilter).forEach(([key, value]) => {
              if (typeof value === 'function') {
                delete serializedFilter[key];
              }
            });

            return serializedFilter;
          } catch (filterError) {
            console.error(`Error processing filter ${filter.id}:`, filterError);
            return {
              ...filter,
              values: Array.isArray(filter.values) ? [...filter.values] : [],
              error: true,
            };
          }
        })(),
      );
    }

    const filterResults = await Promise.allSettled(filterPromises);

    filterResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        filters.push(result.value);
      } else {
        console.error(`Filter #${index} failed:`, result.reason);
        filters.push({
          ...(route.filters[index] || {}),
          values: [],
          error: true,
        });
      }
    });

    return filters;
  } catch (error) {
    console.error('Critical error in getFilters:', error);
    return [];
  }
};

/**
 * Takes in a query object and a list of filters and returns a tuple of the extraWhere and extraFilter arrays.
 * @param {object} query - the query object
 * @param {Filter[]} filters - the list of filters
 * @returns {object} - an object with two arrays, extraWhere and extraFilter
 */
const getExtraFromFilters = (query, filters) => {
  try {
    const extraWhere = [];
    const extraFilter = [];

    // Props filter
    for (let i = 0; i < filters.length; i += 1) {
      const filter = filters[i];
      if (!filter || !filter.id) continue;

      let val = filter.defaultValue;
      if (query[`filter_${filter.id}`]) {
        if (filter.isOption) {
          // Since options are checkboxes, get either 1 for true or 0 for false
          val = parseInt(query[`filter_${filter.id}`], 10) === 1;
          // Unset the value so we don't trigger whereFunc/filterFunc
          if (val === false) {
            val = undefined;
          }
        } else if (filter.isMulti) {
          // Make sure that the value is an array when isMulti is set
          val = !Array.isArray(query[`filter_${filter.id}`])
            ? [query[`filter_${filter.id}`]]
            : query[`filter_${filter.id}`];
        } else {
          val = query[`filter_${filter.id}`];
        }
      }

      if (typeof val !== 'undefined') {
        let filterCondition =
          filter.condition === 'user-defined'
            ? query[`cond_filter_${filter.id}`]
            : filter.condition;
        if (!Object.keys(conditions).includes(filterCondition)) {
          filterCondition = 'or';
        }

        const values = [].concat(val).filter((x) => x);

        if (filterCondition === 'and') {
          // AND condition is a little bit more complicated to handle
          // We have to combine whereFunc and the content of filterFunc together
          values.forEach((value, i) => {
            try {
              const filterRet =
                typeof filter.filterFunc === 'function' ? filter.filterFunc(value, i) : [];
              extraWhere.push(`{
                  ${[]
                    .concat(
                      typeof filter.whereFunc === 'function' ? filter.whereFunc(value, i) : [],
                    )
                    .filter((x) => x)
                    .join(' . ')}
                  ${filterRet.length > 0 ? `FILTER(${filterRet})` : ''}
                }`);
            } catch (error) {
              console.error(`Error in AND condition for filter ${filter.id}:`, error);
              // Skip this filter on error
            }
          });
        } else if (filterCondition === 'or') {
          if (typeof filter.whereFunc === 'function') {
            try {
              const unionWhere = [];
              values.forEach((value, i) => {
                try {
                  unionWhere.push(`{
                    ${[]
                      .concat(filter.whereFunc(value, i))
                      .filter((x) => x)
                      .join(' .')}
                  }`);
                  if (i < values.length - 1) {
                    unionWhere.push('UNION');
                  }
                } catch (valueError) {
                  console.error(`Error processing OR value for filter ${filter.id}:`, valueError);
                  // Skip this value on error
                }
              });

              if (unionWhere.length > 0) {
                extraWhere.push(unionWhere.join('\n'));
              }

              const whereFilters = [];
              if (typeof filter.filterFunc === 'function') {
                try {
                  const filterRet = values
                    .map((value, i) => {
                      try {
                        return filter.filterFunc(value, i);
                      } catch (error) {
                        console.error(`Error in filter function for value ${value}:`, error);
                        return null;
                      }
                    })
                    .filter((f) => f !== null);

                  if (filterRet.length > 0) {
                    whereFilters.push(`(${filterRet.join(' || ')})`);
                  }
                } catch (error) {
                  console.error(`Error in filterFunc for filter ${filter.id}:`, error);
                }
              }

              if (whereFilters.length > 0) {
                extraWhere.push(`FILTER(${whereFilters.join(' || ')})`);
              }
            } catch (error) {
              console.error(`Error processing OR condition for filter ${filter.id}:`, error);
              // Skip this filter on error
            }
          }
        }
      }
    }

    return { extraWhere, extraFilter };
  } catch (error) {
    console.error('Error in getExtraFromFilters:', error);
    return { extraWhere: [], extraFilter: [] };
  }
};

/**
 * Generates the WHERE condition for a SPARQL query with error handling
 * @param {Object} query - Query parameters
 * @param {string} language - Language code
 * @returns {Promise<string>} - WHERE condition
 */
const generateWhereCondition = async (query, language) => {
  try {
    if (!query || !query.type) {
      return '';
    }

    const route = config.routes[query.type];
    if (!route) {
      return '';
    }

    const baseWhere = route.baseWhere || [];
    const filters = route.filters || [];
    const { extraWhere, extraFilter } = getExtraFromFilters(query, filters);

    // Text search
    const textSearchWhere = [];
    if (query.q) {
      try {
        if (typeof route.textSearchFunc === 'function') {
          const textSearchResults = route.textSearchFunc(
            query.q,
            query.in || route.textSearchDefaultOption || route.textSearchOptions?.[0],
          );

          if (Array.isArray(textSearchResults)) {
            textSearchWhere.push(...textSearchResults);
          }
        } else {
          if (typeof route.labelProp === 'string') {
            textSearchWhere.push(`?id <${route.labelProp}> ?_s1texto`);
          } else {
            textSearchWhere.push('?id ?_s1textp ?_s1texto');
          }

          // Sanitize the search query to prevent SPARQL injection
          const sanitizedQ = query.q.replace(/["\\]/g, (match) => `\\${match}`);
          textSearchWhere.push(`?_s1texto bif:contains '"${sanitizedQ}"'`);
        }
      } catch (error) {
        console.error('Error in text search:', error);
      }
    }

    // Graph
    if (query.graph) {
      extraFilter.push(`?g = <${query.graph}>`);
    }

    // Languages
    if (query.languages && Array.isArray(query.languages)) {
      try {
        const labelProp =
          typeof route.labelProp === 'string'
            ? route.labelProp
            : 'http://www.w3.org/2000/01/rdf-schema#label';
        extraWhere.push(`?id <${labelProp}> ?label`);

        const langFilters = query.languages
          .filter((lang) => typeof lang === 'string')
          .map((lang) => `LANGMATCHES(LANG(?label), "${lang.replace(/[^a-z-]/gi, '')}")`)
          .join(' || ');

        if (langFilters) {
          extraFilter.push(langFilters);
        }
      } catch (error) {
        console.error('Error in language filters:', error);
      }
    }

    // URIs
    if (query.similarity_type) {
      try {
        const uris = [];
        if (query[`${query.similarity_type}_uris`]) {
          uris.push(
            ...query[`${query.similarity_type}_uris`]
              .split(',')
              .map((id) => idToUri(id, { base: route.uriBase })),
          );
        } else if (query.similarity_entity) {
          const similarityEntity = await getEntity(
            {
              id: query.similarity_entity,
              type: query.type,
            },
            language,
          );

          if (
            similarityEntity &&
            similarityEntity.representation &&
            similarityEntity.representation[0]?.image
          ) {
            try {
              const data = await searchImage(similarityEntity.representation[0].image);
              if (data && data[`${query.similarity_type}Uris`]) {
                uris.push(...data[`${query.similarity_type}Uris`]);
              }
            } catch (imageError) {
              console.error('Error in image similarity search:', imageError);
            }
          }
        }

        if (uris.length > 0) {
          extraWhere.push(`VALUES ?id { ${uris.map((uri) => `<${uri}>`).join(' ')} }`);
        }
      } catch (error) {
        console.error('Error in similarity URIs:', error);
      }
    }

    const whereCondition = `
      ${baseWhere.join('.')}
      ${baseWhere.length > 0 ? '.' : ''}
      ${extraWhere.join('.')}
      ${extraWhere.length > 0 ? '.' : ''}
      ${textSearchWhere.join('.')}
      ${textSearchWhere.length > 0 ? '.' : ''}
      ${extraFilter.length > 0 ? `FILTER(${extraFilter.join(' && ')})` : ''}
    `;

    return whereCondition;
  } catch (error) {
    console.error('Error generating WHERE condition:', error);
    // Return a minimal valid WHERE condition
    return '?id ?p ?o';
  }
};

/**
 * Dumps all entities matching the query
 * @param {Object} query - Query parameters
 * @param {string} language - Language code
 * @returns {Promise<Array>} - Array of entities
 */
export const dumpEntities = async (query, language) => {
  try {
    const entities = [];
    const whereCondition = await generateWhereCondition(query, language);

    const itemsPerPage = 1e4;
    let offset = 0;
    let consecutiveEmptyResults = 0;
    const maxConsecutiveEmptyResults = 3;

    while (consecutiveEmptyResults < maxConsecutiveEmptyResults) {
      try {
        const dumpQuery = {
          '@graph': [
            {
              '@id': '?id',
              '@graph': '?g',
            },
          ],
          $where: [whereCondition],
          $filter: [],
          $offset: offset,
          $limit: itemsPerPage,
        };

        // Call the endpoint with the dump query and timeout protection
        const resDump = await safeQueryWithTimeout(dumpQuery, { timeout: 30000 });

        if (resDump && resDump['@graph'] && Array.isArray(resDump['@graph'])) {
          if (resDump['@graph'].length === 0) {
            consecutiveEmptyResults += 1;
          } else {
            consecutiveEmptyResults = 0;
            entities.push(...resDump['@graph']);
          }
        } else {
          consecutiveEmptyResults += 1;
        }
      } catch (e) {
        console.error('Error in dump query:', e);
        consecutiveEmptyResults += 1;
      }

      offset += itemsPerPage;

      // Safety limit to prevent infinite loops
      if (entities.length >= 1e6) {
        console.warn('Reached maximum entity limit (1M) in dumpEntities');
        break;
      }
    }

    return entities;
  } catch (error) {
    console.error('Error in dumpEntities:', error);
    return [];
  }
};

/**
 * Fetches entities matching the query
 * @param {Object} query - Query parameters
 * @param {string} language - Language code
 * @returns {Promise<Object>} - Search results
 */
const fetchEntities = async (query, language) => {
  try {
    const entities = [];
    let debugSparqlQuery = null;
    let totalResults = 0;

    const route = config.routes[query.type];
    if (!route) {
      return { totalResults, debugSparqlQuery, entities };
    }

    const whereCondition = await generateWhereCondition(query, language);
    if (!whereCondition) {
      return { totalResults, debugSparqlQuery, entities };
    }

    // Pagination
    const minPerPage = 5; // minimum number of results per page
    const maxPerPage = 50; // maximum number of results per page
    const defaultPerPage = 20; // default number of results per page
    const itemsPerPage =
      Math.max(minPerPage, Math.min(maxPerPage, parseInt(query.per_page, 10))) || defaultPerPage;

    // Parse and validate page number
    const pageNumber = Math.max(1, parseInt(query.page, 10) || 1);
    const offset = itemsPerPage * (pageNumber - 1);

    // We cannot use sparql-transformer $limit/$offset/$orderby because the $limit property limits the whole
    // query results, while we actually need to limit the number of unique ?id results
    // The subquery is also used to compute the total number of pages for the pagination component
    const mainSearchQuery = {
      '@graph': [
        {
          '@id': '?id',
          '@graph': '?g',
        },
      ],
      $where: [whereCondition],
      $filter: [],
      $offset: `${offset}`,
      $limit: itemsPerPage,
    };

    // Sort by
    let orderByVariable = 'orderByVariable' in route && !route.orderByVariable ? null : 'id';
    let orderByDirection = route.orderByDirection || 'ASC';
    let sortFilterId = null;
    let sortDirection = null;

    if (query.sort) {
      const sortParts = query.sort.split('|');
      if (sortParts.length >= 1) {
        sortFilterId = sortParts[0];
        if (sortParts.length >= 2) {
          sortDirection = sortParts[1];
        }
      }
    } else if (route.defaultSort) {
      sortFilterId = route.defaultSort.id;
      sortDirection = route.defaultSort.reverse ? 'DESC' : 'ASC';
    }

    if (sortFilterId) {
      const sortFilter = route.filters?.find((filter) => filter.id === sortFilterId);
      if (sortFilter && typeof sortFilter.whereFunc === 'function') {
        try {
          const whereFunc = sortFilter.whereFunc();
          if (whereFunc) {
            mainSearchQuery.$where.push(
              `OPTIONAL { ${[]
                .concat(whereFunc)
                .filter((x) => x)
                .join(' . ')} }`,
            );
            orderByVariable = sortFilter.isSortable?.variable || sortFilterId;
            if (['ASC', 'DESC'].includes(sortDirection)) {
              orderByDirection = sortDirection;
            }
          }
        } catch (error) {
          console.error('Error in sort filter whereFunc:', error);
        }
      }
    }

    if (orderByVariable) {
      mainSearchQuery.$orderby = `${orderByDirection}(?${orderByVariable})`;
    }

    // Execute the main search query
    if (config.debug) {
      try {
        debugSparqlQuery = await SparqlClient.getSparqlQuery(mainSearchQuery);
      } catch (error) {
        console.error('Error generating debug SPARQL query:', error);
      }
    }

    // Call the endpoint with the main search query
    try {
      const resMainSearch = await safeQueryWithTimeout(mainSearchQuery);
      if (resMainSearch && resMainSearch['@graph'] && Array.isArray(resMainSearch['@graph'])) {
        entities.push(...resMainSearch['@graph']);
      }
    } catch (e) {
      console.error('Error in main search query:', e);
    }

    // Compute the total number of pages (used for pagination)
    if (route.countResults === false) {
      totalResults = -1;
    } else {
      try {
        const paginationQuery = {
          proto: {
            id: '?count',
          },
          $where: `
          SELECT (COUNT(DISTINCT ?id) AS ?count) WHERE {
            ${whereCondition}
          }
          ${query.approximate ? 'LIMIT 1000' : ''}
        `,
        };

        const resPagination = await safeQueryWithTimeout(paginationQuery);
        totalResults = resPagination && resPagination[0] ? parseInt(resPagination[0].id, 10) : 0;
      } catch (e) {
        console.error('Error in pagination query:', e);
      }
    }

    return {
      debugSparqlQuery,
      totalResults,
      entities,
    };
  } catch (error) {
    console.error('Error in fetchEntities:', error);
    return {
      debugSparqlQuery: null,
      totalResults: 0,
      entities: [],
    };
  }
};

/**
 * Searches for the given query in the given language
 * @param {object} query - the query to search for
 * @param {object} session - the session to search in
 * @param {string} language - the language to search in
 * @returns {Promise<SearchResults>}
 */
export const search = async (query, session, language) => {
  try {
    const results = [];
    const favorites = [];

    const { debugSparqlQuery, totalResults, entities } = await fetchEntities(query, language);

    // Exit early if no entities found
    if (!entities.length) {
      return {
        results,
        totalResults,
        favorites,
        debugSparqlQuery,
      };
    }

    // Loop through each entity and get the details
    const route = config.routes[query.type];
    if (!route) {
      return {
        results,
        totalResults,
        favorites,
        debugSparqlQuery,
      };
    }

    const maxConcurrentRequests = 3;
    const entityDetailsTimeout = 10000; // 10 seconds

    try {
      await new Promise((resolve) => {
        mapLimit(
          entities,
          maxConcurrentRequests,
          async (entity) => {
            try {
              // Skip invalid entities
              if (!entity || !entity['@id']) {
                return [];
              }

              const searchDetailsQuery = JSON.parse(
                JSON.stringify(getQueryObject(route.query, { language, params: query })),
              );
              searchDetailsQuery.$where = searchDetailsQuery.$where || [];
              searchDetailsQuery.$filter = searchDetailsQuery.$filter || [];
              searchDetailsQuery.$values = searchDetailsQuery.$values || {};
              searchDetailsQuery.$values['?id'] = searchDetailsQuery.$values['?id'] || [];
              searchDetailsQuery.$values['?id'].push(entity['@id']);

              // Set a timeout for entity details fetching
              const timeoutPromise = new Promise((_, reject) => {
                setTimeout(
                  () =>
                    reject(new Error(`Entity details timed out after ${entityDetailsTimeout}ms`)),
                  entityDetailsTimeout,
                );
              });

              const searchPromise = safeQueryWithTimeout(searchDetailsQuery);

              const resSearchDetails = await Promise.race([searchPromise, timeoutPromise]).catch(
                (error) => {
                  console.error(`Error fetching details for entity ${entity['@id']}:`, error);
                  return null;
                },
              );

              const details = [];
              if (resSearchDetails && resSearchDetails['@graph']) {
                // Ignore empty objects
                const detailsWithoutEmptyObjects =
                  resSearchDetails['@graph'].map(removeEmptyObjects);
                details.push(...detailsWithoutEmptyObjects);
              }

              return details;
            } catch (entityError) {
              console.error(`Error processing entity ${entity['@id']}:`, entityError);
              return [];
            }
          },
          (err, res) => {
            if (err) {
              console.error('Error in entity details mapping:', err);
              // Don't fail completely, resolve with what we have
              resolve(res || []);
              return;
            }
            results.push(...(res || []).flat().filter((item) => item));
            resolve();
          },
        );
      });
    } catch (mapError) {
      console.error('Error mapping entity details:', mapError);
      // Continue with what we have
    }

    // Fill with vocabularies, but don't let it fail the entire search
    for (let i = 0; i < results.length; i += 1) {
      try {
        await fillWithVocabularies(results[i], { params: query });
      } catch (vocabError) {
        console.error(`Error filling vocabularies for result ${i}:`, vocabError);
        // Continue with next result
      }
    }

    // Get favorites if session exists
    if (session) {
      try {
        const user = await getSessionUser(session);
        if (user) {
          // Check if this item is in a user list and flag it accordingly.
          const loadedLists = await getUserLists(user);
          if (loadedLists && Array.isArray(loadedLists)) {
            favorites.push(
              ...results
                .filter((result) =>
                  loadedLists.some(
                    (list) =>
                      list.items &&
                      Array.isArray(list.items) &&
                      list.items.some((it) => it.uri === result['@id'] && it.type === query.type),
                  ),
                )
                .map((result) => result['@id']),
            );
          }
        }
      } catch (sessionError) {
        console.error('Error fetching user favorites:', sessionError);
      }
    }

    return {
      results,
      totalResults,
      favorites,
      debugSparqlQuery,
    };
  } catch (error) {
    console.error('Critical error in search:', error);
    return {
      results: [],
      totalResults: 0,
      favorites: [],
      debugSparqlQuery: null,
      error: {
        message: 'An error occurred during search',
        details: error.message,
      },
    };
  }
};

/**
 * Image based search
 * @param {object | string} image - the uploaded image or image URI
 * @returns {Promise<Object>} - Search results
 */
export const searchImage = async (image) => {
  try {
    if (!image) {
      throw new Error('No image provided');
    }

    const formData = new FormData();

    if (typeof image === 'string') {
      try {
        // Add timeout to image fetch
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const res = await fetch(image, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);
        }

        const blob = await res.blob();
        formData.append('file', blob, 'image.jpg');
      } catch (fetchError) {
        console.error('Error fetching image:', fetchError);
        throw new Error(`Failed to fetch image: ${fetchError.message}`);
      }
    } else if (typeof image === 'object' && image.filepath) {
      try {
        // Check if file exists and is readable
        if (!fs.existsSync(image.filepath)) {
          throw new Error('Uploaded file not found');
        }

        const stream = fs.createReadStream(image.filepath);
        const blob = await new Response(stream).blob();
        formData.append('file', blob, image.newFilename || 'upload.jpg');
      } catch (error) {
        console.error('Error processing uploaded image:', error);
        throw new Error(`Error processing uploaded image: ${error.message}`);
      } finally {
        // Clean up temporary file even if there's an error
        try {
          if (fs.existsSync(image.filepath)) {
            fs.unlinkSync(image.filepath);
          }
        } catch (unlinkError) {
          console.error('Error removing temporary file:', unlinkError);
        }
      }
    } else {
      throw new Error('Invalid image format provided');
    }

    // Set timeout for API call
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const res = await fetch('https://silknow-image-retrieval.tools.eurecom.fr/api/retrieve', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Image search API returned ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();

      if (data.message) {
        throw new Error(data.message);
      }

      return data;
    } catch (apiError) {
      console.error('Error calling image search API:', apiError);
      throw new Error(`Image search failed: ${apiError.message}`);
    }
  } catch (error) {
    console.error('Error in searchImage:', error);
    return {
      error: error.message || 'Unknown error in image search',
      visualUris: [],
      semanticUris: [],
    };
  }
};

/**
 * Safe wrapper for any function that might throw
 * @param {Function} fn - Function to execute safely
 * @param {*} defaultValue - Default value to return if function throws
 * @returns {*} - Function result or default value
 */
export const safeExecute = (fn, defaultValue = null) => {
  try {
    return fn();
  } catch (error) {
    console.error('Error in safeExecute:', error);
    return defaultValue;
  }
};
