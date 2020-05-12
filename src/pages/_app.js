import 'react-responsive-carousel/lib/styles/carousel.min.css';

import App from 'next/app';
import { ThemeProvider } from 'styled-components';
import { Reset } from 'styled-reset';
import { Helmet } from 'react-helmet';
import theme from '@styles/theme';
import config from '~/config';
import { appWithTranslation } from '~/i18n';

class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props;
    return (
      <ThemeProvider theme={theme}>
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
        />
        <Component {...pageProps} />
      </ThemeProvider>
    );
  }
}

export default appWithTranslation(MyApp);
