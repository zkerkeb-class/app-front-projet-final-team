import { createContext, useContext, useState, ReactNode } from 'react';
import { Track } from '@/types/track';

interface AudioContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  setQueue: (tracks: Track[]) => void;
  playTrack: (track: Track) => void;
  togglePlayPause: () => void;
  setCurrentTrack: (track: Track | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setIsTrackChanging: (isChanging: boolean) => void;
  removeFromQueue: (trackId: number) => void;
  clearQueue: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTrackChanging, setIsTrackChanging] = useState(false);
  const [queue, setQueue] = useState<Track[]>([]);

  const playTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

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
        queue,
        setQueue,
        playTrack,
        togglePlayPause,
        setCurrentTrack,
        setIsPlaying,
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
