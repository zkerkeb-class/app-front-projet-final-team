import { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
// import TrackService from '@/services/api/track.service';
import { useRouter } from 'next/router';
import PlaylistBackground from '@/components/PlaylistBackground';
import recentlyPlayedService from '@/services/localStorage/recentlyPlayed.service';

export type Track = {
  id: number;
  title: string;
  artist_name: string;
  duration_seconds: number;
  album_id: number;
  image_url: {
    urls: {
      medium: {
        webp: string;
      };
    };
  };
  audio_file_path: {
    urls: {
      mp3: string;
    };
  };
};

export type StoredTrack = {
  id: number;
  title: string;
  artist_name: string;
  duration_seconds: number;
  album_id: number;
  image_url: {
    urls: {
      medium: {
        webp: string;
      };
    };
  };
  audio_file_path: {
    urls: {
      mp3: string;
    };
  };
};

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

export default function DynamicPlaylists() {
  const { t } = useTranslation('common');
  // const [popularTracks, setPopularTracks] = useState<Track[]>([]);
  const [recentTracks, setRecentTracks] = useState<StoredTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        // const [popularResponse] = await Promise.all([
        //   TrackService.getMostPlayed(50),
        // ]);

        const recentlyPlayed = recentlyPlayedService.getRecentlyPlayed();

        // setPopularTracks(popularResponse.data);
        setRecentTracks(recentlyPlayed);
      } catch (error) {
        console.error('Erreur lors du chargement des playlists:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  const handlePlaylistClick = (type: 'popular' | 'recent') => {
    router.push(`/dynamic?type=${type}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {t('playlist.title')}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          onClick={() => handlePlaylistClick('popular')}
          className="cursor-pointer w-full max-w-[250px] min-w-[200px]"
        >
          <div className="relative aspect-square rounded-xl overflow-hidden shadow-lg">
            <PlaylistBackground colors={['#9333ea', '#ec4899']} />
            <div className="absolute inset-0 p-4 flex flex-col justify-between z-10">
              <div className="flex justify-between items-start">
                <h2 className="text-white text-lg font-bold">
                  {t('playlist.mostPlayed')}
                </h2>
              </div>

              <div>
                <p className="text-white text-sm opacity-80">
                  50 {t('tracks')}
                </p>
                <p className="text-white text-sm mt-1 opacity-80">ZakHarmony</p>
              </div>
            </div>
          </div>
        </div>

        <div
          onClick={() => handlePlaylistClick('recent')}
          className="cursor-pointer w-full max-w-[250px] min-w-[200px]"
        >
          <div className="relative aspect-square rounded-xl overflow-hidden shadow-lg">
            <PlaylistBackground colors={['#2563eb', '#4f46e5']} />
            <div className="absolute inset-0 p-4 flex flex-col justify-between z-10">
              <div className="flex justify-between items-start">
                <h2 className="text-white text-lg font-bold">
                  {t('playlist.recentlyPlayed')}
                </h2>
              </div>

              <div>
                <p className="text-white text-sm opacity-80">
                  {recentTracks?.length || 0} {t('tracks')}
                </p>
                <p className="text-white text-sm mt-1 opacity-80">ZakHarmony</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
