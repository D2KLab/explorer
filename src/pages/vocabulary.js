import { useState } from 'react';
import styled, { css } from 'styled-components';
import { useRouter } from 'next/router';
import Link from 'next/link';
import StickyBox from 'react-sticky-box';
import 'intersection-observer';

import Header from '@components/Header';
import Footer from '@components/Footer';
import Layout from '@components/Layout';
import Body from '@components/Body';
import Content from '@components/Content';
import Metadata from '@components/Metadata';
import Debug from '@components/Debug';
import PageTitle from '@components/PageTitle';
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
  max-width: 200px;
  display: none;

  ${breakpoints.weirdMedium`
    display: block;
  `}
`;

const Results = styled.div`
  flex: 1;

  ${breakpoints.weirdMedium`
    margin-left: 120px;
  `}

  p {
    margin-bottom: 1em;
  }
`;

const Anchor = styled.a`
  display: block;
  max-height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  text-decoration: none;
  line-height: 2em;
  padding-left: 10px;
  border-left: 2px solid #666;

  > span {
    color: #666;
    transition: color 0.3s ease-in-out, border-left-color 0.3s ease-in-out;

    &:hover {
      color: ${({ theme }) => theme.colors.secondary};
      border-left-color: ${({ theme }) => theme.colors.secondary};
    }

    ${(props) =>
      props.selected
        ? css`
            color: ${({ theme }) => theme.colors.secondary};
            border-left-color: ${({ theme }) => theme.colors.secondary};
            font-weight: 700;
          `
        : null};
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

const VocabularyPage = ({ results, debugSparqlQuery }) => {
  const { t } = useTranslation(['common', 'project']);
  const router = useRouter();

  const [activeResult, setActiveResult] = useState(null);
  const [activeItem, setActiveItem] = useState(null);

  const query = { ...router.query };
  const route = config.routes[query.type];

  const useWith = [];
  if (route && Array.isArray(route.useWith)) {
    useWith.push(...route.useWith);
  }

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
                  let arrow;
                  if (result.items.length > 0) {
                    arrow = result['@id'] === activeResult ? '⯆' : '⯈';
                  }
                  return (
                    <Anchor
                      key={result['@id']}
                      href={`#${result['@id']}`}
                      selected={result['@id'] === activeResult}
                      onClick={() => setActiveResult(result['@id'])}
                    >
                      <span>
                        {arrow} {result.label}
                      </span>

                      {result['@id'] === activeResult &&
                        items.map((item) => {
                          return (
                            <Anchor
                              key={item['@id']}
                              href={`#${item['@id']}`}
                              selected={item['@id'] === activeItem}
                              onClick={() => setActiveItem(item['@id'])}
                            >
                              <span>
                                {item.label}{' '}
                                {typeof item.count !== 'undefined' ? `(${item.count})` : ''}
                              </span>
                            </Anchor>
                          );
                        })}
                    </Anchor>
                  );
                })}
              </Navigation>
            </StickyBox>
            <Results>
              {results.map((result) => {
                const items = getResultItems(result);

                const renderLink = (withConfig, item) => {
                  const withRoute = config.routes[withConfig.route];
                  if (!withRoute) {
                    return null;
                  }

                  const withQuery = {};

                  const filter = withRoute.filters.find((f) => f.id && f.id === withConfig.filter);
                  if (filter) {
                    const val = filter.isMulti ? [item['@id']] : item['@id'];
                    withQuery[`field_filter_${filter.id}`] = val;
                  } else {
                    withQuery[withConfig.filter] = item.label;
                  }

                  return (
                    <Link
                      key={withConfig.route}
                      href={{ pathname: `/${withConfig.route}`, query: withQuery }}
                    >
                      <a>
                        <Trans
                          i18nKey="common:vocabulary.explore"
                          components={[<span />, <span />]}
                          values={{
                            route: t(`project:routes.${withConfig.route}`).toLowerCase(),
                            item: (item.label || '').toLowerCase(),
                          }}
                        />
                      </a>
                    </Link>
                  );
                };

                const renderItem = (item) => {
                  const links = useWith.map((w) => renderLink(w, item));
                  return (
                    <Item key={item['@id']} id={item['@id']}>
                      <ItemTitle>
                        <h2>{item.label}</h2>
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
                      </ItemTitle>
                      {item.description && <p>{item.description}</p>}
                      <p>{links}</p>
                    </Item>
                  );
                };

                return (
                  <div key={result['@id']} id={result['@id']}>
                    <h1>{result.label}</h1>
                    {result.description && <p>{result.description}</p>}
                    <ul>{items.map(renderItem)}</ul>
                  </div>
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
  }

  return {
    props: {
      results,
      debugSparqlQuery,
    },
  };
}

export default VocabularyPage;
