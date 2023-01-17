import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import Body from '@components/Body';
import Content from '@components/Content';
import Header from '@components/Header';
import Layout from '@components/Layout';
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

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'project', 'search'])),
  },
});

export default PrivacyPolicyPage;
