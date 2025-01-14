import { useTranslation } from 'next-i18next';
import { useEffect } from 'react';
import HorizontalList from '@/components/common/HorizontalList';
import ArtistService from '../../../services/api/artist.service';

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

  useEffect(() => {
    const fetchPopularArtists = async () => {
      const apiArtists = await ArtistService.getPopularArtists(40);
      console.log('Artistes populaires récupérés:', apiArtists);
    };

    fetchPopularArtists();
  }, []);

  // Garder les données mockées pour l'affichage pour l'instant
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

  const renderArtist = (artist: Artist, style: React.CSSProperties) => (
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

  return (
    <HorizontalList
      items={mockArtists}
      title={t('home.popularArtists')}
      renderItem={renderArtist}
      height={250}
    />
  );
}
