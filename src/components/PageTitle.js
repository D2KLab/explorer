import Head from 'next/head';

import config from '~/config';
import { useTranslation } from '~/i18n';

const PageTitle = ({ title }) => {
  const { t } = useTranslation('project');
  return (
    <Head>
      <title>{`${title} | ${t('site.title', config?.metadata?.title)}`}</title>
      <meta name="description" content={t('site.description', config?.metadata?.description)} />
    </Head>
  );
};

export default PageTitle;
