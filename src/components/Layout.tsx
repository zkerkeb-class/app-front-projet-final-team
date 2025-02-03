import dynamic from 'next/dynamic';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useTheme } from '../hooks/useTheme';
import {
  SunIcon,
  MoonIcon,
  UserIcon,
  MusicalNoteIcon,
} from '@heroicons/react/24/outline';
import { AudioProvider } from '@/contexts/AudioContext';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import gsap from 'gsap';
import SearchBar from './SearchBar';
import { useRouter } from 'next/router';

// Chargement dynamique des composants non-critiques
const LanguageSwitcher = dynamic(() => import('./i18n'), {
  ssr: false,
  loading: () => <div className="w-8 h-8" />,
});

const AudioPlayer = dynamic(() => import('./AudioPlayer'), {
  ssr: false,
  loading: () => null,
});

const LibrarySidebar = dynamic(() => import('./LibrarySidebar'), {
  ssr: false,
  loading: () => null,
});

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
        {user.image_url ? (
          <img
            src={user.image_url.thumbnail.webp}
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
  const isAuthPage = router.pathname.startsWith('/auth/');

  useEffect(() => {
    if (mainRef.current && !isAuthPage && window.innerWidth >= 768) {
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
              <Link
                href="/"
                className="text-2xl font-bold text-gray-900 dark:text-white"
              >
                <span className="hidden md:inline">{t('welcome')}</span>
                <MusicalNoteIcon className="h-8 w-8 md:hidden text-purple-600" />
              </Link>
              <div className="flex-1 max-w-2xl mx-8">
                <SearchBar />
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  aria-label={
                    isDarkMode ? t('theme.lightMode') : t('theme.darkMode')
                  }
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
              className={`flex-1 overflow-y-auto ${isAuthPage ? 'p-0' : 'p-4'} min-h-[calc(100vh-64px)] md:w-[calc(100%-256px)] w-full`}
              style={{
                marginLeft: isAuthPage ? '0' : undefined,
                height: 'calc(100vh - 64px)',
                width: isExpanded ? 'calc(100% - 256px)' : 'calc(100% - 56px)',
              }}
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
                        <Link
                          href="#"
                          className="text-purple-600 dark:text-purple-400 hover:underline"
                        >
                          {t('footer.about')}
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="#"
                          className="text-purple-600 dark:text-purple-400 hover:underline"
                        >
                          {t('footer.contact')}
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="#"
                          className="text-purple-600 dark:text-purple-400 hover:underline"
                        >
                          {t('footer.terms')}
                        </Link>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      {t('footer.social')}
                    </h3>
                    <div className="flex space-x-4">
                      <Link
                        href="#"
                        className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                      >
                        Twitter
                      </Link>
                      <Link
                        href="#"
                        className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                      >
                        Facebook
                      </Link>
                      <Link
                        href="#"
                        className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                      >
                        Instagram
                      </Link>
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
