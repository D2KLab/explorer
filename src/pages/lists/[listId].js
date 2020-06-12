import styled, { withTheme } from 'styled-components';
import { useState } from 'react';
import Link from 'next/link';
import Router from 'next/router';
import { useDialogState, DialogDisclosure } from 'reakit/Dialog';
import Moment from 'react-moment';

import { uriToId, generateMediaUrl } from '@helpers/utils';
import {
  Header,
  Footer,
  Layout,
  Body,
  Content,
  Title,
  Media,
  Navbar,
  NavItem,
  Element,
} from '@components';
import Button from '@components/Button';
import ListSettings from '@components/ListSettings';
import ListDeletion from '@components/ListDeletion';
import PageTitle from '@components/PageTitle';
import config from '~/config';

const sparqlTransformer = require('sparql-transformer').default;

const StyledMedia = styled(Media)`
  margin-left: var(--card-margin);
  margin-right: var(--card-margin);
`;

const Results = styled.div`
  display: flex;
  flex-wrap: wrap;

  --card-margin: 12px;
  margin: 0 calc(-1 * var(--card-margin));
`;

export default withTheme(({ isOwner, list, shareLink, error, theme }) => {
  const renderListItems = () => {
    return (
      <Element marginY={24}>
        <h2>Items in the list</h2>
        <Element marginY={12}>
          {list.items.length > 0 ? (
            <Results>
              {list.items.map((item) => {
                const [, route] =
                  Object.entries(config.routes).find(([routeName]) => {
                    return routeName === item.route;
                  }) || [];

                return (
                  <Link
                    key={item.id}
                    href={`/details/${route.details.view}?id=${uriToId(item.id, {
                      encoding: !route.uriBase,
                    })}&type=${item.route}`}
                    as={`/${item.route}/${uriToId(item.id, { encoding: !route.uriBase })}`}
                    passHref
                  >
                    <a>
                      <StyledMedia
                        title={item.title}
                        subtitle={item.subtitle}
                        thumbnail={generateMediaUrl(item.image, 150)}
                        direction="column"
                        link={`/${item.route}/${uriToId(item.id, { encoding: !route.uriBase })}`}
                        uri={item.graph}
                      />
                    </a>
                  </Link>
                );
              })}
            </Results>
          ) : (
            <p>This list is empty!</p>
          )}
        </Element>
      </Element>
    );
  };

  const renderOperations = () => {
    if (!isOwner) {
      return null;
    }

    const deleteListDialog = useDialogState();

    return (
      <Element marginY={24}>
        <h2>Operations</h2>
        <Element marginY={12}>
          <ListDeletion list={list} dialogState={deleteListDialog} />
        </Element>
      </Element>
    );
  };

  return (
    <Layout>
      <Header />
      <Body>
        {(list && (
          <>
            <PageTitle title={list.name} />
            <Content>
              <Navbar>
                <NavItem>
                  <h1>{list.name}</h1>
                </NavItem>
                <NavItem>{isOwner && <ListSettings list={list} />}</NavItem>
              </Navbar>
              <Element>
                <p>
                  Created on: <Moment format="DD/MM/YYYY">{list.created_at}</Moment>
                </p>
                <p>
                  Last update: <Moment format="DD/MM/YYYY">{list.updated_at}</Moment>
                </p>
              </Element>
              {isOwner && (
                <>
                  <p>
                    This list is <strong>{list.is_public ? 'public' : 'private'}</strong>.
                  </p>
                  {list.is_public && (
                    <p>
                      Public link: <a href={shareLink}>{shareLink}</a>
                    </p>
                  )}
                </>
              )}
              {renderListItems()}
              {renderOperations()}
            </Content>
          </>
        )) || (
          <>
            <PageTitle title={error.message} />
            <Title>List not found</Title>
            <Content>
              <p>{error.message}</p>
            </Content>
          </>
        )}
      </Body>
      <Footer />
    </Layout>
  );
};

export async function getServerSideProps({ req, res, query }) {
  // Fetch the list
  const listApiRes = await fetch(`${process.env.SITE}/api/lists/${query.listId}`, {
    headers: {
      cookie: req.headers.cookie,
    },
  });
  const list = await listApiRes.json();

  if (list.error) {
    // List not found
    res.statusCode = 404;
    return {
      props: {
        error: list.error,
      },
    };
  }

  // Get current user
  const userApiRes = await fetch(`${process.env.SITE}/api/profile`, {
    headers: {
      cookie: req.headers.cookie,
    },
  });
  const user = await userApiRes.json();

  const isOwner = user && list.user === user._id;

  if (!list.is_public && !isOwner) {
    res.setHeader('location', '/auth/signin');
    res.statusCode = 302;
    res.end();
    return { props: {} };
  }

  // Get details (title, image, ...) for each item in the list
  for (let i = 0; i < list.items.length; i += 1) {
    const item = list.items[i];
    const [routeName, route] =
      Object.entries(config.routes).find(([, r]) => {
        return r.uriBase && item.startsWith(r.uriBase);
      }) || [];

    if (route) {
      const searchQuery = JSON.parse(JSON.stringify(route.query));
      searchQuery.$filter = `?id = <${item}>`;

      try {
        if (config.debug) {
          console.log('searchQuery:', JSON.stringify(searchQuery, null, 2));
        }
        const res = await sparqlTransformer(searchQuery, {
          endpoint: config.api.endpoint,
          debug: config.debug,
        });
        const result = res['@graph'][0];

        let mainImage = null;
        if (result.representation && result.representation.image) {
          mainImage = Array.isArray(result.representation.image)
            ? result.representation.image.shift()
            : result.representation.image;
        } else if (Array.isArray(result.representation)) {
          mainImage =
            result.representation[0].image ||
            result.representation[0]['@id'] ||
            result.representation[0];
        }
        const label = route.labelFunc(result);

        list.items[i] = {
          id: result['@id'],
          title: label,
          subtitle: result.time && result.time.label ? result.time.label : '',
          image: mainImage,
          graph: result['@graph'],
          route: routeName,
        };
      } catch (err) {
        console.error(err);
      }
    }
  }

  return {
    props: {
      list,
      isOwner,
      shareLink: `${process.env.SITE}/lists/${list._id}`,
    },
  };
}
