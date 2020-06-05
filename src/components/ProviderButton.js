import styled from 'styled-components';
import NextAuth from 'next-auth/client';

import Button from '@components/Button';

export const GoogleButton = styled(Button)`
  background-color: #db422c;
  color: #fff;

  &:hover {
    color: #fff;
    text-decoration: underline;
  }
`;

export const FacebookButton = styled(Button)`
  background-color: #4457a6;
  color: #fff;

  &:hover {
    color: #fff;
    text-decoration: underline;
  }
`;

export const TwitterButton = styled(Button)`
  background-color: #1da1f2;
  color: #fff;
`;

export const ProviderButton = ({ provider, redirectUrl }) => {
  const Container = providersButtons[provider.name] || Button;

  let { signinUrl } = provider;
  if (typeof redirectUrl === 'string') {
    signinUrl += `?callbackUrl=${redirectUrl}`;
  }

  return (
    <Container
      href={signinUrl}
      onClick={
        !redirectUrl // @TODO: NextAuth doesn't allow passing a callbackUrl to NextAuth.signin() as of 2.0.0-beta.61
          ? (e) => {
              e.preventDefault();
              NextAuth.signin(provider.id);
            }
          : null
      }
    >
      Sign in with {provider.name}
    </Container>
  );
};

export const providersButtons = {
  Google: GoogleButton,
  Facebook: FacebookButton,
  Twitter: TwitterButton,
};

export default ProviderButton;
