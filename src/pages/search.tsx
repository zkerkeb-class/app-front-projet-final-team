import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { gql, useQuery } from '@apollo/client';
import HorizontalList from '@/components/common/HorizontalList';
import Image from 'next/image';

const SEARCH_RESULTS_QUERY = gql`
  query SearchResults($input: SearchInput!) {
    search(input: $input) {
      tracks {
        id
        name
        album_id
        album_name
        artist_id
        artist_name
        duration
        image_url
      }
      artists {
        id
        name
        genre
        popularityScore
        image_url
      }
      albums {
        id
        name
        releaseDate
        genre
        artist_id
        artist_name
        totalTracks
        image_url
      }
    }
  }
`;

export default function SearchResults() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { q: searchQuery } = router.query;

  const { data, loading: queryLoading } = useQuery(SEARCH_RESULTS_QUERY, {
    variables: {
      input: {
        query: searchQuery,
        limit: 10,
      },
    },
    skip: !searchQuery || !router.isReady,
  });

  if (!router.isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!searchQuery) {
    router.push('/');
    return null;
  }

  const handleBack = () => {
    router.back();
  };

  const renderTrack = (track: any, style: React.CSSProperties) => (
    <div style={style} className="p-2 w-48">
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden transition-transform hover:scale-105">
        <div className="relative w-full h-48">
          <Image
            src={track.image_url.urls.medium.webp}
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
            {track.artist_name}
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
            src={artist.image_url.urls.medium.webp}
            alt={artist.name}
            fill
            className="object-cover rounded-full transition-transform hover:scale-105"
          />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
          {artist.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {artist.genre.join(', ')}
        </p>
      </div>
    </div>
  );

  const renderAlbum = (album: any, style: React.CSSProperties) => (
    <div style={style} className="p-2 w-48">
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden transition-transform hover:scale-105">
        <div className="relative w-full h-48">
          <Image
            src={album.image_url.urls.medium.webp}
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
            {album.artist_name}
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

      {queryLoading ? (
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
          {data?.search?.tracks?.length > 0 && (
            <section>
              <HorizontalList
                items={data.search.tracks}
                renderItem={renderTrack}
                height={280}
                title={t('search.tracks')}
              />
            </section>
          )}

          {data?.search?.artists?.length > 0 && (
            <section>
              <HorizontalList
                items={data.search.artists}
                renderItem={renderArtist}
                height={280}
                title={t('search.artists')}
              />
            </section>
          )}

          {data?.search?.albums?.length > 0 && (
            <section>
              <HorizontalList
                items={data.search.albums}
                renderItem={renderAlbum}
                height={280}
                title={t('search.albums')}
              />
            </section>
          )}

          {!data?.search?.tracks?.length &&
            !data?.search?.artists?.length &&
            !data?.search?.albums?.length && (
              <p className="text-center text-gray-500 dark:text-gray-400">
                {t('search.noResults')}
              </p>
            )}
        </div>
      )}
    </div>
  );
}

export async function getServerSideProps({
  locale,
  query,
}: {
  locale: string;
  query: { q?: string };
}) {
  if (!query.q) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
