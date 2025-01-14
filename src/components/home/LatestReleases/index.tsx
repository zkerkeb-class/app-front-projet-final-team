import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import HorizontalList from '@/components/common/HorizontalList';
import AlbumService from '../../../services/api/album.service';
import { Album } from '../LatestAlbums';

export default function LatestReleases() {
  const { t } = useTranslation('common');
  const [releases, setReleases] = useState<Album[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchLatestReleases = async () => {
      try {
        const apiReleases = await AlbumService.getLatestAlbums(40);
        setReleases(apiReleases);
        setError(null);
      } catch (error) {
        setError(error as Error);
        console.error('Erreur lors de la récupération des sorties:', error);
      }
    };

    fetchLatestReleases();
  }, []);

  if (error) {
    return (
      <div className="p-4 text-center">
        <button
          onClick={() => window.location.reload()}
          className="rounded-md bg-purple-600 px-4 py-2 text-sm text-white transition-colors hover:bg-purple-500"
        >
          {t('errors.tryAgain')}
        </button>
      </div>
    );
  }

  const renderRelease = (release: Album, style: React.CSSProperties) => (
    <div style={style} className="p-2">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105">
        <div className="relative w-full h-32">
          <Image
            src={release.cover_art_url.urls.medium.webp}
            alt={release.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-gray-800 dark:text-white truncate">
            {release.title}
          </h3>
          <div className="mt-2 flex justify-between items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(release.release_date).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <HorizontalList
      items={releases}
      title={t('home.latestReleases')}
      renderItem={renderRelease}
      height={220}
    />
  );
}
