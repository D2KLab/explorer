import Document, { Html, Head, Main, NextScript } from 'next/document';
import { ServerStyleSheet } from 'styled-components';

const i18nPropsFromCtx = (ctx) => {
  if (!(ctx && ctx.req && ctx.req.language)) return {};
  const { req } = ctx;
  return {
    lang: req.language,
    dir: req.i18n && req.i18n.dir(req.language),
  };
};

export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) => sheet.collectStyles(<App {...props} />),
        });

      const i18nDocumentProps = i18nPropsFromCtx(ctx);

      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        i18nDocumentProps,
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
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
