import { Edit as SettingsIcon } from '@styled-icons/boxicons-regular/Edit';
import { useDialogState, Dialog, DialogDisclosure } from 'ariakit';
import Router from 'next/router';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import Switch from 'react-switch';
import styled, { useTheme } from 'styled-components';

import Button from '@components/Button';
import Element from '@components/Element';
import Input from '@components/Input';

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

/**
 * A component that renders the settings dialog for a list.
 * @param {List} list - The list to render settings for.
 * @returns A component that renders the settings dialog for a list.
 */
function ListSettings({ list }) {
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
      <StyledDialogDisclosure state={settingsDialog}>
        <StyledSettingsIcon />
      </StyledDialogDisclosure>
      <StyledDialog
        state={settingsDialog}
        modal
        aria-label={t('common:listSettings.title')}
        backdrop
        backdropProps={{
          style: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            width: '100%',
            height: '100%',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        }}
      >
        <Element marginBottom={24}>
          <h2>{t('common:listSettings.title')}</h2>
        </Element>
        <form
          onSubmit={async (e) => {
            e.stopPropagation();
            await updateSettings();
            settingsDialog.hide();
          }}
        >
          <Element display="flex" alignItems="center" marginBottom={24}>
            <label>
              <Element paddingRight={12}>{t('common:listSettings.labels.name')}</Element>
              <Input
                name="list_name"
                type="text"
                placeholder={t('common:listSettings.labels.name')}
                value={listName}
                onChange={(e) => setListName(e.target.value)}
              />
            </label>
          </Element>
          <Element display="flex" alignItems="center" marginBottom={24}>
            <label>
              <Element paddingRight={12}>{t('common:listSettings.labels.public')}</Element>
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
              {t('common:buttons.cancel')}
            </Button>
            <Button type="submit" primary loading={isUpdating}>
              {t('common:buttons.save')}
            </Button>
          </Element>
        </form>
      </StyledDialog>
    </>
  );
}

export default ListSettings;
