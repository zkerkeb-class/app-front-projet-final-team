import { Album } from '@/components/home/LatestAlbums';
import { AlbumDetails } from '@/pages/album/[id]';
import toast from 'react-hot-toast';

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

const AlbumService = {
  async getLatestAlbums(
    limit: number = 10,
    page: number = 1,
  ): Promise<PaginatedResponse<Album>> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/albums?limit=${limit}&page=${page}&sort=release_date:desc`,
      );

      if (!response.ok) {
        throw new ApiError(
          'Erreur lors de la récupération des albums',
          response.status,
          await response.json(),
        );
      }

      const data = await response.json();
      return data;
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

  async getAlbumDetails(id: string): Promise<AlbumDetails> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/albums/${id}`,
      );

      if (!response.ok) {
        throw new ApiError(
          "Erreur lors de la récupération des détails de l'album",
          response.status,
          await response.json(),
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

export default AlbumService;
