import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import {
  UsersIcon,
  ShareIcon,
  XMarkIcon,
  MusicalNoteIcon,
} from '@heroicons/react/24/outline';
import { useAudio } from '@/contexts/AudioContext';
import { useSocket } from '@/contexts/SocketContext';
import { Track } from '@/types/audio';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import MusicPlayer from '@/components/MusicPlayer';

const AVAILABLE_INSTRUMENTS = [
  { id: 'guitar', name: 'Guitare' },
  { id: 'bass', name: 'Basse' },
  { id: 'drums', name: 'Batterie' },
  { id: 'keyboard', name: 'Clavier' },
  { id: 'vocals', name: 'Voix' },
  { id: 'other', name: 'Autre' },
];

interface Participant {
  userId: string;
  username: string;
  role: string;
  instrument?: string;
  ready?: boolean;
  User?: {
    username: string;
  };
}

interface JamRoomDetails {
  id: string;
  name: string;
  description: string;
  maxParticipants: number;
  creator: {
    id: string;
    username: string;
  };
  participants: Participant[];
  currentTrack?: Track;
  isPlaying: boolean;
  progress: number;
}

interface JamSessionProps {
  roomId: string;
  onClose?: () => void;
}

export default function JamSession({ roomId, onClose }: JamSessionProps) {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const { connectToRoom, disconnectFromRoom, socket, isConnected, emitEvent } =
    useSocket();
  const {
    currentTrack,
    isPlaying,
    setIsPlaying,
    setCurrentTrack,
    currentTime,
    setCurrentTime,
    playTrack,
  } = useAudio();

  const [room, setRoom] = useState<JamRoomDetails | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedInstrument, setSelectedInstrument] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [reactions, setReactions] = useState<
    { type: string; username: string }[]
  >([]);
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Effet d'initialisation unique
  useEffect(() => {
    if (!roomId || !user || isInitialized) return;

    console.log('Initializing JamSession with:', {
      roomId,
      userId: user.id,
      isConnected,
    });

    setIsInitialized(true);
    setIsLoading(true);
    setError(null);

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError(t('jam.errors.unauthorized'));
      return;
    }

    // Connexion socket
    connectToRoom(roomId);

    // Récupération des détails de la room
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/jam/${roomId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log('Room details received:', data);
        setRoom(data);
        setParticipants(data.participants);

        if (data.currentTrack) {
          setCurrentTrack(data.currentTrack);
          setIsPlaying(data.isPlaying);
          setCurrentTime(data.progress);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch room details:', error);
        setError(t('jam.errors.fetchFailed'));
        setIsLoading(false);
      });

    return () => {
      console.log('Cleaning up JamSession');
      disconnectFromRoom();
    };
  }, [roomId, user, isInitialized]);

  // Effet pour les événements socket
  useEffect(() => {
    if (!socket) return;

    console.log('Setting up socket event listeners');

    const handleParticipantsUpdate = (data: {
      participants: Participant[];
    }) => {
      console.log('Participants update received:', data);
      setParticipants(data.participants);
    };

    const handleRoomState = (state: JamRoomDetails) => {
      console.log('Room state received:', state);
      setRoom(state);
      setParticipants(state.participants);

      if (
        state.currentTrack &&
        (!currentTrack || state.currentTrack.id !== currentTrack.id)
      ) {
        setCurrentTrack(state.currentTrack);
        playTrack(state.currentTrack);
      }

      setIsPlaying(state.isPlaying);
      setCurrentTime(state.progress);
    };

    const handleReaction = (data: { type: string; username: string }) => {
      console.log('Reaction received:', data);
      setReactions((prev) => [...prev, data]);
      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r !== data));
      }, 3000);
    };

    socket.on('participants:update', handleParticipantsUpdate);
    socket.on('room:state', handleRoomState);
    socket.on('jam:reaction', handleReaction);

    return () => {
      socket.off('participants:update', handleParticipantsUpdate);
      socket.off('room:state', handleRoomState);
      socket.off('jam:reaction', handleReaction);
    };
  }, [socket, currentTrack]);

  const handleInstrumentChange = (instrument: string) => {
    setSelectedInstrument(instrument);
    emitEvent('participant:update', {
      roomId,
      userId: user?.id,
      instrument,
    });
    toast.success(t('jam.instrumentChanged', { instrument }));
  };

  const toggleReady = () => {
    const newReadyState = !isReady;
    setIsReady(newReadyState);
    emitEvent('participant:ready', {
      roomId,
      userId: user?.id,
      ready: newReadyState,
    });
    toast.success(newReadyState ? t('jam.ready') : t('jam.notReady'));
  };

  const copyInviteLink = async () => {
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          {t('actions.close')}
        </button>
      </div>
    );
  }

  if (isLoading || !room || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const isHost = room.creator.id === user.id;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold mb-2 text-black">{room.name}</h1>
            <button
              onClick={copyInviteLink}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              <ShareIcon className="w-5 h-5" />
              <span>
                {isCopied ? t('jam.linkCopied') : t('jam.copyInviteLink')}
              </span>
            </button>
          </div>
          <p className="text-black">{room.description}</p>
          {isHost && (
            <div className="mt-4">
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {t('jam.host')}
              </span>
            </div>
          )}
        </div>

        {/* Music Player Section */}
        <div className="mb-8">
          <MusicPlayer roomId={roomId} isHost={isHost} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Participants Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4 text-black">
              {t('jam.participants')} ({participants.length}/
              {room.maxParticipants})
            </h2>
            <div className="space-y-3">
              {participants.map((participant) => (
                <div
                  key={participant.userId}
                  className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm"
                >
                  <div>
                    <span className="font-medium text-black">
                      {participant.User?.username || participant.username}
                    </span>
                    <span className="text-sm text-black ml-2">
                      ({participant.role})
                    </span>
                    {participant.ready && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        {t('jam.ready')}
                      </span>
                    )}
                  </div>
                  {participant.instrument && (
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {participant.instrument}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Controls Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4 text-black">
              {t('jam.controls')}
            </h2>
            {isConnected ? (
              <div className="space-y-6">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span className="text-sm text-green-600">
                    {t('jam.connected')}
                  </span>
                </div>

                {/* Instrument Selection */}
                <div>
                  <h3 className="text-lg font-medium mb-3 text-black">
                    {t('jam.selectInstrument')}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {AVAILABLE_INSTRUMENTS.map((instrument) => (
                      <button
                        key={instrument.id}
                        onClick={() => handleInstrumentChange(instrument.id)}
                        className={`p-2 rounded-md transition-colors ${
                          selectedInstrument === instrument.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-black'
                        }`}
                      >
                        {instrument.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ready Toggle */}
                <div>
                  <button
                    onClick={toggleReady}
                    className={`w-full p-3 rounded-md transition-colors ${
                      isReady
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-yellow-500 text-white hover:bg-yellow-600'
                    }`}
                  >
                    {isReady ? t('jam.ready') : t('jam.notReady')}
                  </button>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-medium mb-3 text-black">
                    {t('jam.quickActions')}
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() =>
                        emitEvent('jam:reaction', { type: 'applause' })
                      }
                      className="w-full p-2 bg-gray-100 rounded-md hover:bg-gray-200 text-black"
                    >
                      👏 {t('jam.applaud')}
                    </button>
                    <button
                      onClick={() =>
                        emitEvent('jam:reaction', { type: 'encore' })
                      }
                      className="w-full p-2 bg-gray-100 rounded-md hover:bg-gray-200 text-black"
                    >
                      🎵 {t('jam.requestEncore')}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                <span className="text-sm text-red-600">
                  {t('jam.disconnected')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Reactions */}
        <div className="fixed bottom-4 right-4 flex flex-col-reverse items-end space-y-reverse space-y-2">
          {reactions.map((reaction, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg px-4 py-2 animate-fade-in-up text-black"
            >
              {reaction.type === 'applause' ? '👏' : '🎵'} {reaction.username}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
