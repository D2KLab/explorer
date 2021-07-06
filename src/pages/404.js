import styled from 'styled-components';
import 'intersection-observer';

import Header from '@components/Header';
import Footer from '@components/Footer';
import Layout from '@components/Layout';
import Body from '@components/Body';
import PageTitle from '@components/PageTitle';
import { useTranslation } from 'next-i18next';

const Container = styled.div`
  padding: 5em 0;
  width: 100%;
  text-align: center;
`;

const NotFoundPage = () => {
  const { t } = useTranslation('common');

  return (
    <Layout>
      <PageTitle title="404 - Uh oh!" />
      <Header />
      <Body>
        <Container>
          <h1>404 - Uh oh!</h1>
          <p>{t('errors.pageNotFound')}</p>
        </Container>
      </Body>
      <Footer />
    </Layout>
  );
};

export default NotFoundPage;
