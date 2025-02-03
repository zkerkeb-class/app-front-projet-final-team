import { AlbumDetails } from '@/pages/album/[id]';
import toast from 'react-hot-toast';
import { Album } from '@/types/album';

interface PaginatedResponse<T> {
  data: T[];
  metadata: {
    currentPage: number;
    itemsPerPage: string;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface AlbumCreate {
  title: string;
  release_date: string;
  genre: string;
  coverImage?: File;
  tracks: FormData[];
}

/**
 * Service for managing albums (CRUD operations)
 */
class AlbumService {
  private static getHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Create a new album with tracks
   */
  static async createAlbum(formData: FormData): Promise<Album> {
    const response = await fetch(`${API_URL}/albums`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: formData,
    });
    if (!response.ok) {
      throw new Error("Erreur lors de la création de l'album");
    }
    return response.json();
  }

  /**
   * Update an album
   */
  static async updateAlbum(id: number, formData: FormData): Promise<Album> {
    const response = await fetch(`${API_URL}/albums/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: formData,
    });
    if (!response.ok) {
      throw new Error("Erreur lors de la mise à jour de l'album");
    }
    return response.json();
  }

  /**
   * Delete an album
   */
  static async deleteAlbum(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/albums/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error("Erreur lors de la suppression de l'album");
    }
  }

  /**
   * Get all albums for a user
   */
  static async getUserAlbums(userId: string): Promise<Album[]> {
    const response = await fetch(`${API_URL}/albums/user/${userId}`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des albums');
    }
    return response.json();
  }

  /**
   * Get album details
   */
  static async getAlbumDetails(id: string | number): Promise<AlbumDetails> {
    try {
      const response = await fetch(`${API_URL}/albums/${id}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(
          "Erreur lors de la récupération des détails de l'album",
        );
      }

      const data = await response.json();
      return {
        ...data,
        id: data.id.toString(),
        Tracks: data.Tracks.map((track: any) => ({
          ...track,
          id: track.id.toString(),
        })),
      };
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
        throw error;
      }
      toast.error('Une erreur inattendue est survenue');
      throw new Error('Une erreur inattendue est survenue');
    }
  }

  /**
   * Get latest albums with pagination
   */
  static async getLatestAlbums(
    limit: number = 10,
    page: number = 1,
  ): Promise<PaginatedResponse<Album>> {
    try {
      const response = await fetch(
        `${API_URL}/albums?limit=${limit}&page=${page}&sort=release_date:desc`,
        {
          headers: this.getHeaders(),
        },
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des albums');
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
        throw error;
      }
      toast.error('Une erreur inattendue est survenue');
      throw new Error('Une erreur inattendue est survenue');
    }
  }
}

export default AlbumService;
