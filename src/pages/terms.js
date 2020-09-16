import Header from '@components/Header';
import Layout from '@components/Layout';
import Body from '@components/Body';
import Content from '@components/Content';
import PageTitle from '@components/PageTitle';

const TermsOfServicePage = () => {
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
};

export default TermsOfServicePage;
