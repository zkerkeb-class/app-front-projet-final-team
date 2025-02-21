'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSocket } from '@/contexts/SocketContext';
import MusicPlayer from '@/components/MusicPlayer';
import ParticipantsList from '@/components/ParticipantsList';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/utils/api';

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  albumCover?: string;
}

interface Participant {
  userId: string;
  role: string;
  instrument: string;
  ready?: boolean;
  User: {
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
}

const DEMO_TRACKS: Track[] = [
  {
    id: '1',
    title: 'Demo Track 1',
    artist: 'Artist 1',
    url: 'https://kappa.vgmsite.com/soundtracks/dragon-ball-z-bgm/midwhnddmf/1-01.%20Makafushigi%20Adventure%21.mp3',
    albumCover:
      'https://www.galeriebd.com/wp-content/uploads/2023/04/Animation_DRAGON_Ball_4_3.jpg',
  },
  {
    id: '2',
    title: 'Demo Track 2',
    artist: 'Artist 2',
    url: 'https://vgmsite.com/soundtracks/naruto-path-of-the-ninja/icabycfj/Bad%20Memories.mp3',
    albumCover:
      'https://static.wikia.nocookie.net/naruto/images/d/dd/Naruto_Uzumaki%21%21.png',
  },
];

export default function JamRoom() {
  const router = useRouter();
  const { roomId } = router.query;
  const { connectToRoom, disconnectFromRoom, isConnected, socket, emitEvent } =
    useSocket();
  const { isLoading: isAuthLoading, user } = useAuth();
  const [room, setRoom] = useState<JamRoomDetails | null>(null);
  const [tracks, setTracks] = useState<Track[]>(DEMO_TRACKS);
  const [hasConnected, setHasConnected] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [reactions, setReactions] = useState<
    { type: string; username: string }[]
  >([]);

  // Charger les détails de la room
  useEffect(() => {
    const fetchRoomDetails = async () => {
      if (!roomId) return;

      try {
        const data = await api.get(`/jam/${roomId}`);
        setRoom(data);
        setParticipants(data.participants);
      } catch (error) {
        console.error('Failed to fetch room details:', error);
        toast.error('Failed to fetch room details');
        router.push('/jams');
      }
    };

    fetchRoomDetails();
  }, [roomId, router]);

  // Connexion socket
  useEffect(() => {
    if (
      roomId &&
      typeof roomId === 'string' &&
      !hasConnected &&
      !isAuthLoading &&
      room
    ) {
      setHasConnected(true);
      connectToRoom(roomId);

      return () => {
        disconnectFromRoom();
      };
    }
  }, [
    roomId,
    connectToRoom,
    disconnectFromRoom,
    hasConnected,
    isAuthLoading,
    room,
  ]);

  // Gestion des événements socket
  useEffect(() => {
    if (!socket) return;

    const handleParticipantsUpdate = (data: {
      participants: Participant[];
    }) => {
      console.log('Participants update received:', data);
      setParticipants(data.participants);
    };

    const handleReaction = (data: { type: string; username: string }) => {
      console.log('Reaction received:', data);
      setReactions((prev) => [...prev, data]);
      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r !== data));
      }, 3000);
    };

    socket.on('participants:update', handleParticipantsUpdate);
    socket.on('room:state', handleParticipantsUpdate);
    socket.on('jam:reaction', handleReaction);

    return () => {
      socket.off('participants:update', handleParticipantsUpdate);
      socket.off('room:state', handleParticipantsUpdate);
      socket.off('jam:reaction', handleReaction);
    };
  }, [socket]);

  if (!roomId || isAuthLoading || !room) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
          <p className="text-gray-600">
            Please wait while we prepare your jam session.
          </p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Connecting to room...</h2>
          <p className="text-gray-600">
            Please wait while we establish the connection.
          </p>
        </div>
      </div>
    );
  }

  const isHost = room.creator.id === user?.id;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{room.name}</h1>
          <p className="text-gray-600 mb-2">{room.description}</p>
          <div className="flex items-center space-x-2">
            <p className="text-gray-600">
              {isHost ? 'You are the host' : 'You are a participant'}
            </p>
            {isHost && (
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                Host
              </span>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MusicPlayer
              roomId={roomId as string}
              isHost={isHost}
              tracks={tracks}
            />
          </div>
          <div>
            <ParticipantsList
              participants={participants}
              isHost={isHost}
              maxParticipants={room.maxParticipants}
              onKickParticipant={(userId) => {
                emitEvent('participant:kick', { userId });
              }}
            />
          </div>
        </div>

        {/* Reactions */}
        <div className="fixed bottom-4 right-4 flex flex-col-reverse items-end space-y-reverse space-y-2">
          {reactions.map((reaction, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg px-4 py-2 animate-fade-in-up"
            >
              {reaction.type === 'applause' ? '👏' : '🎵'} {reaction.username}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
