import { Track } from '@/pages/playlists';

const STORAGE_KEY = 'recently_played';
const MAX_TRACKS = 20;

export interface StoredTrack {
  id: number;
  title: string;
  artist_name: string;
  duration_seconds: number;
  album_id: number;
  image_url: {
    urls: {
      medium: {
        webp: string;
      };
    };
  };
  audio_file_path: {
    urls: {
      mp3: string;
    };
  };
  played_at: string;
}

class RecentlyPlayedService {
  getRecentlyPlayed(): StoredTrack[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  addTrack(track: Track): void {
    try {
      const recentTracks = this.getRecentlyPlayed();

      // Vérifier si la piste existe déjà
      const trackIndex = recentTracks.findIndex((t) => t.id === track.id);

      // Créer la nouvelle entrée avec timestamp
      const newTrack: StoredTrack = {
        ...track,
        played_at: new Date().toISOString(),
      };

      if (trackIndex !== -1) {
        // Si la piste existe, la supprimer de sa position actuelle
        recentTracks.splice(trackIndex, 1);
      }

      // Ajouter la nouvelle piste au début
      recentTracks.unshift(newTrack);

      // Garder seulement les 20 dernières pistes
      const updatedTracks = recentTracks.slice(0, MAX_TRACKS);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTracks));
    } catch (error) {
      console.error("Erreur lors de l'ajout aux pistes récentes:", error);
    }
  }

  clearHistory(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export default new RecentlyPlayedService();
