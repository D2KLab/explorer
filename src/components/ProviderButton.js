import styled from 'styled-components';

import Button from '@components/Button';

export const BaseButton = styled(Button)`
  color: #fff;
  width: 100%;
  min-height: 40px;

  &:hover {
    color: #fff;
    text-decoration: underline;
  }
`;

export const GoogleButton = styled(BaseButton)`
  background-color: #db422c;
`;

export const FacebookButton = styled(BaseButton)`
  background-color: #4457a6;
`;

export const TwitterButton = styled(BaseButton)`
  background-color: #1da1f2;
`;

export const providersButtons = {
  Google: GoogleButton,
  Facebook: FacebookButton,
  Twitter: TwitterButton,
};

export const ProviderButton = ({ provider, ...props }) => {
  const Container = providersButtons[provider.name] || Button;

  return <Container {...props}>Sign in with {provider.name}</Container>;
};

export default ProviderButton;
