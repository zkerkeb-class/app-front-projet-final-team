export interface Track {
  id: number;
  title: string;
  artist: string;
  coverUrl: string;
  src: string;
  albumId?: number;
  duration: number;
}

export interface AudioContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  isTrackChanging: boolean;
  queue: Track[];
  setCurrentTrack: (track: Track) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setIsTrackChanging: (isChanging: boolean) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: number) => void;
  clearQueue: () => void;
}
