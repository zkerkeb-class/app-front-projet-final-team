import '@/pages/globals.css';
import { appWithTranslation } from 'next-i18next';
import Layout from '@/components/Layout';
import type { AppProps } from 'next/app';
import { ApolloProvider } from '@apollo/client';
import { client } from '@/lib/apollo';
import { AuthProvider } from '@/contexts/AuthContext';
import App from 'next/app';
import OfflineWrapper from '@/components/OfflineWrapper';
import { useEffect } from 'react';
import { SocketProvider } from '@/contexts/SocketContext';
import { Toaster } from 'react-hot-toast';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Enregistrer ou mettre à jour le service worker
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          // Vérifier et appliquer les mises à jour
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (
                  newWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  // Nouveau service worker disponible
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service worker registration failed:', error);
        });

      // Gérer les mises à jour du service worker
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (window.location.pathname.startsWith('/jam/')) {
          // Recharger la page uniquement si nous sommes sur une route jam
          window.location.reload();
        }
      });
    }
  }, []);

  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <SocketProvider>
          <OfflineWrapper>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </OfflineWrapper>
          <Toaster position="top-right" />
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
