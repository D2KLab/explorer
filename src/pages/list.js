import { useState } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { useRouter } from 'next/router';

import Header from '@components/Header';
import Footer from '@components/Footer';
import Layout from '@components/Layout';
import Body from '@components/Body';
import Input from '@components/Input';
import Element from '@components/Element';
import PageTitle from '@components/PageTitle';
import GraphIcon from '@components/GraphIcon';
import Metadata from '@components/Metadata';
import Debug from '@components/Debug';
import SPARQLQueryLink from '@components/SPARQLQueryLink';
import breakpoints from '@styles/breakpoints';
import SparqlClient from '@helpers/sparql';
import { getQueryObject } from '@helpers/utils';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
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

const Results = styled.div``;

const Item = styled.li`
  font-size: 1.5em;
  margin: 1em 0;
`;

const ListDetailsPage = ({ items, debugSparqlQuery }) => {
  const { t } = useTranslation(['common', 'project']);
  const { query } = useRouter();

  const route = config.routes[query.type];

  const useWith = [];
  if (route && Array.isArray(route.useWith)) {
    useWith.push(...route.useWith);
  }

  const getUseWithLink = (withConfig, item) => {
    if (!withConfig || !item) {
      return '';
    }

    const withRoute = config.routes[withConfig.route];
    if (!withRoute) {
      return '';
    }
    const withQuery = {};
    const filter = withRoute.filters.find((f) => f.id && f.id === withConfig.filter);
    if (filter) {
      const val = filter.isMulti ? [item['@id']] : item['@id'];
      withQuery[`field_filter_${filter.id}`] = val;
    } else {
      withQuery[withConfig.filter] = item['@id'] || item.label;
    }

    return { pathname: `/${withConfig.route}`, query: withQuery };
  };

  const [itemSearch, setItemSearch] = useState('');

  const handleInputChange = (ev) => {
    setItemSearch(ev.target.value);
  };

  const filteredItems = items.filter(
    (item) => item.label.toLocaleLowerCase().indexOf(itemSearch.toLocaleLowerCase()) > -1
  );
  filteredItems.sort((a, b) => typeof a.label === 'string' && a.label.localeCompare(b.label));

  return (
    <Layout>
      <PageTitle title={`${t(`project:routes.${query.type}`)}`} />
      <Header />
      <Body>
        <Columns>
          <Primary>
            <Element marginBottom={24}>
              <h1>{t(`project:routes.${query.type}`)}</h1>
            </Element>
            <Element marginBottom={24}>
              <h4>Search for an item</h4>
              <Input
                id="q"
                name="q"
                type="search"
                value={itemSearch}
                onChange={handleInputChange}
              />
            </Element>
            <h2>{t('common:listing.items', { count: filteredItems.length })}</h2>
            <Results>
              <ul>
                {filteredItems.map((item) => (
                    <Item>
                      <Link href={getUseWithLink(useWith[0], item)} passHref>
                        <a>
                          <GraphIcon uri={item['@id']} style={{ marginRight: '1em' }} />
                          <span>{item.label}</span>
                        </a>
                      </Link>
                    </Item>
                  ))}
              </ul>
            </Results>
            <Debug>
              <Metadata label="HTTP Parameters">
                <pre>{JSON.stringify(query, null, 2)}</pre>
              </Metadata>
              <Metadata label="Query Results">
                <pre>{JSON.stringify(items, null, 2)}</pre>
              </Metadata>
              <Metadata label="Results SPARQL Query">
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

export async function getServerSideProps({ query, req, locale }) {
  const route = config.routes[query.type];
  const items = [];
  let debugSparqlQuery = null;

  if (Array.isArray(route.items)) {
    items.push(...(route.items || []));
  }

  if (route.query) {
    const listQuery = getQueryObject(route.query, { language: req?.language });

    if (config.debug) {
      debugSparqlQuery = await SparqlClient.getSparqlQuery(listQuery);
    }

    // Execute the query
    const res = await SparqlClient.query(listQuery, {
      endpoint: config.api.endpoint,
      debug: config.debug,
    });
    if (res) {
      items.push(...res['@graph']);
    }
  }

  return {
    props: {
      ...await serverSideTranslations(locale, ['common', 'project']),
      items,
      debugSparqlQuery,
    }
  };
};

export default ListDetailsPage;
