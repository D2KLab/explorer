import { Layout, Header, Body, Content } from '@components';
import PageTitle from '@components/PageTitle';

const TermsOfServicePage = () => {
  return (
    <Layout>
      <PageTitle title="Terms of Service" />
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
