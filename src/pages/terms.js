import { Layout, Header, Body, Content } from '@components';
import { Helmet } from 'react-helmet';

const TermsOfServicePage = () => {
  return (
    <Layout>
      <Helmet title="Terms of Service" />
      <Header />
      <Body>
        <Content>
          <h2>Terms of Service</h2>
          <p></p>
        </Content>
      </Body>
    </Layout>
  );
};

export default TermsOfServicePage;
