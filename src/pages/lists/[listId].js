import { unstable_getServerSession } from 'next-auth';
import { useTranslation, Trans } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import DefaultErrorPage from 'next/error';
import Link from 'next/link';
import styled from 'styled-components';

import Body from '@components/Body';
import Button from '@components/Button';
import Content from '@components/Content';
import Element from '@components/Element';
import Footer from '@components/Footer';
import Header from '@components/Header';
import Layout from '@components/Layout';
import ListDeletion from '@components/ListDeletion';
import ListSettings from '@components/ListSettings';
import Media from '@components/Media';
import PageTitle from '@components/PageTitle';
import Title from '@components/Title';
import { getSessionUser, getListById } from '@helpers/database';
import { getEntityMainImage, getEntityMainLabel } from '@helpers/explorer';
import { uriToId, generateMediaUrl, slugify } from '@helpers/utils';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import { getEntity } from '@pages/api/entity';
import config from '~/config';

const StyledMedia = styled(Media)`
  margin-left: var(--card-margin);
  margin-right: var(--card-margin);
`;

const Results = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, 150px);
  grid-gap: 1rem;
  margin-bottom: 24px;
`;

const Navbar = styled.div`
  display: flex;
  align-items: center;
`;

function ListsPage({ isOwner, list, shareLink }) {
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
            {list.items.map((item) => {
              const [, route] =
                Object.entries(config.routes).find(([routeName]) => routeName === item.route) || [];

              if (!route) {
                return null;
              }

              return (
                <Link
                  key={item.id}
                  href={`/details/${route.details.view}?id=${encodeURIComponent(
                    uriToId(item.id, {
                      base: route.uriBase,
                    })
                  )}&type=${item.route}`}
                  as={`/${item.route}/${encodeURI(uriToId(item.id, { base: route.uriBase }))}`}
                  style={{ color: 'inherit', textDecoration: 'inherit' }}
                >
                  <StyledMedia
                    title={item.title}
                    subtitle={item.subtitle}
                    thumbnail={generateMediaUrl(item.image, 300)}
                    direction="column"
                    link={`/${item.route}/${encodeURI(uriToId(item.id, { base: route.uriBase }))}`}
                    uri={item.graph}
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
    if (!isOwner) {
      return null;
    }

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
          <ListDeletion list={list} />
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
              {renderListItems()}
              {renderOperations()}
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
  const session = await unstable_getServerSession(req, res, authOptions);
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

  if (!list.is_public && !isOwner) {
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
        ctx.locale
      );

      if (result) {
        const mainImage = await getEntityMainImage(result, { route });
        const label = getEntityMainLabel(result, { route, language: ctx.locale });

        list.items[i] = {
          id: result['@id'],
          title: label,
          subtitle: result.time && result.time.label ? result.time.label : '',
          image: mainImage,
          graph: result['@graph'] || null,
          route: routeName,
        };
      }
    }
  }

  props.list = JSON.parse(JSON.stringify(list)); // serialize the list;
  props.shareLink = `${process.env.SITE}/lists/${slugify(list.name)}-${list._id}`;
  props.isOwner = isOwner;

  return {
    props,
  };
}

export default ListsPage;
