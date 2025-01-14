import { SearchResult } from '@/types/search';

// interface BaseSearchResult {
//   id: string;
//   title?: string;
//   name?: string;
//   type: 'track' | 'album' | 'artist' | 'playlist';
//   cover_art_url?: string;
//   profile_picture_url?: string;
//   artist?: {
//     name: string;
//   };
//   total_tracks?: number;
// }

export function formatSearchResults(results: {
  tracks: { name: string }[];
  artists: { name: string }[];
  albums: { name: string }[];
  playlists: { name: string }[];
}): SearchResult[] {
  const formattedResults: SearchResult[] = [];

  // Formater les pistes
  results.tracks?.forEach((track, index) => {
    formattedResults.push({
      id: `track-${index}`,
      title: track.name,
      type: 'track',
      subtitle: 'Titre',
    });
  });

  // Formater les artistes
  results.artists?.forEach((artist, index) => {
    formattedResults.push({
      id: `artist-${index}`,
      title: artist.name,
      type: 'artist',
      subtitle: 'Artiste',
    });
  });

  // Formater les albums
  results.albums?.forEach((album, index) => {
    formattedResults.push({
      id: `album-${index}`,
      title: album.name,
      type: 'album',
      subtitle: 'Album',
    });
  });

  // Formater les playlists
  results.playlists?.forEach((playlist, index) => {
    formattedResults.push({
      id: `playlist-${index}`,
      title: playlist.name,
      type: 'playlist',
      subtitle: 'Playlist',
    });
  });

  return formattedResults;
}
