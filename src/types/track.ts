export interface Track {
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
}
