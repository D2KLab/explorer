import { useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import queryString from 'query-string';
import { useMenuState, Menu, MenuItem, MenuButton, MenuButtonArrow } from 'ariakit';
import { saveAs } from 'file-saver';
import Lightbox from 'react-18-image-lightbox';
import 'react-18-image-lightbox/style.css';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import Cookies from 'js-cookie';

import NotFoundPage from '@pages/404';
import Header from '@components/Header';
import Footer from '@components/Footer';
import Layout from '@components/Layout';
import Body from '@components/Body';
import Button from '@components/Button';
import Element from '@components/Element';
import Metadata from '@components/Metadata';
import Debug from '@components/Debug';
import PageTitle from '@components/PageTitle';
import SPARQLQueryLink from '@components/SPARQLQueryLink';
import GraphLink from '@components/GraphLink';
import MetadataList from '@components/MetadataList';
import SaveButton from '@components/SaveButton';
import Pagination from '@components/Pagination';
import breakpoints from '@styles/breakpoints';
import { absoluteUrl, generateMediaUrl, uriToId } from '@helpers/utils';
import { generatePermalink, getEntityMainLabel, getSearchData } from '@helpers/explorer';
import { useTranslation } from 'next-i18next';
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
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const downloadMenu = useMenuState();
  const similarityMenu = useMenuState();
  const virtualLoomMenu = useMenuState();
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

  const generateVirtualLoomData = () => {
    const lang = i18n.language.toUpperCase();
    return {
      language: lang,
      imgUri: images[currentSlide]?.url || images[0]?.url,
      dimension: {
        x: result.dimension?.width,
        y: result.dimension?.height,
      },
      technique: (Array.isArray(result.technique)
        ? result.technique.map((v) => v.label)
        : [result?.technique?.label]
      )
        .filter((x) => x)
        .filter((x) => x),
      weaving: 'Plain', // @TODO: do not hardcode weaving
      backgroundColor: {
        r: 0.7075471878051758,
        g: 0.2302865833044052,
        b: 0.2302865833044052,
        a: 0.0,
      },
      materials: Array.isArray(result.material)
        ? result.material.map((v) => v.label)
        : [result?.material?.label].filter((x) => x),
      endpoint: 'http://grlc.eurecom.fr/api-git/silknow/api/',
      analytics: Cookies.get('consent') === '1',
    };
  };

  const generateVirtualLoomURL = () => {
    const data = generateVirtualLoomData();
    const params = [];
    params.push(`lang=${encodeURIComponent(data.language)}`);
    params.push(`data=${encodeURIComponent(JSON.stringify(data))}`);
    const url = `${config.plugins.virtualLoom.url}?${params.join('&')}`;
    return url;
  };

  const onClickVirtualLoomButton = (e) => {
    e.stopPropagation();

    const width = 960;
    const height = 720;
    let top = window.screen.height - height;
    top = top > 0 ? top / 2 : 0;
    let left = window.screen.width - width;
    left = left > 0 ? left / 2 : 0;

    const url = generateVirtualLoomURL();
    const win = window.open(
      url,
      'Virtual Loom',
      `width=${width},height=${height},top=${top},left=${left}`
    );
    win.moveTo(left, top);
    win.focus();
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

  const viewSimilar = async (similarity) => {
    similarityMenu.hide();
    setIsLoadingSimilar(true);

    const params = new URLSearchParams();
    params.append('type', 'object');
    params.append('similarity_type', similarity);
    params.append('similarity_entity', uriToId(result['@id'], { base: route.uriBase }));
    router.push(`/${config.search.route}?${params.toString()}`);
  };

  const customRenderThumb = (children) => {
    if (!config.plugins?.virtualLoom?.url) return;
    return Carousel.defaultProps.renderThumbs(children).concat(
      <Element key="virtual-loom">
        <MenuButton state={virtualLoomMenu}>
          <img src="/images/virtual-loom-button.png" alt="Virtual Loom" />
        </MenuButton>
        <StyledMenu
          state={virtualLoomMenu}
          aria-label="Virtual Loom"
          style={{ position: 'absolute', left: 0 }}
        >
          <MenuItem state={virtualLoomMenu} as={Button} primary onClick={onClickVirtualLoomButton}>
            {t('common:buttons.virtualLoom.web')}
          </MenuItem>
          <MenuItem
            state={virtualLoomMenu}
            as={Button}
            primary
            href={generateVirtualLoomURL().replace(/^https?:\/\//, 'vloom://')}
          >
            {t('common:buttons.virtualLoom.desktop')}
          </MenuItem>
        </StyledMenu>
      </Element>
    );
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
              {lightboxIsOpen && (
                <Lightbox
                  imageTitle={images[lightboxIndex]?.label || pageTitle}
                  mainSrc={images[lightboxIndex]?.url}
                  nextSrc={images[(lightboxIndex + 1) % images.length]?.url}
                  prevSrc={images[(lightboxIndex + images.length - 1) % images.length]?.url}
                  onCloseRequest={() => setLightboxIsOpen(false)}
                  onMovePrevRequest={() =>
                    setLightboxIndex((lightboxIndex + images.length - 1) % images.length)
                  }
                  onMoveNextRequest={() => setLightboxIndex((lightboxIndex + 1) % images.length)}
                />
              )}

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
              <Carousel
                showArrows
                {...config.gallery.options}
                renderThumbs={customRenderThumb}
                onChange={setCurrentSlide}
              >
                {images.map((image, i) => (
                  <div
                    key={image.url}
                    onClick={() => showLightbox(i, image.label)}
                    aria-hidden="true"
                  >
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
              <MetadataList metadata={result} query={query} route={route} />
            </Element>
            <Element marginBottom={24}>
              <MenuButton state={downloadMenu} as={Button} primary>
                {t('common:buttons.download')} <MenuButtonArrow />
              </MenuButton>
              <StyledMenu state={downloadMenu} aria-label={t('common:buttons.download')}>
                <MenuItem
                  state={downloadMenu}
                  as={Button}
                  primary
                  onClick={() => download('vljson')}
                >
                  {t('common:buttons.virtualLoom.download')}
                </MenuItem>
                <MenuItem state={downloadMenu} as={Button} primary onClick={() => download('json')}>
                  {t('common:buttons.downloadJSON')}
                </MenuItem>
                <MenuItem
                  state={downloadMenu}
                  as={Button}
                  primary
                  onClick={() => download('image')}
                >
                  {t('common:buttons.downloadSelectedImage')}
                </MenuItem>
              </StyledMenu>
            </Element>
            <Element>
              <MenuButton state={similarityMenu} as={Button} primary loading={isLoadingSimilar}>
                {t('common:buttons.similar')} <MenuButtonArrow />
              </MenuButton>
              <StyledMenu state={similarityMenu} aria-label={t('common:buttons.similar')}>
                <MenuItem
                  state={similarityMenu}
                  as={Button}
                  primary
                  onClick={() => viewSimilar('visual')}
                >
                  {t('common:similarity.visual')}
                </MenuItem>
                <MenuItem
                  state={similarityMenu}
                  as={Button}
                  primary
                  onClick={() => viewSimilar('semantic')}
                >
                  {t('common:similarity.semantic')}
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

  const {
    result = null,
    inList = false,
    debugSparqlQuery,
  } = await (
    await fetch(`${absoluteUrl(req)}/api/entity?${queryString.stringify(query)}`, {
      headers: {
        ...req.headers,
        'accept-language': locale,
      },
    })
  ).json();

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
