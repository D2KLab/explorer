import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import breakpoints from '@styles/breakpoints';

/**
 * Burger menu.
 */

export const StyledBurger = styled.button`
  position: ${({ open }) => (open ? 'fixed' : 'absolute')};
  top: 0;
  left: 0;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 5rem;
  height: ${({ theme }) => theme.header.height};
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 10;
  display: flex;

  ${breakpoints.weirdMedium`
    display: none;
  `};

  span {
    width: 2rem;
    height: 0.25rem;
    margin: 0.25rem 0;
    background: ${({ open, theme }) => (open ? '#fff' : theme.colors.primary)};
    border-radius: 10px;
    transition: all 0.3s linear;
    position: relative;
    transform-origin: 1px;
    &:hover {
      background: ${({ open, theme }) => (open ? '#d9d9d9' : theme.colors.linkHover)};
    }
    :first-child {
      transform: ${({ open }) => (open ? 'rotate(45deg)' : 'rotate(0)')};
    }
    :nth-child(2) {
      opacity: ${({ open }) => (open ? '0' : '1')};
      transform: ${({ open }) => (open ? 'translateX(20px)' : 'translateX(0)')};
    }
    :nth-child(3) {
      transform: ${({ open }) => (open ? 'rotate(-45deg)' : 'rotate(0)')};
    }
  }
`;

/**
 * A burger menu component that can be used to toggle the menu.
 * @param {string} className - The class name to apply to the burger.
 * @param {boolean} open - Whether or not the menu is open.
 * @param {Function} setOpen - A function to set the open state of the menu.
 * @param {object} props - The props to pass to the component.
 * @returns A burger menu component.
 */
function Burger({ className, open, setOpen, ...props }) {
  const { t } = useTranslation('common');
  const isExpanded = !!open;

  return (
    <StyledBurger
      className={className}
      aria-label={t('common:burger.label')}
      aria-expanded={isExpanded}
      open={open}
      onClick={() => setOpen(!open)}
      {...props}
    >
      <span />
      <span />
      <span />
    </StyledBurger>
  );
}

Burger.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
};

export default Burger;
