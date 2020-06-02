import styled, { withTheme } from 'styled-components';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import Link from 'next/link';
import Router from 'next/router';
import { useDialogState, Dialog, DialogDisclosure, DialogBackdrop } from 'reakit/Dialog';
import { DotsHorizontalRounded as SettingsIcon } from '@styled-icons/boxicons-regular/DotsHorizontalRounded';
import Switch from 'react-switch';

import { uriToId } from '@helpers/utils';
import {
  Header,
  Footer,
  Layout,
  Body,
  Content,
  Title,
  Media,
  Navbar,
  NavItem,
  Element,
} from '@components';
import Button from '@components/Button';
import Input from '@components/Input';
import config from '~/config';

const sparqlTransformer = require('sparql-transformer').default;

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
  text-decoration: underline;

  &:hover {
    font-weight: bold;
  }
`;

const StyledSettingsIcon = styled(SettingsIcon)`
  color: #222;
  height: 24px;
`;

const StyledMedia = styled(Media)`
  margin-left: var(--card-margin);
  margin-right: var(--card-margin);
`;

const Results = styled.div`
  display: flex;
  flex-wrap: wrap;

  --card-margin: 12px;
  margin: 0 calc(-1 * var(--card-margin));
`;

export default withTheme(({ isOwner, list, shareLink, error, theme }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const settingsDialog = useDialogState();
  const [listName, setListName] = useState(list.name);
  const [listPublic, setListPublic] = useState(list.is_public);

  const deleteList = async () => {
    setIsDeleting(true);
    await fetch(`/api/lists/${list._id}`, {
      method: 'DELETE',
    });
    Router.push({
      pathname: '/profile',
    });
  };

  const updateSettings = async () => {
    setIsUpdating(true);
    await fetch(`/api/lists/${list._id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: listName,
        is_public: listPublic,
      }),
    });
    Router.reload();
  };

  const renderListItems = () => {
    return (
      <Element marginY={24}>
        <h2>Items in the list</h2>
        <Element marginY={12}>
          {list.items.length > 0 ? (
            <Results>
              {list.items.map((item) => {
                return (
                  <StyledMedia
                    key={item.id}
                    title={item.title}
                    subtitle={item.subtitle}
                    thumbnail={item.image}
                    direction="column"
                    link={`/${item.route}/${uriToId(item.id)}`}
                    uri={item.graph}
                  />
                );
              })}
            </Results>
          ) : (
            <p>This list is empty!</p>
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
        <h2>Operations</h2>
        <Element marginY={12}>
          <Button onClick={deleteList} loading={isDeleting}>
            Delete list
          </Button>
        </Element>
      </Element>
    );
  };

  useEffect(() => {
    // Reset form when visibility changes
    setListName(list.name);
    setListPublic(list.is_public);
  }, [settingsDialog.visible]);

  return (
    <Layout>
      <Header />
      <Body>
        {(list && (
          <>
            <Helmet title={list.name} />
            <Content>
              <Navbar>
                <NavItem>
                  <h1>{list.name}</h1>
                </NavItem>
                <NavItem>
                  {isOwner && (
                    <>
                      <StyledDialogDisclosure {...settingsDialog}>
                        <StyledSettingsIcon />
                      </StyledDialogDisclosure>
                      <StyledDialogBackdrop {...settingsDialog}>
                        <StyledDialog {...settingsDialog} modal aria-label="Settings">
                          <Element marginBottom={24}>
                            <h2>Settings</h2>
                          </Element>
                          <Element display="flex" alignItems="center" marginBottom={24}>
                            <Element paddingRight={12}>
                              <label htmlFor="list_name">Name</label>
                            </Element>
                            <Input
                              id="list_name"
                              name="list_name"
                              type="text"
                              placeholder="List name"
                              value={listName}
                              onChange={(e) => setListName(e.target.value)}
                            />
                          </Element>
                          <Element display="flex" alignItems="center" marginBottom={24}>
                            <Element paddingRight={12}>
                              <label htmlFor="list_public">Public?</label>
                            </Element>
                            <Switch
                              onChange={(checked) => setListPublic(checked)}
                              checked={listPublic}
                              onColor={theme.colors.light}
                              offHandleColor="#f0f0f0"
                              onHandleColor={theme.colors.primary}
                              handleDiameter={24}
                              uncheckedIcon={false}
                              checkedIcon={false}
                              boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                              activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                              height={16}
                              width={36}
                              id="list_public"
                            />
                          </Element>
                          <Element display="flex" justifyContent="space-between" marginTop={24}>
                            <Button
                              type="button"
                              onClick={() => {
                                settingsDialog.hide();
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              loading={isUpdating}
                              onClick={async () => {
                                await updateSettings();
                                settingsDialog.hide();
                              }}
                            >
                              Save
                            </Button>
                          </Element>
                        </StyledDialog>
                      </StyledDialogBackdrop>
                    </>
                  )}
                </NavItem>
              </Navbar>
              {isOwner && (
                <>
                  <p>
                    This list is <strong>{list.is_public ? 'public' : 'private'}</strong>.
                  </p>
                  {list.is_public && (
                    <p>
                      Public link: <a href={shareLink}>{shareLink}</a>
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
            <Helmet title={error.message} />
            <Title>List not found</Title>
            <Content>
              <p>{error.message}</p>
            </Content>
          </>
        )}
      </Body>
      <Footer />
    </Layout>
  );
});

export async function getServerSideProps({ req, res, query }) {
  // Fetch the list
  const listApiRes = await fetch(`${process.env.SITE}/api/lists/${query.listId}`, {
    headers: {
      cookie: req.headers.cookie,
    },
  });
  const list = await listApiRes.json();

  if (list.error) {
    // List not found
    res.statusCode = 404;
    return {
      props: {
        error: list.error,
      },
    };
  }

  // Get current user
  const userApiRes = await fetch(`${process.env.SITE}/api/profile`, {
    headers: {
      cookie: req.headers.cookie,
    },
  });
  const user = await userApiRes.json();

  const isOwner = user && list.user === user._id;

  if (!list.is_public && !isOwner) {
    res.setHeader('location', '/api/auth/signin');
    res.statusCode = 302;
    res.end();
    return { props: {} };
  }

  // Get details (title, image, ...) for each item in the list
  for (let i = 0; i < list.items.length; i += 1) {
    const item = list.items[i];
    const [routeName, route] = Object.entries(config.routes).find(([, r]) => {
      return r.uriBase && item.startsWith(r.uriBase);
    });

    if (route) {
      const searchQuery = JSON.parse(JSON.stringify(route.query));
      searchQuery.$filter = `?id = <${item}>`;

      try {
        if (config.debug) {
          console.log('searchQuery:', JSON.stringify(searchQuery, null, 2));
        }
        const res = await sparqlTransformer(searchQuery, {
          endpoint: config.api.endpoint,
          debug: config.debug,
        });
        const result = res['@graph'][0];

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
        const label = route.labelFunc(result);

        list.items[i] = {
          id: result['@id'],
          title: label,
          subtitle: result.time && result.time.label ? result.time.label : '',
          image: mainImage,
          graph: result['@graph'],
          route: routeName,
        };
      } catch (err) {
        console.error(err);
      }
    }
  }

  return {
    props: {
      list,
      isOwner,
      shareLink: `${process.env.SITE}/lists/${list._id}`,
    },
  };
}
