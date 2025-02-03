import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import PlaylistService from '@/services/api/playlist.service';
import { Playlist } from '@/types/playlist';
import PlaylistForm from '@/components/PlaylistForm';
import PlaylistBackground from '@/components/PlaylistBackground';
import { toast } from 'react-hot-toast';

export default function PlaylistsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<
    Playlist | undefined
  >();

  const fetchPlaylists = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const userPlaylists = await PlaylistService.getUserPlaylists();
      setPlaylists(userPlaylists as unknown as Playlist[]);
    } catch (error) {
      console.error('Erreur lors de la récupération des playlists:', error);
      toast.error('Impossible de charger les playlists');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, [user]);

  const handleDelete = async (playlistId: number) => {
    try {
      await PlaylistService.deletePlaylist(playlistId);
      toast.success('Playlist supprimée avec succès');
      fetchPlaylists();
    } catch (error) {
      console.error('Erreur lors de la suppression de la playlist:', error);
      toast.error('Impossible de supprimer la playlist');
    }
  };

  const handleEdit = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setShowForm(true);
  };

  const handlePlaylistClick = (type: 'mostplayed' | 'recent') => {
    router.push(`/playlist/${type}`);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Veuillez vous connecter pour voir vos playlists
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Mes Playlists
        </h1>
        <button
          onClick={() => {
            setSelectedPlaylist(undefined);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          Créer une playlist
        </button>
      </div>

      {/* Playlists spéciales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div
          onClick={() => handlePlaylistClick('mostplayed')}
          className="cursor-pointer bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
        >
          <div className="relative aspect-square">
            <PlaylistBackground colors={['#9333ea', '#ec4899']} />
            <div className="absolute inset-0 p-4 flex flex-col justify-between z-10">
              <h3 className="text-xl font-semibold text-white">
                Les Plus Écoutés
              </h3>
              <p className="text-sm text-white opacity-80">50 morceaux</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => handlePlaylistClick('recent')}
          className="cursor-pointer bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
        >
          <div className="relative aspect-square">
            <PlaylistBackground colors={['#2563eb', '#4f46e5']} />
            <div className="absolute inset-0 p-4 flex flex-col justify-between z-10">
              <h3 className="text-xl font-semibold text-white">
                Écoutés Récemment
              </h3>
              <p className="text-sm text-white opacity-80">
                Derniers morceaux écoutés
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire de création/édition */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {selectedPlaylist ? 'Modifier la playlist' : 'Créer une playlist'}
            </h2>
            <PlaylistForm
              playlist={selectedPlaylist}
              onSuccess={() => {
                setShowForm(false);
                fetchPlaylists();
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {/* Liste des playlists de l'utilisateur */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : playlists.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400">
          Vous n'avez pas encore créé de playlist
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
            >
              {playlist.coverImage && (
                <img
                  src={playlist.coverImage}
                  alt={playlist.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {playlist.title}
                </h3>
                {playlist.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {playlist.description}
                  </p>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                  {playlist.tracks.length} morceaux
                </p>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleEdit(playlist)}
                    className="px-3 py-1 text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(Number(playlist.id))}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
