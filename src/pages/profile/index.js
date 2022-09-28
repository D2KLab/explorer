import styled from 'styled-components';
import { useState } from 'react';
import { useDialogState, Dialog, DialogDisclosure } from 'ariakit';
import { getProviders, getCsrfToken, signout } from 'next-auth/react';
import NextLink from 'next/link';
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
import { absoluteUrl, slugify } from '@helpers/utils';
import { getSessionUser, getUserLists, getUserAccounts } from '@helpers/database';
import { useTranslation, Trans } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import { unstable_getServerSession } from 'next-auth';
import ImageWithFallback from '@components/ImageWithFallback';

const StyledDialogDisclosure = styled(DialogDisclosure)`
  appearance: none;
  background-color: transparent;
  border: none;
  cursor: pointer;
`;

const StyledDialog = styled(Dialog)`
  background-color: #fff;
  box-shadow: rgba(0, 0, 0, 0.28) 0px 8px 28px;
  overflow: visible;
  padding: 32px;
  outline: 0;
`;

const DeleteButton = styled(Button)`
  font-weight: 700;
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

const Avatar = styled(ImageWithFallback)`
  border-radius: 100%;
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

function ProfilePage({
  session,
  providers,
  csrfToken,
  accounts,
  lists,
  baseUrl,
  facebookAppId,
}) {
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

  const renderOperations = () => (
      <Element marginY={24} display="flex" flexDirection="column">
        <h3 style={{ color: '#dc3535', fontWeight: 'bold' }}>{t('common:profile.deleteAccount.title')}</h3>
        <DialogDisclosure
          state={deleteProfileDialog}
          as={DeleteButton}
          bg="#fff"
          text="#dc3545"
          loading={isDeletingAccount}
        >
          {t('common:profile.deleteAccount.title')}
        </DialogDisclosure>
        <StyledDialog
          state={deleteProfileDialog}
          modal
          aria-label={t('common:profile.deleteAccount.title')}
        >
          <h2>{t('common:profile.deleteAccount.title')}</h2>
          <p>
            <Trans
              i18nKey="common:profile.deleteAccount.text"
              components={[<strong />, <strong />]}
            />
          </p>
          <p>{t('common:profile.deleteAccount.consequences')}</p>
          <ul style={{ listStyleType: 'disc', paddingLeft: 20, margin: '1em 0' }}>
            <li>{t('common:profile.deleteAccount.lists')}</li>
            <li>{t('common:profile.deleteAccount.sessions')}</li>
          </ul>
          <Element display="flex" alignItems="center" justifyContent="space-between">
            <Button
              type="button"
              secondary
              onClick={() => {
                deleteProfileDialog.hide();
              }}
            >
              {t('common:profile.deleteAccount.cancel')}
            </Button>
            <Button
              type="button"
              bg="#dc3545"
              text="#fff"
              loading={isDeletingAccount}
              onClick={deleteProfile}
            >
              {t('common:profile.deleteAccount.confirm')}
            </Button>
          </Element>
        </StyledDialog>
      </Element>
    );

  const renderAccounts = () => (
      <>
        <Element marginBottom={24}>
          <h3>{t('common:profile.connectedAccounts.title')}</h3>
          <ul>
            {accounts?.map((account) => (
              <Element as="li" key={account._id} marginBottom={12}>
                {account.provider.substr(0, 1).toUpperCase() + account.provider.substr(1)}
                <Button
                  primary
                  onClick={() => {
                    unlinkAccount(account);
                  }}
                  loading={isUnlinkingAccount}
                >
                  {t('common:profile.connectedAccounts.unlink')}
                </Button>
              </Element>
            ))}
          </ul>
        </Element>
        <Element marginBottom={24}>
          <h3>{t('common:profile.connectedAccounts.new')}</h3>
          <Element display="flex" flexDirection="column">
            {providers &&
              Object.values(providers).map((provider) => {
                if (accounts.find((account) => account.provider === provider.id)) {
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

  return (
    <Layout>
      <PageTitle title={t('common:profile.title')} />
      <Header />
      <Body hasSidebar>
        <Content>
          <ProfileContainer>
            <ProfileSidebar>
              <Avatar
                fallbackSrc="/images/avatar-placeholder.png"
                src={session.user.image}
                title={session.user.name}
                alt=""
                width={96}
                height={96}
              />
              <UserName>{session.user.name}</UserName>
              {renderAccounts(accounts, providers)}
              {renderOperations()}
            </ProfileSidebar>
            <ProfileContent>
              <h1 style={{ marginBottom: 24 }}>{t('common:profile.lists.title')}</h1>
              <ul>
                {lists?.map((list) => {
                  const shareListDialog = useDialogState();
                  const deleteListDialog = useDialogState();

                  return (
                    <ListItem key={list._id}>
                      <Element>
                        <ListItemTitle>
                          <NextLink href={`/lists/${slugify(list.name)}-${list._id}`} passHref>
                            <a style={{ color: 'inherit', textDecoration: 'inherit' }}>
                              <h3>{list.name}</h3>
                            </a>
                          </NextLink>
                          <ListSettings list={list} />
                        </ListItemTitle>
                        <ListItemSubtitle>
                          {t('common:profile.lists.count', { count: list.items.length })} |{' '}
                          <Trans
                            i18nKey="common:profile.lists.lastEdit"
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
                            <StyledDialogDisclosure state={shareListDialog}>
                              <StyledShareIcon />
                            </StyledDialogDisclosure>
                          </ListShare>
                        </ListItemButton>
                        <ListItemButton>
                          <ListDeletion list={list} dialogState={deleteListDialog}>
                            <StyledDialogDisclosure state={deleteListDialog}>
                              <StyledTrashIcon />
                            </StyledDialogDisclosure>
                          </ListDeletion>
                        </ListItemButton>
                        <ListItemButton>
                          <NextLink href={`/lists/${slugify(list.name)}-${list._id}`} passHref>
                            <Button primary>{t('common:profile.lists.open')}</Button>
                          </NextLink>
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
}

export default ProfilePage;

export async function getServerSideProps(ctx) {
  const { req } = ctx;
  const session = await unstable_getServerSession(ctx.req, ctx.res, authOptions);
  const user = await getSessionUser(session);

  if (!user) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    }
  }

  // Get user lists
  const lists = await getUserLists(user);

  // Get user accounts
  const accounts = await getUserAccounts(user);

  return {
    props: {
      ...await serverSideTranslations(ctx.locale, ['common', 'project', 'search']),
      session,
      providers: await getProviders(ctx),
      csrfToken: await getCsrfToken(ctx),
      accounts: JSON.parse(JSON.stringify(accounts)), // serialize the accounts
      lists: JSON.parse(JSON.stringify(lists)), // serialize the lists
      baseUrl: absoluteUrl(req),
      facebookAppId: process.env.FACEBOOK_ID,
    },
  };
}
