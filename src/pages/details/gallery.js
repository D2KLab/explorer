import { useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import NextAuth from 'next-auth/client';
import DefaultErrorPage from 'next/error';
import queryString from 'query-string';
import { useMenuState, Menu, MenuItem, MenuButton } from 'reakit/Menu';
import { saveAs } from 'file-saver';
import Lightbox from 'react-image-lightbox';

import { Header, Footer, Layout, Body, Element } from '@components';
import Metadata from '@components/Metadata';
import GraphIcon from '@components/GraphIcon';
import Debug from '@components/Debug';
import SaveButton from '@components/SaveButton';
import PageTitle from '@components/PageTitle';
import Button from '@components/Button';
import { breakpoints } from '@styles';
import { absoluteUrl, uriToId, generateMediaUrl } from '@helpers/utils';
import config from '~/config';
import { withTranslation } from '~/i18n';

const { Carousel } = require('react-responsive-carousel');

const Columns = styled.div`
  display: flex;
  max-width: 1024px;
  margin: 0 auto;
  flex-direction: column;
  justify-content: center;
  margin-bottom: 24px;

  ${breakpoints.desktop`
    flex-direction: row;
  `}
`;

const Primary = styled.div`
  flex: auto;
  min-width: 75%;
  padding-right: 24px;
  padding-top: 24px;
  margin-left: 24px;

  display: flex;
  flex-direction: column;

  .carousel {
    &.carousel-slider {
      height: 50vh;
    }
    .thumbs-wrapper {
      overflow: visible;
    }
    .thumbs {
      display: flex;
      flex-wrap: wrap;

      /* TODO: HACK: react-responsive-carousel doesn't support vertical thumbnails as of 2020-04-27 */
      white-space: normal;
      transform: none !important;
    }
    .thumb {
      width: 80px;
      height: 80px;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #fff;

      &.selected,
      &:hover {
        border: 3px solid ${({ theme }) => theme.colors.primary};
      }

      img {
        width: auto;
        height: auto;
        max-width: 100%;
        max-height: 100%;
      }
    }

    .slide {
      background: #d9d9d9;
      display: flex;
      justify-content: center;

      .legend {
        transition: background-color 0.5s ease-in-out;
        background-color: rgba(0, 0, 0, 0.25);
        color: #fff;
        opacity: 1;

        &:hover {
          background-color: #000;
        }
      }

      img {
        width: auto;
        max-width: 100%;
        max-height: 50vh;
      }
    }

    .carousel-status {
      font-size: 16px;
      color: #fff;
      top: 16px;
      left: 16px;
    }

    .control-arrow::before {
      border-width: 0 3px 3px 0;
      border: solid #000;
      display: inline-block;
      padding: 3px;
      border-width: 0 3px 3px 0;
      width: 20px;
      height: 20px;
    }
    .control-next.control-arrow::before {
      transform: rotate(-45deg);
    }
    .control-prev.control-arrow::before {
      transform: rotate(135deg);
    }

    .slider-wrapper {
      display: flex;
      flex-wrap: wrap;
      height: 100%;
    }
  }
`;

const StyledMenu = styled(Menu)`
  background: #fff;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12),
    0 1px 5px 0 rgba(0, 0, 0, 0.2);
  padding: 10px;
  outline: none;
  z-index: 999;
  display: grid;
  grid-gap: 10px;
  position: absolute;
`;

const Secondary = styled.div`
  flex: auto;
  min-width: 25%;
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

const StyledGraphIcon = styled(GraphIcon)`
  margin-bottom: 1em;
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

const VirtualLoomButton = styled.a`
  display: block;
`;

const RelatedVideosList = styled.div``;

function generateValue(currentRouteName, currentRoute, metaName, meta) {
  if (typeof meta !== 'object') {
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

  if (
    currentRoute &&
    currentRoute.metadata &&
    typeof currentRoute.metadata[metaName] === 'function'
  ) {
    url = null;
    printableValue = currentRoute.metadata[metaName](meta);
  } else if (typeof meta.label === 'object') {
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

const GalleryDetailsPage = ({ result, inList, t, i18n }) => {
  const { query } = useRouter();
  const [session] = NextAuth.useSession();
  const route = config.routes[query.type];

  if (!result) {
    return <DefaultErrorPage statusCode={404} title="Result not found" />;
  }

  const images = [];
  const representations = Array.isArray(result.representation)
    ? result.representation
    : [result.representation].filter((x) => x);
  representations.forEach((repres) => {
    const imgs = Array.isArray(repres.image) ? repres.image : [repres.image];
    images.push(...imgs.filter((img) => img && new URL(img).hostname === 'silknow.org'));
  });

  const metadata = Object.entries(result).filter(([metaName]) => {
    return !['@type', '@id', '@graph', 'label', 'representation'].includes(metaName);
  });

  const pageTitle = route.labelFunc(result);

  const [currentSlide, setCurrentSlide] = useState(0);

  const httpToHttps = (url) =>
    typeof url === 'string' ? url.replace(/^http:\/\//i, 'https://') : undefined;

  const generateVirtualLoomData = () => {
    const lang = i18n.language.toUpperCase();
    return {
      language: lang,
      imgUri: httpToHttps(images[currentSlide] || images[0]),
      dimension: {
        x: result.dimension?.width,
        y: result.dimension?.height,
      },
      technique: (Array.isArray(result.technique)
        ? result.technique.map((v) => v.label)
        : [result.technique.label]
      ).filter((x) => x),
      weaving: 'Plain', // @TODO: do not hardcode weaving
      backgroundColor: {
        r: 0.7075471878051758,
        g: 0.2302865833044052,
        b: 0.2302865833044052,
        a: 0.0,
      },
      materials: Array.isArray(result.material)
        ? result.material.map((v) => v.label)
        : [result.material.label].filter((x) => x),
      endpoint: 'http://grlc.eurecom.fr/api-git/silknow/api/',
    };
  };

  const onClickVirtualLoomButton = (e) => {
    e.stopPropagation();

    const data = generateVirtualLoomData();

    const params = [];
    params.push(`lang=${encodeURIComponent(data.language)}`);
    params.push(`data=${encodeURIComponent(JSON.stringify(data))}`);

    const width = 960;
    const height = 720;
    let top = window.screen.height - height;
    top = top > 0 ? top / 2 : 0;
    let left = window.screen.width - width;
    left = left > 0 ? left / 2 : 0;
    const url = `${config.plugins.virtualLoom.url}?${params.join('&')}`;

    const win = window.open(
      url,
      'Virtual Loom',
      `width=${width},height=${height},top=${top},left=${left}`
    );
    win.moveTo(left, top);
    win.focus();
  };

  const downloadMenu = useMenuState();

  const customRenderThumb = (children) => {
    return Carousel.defaultProps.renderThumbs(children).concat(
      <VirtualLoomButton key="virtual-loom" onClick={onClickVirtualLoomButton}>
        <img src="/images/virtual-loom-button.png" alt="Virtual Loom" />
      </VirtualLoomButton>
    );
  };

  const [isItemSaved, setIsItemSaved] = useState(inList);

  const onItemSaveChange = (status) => {
    setIsItemSaved(status);
  };

  const download = (format) => {
    switch (format) {
      case 'vljson': {
        const virtualLoomData = generateVirtualLoomData();
        const blob = new Blob([JSON.stringify(virtualLoomData)], { type: 'application/json' });
        saveAs(blob, `${result.identifier || 'Object'}.${format}`);
        break;
      }
      case 'json': {
        const blob = new Blob([JSON.stringify(result)], { type: 'application/json' });
        saveAs(blob, `${result.identifier || 'Object'}.${format}`);
        break;
      }
      case 'image': {
        const imageUrl = images[currentSlide] || images[0];
        if (imageUrl) {
          const filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
          saveAs(generateMediaUrl(imageUrl, 1024), filename);
        }
        break;
      }
      default:
        break;
    }
  };

  const [lightboxIsOpen, setLightboxIsOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const showLightbox = (index) => {
    setLightboxIndex(Math.min(images.length - 1, Math.max(0, index)));
    setLightboxIsOpen(true);
  };

  return (
    <Layout>
      <PageTitle title={`${pageTitle}`} />
      <Header />
      <Body>
        <Columns>
          <Primary>
            {lightboxIsOpen && (
              <Lightbox
                imageTitle={pageTitle}
                mainSrc={images[lightboxIndex]}
                nextSrc={images[(lightboxIndex + 1) % images.length]}
                prevSrc={images[(lightboxIndex + images.length - 1) % images.length]}
                onCloseRequest={() => setLightboxIsOpen(false)}
                onMovePrevRequest={() =>
                  setLightboxIndex((lightboxIndex + images.length - 1) % images.length)
                }
                onMoveNextRequest={() => setLightboxIndex((lightboxIndex + 1) % images.length)}
              />
            )}

            <MobileTitle>{pageTitle}</MobileTitle>
            <Carousel
              showArrows
              {...config.gallery.options}
              renderThumbs={customRenderThumb}
              onChange={setCurrentSlide}
            >
              {images.map((image, i) => (
                <div key={image} onClick={() => showLightbox(i, pageTitle)} aria-hidden="true">
                  <img src={generateMediaUrl(image, 1024)} alt={pageTitle} />
                  <p className="legend">{pageTitle}</p>
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
            <Title>{pageTitle}</Title>
            <Element marginY={12} display="flex" justifyContent="space-between">
              <StyledGraphIcon uri={result['@graph']} />
              {session && (
                <SaveButton
                  type={query.type}
                  item={result}
                  saved={isItemSaved}
                  onChange={onItemSaveChange}
                />
              )}
            </Element>
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
            <Element>
              <MenuButton {...downloadMenu} as={Button} primary>
                Download
              </MenuButton>
              <StyledMenu {...downloadMenu} aria-label="Download">
                <MenuItem {...downloadMenu} as={Button} primary onClick={() => download('vljson')}>
                  Virtual Loom
                </MenuItem>
                <MenuItem {...downloadMenu} as={Button} primary onClick={() => download('json')}>
                  Linked Data JSON
                </MenuItem>
                <MenuItem {...downloadMenu} as={Button} primary onClick={() => download('image')}>
                  Download selected image
                </MenuItem>
              </StyledMenu>
            </Element>
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

GalleryDetailsPage.getInitialProps = async ({ req, res, query }) => {
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

  if (!result && res) {
    res.statusCode = 404;
  }

  return { result, inList };
};

export default withTranslation('common')(GalleryDetailsPage);
