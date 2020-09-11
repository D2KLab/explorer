import Link from 'next/link';
import styled from 'styled-components';

import { breakpoints } from '@styles';
import { SearchBox } from '@components';
import LanguageSwitch from '@components/LanguageSwitch';
import ProfileButton from '@components/ProfileButton';

import { withTranslation } from '~/i18n';
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

const Logo = styled.img`
  max-width: 128px;
  max-height: 54px;
  flex: 0 0 auto;
  margin-right: 0;
  margin-left: 5em;

  ${breakpoints.weirdMedium`
    margin-left: 2em;
    margin-right: 2em;
  `}
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
  font-size: 0.9em;
  text-decoration: none;
  text-transform: uppercase;
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

const Header = ({ className, t }) => {
  return (
    <Container className={className}>
      <Link href="/" passHref>
        <a>
          <Logo
            src={config.metadata.logo}
            title={config.metadata.title}
            alt={config.metadata.title}
          />
        </a>
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

export default withTranslation('project')(Header);
