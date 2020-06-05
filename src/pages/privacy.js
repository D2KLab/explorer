import { Layout, Header, Body, Content } from '@components';
import { Helmet } from 'react-helmet';

const PrivacyPolicyPage = () => {
  return (
    <Layout>
      <Helmet title="Privacy Policy" />
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
