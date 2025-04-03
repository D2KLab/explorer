import { useDialogStore, DialogDisclosure } from '@ariakit/react';
import DefaultErrorPage from 'next/error';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { useTranslation, Trans } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import styled from 'styled-components';

import Body from '@components/Body';
import Button from '@components/Button';
import Content from '@components/Content';
import Element from '@components/Element';
import Footer from '@components/Footer';
import Header from '@components/Header';
import Layout from '@components/Layout';
import ListCollaboration from '@components/ListCollaboration';
import ListDeletion from '@components/ListDeletion';
import ListRemoveCollaborator from '@components/ListRemoveCollaborator';
import ListSettings from '@components/ListSettings';
import Media from '@components/Media';
import PageTitle from '@components/PageTitle';
import Title from '@components/Title';
import { getSessionUser, getListById, getUserById } from '@helpers/database';
import { generateListInviteId } from '@helpers/explorer';
import { uriToId, slugify, generateMediaUrl } from '@helpers/utils';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import { getEntity } from '@pages/api/entity';
import config from '~/config';
import theme from '~/theme';

const StyledMedia = styled(Media)`
  margin-left: var(--card-margin);
  margin-right: var(--card-margin);
`;

const Results = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, 350px);
  grid-gap: 2.5rem;
  margin: 1rem 0;

  transition: opacity 250ms cubic-bezier(0.23, 1, 0.32, 1) 0s;
  opacity: ${({ loading }) => (loading ? 0.25 : 1)};
  pointer-events: ${({ loading }) => (loading ? 'none' : 'auto')};
`;

const Navbar = styled.div`
  display: flex;
  align-items: center;
`;

const StyledDialogDisclosure = styled(DialogDisclosure)`
  appearance: none;
  background-color: transparent;
  border: none;
  cursor: pointer;
`;

function DeleteIcon(props) {
  return (
    <svg height="20" width="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path d="M17.5 12a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zm-5.48 2a6.47 6.47 0 0 0 .6 7.8c-.8.13-1.68.2-2.62.2-2.89 0-5.13-.66-6.7-2A3.75 3.75 0 0 1 2 17.16v-.91C2 15.01 3.01 14 4.25 14h7.77zm3.07.97-.07.05-.05.07a.5.5 0 0 0 0 .57l.05.07 1.77 1.77-1.76 1.77-.06.07a.5.5 0 0 0 0 .57l.06.06.07.06c.17.12.4.12.56 0l.07-.06 1.77-1.76 1.77 1.77.07.05c.17.12.4.12.57 0l.07-.05.05-.07a.5.5 0 0 0 0-.57l-.05-.07-1.77-1.77 1.77-1.77.06-.07a.5.5 0 0 0 0-.57l-.06-.07-.07-.05a.5.5 0 0 0-.57 0l-.07.05-1.77 1.77-1.77-1.77-.07-.05a.5.5 0 0 0-.5-.05l-.07.05zM10 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10z"></path>
    </svg>
  );
}

function ListsPage({ isOwner, collaborators, list, shareLink, inviteUrl }) {
  const { t, i18n } = useTranslation('common');

  if (!list) {
    return <DefaultErrorPage statusCode={404} title={t('common:errors.listNotFound')} />;
  }

  const renderListItems = () => (
    <Element marginY={24}>
      <h2>{t('common:list.items')}</h2>
      <Element marginY={12}>
        {list.items.length > 0 ? (
          <Results>
            {list.items.map(({ result, routeName }) => {
              const [, route] =
                Object.entries(config.routes).find(([name]) => name === routeName) || [];

              if (!route) {
                return null;
              }

              return (
                <Link
                  key={result['@id']}
                  href={`/details/${route.details.view}?id=${encodeURIComponent(
                    uriToId(result['@id'], {
                      base: route.uriBase,
                    }),
                  )}&type=${routeName}`}
                  as={`/${routeName}/${encodeURI(uriToId(result['@id'], { base: route.uriBase }))}`}
                  style={{ color: 'inherit', textDecoration: 'inherit' }}
                >
                  <StyledMedia
                    title={result.title}
                    subtitle={result.subtitle}
                    thumbnail={generateMediaUrl(result.image, 300)}
                    direction="column"
                    link={`/${routeName}/${encodeURI(
                      uriToId(result['@id'], { base: route.uriBase }),
                    )}`}
                    uri={result.graph}
                  />
                </Link>
              );
            })}
          </Results>
        ) : (
          <p>{t('common:list.empty')}</p>
        )}
      </Element>
    </Element>
  );

  const renderOperations = () => {
    return (
      <Element marginY={24}>
        <Element marginBottom={12}>
          <h2>{t('common:list.operations')}</h2>
        </Element>
        <Element marginBottom={12} display="flex" style={{ gap: 12 }}>
          <Link
            href={`/api/lists/${list._id}/download?hl=${encodeURIComponent(i18n.language)}`}
            passHref
            legacyBehavior
          >
            <Button primary target="_blank">
              {t('common:buttons.download')}
            </Button>
          </Link>
          {isOwner && <ListDeletion list={list} />}
          {isOwner && <ListCollaboration inviteUrl={inviteUrl} />}
        </Element>
      </Element>
    );
  };

  const renderCollaborators = () => {
    if (!isOwner || collaborators.length === 0) return null;
    return (
      <Element marginY={24}>
        <Element marginBottom={12}>
          <h2>{t('common:list.collaborators')}</h2>
        </Element>
        <Element marginBottom={12} display="flex" style={{ gap: 12 }}>
          <ul>
            {collaborators.map((collaborator) => {
              // eslint-disable-next-line react-hooks/rules-of-hooks
              const removeCollaboratorDialog = useDialogStore();
              return (
                <li key={collaborator._id}>
                  <Element display="flex" alignItems="center" style={{ gap: 8 }}>
                    <ListRemoveCollaborator
                      list={list}
                      user={collaborator}
                      dialogStore={removeCollaboratorDialog}
                    >
                      <StyledDialogDisclosure store={removeCollaboratorDialog}>
                        <DeleteIcon fill={theme.colors.danger} />
                      </StyledDialogDisclosure>
                    </ListRemoveCollaborator>
                    <span>{collaborator.name}</span>
                  </Element>
                </li>
              );
            })}
          </ul>
        </Element>
      </Element>
    );
  };

  return (
    <Layout>
      <Header />
      <Body>
        {(list && (
          <>
            <PageTitle title={list.name} />
            <Content>
              <Navbar>
                <div>
                  <h1>{list.name}</h1>
                </div>
                <div>{isOwner && <ListSettings list={list} />}</div>
              </Navbar>
              <Element>
                <p>
                  <Trans
                    i18nKey="list.created"
                    components={[
                      <time
                        key="0"
                        dateTime={new Date(list.created_at).toISOString()}
                        title={new Date(list.created_at).toISOString()}
                      />,
                    ]}
                    values={{
                      date: new Date(list.created_at).toLocaleDateString(i18n.language),
                    }}
                  />
                </p>
                <p>
                  <Trans
                    i18nKey="list.updated"
                    components={[
                      <time
                        key="0"
                        dateTime={new Date(list.updated_at).toISOString()}
                        title={new Date(list.updated_at).toISOString()}
                      />,
                    ]}
                    values={{
                      date: new Date(list.updated_at).toLocaleDateString(i18n.language),
                    }}
                  />
                </p>
              </Element>
              {isOwner && (
                <>
                  <p>
                    <Trans
                      key="0"
                      i18nKey="common:list.privacy.text"
                      components={[<strong key="0" />]}
                      values={{
                        status: list.is_public
                          ? t('common:list.privacy.status.public')
                          : t('common:list.privacy.status.private'),
                      }}
                    />
                  </p>
                  {list.is_public && (
                    <p>
                      <Trans
                        i18nKey="common:list.shareLink"
                        components={[
                          <a key="0" href={shareLink}>
                            {shareLink}
                          </a>,
                        ]}
                        values={{
                          link: shareLink,
                        }}
                      />
                    </p>
                  )}
                </>
              )}
              {renderOperations()}
              {renderCollaborators()}
              {renderListItems()}
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
  const list = await getListById(query.listId.split('-').pop());

  const props = {
    ...(await serverSideTranslations(ctx.locale, ['common', 'project', 'search'])),
  };

  if (!list) {
    // List not found
    res.statusCode = 404;
    return { props };
  }

  // Get current user
  const user = await getSessionUser(session);

  const isOwner = user && list && list.user.equals(user._id);
  const isCollaborator = user && list?.collaborators?.some((id) => id.equals(user._id));

  if (!list.is_public && !isOwner && !isCollaborator) {
    res.setHeader('location', '/auth/signin');
    res.statusCode = 302;
    res.end();
    return { props };
  }

  // Get details (title, image, ...) for each item in the list
  for (let i = 0; i < list.items.length; i += 1) {
    const item = list.items[i];
    const [routeName, route] =
      Object.entries(config.routes).find(([rName]) => rName === item.type) || [];

    if (route) {
      const result = await getEntity(
        {
          id: uriToId(item.uri, { base: route.uriBase }),
          type: item.type,
        },
        ctx.locale,
      );

      if (result) {
        list.items[i] = { result, routeName };
      }
    }
  }

  // Get collaborators names
  const collaborators = [];
  if (isOwner && Array.isArray(list.collaborators)) {
    for (let i = 0; i < list.collaborators.length; i += 1) {
      const collaborator = await getUserById(list.collaborators[i]);
      collaborators.push({ _id: collaborator._id.toString(), name: collaborator.name });
    }
  }

  const listUrl = `${process.env.SITE}/lists/${slugify(list.name)}-${list._id}`;

  props.list = JSON.parse(JSON.stringify(list)); // serialize the list;
  props.shareLink = listUrl;
  props.isOwner = isOwner;
  props.inviteUrl = `${listUrl}/invite/${generateListInviteId(list)}`;
  props.collaborators = collaborators;

  return {
    props,
  };
}

export default ListsPage;
