'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSocket } from '@/contexts/SocketContext';
import MusicPlayer from '@/components/MusicPlayer';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  albumCover?: string;
}

// Ces pistes seront remplacées par les vraies pistes de votre API
const DEMO_TRACKS: Track[] = [
  {
    id: '1',
    title: 'Demo Track 1',
    artist: 'Artist 1',
    url: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3',
    albumCover:
      'https://www.galeriebd.com/wp-content/uploads/2023/04/Animation_DRAGON_Ball_4_3.jpg',
  },
  {
    id: '2',
    title: 'Demo Track 2',
    artist: 'Artist 2',
    url: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Sevish_-__nbsp_.mp3',
    albumCover:
      'https://static.wikia.nocookie.net/naruto/images/d/dd/Naruto_Uzumaki%21%21.png',
  },
];

export default function JamRoom() {
  const router = useRouter();
  const { roomId } = router.query;
  const { connectToRoom, disconnectFromRoom, isConnected } = useSocket();
  const { isLoading: isAuthLoading } = useAuth();
  const [isHost, setIsHost] = useState(false);
  const [tracks, setTracks] = useState<Track[]>(DEMO_TRACKS);
  const [hasConnected, setHasConnected] = useState(false);

  useEffect(() => {
    if (
      roomId &&
      typeof roomId === 'string' &&
      !hasConnected &&
      !isAuthLoading
    ) {
      setIsHost(true);
      setHasConnected(true);
      connectToRoom(roomId);

      return () => {
        disconnectFromRoom();
      };
    }
  }, [roomId, connectToRoom, disconnectFromRoom, hasConnected, isAuthLoading]);

  useEffect(() => {
    // Ici, vous pouvez charger les pistes depuis votre API
    // const fetchTracks = async () => {
    //   try {
    //     const response = await fetch('/api/tracks');
    //     const data = await response.json();
    //     setTracks(data);
    //   } catch (error) {
    //     toast.error('Failed to load tracks');
    //   }
    // };
    // fetchTracks();
  }, []);

  if (!roomId || isAuthLoading) {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Jam Room: {roomId}</h1>
          <p className="text-gray-600">
            {isHost ? 'You are the host' : 'You are a participant'}
          </p>
        </header>

        <MusicPlayer
          roomId={roomId as string}
          isHost={isHost}
          tracks={tracks}
        />
      </div>
    </div>
  );
}
