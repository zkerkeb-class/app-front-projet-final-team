/**
 * Interface for artist data from API
 */

import { Artist } from '@/components/home/PopularArtists';

/**
 * Service for handling artist-related API calls
 */
const ArtistService = {
  /**
   * Get popular artists with pagination
   */
  async getPopularArtists(
    limit: number = 10,
    page: number = 1,
  ): Promise<Artist[]> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/artists/top?limit=${limit}&page=${page}`,
      );
      if (!response.ok) {
        throw new Error(
          'Erreur lors de la récupération des artistes populaires',
        );
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur API getPopularArtists:', error);
      return [];
    }
  },

  /**
   * Search artists by name
   */
  async searchArtists(query: string): Promise<Artist[]> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/artists/search?q=${encodeURIComponent(query)}`,
      );
      if (!response.ok) {
        throw new Error('Erreur lors de la recherche des artistes');
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur API searchArtists:', error);
      return [];
    }
  },

  /**
   * Get artists by genre
   */
  async getArtistsByGenre(genre: string): Promise<Artist[]> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/artists/genre/${genre}`,
      );
      if (!response.ok) {
        throw new Error(
          'Erreur lors de la récupération des artistes par genre',
        );
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur API getArtistsByGenre:', error);
      return [];
    }
  },
};

export default ArtistService;
