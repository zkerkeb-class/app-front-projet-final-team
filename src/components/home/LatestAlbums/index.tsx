import { useTranslation } from 'next-i18next';
import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AlbumService from '@/services/api/album.service';

export interface Album {
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

export default function LatestAlbums() {
  const { t } = useTranslation('common');
  const [albums, setAlbums] = useState<Album[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Handles fetching more albums from the API
   * @returns {Promise<void>}
   */
  const loadMoreAlbums = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await AlbumService.getLatestAlbums(10, page);
      setAlbums((prev) => [...prev, ...response.data]);
      setHasMore(response.metadata.hasNextPage);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error('Erreur lors du chargement des albums:', error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore]);

  // Initial load
  useEffect(() => {
    const initialLoad = async () => {
      const response = await AlbumService.getLatestAlbums(10, 1);
      setAlbums(response.data);
      setHasMore(response.metadata.hasNextPage);
      setPage(2);
    };
    initialLoad();
  }, []);

  // Scroll handler
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      if (scrollWidth - (scrollLeft + clientWidth) < 200) {
        loadMoreAlbums();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [loadMoreAlbums]);

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {t('latestAlbums')}
      </h2>
      <div
        ref={containerRef}
        className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory hide-scrollbar"
      >
        {albums.map((album) => (
          <Link
            href={`/album/${album.id}`}
            key={album.id}
            className="snap-start flex-none w-48"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="relative aspect-square">
                <Image
                  src={album.image_url.urls.medium.webp}
                  alt={album.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-gray-800 dark:text-white truncate">
                  {album.title}
                </h3>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(album.release_date).toLocaleDateString()}
                  </span>
                  <span className="text-xs text-purple-600 dark:text-purple-400">
                    {album.total_tracks} {t('tracks')}
                  </span>
                </div>
              </div>
            </div>
          </Link>
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
