import { useTranslation } from 'next-i18next';
import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ArtistService from '../../../services/api/artist.service';
import SkeletonLoader from '../../common/SkeletonLoader';

/**
 * Interface for artist data from API
 */
export interface Artist {
  id: string;
  name: string;
  image_url: {
    urls: {
      medium: {
        webp: string;
        jpeg: string;
        png: string;
      };
    };
  };
  total_listeners: number;
  genre: string;
}

export default function PopularArtists() {
  const { t } = useTranslation('common');
  const [artists, setArtists] = useState<Artist[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Handles fetching more artists from the API
   * @returns {Promise<void>}
   */
  const loadMoreArtists = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const apiArtists = await ArtistService.getPopularArtists(10, page);
      setArtists((prev) => [...prev, ...apiArtists]);
      setHasMore(apiArtists.length === 10);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error('Erreur lors du chargement des artistes:', error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore]);

  // Initial load
  useEffect(() => {
    const initialLoad = async () => {
      try {
        const apiArtists = await ArtistService.getPopularArtists(10, 1);
        setArtists(apiArtists);
        setHasMore(apiArtists.length === 10);
        setPage(2);
      } catch (error) {
        console.error('Erreur lors du chargement initial des artistes:', error);
      } finally {
        setIsInitialLoading(false);
      }
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
        loadMoreArtists();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [loadMoreArtists]);

  if (!isInitialLoading) {
    return (
      <div className="pb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {t('home.popularArtists')}
        </h2>
        <div className="overflow-x-auto hide-scrollbar min-h-[300px]">
          <SkeletonLoader type="artist" count={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {t('home.popularArtists')}
      </h2>
      <div
        ref={containerRef}
        className="flex overflow-x-auto gap-4 snap-x snap-mandatory hide-scrollbar min-h-[300px]"
      >
        {artists.map((artist) => (
          <Link
            href={`/artist/${artist.id}`}
            key={artist.id}
            className="snap-start flex-none w-48"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform h-full">
              <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
                <Image
                  src={artist.image_url.urls.medium.webp}
                  alt={artist.name}
                  fill
                  priority={page === 2}
                  className="object-cover"
                  sizes="192px"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU0LS0yMi4qIiUvKTI+RjEvMTl1WV1VY25xeHJpcW+Dg3X/2wBDARUXFx4aHR4eHXVvIiJ1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXX/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                />
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-gray-800 dark:text-white truncate">
                  {artist.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {new Intl.NumberFormat().format(artist.total_listeners)}{' '}
                  {t('listeners')}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {Array.isArray(artist.genre) &&
                    artist.genre.map((genre, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100"
                      >
                        {genre}
                      </span>
                    ))}
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
