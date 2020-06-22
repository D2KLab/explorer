import styled from 'styled-components';
import Link from 'next/link';
import { useRouter } from 'next/router';
import DefaultErrorPage from 'next/error';
import NextAuth from 'next-auth/client';

import { Header, Footer, Layout, Body, Media } from '@components';
import Metadata from '@components/Metadata';
import Debug from '@components/Debug';
import PageTitle from '@components/PageTitle';
import { breakpoints } from '@styles';
import { uriToId, idToUri, generateMediaUrl } from '@helpers/utils';
import SparqlClient from '@helpers/sparql';
import config from '~/config';
import { withTranslation } from '~/i18n';

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

  p {
    margin-bottom: 1em;
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

const CollectionDetailsPage = ({ result }) => {
  if (!result) {
    return <DefaultErrorPage statusCode={404} title="Result not found" />;
  }

  const { query } = useRouter();
  const [session] = NextAuth.useSession();
  const route = config.routes[query.type];

  const images = [];
  const representations = Array.isArray(result.representation)
    ? result.representation
    : [result.representation].filter((x) => x);
  representations.forEach((repres) => {
    const imgs = Array.isArray(repres.image) ? repres.image : [repres.image];
    images.push(...imgs.filter((img) => img && new URL(img).hostname === 'silknow.org'));
  });

  const metadata = Object.entries(result).filter(([metaName, meta]) => {
    return !['@type', '@id', '@graph', 'label', 'representation'].includes(metaName);
  });

  const label = route.labelFunc(result);

  result.items = Array.isArray(result.items)
    ? result.items
    : [result.items].filter(
        (x) => x && (typeof x !== 'object' || x.constructor !== Object || Object.keys(x).length > 0)
      );

  return (
    <Layout>
      <PageTitle title={`${label}`} />
      <Header />
      <Body>
        <Columns>
          <Primary>
            <h1>{label}</h1>
            <p>{result.description || 'No description for this collection'}</p>
            <h2>Items in the collection</h2>
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
                    return r.rdfType && r.rdfType === item['@type'];
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
                      href={`/details/${itemRoute.details.view}?id=${uriToId(item['@id'], {
                        encoding: !itemRoute.uriBase,
                      })}&type=${itemRouteName}`}
                      as={`/${itemRouteName}/${uriToId(item['@id'], {
                        encoding: !itemRoute.uriBase,
                      })}`}
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
          <Secondary />
        </Columns>
      </Body>
      <Footer />
    </Layout>
  );
};

CollectionDetailsPage.getInitialProps = async ({ query }) => {
  const route = config.routes[query.type];
  const jsonQuery = route.details && route.details.query ? route.details.query : route.query;
  const searchQuery = JSON.parse(JSON.stringify(jsonQuery));
  searchQuery.$filter = `?id = <${idToUri(query.id, {
    base: route.uriBase,
    encoding: !route.uriBase,
  })}>`;

  try {
    const res = await SparqlClient.query(searchQuery, {
      endpoint: config.api.endpoint,
      debug: config.debug,
    });
    const result = res['@graph'][0];
    if (!result) {
      res.statusCode = 404;
    }
    return { result };
  } catch (err) {
    console.error(err);
  }

  return { result: null };
};

export default withTranslation()(CollectionDetailsPage);
