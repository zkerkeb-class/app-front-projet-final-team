import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import PlaylistService from '@/services/api/playlist.service';
import { Playlist } from '@/types/playlist';
import PlaylistBackground from '@/components/PlaylistBackground';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

export default function PlaylistsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation('common');
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlaylists = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const userPlaylists = await PlaylistService.getUserPlaylists();
      setPlaylists(userPlaylists as unknown as Playlist[]);
    } catch (error) {
      console.error('Erreur lors de la récupération des playlists:', error);
      toast.error(t('playlists.errors.loadFailed'));
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
      toast.success(t('playlists.successDelete'));
      fetchPlaylists();
    } catch (error) {
      console.error('Erreur lors de la suppression de la playlist:', error);
      toast.error(t('playlists.errors.deleteFailed'));
    }
  };

  const handleCreatePlaylist = async () => {
    try {
      const formData = new FormData();
      formData.append('title', `Ma playlist n°${playlists.length + 1}`);
      formData.append('is_public', 'true');

      const newPlaylist = await PlaylistService.createPlaylist(formData);
      toast.success(t('playlists.successCreate'));
      router.push(`/playlist/${newPlaylist.id}`);
    } catch (error) {
      console.error('Erreur lors de la création de la playlist:', error);
      toast.error(t('playlists.errors.createFailed'));
    }
  };

  const handleEdit = (playlist: Playlist) => {
    router.push(`/playlist/${playlist.id}`);
  };

  const handlePlaylistClick = (type: 'mostplayed' | 'recent') => {
    router.push(`/playlist/${type}`);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('playlists.title')}
        </h1>
        <button
          onClick={handleCreatePlaylist}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          {t('playlists.create')}
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
                {t('playlists.mostPlayed')}
              </h3>
              <p className="text-sm text-white opacity-80">
                {t('playlists.mostPlayedDescription')}
              </p>
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
                {t('playlists.recentlyPlayed')}
              </h3>
              <p className="text-sm text-white opacity-80">
                {t('playlists.recentlyPlayedDescription')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des playlists de l'utilisateur */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : playlists.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400">
          {t('playlists.noPlaylists')}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              onClick={() => handleEdit(playlist)}
              className="cursor-pointer bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
            >
              <div className="relative aspect-square">
                {playlist.coverImage ? (
                  <img
                    src={playlist.coverImage}
                    alt={playlist.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <PlaylistBackground
                    colors={[
                      `#${Math.floor(Math.random() * 16777215).toString(16)}`,
                      `#${Math.floor(Math.random() * 16777215).toString(16)}`,
                    ]}
                  />
                )}
                <div className="absolute inset-0 p-4 flex flex-col justify-between z-10">
                  <h3 className="text-xl font-semibold text-white">
                    {playlist.title}
                  </h3>
                  <div>
                    {playlist.description && (
                      <p className="text-sm text-white opacity-80 mb-1">
                        {playlist.description}
                      </p>
                    )}
                    <p className="text-sm text-white opacity-80">
                      {playlist.tracks.length} {t('tracks')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
