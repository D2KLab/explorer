import React from 'react';
import styled from 'styled-components';
import { useMenuState, Menu, MenuItem, MenuButton } from 'reakit/Menu';
import { DownArrow } from '@styled-icons/boxicons-solid/DownArrow';

import { i18n } from '~/i18n';
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
  background: #fff;
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
`;

const useStateWithLocalStorage = (localStorageKey, defaultValue = '') => {
  const [value, setValue] = React.useState(
    typeof localStorage === 'undefined' ? '' : localStorage.getItem(localStorageKey) || defaultValue
  );

  React.useEffect(() => {
    localStorage.setItem(localStorageKey, value);
  }, [value]);

  return [value, setValue];
};

const LanguageSwitch = () => {
  const [language, setLanguage] = useStateWithLocalStorage(
    'lang',
    Object.keys(config.search.languages).shift()
  );
  const menu = useMenuState();

  return (
    <>
      <StyledMenuButton {...menu}>
        {config.search.languages[language]}
        <StyledDownArrow />
      </StyledMenuButton>
      <StyledMenu {...menu} aria-label={config.search.languages[language]}>
        {Object.entries(config.search.languages).map(([langKey, langLabel]) => (
          <StyledMenuItem
            {...menu}
            key={langKey}
            onClick={() => {
              menu.hide();
              setLanguage(langKey);
              i18n.changeLanguage(langKey);
            }}
          >
            {langLabel}
          </StyledMenuItem>
        ))}
      </StyledMenu>
    </>
  );
};

export default LanguageSwitch;
