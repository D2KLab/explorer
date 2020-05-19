import styled from 'styled-components';
import { useRouter } from 'next/router';
import { Helmet } from 'react-helmet';
import LazyLoad from 'react-lazyload';

import { Header, Footer, Layout, Screen, Media } from '@components';
import Metadata from '@components/Metadata';
import Debug from '@components/Debug';
import { breakpoints } from '@styles';
import config from '~/config';

const sparqlTransformer = require('sparql-transformer').default;

const Columns = styled.div`
  display: flex;
  max-width: 1024px;
  margin: 0 auto;
  flex-direction: column;
  justify-content: center;

  ${breakpoints.desktop`
    flex-direction: row;
  `}
`;

const Primary = styled.div`
  flex: 1;
  padding-right: 24px;
  padding-top: 24px;
  margin-left: 24px;

  display: flex;
  flex-direction: column;

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

const Secondary = styled.div`
  flex: 1;
  padding-top: 24px;
  margin-left: 24px;

  ${breakpoints.desktop`
    padding-right: 24px;
    margin-left: 0;
    max-width: 30%;
  `}
`;

const Results = styled.div`
  display: flex;
  flex-wrap: wrap;

  --card-margin: 12px;
  margin: 24px calc(-1 * var(--card-margin));
`;

const StyledMedia = styled(Media)`
  margin-left: var(--card-margin);
  margin-right: var(--card-margin);
`;

const CollectionDetailsPage = ({ result }) => {
  const { query } = useRouter();
  const route = config.routes[query.type];

  if (typeof result.objects === 'object' && !Array.isArray(result.objects)) {
    result.objects = [result.objects];
  }

  const label = route.labelFunc(result);

  return (
    <Layout>
      <Helmet title={`${label}`} />
      <Header />
      <Screen>
        <Columns>
          <Primary>
            <h1>{label}</h1>
            <p>{result.description || 'No description for this collection'}</p>
            <h2>Objects in the collection</h2>
            <Results>
              <LazyLoad>
                {result.objects.map((object) => {
                  let mainImage = null;
                  if (object.representation && object.representation.image) {
                    mainImage = Array.isArray(object.representation.image)
                      ? object.representation.image.shift()
                      : object.representation.image;
                  } else if (Array.isArray(object.representation)) {
                    mainImage =
                      object.representation[0].image ||
                      object.representation[0]['@id'] ||
                      object.representation[0];
                  }
                  return (
                    <StyledMedia
                      key={object['@id']}
                      title={object.label}
                      subtitle=""
                      thumbnail={mainImage}
                      direction="column"
                      link={`/objects/${encodeURIComponent(object['@id'])}`}
                      uri={result['@graph']}
                    />
                  );
                })}
              </LazyLoad>
            </Results>
            <Debug>
              <Metadata label="HTTP Parameters">
                <pre>{JSON.stringify(query, null, 2)}</pre>
              </Metadata>
              <Metadata label="Query Result">
                <pre>{JSON.stringify(result, null, 2)}</pre>
              </Metadata>
            </Debug>
          </Primary>
          <Secondary />
        </Columns>
      </Screen>
      <Footer />
    </Layout>
  );
};

CollectionDetailsPage.getInitialProps = async ({ query }) => {
  const route = config.routes[query.type];
  const searchQuery = JSON.parse(JSON.stringify(route.query));
  searchQuery.$filter = `?id = <${query.id}>`;

  try {
    if (config.debug) {
      console.log('searchQuery:', JSON.stringify(searchQuery, null, 2));
    }
    const res = await sparqlTransformer(searchQuery, {
      endpoint: config.api.endpoint,
      debug: config.debug,
    });
    return { result: res['@graph'][0] };
  } catch (err) {
    console.error(err);
  }

  return { result: null };
};

export default CollectionDetailsPage;
