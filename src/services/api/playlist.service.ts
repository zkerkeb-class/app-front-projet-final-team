const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Playlist {
  id: number;
  title: string;
  description?: string;
  coverImage?: File;
  tracks: number[]; // Array of track IDs
}

/**
 * Service for managing playlists (CRUD operations)
 */
class PlaylistService {
  private static getHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Create a new playlist
   */
  static async createPlaylist(formData: FormData): Promise<Playlist> {
    const response = await fetch(`${API_URL}/playlists`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: formData,
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la création de la playlist');
    }
    return response.json();
  }

  /**
   * Update a playlist
   */
  static async updatePlaylist(
    id: number,
    formData: FormData,
  ): Promise<Playlist> {
    const response = await fetch(`${API_URL}/playlists/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: formData,
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour de la playlist');
    }
    return response.json();
  }

  /**
   * Delete a playlist
   */
  static async deletePlaylist(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/playlists/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la suppression de la playlist');
    }
  }

  /**
   * Get all playlists for a user
   */
  static async getUserPlaylists(): Promise<Playlist[]> {
    const response = await fetch(`${API_URL}/playlists/user`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des playlists');
    }
    return response.json();
  }

  /**
   * Get playlist details
   */
  static async getPlaylistDetails(id: number): Promise<Playlist> {
    const response = await fetch(`${API_URL}/playlists/${id}`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error(
        'Erreur lors de la récupération des détails de la playlist',
      );
    }
    return response.json();
  }

  /**
   * Add tracks to a playlist
   */
  static async addTracksToPlaylist(
    playlistId: number,
    trackIds: number[],
  ): Promise<void> {
    const response = await fetch(`${API_URL}/playlists/${playlistId}/tracks`, {
      method: 'POST',
      headers: {
        ...this.getHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ trackIds }),
    });
    if (!response.ok) {
      throw new Error("Erreur lors de l'ajout des pistes à la playlist");
    }
  }

  /**
   * Remove tracks from a playlist
   */
  static async removeTracksFromPlaylist(
    playlistId: number,
    trackIds: number[],
  ): Promise<void> {
    const response = await fetch(`${API_URL}/playlists/${playlistId}/tracks`, {
      method: 'DELETE',
      headers: {
        ...this.getHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ trackIds }),
    });
    if (!response.ok) {
      throw new Error(
        'Erreur lors de la suppression des pistes de la playlist',
      );
    }
  }
}

export default PlaylistService;
