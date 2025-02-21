import '@/pages/globals.css';
import { appWithTranslation } from 'next-i18next';
import Layout from '../components/Layout';
import type { AppProps } from 'next/app';
import { ApolloProvider } from '@apollo/client';
import { client } from '@/lib/apollo';
import { AuthProvider } from '@/contexts/AuthContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { AudioProvider } from '@/contexts/AudioContext';
import App from 'next/app';
import OfflineWrapper from '@/components/OfflineWrapper';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').catch((err) => {
          console.error('Service worker registration failed:', err);
        });
      });
    }
  }, []);

  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <SocketProvider>
          <AudioProvider>
            <OfflineWrapper>
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </OfflineWrapper>
          </AudioProvider>
        </SocketProvider>
      </AuthProvider>
    </ApolloProvider>
  );
}

MyApp.getInitialProps = async (appContext: any) => {
  const appProps = await App.getInitialProps(appContext);
  return { ...appProps };
};

export default appWithTranslation(MyApp);
