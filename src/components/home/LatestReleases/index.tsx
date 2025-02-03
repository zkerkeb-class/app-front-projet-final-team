import { useTranslation } from 'next-i18next';
import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import HorizontalList from '@/components/common/HorizontalList';
import AlbumService from '../../../services/api/album.service';

interface Album {
  id: number;
  title: string;
  release_date: string;
  genre: string;
  primary_artist_id: number;
  total_tracks: number;
  image_url: {
    urls: {
      medium: {
        webp: string;
      };
    };
  };
}

export default function LatestReleases() {
  const { t } = useTranslation('common');
  const [releases, setReleases] = useState<Album[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadMoreReleases = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await AlbumService.getLatestAlbums(10, page);
      setReleases((prev) => [...prev, ...response.data]);
      setHasMore(response.metadata.hasNextPage);
      setPage((prev) => prev + 1);
      setError(null);
    } catch (error) {
      setError(error as Error);
      console.error('Erreur lors du chargement des sorties:', error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore]);

  // Chargement initial
  useEffect(() => {
    const initialLoad = async () => {
      try {
        const response = await AlbumService.getLatestAlbums(10, 1);
        setReleases(response.data);
        setHasMore(response.metadata.hasNextPage);
        setPage(2);
        setError(null);
      } catch (error) {
        setError(error as Error);
        console.error('Erreur lors du chargement initial des sorties:', error);
      }
    };
    initialLoad();
  }, []);

  // Gestionnaire de défilement
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      if (scrollWidth - (scrollLeft + clientWidth) < 200) {
        loadMoreReleases();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [loadMoreReleases]);

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

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        {t('home.latestReleases')}
      </h2>
      <div
        ref={containerRef}
        className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide"
      >
        {releases.map((release) => (
          <div key={Number(release.id)} className="flex-none w-48">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105">
              <div className="relative w-full h-32">
                <Image
                  src={release.image_url.urls.medium.webp}
                  alt={release.title}
                  fill
                  priority
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
        ))}
        {loading && (
          <div className="flex-none w-48 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
          </div>
        )}
      </div>
    </div>
  );
}
