import { Track } from '@/pages/playlists';
import toast from 'react-hot-toast';

interface TrackResponse {
  data: Track[];
  metadata: {
    hasNextPage: boolean;
    total: number;
  };
}

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const TrackService = {
  /**
   * Get track by id
   * @param {string} id - Track id
   * @returns {Promise<Track>} Promise containing track data
   */
  async getTrack(id: string | number): Promise<Track> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/tracks/${id}`,
    );
    return await response.json();
  },

  /**
   * Get recently played tracks
   * @param {number} limit - Number of tracks to fetch
   * @returns {Promise<TrackResponse>} Promise containing tracks data
   */
  async getRecentlyPlayed(limit: number = 20): Promise<TrackResponse> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tracks/recently-played?limit=${limit}`,
      );

      if (!response.ok) {
        throw new ApiError(
          'Erreur lors de la récupération des titres récents',
          response.status,
          await response.json(),
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
        throw error;
      }

      if (error instanceof TypeError) {
        toast.error('Erreur de connexion au serveur');
        throw new ApiError('Erreur de connexion au serveur');
      }

      toast.error('Une erreur inattendue est survenue');
      throw new ApiError('Une erreur inattendue est survenue');
    }
  },

  /**
   * Get most played tracks
   * @param {number} limit - Number of tracks to fetch
   * @returns {Promise<TrackResponse>} Promise containing tracks data
   */
  async getMostPlayed(limit: number = 20): Promise<TrackResponse> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tracks/top?limit=${limit}`,
      );

      if (!response.ok) {
        throw new ApiError(
          'Erreur lors de la récupération des titres populaires',
          response.status,
          await response.json(),
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
        throw error;
      }

      if (error instanceof TypeError) {
        toast.error('Erreur de connexion au serveur');
        throw new ApiError('Erreur de connexion au serveur');
      }

      toast.error('Une erreur inattendue est survenue');
      throw new ApiError('Une erreur inattendue est survenue');
    }
  },

  /**
   * Get track details
   * @param {string} trackId - Track ID
   * @returns {Promise<Track>} Promise containing track details
   */
  async getTrackDetails(trackId: string): Promise<Track> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tracks/${trackId}`,
      );

      if (!response.ok) {
        throw new ApiError(
          'Erreur lors de la récupération des détails du titre',
          response.status,
          await response.json(),
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
        throw error;
      }

      if (error instanceof TypeError) {
        toast.error('Erreur de connexion au serveur');
        throw new ApiError('Erreur de connexion au serveur');
      }

      toast.error('Une erreur inattendue est survenue');
      throw new ApiError('Une erreur inattendue est survenue');
    }
  },

  /**
   * Increment track play count
   * @param {string} trackId - Track ID
   * @returns {Promise<void>}
   */
  async incrementPlayCount(trackId: string): Promise<void> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tracks/${trackId}/play`,
        {
          method: 'POST',
        },
      );

      if (!response.ok) {
        throw new ApiError(
          "Erreur lors de l'incrémentation du nombre d'écoutes",
          response.status,
          await response.json(),
        );
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
        throw error;
      }

      if (error instanceof TypeError) {
        toast.error('Erreur de connexion au serveur');
        throw new ApiError('Erreur de connexion au serveur');
      }

      toast.error('Une erreur inattendue est survenue');
      throw new ApiError('Une erreur inattendue est survenue');
    }
  },

  /**
   * Search tracks
   * @param {string} query - Search query
   * @param {number} limit - Number of results to return
   * @returns {Promise<TrackResponse>} Promise containing search results
   */
  async searchTracks(
    query: string,
    limit: number = 20,
  ): Promise<TrackResponse> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tracks/search?q=${query}&limit=${limit}`,
      );

      if (!response.ok) {
        throw new ApiError(
          'Erreur lors de la recherche de titres',
          response.status,
          await response.json(),
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
        throw error;
      }

      if (error instanceof TypeError) {
        toast.error('Erreur de connexion au serveur');
        throw new ApiError('Erreur de connexion au serveur');
      }

      toast.error('Une erreur inattendue est survenue');
      throw new ApiError('Une erreur inattendue est survenue');
    }
  },
};

export default TrackService;
