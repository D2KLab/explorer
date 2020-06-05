import styled from 'styled-components';
import { useRouter } from 'next/router';

import { Header, Footer, Layout, Body, Media } from '@components';
import Metadata from '@components/Metadata';
import Tabs, { Tab } from '@components/TabBar';
import PageTitle from '@components/PageTitle';
import { breakpoints } from '@styles';
import { uriToId, idToUri } from '@helpers/utils';
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

const Player = styled.div`
  /* background-color: green; */

  display: flex;
  align-items: center;
  justify-content: center;
`;

const Analysis = styled.div`
  /* background-color: red; */

  margin-bottom: 8px;
`;

const MetadataList = styled.div`
  margin-bottom: 24px;
`;

const RelatedVideos = styled.div`
  background-color: #eee;
  padding: 16px;
  border: 1px solid #dcdcdc;

  h2 {
    text-transform: uppercase;
    font-weight: bold;
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: 1em;
  }
`;

const RelatedVideosList = styled.div``;

const VideoDetailsPage = ({ result }) => {
  const { query } = useRouter();
  const route = config.routes[query.type];

  const label = route.labelFunc(result);

  return (
    <Layout>
      <PageTitle title={`${label}`} />
      <Header />
      <Body>
        <Columns>
          <Primary>
            <Player>
              <img src="/images/thumbnail.jpg" alt="Video" />
            </Player>
            <Analysis>
              <Tabs>
                <Tab label="Transcript">
                  <p>Transcript.</p>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                    incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices
                    gravida. Risus commodo viverra maecenas accumsan lacus vel facilisisda.
                  </p>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                    incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices
                    gravida. Risus commodo viverra maecenas accumsan lacus vel facilisisda.
                  </p>
                </Tab>
                <Tab label="Face Rec">
                  <p>Face Rec.</p>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                    incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices
                    gravida. Risus commodo viverra maecenas accumsan lacus vel facilisisda.
                  </p>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                    incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices
                    gravida. Risus commodo viverra maecenas accumsan lacus vel facilisisda.
                  </p>
                </Tab>
                <Tab label="Audio">
                  <p>Audio.</p>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                    incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices
                    gravida. Risus commodo viverra maecenas accumsan lacus vel facilisisda.
                  </p>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                    incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices
                    gravida. Risus commodo viverra maecenas accumsan lacus vel facilisisda.
                  </p>
                </Tab>
                <Tab label="Object Det">
                  <p>Object Det.</p>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                    incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices
                    gravida. Risus commodo viverra maecenas accumsan lacus vel facilisisda.
                  </p>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                    incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices
                    gravida. Risus commodo viverra maecenas accumsan lacus vel facilisisda.
                  </p>
                </Tab>
              </Tabs>
            </Analysis>
          </Primary>
          <Secondary>
            <MetadataList>
              <h1>Une soirée mystérieuse</h1>
              <Metadata label="Part of">
                <a href="#">Enquêteur malgré lui</a>
              </Metadata>
              <Metadata label="Genre">
                <a href="#">Série</a>
              </Metadata>
              <Metadata label="Themes">
                <a href="#">Fiction</a>, <a href="#">Intrigue policière</a>
              </Metadata>
              <Metadata label="Released">
                <strong>11 May 2014</strong>
              </Metadata>
              <Metadata label="Duration">
                <strong>45 mins</strong>
              </Metadata>
              <Metadata label="Description">
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                  incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices
                  gravida. Risus commodo viverra maecenas accumsan lacus vel facilisisda
                </p>
              </Metadata>
              <Metadata label="HTTP Parameters">
                <pre>{JSON.stringify(query, null, 2)}</pre>
              </Metadata>
              <Metadata label="Query Result">
                <pre>{JSON.stringify(result, null, 2)}</pre>
              </Metadata>
            </MetadataList>
            {/* <RelatedVideos>
              <h2>Related</h2>
              <RelatedVideosList>
                <Media
                  title="Video Title"
                  subtitle="Program Title"
                  thumbnail="/images/thumbnail.jpg"
                  direction="row"
                />
              </RelatedVideosList>
            </RelatedVideos> */}
          </Secondary>
        </Columns>
      </Body>
      <Footer />
    </Layout>
  );
};

VideoDetailsPage.getInitialProps = async ({ query }) => {
  const route = config.routes[query.type];
  const searchQuery = JSON.parse(JSON.stringify(route.query));
  searchQuery.$limit = 1;
  searchQuery.$filter = `?id = <${idToUri(query.id, route.uriBase)}>`;

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

export default VideoDetailsPage;
