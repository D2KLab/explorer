import { getProviders, getCsrfToken } from 'next-auth/client';

import { Layout, Header, Body, Content, Title, Footer, Element } from '@components';
import { ProviderButton } from '@components/ProviderButton';
import PageTitle from '@components/PageTitle';
import { useTranslation } from '~/i18n';

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
                Object.values(providers).map((provider) => {
                  return (
                    <Element key={provider.name} marginY={12}>
                      <form action={provider.signinUrl} method="POST">
                        <input type="hidden" name="csrfToken" defaultValue={csrfToken} />
                        <ProviderButton provider={provider} type="submit" />
                      </form>
                    </Element>
                  );
                })}
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
      providers: await getProviders(ctx),
      csrfToken: await getCsrfToken(ctx),
    },
  };
}
