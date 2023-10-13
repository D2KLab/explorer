import Head from 'next/head';
import { useTranslation } from 'next-i18next';

import config from '~/config';

/**
 * A component that renders the page title.
 * @param {string} title - the title of the page.
 * @returns A React component.
 */
function PageTitle({ title }) {
  const { t } = useTranslation('project');
  const pageTitle = title || t('project:site.title', config?.metadata?.title);
  return (
    <Head>
      <title>{pageTitle.length > 363 ? `${pageTitle.substr(0, 363)}…` : pageTitle}</title>
      <meta
        name="description"
        content={t('project:site.description', config?.metadata?.description)}
      />
    </Head>
  );
}

export default PageTitle;
