import { useEffect } from 'react';
import NextAuth from 'next-auth/client';
import { ThemeProvider } from 'styled-components';
import { Provider as ReakitProvider } from 'reakit';
import { Reset } from 'styled-reset';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

import NProgress from '@components/NProgress';
import ConsentPopup from '@components/ConsentPopup';
import RRWebRecorder from '@components/RRWebRecorder';
import theme from '~/theme';
import config from '~/config';
import { appWithTranslation } from '~/i18n';

const App = ({ Component, pageProps }) => {
  const { session } = pageProps;

  const router = useRouter();
  useEffect(() => {
    const handleRouteChange = (url) => {
      if (typeof window?.gtag !== 'undefined' && typeof config.analytics?.id !== 'undefined') {
        window.gtag('config', config.analytics.id, {
          page_path: url,
        });
      }
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <ThemeProvider theme={theme}>
      <ReakitProvider>
        <Reset />
        <Head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/images/favicon.png" type="image/png" />
          <link rel="shortcut icon" href="/images/favicon.png" type="image/png" />
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
        {config.plugins?.consent?.show && typeof Cookies.get('consent') === 'undefined' ? (
          <ConsentPopup />
        ) : (
          <div />
        )}
        {config.plugins?.consent?.show && Cookies.get('consent') === '1' && <RRWebRecorder />}
        <NextAuth.Provider options={{ site: process.env.SITE }} session={session}>
          <Component {...pageProps} />
        </NextAuth.Provider>
      </ReakitProvider>
    </ThemeProvider>
  );
};

export default appWithTranslation(App);
