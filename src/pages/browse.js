import { useState, useEffect, useRef, useMemo, Fragment } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import Router, { useRouter } from 'next/router';
import DefaultErrorPage from 'next/error';
import queryString from 'query-string';
import { useSWRInfinite } from 'swr';
import { Grid as GridIcon } from '@styled-icons/boxicons-solid/Grid';
import { MapMarkedAlt as MapIcon } from '@styled-icons/fa-solid/MapMarkedAlt';
import ReactPaginate from 'react-paginate';

import {
  Header,
  Footer,
  Sidebar,
  Layout,
  Body,
  Content,
  Media,
  Button,
  Element,
  Metadata,
  Debug,
  Select,
  SpatioTemporalMaps,
  SPARQLQueryLink,
  PageTitle,
  ScrollDetector,
} from '@components';
import { absoluteUrl, uriToId, generateMediaUrl } from '@helpers/utils';
import useDebounce from '@helpers/useDebounce';
import useOnScreen from '@helpers/useOnScreen';
import { search, getFilters } from '@pages/api/search';
import { breakpoints, sizes } from '@styles';
import { useTranslation } from '~/i18n';
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

const CollapseSidebarButton = styled(Button)`
  width: 100%;
  background: #a6a6a6;
  color: #000;
  text-transform: uppercase;

  ${breakpoints.mobile`
    display: none;
  `}
`;

const StyledSidebar = styled(Sidebar)`
  display: ${({ collapsed }) => (collapsed ? 'none' : 'block')};

  ${breakpoints.mobile`
    display: block;
    height: 100%;
  `}
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
  position: sticky;
  bottom: 0;
  z-index: 100000;
  background-color: ${({ theme }) => theme.colors.background};
  padding-bottom: 20px;
  padding-top: 20px;

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

const ResultPage = styled.div`
  font-size: 24px;
  font-weight: 400;
  margin-bottom: 12px;
`;

const BrowsePage = ({ initialData }) => {
  const { req, query, pathname } = useRouter();
  const { t } = useTranslation(['common', 'search']);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(true);
  const currentPage = parseInt(query.page, 10) || 1;
  const mapRef = useRef(null);

  // Memoize the initial query to prevent re-rendering the map
  // (reloading the iframe) every time the search query changes.
  // Instead, we rely on `setQuery` from the iframe's contentWindow.
  const mapInitialQuery = useMemo(() => query, []);

  // Store the initial start page on load, because `currentPage`
  // gets updated during infinite scroll.
  const [initialPage, setInitialPage] = useState(currentPage);

  // A function to get the SWR key of each page,
  // its return value will be accepted by `fetcher`.
  // If `null` is returned, the request of that page won't start.
  const getKey = (pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.results.length) return null; // reached the end
    const q = { ...query, page: initialPage + pageIndex };
    return `${absoluteUrl(req)}/api/search?${queryString.stringify(q)}`; // SWR key
  };

  const PAGE_SIZE = 20;
  const { data = [initialData], error, size, setSize } = useSWRInfinite(getKey, fetcher, {
    persistSize: true,
  });
  const isLoadingInitialData = !data && !error;
  const isLoadingMore = isLoadingInitialData || (data && typeof data[size - 1] === 'undefined');
  const isReachingEnd = data && data[data.length - 1]?.results.length < PAGE_SIZE;
  const isEmpty = data?.[0]?.results.length === 0;

  const { filters } = initialData;
  let totalPages = 0;
  let debugSparqlQuery = null;
  if (data && data[0]) {
    totalPages = Math.ceil(data[0].totalResults / PAGE_SIZE);
    debugSparqlQuery = data[0].debugSparqlQuery;
  }

  if (typeof window !== 'undefined') {
    const debouncedHandleResize = useDebounce(function handleResize() {
      setSidebarCollapsed(window.innerWidth <= sizes.mobile);
    }, 1000);
    useEffect(() => {
      window.addEventListener('resize', debouncedHandleResize);
      return () => {
        window.removeEventListener('resize', debouncedHandleResize);
      };
    });
  }

  const onSearch = (fields) => {
    const isMapSearch = isMapVisible; // && mapRef.current?.src?.startsWith(window.location.origin);
    if (isMapSearch) {
      if (typeof mapRef?.current?.contentWindow?.setQuery === 'function') {
        mapRef.current.contentWindow.setQuery({
          type: query.type,
          ...fields,
        });
      }
      mapRef.current.focus();
    }

    const newQuery = {
      type: query.type,
      ...fields,
    };

    // Reset page index
    setSize(1);
    setInitialPage(1);
    delete newQuery.page;

    Router.push(
      {
        pathname,
        query: newQuery,
      },
      undefined,
      {
        shallow: isMapSearch,
      }
    );
  };

  const loadPage = (pageNumber) => {
    setSize(1);
    setInitialPage(pageNumber);
    return Router.push(
      {
        pathname,
        query: {
          ...query,
          page: pageNumber,
        },
      },
      undefined,
      { shallow: true }
    );
  };

  const onPageChange = (pageItem) => {
    const pageIndex = parseInt(pageItem.selected, 10);
    if (Number.isNaN(pageIndex)) {
      return;
    }

    const pageNumber = pageIndex + 1;
    if (pageNumber === currentPage) {
      return;
    }

    loadPage(pageNumber).then(() => window.scrollTo(0, 0));
  };

  const onSortChange = (selectedOption) => {
    const { value } = selectedOption;

    const newQuery = {
      ...query,
      sort: value,
    };

    // Reset page index
    setSize(1);
    setInitialPage(1);
    delete newQuery.page;

    return Router.push(
      {
        pathname,
        query: newQuery,
      },
      undefined,
      { shallow: true }
    );
  };

  const toggleMap = () => {
    setIsMapVisible(!isMapVisible);
  };

  const loadMore = () => {
    if (isLoadingMore || currentPage + 1 > totalPages) return;

    setSize(size + 1);
  };

  const $loadMoreButton = useRef(null);
  const isOnScreen = useOnScreen($loadMoreButton);

  useEffect(() => {
    if (isOnScreen) loadMore();
  }, [isOnScreen]);

  const route = config.routes[query.type];

  if (!route) {
    return <DefaultErrorPage statusCode={404} title={t('common:errors.routeNotFound')} />;
  }

  const sortOptions = route.filters
    .filter((filter) => filter.isSortable === true)
    .map((filter) => ({
      label: t(`project:filters.${filter.id}`, filter.label),
      value: filter.id,
    }));

  const renderResults = (results) => {
    return results.map((result) => {
      let mainImage = null;

      if (typeof route.imageFunc === 'function') {
        mainImage = route.imageFunc(result);
      } else if (result.representation && result.representation.image) {
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
          href={`/details/${route.details.view}?id=${encodeURIComponent(
            uriToId(result['@id'], {
              base: route.uriBase,
            })
          )}&type=${query.type}`}
          as={`/${query.type}/${encodeURIComponent(
            uriToId(result['@id'], { base: route.uriBase })
          )}`}
          passHref
        >
          <a>
            <Media
              title={label}
              subtitle={subtitle}
              thumbnail={generateMediaUrl(mainImage, 300)}
              direction="column"
              graphUri={result['@graph']}
            />
          </a>
        </Link>
      );
    });
  };

  const onScrollToPage = (pageIndex) => {
    if (initialPage + pageIndex !== query.page) {
      Router.push(
        {
          pathname,
          query: {
            ...query,
            page: initialPage + pageIndex,
          },
        },
        undefined,
        { shallow: true }
      );
    }
  };

  const renderEmptyResults = () => {
    return <p>{t('search:labels.noResults')}</p>;
  };

  return (
    <Layout>
      <PageTitle title={t('search:labels.browse', { type: query.type })} />
      <Header />
      <Body hasSidebar>
        <CollapseSidebarButton
          onClick={() => {
            setSidebarCollapsed(!isSidebarCollapsed);
          }}
        >
          {isSidebarCollapsed ? 'Show filters' : 'Hide filters'}
        </CollapseSidebarButton>
        <Element>
          <StyledSidebar
            type={query.type}
            query={query}
            filters={filters}
            onSearch={onSearch}
            collapsed={isSidebarCollapsed}
          />
        </Element>
        <Content>
          <StyledTitle>{t('search:labels.searchResults')}</StyledTitle>
          <OptionsBar>
            <Option>
              <Label htmlFor="select_sort">{t('search:labels.sortBy')}</Label>
              <StyledSelect
                inputId="select_sort"
                name="sort"
                placeholder={t('search:labels.select')}
                options={sortOptions}
                value={sortOptions.find((o) => o.value === query.sort)}
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
            {config.plugins.virtualLoom && (
              <Option>
                <Button primary onClick={toggleMap} title={t('search:buttons.toggleMap')}>
                  {isMapVisible ? <GridIcon height="20" /> : <MapIcon height="20" />}
                </Button>
              </Option>
            )}
          </OptionsBar>
          {isEmpty ? (
            renderEmptyResults()
          ) : isMapVisible ? (
            <SpatioTemporalMaps mapRef={mapRef} query={mapInitialQuery} />
          ) : (
            <>
              {data.map((page, i) => {
                const pageIndex = i;
                return (
                  <Fragment key={pageIndex}>
                    {page.results.length > 0 && (
                      <ResultPage>
                        {initialPage + pageIndex > 1 && (
                          <>{t('search:labels.page', { page: initialPage + pageIndex })}</>
                        )}
                      </ResultPage>
                    )}
                    <ScrollDetector
                      onAppears={() => onScrollToPage(pageIndex)}
                      rootMargin="0px 0px -50% 0px"
                    />
                    <Results loading={isLoadingInitialData ? 1 : 0}>
                      {renderResults(page.results)}
                    </Results>
                  </Fragment>
                );
              })}
              <Element marginBottom={24}>
                <Button
                  primary
                  style={{ width: '100%' }}
                  ref={$loadMoreButton}
                  loading={isLoadingMore}
                  disabled={isReachingEnd}
                  onClick={() => {
                    loadMore();
                  }}
                >
                  {isLoadingMore ? t('search:labels.loading') : t('search:buttons.loadMore')}
                </Button>
              </Element>
              <PaginationContainer>
                <ReactPaginate
                  previousLabel={t('search:buttons.paginatePrevious')}
                  previousAriaLabel={t('search:buttons.paginatePrevious')}
                  nextLabel={t('search:buttons.paginateNext')}
                  nextAriaLabel={t('search:buttons.paginateNext')}
                  breakLabel="..."
                  breakClassName="break"
                  pageCount={totalPages}
                  initialPage={initialPage - 1}
                  forcePage={currentPage - 1}
                  marginPagesDisplayed={2}
                  pageRangeDisplayed={5}
                  onPageChange={onPageChange}
                  disableInitialCallback
                  containerClassName="pagination"
                  subContainerClassName="pages pagination"
                  activeClassName="active"
                />
              </PaginationContainer>
            </>
          )}
          <Debug>
            <Metadata label="HTTP Parameters">
              <pre>{JSON.stringify(query, null, 2)}</pre>
            </Metadata>
            <Metadata label="Results">
              <pre>
                {Array.isArray(data) &&
                  JSON.stringify(
                    data.reduce((prev, curr) => {
                      prev.push(...curr.results);
                      return prev;
                    }, []),
                    null,
                    2
                  )}
              </pre>
            </Metadata>
            <Metadata label="SPARQL Query">
              <SPARQLQueryLink query={debugSparqlQuery}>
                {t('search:labels.editQuery')}
              </SPARQLQueryLink>
              <pre>{debugSparqlQuery}</pre>
            </Metadata>
          </Debug>
        </Content>
      </Body>
      <Footer />
    </Layout>
  );
};

export async function getServerSideProps({ query }) {
  const filters = await getFilters(query);
  const searchData = await search(query);
  return {
    props: {
      initialData: {
        results: searchData.results,
        totalResults: searchData.totalResults,
        debugSparqlQuery: searchData.debugSparqlQuery,
        filters,
      },
    },
  };
}

export default BrowsePage;
