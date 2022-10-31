import { mapLimit } from 'async';

import { withRequestValidation } from '@helpers/api';
import SparqlClient from '@helpers/sparql';
import { fillWithVocabularies } from '@helpers/vocabulary';
import { removeEmptyObjects, getQueryObject, idToUri } from '@helpers/utils';
import { getEntity } from '@pages/api/entity';
import { searchImage } from '@pages/api/image-search';
import config from '~/config';

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

const conditions = {
  and: ' && ',
  or: ' || ',
};

export const search = async (query, language) => {
  const results = [];
  let debugSparqlQuery = null;
  let totalResults = 0;

  const route = config.routes[query.type];
  if (route) {
    const baseWhere = route.baseWhere || [];
    const extraWhere = [];
    const extraFilter = [];

    if (Array.isArray(route.filters)) {
      // Props filter
      for (let i = 0; i < route.filters.length; i += 1) {
        const filter = route.filters[i];
        if (filter.id) {
          let val = filter.defaultValue;
          if (query[`field_filter_${filter.id}`]) {
            if (filter.isOption) {
              // Since options are checkboxes, get either 1 for true or 0 for false
              val = parseInt(query[`field_filter_${filter.id}`], 10) === 1;
              // Unset the value so we don't trigger whereFunc/filterFunc
              if (val === false) {
                val = undefined;
              }
            } else if (filter.isMulti) {
              // Make sure that the value is an array when isMulti is set
              val = !Array.isArray(query[`field_filter_${filter.id}`])
                ? [query[`field_filter_${filter.id}`]]
                : query[`field_filter_${filter.id}`];
            } else {
              val = query[`field_filter_${filter.id}`];
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
                values.forEach((value, i) => {
                  extraWhere.push(...[].concat(filter.whereFunc(value, 0)).filter((x) => x));
                });
              }

              if (typeof filter.filterFunc === 'function') {
                const filterRet = values.map((value) => filter.filterFunc(value, 0));
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
    }

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
    if (query.field_languages) {
      const labelProp =
        typeof route.labelProp === 'string'
          ? route.labelProp
          : 'http://www.w3.org/2000/01/rdf-schema#label';
      extraWhere.push(`?id <${labelProp}> ?label`);
      extraFilter.push(
        query.field_languages.map((lang) => `LANGMATCHES(LANG(?label), "${lang}")`).join(' || ')
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

    // Sort by
    let orderByVariable = 'id';
    let orderByDirection = 'ASC';
    if (query.sort) {
      const [sortVariable, sortDirection] = query.sort.split('|');
      const sortFilter = (route.filters || []).find((filter) => filter.id === sortVariable);
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

    // Pagination
    const minPerPage = 5; // minimum number of results per page
    const maxPerPage = 50; // maximum number of results per page
    const defaultPerPage = 20; // default number of results per page
    const itemsPerPage =
      Math.max(minPerPage, Math.min(maxPerPage, parseInt(query.per_page, 10))) || defaultPerPage;
    // We cannot use sparql-transformer $limit/$offset/$orderby because the $limit property limits the whole
    // query results, while we actually need to limit the number of unique ?id results
    // The subquery is also used to compute the total number of pages for the pagination component
    const whereCondition = `
      ${baseWhere.join('.')}
      ${baseWhere.length > 0 ? '.' : ''}
      ${extraWhere.join('.')}
      ${extraWhere.length > 0 ? '.' : ''}
      ${textSearchWhere.join('.')}
      ${textSearchWhere.length > 0 ? '.' : ''}
      ${extraFilter.length > 0 ? `FILTER(${extraFilter.join(' && ')})` : ''}
    `;
    const mainSearchQuery = {
      '@graph': [
        {
          '@id': '?id',
          '@graph': '?g',
        },
      ],
      $where: [],
      $filter: [],
      $offset: `${itemsPerPage * ((parseInt(query.page, 10) || 1) - 1)}`,
      $limit: itemsPerPage,
    };
    if (orderByVariable) {
      mainSearchQuery.$orderby = `${orderByDirection}(?${orderByVariable})`;
    }
    mainSearchQuery.$where.push(whereCondition);

    // Execute the main search query
    if (config.debug) {
      debugSparqlQuery = await SparqlClient.getSparqlQuery(mainSearchQuery);
    }
    // Call the endpoint with the main search query
    const entities = [];
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

    // Loop through each entity and get the details
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

    // Compute the total number of pages (used for pagination)
    const paginationWhereCondition = `
      ${baseWhere.join('.')}
      ${baseWhere.length > 1 ? '.' : ''}
      ${extraWhere.join('.')}
      ${extraWhere.length > 1 ? '.' : ''}
      ${extraFilter.length > 0 ? `FILTER(${extraFilter.join(' && ')})` : ''}
    `;
    const paginationQuery = {
      proto: {
        id: '?count',
      },
      $where: `
        SELECT (COUNT(DISTINCT ?id) AS ?count) WHERE {
          ${textSearchWhere.join('.')}
          ${textSearchWhere.length > 1 ? '.' : ''}
          ${paginationWhereCondition}
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
  }

  return {
    results,
    totalResults,
    debugSparqlQuery,
  };
};

export default withRequestValidation({
  allowedMethods: ['GET'],
})(async (req, res) => {
  const { query } = req;

  const route = config.routes[query.type];
  if (!route) {
    res.status(404).json({ error: { message: 'Route not found' }, results: [] });
    return;
  }

  const data = await search(query, query.hl || req.headers['accept-language']);
  res.status(200).json(data);
});
