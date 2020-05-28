import { Helmet } from 'react-helmet';
import Link from 'next/link';
import fetch from 'isomorphic-unfetch';

import { uriToId } from '@helpers/utils';
import { Header, Footer, Layout, Body, Content, Title, Paragraph } from '@components';

export default ({ isOwner, list, shareLink, error }) => {
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
                list.items.map((item) => (
                  <Link key={item} href={`/objects/${uriToId(item)}`} passHref>
                    <a>{item}</a>
                  </Link>
                ))
              ) : (
                <Paragraph>This list is empty!</Paragraph>
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
  const host = req ? req.headers['x-forwarded-host'] || req.headers.host : window.location.hostname;
  const protocol = host.indexOf('localhost') > -1 ? 'http:' : 'https:';
  const listApiRes = await fetch(`${protocol}//${host}/api/lists/${query.listId}`, {
    headers: req.headers,
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
  const userApiRes = await fetch(`${protocol}//${host}/api/profile`, {
    headers: req.headers,
  });
  const user = await userApiRes.json();

  const isOwner = user && list.user === user._id;

  if (!list.is_public && !isOwner) {
    res.setHeader('location', '/api/auth/signin');
    res.statusCode = 302;
    res.end();
    return { props: {} };
  }

  return {
    props: {
      list,
      isOwner,
      shareLink: `${protocol}//${host}/lists/${list._id}`,
    },
  };
}
