import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Image from 'next/image';
import { ChevronLeftIcon, PlayIcon } from '@heroicons/react/24/solid';
import AlbumService from '@/services/api/album.service';
import formatTime from '@/utils/formatTime';
import { useAudio } from '@/contexts/AudioContext';

export interface Track {
  id: number;
  title: string;
  duration_seconds: number;
  track_number: number | null;
  artist_id: number;
  album_id: number;
  cover: {
    urls: {
      medium: {
        webp: string;
        jpeg: string;
        png: string;
      };
    };
  };
  audio_file_path: {
    urls: {
      mp3: string;
      wav: string;
      m4a: string;
    };
  };
}

interface Artist {
  id: number;
  name: string;
  bio: string;
  genre: string;
  country: string;
  total_listeners: number;
  image_url: {
    urls: {
      medium: {
        webp: string;
        jpeg: string;
        png: string;
      };
    };
  };
  AlbumArtist?: {
    role: string;
  };
}

export interface AlbumDetails {
  id: number;
  title: string;
  release_date: string;
  genre: string;
  total_tracks: number;
  image_url: {
    urls: {
      medium: {
        webp: string;
        jpeg: string;
        png: string;
      };
    };
  };
  Artists: Artist[];
  Tracks: Track[];
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  };
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
    revalidate: 60,
  };
}

export default function AlbumDetail() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { id, trackId } = router.query;
  const [album, setAlbum] = useState<AlbumDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { setCurrentTrack, setIsPlaying, setIsTrackChanging } = useAudio();

  useEffect(() => {
    const fetchAlbumDetails = async () => {
      if (id) {
        try {
          const data = await AlbumService.getAlbumDetails(id as string);
          setAlbum(data);
        } catch (error) {
          console.error(
            "Erreur lors de la récupération des détails de l'album:",
            error,
          );
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAlbumDetails();
  }, [id]);

  if (loading) {
    return <AlbumSkeleton />;
  }

  if (!album) {
    return (
      <div className="container mx-auto px-4">
        <p className="text-red-500">{t('errors.albumNotFound')}</p>
      </div>
    );
  }

  const primaryArtist = album.Artists.find(
    (artist) => artist.AlbumArtist?.role === 'primary',
  );

  const handlePlayTrack = (track: Track) => {
    setIsTrackChanging(true);
    setIsPlaying(false);

    setTimeout(() => {
      setCurrentTrack({
        id: track.id.toString(),
        src: track.audio_file_path.urls.mp3,
        title: track.title,
        artist: primaryArtist?.name || '',
        coverUrl:
          track.cover?.urls.medium.webp || album.image_url.urls.medium.webp,
        albumId: album.id.toString(),
      });

      requestAnimationFrame(() => {
        setIsPlaying(true);
        setIsTrackChanging(false);
      });
    }, 100);
  };

  return (
    <div className="container mx-auto px-4 h-screen">
      <button
        onClick={() => router.back()}
        className="flex items-center text-gray-600 dark:text-gray-300 mb-6 hover:text-purple-500"
      >
        <ChevronLeftIcon className="h-5 w-5 mr-2" />
        {t('back')}
      </button>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3">
          <div className="relative aspect-square rounded-lg overflow-hidden shadow-lg">
            <Image
              src={album.image_url.urls.medium.webp}
              alt={album.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
              priority
            />
          </div>
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {album.title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
            {primaryArtist?.name}
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-8">
            <span>{new Date(album.release_date).getFullYear()}</span>
            <span>•</span>
            <span>
              {album.total_tracks} {t('tracks')}
            </span>
            <span>•</span>
            <span>{album.genre}</span>
          </div>

          <div className="space-y-2">
            {album.Tracks.map((track) => (
              <div
                key={track.id}
                className={`flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  track.id === Number(trackId)
                    ? 'bg-purple-100 dark:bg-purple-900'
                    : ''
                }`}
              >
                <div className="w-8 text-center text-gray-400">
                  {track.track_number || '-'}
                </div>
                <button
                  onClick={() => handlePlayTrack(track)}
                  className="hover:text-purple-500"
                >
                  <PlayIcon className="h-5 w-5 text-gray-400 mx-4" />
                </button>
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-white">{track.title}</p>
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  {formatTime(track.duration_seconds)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AlbumSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3 animate-pulse">
          <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
        <div className="flex-1 space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="space-y-2 mt-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
