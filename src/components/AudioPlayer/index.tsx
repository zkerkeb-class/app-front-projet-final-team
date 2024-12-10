import { useState, useRef } from 'react';
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
} from '@heroicons/react/24/solid';
import Image from 'next/image';

interface AudioPlayerProps {
  src?: string;
  title?: string;
  artist?: string;
  coverUrl?: string;
}

export default function AudioPlayer({
  src = '',
  title = 'Aucun titre',
  artist = 'Aucun artiste',
  coverUrl = '/default-cover.jpg',
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [previousVolume, setPreviousVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
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

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
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

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleNext = () => {
    console.log('Next track');
  };

  const handlePrevious = () => {
    console.log('Previous track');
  };

  return (
    <div
      onClick={() => window.innerWidth < 768 && setIsFullscreen(!isFullscreen)}
      className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 ${isFullscreen ? 'h-screen' : 'h-auto md:h-24'}`}
    >
      <div className="max-w-7xl mx-auto flex flex-row items-center justify-between md:space-y-0">
        {/* Cover et infos */}
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <Image
            src={coverUrl}
            alt={title}
            className="rounded-lg object-cover w-16 h-16"
            width={64}
            height={64}
          />
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate hidden md:block">
              {artist}
            </p>
          </div>
        </div>

        {/* Primary controls - mobile version */}
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

        {/* Desktop version controls - hidden on mobile */}
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
          <div className="flex items-center space-x-2 w-full max-w-[24rem]">
            <span className="text-xs text-gray-600 dark:text-gray-400 min-w-[40px]">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration}
              value={currentTime}
              onChange={(e) => {
                if (audioRef.current) {
                  audioRef.current.currentTime = Number(e.target.value);
                }
              }}
              className="w-full"
            />
            <span className="text-xs text-gray-600 dark:text-gray-400 min-w-[40px]">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Secondary controls - desktop only */}
        <div className="hidden md:flex items-center space-x-4 w-full md:w-auto justify-end">
          <button onClick={toggleMute}>
            {isMuted ? (
              <SpeakerXMarkIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            ) : (
              <SpeakerWaveIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={volume}
            onChange={handleVolumeChange}
            className="w-24"
          />
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-gray-600 dark:text-gray-400"
          >
            <ArrowsPointingOutIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
}
