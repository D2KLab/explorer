import Layout from '@components/Layout';
import Header from '@components/Header';
import Body from '@components/Body';
import Content from '@components/Content';
import PageTitle from '@components/PageTitle';

const PrivacyPolicyPage = () => (
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

export default PrivacyPolicyPage;
