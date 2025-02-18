import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import {
  UsersIcon,
  ShareIcon,
  XMarkIcon,
  MusicalNoteIcon,
} from '@heroicons/react/24/outline';
import { useAudio } from '@/contexts/AudioContext';
import jamSessionService from '@/services/socket/jamSession.service';
import { Track } from '@/types/audio';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Participant {
  id: string;
  username: string;
  avatar?: string;
  instrument?: string;
  role: 'host' | 'participant';
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
    currentTime,
    setCurrentTime,
    playTrack,
  } = useAudio();

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [instrument, setInstrument] = useState('');
  const [showInstrumentModal, setShowInstrumentModal] = useState(false);
  const [isGuest, setIsGuest] = useState(!user);

  useEffect(() => {
    if (isOpen) {
      const urlParams = new URLSearchParams(window.location.search);
      const inviteRoomId = urlParams.get('roomId');

      if (inviteRoomId) {
        joinExistingSession(inviteRoomId);
      } else if (!jamSessionService.isInSession()) {
        setShowCreateModal(true);
      }
    }
    return () => {
      if (jamSessionService.isInSession()) {
        jamSessionService.leaveSession();
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (roomId) {
      checkHostStatus();
    }
  }, [roomId]);

  const checkHostStatus = async () => {
    try {
      const hostStatus = await jamSessionService.isSessionHost();
      setIsHost(hostStatus);
    } catch (error) {
      console.error('Failed to check host status:', error);
    }
  };

  const handleRoomState = (state: any) => {
    console.log('handleRoomState', state);

    setParticipants(state.participants || []);
    if (state.currentTrack) {
      setCurrentTrack(state.currentTrack);
    }
    setIsPlaying(state.isPlaying);
    setCurrentTime(state.progress);
  };

  const handleCreateSession = async () => {
    setIsLoading(true);
    try {
      const newRoomId = await jamSessionService.createSession(
        sessionName,
        sessionDescription,
        maxParticipants,
      );
      setRoomId(newRoomId);
      setIsHost(true);
      setShowCreateModal(false);

      await jamSessionService.joinSession(
        newRoomId,
        {
          onParticipantJoined: handleParticipantJoined,
          onParticipantLeft: handleParticipantLeft,
          onPlaybackStateChanged: handlePlaybackStateChanged,
          onTrackChanged: handleTrackChanged,
          onProgressChanged: handleProgressChanged,
          onError: handleError,
          onRoomState: handleRoomState,
        },
        false,
      );

      // Initialize session with current playback state
      if (currentTrack) {
        jamSessionService.updateTrack(currentTrack);
        jamSessionService.updatePlaybackState(isPlaying);
        jamSessionService.updateProgress(currentTime);
      }
    } catch (error) {
      console.error('Failed to create jam session:', error);
      toast.error(t('jam.errors.createFailed'));
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const joinExistingSession = async (roomId: string) => {
    setIsLoading(true);
    try {
      await jamSessionService.joinSession(
        roomId,
        {
          onParticipantJoined: handleParticipantJoined,
          onParticipantLeft: handleParticipantLeft,
          onPlaybackStateChanged: handlePlaybackStateChanged,
          onTrackChanged: handleTrackChanged,
          onProgressChanged: handleProgressChanged,
          onError: handleError,
          onRoomState: handleRoomState,
        },
        isGuest,
      );

      setRoomId(roomId);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to join session:', error);
      toast.error(t('jam.errors.joinFailed'));
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleParticipantJoined = (participant: Participant) => {
    setParticipants((prev) => {
      // Vérifier si le participant n'est pas déjà dans la liste
      if (!prev.find((p) => p.id === participant.id)) {
        return [...prev, participant];
      }
      return prev;
    });
    toast.success(
      t('jam.participantJoined', { username: participant.username }),
    );
  };

  const handleParticipantLeft = (participantId: string) => {
    setParticipants((prev) => {
      const participant = prev.find((p) => p.id === participantId);
      if (participant) {
        toast(t('jam.participantLeft', { username: participant.username }), {
          icon: '👋',
        });
      }
      return prev.filter((p) => p.id !== participantId);
    });
  };

  const handlePlaybackStateChanged = (newIsPlaying: boolean) => {
    setIsPlaying(newIsPlaying);
  };

  const handleTrackChanged = (track: Track) => {
    if (track && track.id !== currentTrack?.id) {
      playTrack(track);
    }
  };

  const handleProgressChanged = (progress: number) => {
    if (Math.abs(currentTime - progress) > 1) {
      setCurrentTime(progress);
    }
  };

  const handleError = (error: string) => {
    toast.error(error);
  };

  const handleUpdateInstrument = async () => {
    try {
      await jamSessionService.updateInstrument(instrument);
      setShowInstrumentModal(false);
      toast.success(t('jam.instrumentUpdated'));
    } catch (error) {
      toast.error(t('jam.errors.instrumentUpdateFailed'));
    }
  };

  const handleCloseSession = async () => {
    try {
      await jamSessionService.closeSession();
      toast.success(t('jam.sessionClosed'));
      onClose();
    } catch (error) {
      toast.error(t('jam.errors.closeFailed'));
    }
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

  if (showCreateModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('jam.createSession')}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('jam.sessionName')}
              </label>
              <input
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('jam.sessionDescription')}
              </label>
              <textarea
                value={sessionDescription}
                onChange={(e) => setSessionDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('jam.maxParticipants')}
              </label>
              <input
                type="number"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(Number(e.target.value))}
                min={2}
                max={50}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowCreateModal(false);
                onClose();
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              {t('actions.cancel')}
            </button>
            <button
              onClick={handleCreateSession}
              disabled={!sessionName}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('actions.create')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-gray-800 shadow-lg border-l border-gray-200 dark:border-gray-700 z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('jam.loading')}...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-gray-800 shadow-lg border-l border-gray-200 dark:border-gray-700 z-50">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('jam.title')}
            </h2>
            <div className="flex items-center space-x-2">
              {isHost && (
                <button
                  onClick={handleCloseSession}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  title={t('jam.closeSession')}
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                aria-label={t('actions.close')}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <UsersIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                {t('jam.participants')} ({participants.length + 1})
              </h3>
            </div>
            <button
              onClick={() => setShowInstrumentModal(true)}
              className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
              title={t('jam.setInstrument')}
            >
              <MusicalNoteIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Host (current user) */}
            <div className="flex items-center space-x-3">
              {user?.image_url && (
                <img
                  src={user.image_url.urls.medium.webp}
                  alt={user.username}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.username || t('jam.anonymous')}
                </p>
                <div className="flex items-center space-x-2">
                  <p className="text-xs text-purple-600 dark:text-purple-400">
                    {isHost ? t('jam.host') : t('jam.you')}
                  </p>
                  {instrument && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      • {instrument}
                    </p>
                  )}
                </div>
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
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {participant.username}
                  </p>
                  {participant.instrument && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {participant.instrument}
                    </p>
                  )}
                </div>
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

      {/* Instrument Modal */}
      {showInstrumentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('jam.setInstrument')}
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('jam.instrument')}
              </label>
              <input
                type="text"
                value={instrument}
                onChange={(e) => setInstrument(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600"
                placeholder={t('jam.instrumentPlaceholder')}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowInstrumentModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                {t('actions.cancel')}
              </button>
              <button
                onClick={handleUpdateInstrument}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                {t('actions.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
