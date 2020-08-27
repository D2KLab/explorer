import { useState, useRef } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import DefaultErrorPage from 'next/error';
import ReactPlayer from 'react-player';
import queryString from 'query-string';
import NextAuth from 'next-auth/client';

import { Header, Footer, Layout, Body, Media, Button, Element } from '@components';
import SaveButton from '@components/SaveButton';
import Metadata from '@components/Metadata';
import PageTitle from '@components/PageTitle';
import Debug from '@components/Debug';
import { breakpoints } from '@styles';
import { uriToId, absoluteUrl } from '@helpers/utils';
import SparqlClient from '@helpers/sparql';
import { withTranslation } from '~/i18n';
import config from '~/config';

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
  flex: auto;
  overflow: hidden;
  min-width: 50%;
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

    img {
      width: auto;
      max-width: 100%;
    }
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
  flex: auto;
  padding-top: 24px;
  margin-left: 24px;

  ${breakpoints.desktop`
    padding-right: 24px;
    margin-left: 0;
  `}
`;

const Title = styled.h1`
  display: none;
  border-bottom: 3px solid ${({ theme }) => theme.colors.primary};
  font-size: 48px;
  line-height: 1.25;
  margin-bottom: 24px;

  ${breakpoints.desktop`
    display: block;
  `}
`;

const MetadataList = styled.div`
  margin-bottom: 24px;
`;

const RelatedVideosList = styled.div``;

const VideoSegment = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
`;

const SegmentButton = styled(Button)`
  background: transparent;
  color: ${({ theme }) => theme.colors.primary};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    box-shadow: none;
  }
`;

const SegmentTime = styled.div`
  width: 240px;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1rem;
  line-height: 2rem;
  font-weight: bold;

  &:hover {
    text-decoration: underline;
  }
`;

const SegmentText = styled.div`
  flex: 1;
`;

function generateValue(currentRouteName, currentRoute, metaName, meta) {
  if (typeof meta === 'string') {
    return <>{meta}</>;
  }

  const [routeName, route] =
    Object.entries(config.routes).find(([, r]) => {
      return r.rdfType && r.rdfType === meta['@type'];
    }) || [];
  const isKnownType = typeof type !== 'undefined';

  let url = meta['@id'];
  if (route) {
    url = `/${routeName}/${encodeURIComponent(uriToId(meta['@id'], { encoding: !route.uriBase }))}`;
  } else if (
    currentRoute &&
    Array.isArray(currentRoute.filters) &&
    currentRoute.filters.find((f) => f.id === metaName)
  ) {
    url = `/${currentRouteName}?field_filter_${metaName}=${encodeURIComponent(meta['@id'])}`;
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
    </a>
  );
}

const VideoDetailsPage = ({ result, inList, mediaUrl, videoSegments, t }) => {
  if (!result) {
    return <DefaultErrorPage statusCode={404} title="Result not found" />;
  }

  const [session] = NextAuth.useSession();

  const { query } = useRouter();
  const route = config.routes[query.type];

  const images = [];

  if (typeof route.imageFunc === 'function') {
    images.push(route.imageFunc(result));
  } else {
    // Get images from SPARQL result
    const representations = Array.isArray(result.representation)
      ? result.representation
      : [result.representation].filter((x) => x);
    representations.forEach((repres) => {
      const imgs = Array.isArray(repres.image) ? repres.image : [repres.image];
      images.push(...imgs.filter((img) => img && new URL(img).hostname === 'silknow.org'));
    });
  }

  const metadata = Object.entries(result).filter(([metaName]) => {
    return !['@type', '@id', '@graph', 'label', 'representation', 'mediaLocator'].includes(
      metaName
    );
  });

  const label = route.labelFunc(result);

  const [isItemSaved, setIsItemSaved] = useState(inList);
  const onItemSaveChange = (status) => {
    setIsItemSaved(status);
  };

  const $videoPlayer = useRef(null);

  const seekVideoTo = (time) => {
    let seconds;
    if (typeof time === 'string' && time.indexOf(':') > -1) {
      const timeArray = time.split(':');
      seconds = +timeArray[0] * 60 * 60 + +timeArray[1] * 60 + +timeArray[2];
    } else {
      seconds = parseFloat(time);
    }
    if (typeof seconds === 'number') {
      $videoPlayer.current.seekTo(seconds, 'seconds');
      $videoPlayer.current.wrapper.scrollIntoView();
    }
  };

  const renderVideoSegment = (segment) => {
    return (
      <VideoSegment key={segment['@id']}>
        <SegmentButton onClick={() => seekVideoTo(segment.start)}>
          &#9654;{' '}
          <SegmentTime>
            {segment.start} - {segment.end}
          </SegmentTime>
        </SegmentButton>
        <SegmentText>{segment.description}</SegmentText>
      </VideoSegment>
    );
  };

  return (
    <Layout>
      <PageTitle title={`${label}`} />
      <Header />
      <Body>
        {mediaUrl && (
          <ReactPlayer
            ref={$videoPlayer}
            url={mediaUrl}
            width={null}
            height="50vh"
            controls
            playing
          />
        )}
        <Columns>
          <Primary>
            <Title>{label}</Title>
            {session && (
              <Element marginBottom={12}>
                <SaveButton
                  type={query.type}
                  item={result}
                  saved={isItemSaved}
                  onChange={onItemSaveChange}
                />
              </Element>
            )}
            <MetadataList>
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
                  <Metadata key={metaName} label={t(`metadata.${metaName}`)}>
                    {values.map((value, i) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <div key={i}>{value}</div>
                    ))}
                  </Metadata>
                );
              })}
            </MetadataList>
            {/* <Analysis>
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
              </Tabs>
            </Analysis> */}
            {config?.plugins?.videoSegments && (
              <Element>
                <h2>Video segments</h2>
                {videoSegments.map(renderVideoSegment)}
              </Element>
            )}
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
            <div>
              <h2>Related</h2>
              <RelatedVideosList>
                <Media title={label} subtitle="" thumbnail={images[0]} direction="row" />
              </RelatedVideosList>
            </div>
          </Secondary>
        </Columns>
      </Body>
      <Footer />
    </Layout>
  );
};

VideoDetailsPage.getInitialProps = async ({ req, res, query }) => {
  const { result, inList } = await (
    await fetch(`${absoluteUrl(req)}/api/entity/${query.id}?${queryString.stringify(query)}`, {
      headers:
        req && req.headers
          ? {
              cookie: req.headers.cookie,
            }
          : undefined,
    })
  ).json();

  const route = config.routes[query.type];

  let mediaUrl = null;
  if (route && route.details && typeof route.details.mediaFunc === 'function') {
    mediaUrl = await (await fetch(`${absoluteUrl(req)}${route.details.mediaFunc(result)}`)).text();
  } else if (result && result.mediaLocator) {
    // Get media url from the media provider
    mediaUrl = result.mediaLocator;
  } else if (!result && res) {
    res.statusCode = 404;
  }

  // Video segments
  const videoSegments = [];
  if (config?.plugins?.videoSegments) {
    const videoSegmentsQuery = { ...config.plugins.videoSegments.query };
    videoSegmentsQuery.$filter = videoSegmentsQuery.$filter || [];
    videoSegmentsQuery.$filter.push(`?video = <${result['@id']}>`);

    const resp = await SparqlClient.query(videoSegmentsQuery, {
      endpoint: config.api.endpoint,
      debug: config.debug,
    });
    videoSegments.push(...resp['@graph']);
  }

  return { result, inList, mediaUrl, videoSegments };
};

export default withTranslation('common')(VideoDetailsPage);
