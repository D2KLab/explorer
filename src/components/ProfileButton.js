import React from 'react';
import styled from 'styled-components';
import { useMenuState, Menu, MenuItem, MenuButton } from 'reakit/Menu';
import { Img } from 'react-image';
import { DownArrow } from '@styled-icons/boxicons-solid/DownArrow';
import { User } from '@styled-icons/boxicons-solid/User';
import NextAuth from 'next-auth/client';
import Router from 'next/router';

import Element from '@components/Element';
import Spinner from '@components/Spinner';
import { useTranslation, Trans } from '~/i18n';

/**
 * Profile button.
 */

const StyledMenu = styled(Menu)`
  padding-top: 4px;
  padding-bottom: 4px;
  margin-top: 12px;
  list-style: none;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid rgba(27, 31, 35, 0.15);
  border-radius: 4px;
  box-shadow: 0 1px 15px rgba(27, 31, 35, 0.15);
  outline: none;
  z-index: 999;

  &::before {
    position: absolute;
    display: inline-block;
    content: '';
    border: 8px solid transparent;
    border-bottom-color: rgba(27, 31, 35, 0.15);
    top: -16px;
    right: 9px;
    left: auto;
  }
`;

const StyledMenuButton = styled(MenuButton)`
  background: transparent;
  color: inherit;
  font-size: inherit;
  font-weight: inherit;
  border: none;
  outline: none;
  cursor: pointer;
  text-transform: uppercase;
  display: flex;
  align-items: center;

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
  font-size: 0.875rem;
  line-height: 1.5;
  color: inherit;

  &:hover {
    color: inherit;
    text-decoration: underline;
  }
`;

const StyledDivider = styled.div`
  display: block;
  height: 0;
  border-top: 1px solid #e1e4e8;
`;

const StyledDownArrow = styled(DownArrow)`
  width: 0.8em;
  margin: 0 0.2em;
`;

const StyledUserIcon = styled(User)`
  width: 1.6em;
  margin: 0 0.2em;
`;

const ProfileButton = ({ className }) => {
  const { t } = useTranslation('common');
  const menu = useMenuState();
  const [session, loading] = NextAuth.useSession();

  const renderSessionMenuItems = () => {
    if (!session || !session.user) {
      return null;
    }

    return (
      <>
        <StyledMenuItem
          {...menu}
          onClick={() => {
            Router.push({
              pathname: '/profile',
            });
            menu.hide();
          }}
        >
          <Trans
            i18nKey="common:profileButton.signedAs"
            components={[<strong />]}
            values={{ name: session.user.name }}
          />
        </StyledMenuItem>
        <StyledDivider />
        <StyledMenuItem
          {...menu}
          onClick={() => {
            Router.push({
              pathname: '/profile',
            });
            menu.hide();
          }}
        >
          {t('profileButton.yourProfile')}
        </StyledMenuItem>
        <StyledDivider />
        <StyledMenuItem
          {...menu}
          href="/api/auth/signout"
          onClick={(e) => {
            e.preventDefault();
            NextAuth.signout();
            menu.hide();
          }}
        >
          {t('profileButton.signOut')}
        </StyledMenuItem>
      </>
    );
  };

  const renderMenu = () => (
    <>
      <StyledMenuButton {...menu}>
        {session && session.user && session.user.image ? (
          <StyledUserIcon
            as={Img}
            loader={<StyledUserIcon />}
            unloader={<StyledUserIcon />}
            src={session.user.image}
            title={session.user.name}
            alt=""
          />
        ) : (
          <StyledUserIcon />
        )}
        {t('profileButton.label')}
        <StyledDownArrow />
      </StyledMenuButton>
      <StyledMenu {...menu} aria-label={t('profileButton.label')}>
        {session ? (
          renderSessionMenuItems(session, menu)
        ) : (
          <StyledMenuItem
            {...menu}
            href="/api/signin"
            onClick={(e) => {
              e.preventDefault();
              NextAuth.signin();
              menu.hide();
            }}
          >
            {t('profileButton.signIn')}
          </StyledMenuItem>
        )}
      </StyledMenu>
    </>
  );

  return (
    <Element className={className} display="flex" overflow={loading ? 'hidden' : 'visible'}>
      {loading ? <Spinner size="24" /> : renderMenu()}
    </Element>
  );
};

export default ProfileButton;
