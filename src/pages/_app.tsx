import '@/pages/globals.css';
import { appWithTranslation } from 'next-i18next';
import Layout from '../components/Layout';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default appWithTranslation(MyApp);