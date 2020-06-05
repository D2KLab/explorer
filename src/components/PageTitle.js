import Head from 'next/head';

import config from '~/config';

export default ({ title }) => (
  <Head>
    <title>{`${title} | ${config.metadata.title}`}</title>
  </Head>
);
