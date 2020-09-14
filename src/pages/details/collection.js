import { useState } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { useRouter } from 'next/router';
import DefaultErrorPage from 'next/error';
import queryString from 'query-string';
import NextAuth from 'next-auth/client';

import { Header, Footer, Layout, Body, Media, Element } from '@components';
import SaveButton from '@components/SaveButton';
import Metadata from '@components/Metadata';
import GraphIcon from '@components/GraphIcon';
import Debug from '@components/Debug';
import PageTitle from '@components/PageTitle';
import { breakpoints } from '@styles';
import { uriToId, absoluteUrl, generateMediaUrl } from '@helpers/utils';
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

const CollectionDetailsPage = ({ result, inList }) => {
  const { t } = useTranslation('common');

  if (!result) {
    return <DefaultErrorPage statusCode={404} title={t('common:errors.resultNotFound')} />;
  }

  const [session] = NextAuth.useSession();

  const { query } = useRouter();
  const route = config.routes[query.type];

  const images = [];
  const representations = Array.isArray(result.representation)
    ? result.representation
    : [result.representation].filter((x) => x);
  representations.forEach((repres) => {
    const imgs = Array.isArray(repres.image) ? repres.image : [repres.image];
    images.push(...imgs.filter((img) => img && new URL(img).hostname === 'silknow.org'));
  });

  const label = route.labelFunc(result);

  result.items = Array.isArray(result.items)
    ? result.items
    : [result.items].filter(
        (x) => x && (typeof x !== 'object' || x.constructor !== Object || Object.keys(x).length > 0)
      );

  const [isItemSaved, setIsItemSaved] = useState(inList);
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
            <h1>{label}</h1>
            <Element marginBottom={12} display="flex" justifyContent="space-between">
              <GraphIcon uri={result['@graph']} />
              {session && (
                <SaveButton
                  type={query.type}
                  item={result}
                  saved={isItemSaved}
                  onChange={onItemSaveChange}
                />
              )}
            </Element>
            <p>{result.description || t('common:collection.noDescription')}</p>
            <h2>{t('common:collection.items')}</h2>
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

                const [itemRouteName, itemRoute] =
                  Object.entries(config.routes).find(([, r]) => {
                    if (Array.isArray(r.rdfType)) {
                      return r.rdfType.includes(item['@type']);
                    }
                    if (typeof r.rdfType === 'string') {
                      return r.rdfType === item['@type'];
                    }
                    return false;
                  }) || [];

                let element = (
                  <StyledMedia
                    key={item['@id']}
                    title={item.label}
                    subtitle=""
                    thumbnail={generateMediaUrl(mainImage, 150)}
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
                      as={`/${itemRouteName}/${encodeURIComponent(
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
            <Debug>
              <Metadata label="HTTP Parameters">
                <pre>{JSON.stringify(query, null, 2)}</pre>
              </Metadata>
              <Metadata label="Query Result">
                <pre>{JSON.stringify(result, null, 2)}</pre>
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

export default CollectionDetailsPage;
