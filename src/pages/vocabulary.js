import React, { Component } from 'react';
import styled, { css } from 'styled-components';
import { withRouter } from 'next/router';
import { Helmet } from 'react-helmet';
import Link from 'next/link';
import StickyBox from 'react-sticky-box';
import 'intersection-observer';

import { Header, Footer, Layout, Body, Content } from '@components';
import Metadata from '@components/Metadata';
import Debug from '@components/Debug';
import { breakpoints } from '@styles';
import config from '~/config';
import { withTranslation } from '~/i18n';

const sparqlTransformer = require('sparql-transformer').default;

const Hero = styled.div`
  width: 100%;
  height: 380px;
  display: flex;
  color: #fff;
  background-image: ${({ image }) => `url(${image})`};
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
`;

const Title = styled.h1`
  font-size: 3em;
  line-height: 1.2em;
  padding-left: 80px;
  padding-bottom: 60px;
  align-self: end;
  text-shadow: 0px 4px 3px rgba(0, 0, 0, 0.2), 0px 8px 13px rgba(0, 0, 0, 0.1),
    0px 18px 23px rgba(0, 0, 0, 0.1);
  word-break: break-all;

  ${breakpoints.weirdMedium`
    font-size: 6em;
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
  margin-left: 120px;

  h1 {
    font-size: 3em;
    line-height: 1.2em;
    margin-bottom: 0.2em;
  }

  h2 {
    font-size: 2em;
    line-height: 1.2em;
    margin-bottom: 0.2em;
  }

  p {
    margin-bottom: 1em;
  }
`;

const Anchor = styled.a`
  display: block;
  text-decoration: none;
  color: #aaa;
  line-height: 2em;
  padding-left: 10px;
  border-left: 2px solid #aaa;
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
          font-weight: bold;
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

class VocabularyPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeResult: {
        '@id': null,
        ratio: 0,
      },
    };

    this.rootRef = React.createRef();

    this.singleRefs = props.results.reduce((acc, value) => {
      acc[value['@id']] = {
        ref: React.createRef(),
        id: value['@id'],
        ratio: 0,
      };

      return acc;
    }, {});

    if (typeof IntersectionObserver !== 'undefined') {
      const callback = (entries) => {
        entries.forEach((entry) => {
          this.singleRefs[entry.target.id].ratio = entry.intersectionRatio;
        });

        const activeResult = Object.values(this.singleRefs).reduce(
          (acc, value) => (value.ratio > acc.ratio ? value : acc),
          this.state.activeResult
        );

        if (activeResult.ratio > this.state.activeResult.ratio) {
          this.setState({ activeResult });
        }
      };

      this.observer = new IntersectionObserver(callback, {
        root: this.rootRef.current,
        threshold: new Array(101).fill(0).map((v, i) => i * 0.01),
      });
    }
  }

  componentDidMount() {
    Object.values(this.singleRefs).forEach((value) => this.observer.observe(value.ref.current));
  }

  render() {
    const { results, router, t } = this.props;
    const query = { ...router.query };
    const route = config.routes[query.type];

    const useWith = [];
    if (route && Array.isArray(route.useWith)) {
      useWith.push(...route.useWith);
    }

    return (
      <Layout>
        <Helmet title={`Vocabulary: ${query.type}`} />
        <Header />
        <Body>
          <Hero image={`/images/pages/${query.type}.jpg`}>
            <Title>
              {t(
                `routes.${query.type}`,
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
                      selected={result['@id'] === this.state.activeResult.id}
                    >
                      {result.label}
                    </Anchor>
                  ))}
                </Navigation>
              </StickyBox>
              <Results ref={this.rootRef}>
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

                  const singleRef = this.singleRefs[result['@id']];
                  const ref = singleRef ? singleRef.ref : null;

                  const renderLink = (withConfig, item) => {
                    const withRoute = config.routes[(withConfig, route)];
                    if (!withRoute) {
                      return null;
                    }

                    const withQuery = {};

                    const filter = withRoute.filters.find(
                      (f) => f.id && f.id === withConfig.filter
                    );
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
                          Explore the {t(`routes.${w.route}`)} realised in {item.label}
                        </a>
                      </Link>
                    );
                  };

                  const renderItem = (item) => {
                    const links = useWith.map((w) => renderLink(w, item));

                    return (
                      <Item key={item['@id']} id={item['@id']}>
                        <h2>{item.label}</h2>
                        {item.description && <p>{item.description}</p>}
                        {links}
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
  }
}

export async function getServerSideProps({ query }) {
  const route = config.routes[query.type];

  const results = [];

  if (route) {
    const searchQuery = JSON.parse(JSON.stringify(route.query));

    // Execute the query
    try {
      if (config.debug) {
        console.log('searchQuery:', JSON.stringify(searchQuery, null, 2));
      }
      const res = await sparqlTransformer(searchQuery, {
        endpoint: config.api.endpoint,
        debug: config.debug,
      });
      results.push(...res['@graph']);
    } catch (err) {
      console.error(err);
    }
  }

  return { props: { results } };
}

export default withTranslation('common')(withRouter(VocabularyPage));
