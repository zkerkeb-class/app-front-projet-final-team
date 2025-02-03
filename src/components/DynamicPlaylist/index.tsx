import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import { PlayIcon } from '@heroicons/react/24/solid';
import { useAudio } from '@/contexts/AudioContext';
import formatTime from '@/utils/formatTime';

interface Track {
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
}

interface DynamicPlaylistProps {
  title: string;
  tracks: Track[];
  loading?: boolean;
}

export default function DynamicPlaylist({
  title,
  tracks,
  loading = false,
}: DynamicPlaylistProps) {
  const { t } = useTranslation('common');
  const { setCurrentTrack, setIsPlaying } = useAudio();

  const handlePlayTrack = (track: Track) => {
    setCurrentTrack({
      id: track.id,
      title: track.title,
      artist: track.artist_name,
      src: track.audio_file_path.urls.mp3,
      coverUrl: track.image_url.urls.medium.webp,
      albumId: track.album_id,
      duration: track.duration_seconds,
    });
    setIsPlaying(true);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex items-center space-x-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg"
            >
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        {title}
      </h2>
      {tracks.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">
          {t('playlist.noTracks')}
        </p>
      ) : (
        <div className="space-y-2">
          {tracks.map((track, index) => (
            <div
              key={track.id}
              className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <button
                onClick={() => handlePlayTrack(track)}
                className="group flex items-center flex-1"
              >
                <div className="relative w-12 h-12 mr-4">
                  <Image
                    src={track.image_url.urls.medium.webp}
                    alt={track.title}
                    fill
                    loading={index < 3 ? 'eager' : 'lazy'}
                    className="object-cover rounded"
                    sizes="48px"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU0LS0yMi4qIiUvKTI+RjEvMTl1WV1VY25xeHJpcW+Dg3X/2wBDARUXFx4aHR4eHXVvIiJ1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXX/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center">
                    <PlayIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {track.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {track.artist_name}
                  </p>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatTime(track.duration_seconds)}
                </span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
