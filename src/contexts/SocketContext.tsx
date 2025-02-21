import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connectToRoom: (roomId: string) => void;
  disconnectFromRoom: () => void;
  emitEvent: (event: string, data: any) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

  const connectToRoom = useCallback((roomId: string) => {
    // Si on a déjà une connexion active pour cette room, ne pas reconnecter
    if (socketRef.current?.connected && currentRoomId === roomId) {
      console.log('Already connected to room:', roomId);
      return;
    }

    // Déconnecter la socket existante si elle existe
    if (socketRef.current) {
      console.log('Disconnecting existing socket');
      socketRef.current.disconnect();
    }

    console.log('Creating new socket connection for room:', roomId);
    const token = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      console.error('Missing auth credentials');
      return;
    }

    const newSocket = io(
      process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8080',
      {
        auth: {
          token,
          userId: Number(userId),
          roomId,
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
      },
    );

    newSocket.on('connect', () => {
      console.log('Socket connected successfully');
      setIsConnected(true);
      setCurrentRoomId(roomId);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
      setCurrentRoomId(null);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);
  }, []);

  const disconnectFromRoom = useCallback(() => {
    if (socketRef.current) {
      console.log('Disconnecting from room');
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    }
  }, []);

  const emitEvent = useCallback((event: string, data: any) => {
    if (socketRef.current?.connected) {
      console.log('Emitting event:', event, data);
      socketRef.current.emit(event, data);
    } else {
      console.warn('Cannot emit event: socket not connected');
    }
  }, []);

  // Nettoyage à la destruction du provider
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

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
