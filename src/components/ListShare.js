import styled, { withTheme } from 'styled-components';
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

import { Element } from '@components';
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

export default withTheme(({ list, dialogState, children, shareUrl, facebookAppId }) => {
  const { t } = useTranslation('common');
  const shareDialog = dialogState || useDialogState();
  const title = list.name;

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
          <Element display="flex" alignItems="center" marginBottom={24}>
            <FacebookShareButton url={shareUrl} quote={title}>
              <FacebookIcon size={32} round />
            </FacebookShareButton>
            <FacebookMessengerShareButton url={shareUrl} appId={facebookAppId}>
              <FacebookMessengerIcon size={32} round />
            </FacebookMessengerShareButton>
            <TwitterShareButton url={shareUrl} title={title}>
              <TwitterIcon size={32} round />
            </TwitterShareButton>
            <TelegramShareButton url={shareUrl} title={title}>
              <TelegramIcon size={32} round />
            </TelegramShareButton>
            <WhatsappShareButton url={shareUrl} title={title} separator=":: ">
              <WhatsappIcon size={32} round />
            </WhatsappShareButton>
            <LinkedinShareButton url={shareUrl}>
              <LinkedinIcon size={32} round />
            </LinkedinShareButton>
            <RedditShareButton url={shareUrl} title={title} windowWidth={660} windowHeight={460}>
              <RedditIcon size={32} round />
            </RedditShareButton>
            <TumblrShareButton url={shareUrl} title={title}>
              <TumblrIcon size={32} round />
            </TumblrShareButton>
            <EmailShareButton url={shareUrl} subject={title} body="">
              <EmailIcon size={32} round />
            </EmailShareButton>
          </Element>
          <Element display="flex" justifyContent="space-between" marginTop={24}>
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
});
