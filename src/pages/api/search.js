/* eslint-disable import/no-named-as-default-member */
import { withRequestValidation } from '@helpers/api';
import SparqlClient from '@helpers/sparql';
import { fillWithVocabularies } from '@helpers/explorer';
import config from '~/config';

export const search = async (query) => {
  const route = config.routes[query.type];

  const results = [];
  const filters = [];

  // Fetch filters
  for (let i = 0; i < route.filters.length; i += 1) {
    const filter = route.filters[i];
    let filterQuery = null;
    if (filter.query) {
      filterQuery = { ...filter.query };
    } else if (filter.vocabulary) {
      const vocabulary = config.vocabularies[filter.vocabulary];
      if (vocabulary) {
        filterQuery = { ...vocabulary.query };
      }
    }

    let filterValues = [];
    if (filterQuery) {
      // eslint-disable-next-line no-await-in-loop
      const resQuery = await SparqlClient.query(filterQuery, {
        endpoint: config.api.endpoint,
        debug: config.debug,
      });
      if (resQuery) {
        filterValues = resQuery['@graph'].map((row) => ({
          label: row.label ? row.label['@value'] || row.label : row['@id']['@value'] || row['@id'],
          value: row['@id']['@value'] || row['@id'],
        }));
      }
    }

    filters.push({
      id: filter.id,
      label: filter.label || null,
      isOption: !!filter.isOption,
      isMulti: !!filter.isMulti,
      values: filterValues,
    });
  }

  const searchQuery = JSON.parse(JSON.stringify(route.query));
  searchQuery.$where = searchQuery.$where || [];
  searchQuery.$filter = searchQuery.$filter || [];

  const extraWhere = [];
  const extraFilter = [];

  // Props filter
  for (let i = 0; i < route.filters.length; i += 1) {
    const filter = route.filters[i];
    if (filter.id && query[`field_filter_${filter.id}`]) {
      let val;
      if (filter.isOption) {
        // Since options are checkboxes, get a boolean value (which should always be `true` in that case anyway)
        val = !!query[`field_filter_${filter.id}`];
      } else if (filter.isMulti) {
        // Make sure that the value is an array when isMulti is set
        val = !Array.isArray(query[`field_filter_${filter.id}`])
          ? [query[`field_filter_${filter.id}`]]
          : query[`field_filter_${filter.id}`];
      }
      if (typeof filter.whereFunc === 'function') {
        extraWhere.push(...filter.whereFunc(val));
      }
      if (typeof filter.filterFunc === 'function') {
        extraFilter.push(...filter.filterFunc(val));
      }
    }
  }

  // Text search
  if (query.q) {
    const labelProp =
      typeof route.labelProp === 'string'
        ? route.labelProp
        : 'http://www.w3.org/2000/01/rdf-schema#label';
    extraWhere.push(`?id <${labelProp}> ?label`);
    extraFilter.push(`CONTAINS(LCASE(STR(?label)), LCASE("${query.q}"))`);
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

  // Sort by
  let orderByVariable = null;
  if (query.sort) {
    const sortFilter = route.filters.find((filter) => filter.id === query.sort);
    if (sortFilter && typeof sortFilter.whereFunc === 'function') {
      extraWhere.push(...sortFilter.whereFunc());
      orderByVariable = query.sort;
    }
  }

  // Pagination
  const minPerPage = 10; // minimum number of results per page
  const maxPerPage = 50; // maximum number of results per page
  const defaultPerPage = 20; // default number of results per page
  const itemsPerPage =
    Math.max(minPerPage, Math.min(maxPerPage, parseInt(query.per_page, 10))) || defaultPerPage;
  // We cannoy use sparql-transformer $limit/$offset/$orderby because the $limit property limits the whole
  // query results, while we actually need to limit the number of unique ?id results
  // The subquery is also used to compute the total number of pages for the pagination component
  const whereCondition = `
    ${route.baseWhere.join('.')}
    ${route.baseWhere.length > 1 ? '.' : ''}
    ${extraWhere.join('.')}
    ${extraWhere.length > 1 ? '.' : ''}
    ${extraFilter.length > 0 ? `FILTER(${extraFilter.join(' && ')})` : ''}
  `;
  searchQuery.$where.push(`
    {
      SELECT DISTINCT ?id WHERE {
        ${whereCondition}
      }
      GROUP BY ?id
      ${orderByVariable ? `ORDER BY ?${orderByVariable}` : ''}
      OFFSET ${itemsPerPage * ((parseInt(query.page, 10) || 1) - 1)}
      LIMIT ${itemsPerPage}
    }
  `);
  searchQuery.$filter = []; // clear the filters since they are included in the sub-select query

  // Execute the query
  let debugSparqlQuery = null;
  if (config.debug) {
    debugSparqlQuery = await SparqlClient.getSparqlQuery(searchQuery);
  }
  // Call the endpoint with the search query
  const resSearch = await SparqlClient.query(searchQuery, {
    endpoint: config.api.endpoint,
    debug: config.debug,
  });
  if (resSearch) {
    results.push(...resSearch['@graph']);
  }

  for (let i = 0; i < results.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await results.map(fillWithVocabularies);
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
    `,
  };
  const resPagination = await SparqlClient.query(paginationQuery, {
    endpoint: config.api.endpoint,
    debug: config.debug,
  });
  const totalResults = resPagination && resPagination[0] ? parseInt(resPagination[0].id, 10) : 0;

  return {
    results,
    filters,
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
    res.status(404).json({ error: { message: 'Route not found' } });
    return;
  }

  const data = await search(query);
  res.status(200).json(data);
});
