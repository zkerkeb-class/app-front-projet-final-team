export interface SearchResult {
  id: string;
  title: string;
  type: 'track' | 'artist' | 'album' | 'playlist';
  image_url: {
    urls: {
      original: {
        webp: string;
        jpeg: string;
        png: string;
      };
      thumbnail: {
        webp: string;
        jpeg: string;
        png: string;
      };
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
    baseKey: string;
  };
  subtitle?: string;
  album_id?: string;
  artist_id?: string;
  artist_name?: string;
  album_name?: string;
}
