import { getProviders, getCsrfToken } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import Body from '@components/Body';
import Content from '@components/Content';
import Element from '@components/Element';
import Footer from '@components/Footer';
import Header from '@components/Header';
import Layout from '@components/Layout';
import PageTitle from '@components/PageTitle';
import { ProviderButton } from '@components/ProviderButton';
import Title from '@components/Title';

function SignInPage({ providers, error: errorType, csrfToken }) {
  const { t } = useTranslation('common');

  return (
    <Layout>
      <PageTitle title={t('common:profileButton.signIn')} />
      <Header />
      <Body>
        <Element
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          flex={1}
        >
          <Title>{t('common:profileButton.signIn')}</Title>
          <Content>
            <Element display="flex" flexDirection="column">
              {errorType && (
                <div>
                  <p>{t(`common:errors.signin.${errorType}`, t('common:errors.signin.default'))}</p>
                </div>
              )}
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
}

export default SignInPage;

export async function getServerSideProps(ctx) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale, ['common', 'project', 'search'])),
      providers: await getProviders(ctx),
      csrfToken: await getCsrfToken(ctx),
    },
  };
}
