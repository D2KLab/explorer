import styled from 'styled-components';
import { useMenuState, Menu, MenuItem, MenuButton } from 'ariakit';
import { DownArrow } from '@styled-icons/boxicons-solid/DownArrow';
import { useRouter } from 'next/router';

import Element from '@components/Element';
import { useTranslation } from 'next-i18next';
import config from '~/config';

/**
 * Language switcher.
 */

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

  &:hover {
    text-decoration: underline;
  }
`;

const StyledDownArrow = styled(DownArrow)`
  width: 0.8em;
  margin: 0 0.2em;
  color: inherit;
`;

function LanguageSwitch({ className }) {
  const menu = useMenuState();
  const { i18n } = useTranslation();
  const router = useRouter();

  return (
    <Element className={className}>
      <StyledMenuButton state={menu}>
        <span>{config.search.languages[i18n.language]}</span>
        <StyledDownArrow />
      </StyledMenuButton>
      <StyledMenu state={menu} aria-label={config.search.languages[i18n.language]}>
        {Object.entries(config.search.languages).map(([langKey, langLabel]) => (
          <StyledMenuItem
            state={menu}
            key={langKey}
            onClick={() => {
              menu.hide();
              router.push(router.asPath, undefined, { locale: langKey });
            }}
          >
            {langLabel}
          </StyledMenuItem>
        ))}
      </StyledMenu>
    </Element>
  );
}

export default LanguageSwitch;
