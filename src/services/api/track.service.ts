import { Track } from '@/types/audio';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

/**
 * Service for managing tracks (CRUD operations)
 */
class TrackService {
  private static getHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Get a track by its ID
   */
  static async getTrack(id: number): Promise<Track> {
    const response = await fetch(`${API_URL}/tracks/${id}`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new ApiError(
        'Erreur lors de la récupération de la piste',
        response.status,
      );
    }
    return response.json();
  }

  /**
   * Create a new track
   */
  static async createTrack(formData: FormData): Promise<Track> {
    const response = await fetch(`${API_URL}/tracks`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: formData,
    });
    if (!response.ok) {
      throw new ApiError(
        'Erreur lors de la création de la piste',
        response.status,
      );
    }
    return response.json();
  }

  /**
   * Update a track
   */
  static async updateTrack(id: number, formData: FormData): Promise<Track> {
    const response = await fetch(`${API_URL}/tracks/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: formData,
    });
    if (!response.ok) {
      throw new ApiError(
        'Erreur lors de la mise à jour de la piste',
        response.status,
      );
    }
    return response.json();
  }

  /**
   * Delete a track
   */
  static async deleteTrack(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/tracks/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new ApiError(
        'Erreur lors de la suppression de la piste',
        response.status,
      );
    }
  }

  /**
   * Get all tracks for a user
   */
  static async getUserTracks(userId: string): Promise<Track[]> {
    const response = await fetch(`${API_URL}/tracks/user/${userId}`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new ApiError(
        'Erreur lors de la récupération des pistes',
        response.status,
      );
    }
    return response.json();
  }

  /**
   * Get recently played tracks
   * @param {number} limit - Number of tracks to fetch
   * @returns {Promise<TrackResponse>} Promise containing tracks data
   */
  static async getRecentlyPlayed(limit: number = 20): Promise<TrackResponse> {
    try {
      const response = await fetch(
        `${API_URL}/tracks/recently-played?limit=${limit}`,
        {
          headers: this.getHeaders(),
        },
      );
      if (!response.ok) {
        throw new ApiError(
          'Erreur lors de la récupération des titres récents',
          response.status,
          await response.json(),
        );
      }
      return response.json();
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
  }

  /**
   * Get most played tracks
   * @param {number} limit - Number of tracks to fetch
   * @returns {Promise<TrackResponse>} Promise containing tracks data
   */
  static async getMostPlayed(limit: number = 20): Promise<TrackResponse> {
    try {
      const response = await fetch(`${API_URL}/tracks/top?limit=${limit}`, {
        headers: this.getHeaders(),
      });
      if (!response.ok) {
        throw new ApiError(
          'Erreur lors de la récupération des titres populaires',
          response.status,
          await response.json(),
        );
      }
      return response.json();
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
  }

  /**
   * Get track details
   * @param {string} trackId - Track ID
   * @returns {Promise<Track>} Promise containing track details
   */
  static async getTrackDetails(trackId: string): Promise<Track> {
    try {
      const response = await fetch(`${API_URL}/tracks/${trackId}`, {
        headers: this.getHeaders(),
      });
      if (!response.ok) {
        throw new ApiError(
          'Erreur lors de la récupération des détails du titre',
          response.status,
          await response.json(),
        );
      }
      return response.json();
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
  }

  /**
   * Increment track play count
   * @param {string} trackId - Track ID
   * @returns {Promise<void>}
   */
  static async incrementPlayCount(trackId: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/tracks/${trackId}/play`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
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
  }

  /**
   * Search tracks
   * @param {string} query - Search query
   * @param {number} limit - Number of results to return
   * @returns {Promise<TrackResponse>} Promise containing search results
   */
  static async searchTracks(
    query: string,
    limit: number = 20,
  ): Promise<TrackResponse> {
    try {
      const response = await fetch(
        `${API_URL}/tracks/search?q=${query}&limit=${limit}`,
        {
          headers: this.getHeaders(),
        },
      );
      if (!response.ok) {
        throw new ApiError(
          'Erreur lors de la recherche de titres',
          response.status,
          await response.json(),
        );
      }
      return response.json();
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
  }
}

export default TrackService;
