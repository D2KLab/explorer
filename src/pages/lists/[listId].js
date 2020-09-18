import styled from 'styled-components';
import Link from 'next/link';
import { getSession } from 'next-auth/client';

import Header from '@components/Header';
import Footer from '@components/Footer';
import Layout from '@components/Layout';
import Body from '@components/Body';
import Content from '@components/Content';
import Media from '@components/Media';
import Element from '@components/Element';
import Title from '@components/Title';
import PageTitle from '@components/PageTitle';
import ListSettings from '@components/ListSettings';
import ListDeletion from '@components/ListDeletion';
import { Navbar, NavItem } from '@components/Navbar';
import { absoluteUrl, uriToId, generateMediaUrl } from '@helpers/utils';
import { getSessionUser, getListById } from '@helpers/database';
import SparqlClient from '@helpers/sparql';
import { getEntityLabelForRoute } from '@helpers/explorer';
import config from '~/config';
import { useTranslation, Trans } from '~/i18n';

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

const ListsPage = ({ isOwner, list, shareLink, error }) => {
  const { t } = useTranslation('common');

  const renderListItems = () => {
    return (
      <Element marginY={24}>
        <h2>{t('list.items')}</h2>
        <Element marginY={12}>
          {list.items.length > 0 ? (
            <Results>
              {list.items.map((item) => {
                const [, route] =
                  Object.entries(config.routes).find(([routeName]) => {
                    return routeName === item.route;
                  }) || [];

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
                    as={`/${item.route}/${encodeURIComponent(
                      uriToId(item.id, { base: route.uriBase })
                    )}`}
                    passHref
                  >
                    <a>
                      <StyledMedia
                        title={item.title}
                        subtitle={item.subtitle}
                        thumbnail={generateMediaUrl(item.image, 300)}
                        direction="column"
                        link={`/${item.route}/${encodeURIComponent(
                          uriToId(item.id, { base: route.uriBase })
                        )}`}
                        uri={item.graph}
                      />
                    </a>
                  </Link>
                );
              })}
            </Results>
          ) : (
            <p>{t('list.empty')}</p>
          )}
        </Element>
      </Element>
    );
  };

  const renderOperations = () => {
    if (!isOwner) {
      return null;
    }

    return (
      <Element marginY={24}>
        <h2>{t('list.operations')}</h2>
        <Element marginY={12}>
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
                <NavItem>
                  <h1>{list.name}</h1>
                </NavItem>
                <NavItem>{isOwner && <ListSettings list={list} />}</NavItem>
              </Navbar>
              <Element>
                <p>
                  <Trans
                    i18nKey="list.created"
                    components={[
                      <time
                        dateTime={new Date(list.created_at).toISOString()}
                        title={new Date(list.created_at).toString()}
                      />,
                    ]}
                    values={{
                      date: new Date(list.created_at).toLocaleDateString(),
                    }}
                  />
                </p>
                <p>
                  <Trans
                    i18nKey="list.updated"
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
                </p>
              </Element>
              {isOwner && (
                <>
                  <p>
                    <Trans
                      i18nKey="common:list.privacy.text"
                      components={[<strong />]}
                      values={{
                        status: list.is_public
                          ? t('list.privacy.status.public')
                          : t('list.privacy.status.private'),
                      }}
                    />
                  </p>
                  {list.is_public && (
                    <p>
                      <Trans
                        i18nKey="common:list.shareLink"
                        components={[<a href={shareLink}>{shareLink}</a>]}
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
            <PageTitle title={error.message} />
            <Title>{t('common:errors.listNotFound')}</Title>
            <Content>
              <p>{error.message}</p>
            </Content>
          </>
        )}
      </Body>
      <Footer />
    </Layout>
  );
};

export async function getServerSideProps(ctx) {
  const { req, res, query } = ctx;
  const session = await getSession(ctx);
  const list = await getListById(query.listId);

  if (!list) {
    // List not found
    res.statusCode = 404;
    return {
      props: {
        error: 'List not found',
      },
    };
  }

  // Get current user
  const user = await getSessionUser(session);

  const isOwner = user && list && list.user.equals(user._id);

  if (!list.is_public && !isOwner) {
    res.setHeader('location', '/auth/signin');
    res.statusCode = 302;
    res.end();
    return { props: {} };
  }

  // Get details (title, image, ...) for each item in the list
  for (let i = 0; i < list.items.length; i += 1) {
    const item = list.items[i];
    const [routeName, route] =
      Object.entries(config.routes).find(([rName]) => {
        return rName === item.type;
      }) || [];

    if (route) {
      const searchQuery = JSON.parse(JSON.stringify(route.query));
      searchQuery.$filter = `?id = <${item.uri}>`;

      try {
        const searchRes = await SparqlClient.query(searchQuery, {
          endpoint: config.api.endpoint,
          debug: config.debug,
        });
        const result = searchRes['@graph'][0];

        let mainImage = null;
        if (result.representation && result.representation.image) {
          mainImage = Array.isArray(result.representation.image)
            ? result.representation.image.shift()
            : result.representation.image;
        } else if (Array.isArray(result.representation)) {
          mainImage =
            result.representation[0].image ||
            result.representation[0]['@id'] ||
            result.representation[0];
        }

        const label = getEntityLabelForRoute(result, route);

        list.items[i] = {
          id: result['@id'],
          title: label,
          subtitle: result.time && result.time.label ? result.time.label : '',
          image: mainImage,
          graph: result['@graph'] || null,
          route: routeName,
        };
      } catch (err) {
        console.error(err);
      }
    }
  }

  return {
    props: {
      list: JSON.parse(JSON.stringify(list)), // serialize the list
      isOwner,
      shareLink: `${absoluteUrl(req)}/lists/${list._id}`,
    },
  };
}

export default ListsPage;
