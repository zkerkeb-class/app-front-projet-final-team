/**
 * Interface for artist data from API
 */

import { TArtist } from '@/types/artist';
import { Album } from '@/types/album';
import { Artist } from '@/components/home/PopularArtists';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const mapTArtistToArtist = (artist: TArtist): Artist => ({
  id: artist.id,
  name: artist.name,
  image_url: {
    urls: {
      medium: {
        webp:
          artist.image_url?.urls.medium.webp || '/images/default-artist.jpg',
        jpeg:
          artist.image_url?.urls.medium.jpeg || '/images/default-artist.jpg',
        png: artist.image_url?.urls.medium.png || '/images/default-artist.jpg',
      },
    },
  },
  total_listeners: artist.total_listeners,
  genre: artist.genre || '',
});

/**
 * Service for handling artist-related API calls
 */
class ArtistService {
  private static getHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Get artist details by ID
   */
  static async getArtistDetails(
    id: string,
  ): Promise<TArtist & { Albums: Album[] }> {
    try {
      const response = await fetch(`${API_URL}/artists/${id}`, {
        headers: this.getHeaders(),
      });
      if (!response.ok) {
        throw new Error(
          "Erreur lors de la récupération des détails de l'artiste",
        );
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur API getArtistDetails:', error);
      throw error;
    }
  }

  /**
   * Get popular artists with pagination
   */
  static async getPopularArtists(
    limit: number = 10,
    page: number = 1,
  ): Promise<Artist[]> {
    try {
      const response = await fetch(
        `${API_URL}/artists/top?limit=${limit}&page=${page}`,
      );
      if (!response.ok) {
        throw new Error(
          'Erreur lors de la récupération des artistes populaires',
        );
      }
      const data = await response.json();
      return data.map(mapTArtistToArtist);
    } catch (error) {
      console.error('Erreur API getPopularArtists:', error);
      return [];
    }
  }

  /**
   * Search artists by name
   */
  static async searchArtists(query: string): Promise<Artist[]> {
    try {
      const response = await fetch(
        `${API_URL}/artists/search?q=${encodeURIComponent(query)}`,
      );
      if (!response.ok) {
        throw new Error('Erreur lors de la recherche des artistes');
      }
      const data = await response.json();
      return data.map(mapTArtistToArtist);
    } catch (error) {
      console.error('Erreur API searchArtists:', error);
      return [];
    }
  }

  /**
   * Get artists by genre
   */
  static async getArtistsByGenre(genre: string): Promise<Artist[]> {
    try {
      const response = await fetch(`${API_URL}/artists/genre/${genre}`);
      if (!response.ok) {
        throw new Error(
          'Erreur lors de la récupération des artistes par genre',
        );
      }
      const data = await response.json();
      return data.map(mapTArtistToArtist);
    } catch (error) {
      console.error('Erreur API getArtistsByGenre:', error);
      return [];
    }
  }
}

export default ArtistService;
