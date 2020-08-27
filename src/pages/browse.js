import { useState, useEffect, useRef, useMemo } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import Router, { withRouter } from 'next/router';
import DefaultErrorPage from 'next/error';
import queryString from 'query-string';
import { useSWRInfinite } from 'swr';
import { Grid as GridIcon } from '@styled-icons/boxicons-solid/Grid';
import { MapMarkedAlt as MapIcon } from '@styled-icons/fa-solid/MapMarkedAlt';

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
} from '@components';
import Metadata from '@components/Metadata';
import Debug from '@components/Debug';
import Select from '@components/Select';
import SpatioTemporalMaps from '@components/SpatioTemporalMaps';
import ReactPaginate from 'react-paginate';
import SPARQLQueryLink from '@components/SPARQLQueryLink';
import PageTitle from '@components/PageTitle';
import { absoluteUrl, uriToId, generateMediaUrl } from '@helpers/utils';
import { breakpoints, sizes } from '@styles';
import useDebounce from '@helpers/useDebounce';
import useOnScreen from '@helpers/useOnScreen';
import { search } from '@pages/api/search';

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
  justify-content: space-between;

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
  const { req, query, pathname } = router;
  const [isLoading, setIsLoading] = useState(false);
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

  let filters = [];
  let totalPages = 0;
  let debugSparqlQuery = null;
  if (data && data[0]) {
    filters = data[0].filters;
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
    Router.push(
      {
        pathname,
        query: {
          type: query.type,
          ...fields,
        },
      },
      undefined,
      {
        shallow: isMapSearch,
      }
    );
  };

  const loadPage = (pageNumber) => {
    setIsLoading(true);
    setSize(1);
    setInitialPage(pageNumber);
    return Router.push({
      pathname,
      query: {
        ...query,
        page: pageNumber,
      },
    });
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

  const toggleMap = () => {
    setIsMapVisible(!isMapVisible);
  };

  const loadMore = () => {
    if (currentPage + 1 > totalPages) return;

    setSize(size + 1);

    Router.push(
      {
        pathname: router.pathname,
        query: {
          ...query,
          page: currentPage + 1,
        },
      },
      undefined,
      { shallow: true }
    );
  };

  const $loadMoreButton = useRef(null);
  const isOnScreen = useOnScreen($loadMoreButton, '200px');

  useEffect(() => {
    if (isOnScreen) loadMore();
  }, [isOnScreen]);

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
              encoding: !route.uriBase,
            })
          )}&type=${query.type}`}
          as={`/${query.type}/${encodeURIComponent(
            uriToId(result['@id'], { encoding: !route.uriBase })
          )}`}
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
            {config.plugins.virtualLoom && (
              <Option style={{ marginLeft: 'auto' }}>
                <Button primary onClick={toggleMap}>
                  {isMapVisible ? <GridIcon height="20" /> : <MapIcon height="20" />}
                </Button>
              </Option>
            )}
          </OptionsBar>
          {data && data.length > 0 ? (
            isMapVisible ? (
              <SpatioTemporalMaps mapRef={mapRef} query={mapInitialQuery} />
            ) : (
              <>
                <Results className="infinite-scroll" loading={isLoading ? 1 : 0}>
                  {data.map((page) => {
                    return renderResults(page.results);
                  })}
                </Results>
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
                    {isLoadingMore ? 'Loading...' : 'Load More'}
                  </Button>
                </Element>
                <PaginationContainer>
                  <ReactPaginate
                    previousLabel="Previous"
                    nextLabel="Next"
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
            )
          ) : (
            renderEmptyResults()
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

export async function getServerSideProps({ query }) {
  const searchData = await search(query);
  return { props: { initialData: searchData } };
}

export default withTranslation(['common', 'search'])(withRouter(BrowsePage));
