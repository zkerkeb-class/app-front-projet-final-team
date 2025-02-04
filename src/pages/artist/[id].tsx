import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Image from 'next/image';
import { ChevronLeftIcon } from '@heroicons/react/24/solid';
import ArtistService from '@/services/api/artist.service';
import { TArtist } from '@/types/artist';
import { Album } from '@/types/album';
import Link from 'next/link';

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
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

export default function ArtistDetail() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { id } = router.query;
  const [artist, setArtist] = useState<TArtist | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtistDetails = async () => {
      if (id) {
        try {
          const artistData = await ArtistService.getArtistDetails(id as string);
          setArtist(artistData);
          setAlbums(artistData.Albums || []);
        } catch (error) {
          console.error(
            "Erreur lors de la récupération des détails de l'artiste:",
            error,
          );
          router.push('/404');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchArtistDetails();
  }, [id, router]);

  if (router.isFallback || loading) {
    return <ArtistSkeleton />;
  }

  if (!artist) {
    return (
      <div className="container mx-auto px-4">
        <p className="text-red-500">{t('errors.artistNotFound')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="relative h-[40vh] w-full">
        <div className="absolute inset-0">
          <Image
            src={
              artist.image_url?.urls.large.webp || '/images/default-artist.jpg'
            }
            alt={artist.name}
            fill
            className="object-cover"
            sizes="100vw"
            priority
            quality={100}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/30 to-gray-900/90" />
        </div>

        {/* Artist info on banner */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <button
              onClick={() => router.back()}
              className="flex items-center text-white mb-4 hover:text-purple-400 transition-colors"
            >
              <ChevronLeftIcon className="h-5 w-5 mr-2" />
              {t('back')}
            </button>
            <h1 className="text-5xl font-bold text-white mb-2">
              {artist.name}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-300">
              {artist.genre &&
                Array.isArray(artist.genre) &&
                artist.genre.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {artist.genre.map((genre, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-sm rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}
              {artist.country && (
                <>
                  <span>•</span>
                  <span>{artist.country}</span>
                </>
              )}
              <span>•</span>
              <span>{artist.total_listeners.toLocaleString()} auditeurs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Bio */}
        {artist.bio && (
          <div className="max-w-3xl mb-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
              {artist.bio}
            </p>
          </div>
        )}

        {/* Albums */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Albums
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {albums.map((album) => (
              <Link
                key={album.id}
                href={`/album/${album.id}`}
                className="group"
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-sm group-hover:shadow-md transition-all">
                  <div className="relative w-full h-full">
                    <Image
                      src={album.image_url.urls.medium.webp}
                      alt={album.title}
                      fill
                      sizes="100vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate group-hover:text-purple-600 transition-colors">
                    {album.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(album.release_date).getFullYear()} •{' '}
                    {album.total_tracks} pistes
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ArtistSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3 animate-pulse">
          <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
        <div className="flex-1 space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mt-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
