import styled, { useTheme } from 'styled-components';
import { useEffect, useState } from 'react';
import Router from 'next/router';
import { useDialogState, Dialog, DialogDisclosure, DialogBackdrop } from 'reakit/Dialog';
import { Edit as SettingsIcon } from '@styled-icons/material/Edit';
import Switch from 'react-switch';

import { Element } from '@components';
import Input from '@components/Input';
import Button from '@components/Button';
import { useTranslation } from '~/i18n';

const StyledDialogBackdrop = styled(DialogBackdrop)`
  width: 100%;
  height: 100%;
  position: fixed;
  z-index: 2000;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledDialog = styled(Dialog)`
  background-color: #fff;
  box-shadow: rgba(0, 0, 0, 0.28) 0px 8px 28px;
  overflow: visible;
  padding: 32px;
  outline: 0;
`;

const StyledDialogDisclosure = styled(DialogDisclosure)`
  appearance: none;
  background-color: transparent;
  border: none;
  cursor: pointer;
`;

const StyledSettingsIcon = styled(SettingsIcon)`
  color: #888;
  height: 24px;
  transition: color 250ms cubic-bezier(0.23, 1, 0.32, 1) 0s;

  ${StyledDialogDisclosure}:hover & {
    color: #666;
  }
`;

const ListSettings = ({ list }) => {
  const theme = useTheme();
  const { t } = useTranslation('common');
  const settingsDialog = useDialogState();
  const [isUpdating, setIsUpdating] = useState(false);
  const [listName, setListName] = useState(list.name);
  const [listPublic, setListPublic] = useState(list.is_public);

  const updateSettings = async () => {
    setIsUpdating(true);
    await fetch(`/api/lists/${list._id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: listName,
        is_public: listPublic,
      }),
    });
    Router.reload();
  };

  useEffect(() => {
    // Reset form when visibility changes
    setListName(list.name);
    setListPublic(list.is_public);
  }, [settingsDialog.visible]);

  return (
    <>
      <StyledDialogDisclosure {...settingsDialog}>
        <StyledSettingsIcon />
      </StyledDialogDisclosure>
      <StyledDialogBackdrop {...settingsDialog}>
        <StyledDialog {...settingsDialog} modal aria-label={t('listSettings.title')}>
          <Element marginBottom={24}>
            <h2>{t('listSettings.title')}</h2>
          </Element>
          <Element display="flex" alignItems="center" marginBottom={24}>
            <label>
              <Element paddingRight={12}>{t('listSettings.labels.name')}</Element>
              <Input
                name="list_name"
                type="text"
                placeholder={t('listSettings.labels.name')}
                value={listName}
                onChange={(e) => setListName(e.target.value)}
              />
            </label>
          </Element>
          <Element display="flex" alignItems="center" marginBottom={24}>
            <label>
              <Element paddingRight={12}>{t('listSettings.labels.public')}</Element>
              <Switch
                onChange={(checked) => setListPublic(checked)}
                checked={listPublic}
                onColor={theme.colors.light}
                offHandleColor="#f0f0f0"
                onHandleColor={theme.colors.primary}
                handleDiameter={24}
                uncheckedIcon={false}
                checkedIcon={false}
                boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                height={16}
                width={36}
              />
            </label>
          </Element>
          <Element display="flex" justifyContent="space-between" marginTop={24}>
            <Button
              type="button"
              secondary
              onClick={() => {
                settingsDialog.hide();
              }}
            >
              {t('buttons.cancel')}
            </Button>
            <Button
              type="button"
              primary
              loading={isUpdating}
              onClick={async () => {
                await updateSettings();
                settingsDialog.hide();
              }}
            >
              {t('buttons.save')}
            </Button>
          </Element>
        </StyledDialog>
      </StyledDialogBackdrop>
    </>
  );
};

export default ListSettings;
