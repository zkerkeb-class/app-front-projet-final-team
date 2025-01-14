import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import HorizontalList from '@/components/common/HorizontalList';
import ArtistService from '../../../services/api/artist.service';

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

  useEffect(() => {
    const fetchPopularArtists = async () => {
      try {
        const apiArtists = await ArtistService.getPopularArtists(40);
        setArtists(apiArtists);
      } catch (error) {
        console.error('Erreur lors de la récupération des artistes:', error);
      }
    };

    fetchPopularArtists();
  }, []);

  const renderArtist = (artist: Artist, style: React.CSSProperties) => (
    <div style={style} className="p-2">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105">
        <picture>
          <source
            srcSet={artist.image_url.urls.medium.webp}
            type="image/webp"
          />
          <source
            srcSet={artist.image_url.urls.medium.jpeg}
            type="image/jpeg"
          />
          <img
            src={artist.image_url.urls.medium.png}
            alt={artist.name}
            className="w-full h-32 object-cover"
          />
        </picture>
        <div className="p-3">
          <h3 className="font-semibold text-gray-800 dark:text-white truncate">
            {artist.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {new Intl.NumberFormat().format(artist.total_listeners)}{' '}
            {t('listeners')}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            <span className="px-2 py-1 text-xs rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100">
              {artist.genre}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <HorizontalList
      items={artists}
      title={t('home.popularArtists')}
      renderItem={renderArtist}
      height={250}
    />
  );
}
