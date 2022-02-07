import asyncPool from 'tiny-async-pool';

import { withRequestValidation } from '@helpers/api';
import SparqlClient from '@helpers/sparql';
import { fillWithVocabularies } from '@helpers/vocabulary';
import { removeEmptyObjects, getQueryObject, idToUri } from '@helpers/utils';
import { getEntity } from '@pages/api/entity';
import { searchImage } from '@pages/api/image-search';
import config from '~/config';

export const getFilters = async (query, { language }) => {
  const route = config.routes[query.type];
  if (!route) {
    return [];
  }

  const filters = [];

  // Fetch filters
  for (let i = 0; i < route.filters.length; i += 1) {
    const filter = route.filters[i];
    let filterValues = [];

    let filterQuery = null;
    if (filter.query) {
      filterQuery = getQueryObject(filter.query, { language });
    } else if (filter.vocabulary) {
      const vocabulary = config.vocabularies[filter.vocabulary];
      if (vocabulary) {
        filterQuery = getQueryObject(vocabulary.query, { language });
      }
    }

    if (filterQuery) {
      const resQuery = await SparqlClient.query(filterQuery, {
        endpoint: config.api.endpoint,
        debug: config.debug,
      });
      if (resQuery) {
        filterValues = resQuery['@graph'].map((row) => {
          const value = row['@id']['@value'] || row['@id'];
          const label = row.label ? row.label['@value'] || row.label : value;
          return {
            label,
            value,
          };
        });

        // Sort values by label
        filterValues.sort(
          (a, b) => typeof a.label === 'string' && a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: 'base' })
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

export const search = async (query) => {
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
            if (typeof filter.whereFunc === 'function') {
              extraWhere.push(...filter.whereFunc(val));
            }
            if (typeof filter.filterFunc === 'function') {
              extraFilter.push(...filter.filterFunc(val).map((condition) => `(${condition})`));
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
        uris.push(...query[`${query.similarity_type}_uris`].split(',').map(id => idToUri(id, { base: route.uriBase })));
      } else if (query.similarity_entity) {
        const similarityEntity = await getEntity({
          id: query.similarity_entity,
          type: query.type,
        });

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
    if (query.sort) {
      const sortFilter = route.filters.find((filter) => filter.id === query.sort);
      if (sortFilter && typeof sortFilter.whereFunc === 'function') {
        extraWhere.push(`OPTIONAL { ${sortFilter.whereFunc().join(' . ')} }`);
        orderByVariable = query.sort;
      }
    }

    // Pagination
    const minPerPage = 5; // minimum number of results per page
    const maxPerPage = 50; // maximum number of results per page
    const defaultPerPage = 20; // default number of results per page
    const itemsPerPage =
      Math.max(minPerPage, Math.min(maxPerPage, parseInt(query.per_page, 10))) || defaultPerPage;
    // We cannoy use sparql-transformer $limit/$offset/$orderby because the $limit property limits the whole
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
      mainSearchQuery.$orderby = `?${orderByVariable}`;
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
      });
      if (resMainSearch) {
        entities.push(...resMainSearch['@graph']);
      }
    } catch (e) {
      console.error(e);
    }

    // Loop through each entity and get the details
    const maxConcurrentRequests = 3;
    results.push(
      ...(
        await asyncPool(maxConcurrentRequests, entities, async (entity) => {
          const searchDetailsQuery = JSON.parse(JSON.stringify(getQueryObject(route.query)));
          searchDetailsQuery.$where = searchDetailsQuery.$where || [];
          searchDetailsQuery.$filter = searchDetailsQuery.$filter || [];
          searchDetailsQuery.$values = searchDetailsQuery.$values || {};
          searchDetailsQuery.$values['?id'] = searchDetailsQuery.$values['?id'] || [];
          searchDetailsQuery.$values['?id'].push(entity['@id']);

          const resSearchDetails = await SparqlClient.query(searchDetailsQuery, {
            endpoint: config.api.endpoint,
            debug: config.debug,
          });

          const details = [];
          if (resSearchDetails) {
            // Ignore empty objects
            const detailsWithoutEmptyObjects = resSearchDetails['@graph'].map(removeEmptyObjects);
            details.push(...detailsWithoutEmptyObjects);
          }

          return details;
        })
      ).flat()
    );

    for (let i = 0; i < results.length; i += 1) {
      await fillWithVocabularies(results[i]);
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
          {
            SELECT DISTINCT ?id WHERE {
              ${baseWhere.join('.')}
              ${baseWhere.length > 1 ? '.' : ''}
              {
                ${textSearchWhere.join('.')}
                ${textSearchWhere.length > 1 ? '.' : ''}
              }
            }
          }
          ${paginationWhereCondition}
        }
        ${query.approximate ? 'LIMIT 1000' : ''}
      `,
    };
    const resPagination = await SparqlClient.query(paginationQuery, {
      endpoint: config.api.endpoint,
      debug: config.debug,
    });
    totalResults = resPagination && resPagination[0] ? parseInt(resPagination[0].id, 10) : 0;
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

  const data = await search(query);
  res.status(200).json(data);
});
