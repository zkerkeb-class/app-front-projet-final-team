import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import OfflinePage from '@/components/OfflinePage';

export default function Offline() {
  const { t } = useTranslation('common');

  return (
    <>
      <Head>
        <title>{t('offline.title')} | ZakHarmony</title>
        <meta name="description" content={t('offline.description')} />
      </Head>
      <OfflinePage isRefresh={true} />
    </>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
