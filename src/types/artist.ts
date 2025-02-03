export type TArtist = {
  id: string;
  name: string;
  bio?: string;
  genre?: string;
  country?: string;
  image_url?: {
    urls: {
      medium: {
        webp: string;
        jpeg: string;
        png: string;
      };
      large: {
        webp: string;
        jpeg: string;
        png: string;
      };
    };
  };
  total_listeners: number;
  created_at: string;
  updated_at: string;
};

export type TTrack = {
  id: string;
  title: string;
  album_id?: string;
  artist_id: string;
  duration_seconds: number;
  track_number?: number;
  lyrics?: string;
  genre?: string;
  audio_file_path: {
    urls: {
      [key: string]: string; // mp3, wav, m4a
    };
    baseKey: string;
  };
  cover?: {
    urls: {
      original: ImageFormats;
      thumbnail: ImageFormats;
      medium: ImageFormats;
      large: ImageFormats;
    };
    baseKey: string;
  };
  popularity_score: number;
  total_plays: number;
  release_date?: string;
  created_at: string;
  updated_at: string;
};

export type TPlaylist = {
  id: string;
  title: string;
  creator_id: string;
  is_public: boolean;
  total_tracks: number;
  total_duration_seconds: number;
  cover_images?: {
    urls: {
      original: ImageFormats;
      thumbnail: ImageFormats;
      medium: ImageFormats;
      large: ImageFormats;
    };
    baseKey: string;
  };
  created_at: string;
  updated_at: string;
};

type ImageFormats = {
  webp: string;
  jpeg: string;
  png: string;
};
