import 'react-responsive-carousel/lib/styles/carousel.min.css';
import NextAuth from 'next-auth/client';
import App from 'next/app';
import { ThemeProvider } from 'styled-components';
import { Provider as ReakitProvider } from 'reakit';
import { Reset } from 'styled-reset';
import Head from 'next/head';

import NProgress from '@components/NProgress';
import theme from '~/theme';
import { appWithTranslation } from '~/i18n';

class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props;
    const { session } = pageProps;

    return (
      <ThemeProvider theme={theme}>
        <ReakitProvider>
          <Reset />
          <Head>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            {/* Import Lato font */}
            <link
              rel="stylesheet"
              href="https://fonts.googleapis.com/css?family=Lato:300,400,700,800"
            />
            <link
              rel="preload"
              as="style"
              href="https://fonts.googleapis.com/css?family=Lato:300,400,700,800"
            />
          </Head>
          <NProgress />
          <NextAuth.Provider session={session}>
            <Component {...pageProps} />
          </NextAuth.Provider>
        </ReakitProvider>
      </ThemeProvider>
    );
  }
}

export default appWithTranslation(MyApp);
