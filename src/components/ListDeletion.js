import { useState } from 'react';
import styled, { withTheme } from 'styled-components';
import Router from 'next/router';
import { useDialogState, Dialog, DialogDisclosure, DialogBackdrop } from 'reakit/Dialog';

import { Element } from '@components';
import Button from '@components/Button';
import { useTranslation, Trans } from '~/i18n';

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

export default withTheme(({ list, dialogState, children }) => {
  const { t } = useTranslation('common');
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteListDialog = dialogState || useDialogState();

  const deleteList = async () => {
    setIsDeleting(true);
    await fetch(`/api/lists/${list._id}`, {
      method: 'DELETE',
    });
    Router.reload();
  };

  return (
    <>
      {(children && children) || (
        <DialogDisclosure {...deleteListDialog} as={Button} primary loading={isDeleting}>
          {t('listDeletion.title')}
        </DialogDisclosure>
      )}
      <StyledDialogBackdrop {...deleteListDialog}>
        <StyledDialog {...deleteListDialog} modal aria-label={t('listDeletion.title')}>
          <h2>{t('listDeletion.title')}</h2>
          <p>
            <Trans
              i18nKey="common:listDeletion.confirmText"
              components={[<strong />]}
              values={{ name: list.name }}
            />
          </p>
          <Element display="flex" alignItems="center" justifyContent="space-between">
            <Button
              type="button"
              secondary
              onClick={() => {
                deleteListDialog.hide();
              }}
            >
              {t('buttons.cancel')}
            </Button>
            <Button type="button" primary loading={isDeleting} onClick={deleteList}>
              {t('listDeletion.deleteButton')}
            </Button>
          </Element>
        </StyledDialog>
      </StyledDialogBackdrop>
    </>
  );
});
