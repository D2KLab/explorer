import { useDialogState, Dialog } from 'ariakit';
import Router from 'next/router';
import { useTranslation, Trans } from 'next-i18next';
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
 * A React component that renders a dialog that allows the user to remove a collaborator from a list.
 * @param {List} list - The list to remove the collaborator from.
 * @param {List} user - The user to remove.
 * @param {DialogState} [dialogState] - The dialog state to use.
 * @param {React.ReactNode} children - The children to render.
 * @returns A React component
 */
function ListRemoveCollaborator({ list, user, dialogState, children }) {
  const { t } = useTranslation('common');
  const [isDeleting, setIsDeleting] = useState(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const removalDialog = dialogState || useDialogState();

  const deleteList = async () => {
    setIsDeleting(true);
    await fetch(`/api/lists/${list._id}/collaborators/${user._id}`, {
      method: 'DELETE',
    });
    Router.reload();
  };

  return (
    <>
      {children}
      <StyledDialog
        state={removalDialog}
        modal
        aria-label={t('common:listRemoveCollaborator.title')}
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
        <h2>{t('common:listRemoveCollaborator.title')}</h2>
        <p>
          <Trans
            i18nKey="common:listRemoveCollaborator.confirmText"
            components={[<strong key="0" />]}
            values={{ name: user.name }}
          />
        </p>
        <Element display="flex" alignItems="center" justifyContent="space-between">
          <Button
            type="button"
            secondary
            onClick={() => {
              removalDialog.hide();
            }}
          >
            {t('common:buttons.cancel')}
          </Button>
          <Button type="button" danger loading={isDeleting} onClick={deleteList}>
            {t('common:listRemoveCollaborator.removeButton')}
          </Button>
        </Element>
      </StyledDialog>
    </>
  );
}

export default ListRemoveCollaborator;
