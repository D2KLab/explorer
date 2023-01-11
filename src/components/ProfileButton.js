import styled from 'styled-components';
import { useMenuState, Menu, MenuItem, MenuButton } from 'ariakit';
import { DownArrow } from '@styled-icons/boxicons-solid/DownArrow';
import { User } from '@styled-icons/boxicons-solid/User';
import { signIn, signOut, useSession } from 'next-auth/react';
import Router from 'next/router';
import { useTranslation, Trans } from 'next-i18next';

import Element from '@components/Element';
import Spinner from '@components/Spinner';

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

/**
 * A button that renders the profile menu when clicked.
 * @param {string} [className] - The class name to apply to the button.
 * @returns A button that renders the profile menu when clicked.
 */
function ProfileButton({ className }) {
  const { t } = useTranslation('common');
  const menu = useMenuState();

  const { data: session, status } = useSession();
  const loading = status === 'loading';

  const renderSessionMenuItems = () => {
    if (!session || !session.user) {
      return null;
    }

    return (
      <>
        <StyledMenuItem
          state={menu}
          onClick={() => {
            Router.push({
              pathname: '/profile',
            });
            menu.hide();
          }}
        >
          <Trans
            i18nKey="common:profileButton.signedAs"
            components={[<strong key="0" />]}
            values={{ name: session.user.name }}
          />
        </StyledMenuItem>
        <StyledDivider />
        <StyledMenuItem
          state={menu}
          onClick={() => {
            Router.push({
              pathname: '/profile',
            });
            menu.hide();
          }}
        >
          {t('common:profileButton.yourProfile')}
        </StyledMenuItem>
        <StyledDivider />
        <StyledMenuItem
          state={menu}
          href="/api/auth/signout"
          onClick={(e) => {
            e.preventDefault();
            signOut();
            menu.hide();
          }}
        >
          {t('common:profileButton.signOut')}
        </StyledMenuItem>
      </>
    );
  };

  const renderMenu = () => (
    <>
      <StyledMenuButton state={menu}>
        {session?.user?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.user.image}
            title={session.user.name}
            alt=""
            style={{ width: '1.6em', margin: '0 0.2em' }}
          />
        ) : (
          <StyledUserIcon />
        )}
        {t('common:profileButton.label')}
        <StyledDownArrow />
      </StyledMenuButton>
      <StyledMenu state={menu} aria-label={t('common:profileButton.label')}>
        {session ? (
          renderSessionMenuItems(session, menu)
        ) : (
          <StyledMenuItem
            state={menu}
            href="/api/signin"
            onClick={(e) => {
              e.preventDefault();
              signIn();
              menu.hide();
            }}
          >
            {t('common:profileButton.signIn')}
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
}

export default ProfileButton;
