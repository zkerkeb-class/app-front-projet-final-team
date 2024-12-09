import { useTranslation } from 'next-i18next';
import HorizontalList from '@/components/common/HorizontalList';

/**
 * Interface for album data
 */
interface Album {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  releaseDate: string;
  trackCount: number;
}

export default function LatestAlbums() {
  const { t } = useTranslation('common');
  const mockAlbums: Album[] = Array.from({ length: 40 }, (_, i) => ({
    id: `album-${i}`,
    title: `Album ${i + 1}`,
    artist: `Artiste ${i + 1}`,
    coverUrl: `https://picsum.photos/200/200?random=${i + 200}`,
    releaseDate: new Date(
      Date.now() - Math.random() * 7776000000,
    ).toLocaleDateString(),
    trackCount: Math.floor(Math.random() * 15) + 5,
  }));

  const renderAlbum = (album: Album, style: React.CSSProperties) => (
    <div style={style} className="p-2">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105">
        <img
          src={album.coverUrl}
          alt={album.title}
          className="w-full h-32 object-cover"
        />
        <div className="p-3">
          <h3 className="font-semibold text-gray-800 dark:text-white truncate">
            {album.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {album.artist}
          </p>
          <div className="mt-2 flex justify-between items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {album.releaseDate}
            </span>
            <span className="text-xs text-purple-600 dark:text-purple-400">
              {album.trackCount} titres
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <HorizontalList
      items={mockAlbums}
      title={t('home.latestAlbums')}
      renderItem={renderAlbum}
      height={250}
    />
  );
}
