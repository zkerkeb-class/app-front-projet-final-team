import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
// import LatestReleases from '@/components/home/LatestReleases';
import PopularArtists from '@/components/home/PopularArtists';
import LatestAlbums from '@/components/home/LatestAlbums';

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

export default function Home() {
  const { t } = useTranslation(['common']);

  return (
    <>
      <Head>
        <title>{t('common:welcome')}</title>
        <meta
          name="description"
          content="ZakHarmony - Votre plateforme musicale"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="container mx-auto px-4">
        <section className="space-y-12">
          {/* <LatestReleases /> */}
          <PopularArtists />
          <LatestAlbums />
        </section>
      </main>
    </>
  );
}
