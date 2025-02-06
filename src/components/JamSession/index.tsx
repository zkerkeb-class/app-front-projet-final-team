import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { UsersIcon, ShareIcon } from '@heroicons/react/24/outline';
import { useAudio } from '@/contexts/AudioContext';
import jamSessionService from '@/services/socket/jamSession.service';
import { Track } from '@/types/audio';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Participant {
  id: string;
  username: string;
  avatar?: string;
}

interface JamSessionProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function JamSession({ isOpen, onClose }: JamSessionProps) {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const {
    currentTrack,
    isPlaying,
    setIsPlaying,
    setCurrentTrack,
    // setCurrentTime,
  } = useAudio();

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isOpen && !jamSessionService.isInSession()) {
      handleCreateSession();
    }
    return () => {
      if (jamSessionService.isInSession()) {
        jamSessionService.leaveSession();
      }
    };
  }, [isOpen]);

  const handleCreateSession = async () => {
    try {
      const newRoomId = await jamSessionService.createSession();
      setRoomId(newRoomId);

      jamSessionService.joinSession(newRoomId, {
        onParticipantJoined: handleParticipantJoined,
        onParticipantLeft: handleParticipantLeft,
        onPlaybackStateChanged: handlePlaybackStateChanged,
        onTrackChanged: handleTrackChanged,
        onProgressChanged: handleProgressChanged,
        onError: handleError,
      });
    } catch (error) {
      console.error('Failed to create jam session:', error);
      toast.error(t('jam.errors.createFailed'));
    }
  };

  const handleParticipantJoined = (participant: Participant) => {
    setParticipants((prev) => [...prev, participant]);
    toast.success(
      t('jam.participantJoined', { username: participant.username }),
    );
  };

  const handleParticipantLeft = (participantId: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== participantId));
  };

  const handlePlaybackStateChanged = (newIsPlaying: boolean) => {
    setIsPlaying(newIsPlaying);
  };

  const handleTrackChanged = (track: Track) => {
    setCurrentTrack(track);
  };

  const handleProgressChanged = (progress: number) => {
    // setCurrentTime(progress);
  };

  const handleError = (error: string) => {
    toast.error(error);
  };

  const copyInviteLink = async () => {
    if (!roomId) return;

    const inviteLink = `${window.location.origin}/jam/${roomId}`;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setIsCopied(true);
      toast.success(t('jam.linkCopied'));
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy invite link:', error);
      toast.error(t('jam.errors.copyFailed'));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-gray-800 shadow-lg border-l border-gray-200 dark:border-gray-700 z-50">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('jam.title')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            {t('actions.close')}
          </button>
        </div>

        {roomId && (
          <button
            onClick={copyInviteLink}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            <ShareIcon className="w-5 h-5" />
            <span>
              {isCopied ? t('jam.linkCopied') : t('jam.copyInviteLink')}
            </span>
          </button>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <UsersIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            {t('jam.participants')} ({participants.length + 1})
          </h3>
        </div>

        <div className="space-y-3">
          {/* Host (current user) */}
          <div className="flex items-center space-x-3">
            {/* {user?.avatar && (
              <img
                src={user.avatar}
                alt={user.username}
                className="w-8 h-8 rounded-full"
              />
            )} */}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.username || t('jam.anonymous')}
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400">
                {t('jam.host')}
              </p>
            </div>
          </div>

          {/* Other participants */}
          {participants.map((participant) => (
            <div key={participant.id} className="flex items-center space-x-3">
              {participant.avatar ? (
                <img
                  src={participant.avatar}
                  alt={participant.username}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {participant.username[0]}
                  </span>
                </div>
              )}
              <p className="text-sm text-gray-900 dark:text-white">
                {participant.username}
              </p>
            </div>
          ))}
        </div>
      </div>

      {currentTrack && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              {t('jam.nowPlaying')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {currentTrack.title} - {currentTrack.artist}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
