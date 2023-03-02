import { ChevronDown } from '@styled-icons/boxicons-regular/ChevronDown';
import { ChevronRight } from '@styled-icons/boxicons-regular/ChevronRight';
import { SearchAlt2 } from '@styled-icons/boxicons-regular/SearchAlt2';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation, Trans } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useState } from 'react';
import styled, { css } from 'styled-components';
import 'intersection-observer';

import Body from '@components/Body';
import Button from '@components/Button';
import Content from '@components/Content';
import Debug from '@components/Debug';
import Footer from '@components/Footer';
import Header from '@components/Header';
import Layout from '@components/Layout';
import Metadata from '@components/Metadata';
import PageTitle from '@components/PageTitle';
import SPARQLQueryLink from '@components/SPARQLQueryLink';
import StickyBox from '@components/StickyBox';
import SparqlClient from '@helpers/sparql';
import { getQueryObject, removeEmptyObjects } from '@helpers/utils';
import breakpoints from '@styles/breakpoints';
import config from '~/config';

const Hero = styled.div`
  width: 100%;
  height: 220px;
  display: flex;
  color: #fff;
  background-image: ${({ image }) => `url(${image})`};
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;

  ${breakpoints.mobile`
    height: 300px;
  `}

  ${breakpoints.weirdMedium`
    height: 380px;
  `}
`;

const VocabularyTitle = styled.div`
  align-self: flex-end;
  display: flex;
  align-items: center;

  h1 {
    margin-right: 0.25em;
    padding-left: 0.8em;
    padding-bottom: 0.6em;
    text-shadow: 0px 4px 3px rgba(0, 0, 0, 0.2), 0px 8px 13px rgba(0, 0, 0, 0.1),
      0px 18px 23px rgba(0, 0, 0, 0.1);
    word-break: break-all;
    font-size: 3rem;
    font-weight: 200;

    ${breakpoints.mobile`
      font-size: 5rem;
    `}
    ${breakpoints.weirdMedium`
      font-size: 6rem;
    `}
  }
`;

const StyledStickyBox = styled(StickyBox)`
  display: none;
  ${breakpoints.weirdMedium`
    display: block;
  `}
`;

const Navigation = styled.nav`
  max-width: 240px;
`;

const MobileNavigation = styled(Navigation)`
  margin: 1em 0;
  ${breakpoints.weirdMedium`
    display: none;
  `}
`;

const Results = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, min(400px, 100%));
  grid-gap: 1rem;
  margin: 1rem 0;

  transition: opacity 250ms cubic-bezier(0.23, 1, 0.32, 1) 0s;
  opacity: ${({ loading }) => (loading ? 0.25 : 1)};
  pointer-events: ${({ loading }) => (loading ? 'none' : 'auto')};

  ${breakpoints.weirdMedium`
    margin-left: 120px;
  `}

  a {
    text-decoration: none;
    &:hover {
      color: inherit;
      text-decoration: underline;
    }
  }
`;

const Result = styled.div``;

const Arrow = styled.svg`
  width: 1em;
  height: 1em;
  margin-right: 0.25em;
  cursor: pointer;
  user-select: none;
  transition: transform 250ms cubic-bezier(0.23, 1, 0.32, 1) 0s;
`;

const Anchor = styled.div`
  line-height: 2em;
  padding-left: 10px;
  border-left: 2px solid #666;

  a {
    text-decoration: none;
    color: #666;

    transition: color 0.3s ease-in-out, border-left-color 0.3s ease-in-out;

    &:hover {
      color: ${({ theme }) => theme.colors.secondary};
      border-left-color: ${({ theme }) => theme.colors.secondary};
    }
  }

  ${(props) =>
    props.selected
      ? css`
          > ${Arrow} {
            transform: rotate(90deg);
          }
        `
      : null};
`;

const Container = styled.div`
  display: flex;
  align-items: baseline;
`;

const Items = styled.div`
  padding-left: 8px;
`;

const Item = styled.div`
  margin-bottom: 24px;
`;

const ItemTitle = styled.div`
  display: flex;
  align-items: center;

  h2:not(:last-child) {
    margin-right: 0.25em;
  }
`;

const SearchIcon = styled(SearchAlt2)`
  margin-left: 8px;
  height: 16px;
  transform: scaleX(-1);
  color: inherit;
`;

const DropdownItem = styled.div`
  cursor: pointer;
`;

const cleanupItem = (obj) =>
  Object.fromEntries(
    Object.entries(obj).flatMap(([k, v]) => {
      if (String(v) !== '[object Object]') {
        return [[k, v]];
      }
      v = cleanupItem(v);
      return Object.keys(v).length > 0 ? [[k, v]] : [];
    })
  );

const getResultItems = (result) =>
  (Array.isArray(result.items) ? result.items : [result.items].filter((x) => x)).map(cleanupItem);

function VocabularyPage({ results, featured, debugSparqlQuery }) {
  const { t } = useTranslation(['common', 'project']);
  const router = useRouter();

  const [activeResults, setActiveResults] = useState([]);

  const toggleActiveResult = (result) => {
    if (activeResults.includes(result)) {
      setActiveResults(activeResults.filter((r) => r !== result));
    } else {
      setActiveResults((prev) => [...prev, result]);
    }
  };

  const query = { ...router.query };
  const route = config.routes[query.type];

  const useWith = [];
  if (route && Array.isArray(route.useWith)) {
    useWith.push(...route.useWith);
  }

  const getUseWithLink = (withConfig, item) => {
    if (!withConfig || !item) {
      return '';
    }

    const withRoute = config.routes[withConfig.route];
    if (!withRoute) {
      return '';
    }
    const withQuery = {};
    const filter = (withRoute.filters || []).find((f) => f.id && f.id === withConfig.filter);
    if (filter) {
      const val = filter.isMulti ? [item['@id']] : item['@id'];
      withQuery[`filter_${filter.id}`] = val;
    } else {
      withQuery[withConfig.filter] = item.label;
    }

    return { pathname: `/${withConfig.route}`, query: withQuery };
  };

  const getItemsCount = (items, start) =>
    items.reduce((acc, cur) => {
      acc += cur.count || 0;
      if (Array.isArray(cur.items)) {
        acc += getItemsCount(cur.items, 0);
      }
      return acc;
    }, start);

  const renderResult = (result) => {
    const items = getResultItems(result);
    items.sort((a, b) => typeof a.label === 'string' && a.label.localeCompare(b.label)); // Sort items alphabetically
    const isActive = activeResults.includes(result['@id']);
    const itemsCount = getItemsCount(items, 0);
    const totalCount = (result.count || 0) + itemsCount;

    // Do not display terms with 0 results
    if (totalCount === 0) {
      return undefined;
    }

    return (
      <Anchor key={result['@id']} selected={isActive}>
        {(itemsCount > 0 && (
          <DropdownItem>
            <a
              role="button"
              tabIndex={0}
              onClick={() => toggleActiveResult(result['@id'])}
              onKeyPress={() => toggleActiveResult(result['@id'])}
            >
              <Arrow as={isActive ? ChevronDown : ChevronRight} />
              {result.label} ({totalCount})
            </a>
            <Link href={getUseWithLink(useWith[0], result)}>
              <SearchIcon />
            </Link>
          </DropdownItem>
        )) || (
          <Link href={getUseWithLink(useWith[0], result)}>
            {result.label} ({totalCount})
          </Link>
        )}
        {isActive && <Items>{items.map(renderResult)}</Items>}
      </Anchor>
    );
  };

  const renderedResults = results.map(renderResult);

  const vocabularyLabel = t(
    `project:routes.${query.type}`,
    query.type.substr(0, 1).toUpperCase() + query.type.substr(1)
  );

  return (
    <Layout>
      <PageTitle title={vocabularyLabel} />
      <Header />
      <Body>
        <Hero image={`/images/pages/${query.type}.jpg`}>
          <VocabularyTitle>
            <h1>{vocabularyLabel}</h1>
            {config.plugins?.skosmos && route.skosmos && route.skosmos.uri && (
              <a
                href={`${config.plugins?.skosmos?.baseUrl}${encodeURIComponent(route.skosmos.uri)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                def
              </a>
            )}
          </VocabularyTitle>
        </Hero>
        <Content>
          <MobileNavigation>{renderedResults}</MobileNavigation>
          <Container>
            <StyledStickyBox offsetTop={20} offsetBottom={20}>
              <Navigation>{renderedResults}</Navigation>
            </StyledStickyBox>
            <Results>
              {featured.map((featuredItem) => {
                const renderLink = (withConfig, item) => {
                  const withRoute = config.routes[withConfig.route];
                  if (!withRoute) {
                    return null;
                  }

                  return (
                    <Link
                      key={withConfig.route}
                      href={getUseWithLink(withConfig, item)}
                      passHref
                      legacyBehavior
                    >
                      <Button primary>
                        <Trans
                          i18nKey="common:vocabulary.explore"
                          components={[<span key="0" />, <span key="1" />]}
                          values={{
                            route: t(`project:routes.${withConfig.route}`).toLowerCase(),
                            item: (item.label || '').toLowerCase(),
                          }}
                        />
                      </Button>
                    </Link>
                  );
                };

                const renderItem = (item) => {
                  const links = useWith.map((w) => renderLink(w, item));
                  return (
                    <Item key={item['@id']} id={item['@id']}>
                      <ItemTitle>
                        <h2>
                          {item.label} ({item.count || 0})
                        </h2>
                      </ItemTitle>
                      {config.plugins?.skosmos && (
                        <a
                          href={`${config.plugins?.skosmos?.baseUrl}${encodeURIComponent(
                            item['@id']
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          def
                        </a>
                      )}
                      {item.description && <p>{item.description}</p>}
                      <p>{links}</p>
                    </Item>
                  );
                };

                return (
                  <Result key={featuredItem['@id']} id={featuredItem['@id']}>
                    {renderItem(featuredItem)}
                  </Result>
                );
              })}
            </Results>
          </Container>
          <Debug>
            <Metadata label="HTTP Parameters">
              <pre>{JSON.stringify(query, null, 2)}</pre>
            </Metadata>
            <Metadata label="Query Results">
              <pre>{JSON.stringify(results, null, 2)}</pre>
            </Metadata>
            <Metadata label="Results SPARQL Query">
              <SPARQLQueryLink query={debugSparqlQuery.results}>
                {t('common:buttons.editQuery')}
              </SPARQLQueryLink>
              <pre>{debugSparqlQuery.results}</pre>
            </Metadata>
            <Metadata label="Featured SPARQL Query">
              <SPARQLQueryLink query={debugSparqlQuery.featured}>
                {t('common:buttons.editQuery')}
              </SPARQLQueryLink>
              <pre>{debugSparqlQuery.featured}</pre>
            </Metadata>
          </Debug>
        </Content>
      </Body>
      <Footer />
    </Layout>
  );
}

export async function getServerSideProps({ query, locale }) {
  const route = config.routes[query.type];

  const debugSparqlQuery = {};
  const results = [];
  const featured = [];

  if (route) {
    const mainQuery = getQueryObject(route.query, { language: locale, params: query });

    if (config.debug) {
      debugSparqlQuery.results = await SparqlClient.getSparqlQuery(mainQuery);
    }

    // Execute the query
    const res = await SparqlClient.query(mainQuery, {
      endpoint: config.api.endpoint,
      debug: config.debug,
      params: config.api.params,
    });
    if (res) {
      results.push(...removeEmptyObjects(res['@graph']));
    }

    // Execute the query
    if (route.featured) {
      const featuredQuery = getQueryObject(route.featured.query, {
        language: locale,
        params: query,
      });

      if (config.debug) {
        debugSparqlQuery.featured = await SparqlClient.getSparqlQuery(featuredQuery);
      }

      const resFeatured = await SparqlClient.query(featuredQuery, {
        endpoint: config.api.endpoint,
        debug: config.debug,
      });
      if (resFeatured) {
        featured.push(...removeEmptyObjects(resFeatured['@graph']));
      }
    }
  }

  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'project', 'search'])),
      results,
      featured,
      debugSparqlQuery,
    },
  };
}

export default VocabularyPage;
