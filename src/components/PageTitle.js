import Head from 'next/head';
import { useTranslation } from 'next-i18next';

import config from '~/config';

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
