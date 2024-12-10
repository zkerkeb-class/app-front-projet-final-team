import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import {
  BookmarkIcon,
  MusicalNoteIcon,
  UserIcon,
} from '@heroicons/react/24/solid';

export default function LibrarySidebar() {
  const { t } = useTranslation('common');
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div
      className={`h-[calc(100vh-12rem)] text-gray-900 dark:text-white shadow-lg dark:bg-gray-800 transition-all duration-300
      rounded-2xl 
      ${isExpanded ? 'w-64' : 'w-20'}`}
    >
      <nav className="p-2 space-y-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center space-x-3 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
        >
          <span className="">
            <BookmarkIcon className="h-6 w-6" />
          </span>
          {isExpanded && (
            <span className="font-bold text-xl">{t('library.title')}</span>
          )}
        </button>
        <div className="flex items-center space-x-3 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
          <span className="text-purple-600">
            <MusicalNoteIcon className="h-5 w-5" />
          </span>
          {isExpanded && <span>{t('library.playlists')}</span>}
        </div>
        <div className="flex items-center space-x-3 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
          <span className="text-purple-600">
            <UserIcon className="h-5 w-5" />
          </span>
          {isExpanded && <span>{t('library.artists')}</span>}
        </div>
      </nav>
    </div>
  );
}
