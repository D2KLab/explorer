import styled from 'styled-components';
import Link from 'next/link';
import { useRouter } from 'next/router';
import DefaultErrorPage from 'next/error';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import Header from '@components/Header';
import Footer from '@components/Footer';
import Layout from '@components/Layout';
import Body from '@components/Body';
import Media from '@components/Media';
import Element from '@components/Element';
import Metadata from '@components/Metadata';
import Debug from '@components/Debug';
import PageTitle from '@components/PageTitle';
import SaveButton from '@components/SaveButton';
import SPARQLQueryLink from '@components/SPARQLQueryLink';
import GraphLink from '@components/GraphLink';
import MetadataList from '@components/MetadataList';
import Pagination from '@components/Pagination';
import breakpoints from '@styles/breakpoints';
import { uriToId, generateMediaUrl } from '@helpers/utils';
import {
  findRouteByRDFType,
  generatePermalink,
  getEntityMainLabel,
  getSearchData,
} from '@helpers/explorer';
import { getEntity, getEntityDebugQuery, isEntityInList } from '@pages/api/entity';
import config from '~/config';

const Columns = styled.div`
  display: flex;
  max-width: 1024px;
  width: 100%;
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

  p {
    margin-bottom: 1em;
  }
`;

const Results = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, 150px);
  grid-gap: 1rem;
  margin-bottom: 24px;
`;

const StyledMedia = styled(Media)`
  margin-left: var(--card-margin);
  margin-right: var(--card-margin);
`;

const Description = styled.div`
  white-space: pre-line;
`;

function CollectionDetailsPage({ result, inList, searchData, debugSparqlQuery }) {
  const { t, i18n } = useTranslation(['common', 'project']);
  const router = useRouter();
  const { query } = router;

  if (!result) {
    return <DefaultErrorPage statusCode={404} title={t('common:errors.resultNotFound')} />;
  }

  const route = config.routes[query.type];

  const images = [];
  const representations = Array.isArray(result.representation)
    ? result.representation
    : [result.representation].filter((x) => x);
  representations.forEach((repres) => {
    const imgs = Array.isArray(repres.image) ? repres.image : [repres.image];
    images.push(...imgs.filter((img) => img && new URL(img).hostname === 'silknow.org'));
  });

  const label = getEntityMainLabel(result, { route, language: i18n.language });

  result.items = Array.isArray(result.items)
    ? result.items
    : [result.items].filter(
        (x) => x && (typeof x !== 'object' || x.constructor !== Object || Object.keys(x).length > 0)
      );

  const onItemSaveChange = () => {
    router.replace(router.asPath);
  };

  return (
    <Layout>
      <PageTitle title={`${label}`} />
      <Header />
      <Body>
        <Pagination searchData={searchData} result={result} />
        <Columns>
          <Primary>
            <Element marginBottom={24}>
              <h1>{label}</h1>
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
            </Element>
            <Element marginBottom={12} display="flex">
              <GraphLink uri={result['@graph']} icon label />
            </Element>
            <p>{result.description || t('common:collection.noDescription')}</p>
            <Element marginBottom={24}>
              <MetadataList metadata={result} type={query.type} />
            </Element>
            <h2>{t('common:collection.items', { count: result.items.length })}</h2>
            <Results>
              {result.items.map((item) => {
                let mainImage = null;
                if (item.representation && item.representation.image) {
                  mainImage = Array.isArray(item.representation.image)
                    ? item.representation.image.shift()
                    : item.representation.image;
                } else if (Array.isArray(item.representation)) {
                  mainImage =
                    item.representation[0].image ||
                    item.representation[0]['@id'] ||
                    item.representation[0];
                }

                const [itemRouteName, itemRoute] = findRouteByRDFType(item['@type']);

                const itemLabel = getEntityMainLabel(item, { route, language: i18n.language });

                let element = (
                  <StyledMedia
                    key={item['@id']}
                    title={itemLabel}
                    subtitle=""
                    thumbnail={generateMediaUrl(mainImage, 300)}
                    direction="column"
                    uri={result['@graph']}
                  />
                );

                if (itemRoute) {
                  // Wrap the element around a link
                  element = (
                    <Link
                      key={item['@id']}
                      href={`/details/${itemRoute.details.view}?id=${encodeURIComponent(
                        uriToId(item['@id'], {
                          base: itemRoute.uriBase,
                        })
                      )}&type=${itemRouteName}`}
                      as={`/${itemRouteName}/${encodeURI(
                        uriToId(item['@id'], {
                          base: itemRoute.uriBase,
                        })
                      )}`}
                    >
                      {element}
                    </Link>
                  );
                }

                return element;
              })}
            </Results>

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

  if (!result && res) {
    res.statusCode = 404;
  }

  const searchData = await getSearchData(context);

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

export default CollectionDetailsPage;
