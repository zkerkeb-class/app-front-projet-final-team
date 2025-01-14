import { useTranslation } from 'next-i18next';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error?: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation('common');

  useEffect(() => {
    console.error('Erreur:', error);
  }, [error]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          {t('errors.somethingWentWrong')}
        </h2>
        <button
          onClick={reset}
          className="rounded-md bg-purple-600 px-4 py-2 text-sm text-white transition-colors hover:bg-purple-500"
        >
          {t('errors.tryAgain')}
        </button>
      </div>
    </div>
  );
}
