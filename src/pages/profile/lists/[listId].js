import styled from 'styled-components';
import { Helmet } from 'react-helmet';
import Link from 'next/link';
import NextAuth from 'next-auth/client';
import fetch from 'isomorphic-unfetch';
import { uriToId } from '@helpers/utils';

import { Header, Footer, Layout, Body, Content } from '@components';

const Title = styled.h1`
  padding-left: 80px;
  padding-bottom: 60px;
  align-self: end;
  text-shadow: 0px 4px 3px rgba(0, 0, 0, 0.2), 0px 8px 13px rgba(0, 0, 0, 0.1),
    0px 18px 23px rgba(0, 0, 0, 0.1);
  word-break: break-all;
`;

export default ({ list }) => {
  return (
    <Layout>
      <Helmet title={list.name} />
      <Header />
      <Body>
        <Content>
          <Title>{list.name}</Title>

          <h2>Items in the list</h2>
          {list.items.map((item) => (
            <Link key={item} href={`/objects/${uriToId(item)}`} passHref>
              <a>{item}</a>
            </Link>
          ))}
        </Content>
      </Body>
      <Footer />
    </Layout>
  );
};

export async function getServerSideProps({ req, res, query }) {
  const session = await NextAuth.session({ req });

  if (!session) {
    res.setHeader('location', '/api/auth/signin');
    res.statusCode = 302;
    res.end();
    return { props: {} };
  }

  const host = req ? req.headers['x-forwarded-host'] || req.headers.host : window.location.hostname;
  const protocol = host.indexOf('localhost') > -1 ? 'http:' : 'https:';
  const apiRes = await fetch(`${protocol}//${host}/api/profile/lists/${query.listId}`, {
    headers: req.headers,
  });
  const list = await apiRes.json();

  return {
    props: {
      list,
    },
  };
}
