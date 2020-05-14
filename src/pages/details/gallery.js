import styled from 'styled-components';
import { useRouter } from 'next/router';
import { Helmet } from 'react-helmet';

import { Header, Footer, Layout, Screen, Media } from '@components';
import Metadata from '@components/Metadata';
import Tabs, { Tab } from '@components/TabBar';
import GraphIcon from '@components/GraphIcon';
import Debug from '@components/Debug';
import { breakpoints } from '@styles';
import config from '~/config';
import { withTranslation } from '~/i18n';

const { Carousel } = require('react-responsive-carousel');

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

  .carousel .thumbs {
    /* TODO: HACK: react-responsive-carousel doesn't support vertical thumbnails as of 2020-04-27 */
    white-space: normal;
    transform: none !important;
  }
  .carousel .thumb.selected,
  .carousel .thumb:hover {
    border: 3px solid ${({ theme }) => theme.colors.primary};
  }
  .carousel .slide {
    background: #d9d9d9;
  }
  .carousel .carousel-status {
    font-size: 16px;
    color: #d4d3ce;
    top: 16px;
    left: 16px;
  }
  .carousel .control-arrow::before {
    border-width: 0 3px 3px 0;
    border: solid #000;
    display: inline-block;
    padding: 3px;
    border-width: 0 3px 3px 0;
    width: 20px;
    height: 20px;
  }
  .carousel .control-next.control-arrow::before {
    transform: rotate(-45deg);
  }
  .carousel .control-prev.control-arrow::before {
    transform: rotate(135deg);
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

const Title = styled.h1`
  font-size: 3em;
  line-height: 1.2em;
  margin-bottom: 0.2em;
  display: none;
  border-bottom: 3px solid ${({ theme }) => theme.colors.primary};
  ${breakpoints.desktop`
    display: block;
  `}
`;

const MobileTitle = styled(Title)`
  display: block;

  ${breakpoints.desktop`
    display: none;
  `};
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

function generateValue(currentRouteName, currentRoute, metaName, meta) {
  if (typeof meta === 'string') {
    return <>{meta}</>;
  }

  const type = Object.entries(config.routes).find(([, route]) => {
    return route.rdfType && route.rdfType === meta['@type'];
  });
  const isKnownType = typeof type !== 'undefined';

  let url = meta['@id'];
  if (type) {
    url = `/${type[0]}/${encodeURIComponent(meta['@id'])}`;
  } else if (
    currentRoute &&
    Array.isArray(currentRoute.filters) &&
    currentRoute.filters.find((f) => f.id === metaName)
  ) {
    url = `/${currentRouteName}/?field_filter_${metaName}=${encodeURIComponent(meta['@id'])}`;
  }

  let printableValue = '<unk>';
  if (typeof meta.label === 'object') {
    // If $langTag is set to 'show' in sparql-transformer
    printableValue = meta.label['@value'];
  } else if (typeof meta.label === 'string') {
    // Example: {"@id":"http://data.silknow.org/collection/ec0f9a6f-7b69-31c4-80a6-c0a9cde663a5","@type":"http://erlangen-crm.org/current/E78_Collection","label":"European Sculpture and Decorative Arts"}
    printableValue = meta.label;
  } else {
    // Example: {"@id":"Textiles"}
    printableValue = meta['@id'];
    url = null;
  }

  if (!url) {
    return <>{printableValue}</>;
  }

  return (
    <a
      href={url}
      target={isKnownType ? '_self' : '_blank'}
      rel={isKnownType ? '' : 'noopener noreferrer'}
    >
      {printableValue}
      {JSON.stringify(type)}
    </a>
  );
}

const GalleryDetailsPage = ({ result }) => {
  const { query } = useRouter();
  const route = config.routes[query.type];

  const images = [];
  const representations = Array.isArray(result.representation)
    ? result.representation
    : [result.representation];
  representations.forEach((repres) => {
    const imgs = Array.isArray(repres.image) ? repres.image : [repres.image];
    images.push(...imgs.filter((img) => img && new URL(img).hostname === 'silknow.org'));
  });

  const metadata = Object.entries(result).filter(([metaName, meta]) => {
    return !['@type', '@id', '@graph', 'label', 'representation'].includes(metaName);
  });

  // TODO: used to test the Analysis section, remove later
  const lipsum = (
    <>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida. Risus commodo
        viverra maecenas accumsan lacus vel facilisisda.
      </p>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida. Risus commodo
        viverra maecenas accumsan lacus vel facilisisda.
      </p>
    </>
  );

  const label = route.labelFunc(result);

  return (
    <Layout>
      <Helmet title={`${label}`} />
      <Header />
      <Screen>
        <Columns>
          <Primary>
            <MobileTitle>{label}</MobileTitle>
            <Carousel showArrows {...config.gallery.options}>
              {images.map((image) => (
                <div key={image}>
                  <img src={image} alt={label} />
                  <p className="legend">{label}</p>
                </div>
              ))}
            </Carousel>
            {/*
            <Analysis>
              <Tabs>
                <Tab label="Transcript">
                  <p>Transcript.</p>
                  {lipsum}
                </Tab>
                <Tab label="Face Rec">
                  <p>Face Rec.</p>
                  {lipsum}
                </Tab>
                <Tab label="Audio">
                  <p>Audio.</p>
                  {lipsum}
                </Tab>
                <Tab label="Object Det">
                  <p>Object Det.</p>
                  {lipsum}
                </Tab>
              </Tabs>
            </Analysis>
            */}
            <Debug>
              <Metadata label="HTTP Parameters">
                <pre>{JSON.stringify(query, null, 2)}</pre>
              </Metadata>
              <Metadata label="Query Result">
                <pre>{JSON.stringify(result, null, 2)}</pre>
              </Metadata>
            </Debug>
          </Primary>
          <Secondary>
            <MetadataList>
              <Title>{label}</Title>
              <GraphIcon uri={result['@graph']} />
              {metadata.flatMap(([metaName, meta]) => {
                const values = [];
                if (Array.isArray(meta)) {
                  /* Example:
                    [
                      { '@id': { '@language': 'en', '@value': 'linen' } },
                      { '@id': 'http://data.silknow.org/vocabulary/277', label: [ { '@language': 'en', '@value': 'silk thread' } ] }
                    ]
                  */
                  meta.forEach((subMeta) => {
                    const value = generateValue(query.type, route, metaName, subMeta);
                    if (value) {
                      values.push(value);
                    }
                  });
                } else if (typeof meta['@id'] === 'object') {
                  // Example: { '@id': { '@language': 'en', '@value': 'hand embroidery' } }
                  values.push(<span>{meta['@id']['@value']}</span>);
                } else {
                  // Example: { '@id': 'http://data.silknow.org/collection/4051dfc9-1267-3530-bac8-40011f2e3daa', '@type': 'E78_Collection', label: 'Textiles and Fashion Collection' }
                  const value = generateValue(query.type, route, metaName, meta);
                  if (value) {
                    values.push(value);
                  }
                }

                return (
                  <Metadata key={metaName} label={metaName}>
                    {values.map((value, i) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <div key={i}>{value}</div>
                    ))}
                  </Metadata>
                );
              })}
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
      </Screen>
      <Footer />
    </Layout>
  );
};

GalleryDetailsPage.getInitialProps = async ({ query }) => {
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

export default GalleryDetailsPage;
