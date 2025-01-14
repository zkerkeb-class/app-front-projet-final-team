export interface SearchResult {
  id: string;
  title: string;
  type: 'track' | 'artist' | 'album' | 'playlist';
  imageUrl?: string;
  subtitle?: string;
}
