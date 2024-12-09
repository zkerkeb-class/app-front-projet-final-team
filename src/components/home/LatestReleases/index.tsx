import { useTranslation } from 'next-i18next';
import HorizontalList from '@/components/common/HorizontalList';

/**
 * Interface for track data
 */
interface Track {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  duration: string;
}

export default function LatestReleases() {
  const { t } = useTranslation('common');
  const mockTracks: Track[] = Array.from({ length: 40 }, (_, i) => ({
    id: `track-${i}`,
    title: `Titre ${i + 1}`,
    artist: `Artiste ${i + 1}`,
    coverUrl: `https://picsum.photos/200/200?random=${i}`,
    duration: '3:30',
  }));

  const renderTrack = (track: Track, style: React.CSSProperties) => (
    <div style={style} className="p-2">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105">
        <img
          src={track.coverUrl}
          alt={track.title}
          className="w-full h-32 object-cover"
        />
        <div className="p-3">
          <h3 className="font-semibold text-gray-800 dark:text-white truncate">
            {track.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {track.artist}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <HorizontalList
      items={mockTracks}
      title={t('home.latestReleases')}
      renderItem={renderTrack}
      height={220}
    />
  );
}
