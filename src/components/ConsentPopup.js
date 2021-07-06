import styled, { useTheme } from 'styled-components';
import { useState, useEffect } from 'react';
import { useDialogState, Dialog, DialogBackdrop } from 'reakit/Dialog';
import Cookies from 'js-cookie';
import Switch from 'react-switch';

import Element from '@components/Element';
import Button from '@components/Button';
import { useTranslation } from 'next-i18next';

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
  background-color: rgba(0, 0, 0, 0.75);
`;

const StyledDialog = styled(Dialog)`
  max-width: 960px;
  max-height: 640px;
  background-color: #fff;
  box-shadow: rgba(0, 0, 0, 0.28) 0px 8px 28px;
  padding: 32px;
  outline: 0;
  display: flex;
  flex-direction: column;
  overflow: auto;
`;

const StyledSwitch = styled(Switch)`
  vertical-align: middle;
  margin-right: 0.5em;
`;

const ConsentPopup = () => {
  const { t } = useTranslation(['common', 'project']);
  const theme = useTheme();
  const dialog = useDialogState({ modal: true, visible: true });
  const [consenting, setConsenting] = useState();

  const handleSwitchChange = (checked, event, id) => {
    setConsenting(id === 'consent_accept');
  };

  const onSubmit = async () => {
    Cookies.set('consent', consenting ? '1' : '0', { expires: 7 });
    dialog.hide();
  };

  useEffect(() => {
    dialog.show();
  }, []);

  const title = t('project:consent.title');

  return (
    <div>
      <StyledDialogBackdrop {...dialog}>
        <StyledDialog
          {...dialog}
          modal
          aria-label={title}
          hideOnClickOutside={false}
          hideOnEsc={false}
        >
          <Element marginBottom={24}>
            <h2>{title}</h2>
          </Element>
          <form
            style={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: 'min-content',
              overflowX: 'hidden',
            }}
            onSubmit={(e) => {
              e.stopPropagation();
              onSubmit();
              dialog.hide();
            }}
          >
            <Element
              style={{ whiteSpace: 'pre-line', overflowY: 'auto', overflowX: 'hidden' }}
              dangerouslySetInnerHTML={{ __html: t('project:consent.text') }}
            />
            <Element
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              marginTop={24}
            >
              <Element
                display="flex"
                flexDirection="column"
                paddingLeft="0.5em"
                paddingBottom="0.5em"
              >
                <label style={{ marginBottom: '1em' }}>
                  <StyledSwitch
                    onChange={handleSwitchChange}
                    checked={consenting === true}
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
                    id="consent_accept"
                  />
                  {t('project:consent.accept')}
                </label>
                <label>
                  <StyledSwitch
                    onChange={handleSwitchChange}
                    checked={consenting === false}
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
                    id="consent_decline"
                  />
                  {t('project:consent.decline')}
                </label>
              </Element>
              <Element>
                <Button
                  type="button"
                  primary
                  onClick={() => {
                    onSubmit();
                  }}
                >
                  {t('project:consent.submit')}
                </Button>
              </Element>
            </Element>
          </form>
        </StyledDialog>
      </StyledDialogBackdrop>
    </div>
  );
};

export default ConsentPopup;
