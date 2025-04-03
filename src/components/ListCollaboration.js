import { useDialogStore, Dialog, DialogDisclosure } from '@ariakit/react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import Button from '@components/Button';
import CopyButton from '@components/CopyButton';
import Element from '@components/Element';
import Input from '@components/Input';

const StyledDialog = styled(Dialog)`
  background-color: #fff;
  box-shadow: rgba(0, 0, 0, 0.28) 0px 8px 28px;
  overflow: visible;
  padding: 32px;
  outline: 0;
`;

/**
 * A React component that renders a dialog that allows the user to collaborate on a list.
 * @param {DialogStore} [dialogStore] - The dialog store to use.
 * @param {React.ReactNode} children - The children to render.
 * @returns A React component
 */
function ListCollaboration({ inviteUrl, dialogStore, children }) {
  const { t } = useTranslation('common');
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const inviteListDialog = dialogStore || useDialogStore();

  return (
    <>
      {(children && children) || (
        <DialogDisclosure store={inviteListDialog} as={Button} primary>
          {t('common:listCollaboration.invite')}
        </DialogDisclosure>
      )}
      <StyledDialog
        store={inviteListDialog}
        modal
        aria-label={t('common:listCollaboration.title')}
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
        <h2>{t('common:listCollaboration.title')}</h2>
        <p>
          {t('common:listCollaboration.firstLine')}
          <br />
          <strong>{t('common:listCollaboration.secondLine')}</strong>
        </p>
        <p>
          <Input type="text" value={inviteUrl} readonly style={{ width: '100%' }} />
          <small>
            <CopyButton value={inviteUrl} style={{ textTransform: 'lowercase' }} />
          </small>
        </p>
        <Element display="flex" alignItems="center" justifyContent="space-between">
          <Button
            type="button"
            secondary
            onClick={() => {
              inviteListDialog.hide();
            }}
            style={{ marginLeft: 'auto' }}
          >
            {t('common:buttons.close')}
          </Button>
        </Element>
      </StyledDialog>
    </>
  );
}

export default ListCollaboration;
