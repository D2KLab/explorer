import styled from 'styled-components';
import { useDialogState, Dialog, DialogDisclosure } from 'ariakit';
import {
  EmailShareButton,
  FacebookShareButton,
  FacebookMessengerShareButton,
  LinkedinShareButton,
  RedditShareButton,
  TelegramShareButton,
  TumblrShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  EmailIcon,
  FacebookIcon,
  FacebookMessengerIcon,
  LinkedinIcon,
  RedditIcon,
  TelegramIcon,
  TumblrIcon,
  TwitterIcon,
  WhatsappIcon,
} from 'next-share';
import { useTranslation } from 'next-i18next';

import Element from '@components/Element';
import Button from '@components/Button';

const StyledDialog = styled(Dialog)`
  background-color: #fff;
  box-shadow: rgba(0, 0, 0, 0.28) 0px 8px 28px;
  overflow: visible;
  max-width: 480px;
  padding: 32px;
  outline: 0;
`;

/**
 * A React component that renders a list of buttons that share the list.
 * @param {List} list - the list to share
 * @param {DialogState} dialogState - the dialog state to use
 * @param {React.ReactNode} children - the children to render
 * @param {string} shareUrl - the url to share
 * @param {string} facebookAppId - the facebook app id
 * @returns A React component
 */
function ListShare({ list, dialogState, children, shareUrl, facebookAppId }) {
  const { t } = useTranslation('common');
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const shareDialog = dialogState || useDialogState();
  const title = list.name;

  const buttonStyle = { margin: '1em' };

  return (
    <>
      {(children && children) || (
        <DialogDisclosure state={shareDialog} as={Button} primary>
          {t('common:listShare.title')}
        </DialogDisclosure>
      )}
      <StyledDialog
        state={shareDialog}
        modal
        aria-label={t('common:listShare.title')}
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
          <h2>{t('common:listShare.title')}</h2>
        </Element>
        <Element marginBottom={24}>
          <FacebookShareButton url={shareUrl} quote={title} style={buttonStyle}>
            <FacebookIcon size={32} round />
          </FacebookShareButton>
          <FacebookMessengerShareButton url={shareUrl} appId={facebookAppId} style={buttonStyle}>
            <FacebookMessengerIcon size={32} round />
          </FacebookMessengerShareButton>
          <TwitterShareButton url={shareUrl} title={title} style={buttonStyle}>
            <TwitterIcon size={32} round />
          </TwitterShareButton>
          <TelegramShareButton url={shareUrl} title={title} style={buttonStyle}>
            <TelegramIcon size={32} round />
          </TelegramShareButton>
          <WhatsappShareButton url={shareUrl} title={title} separator=":: " style={buttonStyle}>
            <WhatsappIcon size={32} round />
          </WhatsappShareButton>
          <LinkedinShareButton url={shareUrl} style={buttonStyle}>
            <LinkedinIcon size={32} round />
          </LinkedinShareButton>
          <RedditShareButton
            url={shareUrl}
            title={title}
            windowWidth={660}
            windowHeight={460}
            style={buttonStyle}
          >
            <RedditIcon size={32} round />
          </RedditShareButton>
          <TumblrShareButton url={shareUrl} title={title} style={buttonStyle}>
            <TumblrIcon size={32} round />
          </TumblrShareButton>
          <EmailShareButton url={shareUrl} subject={title} body="" style={buttonStyle}>
            <EmailIcon size={32} round />
          </EmailShareButton>
        </Element>
        <Element display="flex" justifyContent="flex-end" marginTop={24}>
          <Button
            type="button"
            secondary
            onClick={() => {
              shareDialog.hide();
            }}
          >
            {t('common:buttons.close')}
          </Button>
        </Element>
      </StyledDialog>
    </>
  );
}

export default ListShare;
