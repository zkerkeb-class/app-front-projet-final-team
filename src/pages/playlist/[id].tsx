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
import { TrashIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/solid';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

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
  const { setQueue, currentTrack, isPlaying, togglePlayPause, playTrack } =
    useAudio();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddTrackModal, setShowAddTrackModal] = useState(false);
  const [availableTracks, setAvailableTracks] = useState<Track[]>([]);
  const [selectedTracks, setSelectedTracks] = useState<number[]>([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);

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

  const fetchAvailableTracks = async () => {
    if (!user) return;

    try {
      setIsLoadingTracks(true);
      const tracks = (await TrackService.getUserTracks(
        user.id,
      )) as unknown as ApiTrack[];
      // Filter out tracks that are already in the playlist
      const availableTracks = tracks
        .map(mapTrackFromApi)
        .filter((track) => !playlist?.tracks.some((pt) => pt.id === track.id));
      setAvailableTracks(availableTracks);
    } catch (error) {
      console.error('Erreur lors de la récupération des morceaux:', error);
      toast.error('Impossible de charger les morceaux disponibles');
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
      fetchAvailableTracks();
    }
  }, [showAddTrackModal]);

  const handleAddTracks = async () => {
    if (!playlist || typeof playlist.id !== 'number') return;

    try {
      await PlaylistService.addTracksToPlaylist(playlist.id, selectedTracks);
      toast.success('Morceaux ajoutés avec succès');
      setShowAddTrackModal(false);
      setSelectedTracks([]);
      fetchPlaylist();
    } catch (error) {
      console.error("Erreur lors de l'ajout des morceaux:", error);
      toast.error("Impossible d'ajouter les morceaux");
    }
  };

  const handleRemoveTrack = async (trackId: number) => {
    if (!playlist || typeof playlist.id !== 'number') return;

    try {
      await PlaylistService.removeTracksFromPlaylist(playlist.id, [trackId]);
      toast.success('Morceau supprimé avec succès');
      fetchPlaylist();
    } catch (error) {
      console.error('Erreur lors de la suppression du morceau:', error);
      toast.error('Impossible de supprimer le morceau');
    }
  };

  const handlePlayTrack = (track: Track, index: number) => {
    if (playlist) {
      // Si c'est le même morceau, on bascule play/pause
      if (currentTrack?.id === track.id) {
        togglePlayPause();
        return;
      }

      // Sinon, on met à jour la file d'attente à partir de l'index sélectionné (en excluant la piste actuelle)
      const remainingTracks = playlist.tracks.slice(index + 1);
      setQueue(remainingTracks);
      playTrack(track);
    }
  };

  const handlePlayAll = () => {
    if (playlist && playlist.tracks.length > 0) {
      // Mettre à jour la file d'attente avec toutes les pistes sauf la première
      setQueue(playlist.tracks.slice(1));
      playTrack(playlist.tracks[0]);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Veuillez vous connecter pour voir cette playlist
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
          Playlist introuvable
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {playlist.title}
          </h1>
          {playlist.description && (
            <p className="text-gray-600 dark:text-gray-400">
              {playlist.description}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {playlist && playlist.tracks.length > 0 && (
            <button
              onClick={handlePlayAll}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 flex items-center space-x-2"
            >
              <PlayIcon className="w-4 h-4" />
              <span>Tout lire</span>
            </button>
          )}
          {!['mostplayed', 'recent'].includes(id as string) && (
            <button
              onClick={() => setShowAddTrackModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Ajouter des morceaux
            </button>
          )}
        </div>
      </div>

      {playlist.tracks.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400">
          Cette playlist ne contient aucun morceau
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
                Ajouter des morceaux
              </h2>
              <button
                onClick={() => setShowAddTrackModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                Fermer
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {isLoadingTracks ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : availableTracks.length === 0 ? (
                <p className="text-center text-gray-600 dark:text-gray-400 py-8">
                  Aucun morceau disponible à ajouter
                </p>
              ) : (
                availableTracks.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center space-x-4 p-4 border-b border-gray-200 dark:border-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTracks.includes(track.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTracks([...selectedTracks, track.id]);
                        } else {
                          setSelectedTracks(
                            selectedTracks.filter((id) => id !== track.id),
                          );
                        }
                      }}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
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
                ))
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddTrackModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Annuler
              </button>
              <button
                onClick={handleAddTracks}
                disabled={selectedTracks.length === 0}
                className="px-4 py-2 text-white bg-purple-600 border border-transparent rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
