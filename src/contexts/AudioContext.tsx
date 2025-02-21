import React, { createContext, useContext, useState, useCallback } from 'react';
import { Track } from '@/types/audio';

interface AudioContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  queue: Track[];
  setQueue: (tracks: Track[]) => void;
  setCurrentTrack: (track: Track | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  playTrack: (track: Track) => void;
  togglePlayPause: () => void;
  setIsTrackChanging: (isChanging: boolean) => void;
  removeFromQueue: (trackId: number) => void;
  clearQueue: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isTrackChanging, setIsTrackChanging] = useState(false);
  const [queue, setQueue] = useState<Track[]>([]);

  const playTrack = useCallback((track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setCurrentTime(0);
  }, []);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const removeFromQueue = (trackId: number) => {
    setQueue(queue.filter((track) => track.id !== trackId));
  };

  const clearQueue = () => {
    setQueue([]);
  };

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        queue,
        setQueue,
        setCurrentTrack,
        setIsPlaying,
        setCurrentTime,
        playTrack,
        togglePlayPause,
        setIsTrackChanging,
        clearQueue,
        removeFromQueue,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
