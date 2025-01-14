import { useEffect, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import gsap from 'gsap';
import {
  BookmarkIcon,
  MusicalNoteIcon,
  UserIcon,
} from '@heroicons/react/24/solid';
import { useSidebar } from '@/contexts/SidebarContext';

export default function LibrarySidebar() {
  const { t } = useTranslation('common');
  const { isExpanded, setIsExpanded } = useSidebar();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const textElementsRef = useRef<(HTMLSpanElement | null)[]>([]);

  const setTextRef = (index: number) => (el: HTMLSpanElement | null) => {
    textElementsRef.current[index] = el;
  };

  useEffect(() => {
    if (sidebarRef.current) {
      // Animation de la sidebar
      gsap.to(sidebarRef.current, {
        width: isExpanded ? 256 : '56',
        duration: 0.3,
        ease: 'power2.inOut',
      });

      // Animation des textes
      textElementsRef.current.forEach((element) => {
        gsap.to(element, {
          opacity: isExpanded ? 1 : 0,
          duration: 0.2,
          ease: 'power2.inOut',
        });
      });
    }
  }, [isExpanded]);

  return (
    <div
      ref={sidebarRef}
      className="fixed left-4 top-18 h-[calc(100vh-12rem)] text-gray-900 dark:text-white shadow-lg dark:bg-gray-800 transition-colors duration-300
      rounded-2xl overflow-hidden z-1"
    >
      <nav className="p-2 space-y-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center h-10 space-x-3 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
        >
          <span className="shrink-0">
            <BookmarkIcon className="h-6 w-6" />
          </span>
          <span
            ref={setTextRef(0)}
            className="font-bold text-xl whitespace-nowrap"
          >
            {t('library.title')}
          </span>
        </button>

        <div className="flex items-center h-10 space-x-3 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
          <span className="text-purple-600 shrink-0">
            <MusicalNoteIcon className="h-5 w-5" />
          </span>
          <span ref={setTextRef(1)} className="whitespace-nowrap">
            {t('library.playlists')}
          </span>
        </div>

        <div className="flex items-center h-10 space-x-3 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
          <span className="text-purple-600 shrink-0">
            <UserIcon className="h-5 w-5" />
          </span>
          <span ref={setTextRef(2)} className="whitespace-nowrap">
            {t('library.artists')}
          </span>
        </div>
      </nav>
    </div>
  );
}
