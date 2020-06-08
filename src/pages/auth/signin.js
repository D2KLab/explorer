import styled from 'styled-components';
import NextAuth from 'next-auth/client';

import Button from '@components/Button';
import { Layout, Header, Body, Content, Title, Footer, Element } from '@components';
import { ProviderButton } from '@components/ProviderButton';
import PageTitle from '@components/PageTitle';

const SignInPage = ({ providers }) => {
  return (
    <Layout>
      <PageTitle title={`Sign in`} />
      <Header />
      <Body>
        <Element
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          flex={1}
        >
          <Title>Sign in</Title>
          <Content>
            <Element display="flex" flexDirection="column" alignItems="center">
              {providers &&
                Object.values(providers).map((provider) => {
                  return (
                    <Element key={provider.name} marginY={12}>
                      <ProviderButton provider={provider} />
                    </Element>
                  );
                })}
            </Element>
          </Content>
        </Element>
      </Body>
      <Footer />
    </Layout>
  );
};

export default SignInPage;

export async function getServerSideProps(ctx) {
  const providers = await NextAuth.getProviders(ctx);
  return {
    props: {
      providers,
    },
  };
}
