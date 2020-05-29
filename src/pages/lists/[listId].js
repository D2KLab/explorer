import styled from 'styled-components';
import { useState } from 'react';
import { Helmet } from 'react-helmet';
import Link from 'next/link';
import fetch from 'isomorphic-unfetch';
import Router from 'next/router';

import { uriToId } from '@helpers/utils';
import { Header, Footer, Layout, Body, Content, Title, Paragraph, Media } from '@components';
import Button from '@components/Button';
import config from '~/config';

const sparqlTransformer = require('sparql-transformer').default;

const StyledMedia = styled(Media)`
  margin-left: var(--card-margin);
  margin-right: var(--card-margin);
`;

const Results = styled.div`
  display: flex;
  --card-margin: 12px;
`;

export default ({ isOwner, list, shareLink, error }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteList = async () => {
    setIsDeleting(true);
    await fetch(`/api/lists/${list._id}`, {
      method: 'DELETE',
    });
    Router.push({
      pathname: '/profile',
    });
  };

  return (
    <Layout>
      <Header />
      <Body>
        {(list && (
          <>
            <Helmet title={list.name} />
            <Title>{list.name}</Title>
            <Content>
              {isOwner && (
                <>
                  <Paragraph>
                    This list is <strong>{list.is_public ? 'public' : 'private'}</strong>.
                  </Paragraph>
                  {list.is_public && (
                    <Paragraph>
                      Public link: <a href={shareLink}>{shareLink}</a>
                    </Paragraph>
                  )}
                </>
              )}
              <h2>Items in the list</h2>
              {list.items.length > 0 ? (
                <Results>
                  {list.items.map((item) => {
                    return (
                      <StyledMedia
                        key={item.id}
                        title={item.title}
                        subtitle={item.subtitle}
                        thumbnail={item.image}
                        direction="column"
                        link={`/${item.route}/${uriToId(item.id)}`}
                        uri={item.graph}
                      />
                    );
                  })}
                </Results>
              ) : (
                <Paragraph>This list is empty!</Paragraph>
              )}
              {isOwner && (
                <>
                  <h2>Operations</h2>
                  <Button onClick={deleteList} loading={isDeleting}>
                    Delete list
                  </Button>
                </>
              )}
            </Content>
          </>
        )) || (
          <>
            <Helmet title={error.message} />
            <Title>List not found</Title>
            <Content>
              <Paragraph>{error.message}</Paragraph>
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
    res.setHeader('location', '/api/auth/signin');
    res.statusCode = 302;
    res.end();
    return { props: {} };
  }

  // Get details (title, image, ...) for each item in the list
  for (let i = 0; i < list.items.length; i += 1) {
    const item = list.items[i];
    const [routeName, route] = Object.entries(config.routes).find(([, r]) => {
      return r.uriBase && item.startsWith(r.uriBase);
    });

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
