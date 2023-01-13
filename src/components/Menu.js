import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import LanguageSwitch from '@components/LanguageSwitch';
import breakpoints from '@styles/breakpoints';
import config from '~/config';

export const StyledMenu = styled.nav`
  display: ${({ open }) => (open ? 'flex' : 'none')};
  flex-direction: column;
  background: rgba(0, 0, 0, 0.8);
  transform: ${({ open }) => (open ? 'translateX(0)' : 'translateX(-100%)')};
  height: 100vh;
  text-align: left;
  padding: 2rem;
  position: fixed;
  top: 0;
  left: 0;
  transition: transform 0.3s ease-in-out;
  width: 100%;

  ${breakpoints.weirdMedium`
    display: none;
  `}

  a {
    font-size: 1.5rem;
    text-transform: uppercase;
    padding: 1rem 0;
    font-weight: 700;
    letter-spacing: 0.5rem;
    color: #fff;
    text-decoration: none;
    transition: color 0.3s linear;
    text-overflow: ellipsis;
    overflow: hidden;

    ${breakpoints.tablet`
      font-size: 2rem;
    `}

    &:hover {
      color: #ddd;
    }
  }
`;

const Items = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 2rem;
`;

const StyledLanguageSwitch = styled(LanguageSwitch)`
  align-self: flex-end;
  font-weight: 700;
  color: #fff;
`;

/**
 * A React component that renders the side menu with a burger button.
 * @param {boolean} open - Whether the menu is open or not.
 * @param {string} className - The class name to apply to the menu.
 * @param {object} props - The props to pass to the menu.
 * @returns A React component that renders the side menu with a burger button.
 */
function Menu({ className, open, ...props }) {
  const { t } = useTranslation('project');
  const isHidden = !!open;
  const tabIndex = isHidden ? 0 : -1;

  return (
    <StyledMenu className={className} open={open} aria-hidden={!isHidden} {...props}>
      <StyledLanguageSwitch />
      <Items>
        {Object.keys(config.routes).flatMap((routeName) => (
          <Link key={routeName} href={`/${routeName}`} tabIndex={tabIndex}>
            {t(
              `project:routes.${routeName}`,
              routeName.substr(0, 1).toUpperCase() + routeName.substr(1)
            )}
          </Link>
        ))}
      </Items>
    </StyledMenu>
  );
}

Menu.propTypes = {
  open: PropTypes.bool.isRequired,
};

export default Menu;
