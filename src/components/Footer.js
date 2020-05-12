import styled from 'styled-components';

import { breakpoints } from '@styles';
import EurecomLogoSVG from 'public/images/eurecom-logo.svg';

import { withTranslation } from '~/i18n';

/**
 * Footer.
 */

const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.primary};
  color: #fff;
  padding: 2em;
  box-shadow: inset 1px 4px 9px -6px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: ${({ theme }) => theme.footer.minHeight};

  ${breakpoints.tablet`
    flex-direction: row;
  `}
`;

const Credits = styled.div`
  p:not(:last-child) {
    margin-bottom: 1.5em;
  }

  a {
    color: inherit;

    &:hover {
      color: inherit;
    }
  }
`;

const LogoContainer = styled.div`
  margin-top: 24px;

  ${breakpoints.tablet`
    margin-left: auto;
    margin-top: 0;
  `}
`;

const Logo = styled(EurecomLogoSVG)`
  width: 120px;
`;

const Footer = ({ className, t }) => {
  return (
    <Container className={className}>
      <Credits>
        <p>{t('footer.text')}</p>
        <p>
          KG Explorer has been developed at{' '}
          <a href="https://www.eurecom.fr" target="_blank" rel="noopener noreferrer">
            EURECOM
          </a>
          .
        </p>
      </Credits>
      <LogoContainer>
        <a target="_blank" rel="noopener noreferrer">
          <Logo />
        </a>
      </LogoContainer>
    </Container>
  );
};

export default withTranslation('common')(Footer);
