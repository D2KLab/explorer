import React from 'react';
import styled from 'styled-components';
import { useMenuState, Menu, MenuItem, MenuButton } from 'reakit/Menu';
import { DownArrow } from '@styled-icons/boxicons-solid/DownArrow';
import { User } from '@styled-icons/boxicons-solid/User';

/**
 * Profile button.
 */

export const Container = styled.div``;

const StyledMenu = styled(Menu)`
  background: #fff;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12),
    0 1px 5px 0 rgba(0, 0, 0, 0.2);
  padding: 10px;
  outline: none;
  z-index: 999;
`;

const StyledMenuButton = styled(MenuButton)`
  background: transparent;
  border: none;
  outline: none;
  cursor: pointer;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  font-size: 1em;

  &:hover {
    text-decoration: underline;
  }
`;

const StyledMenuItem = styled(MenuItem)`
  background: #fff;
  border: none;
  outline: none;
  cursor: pointer;
  display: block;
  padding: 10px;

  &:hover {
    text-decoration: underline;
  }
`;

const StyledDownArrow = styled(DownArrow)`
  width: 0.8em;
  margin: 0 0.2em;
`;

const StyledUserIcon = styled(User)`
  width: 1.6em;
  margin: 0 0.2em;
`;

const ProfileButton = () => {
  const menu = useMenuState();

  return (
    <Container>
      <StyledMenuButton {...menu}>
        <StyledUserIcon />
        Profile
        <StyledDownArrow />
      </StyledMenuButton>
      <StyledMenu {...menu} aria-label="Profile">
        <StyledMenuItem
          {...menu}
          onClick={() => {
            menu.hide();
          }}
        >
          Sign in
        </StyledMenuItem>
      </StyledMenu>
    </Container>
  );
};

export default ProfileButton;
