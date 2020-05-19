import { Component } from 'react';
import styled from 'styled-components';
import Router, { withRouter } from 'next/router';
import { Helmet } from 'react-helmet';

import { Header, Footer, Sidebar, Layout, Body, Content, Media } from '@components';
import Metadata from '@components/Metadata';
import Debug from '@components/Debug';
import Select from '@components/Select';
import Pagination from '@components/Pagination';

import { withTranslation } from '~/i18n';
import config from '~/config';

const sparqlTransformer = require('sparql-transformer').default;

const StyledSelect = styled(Select)`
  flex: 0 1 240px;
`;

const Title = styled.h1`
  font-size: 3em;
  line-height: 1.2em;
  margin-bottom: 0.2em;
`;

const OptionsBar = styled.div``;

const Option = styled.div`
  display: flex;
  align-items: center;
`;

const StyledMedia = styled(Media)`
  margin-left: var(--card-margin);
  margin-right: var(--card-margin);
`;

const Results = styled.div`
  display: flex;
  flex-wrap: wrap;

  --card-margin: 12px;
  margin: 24px calc(-1 * var(--card-margin));

  opacity: ${({ loading }) => (loading ? 0.25 : 1)};
  pointer-events: ${({ loading }) => (loading ? 'none' : 'auto')};
`;

const Label = styled.label`
  color: ${({ theme }) => theme.colors.primary};
  margin-right: 12px;
`;

class BrowsePage extends Component {
  constructor(props) {
    super(props);

    this.state = { isLoading: false };
  }

  onSearch = (fields) => {
    const { router } = this.props;
    const { pathname, query } = router;
    router.push({
      pathname: `/browse`,
      // as: `/${pathname}`,
      query: {
        type: query.type,
        ...fields,
      },
      // shallow: true
    });
  };

  render() {
    const { results, filters, router, t } = this.props;
    const query = { ...router.query };
    const { isLoading } = this.state;
    const route = config.routes[query.type];

    const options = [{ label: 'Alphabetically', value: '0' }];

    return (
      <Layout>
        <Helmet title={t('labels.browse', { type: query.type })} />
        <Header />
        <Body hasSidebar>
          <Sidebar type={query.type} query={query} filters={filters} onSearch={this.onSearch} />
          <Content>
            <Title>{t('labels.search_results')}</Title>
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
            <Results loading={isLoading}>
              {results.map((result) => {
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
                  <StyledMedia
                    key={result['@id']}
                    title={label}
                    subtitle={result.time.label}
                    thumbnail={mainImage}
                    direction="column"
                    link={`/${query.type}/${encodeURIComponent(result['@id'])}`}
                    uri={result['@graph']}
                  />
                );
              })}
            </Results>
            <Pagination totalPages={11} currentPage={3} />
            <Debug>
              <Metadata label="HTTP Parameters">
                <pre>{JSON.stringify(query, null, 2)}</pre>
              </Metadata>
              <Metadata label="Results">
                <pre>{JSON.stringify(results, null, 2)}</pre>
              </Metadata>
              <Metadata label="SPARQL Query">
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://data.silknow.org/sparql?default-graph-uri=&qtxt=${encodeURIComponent(
                    this.props.debugSparqlQuery
                  )}&should-sponge=&format=text%2Fhtml&timeout=0&debug=on&run=+Run+Query+`}
                >
                  Edit the query
                </a>
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

export async function getServerSideProps({ query }) {
  const route = config.routes[query.type];

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
  let debugSparqlQuery = null;

  if (route) {
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
            label: row.label
              ? row.label['@value'] || row.label
              : row['@id']['@value'] || row['@id'],
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

    // Text search
    if (query.q) {
      searchQuery.$where.push('?id <http://www.w3.org/2000/01/rdf-schema#label> ?label');
      searchQuery.$filter.push(`CONTAINS(LCASE(STR(?label)), LCASE("${query.q}"))`);
    }

    // Graph
    if (query.graph) {
      searchQuery.$where.push(`FILTER(?g = <${query.graph}>)`);
    }

    // Languages
    if (query.field_languages) {
      searchQuery.$where.push(
        'OPTIONAL { ?id <http://www.w3.org/2000/01/rdf-schema#label> ?label }'
      );
      searchQuery.$filter.push(
        query.field_languages.map((lang) => `LANGMATCHES(LANG(?label), "${lang}")`).join(' || ')
      );
    }

    // Props filter
    for (let i = 0; i < route.filters.length; i += 1) {
      const filter = route.filters[i];
      if (filter.id && query[`field_filter_${filter.id}`]) {
        const val =
          filter.isMulti && !Array.isArray(query[`field_filter_${filter.id}`])
            ? [query[`field_filter_${filter.id}`]]
            : query[`field_filter_${filter.id}`];
        searchQuery.$where.push(...filter.whereFunc(val));
        searchQuery.$filter.push(...filter.filterFunc(val));
      }
    }

    // Pagination
    const itemsPerPage = 20;
    // searchQuery.$limit = itemsPerPage;
    // searchQuery.$offset = itemsPerPage * ((parseInt(query.page, 10) || 1) - 1);
    // We cannoy use sparql-transformer $limit/$offset/$orderby because the $limit property limits the whole
    // query results, while we actually need to limit the number of unique ?id results
    searchQuery.$where.push(`
      {
        SELECT DISTINCT ?id WHERE {
          ${searchQuery.$where.join('.')}
          ${searchQuery.$filter.length > 0 ? `FILTER(${searchQuery.$filter.join(' && ')})` : ''}
        }
        GROUP BY ?id
        OFFSET ${itemsPerPage * ((parseInt(query.page, 10) || 1) - 1)}
        LIMIT ${itemsPerPage}
      }
    `);
    searchQuery.$filter = []; // clear the filters since they are included in the sub-select query

    // Execute the query
    if (config.debug) {
      try {
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
      const res = await sparqlTransformer(searchQuery, {
        endpoint: config.api.endpoint,
        debug: config.debug,
      });
      results.push(...res['@graph']);
    } catch (err) {
      console.error(err);
    }
  }

  return { props: { results, filters, debugSparqlQuery } };
}

export default withTranslation('search')(withRouter(BrowsePage));
