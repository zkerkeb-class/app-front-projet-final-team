import { useState, useRef, useEffect, useCallback } from 'react';
import {
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowsPointingOutIcon,
  ArrowPathRoundedSquareIcon,
  ArrowsRightLeftIcon,
  BackwardIcon,
  ForwardIcon,
  QueueListIcon,
  UsersIcon,
} from '@heroicons/react/24/solid';
import Image from 'next/image';
import AudioVisualizer from './components/AudioVisualizer';
import { useAudio } from '@/contexts/AudioContext';
import formatTime from '@/utils/formatTime';
import QueuePanel from '../QueuePanel';
import JamSession from '../JamSession';
import jamSessionService from '@/services/socket/jamSession.service';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';

/**
 * Main audio player component
 * Handles playback controls, progress bar, volume and fullscreen mode
 */
export default function AudioPlayer() {
  const { t } = useTranslation('common');
  const router = useRouter();
  // Audio context
  const {
    currentTrack,
    isPlaying,
    setIsPlaying,
    queue,
    setCurrentTrack,
    removeFromQueue,
  } = useAudio();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Volume state
  const [volume, setVolume] = useState(1);
  const [previousVolume, setPreviousVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Player controls
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Progress bar state
  const [tempProgress, setTempProgress] = useState<number | null>(null);

  // Refs for control bars
  const progressBarRef = useRef<HTMLDivElement>(null);
  const volumeBarRef = useRef<HTMLDivElement>(null);

  // Queue state
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  // Add new state for jam session
  const [isJamSessionOpen, setIsJamSessionOpen] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  useEffect(() => {
    const resetAudioState = () => {
      if (audioRef.current) {
        audioRef.current.pause();

        audioRef.current.currentTime = 0;
        setCurrentTime(0);
        setDuration(0);

        audioRef.current.src = currentTrack?.src || '';

        audioRef.current.load();

        audioRef.current.addEventListener(
          'loadeddata',
          () => {
            if (isPlaying) {
              const playPromise = audioRef.current?.play();
              if (playPromise) {
                playPromise.catch((error) => {
                  console.error('Erreur lors de la lecture :', error);
                  setIsPlaying(false);
                });
              }
            }
          },
          { once: true },
        );
      }
    };

    resetAudioState();

    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('loadeddata', () => {});
      }
    };
  }, [currentTrack?.src]);

  useEffect(() => {
    if (audioRef.current && currentTrack?.src === audioRef.current.src) {
      if (isPlaying && audioRef.current.paused) {
        const playPromise = audioRef.current.play();
        if (playPromise) {
          playPromise.catch((error) => {
            console.error('Erreur lors de la lecture :', error);
            setIsPlaying(false);
          });
        }
      } else if (!isPlaying && !audioRef.current.paused) {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack?.src]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error('Erreur lors de la lecture :', error);
            setIsPlaying(false);
          });
        }
        setIsPlaying(true);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (!isMuted) {
        setPreviousVolume(volume);
        audioRef.current.volume = 0;
        setVolume(0);
      } else {
        audioRef.current.volume = previousVolume;
        setVolume(previousVolume);
      }
      setIsMuted(!isMuted);
    }
  };

  const handleTrackEnd = () => {
    if (isRepeat) {
      // Rejouer la piste actuelle
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      return;
    }

    if (queue.length > 0) {
      if (isShuffle) {
        // Sélectionner une piste aléatoire de la file d'attente
        const randomIndex = Math.floor(Math.random() * queue.length);
        const nextTrack = queue[randomIndex];
        setCurrentTrack(nextTrack);
        removeFromQueue(nextTrack.id);
      } else {
        // Lecture normale : prendre la première piste de la file
        const nextTrack = queue[0];
        setCurrentTrack(nextTrack);
        removeFromQueue(nextTrack.id);
      }
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    if (queue.length > 0) {
      if (isShuffle) {
        const randomIndex = Math.floor(Math.random() * queue.length);
        const nextTrack = queue[randomIndex];
        setCurrentTrack(nextTrack);
        removeFromQueue(nextTrack.id);
      } else {
        const nextTrack = queue[0];
        setCurrentTrack(nextTrack);
        removeFromQueue(nextTrack.id);
      }
      setIsPlaying(true);
    }
  };

  const handlePrevious = () => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      // Si on est à plus de 3 secondes dans la piste, on revient au début
      audioRef.current.currentTime = 0;
    } else if (currentTrack) {
      // Sinon, on remet la piste actuelle dans la file d'attente en première position
      const updatedQueue = [currentTrack, ...queue];
      if (queue.length > 0) {
        const previousTrack = updatedQueue[updatedQueue.length - 1];
        setCurrentTrack(previousTrack);
        const newQueue = updatedQueue.slice(0, -1);
        // Mettre à jour la file d'attente dans le contexte
        newQueue.forEach((track) => removeFromQueue(track.id));
      }
    }
  };

  /**
   * Handles click on the progress bar
   * @param e - Mouse event
   * @param barRef - Reference to the progress bar element
   * @param maxValue - Maximum value (duration for progress, 1 for volume)
   * @param callback - Callback function to update the value
   */
  const handleBarClick = useCallback(
    (
      e: React.MouseEvent<HTMLDivElement>,
      barRef: React.MutableRefObject<HTMLDivElement | null>,
      maxValue: number,
      callback: (value: number) => void,
    ) => {
      if (barRef.current) {
        const rect = barRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        const value = Math.max(0, Math.min(maxValue, percentage * maxValue));
        callback(value);
      }
    },
    [],
  );

  /**
   * Handles mouse down event on bars (progress or volume)
   * @param e - Mouse event
   * @param barRef - Reference to the bar element
   * @param maxValue - Maximum value (duration for progress, 1 for volume)
   * @param callback - Callback function to update the value
   * @param isProgress - Whether this is the progress bar or not
   */
  const handleBarMouseDown = useCallback(
    (
      e: React.MouseEvent<HTMLDivElement>,
      barRef: React.MutableRefObject<HTMLDivElement | null>,
      maxValue: number,
      callback: (value: number) => void,
      isProgress = false,
    ) => {
      const handleMouseMove = (e: MouseEvent) => {
        if (barRef.current) {
          const rect = barRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const percentage = x / rect.width;
          const value = Math.max(0, Math.min(maxValue, percentage * maxValue));

          if (isProgress) {
            setTempProgress(value);
          } else {
            callback(value);
          }
        }
      };

      const handleMouseUp = () => {
        if (isProgress && tempProgress !== null) {
          callback(tempProgress);
          setTempProgress(null);
        }
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [tempProgress],
  );

  const toggleFullscreen = () => {
    setIsTransitioning(true);
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

  useEffect(() => {
    if (!isTransitioning && audioRef.current && isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise) {
        playPromise.catch((error) => {
          console.error('Erreur lors de la reprise de la lecture :', error);
          setIsPlaying(false);
        });
      }
    }
  }, [isTransitioning]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = isRepeat;
    }
  }, [isRepeat]);

  // Add effect to sync playback state with jam session
  useEffect(() => {
    if (jamSessionService.isInSession()) {
      jamSessionService.updatePlaybackState(isPlaying);
    }
  }, [isPlaying]);

  // Add effect to sync track changes with jam session
  useEffect(() => {
    if (jamSessionService.isInSession() && currentTrack) {
      jamSessionService.updateTrack(currentTrack);
    }
  }, [currentTrack]);

  // Add effect to sync progress with jam session
  useEffect(() => {
    if (jamSessionService.isInSession()) {
      jamSessionService.updateProgress(currentTime);
    }
  }, [currentTime]);

  const handleCreateSession = async () => {
    try {
      setIsCreatingSession(true);
      const roomId = await jamSessionService.createSession(
        'New Jam Session',
        "Let's jam together!",
        10,
      );
      if (roomId) {
        router.push(`/jam/${roomId}`);
      }
    } catch (error) {
      toast.error(t('jam.errors.createFailed'));
    } finally {
      setIsCreatingSession(false);
    }
  };

  if (!currentTrack) return null;

  return (
    <>
      <div
        onClick={() =>
          window.innerWidth < 768 &&
          !isQueueOpen &&
          !isJamSessionOpen &&
          setIsFullscreen(!isFullscreen)
        }
        className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 ${
          isFullscreen ? 'h-screen' : 'h-auto md:h-24'
        }`}
      >
        <div
          className={`max-w-7xl mx-auto ${
            isFullscreen
              ? 'h-full flex flex-col justify-center items-center'
              : 'flex flex-row items-center justify-between'
          } md:space-y-0`}
        >
          {/* Cover and infos */}
          <div
            className={`flex ${
              isFullscreen
                ? 'flex-col items-center mb-8'
                : 'items-center space-x-4'
            } w-full md:w-auto ${!isFullscreen && 'flex-1 md:flex-initial'}`}
          >
            <Image
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className={`rounded-lg object-cover ${
                isFullscreen ? 'w-64 h-64 mb-4' : 'w-12 h-12 md:w-16 md:h-16'
              }`}
              width={isFullscreen ? 256 : 64}
              height={isFullscreen ? 256 : 64}
              placeholder="blur"
              blurDataURL={currentTrack.coverUrl}
            />
            <div
              className={`min-w-0 flex-1 md:flex-initial ${isFullscreen ? 'text-center' : ''}`}
            >
              <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm md:text-base">
                {currentTrack.title}
              </h3>
              <p
                className={`text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate`}
              >
                {currentTrack.artist}
              </p>
            </div>
          </div>

          {isFullscreen ? (
            <div className="w-full max-w-xl space-y-6">
              {/* Button to reduce the player */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFullscreen(false);
                }}
                className="absolute top-4 right-4 p-2 text-white hover:text-purple-600"
              >
                <ArrowsPointingOutIcon className="w-6 h-6 rotate-180" />
              </button>

              {/* Progress bar in fullscreen mode */}
              <div className="flex items-center space-x-2 w-full">
                <span className="text-xs text-white">
                  {formatTime(currentTime)}
                </span>
                <div
                  ref={progressBarRef}
                  onClick={(e) =>
                    handleBarClick(e, progressBarRef, duration, (value) => {
                      if (audioRef.current) {
                        audioRef.current.currentTime = value;
                        setCurrentTime(value);
                      }
                    })
                  }
                  onMouseDown={(e) =>
                    handleBarMouseDown(
                      e,
                      progressBarRef,
                      duration,
                      (value) => {
                        if (audioRef.current) {
                          audioRef.current.currentTime = value;
                          setCurrentTime(value);
                        }
                      },
                      true,
                    )
                  }
                  className="relative h-1 flex-grow bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer group"
                >
                  <div
                    className="absolute h-full bg-purple-600 rounded-full"
                    style={{
                      width: `${((tempProgress ?? currentTime) / duration) * 100}%`,
                    }}
                  />
                  <div
                    className="absolute h-3 w-3 bg-white rounded-full -top-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      left: `${((tempProgress ?? currentTime) / duration) * 100}%`,
                      transform: 'translateX(-50%)',
                    }}
                  />
                </div>
                <span className="text-xs text-white">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Controls in fullscreen mode */}
              <div className="flex justify-center items-center space-x-8">
                <button
                  onClick={() => setIsShuffle(!isShuffle)}
                  className={`p-2 rounded-full ${
                    isShuffle ? 'text-purple-500' : 'text-white'
                  } hover:text-purple-500`}
                >
                  <ArrowsRightLeftIcon className="w-6 h-6" />
                </button>

                <button
                  onClick={handlePrevious}
                  className="p-2 text-white hover:text-purple-500"
                >
                  <BackwardIcon className="w-6 h-6" />
                </button>

                <button
                  onClick={togglePlay}
                  className="p-4 bg-purple-600 rounded-full text-white hover:bg-purple-700"
                >
                  {isPlaying ? (
                    <PauseIcon className="w-8 h-8" />
                  ) : (
                    <PlayIcon className="w-8 h-8" />
                  )}
                </button>

                <button
                  onClick={handleNext}
                  className="p-2 text-white hover:text-purple-500"
                >
                  <ForwardIcon className="w-6 h-6" />
                </button>

                <button
                  onClick={() => setIsRepeat(!isRepeat)}
                  className={`p-2 rounded-full ${
                    isRepeat ? 'text-purple-500' : 'text-white'
                  } hover:text-purple-500`}
                >
                  <ArrowPathRoundedSquareIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Volume in fullscreen mode */}
              <div className="flex justify-center items-center space-x-4">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-purple-500"
                >
                  {isMuted ? (
                    <SpeakerXMarkIcon className="w-6 h-6" />
                  ) : (
                    <SpeakerWaveIcon className="w-6 h-6" />
                  )}
                </button>
                <div
                  ref={volumeBarRef}
                  onClick={(e) =>
                    handleBarClick(e, volumeBarRef, 1, (value) => {
                      setVolume(value);
                      if (audioRef.current) {
                        audioRef.current.volume = value;
                      }
                    })
                  }
                  onMouseDown={(e) =>
                    handleBarMouseDown(e, volumeBarRef, 1, (value) => {
                      setVolume(value);
                      if (audioRef.current) {
                        audioRef.current.volume = value;
                      }
                    })
                  }
                  className="relative w-24 h-1 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer group"
                >
                  <div
                    className="absolute h-full bg-purple-600 rounded-full"
                    style={{ width: `${volume * 100}%` }}
                  />
                  <div
                    className="absolute h-3 w-3 bg-white rounded-full -top-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      left: `${volume * 100}%`,
                      transform: 'translateX(-50%)',
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Mobile and normal desktop version */}
              <div className="flex md:hidden items-center space-x-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevious();
                  }}
                  className="hidden md:block p-2 text-gray-600 dark:text-gray-400"
                >
                  <BackwardIcon className="w-5 h-5" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  className="p-3 text-gray-900 dark:text-white rounded-full md:bg-purple-600 md:text-white md:hover:bg-purple-700"
                >
                  {isPlaying ? (
                    <PauseIcon className="w-6 h-6" />
                  ) : (
                    <PlayIcon className="w-6 h-6" />
                  )}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="p-2 text-gray-600 dark:text-gray-400"
                >
                  <ForwardIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="hidden md:flex flex-col items-center space-y-2 w-full md:w-auto">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setIsShuffle(!isShuffle)}
                    className={`p-2 rounded-full ${isShuffle ? 'text-purple-600' : 'text-gray-600 dark:text-gray-400'}`}
                  >
                    <ArrowsRightLeftIcon className="w-5 h-5" />
                  </button>

                  <button
                    onClick={handlePrevious}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600"
                  >
                    <BackwardIcon className="w-5 h-5" />
                  </button>

                  <button
                    onClick={togglePlay}
                    className="p-3 bg-purple-600 rounded-full text-white hover:bg-purple-700"
                  >
                    {isPlaying ? (
                      <PauseIcon className="w-6 h-6" />
                    ) : (
                      <PlayIcon className="w-6 h-6" />
                    )}
                  </button>

                  <button
                    onClick={handleNext}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600"
                  >
                    <ForwardIcon className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => setIsRepeat(!isRepeat)}
                    className={`p-2 rounded-full ${isRepeat ? 'text-purple-600' : 'text-gray-600 dark:text-gray-400'}`}
                  >
                    <ArrowPathRoundedSquareIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Progress bar - desktop only */}
                <div className="flex items-center space-x-2 w-full">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {formatTime(currentTime)}
                  </span>
                  <div
                    ref={progressBarRef}
                    onClick={(e) =>
                      handleBarClick(e, progressBarRef, duration, (value) => {
                        if (audioRef.current) {
                          audioRef.current.currentTime = value;
                          setCurrentTime(value);
                        }
                      })
                    }
                    onMouseDown={(e) =>
                      handleBarMouseDown(
                        e,
                        progressBarRef,
                        duration,
                        (value) => {
                          if (audioRef.current) {
                            audioRef.current.currentTime = value;
                            setCurrentTime(value);
                          }
                        },
                        true,
                      )
                    }
                    className="relative h-1 flex-grow bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer group"
                  >
                    <div
                      className="absolute h-full bg-purple-600 rounded-full"
                      style={{
                        width: `${((tempProgress ?? currentTime) / duration) * 100}%`,
                      }}
                    />
                    <div
                      className="absolute h-3 w-3 bg-white rounded-full -top-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{
                        left: `${((tempProgress ?? currentTime) / duration) * 100}%`,
                        transform: 'translateX(-50%)',
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>

              {/* Secondary controls - desktop only */}
              <div className="hidden md:flex items-center space-x-2">
                <button onClick={toggleMute}>
                  {isMuted ? (
                    <SpeakerXMarkIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <SpeakerWaveIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  )}
                </button>
                <div
                  ref={volumeBarRef}
                  onClick={(e) =>
                    handleBarClick(e, volumeBarRef, 1, (value) => {
                      setVolume(value);
                      if (audioRef.current) {
                        audioRef.current.volume = value;
                      }
                    })
                  }
                  onMouseDown={(e) =>
                    handleBarMouseDown(e, volumeBarRef, 1, (value) => {
                      setVolume(value);
                      if (audioRef.current) {
                        audioRef.current.volume = value;
                      }
                    })
                  }
                  className="relative w-24 h-1 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer group"
                >
                  <div
                    className="absolute h-full bg-purple-600 rounded-full"
                    style={{ width: `${volume * 100}%` }}
                  />
                  <div
                    className="absolute h-3 w-3 bg-white rounded-full -top-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      left: `${volume * 100}%`,
                      transform: 'translateX(-50%)',
                    }}
                  />
                </div>
                <button
                  onClick={() => setIsQueueOpen(!isQueueOpen)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                >
                  <QueueListIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 text-gray-600 dark:text-gray-400"
                >
                  <ArrowsPointingOutIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsJamSessionOpen(!isJamSessionOpen)}
                  className={`p-2 ${
                    jamSessionService.isInSession()
                      ? 'text-purple-600 dark:text-purple-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400'
                  }`}
                  title={t('jam.title')}
                >
                  <UsersIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile controls */}
              <div className="flex md:hidden items-center space-x-2">
                <button
                  onClick={() => setIsQueueOpen(!isQueueOpen)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                >
                  <QueueListIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 text-gray-600 dark:text-gray-400"
                >
                  <ArrowsPointingOutIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsJamSessionOpen(!isJamSessionOpen)}
                  className={`p-2 ${
                    jamSessionService.isInSession()
                      ? 'text-purple-600 dark:text-purple-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400'
                  }`}
                >
                  <UsersIcon className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </div>

        <audio
          ref={audioRef}
          src={currentTrack.src}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleTrackEnd}
          loop={isRepeat}
        />

        <AudioVisualizer
          coverUrl={currentTrack.coverUrl}
          audioRef={audioRef}
          isFullscreen={isFullscreen}
        />
      </div>

      <QueuePanel
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
        className={`fixed right-0 transform transition-transform duration-300 ease-in-out ${
          isQueueOpen ? 'translate-x-0' : 'translate-x-full'
        } ${
          isFullscreen
            ? 'top-0 h-screen w-full md:w-80 z-[60]'
            : 'top-0 md:top-auto md:bottom-24 h-[calc(100vh-4rem)] md:h-[calc(100vh-6rem)] w-full md:w-80'
        } bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-lg z-50`}
      />

      {/* Add jam session panel */}
      {isJamSessionOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsJamSessionOpen(false)}
          />
          <div className="relative z-10">
            {jamSessionService.getCurrentRoomId() ? (
              <JamSession
                roomId={jamSessionService.getCurrentRoomId() || ''}
                onClose={() => setIsJamSessionOpen(false)}
              />
            ) : (
              <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
                  <h2 className="text-2xl font-bold mb-6 text-black">
                    {t('jam.title')}
                  </h2>
                  <div className="space-y-4">
                    <button
                      onClick={handleCreateSession}
                      disabled={isCreatingSession}
                      className="w-full p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                      {isCreatingSession ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                          {t('jam.creating')}
                        </div>
                      ) : (
                        t('jam.createNew')
                      )}
                    </button>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">
                          {t('jam.or')}
                        </span>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">
                        {t('jam.haveInvite')}
                      </p>
                      <button
                        onClick={() => {
                          setIsJamSessionOpen(false);
                          router.push('/jam');
                        }}
                        className="text-purple-600 hover:text-purple-700 font-medium"
                      >
                        {t('jam.joinExisting')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
