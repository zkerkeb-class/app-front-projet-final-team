import { createContext, useContext, useState, ReactNode } from 'react';
import RecentlyPlayedService from '@/services/localStorage/recentlyPlayed.service';
import TrackService from '@/services/api/track.service';

// Default track definition
const defaultTrack = {
  id: '0',
  src: '/the_line_top.m4a',
  title: 'The Line',
  artist: 'Twenty One Pilots',
  coverUrl: '/fromzero.jpeg',
  albumId: '0',
};

type FormattedTrack = typeof defaultTrack;

interface AudioContextType {
  currentTrack: FormattedTrack;
  isPlaying: boolean;
  isTrackChanging: boolean;
  setCurrentTrack: (track: FormattedTrack) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setIsTrackChanging: (isChanging: boolean) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] =
    useState<FormattedTrack>(defaultTrack);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTrackChanging, setIsTrackChanging] = useState(false);

  const handleTrackChange = async (track: FormattedTrack) => {
    try {
      setCurrentTrack(track);
      if (track.id !== '0') {
        const trackData = await TrackService.getTrack(Number(track.id));
        if (trackData) {
          RecentlyPlayedService.addTrack(trackData);
        }
      }
    } catch (error) {
      console.error('Erreur lors du changement de piste:', error);
    }
  };

  const value: AudioContextType = {
    currentTrack,
    isPlaying,
    isTrackChanging,
    setCurrentTrack: handleTrackChange,
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
