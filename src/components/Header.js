import Link from 'next/link';
import styled from 'styled-components';

import breakpoints from '@styles/breakpoints';
import SearchBox from '@components/SearchBox';
import LanguageSwitch from '@components/LanguageSwitch';
import ProfileButton from '@components/ProfileButton';
import { OpenInNew } from '@styled-icons/material/OpenInNew';
import { useTranslation } from 'next-i18next';
import config from '~/config';

/**
 * Header with nav links, search box, language switcher, profile button.
 */

const Container = styled.div`
  width: 100%;
  height: ${({ theme }) => theme.header.height};
  border-bottom: ${({ theme }) => theme.header.borderBottomWidth} solid #dcdcdc;
  display: flex;
  align-items: center;
  font-size: 0.875rem;
`;

const StyledLanguageSwitch = styled(LanguageSwitch)`
  display: none;

  ${breakpoints.weirdMedium`
    display: flex;
  `}
`;

const StyledProfileButton = styled(ProfileButton)`
  margin-left: auto;

  ${breakpoints.weirdMedium`
    margin-left: 0;
  `}
`;

const LogoContainer = styled.a`
  text-decoration: none;
  margin-right: 0;
  margin-left: 5em;

  ${breakpoints.weirdMedium`
    margin-left: 2em;
    margin-right: 2em;
  `}
`;

const Logo = styled.img`
  max-width: 128px;
  max-height: 54px;
  flex: 0 0 auto;
`;

const LogoTitle = styled.span`
  color: #000;
  font-size: 2em;
`;

const NavContainer = styled.div`
  display: none;

  ${breakpoints.weirdMedium`
    display: flex;
  `}
`;

const NavList = styled.ul`
  padding: 0px;
  justify-content: space-around;
  display: flex;
  list-style: outside none none;
  text-align: right;
  align-items: center;
  margin: 0px;
`;

const NavItem = styled.li`
  padding: 0 1em;
`;

const NavLink = styled.a`
  color: #000;
  text-decoration: none;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  line-height: 54px;
`;

const SearchContainer = styled.div`
  padding: 0 1em;
  min-width: 0;
  margin-left: auto;
  display: none;

  ${breakpoints.tablet`
    display: block;
  `}
`;

const Header = ({ className }) => {
  const { t } = useTranslation('project');
  return (
    <Container className={className}>
      <Link href="/" passHref>
        <LogoContainer>
          {config.metadata.logo ? (
            <Logo
              key={config.metadata.logo}
              src={config.metadata.logo}
              title={config.metadata.title}
              alt={config.metadata.title}
            />
          ) : (
            <LogoTitle>{config.metadata.title}</LogoTitle>
          )}
        </LogoContainer>
      </Link>
      <NavContainer>
        <NavList>
          {Object.keys(config.routes)
            .filter((routeName) => config.routes[routeName].showInNavbar !== false)
            .flatMap((routeName) => (
              <NavItem key={routeName}>
                <Link href={`/${routeName}`} passHref>
                  <NavLink>
                    {t(
                      `routes.${routeName}`,
                      routeName.substr(0, 1).toUpperCase() + routeName.substr(1)
                    )}
                  </NavLink>
                </Link>
              </NavItem>
            ))}
          {config.plugins.skosmos && config.plugins.skosmos.thesaurusUrl && (
            <NavItem>
              <NavLink
                href={config.plugins.skosmos.thesaurusUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Thesaurus <OpenInNew style={{ width: '1rem', height: '1rem' }} />
              </NavLink>
            </NavItem>
          )}
        </NavList>
      </NavContainer>
      <SearchContainer>
        <SearchBox placeholder={t('search')} />
      </SearchContainer>
      <StyledLanguageSwitch />
      <StyledProfileButton />
    </Container>
  );
};

export default Header;
