import { useTranslation } from 'next-i18next';
import { FixedSizeList as List } from 'react-window';
import { useRef, useState, useEffect } from 'react';

/**
 * Interface for artist data
 */
interface Artist {
  id: string;
  name: string;
  imageUrl: string;
  followers: number;
  genres: string[];
}

export default function PopularArtists() {
  const { t } = useTranslation('common');
  const listRef = useRef<HTMLDivElement>(null);
  const [listWidth, setListWidth] = useState(0);

  // Mock data for development
  const mockArtists: Artist[] = Array.from({ length: 40 }, (_, i) => ({
    id: `artist-${i}`,
    name: `Artiste ${i + 1}`,
    imageUrl: `https://picsum.photos/200/200?random=${i + 100}`,
    followers: Math.floor(Math.random() * 1000000),
    genres: ['Pop', 'Rock', 'Hip-hop'].slice(
      0,
      Math.floor(Math.random() * 3) + 1,
    ),
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
    const artist = mockArtists[index];
    return (
      <div style={style} className="p-2">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105">
          <img
            src={artist.imageUrl}
            alt={artist.name}
            className="w-full h-32 object-cover"
          />
          <div className="p-3">
            <h3 className="font-semibold text-gray-800 dark:text-white truncate">
              {artist.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {new Intl.NumberFormat().format(artist.followers)} followers
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {artist.genres.map((genre) => (
                <span
                  key={genre}
                  className="px-2 py-1 text-xs rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100"
                >
                  {genre}
                </span>
              ))}
            </div>
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
            {t('home.popularArtists')}
          </h2>
          <button className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">
            {t('home.seeAll')}
          </button>
        </div>
        <div ref={listRef} className="relative h-[250px]">
          <div className="flex space-x-4 overflow-x-auto">
            {mockArtists.slice(0, 5).map((artist) => (
              <div key={artist.id} className="w-48 flex-shrink-0">
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
          {t('home.popularArtists')}
        </h2>
        <button className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">
          {t('home.seeAll')}
        </button>
      </div>

      <div ref={listRef} className="relative h-[250px]">
        <List
          height={250}
          itemCount={mockArtists.length}
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
