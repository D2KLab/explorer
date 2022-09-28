import styled from 'styled-components';
import 'intersection-observer';

import Header from '@components/Header';
import Footer from '@components/Footer';
import Layout from '@components/Layout';
import Body from '@components/Body';
import PageTitle from '@components/PageTitle';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const Container = styled.div`
  padding: 5em 0;
  width: 100%;
  text-align: center;
`;

function NotFoundPage({ title = "404 - Uh oh!", text, children }) {
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
}

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...await serverSideTranslations(locale, ['common', 'project']),
  },
});

export default NotFoundPage;
