import { ReactNode } from 'react';
import { useTranslation } from 'next-i18next';
import LanguageSwitcher from './i18n';
import { useTheme } from '../hooks/useTheme';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { t } = useTranslation('common');
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
        <header className="p-4 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('welcome')}
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              {isDarkMode ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>
            <LanguageSwitcher />
          </div>
        </header>
        <main className="container mx-auto px-4 text-gray-900 dark:text-white">
          {children}
        </main>
      </div>
    </div>
  );
}
