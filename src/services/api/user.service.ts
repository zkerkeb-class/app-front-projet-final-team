import { TArtist } from '@/types/artist';
import { Album } from '@/types/album';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

class UserService {
  private static getHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Get user details by ID
   */
  static async getUserDetails(
    id: string,
  ): Promise<TArtist & { Albums: Album[] }> {
    try {
      const response = await fetch(`${API_URL}/users/${id}`, {
        headers: this.getHeaders(),
      });
      if (!response.ok) {
        throw new Error(
          "Erreur lors de la récupération des détails de l'utilisateur",
        );
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur API getUserDetails:', error);
      throw error;
    }
  }
}

export default UserService;
