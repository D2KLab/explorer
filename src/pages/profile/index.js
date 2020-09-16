import styled from 'styled-components';
import { useState } from 'react';
import { Img } from 'react-image';
import { useDialogState, Dialog, DialogDisclosure, DialogBackdrop } from 'reakit/Dialog';
import { getSession, getProviders, getCsrfToken, signout } from 'next-auth/client';
import Router from 'next/router';
import { ShareAlt as ShareIcon } from '@styled-icons/boxicons-solid/ShareAlt';
import { TrashAlt as TrashIcon } from '@styled-icons/boxicons-solid/TrashAlt';

import Header from '@components/Header';
import Footer from '@components/Footer';
import Layout from '@components/Layout';
import Body from '@components/Body';
import Content from '@components/Content';
import Button from '@components/Button';
import Element from '@components/Element';
import PageTitle from '@components/PageTitle';
import ListSettings from '@components/ListSettings';
import ListDeletion from '@components/ListDeletion';
import ListShare from '@components/ListShare';
import { ProviderButton } from '@components/ProviderButton';
import breakpoints from '@styles/breakpoints';
import { absoluteUrl } from '@helpers/utils';
import { getSessionUser, getUserLists, getUserAccounts } from '@helpers/database';
import { useTranslation, Trans } from '~/i18n';

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
  color: #666;
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
    color: #666;
  }
`;

const StyledTrashIcon = styled(TrashIcon)`
  color: #888;
  height: 24px;
  transition: color 250ms cubic-bezier(0.23, 1, 0.32, 1) 0s;

  &:hover {
    color: #666;
  }
`;

const ProfilePage = ({
  providers,
  csrfToken,
  session,
  accounts,
  lists,
  baseUrl,
  facebookAppId,
}) => {
  const { t } = useTranslation('common');
  const deleteProfileDialog = useDialogState();
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isUnlinkingAccount, setIsUnlinkingAccount] = useState(false);

  const deleteProfile = async () => {
    setIsDeletingAccount(true);
    await fetch(`/api/profile`, {
      method: 'DELETE',
    });
    signout();
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
        <h3 style={{ color: '#dc3535', fontWeight: 'bold' }}>{t('profile.deleteAccount.title')}</h3>
        <DialogDisclosure
          {...deleteProfileDialog}
          as={DeleteButton}
          bg="#fff"
          text="#dc3545"
          loading={isDeletingAccount}
        >
          {t('profile.deleteAccount.title')}
        </DialogDisclosure>
        <StyledDialogBackdrop {...deleteProfileDialog}>
          <StyledDialog
            {...deleteProfileDialog}
            modal
            aria-label={t('profile.deleteAccount.title')}
          >
            <h2>{t('profile.deleteAccount.title')}</h2>
            <p>
              <Trans
                i18nKey="common:profile.deleteAccount.text"
                components={[<strong />, <strong />]}
              />
            </p>
            <p>{t('profile.deleteAccount.consequences')}</p>
            <ul style={{ listStyleType: 'disc', paddingLeft: 20, margin: '1em 0' }}>
              <li>{t('profile.deleteAccount.lists')}</li>
              <li>{t('profile.deleteAccount.sessions')}</li>
            </ul>
            <Element display="flex" alignItems="center" justifyContent="space-between">
              <Button
                type="button"
                secondary
                onClick={() => {
                  deleteProfileDialog.hide();
                }}
              >
                {t('profile.deleteAccount.cancel')}
              </Button>
              <Button
                type="button"
                bg="#dc3545"
                text="#fff"
                loading={isDeletingAccount}
                onClick={deleteProfile}
              >
                {t('profile.deleteAccount.confirm')}
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
          <h3>{t('profile.connectedAccounts.title')}</h3>
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
                  {t('profile.connectedAccounts.unlink')}
                </Button>
              </Element>
            ))}
          </ul>
        </Element>
        <Element marginBottom={24}>
          <h3>{t('profile.connectedAccounts.new')}</h3>
          <Element display="flex" flexDirection="column">
            {providers &&
              Object.values(providers).map((provider) => {
                if (accounts.find((account) => account.providerId === provider.id)) {
                  // Do not display a button if this provider is already linked to the user
                  return null;
                }
                return (
                  <Element key={provider.name} marginBottom={12}>
                    <form action={provider.signinUrl} method="POST">
                      <input type="hidden" name="csrfToken" defaultValue={csrfToken} />
                      <input type="hidden" name="callbackUrl" defaultValue={`${baseUrl}/profile`} />
                      <ProviderButton provider={provider} type="submit" />
                    </form>
                  </Element>
                );
              })}
          </Element>
        </Element>
      </>
    );
  };

  const PlaceholderAvatar = <Avatar src="/images/avatar-placeholder.png" alt="" />;

  return (
    <Layout>
      <PageTitle title={t('profile.title')} />
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
              <h2 style={{ marginBottom: 24, textTransform: 'uppercase' }}>
                {t('profile.lists.title')}
              </h2>
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
                          {t('profile.lists.count', { count: list.items.length })} |{' '}
                          <Trans
                            i18nKey="profile.lists.lastEdit"
                            components={[
                              <time
                                dateTime={new Date(list.updated_at).toISOString()}
                                title={new Date(list.updated_at).toString()}
                              />,
                            ]}
                            values={{
                              date: new Date(list.updated_at).toLocaleDateString(),
                            }}
                          />
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
                            {t('profile.lists.open')}
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
  const session = await getSession(ctx);
  const user = await getSessionUser(session);

  if (!user) {
    res.setHeader('location', '/auth/signin');
    res.statusCode = 302;
    res.end();
    return { props: {} };
  }

  // Get user lists
  const lists = await getUserLists(user);

  // Get user accounts
  const accounts = await getUserAccounts(user);

  return {
    props: {
      providers: await getProviders(ctx),
      csrfToken: await getCsrfToken(ctx),
      session,
      accounts: JSON.parse(JSON.stringify(accounts)), // serialize the accounts
      lists: JSON.parse(JSON.stringify(lists)), // serialize the lists
      baseUrl: absoluteUrl(req),
      facebookAppId: process.env.FACEBOOK_ID,
    },
  };
}

export default ProfilePage;
