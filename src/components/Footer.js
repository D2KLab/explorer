import styled from 'styled-components';

import breakpoints from '@styles/breakpoints';
import { useTranslation } from '~/i18n';
import config from '~/config';

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
  p {
    white-space: pre-line;

    &:not(:last-child) {
      margin-bottom: 1.5em;
    }
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
    margin-top: 0;
    margin-left: auto;
    padding-left: 24px;
  `}
`;

const Logo = styled.img`
  max-height: 100px;
  max-width: 100%;
`;

const Footer = ({ className }) => {
  const { t } = useTranslation('project');
  return (
    <Container className={className}>
      <Credits>
        <p>{t('footer.text')}</p>
      </Credits>
      <LogoContainer>
        <a target="_blank" rel="noopener noreferrer">
          <Logo
            src={config.footer.logo || config.metadata.logo}
            alt={config.metadata.title}
            title={config.metadata.title}
          />
        </a>
      </LogoContainer>
    </Container>
  );
};

export default Footer;
