import { useContext, useState, useEffect, useRef, Fragment } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import Router, { useRouter } from 'next/router';
import DefaultErrorPage from 'next/error';
import queryString from 'query-string';
import useSWRInfinite from 'swr/infinite';
import { Grid as GridIcon } from '@styled-icons/boxicons-solid/Grid';
import { MapLocationDot } from '@styled-icons/fa-solid/MapLocationDot';
import ReactPaginate from 'react-paginate';

import Header from '@components/Header';
import Footer from '@components/Footer';
import Sidebar from '@components/Sidebar';
import Layout from '@components/Layout';
import Body from '@components/Body';
import Content from '@components/Content';
import Media from '@components/Media';
import Button from '@components/Button';
import Element from '@components/Element';
import Metadata from '@components/Metadata';
import Debug from '@components/Debug';
import Select from '@components/Select';
import SpatioTemporalMaps from '@components/SpatioTemporalMaps';
import SPARQLQueryLink from '@components/SPARQLQueryLink';
import PageTitle from '@components/PageTitle';
import ScrollDetector from '@components/ScrollDetector';
import { absoluteUrl, uriToId, generateMediaUrl } from '@helpers/utils';
import useDebounce from '@helpers/useDebounce';
import useOnScreen from '@helpers/useOnScreen';
import AppContext from '@helpers/context';
import { getEntityMainImage, getEntityMainLabel } from '@helpers/explorer';
import { search, getFilters } from '@pages/api/search';
import breakpoints, { sizes } from '@styles/breakpoints';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import config from '~/config';
import mainTheme from '~/theme';

const fetcher = (url) => fetch(url).then((r) => r.json());

const selectTheme = (theme) => ({
  ...theme,
  borderRadius: 0,
  ...mainTheme.select,
  colors: {
    ...theme.colors,
    primary: '#000',
    neutral0: '#eee',
    primary25: '#ddd',
    ...mainTheme.select?.colors,
  },
});

const StyledSelect = styled(Select)`
  min-width: 200px;
`;

const StyledTitle = styled.h1`
  margin-bottom: 0.75rem;
`;

const OptionsBar = styled.div`
  margin-bottom: 2rem;
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
  margin: 1rem 0;

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
      color: ${({ theme }) => theme.colors.link};

      &:hover {
        font-weight: 700;
      }
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

const ResultPage = styled.h3`
  margin-top: 2rem;
  margin-bottom: 1rem;
`;

const PAGE_SIZE = 20;

function BrowsePage({ initialData, filters, similarityEntity }) {
  const router = useRouter();
  const { req, query, pathname } = router;
  const { t, i18n } = useTranslation(['common', 'search', 'project']);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [currentPage, setCurrentPage] = useState(parseInt(query.page, 10) || 1);
  const mapRef = useRef(null);
  const { setSearchData, setSearchQuery, setSearchPath } = useContext(AppContext);
  const [isPageLoading, setIsPageLoading] = useState(false);

  // Save the initial query to prevent re-rendering the map
  // (reloading the iframe) every time the search query changes.
  // Instead, we rely on `setQuery` from the iframe's contentWindow.
  const [mapInitialQuery, setMapInitialQuery] = useState(query);

  // A function to get the SWR key of each page,
  // its return value will be accepted by `fetcher`.
  // If `null` is returned, the request of that page won't start.
  const getKey = (pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.results.length) return null; // reached the end
    const q = { ...query, page: (parseInt(query.page, 10) || 1) + pageIndex, hl: i18n.language };
    return `${absoluteUrl(req)}/api/search?${queryString.stringify(q)}`; // SWR key
  };

  const { data, error, size, setSize } = useSWRInfinite(getKey, fetcher, {
    fallbackData: [initialData],
  });

  const isLoadingInitialData = !data && !error;
  const isLoadingMore = isLoadingInitialData || (data && typeof data[size - 1] === 'undefined');
  const isReachingEnd = data && data[data.length - 1]?.results.length < PAGE_SIZE;
  const isEmpty = data?.[0]?.results.length === 0;

  let totalPages = 0;
  let totalResults = 0;
  let debugSparqlQuery = null;
  if (data && data[0]) {
    totalResults = data[0].totalResults;
    debugSparqlQuery = data[0].debugSparqlQuery;
  }
  totalPages = Math.ceil(totalResults / PAGE_SIZE);

  const debouncedHandleResize = useDebounce(() => {
    if (typeof window !== 'undefined') {
      setSidebarCollapsed(window.innerWidth <= sizes.mobile);
    }
  }, 1000);

  useEffect(() => {
    window?.addEventListener('resize', debouncedHandleResize);
    return () => {
      window?.removeEventListener('resize', debouncedHandleResize);
    };
  });

  useEffect(() => {
    const handleRouteChange = () => {
      setIsPageLoading(true);
    };
    const handleRouteDone = () => {
      setIsPageLoading(false);
    };
    router.events.on('routeChangeStart', handleRouteChange);
    router.events.on('routeChangeComplete', handleRouteDone);
    router.events.on('routeChangeError', handleRouteDone);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
      router.events.off('routeChangeComplete', handleRouteDone);
      router.events.off('routeChangeError', handleRouteDone);
    };
  }, []);

  const onSearch = (fields) => {
    const isMapSearch = isMapVisible; // && mapRef.current?.src?.startsWith(window.location.origin);
    if (isMapSearch) {
      if (mapRef && mapRef.current) {
        const { contentWindow } = mapRef.current;
        if (contentWindow && typeof contentWindow.setQuery === 'function') {
          contentWindow.setQuery({
            type: query.type,
            ...fields,
          });
        }
        mapRef.current.focus();
      } else {
        // Map isn't ready/loaded yet, change the initial map query to update the iframe url
        setMapInitialQuery({
          type: query.type,
          ...fields,
        });
      }
    }

    const newQuery = {
      type: query.type,
      ...fields,
      sort: query.sort,
    };

    Router.push(
      {
        pathname,
        query: newQuery,
      },
      undefined,
      { shallow: isMapSearch }
    );
  };

  const loadPage = (pageNumber) => {
    setSize(1);
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

    const newQuery = {
      ...query,
      sort: value,
      page: 1,
    };

    // Reset page index
    setSize(1);

    return Router.push({
      pathname,
      query: newQuery,
    });
  };

  const onSimilarityChange = (selectedOption) => {
    const { value } = selectedOption;

    const newQuery = {
      ...query,
      similarity_type: value,
      page: 1,
    };

    // Reset page index
    setSize(1);

    return Router.replace({
      pathname,
      query: newQuery,
    });
  };

  const toggleMap = () => {
    const mapVisibility = !isMapVisible;
    setIsMapVisible(mapVisibility);
    if (mapVisibility) {
      // Update the query if it has changed since last time
      setMapInitialQuery(query);
    }
  };

  const loadMore = () => {
    if (isLoadingMore || currentPage + 1 > totalPages) return;
    setSize((size) => size + 1);
  };

  const $loadMoreButton = useRef(null);
  const isOnScreen = useOnScreen($loadMoreButton);

  useEffect(() => {
    if (isOnScreen) loadMore();
  }, [isOnScreen]);

  useEffect(() => {
    setCurrentPage(parseInt(query.page, 10) || 1);
  }, [query.page]);

  const route = config.routes[query.type];

  if (!route) {
    return <DefaultErrorPage statusCode={404} title={t('common:errors.routeNotFound')} />;
  }

  const sortOptions = (route.filters || [])
    .filter((filter) => filter.isSortable)
    .reduce((r, filter) => {
      if (filter.isSortable?.reverse) {
        r.push(
          {
            label: t(`project:filters.${filter.id}`, filter.label) + ' (Ascendant)',
            value: `${filter.id}|ASC`,
          },
          {
            label: t(`project:filters.${filter.id}`, filter.label) + ' (Descendant)',
            value: `${filter.id}|DESC`,
          }
        );
      } else {
        r.push({
          label: t(`project:filters.${filter.id}`, filter.label),
          value: `${filter.id}`,
        });
      }
      return r;
    }, []);

  const similarityOptions = ['visual', 'semantic'].map((similarity) => ({
    label: t(`common:similarity.${similarity}`, similarity),
    value: similarity,
  }));

  const renderResults = (results, pageNumber) =>
    results.map((result) => {
      const mainImage = getEntityMainImage(result, { route });
      const label = getEntityMainLabel(result, { route, language: i18n.language });
      const subtitle = typeof route.subtitleFunc === 'function' ? route.subtitleFunc(result) : null;

      return (
        <Link
          key={result['@id']}
          href={`/details/${route.details.view}?id=${encodeURIComponent(
            uriToId(result['@id'], {
              base: route.uriBase,
            })
          )}&type=${query.type}`}
          as={`/${query.type}/${encodeURI(uriToId(result['@id'], { base: route.uriBase }))}`}
          passHref
        >
          <a
            onClick={() => {
              // Make sure the page number is correct if it hasn't been updated yet
              onScrollToPage(pageNumber);
              setSearchQuery({
                ...query,
                page: pageNumber,
              });
              setSearchPath(query.type);
              setSearchData(data[0]);
            }}
          >
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

  const onScrollToPage = (pageIndex) => {
    if (isLoadingMore) return;
    if (pageIndex !== currentPage) {
      const url = new URL(window.history.state.url, window.location.origin);
      url.searchParams.set('page', pageIndex.toString());

      const newUrl = `${url.pathname}${url.search}`;
      window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
      setCurrentPage(pageIndex);
    }
  };

  const renderEmptyResults = () => <p>{t('search:labels.noResults')}</p>;

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
            submitOnChange={!isMapVisible}
          />
        </Element>
        <Content>
          <StyledTitle>
            {isLoadingMore || isPageLoading
              ? t('search:labels.loading')
              : t('search:labels.searchResults', { count: totalResults })}
          </StyledTitle>
          {similarityEntity && (
            <Element marginBottom={24}>
              <Link
                href={`/details/${route.details.view}?id=${encodeURIComponent(
                  uriToId(similarityEntity['@id'], {
                    base: route.uriBase,
                  })
                )}&type=${query.type}`}
                as={`/${query.type}/${encodeURI(
                  uriToId(similarityEntity['@id'], { base: route.uriBase })
                )}`}
                passHref
              >
                <a>
                  <Media
                    title={getEntityMainLabel(similarityEntity, { route, language: i18n.language })}
                    thumbnail={generateMediaUrl(
                      getEntityMainImage(similarityEntity, { route }),
                      300
                    )}
                    direction="row"
                    width={50}
                    height={50}
                  />
                </a>
              </Link>
            </Element>
          )}
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
                theme={selectTheme}
              />
            </Option>
            {query.similarity_type && (
              <Option>
                <Label htmlFor="select_sort">{t('search:labels.similarity')}</Label>
                <StyledSelect
                  inputId="select_similarity"
                  name="similarity"
                  placeholder={t('search:labels.similarity')}
                  options={similarityOptions}
                  value={similarityOptions.find((o) => o.value === query.similarity_type)}
                  onChange={onSimilarityChange}
                  theme={selectTheme}
                />
              </Option>
            )}
            {config.plugins.virtualLoom && (
              <Option>
                <Button primary onClick={toggleMap} title={t('search:buttons.toggleMap')}>
                  {isMapVisible ? <GridIcon height="20" /> : <MapLocationDot height="20" />}
                </Button>
              </Option>
            )}
          </OptionsBar>
          {isEmpty && !isLoadingMore ? (
            renderEmptyResults()
          ) : isMapVisible ? (
            <SpatioTemporalMaps mapRef={mapRef} query={mapInitialQuery} />
          ) : (
            <>
              {data?.map((page, i) => {
                const pageNumber = (parseInt(query.page, 10) || 1) + i;
                return (
                  <Fragment key={pageNumber}>
                    {page.results.length > 0 && (
                      <ResultPage>
                        {pageNumber > 1 && <>{t('search:labels.page', { page: pageNumber })}</>}
                      </ResultPage>
                    )}
                    <ScrollDetector
                      onAppears={() => onScrollToPage(pageNumber)}
                      rootMargin="0px 0px -50% 0px"
                    />
                    <Results loading={isLoadingMore || isPageLoading ? 1 : 0}>
                      {renderResults(page.results, pageNumber)}
                    </Results>
                  </Fragment>
                );
              })}
              {typeof query.similarity_type === 'undefined' && (
                <>
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
                {t('common:buttons.editQuery')}
              </SPARQLQueryLink>
              <pre>{debugSparqlQuery}</pre>
            </Metadata>
          </Debug>
        </Content>
      </Body>
      <Footer />
    </Layout>
  );
}

export async function getServerSideProps({ req, query, locale }) {
  const filters = await getFilters(query, { language: locale });
  const searchData = await search(query, locale);

  let similarityEntity;
  if (query.similarity_entity) {
    similarityEntity = await (
      await fetch(
        `${absoluteUrl(req)}/api/entity?${queryString.stringify({
          id: query.similarity_entity,
          type: query.type,
          hl: locale,
        })}`,
        {
          headers: req.headers,
        }
      )
    ).json();
  }

  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'project', 'search'])),
      initialData: {
        results: searchData.results,
        totalResults: searchData.totalResults,
        debugSparqlQuery: searchData.debugSparqlQuery,
      },
      filters,
      similarityEntity: (similarityEntity && similarityEntity.result) || null,
    },
  };
}

export default BrowsePage;
