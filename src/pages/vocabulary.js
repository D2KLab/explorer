import { Component } from 'react';
import styled from 'styled-components';
import Router, { withRouter } from 'next/router';
import { Helmet } from 'react-helmet';

import { Header, Footer, Sidebar, Layout, Body, Content, Media } from '@components';
import Select from '@components/Select';
import Pagination from '@components/Pagination';
import Metadata from '@components/Metadata';
import Debug from '@components/Debug';
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

const Results = styled.ul``;

const Label = styled.label`
  color: ${({ theme }) => theme.colors.primary};
  margin-right: 12px;
`;

class VocabularyPage extends Component {
  constructor(props) {
    super(props);

    this.state = { isLoading: false };
  }

  render() {
    const { results, filters, router } = this.props;
    const query = { ...router.query };
    const { isLoading } = this.state;
    const route = config.routes[query.type];

    return (
      <Layout>
        <Helmet title={`Vocabulary: ${query.type}`} />
        <Header />
        <Body>
          <Content>
            <Title>{query.type.substr(0, 1).toUpperCase() + query.type.substr(1)}</Title>
            <Results loading={isLoading}>
              {results.map((result) => {
                return (
                  <li>
                    <a href={result['@id']} target="_blank" rel="noopener">
                      {result.label}
                    </a>
                  </li>
                );
              })}
            </Results>
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

export default withRouter(VocabularyPage);
