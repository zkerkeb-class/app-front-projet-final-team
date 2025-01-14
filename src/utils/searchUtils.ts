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
  tracks: {
    id: string;
    name: string;
    image_url: SearchResult['image_url'];
    album_id?: string;
    album_name?: string;
    artist_name?: string;
    artist_id?: string;
  }[];
  artists: { id: string; name: string; image_url: SearchResult['image_url'] }[];
  albums: { id: string; name: string; image_url: SearchResult['image_url'] }[];
  playlists: {
    id: string;
    name: string;
    image_url: SearchResult['image_url'];
  }[];
}): SearchResult[] {
  const formattedResults: SearchResult[] = [];

  results.tracks?.forEach((track) => {
    formattedResults.push({
      id: track.id,
      title: track.name,
      type: 'track',
      subtitle: `${track.album_name} • ${track.artist_name}`,
      image_url: track.image_url,
      album_id: track.album_id,
      artist_id: track.artist_id,
      artist_name: track.artist_name,
    });
  });

  // Formater les artistes
  results.artists?.forEach((artist) => {
    formattedResults.push({
      id: artist.id,
      title: artist.name,
      type: 'artist',
      subtitle: 'Artiste',
      image_url: artist.image_url,
    });
  });

  // Formater les albums
  results.albums?.forEach((album) => {
    formattedResults.push({
      id: album.id,
      title: album.name,
      type: 'album',
      subtitle: 'Album',
      image_url: album.image_url,
    });
  });

  // Formater les playlists
  results.playlists?.forEach((playlist) => {
    formattedResults.push({
      id: playlist.id,
      title: playlist.name,
      type: 'playlist',
      subtitle: 'Playlist',
      image_url: playlist.image_url,
    });
  });

  return formattedResults;
}
