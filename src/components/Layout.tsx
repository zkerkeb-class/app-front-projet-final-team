import { ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import LanguageSwitcher from './i18n';
import { useTheme } from '../hooks/useTheme';
import { SunIcon, MoonIcon, UserIcon } from '@heroicons/react/24/outline';
import { AudioProvider } from '@/contexts/AudioContext';
import AudioPlayer from './AudioPlayer';
import LibrarySidebar from './LibrarySidebar';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import gsap from 'gsap';
import SearchBar from './SearchBar';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: ReactNode;
}

function UserMenu() {
  const { user, logout } = useAuth();
  const { t } = useTranslation('common');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!user) {
    return (
      <>
        {/* Version desktop */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/auth/login"
            className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
          >
            {t('auth.login')}
          </Link>
          <span className="text-gray-400">|</span>
          <Link
            href="/auth/register"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            {t('auth.register')}
          </Link>
        </div>

        {/* Version mobile */}
        <div className="md:hidden relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <UserIcon className="h-5 w-5" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50">
              <Link
                href="/auth/login"
                className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {t('auth.login')}
              </Link>
              <Link
                href="/auth/register"
                className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {t('auth.register')}
              </Link>
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400">
        {user.profile_picture_url ? (
          <img
            src={user.profile_picture_url}
            alt={user.username}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <UserIcon className="w-8 h-8 p-1 rounded-full bg-gray-200 dark:bg-gray-700" />
        )}
        <span className="hidden md:inline">{user.username}</span>
      </button>
      <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <Link
          href="/profile"
          className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {t('menu.profile')}
        </Link>
        <Link
          href="/settings"
          className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {t('menu.settings')}
        </Link>
        <button
          onClick={logout}
          className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {t('auth.logout')}
        </button>
      </div>
    </div>
  );
}

function LayoutContent({ children }: LayoutProps) {
  const { t } = useTranslation('common');
  const { isDarkMode, toggleTheme } = useTheme();
  const { isExpanded } = useSidebar();
  const mainRef = useRef<HTMLElement>(null);
  const router = useRouter();

  // Vérifier si on est sur une page d'authentification
  const isAuthPage = router.pathname.startsWith('/auth/');

  useEffect(() => {
    if (mainRef.current && !isAuthPage) {
      gsap.to(mainRef.current, {
        marginLeft: isExpanded ? '256px' : '56px',
        duration: 0.3,
        ease: 'power2.inOut',
      });
    }
  }, [isExpanded, isAuthPage]);

  return (
    <AudioProvider>
      <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
        <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 flex flex-col">
          {!isAuthPage && (
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
                <UserMenu />
              </div>
            </header>
          )}

          <div className="flex flex-1 overflow-hidden">
            {!isAuthPage && <LibrarySidebar />}
            <main
              ref={mainRef}
              className={`flex-1 overflow-y-auto ${isAuthPage ? 'p-0' : 'p-4'}`}
              style={{ marginLeft: isAuthPage ? '0' : undefined }}
            >
              {children}
            </main>
          </div>

          {!isAuthPage && <AudioPlayer />}

          {!isAuthPage && (
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
          )}
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
