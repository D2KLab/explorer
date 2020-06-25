import styled from 'styled-components';
import { useState } from 'react';
import { Img } from 'react-image';
import { useDialogState, Dialog, DialogDisclosure, DialogBackdrop } from 'reakit/Dialog';
import NextAuth from 'next-auth/client';
import Moment from 'react-moment';
import Router from 'next/router';
import { ShareAlt as ShareIcon } from '@styled-icons/boxicons-solid/ShareAlt';
import { TrashAlt as TrashIcon } from '@styled-icons/boxicons-solid/TrashAlt';

import ListSettings from '@components/ListSettings';
import ListDeletion from '@components/ListDeletion';
import ListShare from '@components/ListShare';
import { ProviderButton } from '@components/ProviderButton';
import PageTitle from '@components/PageTitle';
import { Header, Footer, Layout, Body, Content, Element, Button } from '@components';
import { breakpoints } from '@styles';
import { absoluteUrl } from '@helpers/utils';

const StyledDialogDisclosure = styled(DialogDisclosure)`
  appearance: none;
  background-color: transparent;
  border: none;
  cursor: pointer;
`;

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

const DeleteButton = styled(Button)`
  font-weight: bold;
  border: 1px solid rgba(27, 31, 35, 0.35);
  border-radius: 0.25em;
`;

const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;

  ${breakpoints.weirdMedium`
    flex-direction: row;
    height: 100%;
  `}
`;

const ProfileSidebar = styled.div`
  ${breakpoints.weirdMedium`
    border-right: 1px solid #888;
    padding-right: 48px;
  `}
`;

const ProfileContent = styled.div`
  flex: 1;

  ${breakpoints.weirdMedium`
    padding-left: 48px;
  `}
`;

const UserName = styled.h1`
  margin-bottom: 24px;
  text-align: center;
`;

const Avatar = styled.img`
  border-radius: 100%;
  height: 96px;
  width: auto;
  display: block;
  margin: 0 auto;
`;

const ListItem = styled.li`
  display: flex;
  align-items: center;
  transition: box-shadow 250ms cubic-bezier(0.23, 1, 0.32, 1) 0s;

  &:hover {
    box-shadow: 0px 0px 50px -30px;
  }

  &:not(:last-child) {
    margin-bottom: 20px;
  }
`;

const ListItemTitle = styled.div`
  display: flex;
  align-items: center;
`;

const ListItemSubtitle = styled.span`
  font-size: 16px;
  color: #aaa;
`;

const ListItemButton = styled.div`
  &:not(:last-child) {
    margin-right: 12px;
  }
`;

const StyledShareIcon = styled(ShareIcon)`
  color: #888;
  height: 24px;
  transition: color 250ms cubic-bezier(0.23, 1, 0.32, 1) 0s;

  &:hover {
    color: #444;
  }
`;

const StyledTrashIcon = styled(TrashIcon)`
  color: #888;
  height: 24px;
  transition: color 250ms cubic-bezier(0.23, 1, 0.32, 1) 0s;

  &:hover {
    color: #444;
  }
`;

export default ({ providers, session, accounts, lists, baseUrl, facebookAppId }) => {
  const deleteProfileDialog = useDialogState();
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isUnlinkingAccount, setIsUnlinkingAccount] = useState(false);

  const deleteProfile = async () => {
    setIsDeletingAccount(true);
    await fetch(`/api/profile`, {
      method: 'DELETE',
    });
    NextAuth.signout();
  };

  const unlinkAccount = async (account) => {
    setIsUnlinkingAccount(true);
    await fetch(`/api/profile/accounts/${account._id}`, {
      method: 'DELETE',
    });
    Router.reload();
  };

  const renderOperations = () => {
    return (
      <Element marginY={24} display="flex" flexDirection="column">
        <h3 style={{ color: '#dc3535', fontWeight: 'bold' }}>Delete account</h3>
        <DialogDisclosure
          {...deleteProfileDialog}
          as={DeleteButton}
          bg="#fff"
          text="#dc3545"
          loading={isDeletingAccount}
        >
          Delete account
        </DialogDisclosure>
        <StyledDialogBackdrop {...deleteProfileDialog}>
          <StyledDialog {...deleteProfileDialog} modal aria-label="Delete account">
            <h2>Delete account</h2>
            <p>
              Are you sure you wish to <strong>permanently delete</strong> your account?{' '}
              <strong>This action cannot be undone!</strong>
            </p>
            <p>Deleting this account will also remove:</p>
            <ul style={{ listStyleType: 'disc', paddingLeft: 20, margin: '1em 0' }}>
              <li>All user created lists</li>
              <li>All connected social accounts and sessions</li>
            </ul>
            <Element display="flex" alignItems="center" justifyContent="space-between">
              <Button
                type="button"
                secondary
                onClick={() => {
                  deleteProfileDialog.hide();
                }}
              >
                Cancel account deletion
              </Button>
              <Button
                type="button"
                bg="#dc3545"
                text="#fff"
                loading={isDeletingAccount}
                onClick={deleteProfile}
              >
                Yes, delete my account
              </Button>
            </Element>
          </StyledDialog>
        </StyledDialogBackdrop>
      </Element>
    );
  };

  const renderAccounts = () => {
    return (
      <>
        <Element marginBottom={24}>
          <h3>Connected accounts</h3>
          <ul>
            {accounts.map((account) => (
              <Element as="li" key={account._id} marginBottom={12}>
                {account.providerId.substr(0, 1).toUpperCase() + account.providerId.substr(1)}
                <Button
                  primary
                  onClick={() => {
                    unlinkAccount(account);
                  }}
                  loading={isUnlinkingAccount}
                >
                  Unlink this connection
                </Button>
              </Element>
            ))}
          </ul>
        </Element>
        <Element marginBottom={24}>
          <h3>Connect another account</h3>
          {providers &&
            Object.values(providers).map((provider) => {
              if (accounts.find((account) => account.providerId === provider.id)) {
                // Do not display a button if this provider is already linked to the user
                return null;
              }
              return (
                <Element key={provider.name} marginY={12}>
                  <ProviderButton provider={provider} redirectUrl={`${baseUrl}/profile`} />
                </Element>
              );
            })}
        </Element>
      </>
    );
  };

  const PlaceholderAvatar = <Avatar src="/images/avatar-placeholder.png" alt="" />;

  return (
    <Layout>
      <PageTitle title="Profile" />
      <Header />
      <Body hasSidebar>
        <Content>
          <ProfileContainer>
            <ProfileSidebar>
              <Avatar
                as={Img}
                loader={PlaceholderAvatar}
                unloader={PlaceholderAvatar}
                src={session.user.image}
                title={session.user.name}
                alt=""
              />
              <UserName>{session.user.name}</UserName>
              {renderAccounts(accounts, providers)}
              {renderOperations()}
            </ProfileSidebar>
            <ProfileContent>
              <h2 style={{ marginBottom: 24, textTransform: 'uppercase' }}>My lists</h2>
              <ul>
                {lists.map((list) => {
                  const shareListDialog = useDialogState();
                  const deleteListDialog = useDialogState();

                  return (
                    <ListItem key={list._id}>
                      <Element>
                        <ListItemTitle>
                          <h1>{list.name}</h1>
                          <ListSettings list={list} />
                        </ListItemTitle>
                        <ListItemSubtitle>
                          {list.items.length} objects | last edit on{' '}
                          <Moment format="DD/MM/YYYY">{list.updated_at}</Moment>
                        </ListItemSubtitle>
                      </Element>
                      <Element display="flex" alignItems="center" marginLeft="auto">
                        <ListItemButton>
                          <ListShare
                            list={list}
                            facebookAppId={facebookAppId}
                            shareUrl={`${baseUrl}/lists/${list._id}`}
                            dialogState={shareListDialog}
                          >
                            <StyledDialogDisclosure {...shareListDialog}>
                              <StyledShareIcon />
                            </StyledDialogDisclosure>
                          </ListShare>
                        </ListItemButton>
                        <ListItemButton>
                          <ListDeletion list={list} dialogState={deleteListDialog}>
                            <StyledDialogDisclosure {...deleteListDialog}>
                              <StyledTrashIcon />
                            </StyledDialogDisclosure>
                          </ListDeletion>
                        </ListItemButton>
                        <ListItemButton>
                          <Button primary href={`/lists/${list._id}`}>
                            Open
                          </Button>
                        </ListItemButton>
                      </Element>
                    </ListItem>
                  );
                })}
              </ul>
            </ProfileContent>
          </ProfileContainer>
        </Content>
      </Body>
      <Footer />
    </Layout>
  );
};

export async function getServerSideProps(ctx) {
  const { req, res } = ctx;
  const providers = await NextAuth.getProviders(ctx);
  const session = await NextAuth.getSession(ctx);

  if (!session) {
    res.setHeader('location', '/auth/signin');
    res.statusCode = 302;
    res.end();
    return { props: {} };
  }

  // Get user lists
  const listsRes = await fetch(`${absoluteUrl(req)}/api/profile/lists`, {
    headers: {
      cookie: req.headers.cookie,
    },
  });
  const lists = await listsRes.json();

  // Get user accounts
  const accountsRes = await fetch(`${absoluteUrl(req)}/api/profile/accounts`, {
    headers: {
      cookie: req.headers.cookie,
    },
  });
  const accounts = await accountsRes.json();

  return {
    props: {
      providers,
      session,
      accounts,
      lists,
      baseUrl: absoluteUrl(req),
      facebookAppId: process.env.FACEBOOK_ID,
    },
  };
}
