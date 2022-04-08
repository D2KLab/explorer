import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import DefaultErrorPage from 'next/error';
import ReactPlayer from 'react-player';
import queryString from 'query-string';
import NextAuth from 'next-auth/client';
import { useTabState, Tab, TabList, TabPanel } from 'reakit/Tab';
import Link from 'next/link';

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
import GraphLink from '@components/GraphLink';
import MetadataList from '@components/MetadataList';
import SaveButton from '@components/SaveButton';
import breakpoints from '@styles/breakpoints';
import { absoluteUrl, getQueryObject, uriToId } from '@helpers/utils';
import SparqlClient from '@helpers/sparql';
import { getEntityMainLabel } from '@helpers/explorer';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
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
  margin-bottom: 12px;

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

const DesktopContainer = styled.div`
  display: none;

  ${breakpoints.desktop`
    display: block;
  `}
`;

const MobileContainer = styled.div`
  display: block;

  ${breakpoints.desktop`
    display: none;
  `};
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
  max-height: 45vh;

  ${breakpoints.desktop`
    max-height: calc(100% - 50px);
  `}
`;

const PlayerWrapper = styled.div`
  position: relative;
  flex: 1;

  ${breakpoints.desktop`
    margin: 24px;
    max-width: 700px;
  `};
`;

const FaceOverlay = styled.div`
  pointer-events: none;
  position: absolute;
  top: 0;
  left: 0;
  width: ${({ width }) => `${width}px`};
  height: ${({ height }) => `${height}px`};
`;

const FaceRectangle = styled.div`
  border: 3px solid red;
  position: absolute;
  top: ${({ y }) => `${y}px`};
  left: ${({ x }) => `${x}px`};
  width: ${({ width }) => `${width}px`};
  height: ${({ height }) => `${height}px`};
  display: ${({ visible }) => (visible ? 'block' : 'none')};
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

function adaptDimension(bounding, origW, origH, destW, destH) {
  const rW = destW / origW;
  const rH = destH / origH;
  return {
    x: bounding.x * rW,
    y: bounding.y * rH,
    w: bounding.w * rW,
    h: bounding.h * rH,
  };
}

function isInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

function debounce(fn, ms) {
  let timer;
  return () => {
    clearTimeout(timer);
    timer = setTimeout((...args) => {
      timer = null;
      fn.apply(this, ...args);
    }, ms);
  };
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
  subtitles,
}) => {
  const { t, i18n } = useTranslation(['common', 'project']);

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
    console.log('seekVideoTo', seconds);
    if (typeof seconds === 'number') {
      $videoPlayer.current.seekTo(seconds, 'seconds');
      if (!isInViewport($videoPlayer.current.wrapper)) {
        $videoPlayer.current.wrapper.scrollIntoView();
      }
      setVideoPlayedSeconds(seconds);
    }
  };

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

  const [faceRectangles, setFaceRectangles] = useState([]);

  const updateFaceRectangles = () => {
    setFaceRectangles(
      faceTracks.map((track) => {
        if (!$videoPlayer.current || !$videoPlayer.current.getInternalPlayer()) return;
        const {
          videoWidth,
          videoHeight,
          offsetWidth,
          offsetHeight,
        } = $videoPlayer.current.getInternalPlayer();
        const bounds = adaptDimension(
          track.bounding,
          videoWidth,
          videoHeight,
          offsetWidth,
          offsetHeight
        );
        return { bounds, start_npt: track.start_npt, end_npt: track.end_npt };
      })
    );
  };

  const onVideoStart = () => {
    updateFaceRectangles();
  };

  const onVideoProgress = ({ playedSeconds }) => {
    setVideoPlayedSeconds(playedSeconds);
  };

  const tab = useTabState();

  useEffect(() => {
    const debouncedHandleResize = debounce(() => {
      updateFaceRectangles();
    }, 1000);
    window.addEventListener('resize', debouncedHandleResize);
    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
    };
  }, []);

  const renderAnalysis = () => {
    const hasVideoSegments = Array.isArray(videoSegments) && videoSegments.length > 0;
    const hasAnnotations = Array.isArray(annotations) && annotations.length > 0;
    const hasFaceTracks = Array.isArray(faceTracks) && faceTracks.length > 0;
    const hasCaptions = Array.isArray(captions) && captions.length > 0;

    return (
      <Element flex="0.7">
        <StyledTabList {...tab} aria-label="Analysis">
          {hasVideoSegments && <StyledTab {...tab}>Segments</StyledTab>}
          {hasAnnotations && <StyledTab {...tab}>NER</StyledTab>}
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
              {annotations.map((ann) => (
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
                ))}
            </ul>
          </StyledTabPanel>
        )}
        {hasFaceTracks && (
          <StyledTabPanel {...tab}>
            {faceTracks.map((track) => (
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
              ))}
          </StyledTabPanel>
        )}
        {hasCaptions && (
          <StyledTabPanel {...tab}>
            {captions.map((caption) => (
                <Segment key={caption['@id']}>
                  <SegmentButton onClick={() => seekVideoTo(caption.startSeconds)}>
                    <SegmentTime>
                      <time>{formatSegmentTime(caption.start)}</time> -{' '}
                      <time>{formatSegmentTime(caption.end)}</time>
                    </SegmentTime>
                  </SegmentButton>
                  <SegmentText>
                    <p>{caption.text}</p>
                  </SegmentText>
                </Segment>
              ))}
          </StyledTabPanel>
        )}
      </Element>
    );
  };

  const renderPermalink = () => (
    <Element display="flex" alignItems="center" justifyContent="space-between" marginY={12}>
      {result.sameAs && (
        <small>
          (
            <a href={result.sameAs} target="_blank" rel="noopener noreferrer">
              {t('common:buttons.original')}
            </a>
          )
        </small>
      )}
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
  );

  const relatedLinks = {
    'http://data.memad.eu/f24/speciale-elections-europeennes/61273825d815bc5a40df44cb2c6a65edfde6c44c': {
      title: 'Spéciale élections européennes : [1ère partie]',
      image: 'https://platform.limecraft.com/api/production/2336/mo/807720/moa',
    },
    'http://data.memad.eu/f24/speciale-elections-europeennes/2d9371cabdf44cdbeb80e4e66ebcc6af0a6f9bf5': {
      title: 'Spéciale élections européennes : [2ème partie]',
      image: 'https://platform.limecraft.com/api/production/2336/mo/807722/moa',
    },
    'http://data.memad.eu/f24/speciale-elections-europeennes/293ada98496bab9a3cbce574442d9eccc2ddff3e': {
      title: 'Spéciale élections européennes : [3ème partie]',
      image: 'https://platform.limecraft.com/api/production/2336/mo/807782/moa',
    },
    'http://data.memad.eu/fit/orphan/f8be6bfaf333982cb725c7b3f5b0a738a90712a6': {
      title: 'Soirée spéciale Elections européennes',
      image: 'https://platform.limecraft.com/api/production/2336/mo/811884/moa',
    },
  };

  return (
    <Layout>
      <PageTitle title={`${label}`} />
      <Header />
      <Body>
        <MobileContainer style={{ padding: 24 }}>
          <Title>{label}</Title>
          {renderPermalink()}
        </MobileContainer>
        {mediaUrl && (
          <VideoWrapper>
            <PlayerWrapper>
              <ReactPlayer
                ref={$videoPlayer}
                url={mediaUrl}
                onStart={onVideoStart}
                onProgress={onVideoProgress}
                width="100%"
                height="100%"
                controls
                playing
                config={{
                  file: {
                    tracks: subtitles,
                  },
                }}
              />
              <FaceOverlay
                width={$videoPlayer?.current?.getInternalPlayer()?.offsetWidth}
                height={$videoPlayer?.current?.getInternalPlayer()?.offsetHeight}
              >
                {faceRectangles.map(
                  (rect) =>
                    rect && (
                      <FaceRectangle
                        x={rect.bounds.x}
                        y={rect.bounds.y}
                        width={rect.bounds.w}
                        height={rect.bounds.h}
                        visible={
                          videoPlayedSeconds >= rect.start_npt && videoPlayedSeconds <= rect.end_npt
                        }
                      />
                    )
                )}
              </FaceOverlay>
            </PlayerWrapper>
            {config?.plugins?.videoSegments && renderAnalysis()}
          </VideoWrapper>
        )}
        <Columns>
          <Primary>
            <DesktopContainer style={{ marginBottom: 24 }}>
              <Title>{label}</Title>
              {renderPermalink()}
            </DesktopContainer>
            <Element marginBottom={12} display="flex">
              <GraphLink uri={result['@graph']} icon label />
            </Element>
            {result.description && (
              <Element marginBottom={24}>
                <h4>Description</h4>
                <Description
                  dangerouslySetInnerHTML={{
                    __html: Array.isArray(result.description)
                      ? result.description.join('\n\n')
                      : result.description,
                  }}
                />
              </Element>
            )}
            {result.producerSummary && (
              <Element marginBottom={24}>
                <h4>Producer Summary</h4>
                <Description
                  dangerouslySetInnerHTML={{
                    __html: Array.isArray(result.producerSummary)
                      ? result.producerSummary.join('\n\n')
                      : result.producerSummary,
                  }}
                />
              </Element>
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
            <Element marginBottom={24}>
              <MetadataList metadata={result} query={query} route={route} />
            </Element>
            <Element marginBottom={24}>
              <h2>Related</h2>
              <RelatedVideosList>
                {(Object.keys(relatedLinks).includes(result['@id']) &&
                  Object.entries(relatedLinks).map(([link, infos]) => {
                    if (link === result['@id']) return;

                    return (
                      <Link
                        href={`/details/${route.details.view}?id=${encodeURIComponent(
                          uriToId(link, {
                            base: route.uriBase,
                          })
                        )}&type=${query.type}`}
                        as={`/${query.type}/${encodeURI(uriToId(link, { base: route.uriBase }))}`}
                        passHref
                      >
                        <a>
                          <StyledMedia
                            title={infos.title}
                            subtitle=""
                            thumbnail={route.imageFunc({ mediaLocator: infos.image })}
                            direction="row"
                          />
                        </a>
                      </Link>
                    );
                  })) || (
                  <StyledMedia title={label} subtitle="" thumbnail={images[0]} direction="row" />
                )}
              </RelatedVideosList>
            </Element>
          </Secondary>
        </Columns>
      </Body>
      <Footer />
    </Layout>
  );
};

export async function getServerSideProps({ req, res, query, locale }) {
  const { result = null, inList, debugSparqlQuery } = await (
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
  const subtitles = [];

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
      videoSegments.sort((a, b) => {
        if (a.startSeconds === b.startSeconds) {
          return a.endSeconds > b.endSeconds ? 1 : -1;
        }
        return a.startSeconds > b.startSeconds ? 1 : -1;
      });
    }

    // ANNOTATIONS
    // Process the annotations
    if (Array.isArray(result.annotation)) {
      result.annotation.forEach((ann) => {
        annotations.push({
          ...ann,
          startSeconds: ann.start,
          endSeconds: ann.end,
          start: secondsToHumanTime(ann.start),
          end: secondsToHumanTime(ann.end),
        });
      });
    }
    // Sort annotations by time
    annotations.sort((a, b) => {
      if (a.startSeconds === b.startSeconds) {
        return a.endSeconds > b.endSeconds ? 1 : -1;
      }
      return a.startSeconds > b.startSeconds ? 1 : -1;
    });

    // FACEREC
    // Get face tracking data
    const resTrack = await (
      await fetch(
        `https://facerec.eurecom.fr/track?video=${encodeURIComponent(
          result['@id']
        )}&project=memad&speedup=25`
      )
    ).json();
    faceTracks = resTrack.tracks || [];
    faceTracks = faceTracks.concat(resTrack.feat_clusters || []);
    faceTracks = faceTracks.filter((track) => track.confidence > 0.7);
    faceTracks.sort((a, b) => (a.start_npt > b.start_npt ? 1 : -1));

    // DEEPCAPTIONS
    // Process the captions
    if (Array.isArray(result.caption)) {
      result.caption.forEach((caption) => {
        captions.push({
          ...caption,
          startSeconds: parseInt(caption.start, 10),
          endSeconds: parseInt(caption.end, 10),
          start: secondsToHumanTime(caption.start),
          end: secondsToHumanTime(caption.end),
        });
      });
    }
    // Sort captions by time
    captions.sort((a, b) => {
      if (a.startSeconds === b.startSeconds) {
        return a.endSeconds > b.endSeconds ? 1 : -1;
      }
      return a.startSeconds > b.startSeconds ? 1 : -1;
    });

    // SUBTITLES
    subtitles.push({
      kind: 'subtitles',
      src: `/api/memad/subtitles?type=programmes&lang=French&id=${encodeURIComponent(
        uriToId(result['@id'], { base: route.uriBase })
      )}`,
      srcLang: 'French',
      default: true,
    });
    subtitles.push({
      kind: 'subtitles',
      src: `/api/memad/subtitles?type=programmes&lang=English&id=${encodeURIComponent(
        uriToId(result['@id'], { base: route.uriBase })
      )}`,
      srcLang: 'English',
    });
  } else if (res) {
    res.statusCode = 404;
  }

  return {
    props: {
      ...await serverSideTranslations(locale, ['common', 'project']),
      result,
      inList,
      mediaUrl,
      videoSegments,
      debugSparqlQuery,
      faceTracks,
      annotations,
      captions,
      subtitles,
    }
  };
};

export default VideoDetailsPage;
