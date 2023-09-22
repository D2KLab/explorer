import Cookies from 'js-cookie';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { withRouter } from 'next/router';
import { SessionProvider } from 'next-auth/react';
import { appWithTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { Reset } from 'styled-reset';

import ConsentPopup from '@components/ConsentPopup';
import GoogleAnalytics from '@components/GoogleAnalytics';
import { NProgressStyle } from '@components/NProgress';
import RRWebRecorder from '@components/RRWebRecorder';
import { GraphProvider } from '@helpers/useGraphs';
import GlobalStyle from '@styles/global';
import config from '~/config';
import theme from '~/theme';

const NProgress = dynamic(
  () => {
    return import('@components/NProgress');
  },
  { ssr: false },
);

function MyApp({ Component, pageProps }) {
  const { session } = pageProps;
  const [graphs, setGraphs] = useState({});

  useEffect(() => {
    (async () => {
      const results = await (await fetch('/api/graphs')).json();
      setGraphs(results);
    })();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Reset />
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <style jsx global>{`
        ${theme.globalStyle}
      `}</style>
      <GlobalStyle />
      <NProgressStyle />
      <NProgress />
      {config.plugins?.consent?.show && typeof Cookies.get('consent') === 'undefined' ? (
        <ConsentPopup />
      ) : (
        <div />
      )}
      {config.plugins?.consent?.show && Cookies.get('consent') === '1' && <RRWebRecorder />}
      <GoogleAnalytics />
      <GraphProvider value={[graphs, setGraphs]}>
        <SessionProvider session={session} site={process.env.SITE} refetchInterval={5 * 60}>
          <Component {...pageProps} />
        </SessionProvider>
      </GraphProvider>
    </ThemeProvider>
  );
}

export default appWithTranslation(withRouter(MyApp));
