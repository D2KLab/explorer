import os from 'os';
import fs from 'fs';
import path from 'path';
import util from 'util';

import FormData from 'form-data';
import { mapLimit } from 'async';

import { getSessionUser, getUserLists } from '@helpers/database';
import { fillWithVocabularies } from '@helpers/vocabulary';
import { removeEmptyObjects, getQueryObject, idToUri } from '@helpers/utils';
import SparqlClient from '@helpers/sparql';
import { getEntity } from '@pages/api/entity';
import config from '~/config';

const conditions = {
  and: ' && ',
  or: ' || ',
};

/**
 * Gets the filters for the given route.
 * @param {string} query.type - the type of route to get filters for.
 * @param {string} query.language - the language of the filters to get.
 * @returns {Promise<Filter[]>} - A promise that resolves to an array of filters.
 */
export const getFilters = async (query, { language }) => {
  const route = config.routes[query.type];
  if (!route || !Array.isArray(route.filters)) {
    return [];
  }

  const filters = [];

  // Fetch filters
  for (let i = 0; i < route.filters.length; i += 1) {
    const filter = route.filters[i];
    let filterValues = Array.isArray(filter.values) ? filter.values : [];

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
      const resQuery = await SparqlClient.query(filterQuery, {
        endpoint: config.api.endpoint,
        debug: config.debug,
        params: config.api.params,
      });
      if (resQuery) {
        filterValues.push(
          ...resQuery['@graph'].map((row) => {
            const value = row['@id']['@value'] || row['@id'];
            const label = []
              .concat(row.label ? row.label['@value'] || row.label : value)
              .filter((x) => x)
              .join(', ');
            const altLabel = []
              .concat(row.altLabel ? row.altLabel['@value'] || row.altLabel : null)
              .filter((x) => x)
              .join(', ');
            return {
              label,
              value,
              altLabel,
            };
          })
        );

        // Sort values by label
        filterValues.sort(
          (a, b) =>
            typeof a.label === 'string' &&
            a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: 'base' })
        );
      }
    }

    const serializedFilter = {
      ...filter,
      values: filterValues,
    };
    Object.entries(serializedFilter).forEach(([key, value]) => {
      if (typeof value === 'function') {
        delete serializedFilter[key];
      }
    });
    filters.push(serializedFilter);
  }

  return filters;
};

/**
 * Takes in a query object and a list of filters and returns a tuple of the extraWhere and extraFilter arrays.
 * @param {object} query - the query object
 * @param {Filter[]} filters - the list of filters
 * @returns {object} - an object with two arrays, extraWhere and extraFilter
 */
const getExtraFromFilters = (query, filters) => {
  const extraWhere = [];
  const extraFilter = [];

  // Props filter
  for (let i = 0; i < filters.length; i += 1) {
    const filter = filters[i];
    if (filter.id) {
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
            const filterRet = filter.filterFunc(value, i);
            extraWhere.push(`{
              ${[]
                .concat(filter.whereFunc(value, i))
                .filter((x) => x)
                .join(' . ')}
              ${filterRet ? `FILTER(${filterRet})` : ''}
            }`);
          });
        } else if (filterCondition === 'or') {
          if (typeof filter.whereFunc === 'function') {
            const unionWhere = [];
            values.forEach((value, i) => {
              unionWhere.push(`{
                ${[]
                  .concat(filter.whereFunc(value, i))
                  .filter((x) => x)
                  .join(' .')}
              }`);
              if (i < values.length - 1) {
                unionWhere.push('UNION');
              }
            });
            extraWhere.push(unionWhere.join('\n'));
          }

          if (typeof filter.filterFunc === 'function') {
            const filterRet = values.map((value, i) => filter.filterFunc(value, i));
            if (Array.isArray(filterRet)) {
              extraFilter.push(`(${filterRet.join(' || ')})`);
            } else {
              extraFilter.push(filterRet);
            }
          }
        }
      }
    }
  }

  return { extraWhere, extraFilter };
};

const generateWhereCondition = async (query, language) => {
  const route = config.routes[query.type];
  const baseWhere = route.baseWhere || [];
  const filters = route.filters || [];
  const { extraWhere, extraFilter } = getExtraFromFilters(query, filters);

  // Text search
  const textSearchWhere = [];
  if (query.q) {
    if (typeof route.textSearchFunc === 'function') {
      textSearchWhere.push(...route.textSearchFunc(query.q));
    } else {
      if (typeof route.labelProp === 'string') {
        textSearchWhere.push(`?id <${route.labelProp}> ?_s1texto`);
      } else {
        textSearchWhere.push('?id ?_s1textp ?_s1texto');
      }
      textSearchWhere.push(`?_s1texto bif:contains '${JSON.stringify(query.q)}'`);
    }
  }

  // Graph
  if (query.graph) {
    extraFilter.push(`?g = <${query.graph}>`);
  }

  // Languages
  if (query.languages) {
    const labelProp =
      typeof route.labelProp === 'string'
        ? route.labelProp
        : 'http://www.w3.org/2000/01/rdf-schema#label';
    extraWhere.push(`?id <${labelProp}> ?label`);
    extraFilter.push(
      query.languages.map((lang) => `LANGMATCHES(LANG(?label), "${lang}")`).join(' || ')
    );
  }

  // URIs
  if (query.similarity_type) {
    const uris = [];
    if (query[`${query.similarity_type}_uris`]) {
      uris.push(
        ...query[`${query.similarity_type}_uris`]
          .split(',')
          .map((id) => idToUri(id, { base: route.uriBase }))
      );
    } else if (query.similarity_entity) {
      const similarityEntity = await getEntity(
        {
          id: query.similarity_entity,
          type: query.type,
        },
        language
      );

      if (similarityEntity) {
        const data = await searchImage(similarityEntity.representation[0]?.image);
        uris.push(...data[`${query.similarity_type}Uris`]);
      }
    }
    if (uris.length > 0) {
      extraWhere.push(`VALUES ?id { ${uris.map((uri) => `<${uri}>`).join(' ')} }`);
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
};

export const dumpEntities = async (query, language) => {
  const entities = [];
  const whereCondition = await generateWhereCondition(query, language);

  const itemsPerPage = 1e4;
  let offset = 0;

  while (true) {
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

    // Call the endpoint with the dump query
    try {
      const resDump = await SparqlClient.query(dumpQuery, {
        endpoint: config.api.endpoint,
        debug: config.debug,
        params: config.api.params,
      });
      if (resDump) {
        if (resDump['@graph'].length === 0) {
          break;
        }
        entities.push(...resDump['@graph']);
      }
    } catch (e) {
      console.error(e);
    }

    offset += itemsPerPage;
  }

  return entities;
};

const fetchEntities = async (query, language) => {
  const entities = [];
  let debugSparqlQuery = null;
  let totalResults = 0;

  const route = config.routes[query.type];
  if (!route) {
    return { totalResults, debugSparqlQuery, entities };
  }

  const whereCondition = await generateWhereCondition(query, language);

  // Pagination
  const minPerPage = 5; // minimum number of results per page
  const maxPerPage = 50; // maximum number of results per page
  const defaultPerPage = 20; // default number of results per page
  const itemsPerPage =
    Math.max(minPerPage, Math.min(maxPerPage, parseInt(query.per_page, 10))) || defaultPerPage;
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
    $offset: `${itemsPerPage * ((parseInt(query.page, 10) || 1) - 1)}`,
    $limit: itemsPerPage,
  };

  // Sort by
  let orderByVariable = 'id';
  let orderByDirection = 'ASC';
  if (query.sort) {
    const [sortVariable, sortDirection] = query.sort.split('|');
    const sortFilter = filters.find((filter) => filter.id === sortVariable);
    if (sortFilter && typeof sortFilter.whereFunc === 'function') {
      extraWhere.push(
        `OPTIONAL { ${[]
          .concat(sortFilter.whereFunc())
          .filter((x) => x)
          .join(' . ')} }`
      );
      orderByVariable = sortFilter.isSortable?.variable || sortVariable;
      if (['ASC', 'DESC'].includes(sortDirection)) {
        orderByDirection = sortDirection;
      }
    }
  }
  if (orderByVariable) {
    mainSearchQuery.$orderby = `${orderByDirection}(?${orderByVariable})`;
  }

  // Execute the main search query
  if (config.debug) {
    debugSparqlQuery = await SparqlClient.getSparqlQuery(mainSearchQuery);
  }

  // Call the endpoint with the main search query
  try {
    const resMainSearch = await SparqlClient.query(mainSearchQuery, {
      endpoint: config.api.endpoint,
      debug: config.debug,
      params: config.api.params,
    });
    if (resMainSearch) {
      entities.push(...resMainSearch['@graph']);
    }
  } catch (e) {
    console.error(e);
  }

  // Compute the total number of pages (used for pagination)
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
  try {
    const resPagination = await SparqlClient.query(paginationQuery, {
      endpoint: config.api.endpoint,
      debug: config.debug,
      params: config.api.params,
    });
    totalResults = resPagination && resPagination[0] ? parseInt(resPagination[0].id, 10) : 0;
  } catch (e) {
    console.error(e);
  }

  return {
    debugSparqlQuery,
    totalResults,
    entities,
  };
};

/**
 * Searches for the given query in the given language.
 * @param {object} query - the query to search for
 * @param {object} session - the session to search in
 * @param {string} language - the language to search in
 * @returns {Promise<SearchResults>}
 */
export const search = async (query, session, language) => {
  const results = [];
  const favorites = [];

  const { debugSparqlQuery, totalResults, entities } = await fetchEntities(query, language);

  // Loop through each entity and get the details
  const route = config.routes[query.type];
  const maxConcurrentRequests = 3;
  await new Promise((resolve, reject) => {
    mapLimit(
      entities,
      maxConcurrentRequests,
      async (entity) => {
        const searchDetailsQuery = JSON.parse(
          JSON.stringify(getQueryObject(route.query, { language, params: query }))
        );
        searchDetailsQuery.$where = searchDetailsQuery.$where || [];
        searchDetailsQuery.$filter = searchDetailsQuery.$filter || [];
        searchDetailsQuery.$values = searchDetailsQuery.$values || {};
        searchDetailsQuery.$values['?id'] = searchDetailsQuery.$values['?id'] || [];
        searchDetailsQuery.$values['?id'].push(entity['@id']);

        const resSearchDetails = await SparqlClient.query(searchDetailsQuery, {
          endpoint: config.api.endpoint,
          debug: config.debug,
          params: config.api.params,
        });

        const details = [];
        if (resSearchDetails) {
          // Ignore empty objects
          const detailsWithoutEmptyObjects = resSearchDetails['@graph'].map(removeEmptyObjects);
          details.push(...detailsWithoutEmptyObjects);
        }

        return details;
      },
      (err, res) => {
        if (err) {
          reject(err);
          return;
        }
        results.push(...res.flat());
        resolve();
      }
    );
  });

  for (let i = 0; i < results.length; i += 1) {
    await fillWithVocabularies(results[i], { params: query });
  }

  if (session) {
    const user = await getSessionUser(session);
    if (user) {
      // Check if this item is in a user list and flag it accordingly.
      const loadedLists = await getUserLists(user);
      favorites.push(
        ...results
          .filter((result) =>
            loadedLists.some((list) =>
              list.items.some((it) => it.uri === result['@id'] && it.type === query.type)
            )
          )
          .map((result) => result['@id'])
      );
    }
  }

  return {
    results,
    totalResults,
    favorites,
    debugSparqlQuery,
  };
};

/**
 * Takes in a stream and pipes it to another stream.
 * @param {stream.Readable} readable - the readable stream to pipe to the writable stream.
 * @param {stream.Writable} writable - the writable stream to pipe the readable stream to.
 * @returns None
 */
const streamPipeline = util.promisify(require('stream').pipeline);

/**
 * Image based search, given an uploaded image.
 * @param {object} image - the uploaded image to search for.
 */
export const searchImage = async (image) => {
  const formData = new FormData();

  if (typeof image === 'object' && typeof image.filepath !== 'undefined') {
    formData.append('file', fs.createReadStream(image.filepath));
  } else {
    const response = await fetch(image);
    if (!response.ok) throw new Error(`Unexpected Response: ${response.statusText}`);

    await new Promise((resolve, reject) => {
      let tmpDir;
      try {
        tmpDir = os.tmpdir();
        fs.mkdtemp(`${tmpDir}${path.sep}`, async (err, folder) => {
          if (err) {
            reject(err);
            return;
          }
          await streamPipeline(response.body, fs.createWriteStream(path.join(folder, 'image.jpg')));
          formData.append('file', fs.createReadStream(path.join(folder, './image.jpg')));
          resolve();
        });
      } finally {
        try {
          if (tmpDir) {
            fs.rmSync(tmpDir, { recursive: true });
          }
        } catch (e) {
          console.error(
            `An error has occurred while removing the temp folder at ${tmpDir}. Error: ${e}`
          );
        }
      }
    });
  }

  const res = await fetch(`https://silknow-image-retrieval.tools.eurecom.fr/api/retrieve`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (data.message) {
    throw new Error(data.message);
  }

  return data;
};
