import { Track, ApiTrack } from './track';

export interface ApiPlaylist {
  id: number;
  title: string;
  description?: string;
  coverImage?: string;
  tracks: ApiTrack[];
}

export interface Playlist {
  id: string | number;
  title: string;
  description?: string;
  coverImage?: string;
  tracks: Track[];
}

export interface PlaylistFormData {
  id: number;
  title: string;
  description?: string;
  coverImage?: File;
}

export const mapPlaylistFromApi = (playlist: ApiPlaylist): Playlist => ({
  id: playlist.id,
  title: playlist.title,
  description: playlist.description,
  coverImage: playlist.coverImage,
  tracks: playlist.tracks.map((track) => ({
    id: track.id,
    title: track.title,
    artist: track.artist_name,
    coverUrl: track.image_url?.urls.medium.webp || '',
    src: track.audio_file_path.urls.mp3,
    albumId: track.album_id,
    duration: track.duration_seconds,
  })),
});
