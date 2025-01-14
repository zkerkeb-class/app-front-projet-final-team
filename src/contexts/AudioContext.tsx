import { createContext, useContext, useState, ReactNode } from 'react';

// Default track definition
const defaultTrack = {
  id: '0',
  src: '/the_line_top.m4a',
  title: 'The Line',
  artist: 'Twenty One Pilots',
  coverUrl: '/fromzero.jpeg',
  albumId: '0',
};

interface AudioContextType {
  currentTrack: {
    id: string;
    src: string;
    title: string;
    artist: string;
    coverUrl: string;
    albumId: string;
  };
  isPlaying: boolean;
  isTrackChanging: boolean;
  setCurrentTrack: (track: AudioContextType['currentTrack']) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setIsTrackChanging: (isChanging: boolean) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] =
    useState<AudioContextType['currentTrack']>(defaultTrack);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTrackChanging, setIsTrackChanging] = useState(false);

  const value = {
    currentTrack,
    isPlaying,
    isTrackChanging,
    setCurrentTrack,
    setIsPlaying,
    setIsTrackChanging,
  };

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error(
      "useAudio doit être utilisé à l'intérieur d'un AudioProvider",
    );
  }
  return context;
}
