import Link from 'next/link';
import styled from 'styled-components';

import breakpoints from '@styles/breakpoints';
import SearchBox from '@components/SearchBox';
import LanguageSwitch from '@components/LanguageSwitch';
import ProfileButton from '@components/ProfileButton';
import { WindowOpen } from '@styled-icons/boxicons-regular/WindowOpen';
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

  ${({ theme }) => theme?.components?.Header?.Container};
`;

const StyledLanguageSwitch = styled(LanguageSwitch)`
  display: none;

  ${breakpoints.weirdMedium`
    display: flex;
  `}

  ${({ theme }) => theme?.components?.Header?.StyledLanguageSwitch};
`;

const StyledProfileButton = styled(ProfileButton)`
  margin-left: auto;

  ${breakpoints.weirdMedium`
    margin-left: 0;
  `}

  ${({ theme }) => theme?.components?.Header?.StyledProfileButton};
`;

const LogoContainer = styled.a`
  text-decoration: none;
  margin-right: 0;
  margin-left: 5em;

  ${breakpoints.weirdMedium`
    margin-left: 2em;
    margin-right: 2em;
  `}

  ${({ theme }) => theme?.components?.Header?.LogoContainer};
`;

const Logo = styled.img`
  max-width: 128px;
  max-height: 54px;
  flex: 0 0 auto;

  ${({ theme }) => theme?.components?.Header?.Logo};
`;

const LogoTitle = styled.span`
  color: #000;
  font-size: 2em;

  ${({ theme }) => theme?.components?.Header?.LogoTitle};
`;

const NavContainer = styled.div`
  display: none;

  ${breakpoints.weirdMedium`
    display: flex;
  `}

  ${({ theme }) => theme?.components?.Header?.NavContainer};
`;

const NavList = styled.ul`
  padding: 0px;
  justify-content: space-around;
  display: flex;
  list-style: outside none none;
  text-align: right;
  align-items: center;
  margin: 0px;

  ${({ theme }) => theme?.components?.Header?.NavList};
`;

const NavItem = styled.li`
  padding: 0 1em;

  ${({ theme }) => theme?.components?.Header?.NavItem};
`;

const NavLink = styled.a`
  color: #000;
  text-decoration: none;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  text-align: center;

  ${({ theme }) => theme?.components?.Header?.NavLink};
`;

const SearchContainer = styled.div`
  padding: 0 1em;
  min-width: 0;
  margin-left: auto;
  display: none;

  ${breakpoints.tablet`
    display: block;
  `}

  ${({ theme }) => theme?.components?.Header?.SearchContainer};
`;

function Header({ className }) {
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
          {config.plugins?.skosmos && config.plugins?.skosmos?.thesaurusUrl && (
            <NavItem>
              <NavLink
                href={config.plugins?.skosmos?.thesaurusUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Thesaurus <WindowOpen style={{ width: '1rem', height: '1rem' }} />
              </NavLink>
            </NavItem>
          )}
        </NavList>
      </NavContainer>
      <SearchContainer>
        <SearchBox placeholder={t('project:search')} />
      </SearchContainer>
      <StyledLanguageSwitch />
      <StyledProfileButton />
    </Container>
  );
}

export default Header;
