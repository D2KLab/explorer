import React, { useCallback } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { useDialogState, Dialog, DialogDisclosure } from 'reakit/Dialog';
import { useDropzone } from 'react-dropzone';
import { SearchAlt2 } from '@styled-icons/boxicons-regular/SearchAlt2';
import { Camera } from '@styled-icons/boxicons-solid/Camera';
import { Button as ReakitButton } from 'reakit';

import Layout from '@components/Layout';
import Header from '@components/Header';
import Footer from '@components/Footer';
import Body from '@components/Body';
import SearchInput from '@components/SearchInput';
import PageTitle from '@components/PageTitle';
import breakpoints from '@styles/breakpoints';
import { useTranslation } from '~/i18n';
import config from '~/config';

const Hero = styled.div`
  width: 100%;
  min-height: calc(
    100vh - ${({ theme }) => `${theme.header.height} - ${theme.header.borderBottomWidth}`}
  );
  position: relative;

  display: flex;
  flex-direction: column;
`;

const HeroTop = styled.div`
  height: calc(
    (100vh - ${({ theme }) => `${theme.header.height} - ${theme.header.borderBottomWidth}`}) / 2
  );
  min-height: fit-content;
  display: flex;
  flex-direction: column-reverse;
  justify-content: center;
  align-items: center;
  width: 100%;
  background-color: #fff;
  position: relative;
  background-image: url(${config.home.hero.image});
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;

  ${breakpoints.tablet`
    flex-direction: row;
  `}
`;

const Title = styled.h1`
  width: 80%;
  text-align: center;

  ${breakpoints.tablet`
    width: 50%;
    height: auto;
    font-size: 3.5rem;
    text-align: left;
  `}

  ${breakpoints.desktop`
    font-size: 4rem;
  `}

  ${({ theme }) => theme?.pages?.HomePage?.Title};
`;

const Logo = styled.div`
  background-image: url(${config.metadata.logo});
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  width: 50%;
  height: 50%;
  max-width: 350px;

  ${breakpoints.tablet`
    height: 100%;
  `}
`;

const HeroMiddle = styled.div`
  width: 100%;
  height: 3.5em;
  margin-top: -28px;
  display: flex;
  justify-content: center;
`;

const HeroBottom = styled.div`
  min-height: calc(
    (100vh - ${({ theme }) => `${theme.header.height} - ${theme.header.borderBottomWidth}`}) / 2
  );
  margin-top: -28px;
  padding-bottom: 1em;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  background-color: #eee;
`;

const Subtitle = styled.span`
  display: block;
  font-size: 2rem;
  color: #787878;
  margin-top: 1em;
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
  overflow: auto;
  padding: 0 0.5em;
  flex: 0.5;
`;

const BigButton = styled.a`
  background-color: ${({ background }) => background};
  text-decoration: none;
  color: ${({ color }) => color};
  text-transform: uppercase;
  padding: 0.75em;
  text-align: center;
  border-radius: 8px;
  font-size: 2em;
  margin: 10px 20px;

  &:hover {
    color: ${({ color }) => color};
    text-decoration: underline;
  }
`;

const SearchForm = styled.form`
  display: flex;
  align-items: center;
  flex-grow: 1;
  max-width: 90%;
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12),
    0 1px 5px 0 rgba(0, 0, 0, 0.2);
  position: relative;
  height: 100%;
  position: relative;

  ${breakpoints.tablet`
    max-width: 70%;
  `}
`;

const StyledSearchInput = styled(SearchInput)`
  flex: 1;

  .react-autosuggest__input {
    appearance: none;
    background-color: transparent;
    border: none;
    font-size: 1.2rem;
    letter-spacing: 0.1rem;
    padding: 0 10px;
    min-width: 0;
    width: 100%;
    outline: 0;
  }

  .react-autosuggest__container--open .react-autosuggest__suggestions-container {
    border: none;
    max-width: auto;
    min-width: 100%;
    right: auto;
    left: 0;
    top: 45px;

    background-color: #ffffff;
    outline: 0;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12),
      0 1px 5px 0 rgba(0, 0, 0, 0.2);
    color: #212121;
    border-bottom-left-radius: 0.25rem;
    border-bottom-right-radius: 0.25rem;
  }
`;

const SearchButton = styled(ReakitButton)`
  display: flex;
  justify-content: center;
  align-items: center;
  appearance: none;
  border: none;
  height: 80%;
  background-color: ${({ theme }) => theme.home.textSearchButton.background};
  color: ${({ theme }) => theme.home.textSearchButton.text};
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12),
    0 1px 5px 0 rgba(0, 0, 0, 0.2);
  margin-right: 10px;
  width: 50px;
  cursor: pointer;

  ${breakpoints.tablet`
    width: 80px;
  `}
`;

const CameraButton = styled(SearchButton)`
  background-color: ${({ theme }) => theme.home.imageSearchButton.background};
  color: ${({ theme }) => theme.home.imageSearchButton.text};
`;

const SearchIcon = styled(SearchAlt2)`
  height: 32px;
`;

const CameraIcon = styled(Camera)`
  height: 32px;
`;

const StyledUploadDialog = styled(Dialog)`
  background-color: #ffffff;
  border-radius: 0.25rem;
  outline: 0;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12),
    0 1px 5px 0 rgba(0, 0, 0, 0.2);
  color: #212121;
  z-index: 999;
  position: absolute;
  top: 0;
  width: 100%;
  padding: 1em;
`;

const Dropzone = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-width: 2px;
  border-radius: 2px;
  border-color: #eeeeee;
  border-style: dashed;
  background-color: #fafafa;
  color: #bdbdbd;
  outline: none;
  transition: border 0.24s ease-in-out;

  &:focus {
    border-color: #2196f3;
  }
`;

const HomePage = () => {
  const { t } = useTranslation(['common', 'home', 'project']);

  // Search by image
  const dialog = useDialogState();
  const onDrop = useCallback(
    (/* acceptedFiles */) => {
      // TODO: do something with the files
    },
    []
  );
  const { acceptedFiles, getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  const files = acceptedFiles.map((file) => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));

  return (
    <Layout>
      <PageTitle title={t('common:home.title')} />
      <Header />
      <Body>
        <Hero>
          <HeroTop>
            {config.home.hero.showHeadline && <Title>{t('home:hero.headline')}</Title>}
            {config.home.hero.showLogo && <Logo />}
          </HeroTop>
          <HeroMiddle>
            <SearchForm method="GET" action="/browse">
              <input type="hidden" name="type" value={config.search.route} />
              {config.search.allowTextSearch ? (
                <>
                  <StyledSearchInput name="q" placeholder={t('home:search.placeholder')} />
                  <SearchButton aria-label={t('common:buttons.searchByText')} type="submit">
                    <SearchIcon />
                  </SearchButton>
                </>
              ) : null}
              {config.search.allowImageSearch ? (
                <>
                  <CameraButton
                    as={DialogDisclosure}
                    type="button"
                    aria-label={t('common:buttons.searchByImage')}
                    {...dialog}
                    style={{ opacity: 0.5, pointerEvents: 'none' }}
                  >
                    <CameraIcon />
                  </CameraButton>
                  <StyledUploadDialog
                    {...dialog}
                    modal={false}
                    aria-label={t('common:buttons.searchByImage')}
                    {...getRootProps()}
                  >
                    <h4>{t('common:buttons.searchByImage')}</h4>
                    <Dropzone>
                      <input {...getInputProps()} />
                      {isDragActive ? (
                        <p>{t('common:home.searchByImage.dropTitle')}</p>
                      ) : (
                        <p>{t('common:home.searchByImage.dropText')}</p>
                      )}
                      <ul>{files}</ul>
                    </Dropzone>
                  </StyledUploadDialog>
                </>
              ) : null}
            </SearchForm>
          </HeroMiddle>
          <HeroBottom>
            <Subtitle>{t('home:browseBy')}</Subtitle>
            <ButtonsContainer>
              {Object.keys(config.routes)
                .filter((routeName) => config.routes[routeName].showInNavbar !== false)
                .flatMap((routeName) => (
                  <Link key={routeName} href={`/${routeName}`} passHref>
                    <BigButton
                      background={config.routes[routeName].backgroundColor || '#c6c6c6'}
                      color={config.routes[routeName].textColor || '#000000'}
                    >
                      {t(
                        `project:routes.${routeName}`,
                        routeName.substr(0, 1).toUpperCase() + routeName.substr(1)
                      )}
                    </BigButton>
                  </Link>
                ))}
            </ButtonsContainer>
          </HeroBottom>
        </Hero>
      </Body>
      <Footer />
    </Layout>
  );
};

HomePage.getInitialProps = () => {
  return {
    namespacesRequired: ['common', 'home'],
  };
};

export default HomePage;
