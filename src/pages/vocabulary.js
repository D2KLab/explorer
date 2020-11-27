import { useState, useRef, createRef, useEffect } from 'react';
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

const Title = styled.h1`
  padding-left: 0.8em;
  padding-bottom: 0.6em;
  align-self: flex-end;
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
  text-decoration: none;
  color: #666;
  line-height: 2em;
  padding-left: 10px;
  border-left: 2px solid #666;
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

const VocabularyPage = ({ results }) => {
  const { t } = useTranslation(['common', 'project']);
  const router = useRouter();

  const [activeResult, setActiveResult] = useState({
    '@id': null,
    ratio: 0,
  });
  const [observer, setObserver] = useState(null);

  const rootRef = useRef();

  const singleRefs = results.reduce((acc, value) => {
    acc[value['@id']] = {
      ref: createRef(),
      id: value['@id'],
      ratio: 0,
    };

    return acc;
  }, {});

  if (typeof IntersectionObserver !== 'undefined') {
    const callback = (entries) => {
      entries.forEach((entry) => {
        if (singleRefs[entry.target.id]) {
          singleRefs[entry.target.id].ratio = entry.intersectionRatio;
        }
      });

      const targetResult = Object.values(singleRefs).reduce(
        (acc, value) => (value.ratio > acc.ratio ? value : acc),
        activeResult
      );

      if (targetResult.id !== activeResult.id && targetResult.ratio > activeResult.ratio) {
        setActiveResult(targetResult);
      }
    };

    if (observer === null) {
      setObserver(
        new IntersectionObserver(callback, {
          root: rootRef.current,
          threshold: new Array(101).fill(0).map((v, i) => i * 0.01),
        })
      );
    }
  }

  useEffect(() => {
    if (observer) Object.values(singleRefs).forEach((value) => observer.observe(value.ref.current));

    return () => {
      if (observer) observer.disconnect();
    };
  }, [observer]);

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
          <Title>
            {t(
              `project:routes.${query.type}`,
              query.type.substr(0, 1).toUpperCase() + query.type.substr(1)
            )}
          </Title>
        </Hero>
        <Content>
          <Container>
            <StickyBox offsetTop={20} offsetBottom={20}>
              <Navigation>
                {results.map((result) => (
                  <Anchor
                    key={result['@id']}
                    href={`#${result['@id']}`}
                    selected={result['@id'] === activeResult.id}
                  >
                    {result.label}
                  </Anchor>
                ))}
              </Navigation>
            </StickyBox>
            <Results ref={rootRef}>
              {results.map((result) => {
                const items = Array.isArray(result.items)
                  ? result.items
                  : [result.items].filter(
                      (x) =>
                        x &&
                        (typeof x !== 'object' ||
                          x.constructor !== Object ||
                          Object.keys(x).length > 0)
                    );

                const singleRef = singleRefs[result['@id']];
                const ref = singleRef ? singleRef.ref : null;

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
                  <div key={result['@id']} id={result['@id']} ref={ref}>
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
          </Debug>
        </Content>
      </Body>
      <Footer />
    </Layout>
  );
};

export async function getServerSideProps({ query }) {
  const route = config.routes[query.type];

  const results = [];

  if (route) {
    // Execute the query
    const res = await SparqlClient.query(route.query, {
      endpoint: config.api.endpoint,
      debug: config.debug,
    });
    if (res) {
      results.push(...res['@graph']);
    }
  }

  return { props: { results } };
}

export default VocabularyPage;
