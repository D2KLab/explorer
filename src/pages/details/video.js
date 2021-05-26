import { useState, useRef } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import DefaultErrorPage from 'next/error';
import ReactPlayer from 'react-player';
import queryString from 'query-string';
import NextAuth from 'next-auth/client';
import { useTabState, Tab, TabList, TabPanel } from 'reakit/Tab';

import Header from '@components/Header';
import Footer from '@components/Footer';
import Layout from '@components/Layout';
import Body from '@components/Body';
import Button from '@components/Button';
import Element from '@components/Element';
import Metadata from '@components/Metadata';
import Debug from '@components/Debug';
import PageTitle from '@components/PageTitle';
import Media, { ThumbnailContainer } from '@components/Media';
import SPARQLQueryLink from '@components/SPARQLQueryLink';
import GraphIcon from '@components/GraphIcon';
import MetadataList from '@components/MetadataList';
import SaveButton from '@components/SaveButton';
import breakpoints from '@styles/breakpoints';
import { absoluteUrl, getQueryObject } from '@helpers/utils';
import SparqlClient from '@helpers/sparql';
import { getEntityMainLabel } from '@helpers/explorer';
import { useTranslation } from '~/i18n';
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

const StyledMedia = styled(Media)`
  ${ThumbnailContainer} {
    height: auto;
  }
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
`;

const Secondary = styled.div`
  flex: auto;
  padding-top: 24px;
  margin-left: 24px;

  ${breakpoints.desktop`
    margin-left: 0;
  `}
`;

const Title = styled.h1`
  border-bottom: 3px solid ${({ theme }) => theme.colors.primary};
  font-size: 3rem;
  line-height: 1.25;
  word-break: break-word;
`;

const RelatedVideosList = styled.div``;

const SegmentIcon = styled.span`
  width: 24px;
  visibility: ${({ active }) => (active ? 'visible' : 'hidden')};
`;

const Segment = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  background-color: #f0f0f0;
  border-bottom: 1px solid #e8e8e7;

  &:hover {
    background-color: #fff;

    ${SegmentIcon} {
      visibility: visible;
    }
  }
`;

const SegmentButton = styled(Button)`
  outline: 0;
  background: transparent;
  color: ${({ theme }) => theme.colors.primary};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    box-shadow: none;
  }
`;

const SegmentTime = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1rem;
  line-height: 2rem;
  font-weight: 700;
  padding-left: 12px;

  &:hover {
    text-decoration: underline;
  }
`;

const SegmentText = styled.div`
  flex: 1;
  padding-left: 24px;
`;

const VideoWrapper = styled.div`
  ${breakpoints.desktop`
    height: 50vh;
    display: flex;
    flex-direction: row;
    background-color: #f0f0f0;
    padding-left: 24px;
  `};
`;

const StyledReactPlayer = styled(ReactPlayer)`
  flex: 1;
  ${breakpoints.desktop`
    padding: 24px;
  `};
`;

const VideoSegments = styled.div`
  ${breakpoints.desktop`
    padding: 24px 0;
    width: 50%;
    overflow-y: auto;
  `};
`;

const Description = styled.div`
  white-space: pre-line;
`;

const LegalBody = styled.small`
  margin-left: 8px;
`;

const StyledTab = styled(Tab)`
  appearance: none;
  background-color: #fff;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: 0;
  outline: 0;
  padding: 1em;
  cursor: pointer;
  flex: 1;
  font-weight: bold;
  text-transform: uppercase;

  &:hover {
    background-color: #ddd;
  }

  &[aria-selected='true'] {
    border-bottom: none;
  }
  &:not([aria-selected='true']) {
    border-top-color: transparent;
    border-left-color: transparent;
    border-right-color: transparent;
  }
`;

const StyledTabList = styled(TabList)`
  display: flex;
  height: 50px;
`;

const StyledTabPanel = styled(TabPanel)`
  overflow: auto;
  max-height: calc(100% - 50px);
`;

function humanTimeToSeconds(humanTime) {
  const time = humanTime.split(':');
  return +time[0] * 60 * 60 + +time[1] * 60 + +time[2];
}

function secondsToHumanTime(seconds) {
  seconds = parseInt(seconds, 10);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  return [h, m > 9 ? m : h ? `0${m}` : m || '0', s > 9 ? s : `0${s}`].filter(Boolean).join(':');
}

function formatSegmentTime(time, removeZeroes) {
  let formattedTime = time;
  // Remove '00:' at start if needed
  if (removeZeroes && formattedTime.startsWith('00:')) {
    formattedTime = formattedTime.substr('00:'.length);
  }
  // Remove milliseconds
  const msIndex = formattedTime.indexOf('.');
  if (msIndex > -1) {
    formattedTime = formattedTime.substr(0, msIndex);
  }
  return formattedTime;
}

const VideoDetailsPage = ({
  result,
  inList,
  mediaUrl,
  debugSparqlQuery,
  videoSegments,
  annotations,
  faceTracks,
  captions,
}) => {
  const { t, i18n } = useTranslation(['common']);

  if (!result) {
    return <DefaultErrorPage statusCode={404} title={t('common:errors.resultNotFound')} />;
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

  const label = getEntityMainLabel(result, { route, language: i18n.language });

  const [isItemSaved, setIsItemSaved] = useState(inList);
  const onItemSaveChange = (status) => {
    setIsItemSaved(status);
  };

  const $videoPlayer = useRef(null);
  const [videoPlayedSeconds, setVideoPlayedSeconds] = useState(0);

  const seekVideoTo = (seconds) => {
    if (typeof seconds === 'number') {
      $videoPlayer.current.seekTo(seconds, 'seconds');
      $videoPlayer.current.wrapper.scrollIntoView();
      setVideoPlayedSeconds(seconds);
    }
  };

  // Remove '00:' at start if all segments are not hours long
  const removeZeroes = videoSegments.every((segment) => segment.end.startsWith('00:'));

  const renderVideoSegment = (segment) => {
    const segmentTitle = (Array.isArray(segment.title)
      ? segment.title
      : [segment.title].filter((x) => x)
    )
      .map((x) => x['@value'] || x)
      .pop();
    const segmentDescription = (Array.isArray(segment.description)
      ? segment.description
      : [segment.description].filter((x) => x)
    )
      .map((x) => x['@value'] || x)
      .pop();
    return (
      <Segment key={segment['@id']}>
        <SegmentButton onClick={() => seekVideoTo(segment.startSeconds)}>
          <SegmentIcon
            active={
              videoPlayedSeconds >= segment.startSeconds && videoPlayedSeconds < segment.endSeconds
            }
          >
            &#9654;{' '}
          </SegmentIcon>
          <SegmentTime>
            {segment.start}
            {segment.end}
            {/* <time>{formatSegmentTime(segment.start, removeZeroes)}</time> -{' '}
            <time>{formatSegmentTime(segment.end, removeZeroes)}</time> */}
          </SegmentTime>
        </SegmentButton>
        <SegmentText>
          {segmentTitle && <p>{segmentTitle}</p>}
          {segmentDescription && <p>{segmentDescription}</p>}
        </SegmentText>
      </Segment>
    );
  };

  const onVideoProgress = ({ playedSeconds }) => {
    setVideoPlayedSeconds(playedSeconds);
  };

  const tab = useTabState();

  const renderAnalysis = () => {
    const hasVideoSegments = Array.isArray(videoSegments) && videoSegments.length > 0;
    const hasAnnotations = Array.isArray(annotations) && annotations.length > 0;
    const hasFaceTracks = Array.isArray(faceTracks) && faceTracks.length > 0;
    const hasCaptions = Array.isArray(captions) && captions.length > 0;

    return (
      <Element flex="0.7">
        <StyledTabList {...tab} aria-label="Analysis">
          {hasVideoSegments && <StyledTab {...tab}>Segments</StyledTab>}
          {hasAnnotations && <StyledTab {...tab}>Annotations</StyledTab>}
          {hasFaceTracks && <StyledTab {...tab}>FaceRec</StyledTab>}
          {hasCaptions && <StyledTab {...tab}>DeepCaptions</StyledTab>}
        </StyledTabList>
        {hasVideoSegments && (
          <StyledTabPanel {...tab}>
            <VideoSegments>{videoSegments.map(renderVideoSegment)}</VideoSegments>
          </StyledTabPanel>
        )}
        {hasAnnotations && (
          <StyledTabPanel {...tab}>
            <ul>
              {annotations.map((ann) => {
                return (
                  <Segment key={ann['@id']}>
                    <SegmentButton onClick={() => seekVideoTo(ann.startSeconds)}>
                      <SegmentTime>
                        <time>{formatSegmentTime(ann.start)}</time> -{' '}
                        <time>{formatSegmentTime(ann.end)}</time>
                      </SegmentTime>
                    </SegmentButton>
                    <SegmentText>
                      <p>
                        {ann.body} <small>({ann.type})</small>
                      </p>
                    </SegmentText>
                  </Segment>
                );
              })}
            </ul>
          </StyledTabPanel>
        )}
        {hasFaceTracks && (
          <StyledTabPanel {...tab}>
            {faceTracks.map((track) => {
              return (
                <Segment key={track.track_id}>
                  <SegmentButton onClick={() => seekVideoTo(track.start_npt)}>
                    <SegmentTime>
                      <time>{formatSegmentTime(secondsToHumanTime(track.start_npt))}</time> -{' '}
                      <time>{formatSegmentTime(secondsToHumanTime(track.end_npt))}</time>
                    </SegmentTime>
                  </SegmentButton>
                  <SegmentText>
                    <p>
                      {track.name}{' '}
                      <small style={{ color: '#aaa' }}>
                        (Confidence: {track.confidence.toFixed(2)})
                      </small>
                    </p>
                  </SegmentText>
                </Segment>
              );
            })}
          </StyledTabPanel>
        )}
        {hasCaptions && (
          <StyledTabPanel {...tab}>
            {captions.map((caption) => {
              return (
                <Segment key={caption['@id']}>
                  <SegmentButton onClick={() => seekVideoTo(parseInt(caption.start, 10))}>
                    <SegmentTime>
                      <time>{formatSegmentTime(secondsToHumanTime(caption.start))}</time> -{' '}
                      <time>{formatSegmentTime(secondsToHumanTime(caption.end))}</time>
                    </SegmentTime>
                  </SegmentButton>
                  <SegmentText>
                    <p>{caption.text}</p>
                  </SegmentText>
                </Segment>
              );
            })}
          </StyledTabPanel>
        )}
      </Element>
    );
  };

  return (
    <Layout>
      <PageTitle title={`${label}`} />
      <Header />
      <Body>
        {mediaUrl && (
          <VideoWrapper>
            <StyledReactPlayer
              ref={$videoPlayer}
              url={mediaUrl}
              onProgress={onVideoProgress}
              width="100%"
              height="100%"
              controls
              playing
            />
            {config?.plugins?.videoSegments && renderAnalysis()}
          </VideoWrapper>
        )}
        <Columns>
          <Primary>
            <Element marginBottom={24}>
              <Title>{label}</Title>
              <Element
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                marginY={12}
              >
                {route.details.showPermalink && (
                  <small>
                    (
                    <a href={result['@id']} target="_blank" rel="noopener noreferrer">
                      {t('common:buttons.permalink')}
                    </a>
                    )
                  </small>
                )}
                {session && (
                  <SaveButton
                    type={query.type}
                    item={result}
                    saved={isItemSaved}
                    onChange={onItemSaveChange}
                  />
                )}
              </Element>
            </Element>
            <Element marginBottom={12} display="flex">
              <GraphIcon uri={result['@graph']} />
              {session && (
                <SaveButton
                  type={query.type}
                  item={result}
                  saved={isItemSaved}
                  onChange={onItemSaveChange}
                />
              )}
              {result.legalBody && (
                <LegalBody>
                  {Array.isArray(result.legalBody)
                    ? result.legalBody.map((body) => body.label)
                    : result.legalBody.label}
                </LegalBody>
              )}
            </Element>
            <Element marginBottom={24}>
              <MetadataList metadata={result} query={query} route={route} />
            </Element>
            {result.description && (
              <>
                <h4>Description</h4>
                <Description
                  dangerouslySetInnerHTML={{
                    __html: Array.isArray(result.description)
                      ? result.description.join('\n\n')
                      : result.description,
                  }}
                />
              </>
            )}

            <Debug>
              <Metadata label="HTTP Parameters">
                <pre>{JSON.stringify(query, null, 2)}</pre>
              </Metadata>
              <Metadata label="Query Result">
                <pre>{JSON.stringify(result, null, 2)}</pre>
              </Metadata>
              <Metadata label="SPARQL Query">
                <SPARQLQueryLink query={debugSparqlQuery}>
                  {t('common:buttons.editQuery')}
                </SPARQLQueryLink>
                <pre>{debugSparqlQuery}</pre>
              </Metadata>
            </Debug>
          </Primary>
          <Secondary>
            <div>
              <h2>Related</h2>
              <RelatedVideosList>
                <StyledMedia title={label} subtitle="" thumbnail={images[0]} direction="row" />
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
  const { result, inList, debugSparqlQuery } = await (
    await fetch(`${absoluteUrl(req)}/api/entity?${queryString.stringify(query)}`, {
      headers:
        req && req.headers
          ? {
              cookie: req.headers.cookie,
            }
          : undefined,
    })
  ).json();

  let mediaUrl = null;
  const videoSegments = [];
  let faceTracks = [];
  const annotations = [];
  const captions = [];

  if (result) {
    const route = config.routes[query.type];

    if (route && route.details && typeof route.details.mediaFunc === 'function') {
      const mediaFuncRet = route.details.mediaFunc(result);
      if (mediaFuncRet) {
        mediaUrl = await (await fetch(mediaFuncRet)).text();
      }
    } else if (result && result.mediaLocator) {
      // Get media url from the media provider
      mediaUrl = result.mediaLocator;
    }

    // Video segments
    if (config?.plugins?.videoSegments) {
      const videoSegmentsQuery = getQueryObject(config.plugins.videoSegments.query);
      videoSegmentsQuery.$filter = videoSegmentsQuery.$filter || [];
      videoSegmentsQuery.$filter.push(`?video = <${result['@id']}>`);

      const resp = await SparqlClient.query(videoSegmentsQuery, {
        endpoint: config.api.endpoint,
        debug: config.debug,
      });

      resp['@graph'].forEach((segment) => {
        videoSegments.push({
          ...segment,
          startSeconds: humanTimeToSeconds(segment.start),
          endSeconds: humanTimeToSeconds(segment.end),
        });
      });

      // Sort segments by time
      videoSegments.sort((a, b) => a.startSeconds - b.startSeconds);
    }

    // ANNOTATIONS
    // Process the annotations
    result.annotation.forEach((ann) => {
      annotations.push({
        ...ann,
        startSeconds: ann.start,
        endSeconds: ann.end,
        start: secondsToHumanTime(ann.start),
        end: secondsToHumanTime(ann.end),
      });
    });
    // Remove annotations from result object since we're displaying them manually instead of in the MetadataList
    delete result.annotation;

    // FACEREC
    // Get face tracking data
    const resTrack = await (
      await fetch(
        `http://facerec.eurecom.fr/track?video=${encodeURIComponent(
          result['@id']
        )}&project=memad&speedup=25`
      )
    ).json();
    faceTracks = resTrack.tracks || [];
    faceTracks = faceTracks.concat(resTrack.feat_clusters || []);
    faceTracks = faceTracks.filter((track) => track.confidence > 0.7);
    console.log(faceTracks);
    faceTracks.sort((a, b) => (a.start_npt > b.start_npt ? 1 : -1));

    // DEEPCAPTIONS
    // Process the captions
    result.caption.forEach((caption) => {
      captions.push({
        ...caption,
        startSeconds: parseInt(caption.start, 10),
        endSeconds: parseInt(caption.end, 10),
        start: secondsToHumanTime(caption.start),
        end: secondsToHumanTime(caption.end),
      });
    });
    captions.sort((a, b) => (a.startSeconds > b.startSeconds ? 1 : -1));
    // Remove captions from result object since we're displaying them manually instead of in the MetadataList
    delete result.caption;
  } else if (res) {
    res.statusCode = 404;
  }

  return {
    result,
    inList,
    mediaUrl,
    videoSegments,
    debugSparqlQuery,
    faceTracks,
    annotations,
    captions,
    namespacesRequired: ['common'],
  };
};

export default VideoDetailsPage;
