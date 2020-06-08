import { Component } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import Router, { withRouter } from 'next/router';
import DefaultErrorPage from 'next/error';

import { Header, Footer, Sidebar, Layout, Body, Content, Media } from '@components';
import Metadata from '@components/Metadata';
import Debug from '@components/Debug';
import Select from '@components/Select';
import ReactPaginate from 'react-paginate';
import SPARQLQueryLink from '@components/SPARQLQueryLink';
import PageTitle from '@components/PageTitle';
import { uriToId, generateMediaUrl } from '@helpers/utils';

import { withTranslation } from '~/i18n';
import config from '~/config';

const sparqlTransformer = require('sparql-transformer').default;

const StyledSelect = styled(Select)`
  flex: 0 1 240px;
`;

const StyledTitle = styled.h1`
  margin-bottom: 12px;
`;

const OptionsBar = styled.div`
  margin-bottom: 24px;
`;

const Option = styled.div`
  display: flex;
  align-items: center;
`;

const Results = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  grid-gap: 1rem;
  margin-bottom: 24px;

  transition: opacity 250ms cubic-bezier(0.23, 1, 0.32, 1) 0s;
  opacity: ${({ loading }) => (loading ? 0.25 : 1)};
  pointer-events: ${({ loading }) => (loading ? 'none' : 'auto')};

  a {
    text-decoration: none;
    &:hover {
      color: inherit;
      text-decoration: underline;
    }
  }
`;

const PaginationContainer = styled.div`
  li {
    display: inline-block;
    padding: 7px 12px;
    margin-left: -1px;
    font-size: 13px;
    white-space: nowrap;
    vertical-align: middle;
    cursor: pointer;
    user-select: none;
    border: 1px solid #e1e4e8;
    transition: background-color 250ms cubic-bezier(0.23, 1, 0.32, 1) 0s;

    a {
      transition: color 250ms cubic-bezier(0.23, 1, 0.32, 1) 0s;
      color: ${({ theme }) => theme.colors.primary};
    }

    &.break {
    }

    &.active {
      background-color: ${({ theme }) => theme.colors.primary};
      a {
        color: ${({ theme }) => theme.colors.secondary};
      }
    }
  }
`;

const Label = styled.label`
  color: ${({ theme }) => theme.colors.secondary};
  margin-right: 12px;
`;

class BrowsePage extends Component {
  constructor(props) {
    super(props);

    this.state = { isLoading: false };
  }

  componentDidMount() {
    Router.events.on('routeChangeComplete', this.onDoneLoading);
    Router.events.on('routeChangeError', this.onDoneLoading);
  }

  componentWillUnmount() {
    Router.events.off('routeChangeComplete', this.onDoneLoading);
    Router.events.off('routeChangeError', this.onDoneLoading);
  }

  onDoneLoading = () => {
    this.setState({ isLoading: false });
  };

  onSearch = (fields) => {
    const { router } = this.props;
    const { pathname, query } = router;
    this.setState({ isLoading: true });
    router.push({
      pathname,
      query: {
        type: query.type,
        ...fields,
      },
      // shallow: true
    });
  };

  onPageChange = (pageItem) => {
    const pageIndex = parseInt(pageItem.selected, 10);
    if (Number.isNaN(pageIndex)) {
      return;
    }

    const { pathname, query } = this.props.router;
    const pageNumber = pageIndex + 1;
    const currentPage = parseInt(query.page, 10);
    if (pageNumber === currentPage) {
      return;
    }

    this.setState({ isLoading: true });
    Router.push({
      pathname,
      query: {
        ...query,
        page: pageNumber,
      },
    });
  };

  render() {
    const { results, filters, totalResults, router, t } = this.props;
    const { isLoading } = this.state;
    const query = { ...router.query };
    const { page } = query;
    const route = config.routes[query.type];

    if (!route) {
      return <DefaultErrorPage statusCode={404} title="Route not found" />;
    }

    const options = [{ label: 'Alphabetically', value: '0' }];

    const renderResults = () => {
      return results.map((result) => {
        let mainImage = null;
        if (result.representation && result.representation.image) {
          mainImage = Array.isArray(result.representation.image)
            ? result.representation.image.shift()
            : result.representation.image;
        } else if (Array.isArray(result.representation)) {
          mainImage =
            result.representation[0].image ||
            result.representation[0]['@id'] ||
            result.representation[0];
        }
        const label = route.labelFunc(result);

        return (
          <Link
            key={result['@id']}
            href={`/details/${route.details.view}?id=${uriToId(result['@id'])}&type=${query.type}`}
            as={`/${query.type}/${uriToId(result['@id'])}`}
            passHref
          >
            <a>
              <Media
                title={label}
                subtitle={result.time.label}
                thumbnail={generateMediaUrl(mainImage, 150)}
                direction="column"
                graphUri={result['@graph']}
              />
            </a>
          </Link>
        );
      });
    };

    const renderEmptyResults = () => {
      return <p>{t('labels.no_results')}</p>;
    };

    return (
      <Layout>
        <PageTitle title={t('labels.browse', { type: query.type })} />
        <Header />
        <Body hasSidebar>
          <Sidebar type={query.type} query={query} filters={filters} onSearch={this.onSearch} />
          <Content>
            <StyledTitle>{t('labels.search_results')}</StyledTitle>
            <OptionsBar>
              <Option>
                <Label htmlFor="select_sort">{t('labels.sort_by')}</Label>
                <StyledSelect
                  inputId="select_sort"
                  name="sort"
                  placeholder={t('search:labels.select')}
                  options={options}
                  theme={(theme) => ({
                    ...theme,
                    borderRadius: 0,
                    colors: {
                      ...theme.colors,
                      primary: '#000',
                      neutral0: '#eee',
                      primary25: '#ddd',
                    },
                  })}
                />
              </Option>
            </OptionsBar>
            {results.length > 0 ? (
              <>
                <Results loading={isLoading}>{renderResults()}</Results>
                <PaginationContainer>
                  <ReactPaginate
                    previousLabel="Previous"
                    nextLabel="Next"
                    breakLabel="..."
                    breakClassName="break"
                    pageCount={Math.ceil(totalResults / 20)}
                    initialPage={page}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={5}
                    onPageChange={this.onPageChange}
                    containerClassName="pagination"
                    subContainerClassName="pages pagination"
                    activeClassName="active"
                  />
                </PaginationContainer>
              </>
            ) : (
              renderEmptyResults()
            )}
            <Debug>
              <Metadata label="HTTP Parameters">
                <pre>{JSON.stringify(query, null, 2)}</pre>
              </Metadata>
              <Metadata label="Results">
                <pre>{JSON.stringify(results, null, 2)}</pre>
              </Metadata>
              <Metadata label="SPARQL Query">
                <SPARQLQueryLink query={this.props.debugSparqlQuery}>
                  {t('edit_query')}
                </SPARQLQueryLink>
                <pre>{this.props.debugSparqlQuery}</pre>
              </Metadata>
            </Debug>
          </Content>
        </Body>
        <Footer />
      </Layout>
    );
  }
}

export async function getServerSideProps({ query, res }) {
  const route = config.routes[query.type];
  if (!route) {
    res.statusCode = 404;
    return { props: {} };
  }

  for (let i = 0; i < route.filters.length; i += 1) {
    const filter = route.filters[i];
    if (filter.id) {
      const vocabularyConfig = config.vocabularies.find((v) => v.id === filter.id);
      if (vocabularyConfig) {
        console.log('vocabularyConfig:', vocabularyConfig);
      }
    }
  }

  const results = [];
  const filters = [];

  // Fetch filters
  for (let i = 0; i < route.filters.length; i += 1) {
    const filter = route.filters[i];
    const filterQuery = { ...filter.query };
    let filterValues = [];

    if (filterQuery) {
      try {
        const res = await sparqlTransformer(filterQuery, {
          endpoint: config.api.endpoint,
          debug: config.debug,
        });
        filterValues = res['@graph'].map((row) => ({
          label: row.label ? row.label['@value'] || row.label : row['@id']['@value'] || row['@id'],
          value: row['@id']['@value'] || row['@id'],
        }));
      } catch (err) {
        console.error(err);
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
      const val =
        filter.isMulti && !Array.isArray(query[`field_filter_${filter.id}`])
          ? [query[`field_filter_${filter.id}`]]
          : query[`field_filter_${filter.id}`];
      extraWhere.push(...filter.whereFunc(val));
      extraFilter.push(...filter.filterFunc(val));
    }
  }

  // Text search
  if (query.q) {
    extraWhere.push('?id <http://www.w3.org/2000/01/rdf-schema#label> ?label');
    extraFilter.push(`CONTAINS(LCASE(STR(?label)), LCASE("${query.q}"))`);
  }

  // Graph
  if (query.graph) {
    extraFilter.push(`?g = <${query.graph}>`);
  }

  // Languages
  if (query.field_languages) {
    extraWhere.push('?id <http://www.w3.org/2000/01/rdf-schema#label> ?label');
    extraFilter.push(
      query.field_languages.map((lang) => `LANGMATCHES(LANG(?label), "${lang}")`).join(' || ')
    );
  }

  // Pagination
  const itemsPerPage = 20;
  // searchQuery.$limit = itemsPerPage;
  // searchQuery.$offset = itemsPerPage * ((parseInt(query.page, 10) || 1) - 1);
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
      OFFSET ${itemsPerPage * ((parseInt(query.page, 10) || 1) - 1)}
      LIMIT ${itemsPerPage}
    }
  `);
  searchQuery.$filter = []; // clear the filters since they are included in the sub-select query

  // Execute the query
  let debugSparqlQuery = null;
  if (config.debug) {
    try {
      // If debug is enabled, get the raw SPARQL query (this does not call the endpoint)
      await sparqlTransformer(JSON.parse(JSON.stringify(searchQuery)), {
        debug: false,
        sparqlFunction: (sparql) => {
          debugSparqlQuery = sparql.trim();
          return Promise.reject();
        },
      });
    } catch (err) {
      // eslint-disable-next-line no-empty
    }
  }
  try {
    // Call the endpoint with the search query
    const res = await sparqlTransformer(searchQuery, {
      endpoint: config.api.endpoint,
      debug: config.debug,
    });
    results.push(...res['@graph']);
  } catch (err) {
    console.error(err);
  }

  // Compute the total number of pages (used for pagination)
  let totalResults = 0;
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
  try {
    const resPagination = await sparqlTransformer(paginationQuery, {
      endpoint: config.api.endpoint,
      debug: config.debug,
    });
    totalResults = resPagination[0].id;
  } catch (err) {
    console.error(err);
  }

  return { props: { results, filters, totalResults, debugSparqlQuery } };
}

export default withTranslation('search')(withRouter(BrowsePage));
