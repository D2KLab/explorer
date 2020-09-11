import Head from 'next/head';

import config from '~/config';
import { withTranslation } from '~/i18n';

const PageTitle = ({ title, t }) => (
  <Head>
    <title>{`${title} | ${t('site.title', config?.metadata?.title)}`}</title>
    <meta name="description" content={t('site.description', config?.metadata?.description)} />
  </Head>
);

export default withTranslation('project')(PageTitle);
