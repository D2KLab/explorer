import { useState } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { useRouter } from 'next/router';
import DefaultErrorPage from 'next/error';
import queryString from 'query-string';
import NextAuth from 'next-auth/client';

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
import MetadataList from '@components/MetadataList';
import breakpoints from '@styles/breakpoints';
import { uriToId, absoluteUrl, generateMediaUrl } from '@helpers/utils';
import { findRouteByRDFType, getEntityMainLabel } from '@helpers/explorer';
import config from '~/config';
import { useTranslation } from '~/i18n';

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

const LegalBody = styled.small`
  margin-left: 8px;
`;

const CollectionDetailsPage = ({ result, inList, debugSparqlQuery }) => {
  const { t, i18n } = useTranslation(['common']);
  const [session] = NextAuth.useSession();
  const { query } = useRouter();
  const [isItemSaved, setIsItemSaved] = useState(inList);

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

  const onItemSaveChange = (status) => {
    setIsItemSaved(status);
  };

  return (
    <Layout>
      <PageTitle title={`${label}`} />
      <Header />
      <Body>
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
              <GraphLink uri={result['@graph']} icon label />
              {result.legalBody && (
                <LegalBody>
                  {Array.isArray(result.legalBody)
                    ? result.legalBody.map((body) => body.label)
                    : result.legalBody.label}
                </LegalBody>
              )}
            </Element>
            <p>{result.description || t('common:collection.noDescription')}</p>
            <Element marginBottom={24}>
              <MetadataList metadata={result} query={query} route={route} />
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
                      passHref
                    >
                      <a>{element}</a>
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
};

CollectionDetailsPage.getInitialProps = async ({ req, res, query }) => {
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

  if (!result && res) {
    res.statusCode = 404;
  }

  return {
    result,
    inList,
    debugSparqlQuery,
    namespacesRequired: ['common'],
  };
};

export default CollectionDetailsPage;
