import styled from 'styled-components';
import { Header, Footer, Layout, Body, Screen, Content } from '@components';
import { Helmet } from 'react-helmet';
import Link from 'next/link';
import NextAuth from 'next-auth/client';
import fetch from 'isomorphic-unfetch';

const Title = styled.h1`
  padding-left: 80px;
  padding-bottom: 60px;
  align-self: end;
  text-shadow: 0px 4px 3px rgba(0, 0, 0, 0.2), 0px 8px 13px rgba(0, 0, 0, 0.1),
    0px 18px 23px rgba(0, 0, 0, 0.1);
  word-break: break-all;
`;

export default ({ session, lists }) => {
  return (
    <Layout>
      <Helmet title="Profile" />
      <Header />
      <Screen>
        <Content>
          <Title>{session.user.name}</Title>

          <h2>Saved lists</h2>
          <ul>
            {lists.map((list) => (
              <li key={list._id}>
                <Link href={`/profile/lists/${list._id}`} passHref>
                  <a>{list.name}</a>
                </Link>
              </li>
            ))}
          </ul>
        </Content>
      </Screen>
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
  console.log('lists=', lists);

  return {
    props: {
      session,
      lists,
    },
  };
}
