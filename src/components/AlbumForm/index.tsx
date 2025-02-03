import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import AlbumService from '@/services/api/album.service';
import { AlbumDetails } from '@/pages/album/[id]';

interface AlbumFormProps {
  album?: AlbumDetails;
  onSuccess: () => void;
  onCancel: () => void;
}

interface AlbumFormData {
  title: string;
  release_date: string;
  genre: string;
  coverImage: FileList;
  tracks: FileList;
}

export default function AlbumForm({
  album,
  onSuccess,
  onCancel,
}: AlbumFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AlbumFormData>();

  const onSubmit = async (data: AlbumFormData) => {
    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('release_date', data.release_date);
      formData.append('genre', data.genre);

      if (data.coverImage[0]) {
        formData.append('coverImage', data.coverImage[0]);
      }

      Array.from(data.tracks).forEach((track, index) => {
        formData.append(`tracks[${index}]`, track);
      });

      if (album) {
        await AlbumService.updateAlbum(album.id, formData);
        toast.success('Album mis à jour avec succès');
      } else {
        await AlbumService.createAlbum(formData);
        toast.success('Album créé avec succès');
      }

      onSuccess();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de l'album:", error);
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
          defaultValue={album?.title}
          {...register('title', { required: 'Le titre est requis' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="release_date"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Date de sortie
        </label>
        <input
          type="date"
          id="release_date"
          defaultValue={album?.release_date}
          {...register('release_date', {
            required: 'La date de sortie est requise',
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
        />
        {errors.release_date && (
          <p className="mt-1 text-sm text-red-600">
            {errors.release_date.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="genre"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Genre
        </label>
        <select
          id="genre"
          defaultValue={album?.genre}
          {...register('genre', { required: 'Le genre est requis' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="">Sélectionner un genre</option>
          <option value="pop">Pop</option>
          <option value="rock">Rock</option>
          <option value="hip-hop">Hip-Hop</option>
          <option value="jazz">Jazz</option>
          <option value="classical">Classique</option>
          <option value="electronic">Électronique</option>
          <option value="other">Autre</option>
        </select>
        {errors.genre && (
          <p className="mt-1 text-sm text-red-600">{errors.genre.message}</p>
        )}
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
          {...register('coverImage', {
            required: !album && 'Une image de couverture est requise',
          })}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900 dark:file:text-purple-300"
        />
        {errors.coverImage && (
          <p className="mt-1 text-sm text-red-600">
            {errors.coverImage.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="tracks"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Pistes audio
        </label>
        <input
          type="file"
          id="tracks"
          accept="audio/*"
          multiple
          {...register('tracks', {
            required: !album && 'Au moins une piste est requise',
          })}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900 dark:file:text-purple-300"
        />
        {errors.tracks && (
          <p className="mt-1 text-sm text-red-600">{errors.tracks.message}</p>
        )}
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
            : album
              ? 'Mettre à jour'
              : 'Créer'}
        </button>
      </div>
    </form>
  );
}
