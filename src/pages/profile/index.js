import styled from 'styled-components';
import { Header, Footer, Layout, Body, Content, Title } from '@components';
import { Helmet } from 'react-helmet';
import Link from 'next/link';
import NextAuth from 'next-auth/client';
import fetch from 'isomorphic-unfetch';

export default ({ session, lists }) => {
  return (
    <Layout>
      <Helmet title="Profile" />
      <Header />
      <Body>
        <Title>{session.user.name}</Title>
        <Content>
          <h2>Saved lists</h2>
          <ul>
            {lists.map((list) => (
              <li key={list._id}>
                <Link href={`/lists/${list._id}`} passHref>
                  <a>{list.name}</a>
                </Link>
              </li>
            ))}
          </ul>
        </Content>
      </Body>
      <Footer />
    </Layout>
  );
};

export async function getServerSideProps({ req, res }) {
  const session = await NextAuth.session({ req });

  if (!session) {
    res.setHeader('location', '/api/auth/signin');
    res.statusCode = 302;
    res.end();
    return { props: {} };
  }

  const host = req ? req.headers['x-forwarded-host'] || req.headers.host : window.location.hostname;
  const protocol = host.indexOf('localhost') > -1 ? 'http:' : 'https:';
  const apiRes = await fetch(`${protocol}//${host}/api/profile/lists`, {
    headers: req.headers,
  });
  const lists = await apiRes.json();

  return {
    props: {
      session,
      lists,
    },
  };
}
