import styled from 'styled-components';
import { Helmet } from 'react-helmet';
import NextAuth from 'next-auth/client';

import Button from '@components/Button';
import { Layout, Header, Body, Content, Title, Footer, Element } from '@components';
import { providersButtons } from '@components/ProviderButton';

const SignInPage = ({ providers }) => {
  return (
    <Layout>
      <Helmet title={`Sign in`} />
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
                  const ProviderButton = providersButtons[provider.name] || Button;
                  return (
                    <Element key={provider.name} marginY={12}>
                      <ProviderButton href={provider.signinUrl}>
                        Sign in with {provider.name}
                      </ProviderButton>
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
  const providers = await NextAuth.providers(ctx);
  return {
    props: {
      providers,
    },
  };
}
