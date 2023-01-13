import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import styled from 'styled-components';
import 'intersection-observer';

import Body from '@components/Body';
import Footer from '@components/Footer';
import Header from '@components/Header';
import Layout from '@components/Layout';
import PageTitle from '@components/PageTitle';

const Container = styled.div`
  padding: 5em 0;
  width: 100%;
  text-align: center;
`;

function NotFoundPage({ title = '404 - Uh oh!', text, children }) {
  const { t } = useTranslation('common');

  return (
    <Layout>
      <PageTitle title={title} />
      <Header />
      <Body>
        <Container>
          <h1>{title}</h1>
          <p>{text || t('common:errors.pageNotFound')}</p>
        </Container>
        {children}
      </Body>
      <Footer />
    </Layout>
  );
}

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'project', 'search'])),
  },
});

export default NotFoundPage;
