import styled from 'styled-components';

import breakpoints from '@styles/breakpoints';
import { useTranslation } from 'next-i18next';
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
    text-decoration: none;
    font-weight: bold;

    &:hover {
      color: inherit;
      text-decoration: underline;
    }
  }
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
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
  margin: 1em;

  &:not(:last-child) {
    margin-right: 2em;
  }
`;

const Footer = ({ className }) => {
  const { t } = useTranslation(['common', 'project']);
  return (
    <Container className={className}>
      <Credits>
        <p dangerouslySetInnerHTML={{ __html: t('project:footer.text') }} />
        {typeof config.footer.email === 'string' && (
          <p>
            {t('common:footer.contact')}{' '}
            <a href={`mailto:${config.footer.email}`}>{config.footer.email}</a>
          </p>
        )}
      </Credits>
      <LogoContainer>
        {Array.isArray(config.footer.logo) ? (
          config.footer.logo.map((logo) => (
            <Logo key={logo} src={logo} alt={config.metadata.title} title={config.metadata.title} />
          ))
        ) : (
          <Logo
            src={config.footer.logo || config.metadata.logo}
            alt={config.metadata.title}
            title={config.metadata.title}
          />
        )}
      </LogoContainer>
    </Container>
  );
};

export default Footer;
