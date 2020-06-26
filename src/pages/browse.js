import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import Router, { withRouter } from 'next/router';
import DefaultErrorPage from 'next/error';
import queryString from 'query-string';
import useSWR from 'swr';

import { Header, Footer, Sidebar, Layout, Body, Content, Media, Button } from '@components';
import Metadata from '@components/Metadata';
import Debug from '@components/Debug';
import Select from '@components/Select';
import SpatioTemporalMaps from '@components/SpatioTemporalMaps';
import ReactPaginate from 'react-paginate';
import SPARQLQueryLink from '@components/SPARQLQueryLink';
import PageTitle from '@components/PageTitle';
import { absoluteUrl, uriToId, generateMediaUrl } from '@helpers/utils';

import { withTranslation } from '~/i18n';
import config from '~/config';

const fetcher = (url) => fetch(url).then((r) => r.json());

const StyledSelect = styled(Select)`
  min-width: 200px;
`;

const StyledTitle = styled.h1`
  margin-bottom: 12px;
`;

const OptionsBar = styled.div`
  margin-bottom: 24px;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const Option = styled.div`
  display: flex;
  align-items: center;

  &:not(:last-child) {
    margin-right: 20px;
  }
`;

const Results = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, 150px);
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
    margin-left: -1px;
    white-space: nowrap;
    vertical-align: middle;
    cursor: pointer;
    user-select: none;
    border: 1px solid #e1e4e8;
    transition: background-color 250ms cubic-bezier(0.23, 1, 0.32, 1) 0s;

    a {
      display: inline-block;
      padding: 7px 12px;
      transition: color 250ms cubic-bezier(0.23, 1, 0.32, 1) 0s;
      color: ${({ theme }) => theme.colors.primary};
    }

    &.break {
    }

    &.active {
      background-color: ${({ theme }) => theme.colors.primary};
      a {
        color: #fff;
      }
    }
  }
`;

const Label = styled.label`
  color: ${({ theme }) => theme.colors.secondary};
  margin-right: 12px;
`;

const BrowsePage = ({ initialData, router, t }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);

  useEffect(() => {
    const onDoneLoading = () => {
      setIsLoading(false);
    };

    Router.events.on('routeChangeComplete', onDoneLoading);
    Router.events.on('routeChangeError', onDoneLoading);
    return () => {
      Router.events.off('routeChangeComplete', onDoneLoading);
      Router.events.off('routeChangeError', onDoneLoading);
    };
  }, []);

  const onSearch = (fields) => {
    const { pathname, query } = router;
    setIsLoading(true);
    router.push({
      pathname,
      query: {
        type: query.type,
        ...fields,
      },
      // shallow: true
    });
  };

  const onPageChange = (pageItem) => {
    const pageIndex = parseInt(pageItem.selected, 10);
    if (Number.isNaN(pageIndex)) {
      return;
    }

    const { pathname, query } = router;
    const pageNumber = pageIndex + 1;
    const currentPage = parseInt(query.page, 10);
    if (pageNumber === currentPage) {
      return;
    }

    setIsLoading(true);
    Router.push({
      pathname,
      query: {
        ...query,
        page: pageNumber,
      },
    }).then(() => window.scrollTo(0, 0));
  };

  const onSortChange = (selectedOption) => {
    const { pathname, query } = router;
    const { value } = selectedOption;

    setIsLoading(true);
    Router.push({
      pathname,
      query: {
        ...query,
        sort: value,
        page: undefined, // Reset page index
      },
    });
  };

  const showMap = () => {
    setIsMapVisible(!isMapVisible);
  };

  const { req, query } = router;
  const { data } = useSWR(
    `${absoluteUrl(req)}/api/search?${queryString.stringify(query)}`,
    fetcher,
    { initialData }
  );
  const { results = [], filters = [], totalResults = 0, debugSparqlQuery = null } = data;
  const { page } = query;
  const route = config.routes[query.type];

  if (!route) {
    return <DefaultErrorPage statusCode={404} title="Route not found" />;
  }

  const sortOptions = route.filters
    .filter((filter) => filter.isSortable === true)
    .map((filter) => ({
      label: t(`filters.${filter.id}`, filter.label),
      value: filter.id,
    }));

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
      const label = typeof route.labelFunc === 'function' ? route.labelFunc(result) : null;
      const subtitle = typeof route.subtitleFunc === 'function' ? route.subtitleFunc(result) : null;

      return (
        <Link
          key={result['@id']}
          href={`/details/${route.details.view}?id=${uriToId(result['@id'], {
            encoding: !route.uriBase,
          })}&type=${query.type}`}
          as={`/${query.type}/${uriToId(result['@id'], { encoding: !route.uriBase })}`}
          passHref
        >
          <a>
            <Media
              title={label}
              subtitle={subtitle}
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
    return <p>{t('search:labels.no_results')}</p>;
  };

  return (
    <Layout>
      <PageTitle title={t('search:labels.browse', { type: query.type })} />
      <Header />
      <Body hasSidebar>
        <Sidebar type={query.type} query={query} filters={filters} onSearch={onSearch} />
        <Content>
          <StyledTitle>{t('search:labels.search_results')}</StyledTitle>
          <OptionsBar>
            <Option>
              <Label htmlFor="select_sort">{t('search:labels.sort_by')}</Label>
              <StyledSelect
                inputId="select_sort"
                name="sort"
                placeholder={t('search:labels.select')}
                options={sortOptions}
                onChange={onSortChange}
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
            <Option>
              <Button primary onClick={showMap}>
                Show on the map
              </Button>
            </Option>
          </OptionsBar>
          {results.length > 0 ? (
            isMapVisible ? (
              <SpatioTemporalMaps query={query} />
            ) : (
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
                    onPageChange={onPageChange}
                    containerClassName="pagination"
                    subContainerClassName="pages pagination"
                    activeClassName="active"
                  />
                </PaginationContainer>
              </>
            )
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
              <SPARQLQueryLink query={debugSparqlQuery}>{t('search:edit_query')}</SPARQLQueryLink>
              <pre>{debugSparqlQuery}</pre>
            </Metadata>
          </Debug>
        </Content>
      </Body>
      <Footer />
    </Layout>
  );
};

export async function getServerSideProps({ query, req }) {
  const searchRes = await fetch(`${absoluteUrl(req)}/api/search?${queryString.stringify(query)}`, {
    headers: {
      cookie: req.headers.cookie,
    },
  });
  const { results, filters, totalResults, debugSparqlQuery } = await searchRes.json();
  return { props: { initialData: { results, filters, totalResults, debugSparqlQuery } } };
}

export default withTranslation(['common', 'search'])(withRouter(BrowsePage));
