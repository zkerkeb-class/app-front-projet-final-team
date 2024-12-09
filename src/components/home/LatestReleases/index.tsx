import { useTranslation } from 'next-i18next';
import { FixedSizeList as List } from 'react-window';
import { useRef, useState, useEffect } from 'react';

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
  const listRef = useRef<HTMLDivElement>(null);
  const [listWidth, setListWidth] = useState(0);

  // Mock data for development
  const mockTracks: Track[] = Array.from({ length: 40 }, (_, i) => ({
    id: `track-${i}`,
    title: `Titre ${i + 1}`,
    artist: `Artiste ${i + 1}`,
    coverUrl: `https://picsum.photos/200/200?random=${i}`,
    duration: '3:30',
  }));

  useEffect(() => {
    if (listRef.current) {
      setListWidth(listRef.current.clientWidth);
    }

    const handleResize = () => {
      if (listRef.current) {
        setListWidth(listRef.current.clientWidth);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const Row = ({
    index,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
  }) => {
    const track = mockTracks[index];
    return (
      <div style={style} className="px-2">
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
  };

  if (!listWidth) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold dark:text-white">
            {t('home.latestReleases')}
          </h2>
          <button className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">
            {t('home.seeAll')}
          </button>
        </div>
        <div ref={listRef} className="relative h-[220px]">
          <div className="flex space-x-4 overflow-x-auto">
            {mockTracks.map((track) => (
              <div key={track.id} className="w-48 flex-shrink-0">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                  <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  <div className="p-3">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold dark:text-white">
          {t('home.latestReleases')}
        </h2>
        <button className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">
          {t('home.seeAll')}
        </button>
      </div>

      <div ref={listRef} className="relative h-[220px]">
        <List
          height={220}
          itemCount={mockTracks.length}
          itemSize={200}
          layout="horizontal"
          width={listWidth}
        >
          {Row}
        </List>
      </div>
    </div>
  );
}
