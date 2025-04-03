import DefaultErrorPage from 'next/error';
import { useRouter } from 'next/router';
import { getServerSession } from 'next-auth';
import { Trans, useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import Body from '@components/Body';
import Button from '@components/Button';
import Content from '@components/Content';
import Element from '@components/Element';
import Footer from '@components/Footer';
import Header from '@components/Header';
import Layout from '@components/Layout';
import PageTitle from '@components/PageTitle';
import Title from '@components/Title';
import { getSessionUser, getListById } from '@helpers/database';
import { generateListInviteId } from '@helpers/explorer';
import { slugify } from '@helpers/utils';
import { authOptions } from '@pages/api/auth/[...nextauth]';

function ListInvitePage({ list }) {
  const { t } = useTranslation('common');
  const { query } = useRouter();

  if (!list) {
    return <DefaultErrorPage statusCode={404} title={t('common:errors.listNotFound')} />;
  }

  return (
    <Layout>
      <Header />
      <Body>
        {(list && (
          <>
            <PageTitle title={list.name} />
            <Content
              style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              <Element
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
              >
                <h1>{t('common:list.invite.title')}</h1>
                <p style={{ textAlign: 'center' }}>
                  <Trans
                    key="0"
                    i18nKey="common:list.invite.firstLine"
                    components={[<strong key="0" />]}
                    values={{
                      name: list.name,
                    }}
                  />
                  <br />
                  <em>{t('common:list.invite.secondLine')}</em>
                </p>
                <Element display="flex" style={{ gap: 24 }}>
                  <Button secondary href="/">
                    {t('common:list.invite.decline')}
                  </Button>
                  <form action={`/api/lists/${list._id}/invite`} method="POST">
                    <input type="hidden" name="inviteId" value={query.inviteId} />
                    <Button primary type="submit">
                      {t('common:list.invite.accept')}
                    </Button>
                  </form>
                </Element>
              </Element>
            </Content>
          </>
        )) || (
          <>
            <PageTitle title={t('common:errors.listNotFound')} />
            <Title>{t('common:errors.listNotFound')}</Title>
          </>
        )}
      </Body>
      <Footer />
    </Layout>
  );
}

export async function getServerSideProps(ctx) {
  const { req, res, query } = ctx;
  const session = await getServerSession(req, res, authOptions);

  const props = {
    ...(await serverSideTranslations(ctx.locale, ['common', 'project', 'search'])),
  };

  // Get current user
  const user = await getSessionUser(session);

  if (!user) {
    res.setHeader('location', '/auth/signin');
    res.statusCode = 302;
    res.end();
    return { props };
  }

  const list = await getListById(query.listId.split('-').pop());

  if (!list) {
    // List not found
    res.statusCode = 404;
    return { props };
  }

  if (query.inviteId !== generateListInviteId(list)) {
    // Invalid invite id
    res.statusCode = 403;
    return { props };
  }

  const listUrl = `/lists/${slugify(list.name)}-${list._id}`;

  const isOwner = user && list && list.user.equals(user._id);
  if (isOwner) {
    // If the user is the owner of the list, send them back to the list page
    res.setHeader('location', listUrl);
    res.statusCode = 302;
    res.end();
    return { props };
  }

  const collaborators = list.collaborators || [];
  if (collaborators.some((id) => id.equals(user._id))) {
    // If the user is already a collaborator, send them back to the list page
    res.setHeader('location', listUrl);
    res.statusCode = 302;
    res.end();
    return { props };
  }

  props.list = JSON.parse(JSON.stringify(list)); // serialize the list;

  return {
    props,
  };
}

export default ListInvitePage;
