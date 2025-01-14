import { ReactNode, useEffect, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import LanguageSwitcher from './i18n';
import { useTheme } from '../hooks/useTheme';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { AudioProvider } from '@/contexts/AudioContext';
import AudioPlayer from './AudioPlayer';
import LibrarySidebar from './LibrarySidebar';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import gsap from 'gsap';
import SearchBar from './SearchBar';

interface LayoutProps {
  children: ReactNode;
}

function LayoutContent({ children }: LayoutProps) {
  const { t } = useTranslation('common');
  const { isDarkMode, toggleTheme } = useTheme();
  const { isExpanded } = useSidebar();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (mainRef.current) {
      gsap.to(mainRef.current, {
        marginLeft: isExpanded ? '256px' : '56px',
        duration: 0.3,
        ease: 'power2.inOut',
      });
    }
  }, [isExpanded]);

  return (
    <AudioProvider>
      <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
        <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 flex flex-col">
          <header className="p-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('welcome')}
            </h1>
            <div className="flex-1 max-w-2xl mx-8">
              <SearchBar />
            </div>
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

          <div className="flex flex-1 overflow-hidden">
            <LibrarySidebar />
            <main ref={mainRef} className="flex-1 overflow-y-auto p-4">
              {children}
            </main>
          </div>

          <AudioPlayer />

          <footer className="bg-gray-50 dark:bg-gray-900 py-8 mt-auto border-t border-gray-200 dark:border-gray-700">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    ZakHarmony
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('footer.description')}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {t('footer.links')}
                  </h3>
                  <ul className="space-y-2">
                    <li>
                      <a
                        href="#"
                        className="text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        {t('footer.about')}
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        {t('footer.contact')}
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        {t('footer.terms')}
                      </a>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {t('footer.social')}
                  </h3>
                  <div className="flex space-x-4">
                    <a
                      href="#"
                      className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                    >
                      Twitter
                    </a>
                    <a
                      href="#"
                      className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                    >
                      Facebook
                    </a>
                    <a
                      href="#"
                      className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                    >
                      Instagram
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-gray-600 dark:text-gray-400">
                <p>
                  &copy; {new Date().getFullYear()} ZakHarmony.{' '}
                  {t('footer.rights')}
                </p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </AudioProvider>
  );
}

export default function Layout(props: LayoutProps) {
  return (
    <SidebarProvider>
      <LayoutContent {...props} />
    </SidebarProvider>
  );
}
