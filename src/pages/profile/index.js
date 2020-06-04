import styled from 'styled-components';
import { useState } from 'react';
import { Img } from 'react-image';
import { useDialogState, Dialog, DialogDisclosure, DialogBackdrop } from 'reakit/Dialog';
import { Helmet } from 'react-helmet';
import Link from 'next/link';
import NextAuth from 'next-auth/client';
import Moment from 'react-moment';
import { ShareAlt as ShareIcon } from '@styled-icons/boxicons-solid/ShareAlt';
import { TrashAlt as TrashIcon } from '@styled-icons/boxicons-solid/TrashAlt';

import ListSettings from '@components/ListSettings';
import ListDeletion from '@components/ListDeletion';
import ListShare from '@components/ListShare';
import { Header, Footer, Layout, Body, Content, Title, Element, Button } from '@components';
import { breakpoints } from '@styles';

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

const Avatar = styled.img`
  border-radius: 100%;
  height: 96px;
  width: auto;
  display: block;
  margin: 0 auto 24px auto;
`;

const UserLists = styled.ul``;

const ListItem = styled.li`
  display: flex
  align-items: center;
  transition: box-shadow 250ms cubic-bezier(0.23, 1, 0.32, 1) 0s;

  &:hover {
    box-shadow: 0px 0px 50px -30px;
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

export default ({ session, lists, baseUrl, facebookAppId }) => {
  const deleteAccountDialog = useDialogState();
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const deleteListDialog = useDialogState();
  const shareListDialog = useDialogState();

  const deleteAccount = async () => {
    setIsDeletingAccount(true);
    await fetch(`/api/profile`, {
      method: 'DELETE',
    });
    NextAuth.signout();
  };

  const renderOperations = () => {
    return (
      <Element marginY={24} display="flex" justifyContent="center">
        <DialogDisclosure
          {...deleteAccountDialog}
          as={DeleteButton}
          bg="#fff"
          text="#dc3545"
          loading={isDeletingAccount}
        >
          Delete account
        </DialogDisclosure>
        <StyledDialogBackdrop {...deleteAccountDialog}>
          <StyledDialog {...deleteAccountDialog} modal aria-label="Delete account">
            <h2>Delete account</h2>
            <p>
              Are you sure you wish to permanently delete your account? This action cannot be
              undone!
            </p>
            <Element display="flex" alignItems="center" justifyContent="space-between">
              <Button
                type="button"
                secondary
                onClick={() => {
                  deleteAccountDialog.hide();
                }}
              >
                Cancel account deletion
              </Button>
              <Button
                type="button"
                bg="#dc3545"
                text="#fff"
                loading={isDeletingAccount}
                onClick={deleteAccount}
              >
                Yes, delete my account
              </Button>
            </Element>
          </StyledDialog>
        </StyledDialogBackdrop>
      </Element>
    );
  };

  const PlaceholderAvatar = <Avatar src="/images/avatar-placeholder.png" alt="" />;

  return (
    <Layout>
      <Helmet title="Profile" />
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
              <h1>{session.user.name}</h1>
              {renderOperations()}
            </ProfileSidebar>
            <ProfileContent>
              <h2 style={{ marginBottom: 24, textTransform: 'uppercase' }}>My lists</h2>
              <UserLists>
                {lists.map((list) => (
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
                          dialogState={shareListDialog}
                          facebookAppId={facebookAppId}
                          shareUrl={`${baseUrl}/lists/${list._id}`}
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
                ))}
              </UserLists>
            </ProfileContent>
          </ProfileContainer>
        </Content>
      </Body>
      <Footer />
    </Layout>
  );
};

export async function getServerSideProps({ req, res }) {
  const session = await NextAuth.session({ req });

  if (!session) {
    res.setHeader('location', '/auth/signin');
    res.statusCode = 302;
    res.end();
    return { props: {} };
  }

  const apiRes = await fetch(`${process.env.SITE}/api/profile/lists`, {
    headers: {
      cookie: req.headers.cookie,
    },
  });
  const lists = await apiRes.json();

  return {
    props: {
      session,
      lists,
      baseUrl: process.env.SITE,
      facebookAppId: process.env.FACEBOOK_ID,
    },
  };
}
