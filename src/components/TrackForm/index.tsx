import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import TrackService from '@/services/api/track.service';
import { Track } from '@/types/audio';

interface TrackFormProps {
  track?: Track;
  onSuccess: () => void;
  onCancel: () => void;
}

interface TrackFormData {
  title: string;
  audioFile: FileList;
  coverImage: FileList;
}

export default function TrackForm({
  track,
  onSuccess,
  onCancel,
}: TrackFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TrackFormData>();

  const onSubmit = async (data: TrackFormData) => {
    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('title', data.title);

      if (data.audioFile[0]) {
        formData.append('audioFile', data.audioFile[0]);
      }

      if (data.coverImage[0]) {
        formData.append('coverImage', data.coverImage[0]);
      }

      if (track) {
        await TrackService.updateTrack(track.id, formData);
        toast.success('Piste mise à jour avec succès');
      } else {
        await TrackService.createTrack(formData);
        toast.success('Piste créée avec succès');
      }

      onSuccess();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la piste:', error);
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
          defaultValue={track?.title}
          {...register('title', { required: 'Le titre est requis' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="audioFile"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Fichier audio
        </label>
        <input
          type="file"
          id="audioFile"
          accept="audio/*"
          {...register('audioFile', {
            required: !track && 'Le fichier audio est requis',
          })}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900 dark:file:text-purple-300"
        />
        {errors.audioFile && (
          <p className="mt-1 text-sm text-red-600">
            {errors.audioFile.message}
          </p>
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
            required: !track && 'Une image de couverture est requise',
          })}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900 dark:file:text-purple-300"
        />
        {errors.coverImage && (
          <p className="mt-1 text-sm text-red-600">
            {errors.coverImage.message}
          </p>
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
            : track
              ? 'Mettre à jour'
              : 'Créer'}
        </button>
      </div>
    </form>
  );
}
