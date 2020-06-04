import styled from 'styled-components';

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

export const providersButtons = {
  Google: GoogleButton,
  Facebook: FacebookButton,
  Twitter: TwitterButton,
};
