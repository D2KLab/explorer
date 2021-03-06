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

const NotFoundPage = ({ title = "404 - Uh oh!", text, children }) => {
  const { t } = useTranslation('common');

  return (
    <Layout>
      <PageTitle title={title} />
      <Header />
      <Body>
        <Container>
          <h1>{title}</h1>
          <p>{text || t('errors.pageNotFound')}</p>
        </Container>
        {children}
      </Body>
      <Footer />
    </Layout>
  );
};

export default NotFoundPage;
