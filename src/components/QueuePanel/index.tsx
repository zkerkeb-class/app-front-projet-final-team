import { useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAudio } from '@/contexts/AudioContext';
import { Track } from '@/types/audio';
import Image from 'next/image';
import gsap from 'gsap';

interface QueuePanelProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export default function QueuePanel({
  isOpen,
  onClose,
  className = '',
}: QueuePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const {
    queue,
    currentTrack,
    setCurrentTrack,
    setIsPlaying,
    removeFromQueue,
    setIsTrackChanging,
  } = useAudio();

  const handleTrackClick = (track: Track, index: number) => {
    setIsTrackChanging(true);
    setIsPlaying(false);

    const tracksToRemove = queue.slice(0, index + 1);
    tracksToRemove.forEach((t) => removeFromQueue(t.id));

    setTimeout(() => {
      setCurrentTrack(track);
      requestAnimationFrame(() => {
        setIsPlaying(true);
        setIsTrackChanging(false);
      });
    }, 100);
  };

  useEffect(() => {
    if (panelRef.current) {
      gsap.to(panelRef.current, {
        x: isOpen ? 0 : '100%',
        duration: 0.3,
        ease: 'power2.inOut',
      });
    }
  }, [isOpen]);

  return (
    <div
      ref={panelRef}
      className={`fixed top-0 right-0 w-80 h-[calc(100vh-6rem)] bg-white dark:bg-gray-800 shadow-lg transform translate-x-full z-50 flex flex-col ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          File d'attente
        </h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
        >
          <XMarkIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Current track */}
      {currentTrack && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            En cours de lecture
          </h3>
          <div className="flex items-center space-x-3">
            <Image
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              width={48}
              height={48}
              className="rounded-md"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {currentTrack.title}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {currentTrack.artist}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Queue list */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            À venir
          </h3>
          {queue.length > 0 ? (
            <div className="space-y-2">
              {queue.map((track: Track, index: number) => (
                <div
                  key={track.id}
                  onClick={() => handleTrackClick(track, index)}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
                >
                  <span className="text-sm text-gray-400 dark:text-gray-500 w-6">
                    {index + 1}
                  </span>
                  <Image
                    src={track.coverUrl}
                    alt={track.title}
                    width={40}
                    height={40}
                    className="rounded-md"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {track.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {track.artist}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
              La file d'attente est vide
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
