import styled from 'styled-components';
import { useState } from 'react';
import { useDialogState, Dialog, DialogDisclosure, DialogBackdrop } from 'reakit/Dialog';
import { Helmet } from 'react-helmet';
import Link from 'next/link';
import NextAuth from 'next-auth/client';

import { Header, Footer, Layout, Body, Content, Title, Element, Button } from '@components';

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
  background-color: #fff;
  color: #dc3545;
  font-weight: bold;
  border: 1px solid rgba(27, 31, 35, 0.35);
  border-radius: 0.25em;
`;

export default ({ session, lists }) => {
  const deleteAccountDialog = useDialogState();
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const deleteAccount = async () => {
    setIsDeletingAccount(true);
    await fetch(`/api/profile`, {
      method: 'DELETE',
    });
    NextAuth.signout();
  };

  const renderOperations = () => {
    return (
      <Element marginY={24}>
        <h2 style={{ color: '#dc3545', fontWeight: 'bold' }}>Delete account</h2>
        <Element marginY={12}>
          <DialogDisclosure {...deleteAccountDialog} as={DeleteButton} loading={isDeletingAccount}>
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
      </Element>
    );
  };

  return (
    <Layout>
      <Helmet title="Profile" />
      <Header />
      <Body>
        <Title>{session.user.name}</Title>
        <Content>
          <h2>Saved lists</h2>
          <ul>
            {lists.map((list) => (
              <li key={list._id}>
                <Link href={`/lists/${list._id}`} passHref>
                  <a>{list.name}</a>
                </Link>
                {` (${list.items.length})`}
              </li>
            ))}
          </ul>
          {renderOperations()}
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
    },
  };
}
