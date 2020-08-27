import Head from 'next/head';

import config from '~/config';

const PageTitle = ({ title }) => (
  <Head>
    <title>{`${title} | ${config.metadata.title}`}</title>
  </Head>
);

export default PageTitle;
