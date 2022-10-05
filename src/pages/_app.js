import { SessionProvider } from 'next-auth/react';
import App from 'next/app';
import { withRouter } from 'next/router';
import { ThemeProvider } from 'styled-components';
import { Reset } from 'styled-reset';
import Head from 'next/head';
import Cookies from 'js-cookie';

import NProgress, { NProgressStyle } from '@components/NProgress';
import ConsentPopup from '@components/ConsentPopup';
import RRWebRecorder from '@components/RRWebRecorder';
import GoogleAnalytics from '@components/GoogleAnalytics';
import { appWithTranslation } from 'next-i18next';
import theme from '~/theme';
import config from '~/config';

function MyApp({ Component, pageProps }) {
  const { session } = pageProps;

  return (
    <ThemeProvider theme={theme}>
      <Reset />
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <NProgressStyle />
      <NProgress />
      {config.plugins?.consent?.show && typeof Cookies.get('consent') === 'undefined' ? (
        <ConsentPopup />
      ) : (
        <div />
      )}
      {config.plugins?.consent?.show && Cookies.get('consent') === '1' && <RRWebRecorder />}
      <GoogleAnalytics />
      <SessionProvider session={session} site={process.env.SITE} refetchInterval={5 * 60}>
        <Component {...pageProps} />
      </SessionProvider>
    </ThemeProvider>
  );
}

export default appWithTranslation(withRouter(MyApp));
