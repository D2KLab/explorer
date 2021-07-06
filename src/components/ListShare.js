import styled from 'styled-components';
import { useDialogState, Dialog, DialogDisclosure, DialogBackdrop } from 'reakit/Dialog';
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
} from 'react-share';

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
`;

const StyledDialog = styled(Dialog)`
  background-color: #fff;
  box-shadow: rgba(0, 0, 0, 0.28) 0px 8px 28px;
  overflow: visible;
  max-width: 480px;
  padding: 32px;
  outline: 0;
`;

const ListShare = ({ list, dialogState, children, shareUrl, facebookAppId }) => {
  const { t } = useTranslation('common');
  const shareDialog = dialogState || useDialogState();
  const title = list.name;

  const buttonStyle = { margin: '1em' };

  return (
    <>
      {(children && children) || (
        <DialogDisclosure {...shareDialog} as={Button} primary>
          {t('listShare.title')}
        </DialogDisclosure>
      )}
      <StyledDialogBackdrop {...shareDialog}>
        <StyledDialog {...shareDialog} modal aria-label={t('listShare.title')}>
          <Element marginBottom={24}>
            <h2>{t('listShare.title')}</h2>
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
              {t('buttons.close')}
            </Button>
          </Element>
        </StyledDialog>
      </StyledDialogBackdrop>
    </>
  );
};

export default ListShare;
