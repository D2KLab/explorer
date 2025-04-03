import 'yet-another-react-lightbox/styles.css';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Menu, MenuItem, MenuButton, MenuButtonArrow, useMenuStore } from '@ariakit/react';
import { saveAs } from 'file-saver';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import styled from 'styled-components';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';

import Body from '@components/Body';
import Button from '@components/Button';
import Debug from '@components/Debug';
import Element from '@components/Element';
import Footer from '@components/Footer';
import GraphLink from '@components/GraphLink';
import Header from '@components/Header';
import Layout from '@components/Layout';
import Metadata from '@components/Metadata';
import MetadataList from '@components/MetadataList';
import PageTitle from '@components/PageTitle';
import Pagination from '@components/Pagination';
import SaveButton from '@components/SaveButton';
import SPARQLQueryLink from '@components/SPARQLQueryLink';
import { generatePermalink, getEntityMainLabel, getSearchData } from '@helpers/explorer';
import { generateMediaUrl } from '@helpers/utils';
import NotFoundPage from '@pages/404';
import { getEntity, getEntityDebugQuery, isEntityInList } from '@pages/api/entity';
import breakpoints from '@styles/breakpoints';
import config from '~/config';

const Columns = styled.div`
  display: flex;
  width: 100%;
  margin: 0 auto;
  flex-direction: column;
  justify-content: center;
  margin-bottom: 24px;

  ${breakpoints.desktop`
    flex-direction: row;
    padding: 0 2em;
  `}
`;

const Primary = styled.div`
  flex: auto;
  min-width: 50%;
  padding-right: 24px;
  padding-top: 24px;
  margin-left: 24px;

  display: flex;
  flex-direction: column;

  .carousel-root {
    display: flex;
  }
  .carousel {
    width: auto;

    &.carousel-slider {
      min-height: 50vh;
    }
    .thumbs {
      /* For vertical thumbs */
      display: flex;
      flex-direction: column;
      transform: none !important;
    }
    .thumbs-wrapper {
      overflow: visible;
      margin-top: 0;
      margin-bottom: 0;

      .control-arrow {
        display: none;
      }
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

      .subtitle {
        white-space: pre-line;
        text-align: left;
        padding: 0.5em 1em;
      }

      img {
        width: auto;
        max-width: 100%;
        max-height: 50vh;
        pointer-events: auto;
      }
    }

    .carousel-status {
      font-size: inherit;
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
  box-shadow:
    0 2px 2px 0 rgba(0, 0, 0, 0.14),
    0 3px 1px -2px rgba(0, 0, 0, 0.12),
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
  padding: 24px 24px 0 24px;

  ${breakpoints.desktop`
    margin-left: 0;
  `}
`;

const Tertiary = styled.div`
  flex: auto;
  min-width: 25%;
  padding: 24px 24px 0 24px;

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
  margin-bottom: 24px;
  display: none;

  ${breakpoints.desktop`
    display: block;
  `}
`;

const MobileContainer = styled.div`
  margin-bottom: 24px;
  display: block;

  ${breakpoints.desktop`
    display: none;
  `};
`;

const Description = styled.div`
  white-space: pre-line;
`;

function GalleryDetailsPage({ result, inList, searchData, debugSparqlQuery }) {
  const { t, i18n } = useTranslation(['common', 'project']);
  const router = useRouter();
  const { query } = router;
  const route = config.routes[query.type];
  const [currentSlide, setCurrentSlide] = useState(0);
  const downloadMenu = useMenuStore();
  const [lightboxIsOpen, setLightboxIsOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  if (!result) {
    return (
      <>
        <NotFoundPage text={t('common:errors.resultNotFound')}>
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
        </NotFoundPage>
        ;
      </>
    );
  }

  const images = [];
  const representations = Array.isArray(result.representation)
    ? result.representation
    : [result.representation].filter((x) => x);
  representations.forEach((repres) => {
    const imgs = Array.isArray(repres.image) ? repres.image : [repres.image];
    imgs.forEach((img) => {
      images.push({
        id: repres['@id'],
        url: img,
        label: repres.label,
      });
    });
  });

  const pageTitle = getEntityMainLabel(result, { route, language: i18n.language });

  const download = (format) => {
    switch (format) {
      case 'json': {
        const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
        saveAs(blob, `${result.identifier || 'Object'}.${format}`);
        break;
      }
      case 'image': {
        const imageUrl = images[currentSlide]?.url || images[0]?.url;
        if (imageUrl) {
          const filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
          saveAs(imageUrl, filename);
        }
        break;
      }
      default:
        break;
    }
  };

  const onItemSaveChange = () => {
    router.replace(router.asPath);
  };

  const showLightbox = (index) => {
    setLightboxIndex(Math.min(images.length - 1, Math.max(0, index)));
    setLightboxIsOpen(true);
  };

  return (
    <Layout>
      <PageTitle title={`${pageTitle}`} />
      <Header />
      <Body>
        <Pagination searchData={searchData} result={result} />
        <Columns>
          {images.length > 0 && (
            <Primary>
              <Lightbox
                index={lightboxIndex}
                open={lightboxIsOpen}
                close={() => setLightboxIsOpen(false)}
                slides={images.map((image) => ({
                  src: generateMediaUrl(image.url, 1024),
                  title: image.label,
                  description: image.description,
                }))}
                controller={{
                  closeOnBackdropClick: true,
                  closeOnPullDown: true,
                  closeOnPullUp: true,
                }}
                plugins={[Zoom]}
              />

              <MobileContainer>
                <Title>{pageTitle}</Title>
                <Element
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  marginY={12}
                >
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
                      <a
                        href={generatePermalink(result['@id'])}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t('common:buttons.permalink')}
                      </a>
                      )
                    </small>
                  )}
                  <SaveButton
                    type={query.type}
                    item={result}
                    saved={inList}
                    onChange={onItemSaveChange}
                  />
                </Element>
              </MobileContainer>
              <Carousel showArrows {...config.gallery.options} onChange={setCurrentSlide}>
                {images.map((image, i) => (
                  <div
                    key={image.url}
                    onClick={() => showLightbox(i, image.label)}
                    aria-hidden="true"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={generateMediaUrl(image.url, 1024)} alt={image.label} />
                    {image.description && <p className="legend">{image.description}</p>}
                    {image.label && (
                      <div className="subtitle">
                        {Array.isArray(image.label) ? image.label.join('\n') : image.label}
                      </div>
                    )}
                  </div>
                ))}
              </Carousel>
            </Primary>
          )}
          <Secondary>
            <DesktopContainer marginBottom={24}>
              <Title>{pageTitle}</Title>
              <Element
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                marginY={12}
              >
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
                    <a
                      href={generatePermalink(result['@id'])}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t('common:buttons.permalink')}
                    </a>
                    )
                  </small>
                )}
                <SaveButton
                  type={query.type}
                  item={result}
                  saved={inList}
                  onChange={onItemSaveChange}
                />
              </Element>
            </DesktopContainer>
            <Element marginBottom={12} display="flex">
              <GraphLink uri={result['@graph']} icon label />
            </Element>
            <Element marginBottom={24}>
              <MetadataList metadata={result} type={query.type} />
            </Element>
            <Element marginBottom={24}>
              <MenuButton store={downloadMenu} as={Button} primary>
                {t('common:buttons.download')} <MenuButtonArrow />
              </MenuButton>
              <StyledMenu store={downloadMenu} aria-label={t('common:buttons.download')}>
                <MenuItem store={downloadMenu} as={Button} primary onClick={() => download('json')}>
                  {t('common:buttons.downloadJSON')}
                </MenuItem>
                <MenuItem
                  store={downloadMenu}
                  as={Button}
                  primary
                  onClick={() => download('image')}
                >
                  {t('common:buttons.downloadSelectedImage')}
                </MenuItem>
              </StyledMenu>
            </Element>
          </Secondary>
          <Tertiary>
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
          </Tertiary>
        </Columns>
      </Body>
      <Footer />
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const { req, res, query, locale } = context;

  const result = await getEntity(query, locale);
  const inList = await isEntityInList(result?.['@id'], query, req, res);
  const debugSparqlQuery = await getEntityDebugQuery(query, locale);

  const searchData = await getSearchData(context);

  if (!result && res) {
    res.statusCode = 404;
  }

  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'project', 'search'])),
      result,
      inList,
      searchData,
      debugSparqlQuery,
    },
  };
}

export default GalleryDetailsPage;
