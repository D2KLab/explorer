import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import Body from '@components/Body';
import Content from '@components/Content';
import Header from '@components/Header';
import Layout from '@components/Layout';
import PageTitle from '@components/PageTitle';

function TermsOfServicePage() {
  return (
    <Layout>
      <PageTitle title="Terms of Service" />
      <Header />
      <Body>
        <Content>
          <h2>Terms of Service</h2>
          <p />
        </Content>
      </Body>
    </Layout>
  );
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'project', 'search'])),
    },
  };
}

export default TermsOfServicePage;
