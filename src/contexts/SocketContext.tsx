'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connectToRoom: (roomId: string) => void;
  disconnectFromRoom: () => void;
  emitEvent: (event: string, data?: any) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isLoading } = useAuth();

  const emitEvent = useCallback(
    (event: string, data?: any) => {
      if (!socket || !isConnected) {
        toast.error('Not connected to room');
        return;
      }
      socket.emit(event, data);
    },
    [socket, isConnected],
  );

  const disconnectFromRoom = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket]);

  const connectToRoom = useCallback(
    async (roomId: string) => {
      // Attendre que l'authentification soit chargée
      if (isLoading) {
        return;
      }

      if (!user) {
        toast.error('You must be logged in to join a room');
        return;
      }

      // Si déjà connecté à la même room, ne rien faire
      if (socket?.connected && (socket as any).auth?.roomId === roomId) {
        return;
      }

      // Disconnect existing socket if any
      if (socket) {
        socket.disconnect();
      }

      const newSocket = io(
        process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080',
        {
          auth: {
            roomId,
            userId: user.id,
          },
          path: '/socket.io/jam',
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        },
      );

      // Connection events
      newSocket.on('connect', () => {
        setIsConnected(true);
        toast.success('Connected to room!');
      });

      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        toast.error('Failed to connect: ' + error.message);
        setSocket(null);
        setIsConnected(false);
      });

      newSocket.on('disconnect', (reason) => {
        setIsConnected(false);
        toast.error(`Disconnected: ${reason}`);
        setSocket(null);
      });

      // Room events
      newSocket.on('room:joined', (data) => {
        toast.success(`Successfully joined room: ${data.roomName}`);
      });

      newSocket.on('room:left', () => {
        toast.success('Left the room');
      });

      newSocket.on('room:error', (error) => {
        toast.error(error.message);
      });

      // Participant events
      newSocket.on('participant:joined', (data) => {
        toast.success(`${data.username} joined the room`);
      });

      newSocket.on('participant:left', (data) => {
        toast.success(`${data.username} left the room`);
      });

      // Music control events
      newSocket.on('track:play', (data) => {
        toast.success(
          `${data.username} started playing ${data.trackName || 'the track'}`,
        );
      });

      newSocket.on('track:pause', (data) => {
        toast.success(`${data.username} paused the track`);
      });

      newSocket.on('track:change', (data) => {
        toast.success(`Now playing: ${data.trackName}`);
      });

      newSocket.on('track:error', (error) => {
        toast.error(`Playback error: ${error.message}`);
      });

      // Set the socket only after setting up all event listeners
      setSocket(newSocket);
    },
    [socket, user, isLoading],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        connectToRoom,
        disconnectFromRoom,
        emitEvent,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
