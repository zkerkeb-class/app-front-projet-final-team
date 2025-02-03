export interface ApiTrack {
  id: number;
  title: string;
  artist_name: string;
  duration_seconds: number;
  album_id?: number;
  image_url?: {
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
}

export interface Track {
  id: number;
  title: string;
  artist: string;
  src: string;
  coverUrl: string;
  albumId?: number;
  duration: number;
}

// Helper functions to map API response to our internal representation
export const mapTrackFromApi = (track: ApiTrack): Track => ({
  id: track.id,
  title: track.title,
  artist: track.artist_name,
  src: track.audio_file_path.urls.mp3,
  coverUrl: track.image_url?.urls.medium.webp || '',
  albumId: track.album_id,
  duration: track.duration_seconds,
});
