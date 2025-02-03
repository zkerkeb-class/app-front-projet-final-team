import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import PlaylistService from '@/services/api/playlist.service';
import { Playlist } from '@/types/playlist';

interface PlaylistFormProps {
  playlist?: Playlist;
  onSuccess: () => void;
  onCancel: () => void;
}

interface PlaylistFormData {
  title: string;
  description?: string;
  coverImage?: FileList;
}

export default function PlaylistForm({
  playlist,
  onSuccess,
  onCancel,
}: PlaylistFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PlaylistFormData>();

  const onSubmit = async (data: PlaylistFormData) => {
    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('title', data.title);
      if (data.description) {
        formData.append('description', data.description);
      }

      if (data.coverImage?.[0]) {
        formData.append('coverImage', data.coverImage[0]);
      }

      if (playlist) {
        await PlaylistService.updatePlaylist(Number(playlist.id), formData);
        toast.success('Playlist mise à jour avec succès');
      } else {
        await PlaylistService.createPlaylist(formData);
        toast.success('Playlist créée avec succès');
      }

      onSuccess();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la playlist:', error);
      toast.error('Une erreur est survenue lors de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Titre
        </label>
        <input
          type="text"
          id="title"
          defaultValue={playlist?.title}
          {...register('title', { required: 'Le titre est requis' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Description
        </label>
        <textarea
          id="description"
          defaultValue={playlist?.description}
          {...register('description')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
          rows={3}
        />
      </div>

      <div>
        <label
          htmlFor="coverImage"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Image de couverture
        </label>
        <input
          type="file"
          id="coverImage"
          accept="image/*"
          {...register('coverImage')}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900 dark:file:text-purple-300"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? 'Enregistrement...'
            : playlist
              ? 'Mettre à jour'
              : 'Créer'}
        </button>
      </div>
    </form>
  );
}
