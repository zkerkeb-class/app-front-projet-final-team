import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
// import LatestReleases from '@/components/home/LatestReleases';

// Dynamic imports with loading fallback
const PopularArtists = dynamic(
  () => import('@/components/home/PopularArtists'),
  {
    loading: () => <PopularArtistsSkeleton />,
    ssr: true,
  },
);

const LatestAlbums = dynamic(() => import('@/components/home/LatestAlbums'), {
  loading: () => <LatestAlbumsSkeleton />,
  ssr: true,
});

// Skeleton components
function PopularArtistsSkeleton() {
  return (
    <div className="pb-4">
      <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-6 animate-pulse" />
      <div className="flex gap-4 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-none w-48">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden animate-pulse">
              <div className="aspect-square" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded" />
                <div className="h-3 w-24 bg-gray-300 dark:bg-gray-600 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LatestAlbumsSkeleton() {
  return (
    <div className="pb-4">
      <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-6 animate-pulse" />
      <div className="flex gap-4 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-none w-48">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden animate-pulse">
              <div className="aspect-square" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded" />
                <div className="h-3 w-full bg-gray-300 dark:bg-gray-600 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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
          <Suspense fallback={<PopularArtistsSkeleton />}>
            <PopularArtists />
          </Suspense>
          <Suspense fallback={<LatestAlbumsSkeleton />}>
            <LatestAlbums />
          </Suspense>
        </section>
      </main>
    </>
  );
}
