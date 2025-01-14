import { SearchResult } from '@/types/search';

interface BaseSearchResult {
  id: string;
  title?: string;
  name?: string;
  type: 'track' | 'album' | 'artist' | 'playlist';
  cover_art_url?: string;
  profile_picture_url?: string;
  artist?: {
    name: string;
  };
  total_tracks?: number;
}

export function formatSearchResults(
  results: BaseSearchResult[],
): SearchResult[] {
  return results.map((result) => {
    const title = result.title || result.name;
    if (!title) {
      throw new Error('Le titre ou le nom est requis pour chaque résultat');
    }

    const baseResult: SearchResult = {
      id: result.id,
      title,
      type: result.type,
      imageUrl: result.cover_art_url || result.profile_picture_url,
    };

    switch (result.type) {
      case 'track':
      case 'album':
        return {
          ...baseResult,
          subtitle: result.artist?.name || 'Artiste inconnu',
        };
      case 'artist':
      case 'playlist':
        return {
          ...baseResult,
          subtitle: `${result.total_tracks || 0} titres`,
        };
      default:
        return baseResult;
    }
  });
}
