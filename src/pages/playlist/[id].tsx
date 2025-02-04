import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useAudio } from '@/contexts/AudioContext';
import PlaylistService from '@/services/api/playlist.service';
import TrackService from '@/services/api/track.service';
import recentlyPlayedService from '@/services/localStorage/recentlyPlayed.service';
import { Playlist, ApiPlaylist, mapPlaylistFromApi } from '@/types/playlist';
import { Track, ApiTrack, mapTrackFromApi } from '@/types/track';
import { toast } from 'react-hot-toast';
import {
  TrashIcon,
  PlayIcon,
  PauseIcon,
  PencilIcon,
} from '@heroicons/react/24/solid';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'react-i18next';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
  };
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
    revalidate: 60,
  };
}

export default function PlaylistDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { t } = useTranslation('common');
  const { setQueue, currentTrack, isPlaying, togglePlayPause, playTrack } =
    useAudio();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddTrackModal, setShowAddTrackModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [availableTracks, setAvailableTracks] = useState<Track[]>([]);
  const [selectedTracks, setSelectedTracks] = useState<number[]>([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [popularTracks, setPopularTracks] = useState<Track[]>([]);

  const fetchSpecialPlaylist = async () => {
    try {
      setIsLoading(true);
      let tracks: Track[] = [];

      if (id === 'mostplayed') {
        const response = await TrackService.getMostPlayed(50);
        tracks = (response as unknown as ApiTrack[]).map(mapTrackFromApi);
      } else if (id === 'recent') {
        const recentTracks = recentlyPlayedService.getRecentlyPlayed();
        tracks = recentTracks.map((track) => ({
          id: track.id,
          title: track.title,
          artist: track.artist_name,
          src: track.audio_file_path.urls.mp3,
          coverUrl: track.image_url?.urls.medium.webp,
          duration: track.duration_seconds,
          albumId: track.album_id,
        }));
      }

      setPlaylist({
        id: id as string,
        title: id === 'mostplayed' ? 'Les Plus Écoutés' : 'Écoutés Récemment',
        description:
          id === 'mostplayed'
            ? 'Top 50 des morceaux les plus écoutés'
            : 'Derniers morceaux écoutés',
        tracks,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de la playlist:', error);
      toast.error('Impossible de charger la playlist');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlaylist = async () => {
    if (!id) return;

    if (id === 'mostplayed' || id === 'recent') {
      await fetchSpecialPlaylist();
      return;
    }

    try {
      setIsLoading(true);
      const playlistData = (await PlaylistService.getPlaylistDetails(
        Number(id),
      )) as unknown as ApiPlaylist;
      setPlaylist(mapPlaylistFromApi(playlistData));
    } catch (error) {
      console.error('Erreur lors de la récupération de la playlist:', error);
      toast.error('Impossible de charger la playlist');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPopularTracks = async () => {
    try {
      setIsLoadingTracks(true);
      const response = await TrackService.getMostPlayed(10);
      const tracks = (response as unknown as ApiTrack[]).map(mapTrackFromApi);
      setPopularTracks(tracks);
      setAvailableTracks(tracks);
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des morceaux populaires:',
        error,
      );
      toast.error(t('playlists.errors.loadTracksFailed'));
    } finally {
      setIsLoadingTracks(false);
    }
  };

  const searchTracks = async () => {
    if (!searchQuery.trim()) {
      setAvailableTracks(popularTracks);
      return;
    }

    try {
      setIsLoadingTracks(true);
      const response = await TrackService.searchTracks(searchQuery);
      const tracks = (response as unknown as ApiTrack[]).map(mapTrackFromApi);
      setAvailableTracks(tracks);
    } catch (error) {
      console.error('Erreur lors de la recherche des morceaux:', error);
      toast.error(t('search.error'));
    } finally {
      setIsLoadingTracks(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPlaylist();
    }
  }, [id]);

  useEffect(() => {
    if (showAddTrackModal) {
      fetchPopularTracks();
    } else {
      setSearchQuery('');
      setSelectedTracks([]);
    }
  }, [showAddTrackModal]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchTracks();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  useEffect(() => {
    if (playlist) {
      setEditedTitle(playlist.title);
    }
  }, [playlist]);

  const handleAddTracks = async () => {
    if (!playlist || typeof playlist.id !== 'number') return;

    try {
      await PlaylistService.addTracksToPlaylist(playlist.id, selectedTracks);
      toast.success(t('playlists.successAddTracks'));
      setShowAddTrackModal(false);
      setSelectedTracks([]);
      fetchPlaylist();
    } catch (error) {
      console.error("Erreur lors de l'ajout des morceaux:", error);
      toast.error(t('playlists.errors.addTracksFailed'));
    }
  };

  const handleRemoveTrack = async (trackId: number) => {
    if (!playlist || typeof playlist.id !== 'number') return;

    try {
      await PlaylistService.removeTracksFromPlaylist(playlist.id, trackId);
      toast.success(t('playlists.successRemoveTrack'));
      fetchPlaylist();
    } catch (error) {
      console.error('Erreur lors de la suppression du morceau:', error);
      toast.error(t('playlists.errors.removeTrackFailed'));
    }
  };

  const handlePlayTrack = (track: Track, index: number) => {
    if (playlist) {
      if (currentTrack?.id === track.id) {
        togglePlayPause();
        return;
      }

      const remainingTracks = playlist.tracks.slice(index + 1);
      setQueue(remainingTracks);
      playTrack(track);
    }
  };

  const handlePlayAll = () => {
    if (playlist && playlist.tracks.length > 0) {
      setQueue(playlist.tracks.slice(1));
      playTrack(playlist.tracks[0]);
    }
  };

  const handleUpdatePlaylist = async () => {
    if (!playlist || typeof playlist.id !== 'number') return;

    try {
      const formData = new FormData();
      formData.append('title', editedTitle);

      await PlaylistService.updatePlaylist(playlist.id, formData);
      toast.success(t('playlists.successUpdate'));
      setIsEditing(false);
      fetchPlaylist();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la playlist:', error);
      toast.error(t('playlists.errors.updateFailed'));
    }
  };

  const handleDeletePlaylist = async () => {
    if (!playlist || typeof playlist.id !== 'number') return;

    try {
      await PlaylistService.deletePlaylist(playlist.id);
      toast.success(t('playlists.successDelete'));
      router.push('/playlists');
    } catch (error) {
      console.error('Erreur lors de la suppression de la playlist:', error);
      toast.error(t('playlists.errors.deleteFailed'));
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {t('errors.unauthorized')}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {t('playlists.empty')}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-4">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full text-3xl font-bold bg-transparent border-b border-gray-300 dark:border-gray-700 focus:border-purple-500 focus:ring-0 px-2 py-1 outline-none dark:text-white"
                placeholder={t('playlists.title')}
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleUpdatePlaylist}
                  className="px-4 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  {t('actions.save')}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedTitle(playlist.title);
                  }}
                  className="px-4 py-2 text-sm bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  {t('actions.cancel')}
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {playlist.title}
              </h1>
            </>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {!['mostplayed', 'recent'].includes(id as string) && (
            <>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900 rounded-full transition-colors"
                title={t('actions.edit')}
              >
                <PencilIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowDeleteConfirmation(true)}
                className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900 rounded-full transition-colors"
                title={t('actions.delete')}
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </>
          )}
          {playlist && playlist.tracks.length > 0 && (
            <button
              onClick={handlePlayAll}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 flex items-center space-x-2"
            >
              <PlayIcon className="w-4 h-4" />
              <span>{t('playlists.playAll')}</span>
            </button>
          )}
          {!['mostplayed', 'recent'].includes(id as string) && (
            <button
              onClick={() => setShowAddTrackModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              {t('playlists.addTracks')}
            </button>
          )}
        </div>
      </div>

      {playlist.tracks.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400">
          {t('playlists.empty')}
        </p>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          {playlist.tracks.map((track, index) => (
            <div
              key={track.id}
              className={`flex items-center justify-between p-4 ${
                index !== playlist.tracks.length - 1
                  ? 'border-b border-gray-200 dark:border-gray-700'
                  : ''
              } hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
            >
              <div className="flex items-center space-x-4 flex-1">
                <button
                  onClick={() => handlePlayTrack(track, index)}
                  className="p-2 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors"
                >
                  {currentTrack?.id === track.id && isPlaying ? (
                    <PauseIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  ) : (
                    <PlayIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  )}
                </button>
                {track.coverUrl && (
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
                <div>
                  <h3 className="text-gray-900 dark:text-white font-medium">
                    {track.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {track.artist}
                  </p>
                </div>
              </div>
              {!['mostplayed', 'recent'].includes(id as string) && (
                <button
                  onClick={() => handleRemoveTrack(track.id)}
                  className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900 rounded-full transition-colors"
                  title="Supprimer de la playlist"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showAddTrackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('playlists.addTracks')}
              </h2>
              <button
                onClick={() => setShowAddTrackModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                {t('actions.close')}
              </button>
            </div>

            <div className="mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search.placeholder')}
                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="max-h-96 overflow-y-auto">
              {isLoadingTracks ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : availableTracks.length === 0 ? (
                <p className="text-center text-gray-600 dark:text-gray-400 py-8">
                  {searchQuery
                    ? t('search.noResults')
                    : t('playlists.noTracksToAdd')}
                </p>
              ) : (
                <div style={{ height: '400px' }}>
                  <AutoSizer>
                    {({ height, width }: { height: number; width: number }) => (
                      <List
                        height={height}
                        itemCount={availableTracks.length}
                        itemSize={80}
                        width={width}
                      >
                        {({ index, style }) => {
                          const track = availableTracks[index];
                          return (
                            <div
                              style={style}
                              className="flex items-center space-x-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              <button
                                onClick={() => {
                                  if (selectedTracks.includes(track.id)) {
                                    setSelectedTracks(
                                      selectedTracks.filter(
                                        (id) => id !== track.id,
                                      ),
                                    );
                                  } else {
                                    setSelectedTracks([
                                      ...selectedTracks,
                                      track.id,
                                    ]);
                                  }
                                }}
                                className={`p-2 rounded-full transition-colors ${
                                  selectedTracks.includes(track.id)
                                    ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400'
                                    : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                              >
                                {selectedTracks.includes(track.id) ? (
                                  <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                ) : (
                                  <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                    />
                                  </svg>
                                )}
                              </button>
                              {track.coverUrl && (
                                <img
                                  src={track.coverUrl}
                                  alt={track.title}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              )}
                              <div className="flex-1">
                                <h3 className="text-gray-900 dark:text-white font-medium">
                                  {track.title}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {track.artist}
                                </p>
                              </div>
                            </div>
                          );
                        }}
                      </List>
                    )}
                  </AutoSizer>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-between items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('playlists.tracks', { count: selectedTracks.length })}
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAddTrackModal(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  {t('actions.cancel')}
                </button>
                <button
                  onClick={handleAddTracks}
                  disabled={selectedTracks.length === 0}
                  className="px-4 py-2 text-white bg-purple-600 border border-transparent rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('actions.save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('playlists.deleteConfirmTitle')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('playlists.deleteConfirmMessage')}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                {t('actions.cancel')}
              </button>
              <button
                onClick={handleDeletePlaylist}
                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors duration-200"
              >
                {t('actions.confirmDelete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
