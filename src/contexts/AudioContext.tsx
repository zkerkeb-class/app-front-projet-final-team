import { createContext, useContext, useState, ReactNode } from 'react';
import { Track } from '@/types/track';

export interface AudioContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  setCurrentTrack: (track: Track | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  playTrack: (track: Track) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: number) => void;
  clearQueue: () => void;
  currentTime: number;
  setCurrentTime: (time: number) => void;
  isTrackChanging: boolean;
  setIsTrackChanging: (isChanging: boolean) => void;
  setQueue: (tracks: Track[]) => void;
  togglePlayPause: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isTrackChanging, setIsTrackChanging] = useState(false);

  const playTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const addToQueue = (track: Track) => {
    setQueue((prevQueue) => [...prevQueue, track]);
  };

  const removeFromQueue = (trackId: number) => {
    setQueue((prevQueue) => prevQueue.filter((track) => track.id !== trackId));
  };

  const clearQueue = () => {
    setQueue([]);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const value = {
    currentTrack,
    isPlaying,
    queue,
    setCurrentTrack,
    setIsPlaying,
    playTrack,
    addToQueue,
    removeFromQueue,
    clearQueue,
    currentTime,
    setCurrentTime,
    isTrackChanging,
    setIsTrackChanging,
    setQueue,
    togglePlayPause,
  };

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
};

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
