import { SignalSlashIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'next-i18next';
import OfflineGame from '../OfflineGame';

export default function OfflinePage() {
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center p-8 max-w-md">
        <SignalSlashIcon className="w-24 h-24 mx-auto text-gray-400 dark:text-gray-600 mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {t('offline.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {t('offline.description')}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
        >
          {t('offline.retry')}
        </button>

        <div className="mt-12 border-t border-gray-200 dark:border-gray-800 pt-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('offline.gameTitle')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('offline.gameDescription')}
          </p>
          <OfflineGame />
        </div>
      </div>
    </div>
  );
}
