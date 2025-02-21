import { useEffect } from 'react';
import { useAudio } from '@/contexts/AudioContext';
import { useSocket } from '@/contexts/SocketContext';
import { Track } from '@/types/audio';

interface MusicPlayerProps {
  roomId: string;
  isHost: boolean;
}

export default function MusicPlayer({ roomId, isHost }: MusicPlayerProps) {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    setCurrentTrack,
    setIsPlaying,
    setCurrentTime,
    playTrack,
  } = useAudio();
  const { emitEvent } = useSocket();

  useEffect(() => {
    if (!isHost) return;

    // Envoyer les mises à jour de l'état de lecture
    emitEvent('playback:control', {
      roomId,
      action: isPlaying ? 'play' : 'pause',
      time: currentTime,
      trackId: currentTrack?.id,
    });
  }, [isPlaying, currentTime, currentTrack, isHost, roomId]);

  const handlePlayPause = () => {
    if (isHost) {
      setIsPlaying(!isPlaying);
      emitEvent('playback:control', {
        roomId,
        action: !isPlaying ? 'play' : 'pause',
      });
    }
  };

  const handleTrackChange = (track: Track) => {
    if (isHost) {
      setCurrentTrack(track);
      playTrack(track);
      emitEvent('playback:control', {
        roomId,
        action: 'track',
        trackId: track.id,
      });
    }
  };

  const handleSeek = (time: number) => {
    if (isHost) {
      setCurrentTime(time);
      emitEvent('playback:control', {
        roomId,
        action: 'seek',
        time,
      });
    }
  };

  if (!currentTrack) {
    return (
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Aucune piste en cours de lecture</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-black">
            {currentTrack.title}
          </h3>
          <p className="text-sm text-gray-500">{currentTrack.artist}</p>
        </div>
        <button
          onClick={handlePlayPause}
          className="p-2 rounded-full bg-purple-600 text-white hover:bg-purple-700"
          disabled={!isHost}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-2 bg-gray-200 rounded-full">
        <div
          className="absolute h-full bg-purple-600 rounded-full"
          style={{
            width: `${(currentTime / (currentTrack.duration || 1)) * 100}%`,
          }}
        />
        <input
          type="range"
          min="0"
          max={currentTrack.duration || 100}
          value={currentTime}
          onChange={(e) => handleSeek(Number(e.target.value))}
          className="absolute w-full h-full opacity-0 cursor-pointer"
          disabled={!isHost}
        />
      </div>

      {/* Time Display */}
      <div className="flex justify-between mt-2 text-sm text-gray-500">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(currentTrack.duration || 0)}</span>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
