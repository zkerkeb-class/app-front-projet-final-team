import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import AlbumService from '@/services/api/album.service';
import { Album } from '@/types/album';
import AlbumForm from '@/components/AlbumForm';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { AlbumDetails } from '@/pages/album/[id]';
import React from 'react';

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

export default function ArtistPage() {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<AlbumDetails | null>(null);

  const fetchAlbums = async () => {
    try {
      if (!user) return;
      const data = await AlbumService.getUserAlbums(user.id);
      setAlbums(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des albums:', error);
      toast.error('Une erreur est survenue lors de la récupération des albums');
    } finally {
      setLoading(false);
    }
  };

  const fetchAlbumDetails = async (albumId: number) => {
    try {
      const details = await AlbumService.getAlbumDetails(albumId);
      setEditingAlbum(details);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des détails de l'album:",
        error,
      );
      toast.error(
        "Une erreur est survenue lors de la récupération des détails de l'album",
      );
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, [user]);

  const handleDelete = async (albumId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet album ?')) {
      try {
        await AlbumService.deleteAlbum(albumId);
        toast.success('Album supprimé avec succès');
        fetchAlbums();
      } catch (error) {
        console.error("Erreur lors de la suppression de l'album:", error);
        toast.error('Une erreur est survenue lors de la suppression');
      }
    }
  };

  const handleEdit = async (album: Album) => {
    await fetchAlbumDetails(album.id);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingAlbum(null);
    fetchAlbums();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Mes albums
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Ajouter un album
        </button>
      </div>

      {showForm || editingAlbum ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            {editingAlbum ? "Modifier l'album" : 'Nouvel album'}
          </h2>
          <AlbumForm
            album={editingAlbum || undefined}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setShowForm(false);
              setEditingAlbum(null);
            }}
          />
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {albums.length > 0 ? (
          albums.map((album) => (
            <div
              key={album.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
            >
              <Link href={`/album/${album.id}`}>
                <div className="relative aspect-square">
                  <Image
                    src={album.image_url.urls.medium.webp}
                    alt={album.title}
                    fill
                    sizes="100vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">
                    {album.title}
                  </h3>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {Array.isArray(album.genre) &&
                      album.genre.map((genre, index) => (
                        <React.Fragment key={index}>
                          {index > 0 && ', '}
                          <span>{genre}</span>
                        </React.Fragment>
                      ))}
                    {' • '}
                    {new Date(album.release_date).getFullYear()}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {album.total_tracks} pistes
                  </p>
                </div>
              </Link>
              <div className="px-4 pb-4 flex justify-end space-x-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleEdit(album);
                  }}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete(album.id);
                  }}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-8">
            Vous n'avez pas encore d'albums. Commencez par en créer un !
          </div>
        )}
      </div>
    </div>
  );
}
