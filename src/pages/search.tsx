import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { PlayIcon } from '@heroicons/react/24/solid';
import { gql, useQuery } from '@apollo/client';
import HorizontalList from '@/components/common/HorizontalList';
import Image from 'next/image';
import { useAudio } from '@/contexts/AudioContext';

const SEARCH_RESULTS_QUERY = gql`
  query SearchResults($input: SearchInput!) {
    search(input: $input) {
      tracks {
        artist_id
        artist_name
        album_id
        album_name
        id
        image_url
        name
        audiofilepath
      }
      artists {
        id
        image_url
        name
      }
      albums {
        id
        image_url
        name
      }
      playlists {
        id
        image_url
        name
      }
    }
  }
`;

export default function SearchResults() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { q: searchQuery } = router.query;
  const { playTrack } = useAudio();

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

  const handlePlayTrack = (track: any) => {
    playTrack({
      id: track.id,
      title: track.name,
      artist: track.artist_name,
      src: track.audiofilepath.urls.mp3,
      coverUrl: track.image_url?.urls.medium.webp,
      duration: track.duration_seconds,
      albumId: track.album_id,
    });
  };

  const handleArtistClick = (artistId: string) => {
    router.push(`/artist/${artistId}`);
  };

  const handleAlbumClick = (albumId: string) => {
    router.push(`/album/${albumId}`);
  };

  const handlePlaylistClick = (playlistId: string) => {
    router.push(`/playlist/${playlistId}`);
  };

  const renderTrack = (track: any, style: React.CSSProperties) => (
    <div style={style} className="p-2 w-48">
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden transition-transform hover:scale-105 cursor-pointer group">
        <div className="relative w-full h-48">
          <Image
            src={track.image_url.urls.medium.webp}
            alt={track.name}
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
            <button
              onClick={() => handlePlayTrack(track)}
              className="p-3 rounded-full bg-purple-600 text-white opacity-0 group-hover:opacity-100 transform translate-y-3 group-hover:translate-y-0 transition-all"
            >
              <PlayIcon className="h-6 w-6" />
            </button>
          </div>
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
    <div
      style={style}
      className="p-2 w-48 cursor-pointer"
      onClick={() => handleArtistClick(artist.id)}
    >
      <div className="text-center transition-transform hover:scale-105">
        <div className="relative w-48 h-48 mb-3">
          <Image
            src={artist.image_url.urls.medium.webp}
            alt={artist.name}
            fill
            sizes="100vw"
            className="object-cover rounded-full"
          />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
          {artist.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {artist.genre?.join(', ')}
        </p>
      </div>
    </div>
  );

  const renderAlbum = (album: any, style: React.CSSProperties) => (
    <div
      style={style}
      className="p-2 w-48 cursor-pointer"
      onClick={() => handleAlbumClick(album.id)}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden transition-transform hover:scale-105">
        <div className="relative w-full h-48">
          <Image
            src={album.image_url.urls.medium.webp}
            alt={album.name}
            fill
            sizes="100vw"
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

  const renderPlaylist = (playlist: any, style: React.CSSProperties) => (
    <div
      style={style}
      className="p-2 w-48 cursor-pointer"
      onClick={() => handlePlaylistClick(playlist.id)}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden transition-transform hover:scale-105">
        <div className="relative w-full h-48">
          <Image
            src={playlist.image_url.urls.medium.webp}
            alt={playlist.name}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
            {playlist.name}
          </h3>
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

          {data?.search?.playlists?.length > 0 && (
            <section>
              <HorizontalList
                items={data.search.playlists}
                renderItem={renderPlaylist}
                height={280}
                title={t('search.playlists')}
              />
            </section>
          )}

          {!data?.search?.tracks?.length &&
            !data?.search?.artists?.length &&
            !data?.search?.albums?.length &&
            !data?.search?.playlists?.length && (
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
