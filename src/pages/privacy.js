import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import Layout from '@components/Layout';
import Header from '@components/Header';
import Body from '@components/Body';
import Content from '@components/Content';
import PageTitle from '@components/PageTitle';

function PrivacyPolicyPage() {
  return (
    <Layout>
      <PageTitle title="Privacy Policy" />
      <Header />
      <Body>
        <Content>
          <h2>Privacy Policy</h2>
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

export default PrivacyPolicyPage;
