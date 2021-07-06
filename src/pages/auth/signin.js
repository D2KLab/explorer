import { getProviders, getCsrfToken } from 'next-auth/client';

import Header from '@components/Header';
import Footer from '@components/Footer';
import Layout from '@components/Layout';
import Body from '@components/Body';
import Content from '@components/Content';
import Element from '@components/Element';
import PageTitle from '@components/PageTitle';
import Title from '@components/Title';
import { ProviderButton } from '@components/ProviderButton';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const SignInPage = ({ providers, csrfToken }) => {
  const { t } = useTranslation('common');
  return (
    <Layout>
      <PageTitle title={t('profileButton.signIn')} />
      <Header />
      <Body>
        <Element
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          flex={1}
        >
          <Title>{t('profileButton.signIn')}</Title>
          <Content>
            <Element display="flex" flexDirection="column">
              {providers &&
                Object.values(providers).map((provider) => (
                    <Element key={provider.name} marginY={12}>
                      <form action={provider.signinUrl} method="POST">
                        <input type="hidden" name="csrfToken" defaultValue={csrfToken} />
                        <ProviderButton provider={provider} type="submit" />
                      </form>
                    </Element>
                  ))}
            </Element>
          </Content>
        </Element>
      </Body>
      <Footer />
    </Layout>
  );
};

export default SignInPage;

export async function getServerSideProps(ctx) {
  return {
    props: {
      ...await serverSideTranslations(ctx.locale, ['common']),
      providers: await getProviders(ctx),
      csrfToken: await getCsrfToken(ctx),
    },
  };
}
