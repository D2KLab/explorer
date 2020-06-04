import styled, { withTheme } from 'styled-components';
import { useEffect, useState } from 'react';
import Router from 'next/router';
import { useDialogState, Dialog, DialogDisclosure, DialogBackdrop } from 'reakit/Dialog';
import { Edit as SettingsIcon } from '@styled-icons/material/Edit';
import {
  EmailShareButton,
  FacebookShareButton,
  FacebookMessengerShareButton,
  LinkedinShareButton,
  PinterestShareButton,
  RedditShareButton,
  TelegramShareButton,
  TumblrShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  EmailIcon,
  FacebookIcon,
  FacebookMessengerIcon,
  LinkedinIcon,
  PinterestIcon,
  RedditIcon,
  TelegramIcon,
  TumblrIcon,
  TwitterIcon,
  WhatsappIcon,
} from 'react-share';
import Switch from 'react-switch';

import { Element } from '@components';
import Input from '@components/Input';
import Button from '@components/Button';

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

export default withTheme(({ list, dialogState, children, shareUrl, facebookAppId, theme }) => {
  const shareDialog = dialogState || useDialogState();

  const title = list.name;

  return (
    <>
      {(children && children) || (
        <StyledDialogDisclosure {...shareDialog} as={Button} primary>
          Share list
        </StyledDialogDisclosure>
      )}
      <StyledDialogBackdrop {...shareDialog}>
        <StyledDialog {...shareDialog} modal aria-label="Share">
          <Element marginBottom={24}>
            <h2>Share</h2>
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
              Close
            </Button>
          </Element>
        </StyledDialog>
      </StyledDialogBackdrop>
    </>
  );
});