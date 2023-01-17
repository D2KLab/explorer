import { useDialogState, Dialog, DialogDisclosure } from 'ariakit';
import { useTranslation, Trans } from 'next-i18next';
import Router from 'next/router';
import { useState } from 'react';
import styled from 'styled-components';

import Button from '@components/Button';
import Element from '@components/Element';

const StyledDialog = styled(Dialog)`
  background-color: #fff;
  box-shadow: rgba(0, 0, 0, 0.28) 0px 8px 28px;
  overflow: visible;
  padding: 32px;
  outline: 0;
`;

/**
 * A React component that renders a dialog that allows the user to delete a list.
 * @param {List} list - The list to delete.
 * @param {DialogState} [dialogState] - The dialog state to use.
 * @param {React.ReactNode} children - The children to render.
 * @returns None
 */
function ListDeletion({ list, dialogState, children }) {
  const { t } = useTranslation('common');
  const [isDeleting, setIsDeleting] = useState(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks
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
        <DialogDisclosure state={deleteListDialog} as={Button} danger loading={isDeleting}>
          {t('common:listDeletion.title')}
        </DialogDisclosure>
      )}
      <StyledDialog
        state={deleteListDialog}
        modal
        aria-label={t('common:listDeletion.title')}
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
        <h2>{t('common:listDeletion.title')}</h2>
        <p>
          <Trans
            i18nKey="common:listDeletion.confirmText"
            components={[<strong key="0" />]}
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
            {t('common:buttons.cancel')}
          </Button>
          <Button type="button" danger loading={isDeleting} onClick={deleteList}>
            {t('common:listDeletion.deleteButton')}
          </Button>
        </Element>
      </StyledDialog>
    </>
  );
}

export default ListDeletion;
