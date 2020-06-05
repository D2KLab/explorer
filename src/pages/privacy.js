import { Layout, Header, Body, Content } from '@components';
import PageTitle from '@components/PageTitle';

const PrivacyPolicyPage = () => {
  return (
    <Layout>
      <PageTitle title="Privacy Policy" />
      <Header />
      <Body>
        <Content>
          <h2>Privacy Policy</h2>
          <p></p>
        </Content>
      </Body>
    </Layout>
  );
};

export default PrivacyPolicyPage;
