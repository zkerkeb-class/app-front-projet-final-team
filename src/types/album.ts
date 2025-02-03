export interface Album {
  id: number;
  title: string;
  release_date: string;
  genre: string;
  primary_artist_id: number;
  total_tracks: number;
  image_url: {
    urls: {
      medium: {
        webp: string;
      };
    };
  };
}
