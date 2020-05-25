import NProgress from 'nprogress';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import NextAuth from 'next-auth/client';
import App from 'next/app';
import { ThemeProvider } from 'styled-components';
import { Provider as ReakitProvider } from 'reakit';
import { Reset } from 'styled-reset';
import { Helmet } from 'react-helmet';

import theme from '@styles/theme';
import config from '~/config';
import { appWithTranslation } from '~/i18n';

NProgress.configure({
  minimum: 0.15,
  trickleRate: 0.07,
  trickleSpeed: 360,
  showSpinner: false,
});

class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props;
    const { session } = pageProps;

    return (
      <ThemeProvider theme={theme}>
        <ReakitProvider>
          <Reset />
          <Helmet
            htmlAttributes={{ lang: 'en' }}
            titleTemplate={`%s - ${config.metadata.title}`}
            meta={[
              {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1',
              },
            ]}
          >
            {/* Import Lato font */}
            <link
              href="https://fonts.googleapis.com/css?family=Lato:300,400,700,800"
              rel="stylesheet"
            />
            {/* Import CSS for nprogress */}
            <link rel="stylesheet" type="text/css" href="/nprogress.css" />
          </Helmet>
          <NextAuth.Provider session={session}>
            <Component {...pageProps} />
          </NextAuth.Provider>
        </ReakitProvider>
      </ThemeProvider>
    );
  }
}

export default appWithTranslation(MyApp);
