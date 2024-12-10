import { createContext, useContext, useState, ReactNode } from 'react';

// Définition du morceau par défaut
const defaultTrack = {
  src: '/the_line_top.m4a',
  title: 'The Line',
  artist: 'Twenty One Pilots',
  coverUrl: '/fromzero.jpeg',
};

interface AudioContextType {
  currentTrack: {
    src: string;
    title: string;
    artist: string;
    coverUrl: string;
  };
  isPlaying: boolean;
  setCurrentTrack: (track: AudioContextType['currentTrack']) => void;
  setIsPlaying: (isPlaying: boolean) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState(defaultTrack);
  const [isPlaying, setIsPlaying] = useState(false);

  const value = {
    currentTrack,
    isPlaying,
    setCurrentTrack,
    setIsPlaying,
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
