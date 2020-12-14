import { useState } from 'react';
import styled, { css } from 'styled-components';
import { useRouter } from 'next/router';
import Link from 'next/link';
import StickyBox from 'react-sticky-box';
import 'intersection-observer';
import { ChevronRight } from '@styled-icons/entypo/ChevronRight';

import Header from '@components/Header';
import Footer from '@components/Footer';
import Layout from '@components/Layout';
import Body from '@components/Body';
import Content from '@components/Content';
import Metadata from '@components/Metadata';
import Debug from '@components/Debug';
import PageTitle from '@components/PageTitle';
import Button from '@components/Button';
import SPARQLQueryLink from '@components/SPARQLQueryLink';
import breakpoints from '@styles/breakpoints';
import SparqlClient from '@helpers/sparql';
import config from '~/config';
import { useTranslation, Trans } from '~/i18n';

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

const Navigation = styled.nav`
  max-width: 240px;
  display: none;

  ${breakpoints.weirdMedium`
    display: block;
  `}
`;

const Results = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, 400px);
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

  > span {
    ${(props) =>
      props.selected
        ? css`
            color: ${({ theme }) => theme.colors.secondary};
            border-left-color: ${({ theme }) => theme.colors.secondary};
            font-weight: 700;
          `
        : null};
  }

  ${Arrow} {
    transform: ${(props) => (props.selected ? 'rotate(90deg)' : 'rotate(0deg)')};
  }
`;

const Container = styled.div`
  display: flex;
  align-items: baseline;
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

const getResultItems = (result) => {
  return Array.isArray(result.items)
    ? result.items
    : [result.items].filter(
        (x) => x && (typeof x !== 'object' || x.constructor !== Object || Object.keys(x).length > 0)
      );
};

const VocabularyPage = ({ results, featured, debugSparqlQuery }) => {
  const { t } = useTranslation(['common', 'project']);
  const router = useRouter();

  const [activeResult, setActiveResult] = useState(null);

  const toggleActiveResult = (result) => {
    setActiveResult(activeResult === result ? null : result);
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
    const filter = withRoute.filters.find((f) => f.id && f.id === withConfig.filter);
    if (filter) {
      const val = filter.isMulti ? [item['@id']] : item['@id'];
      withQuery[`field_filter_${filter.id}`] = val;
    } else {
      withQuery[withConfig.filter] = item.label;
    }

    return { pathname: `/${withConfig.route}`, query: withQuery };
  };

  return (
    <Layout>
      <PageTitle title={`${t('common:vocabulary.title')} ${query.type}`} />
      <Header />
      <Body>
        <Hero image={`/images/pages/${query.type}.jpg`}>
          <VocabularyTitle>
            <h1>
              {t(
                `project:routes.${query.type}`,
                query.type.substr(0, 1).toUpperCase() + query.type.substr(1)
              )}
            </h1>
            {config.plugins.skosmos && route.skosmos && route.skosmos.uri && (
              <a
                href={`${config.plugins.skosmos.baseUrl}${encodeURIComponent(route.skosmos.uri)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                def
              </a>
            )}
          </VocabularyTitle>
        </Hero>
        <Content>
          <Container>
            <StickyBox offsetTop={20} offsetBottom={20}>
              <Navigation>
                {results.map((result) => {
                  const items = getResultItems(result);
                  items.sort((a, b) => a.label.localeCompare(b.label)); // Sort items alphabetically
                  const isActive = result['@id'] === activeResult;

                  return (
                    <Anchor key={result['@id']} selected={isActive}>
                      <span>
                        <Arrow
                          as={ChevronRight}
                          onClick={() => toggleActiveResult(result['@id'])}
                        />
                        <Link href={getUseWithLink(useWith[0], result)} passHref>
                          <a>
                            {result.label} (
                            {items.reduce((acc, cur) => {
                              acc += cur.count || 0;
                              return acc;
                            }, 0)}
                            )
                          </a>
                        </Link>
                      </span>
                      {isActive &&
                        items.map((item) => (
                          <Anchor>
                            <Link
                              key={item['@id']}
                              href={getUseWithLink(useWith[0], item)}
                              passHref
                            >
                              <a>
                                {item.label} ({item.count || 0})
                              </a>
                            </Link>
                          </Anchor>
                        ))}
                    </Anchor>
                  );
                })}
              </Navigation>
            </StickyBox>
            <Results>
              {featured.map((featuredItem) => {
                const renderLink = (withConfig, item) => {
                  const withRoute = config.routes[withConfig.route];
                  if (!withRoute) {
                    return null;
                  }

                  return (
                    <Link key={withConfig.route} href={getUseWithLink(withConfig, item)} passHref>
                      <Button primary>
                        <Trans
                          i18nKey="common:vocabulary.explore"
                          components={[<span />, <span />]}
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
                      {config.plugins.skosmos && (
                        <a
                          href={`${config.plugins.skosmos.baseUrl}${encodeURIComponent(
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
};

export async function getServerSideProps({ query }) {
  const route = config.routes[query.type];

  let debugSparqlQuery = null;
  const results = [];
  const featured = [];

  if (route) {
    if (config.debug) {
      debugSparqlQuery = await SparqlClient.getSparqlQuery(route.query);
    }

    // Execute the query
    const res = await SparqlClient.query(route.query, {
      endpoint: config.api.endpoint,
      debug: config.debug,
    });
    if (res) {
      results.push(...res['@graph']);
    }

    // Execute the query
    if (route.featured) {
      if (config.debug) {
        debugSparqlQuery = await SparqlClient.getSparqlQuery(route.featured.query);
      }

      const resFeatured = await SparqlClient.query(route.featured.query, {
        endpoint: config.api.endpoint,
        debug: config.debug,
      });
      if (resFeatured) {
        featured.push(...resFeatured['@graph']);
      }
    }
  }

  return {
    props: {
      results,
      featured,
      debugSparqlQuery,
    },
  };
}

export default VocabularyPage;
