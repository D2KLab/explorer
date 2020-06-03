import React from 'react';
import styled from 'styled-components';
import { useMenuState, Menu, MenuItem, MenuButton } from 'reakit/Menu';
import { DownArrow } from '@styled-icons/boxicons-solid/DownArrow';

import { Element } from '@components';
import { withTranslation } from '~/i18n';
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
  font-weight: inherit;
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
  color: inherit;
`;

const LanguageSwitch = ({ className, i18n }) => {
  const menu = useMenuState();

  return (
    <Element className={className}>
      <StyledMenuButton {...menu}>
        <span>{config.search.languages[i18n.language]}</span>
        <StyledDownArrow />
      </StyledMenuButton>
      <StyledMenu {...menu} aria-label={config.search.languages[i18n.language]}>
        {Object.entries(config.search.languages).map(([langKey, langLabel]) => (
          <StyledMenuItem
            {...menu}
            key={langKey}
            onClick={() => {
              menu.hide();
              i18n.changeLanguage(langKey);
            }}
          >
            {langLabel}
          </StyledMenuItem>
        ))}
      </StyledMenu>
    </Element>
  );
};

export default withTranslation()(LanguageSwitch);
