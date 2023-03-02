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
  return (
    <Head>
      <title>{`${title} | ${t('project:site.title', config?.metadata?.title)}`}</title>
      <meta
        name="description"
        content={t('project:site.description', config?.metadata?.description)}
      />
    </Head>
  );
}

export default PageTitle;
