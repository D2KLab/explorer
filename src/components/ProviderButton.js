import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

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

/**
 * A component that renders a button that will redirect the user to the provider's website for signing in.
 * @param {Provider} provider - The provider object.
 * @param {object} props - The props to pass to the button.
 * @returns A button that will redirect the user to the provider's website.
 */
export function ProviderButton({ provider, ...props }) {
  const { t } = useTranslation('common');
  const Container = providersButtons[provider.name] || Button;

  return (
    <Container {...props}>
      {t('common:providerButton.label', { provider: provider.name })}
    </Container>
  );
}

export default ProviderButton;
