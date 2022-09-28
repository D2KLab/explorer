import Document, { Html, Head, Main, NextScript } from 'next/document';
import { ServerStyleSheet } from 'styled-components';
import config from '~/config';

export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) => sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      };
    } finally {
      sheet.seal();
    }
  }

  render() {
    const { i18nDocumentProps } = this.props;
    return (
      <Html {...i18nDocumentProps}>
        <Head>
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
          {/* Global site tag (gtag.js) - Google Analytics */}
          {typeof config.analytics?.id !== 'undefined' && (
            <>
              <script
                async
                src={`https://www.googletagmanager.com/gtag/js?id=${config.analytics.id}`}
              />
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments)}
                  gtag('js', new Date());
                  gtag('config', '${config.analytics.id}', {
                    page_path: window.location.pathname,
                  });
                `,
                }}
              />
            </>
          )}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
