'use client';

import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import toast from 'react-hot-toast';

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  albumCover?: string;
}

interface MusicPlayerProps {
  roomId: string;
  isHost: boolean;
  tracks: Track[];
}

export default function MusicPlayer({
  roomId,
  isHost,
  tracks,
}: MusicPlayerProps) {
  const { emitEvent, socket } = useSocket();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    if (!socket) return;

    const handlePlaybackControl = (data: {
      action: string;
      time?: number;
      trackId?: string;
    }) => {
      if (!audioRef.current) return;

      switch (data.action) {
        case 'play':
          audioRef.current.currentTime = data.time || 0;
          audioRef.current.play();
          setIsPlaying(true);
          break;
        case 'pause':
          audioRef.current.pause();
          setIsPlaying(false);
          break;
        case 'seek':
          if (data.time !== undefined) {
            audioRef.current.currentTime = data.time;
          }
          break;
        case 'track-change':
          if (data.trackId) {
            const newTrack = tracks.find((t) => t.id === data.trackId);
            if (newTrack) {
              setCurrentTrack(newTrack);
              setIsPlaying(false);
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
                setCurrentTime(0);
              }
            }
          }
          break;
      }
    };

    socket.on('playback:control', handlePlaybackControl);

    return () => {
      socket.off('playback:control', handlePlaybackControl);
    };
  }, [socket, tracks]);

  const handlePlay = () => {
    if (!audioRef.current || !currentTrack) return;

    if (isHost) {
      emitEvent('playback:control', {
        action: 'play',
        time: audioRef.current.currentTime,
        trackId: currentTrack.id,
      });
    } else {
      toast.error('Only the host can control playback');
    }
  };

  const handlePause = () => {
    if (!audioRef.current || !currentTrack) return;

    if (isHost) {
      emitEvent('playback:control', {
        action: 'pause',
        trackId: currentTrack.id,
      });
    } else {
      toast.error('Only the host can control playback');
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current || !isHost) return;

    const time = parseFloat(e.target.value);
    emitEvent('playback:control', {
      action: 'seek',
      time,
      trackId: currentTrack?.id,
    });
  };

  const handleTrackChange = (track: Track) => {
    if (!isHost) {
      toast.error('Only the host can change tracks');
      return;
    }

    setCurrentTrack(track);
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }

    emitEvent('playback:control', {
      action: 'track-change',
      trackId: track.id,
    });
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <audio
        ref={audioRef}
        src={currentTrack?.url}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => {
          setDuration(audioRef.current?.duration || 0);
        }}
        onError={(e) => console.error('Audio error:', e)}
      />

      {/* Track Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
          Available Tracks
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {tracks.map((track) => (
            <button
              key={track.id}
              onClick={() => handleTrackChange(track)}
              className={`flex items-center p-3 rounded-lg transition-all ${
                currentTrack?.id === track.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              disabled={!isHost}
            >
              {track.albumCover && (
                <img
                  src={track.albumCover}
                  alt={`${track.title} cover`}
                  className="w-12 h-12 rounded mr-3"
                />
              )}
              <div className="flex-1 text-left">
                <div className="font-medium">{track.title}</div>
                <div className="text-sm opacity-75">{track.artist}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Now Playing */}
      {currentTrack && (
        <div className="space-y-4">
          <div className="text-center">
            {currentTrack.albumCover && (
              <img
                src={currentTrack.albumCover}
                alt={`${currentTrack.title} cover`}
                className="w-32 h-32 mx-auto rounded-lg shadow-lg mb-4"
              />
            )}
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
              {currentTrack.title}
            </h4>
            <p className="text-gray-500 dark:text-gray-400">
              {currentTrack.artist}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500 dark:text-gray-400 w-12">
              {Math.floor(currentTime / 60)}:
              {Math.floor(currentTime % 60)
                .toString()
                .padStart(2, '0')}
            </span>
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              disabled={!isHost}
            />
            <span className="text-sm text-gray-500 dark:text-gray-400 w-12">
              {Math.floor(duration / 60)}:
              {Math.floor(duration % 60)
                .toString()
                .padStart(2, '0')}
            </span>
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => (isPlaying ? handlePause() : handlePlay())}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                isHost
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
              }`}
              disabled={!isHost}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Volume
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>
        </div>
      )}
    </div>
  );
}
