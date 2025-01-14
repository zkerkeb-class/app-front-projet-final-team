import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
// import { gql } from '@apollo/client';
import HorizontalList from '@/components/common/HorizontalList';
import Image from 'next/image';

// const SEARCH_RESULTS_QUERY = gql`
//   query SearchResults($input: SearchInput!) {
//     search(input: $input) {
//       tracks {
//         name

//       }
//       artists {
//         name

//       }
//       albums {
//         name

//       }
//     }
//   }
// `;

const mockData = {
  tracks: Array.from({ length: 10 }, (_, i) => ({
    id: `track-${i}`,
    name: `Titre ${i + 1}`,
    artist: { name: `Artiste ${i + 1}` },
    coverUrl: `https://picsum.photos/200/200?random=${i}`,
    duration: '3:30',
  })),
  artists: Array.from({ length: 10 }, (_, i) => ({
    id: `artist-${i}`,
    name: `Artiste ${i + 1}`,
    imageUrl: `https://picsum.photos/200/200?random=${i + 100}`,
    followers: Math.floor(Math.random() * 1000000),
  })),
  albums: Array.from({ length: 10 }, (_, i) => ({
    id: `album-${i}`,
    name: `Album ${i + 1}`,
    artist: { name: `Artiste ${i + 1}` },
    coverUrl: `https://picsum.photos/200/200?random=${i + 200}`,
    releaseDate: new Date(
      Date.now() - Math.random() * 7776000000,
    ).toLocaleDateString(),
  })),
};

export default function SearchResults() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { q: searchQuery } = router.query;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler un temps de chargement
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleBack = () => {
    router.back();
  };

  const renderTrack = (track: any, style: React.CSSProperties) => (
    <div style={style} className="p-2 w-48">
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden transition-transform hover:scale-105">
        <div className="relative w-full h-48">
          <Image
            src={track.coverUrl}
            alt={track.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
            {track.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {track.artist.name}
          </p>
        </div>
      </div>
    </div>
  );

  const renderArtist = (artist: any, style: React.CSSProperties) => (
    <div style={style} className="p-2 w-48">
      <div className="text-center">
        <div className="relative w-48 h-48 mb-3">
          <Image
            src={artist.imageUrl}
            alt={artist.name}
            fill
            className="object-cover rounded-full transition-transform hover:scale-105"
          />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
          {artist.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {new Intl.NumberFormat().format(artist.followers)} followers
        </p>
      </div>
    </div>
  );

  const renderAlbum = (album: any, style: React.CSSProperties) => (
    <div style={style} className="p-2 w-48">
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden transition-transform hover:scale-105">
        <div className="relative w-full h-48">
          <Image
            src={album.coverUrl}
            alt={album.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
            {album.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {album.artist.name}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={handleBack}
        className="flex items-center text-gray-600 dark:text-gray-300 mb-6 hover:text-purple-500"
      >
        <ChevronLeftIcon className="h-5 w-5 mr-2" />
        {t('search.backToResults')}
      </button>

      <h1 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">
        {t('search.resultsFor')} &quot;{searchQuery}&quot;
      </h1>

      {loading ? (
        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
              <div className="grid grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="space-y-3">
                    <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {mockData.tracks.length > 0 && (
            <section>
              {/* <Link 
                href={`/search/tracks?q=${searchQuery}`}
                className="group flex items-center justify-between mb-4"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t('search.tracks')}
                </h2>
                <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-purple-500" />
              </Link> */}
              <HorizontalList
                items={mockData.tracks}
                renderItem={renderTrack}
                height={280}
                title={t('search.tracks')}
              />
            </section>
          )}

          {mockData.artists.length > 0 && (
            <section>
              {/* <Link 
                href={`/search/artists?q=${searchQuery}`}
                className="group flex items-center justify-between mb-4"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t('search.artists')}
                </h2>
                <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-purple-500" />
              </Link> */}
              <HorizontalList
                items={mockData.artists}
                renderItem={renderArtist}
                height={280}
                title={t('search.artists')}
              />
            </section>
          )}

          {mockData.albums.length > 0 && (
            <section>
              {/* <Link 
                href={`/search/albums?q=${searchQuery}`}
                className="group flex items-center justify-between mb-4"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t('search.albums')}
                </h2>
                <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-purple-500" />
              </Link> */}
              <HorizontalList
                items={mockData.albums}
                renderItem={renderAlbum}
                height={280}
                title={t('search.albums')}
              />
            </section>
          )}
        </div>
      )}
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
