import { io, Socket } from 'socket.io-client';
import { Track } from '@/types/audio';

/**
 * Interface for participant data in a jam session
 */
interface Participant {
  id: string;
  username: string;
  avatar?: string;
  instrument?: string;
  role: 'host' | 'participant';
}

/**
 * Interface for room state
 */
interface RoomState {
  participants: Participant[];
  currentTrack?: Track;
  isPlaying: boolean;
  progress: number;
}

/**
 * Interface for jam session events
 */
interface JamSessionEvents {
  onParticipantJoined: (participant: Participant) => void;
  onParticipantLeft: (participantId: string) => void;
  onPlaybackStateChanged: (isPlaying: boolean) => void;
  onTrackChanged: (track: Track) => void;
  onProgressChanged: (progress: number) => void;
  onError: (error: string) => void;
  onRoomState?: (state: RoomState) => void;
}

/**
 * Interface for jam session details
 */
interface JamSessionDetails {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'closed';
  maxParticipants: number;
  createdBy: number;
  creator: {
    id: number;
    username: string;
  };
  participants: Participant[];
  currentTrack?: Track;
  isPlaying: boolean;
  progress: number;
}

class JamSessionService {
  private socket: Socket | null = null;
  private roomId: string | null = null;
  private events: JamSessionEvents | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private currentState: RoomState | null = null;

  /**
   * Get the authentication token
   */
  private getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Initialize socket connection with authentication
   */
  private initializeSocket(isGuest: boolean = false) {
    if (this.socket?.connected) {
      console.log('Socket already connected, skipping initialization');
      return;
    }

    const token = this.getToken();
    const userId = localStorage.getItem('userId');

    try {
      if (this.socket) {
        this.socket.removeAllListeners();
        this.socket.disconnect();
      }

      this.socket = io(
        process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8080',
        {
          transports: ['websocket', 'polling'],
          autoConnect: false,
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: 1000,
          auth: {
            token,
            userId,
            isGuest,
          },
        },
      );

      this.setupSocketListeners();
      this.socket.connect();

      console.log('Socket initialized and connecting...');
    } catch (error) {
      console.error('Error initializing socket:', error);
      throw new Error('Failed to initialize socket connection');
    }
  }

  /**
   * Setup socket event listeners
   */
  private setupSocketListeners() {
    if (!this.socket || !this.events) return;

    this.socket.on('connect', () => {
      console.log('Connected to jam session server');
      this.reconnectAttempts = 0;
      if (this.roomId) {
        console.log('Joining room after connect:', this.roomId);
        this.socket?.emit('room:join', {
          roomId: this.roomId,
          // Envoyer les informations du participant
          participant: {
            id: this.socket?.id,
            username:
              localStorage.getItem('username') ||
              'Guest_' + Math.random().toString(36).substr(2, 6),
            role: 'participant',
          },
        });
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.handleReconnect();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from jam session server:', reason);
      if (reason === 'io server disconnect') {
        this.socket?.connect();
      }
    });

    // Room state event
    this.socket.on('room:state', (state: RoomState) => {
      console.log('Received room:state', state);
      this.currentState = state;
      if (this.events?.onRoomState) {
        this.events.onRoomState(state);
      }
    });

    // Participant events
    this.socket.on('participant:joined', (participant: Participant) => {
      console.log('Participant joined:', participant);
      if (this.currentState) {
        // Ne pas ajouter si c'est nous-même
        if (participant.id === this.socket?.id) {
          return;
        }
        // Vérifier si le participant n'existe pas déjà
        if (
          !this.currentState.participants.find((p) => p.id === participant.id)
        ) {
          this.currentState.participants.push(participant);
          this.events?.onParticipantJoined(participant);
        }
      } else {
        this.currentState = {
          participants: [participant],
          isPlaying: false,
          progress: 0,
        };
        this.events?.onParticipantJoined(participant);
      }
    });

    this.socket.on('participant:left', (participantId: string) => {
      console.log('Participant left:', participantId);
      if (this.currentState) {
        const participant = this.currentState.participants.find(
          (p) => p.id === participantId,
        );
        if (participant) {
          this.currentState.participants =
            this.currentState.participants.filter(
              (p) => p.id !== participantId,
            );
          this.events?.onParticipantLeft(participantId);
        }
      }
    });

    // Playback events
    this.socket.on('playback:state', (data: { isPlaying: boolean }) => {
      console.log('Playback state changed:', data);
      if (this.currentState) {
        this.currentState.isPlaying = data.isPlaying;
      }
      this.events?.onPlaybackStateChanged(data.isPlaying);
    });

    this.socket.on('playback:track', (track: Track) => {
      console.log('Track changed:', track);
      if (this.currentState) {
        this.currentState.currentTrack = track;
      }
      this.events?.onTrackChanged(track);
    });

    this.socket.on('playback:progress', (data: { progress: number }) => {
      if (this.currentState) {
        this.currentState.progress = data.progress;
      }
      this.events?.onProgressChanged(data.progress);
    });

    this.socket.on('error', (error: string) => {
      console.error('Socket error:', error);
      this.events?.onError(error);
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.events?.onError('Unable to connect to jam session server');
      return;
    }

    this.reconnectAttempts++;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(() => {
      console.log(
        `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
      );
      this.socket?.connect();
    }, 1000 * this.reconnectAttempts);
  }

  /**
   * Create a new jam session
   * @returns Promise with the room ID
   */
  async createSession(
    name: string,
    description?: string,
    maxParticipants: number = 10,
  ): Promise<string> {
    try {
      const token = this.getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/jam-rooms`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            description,
            maxParticipants,
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to create jam session');
      }

      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error('Failed to create jam session:', error);
      throw new Error('Failed to create jam session');
    }
  }

  /**
   * Get details about a jam session
   * @param roomId - The room ID to get details for
   */
  async getSessionDetails(roomId: string): Promise<JamSessionDetails> {
    try {
      const token = this.getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/jam-rooms/${roomId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to get jam session details');
      }

      return response.json();
    } catch (error) {
      console.error('Failed to get jam session details:', error);
      throw new Error('Failed to get jam session details');
    }
  }

  /**
   * Get all active jam sessions
   */
  async getActiveSessions(): Promise<JamSessionDetails[]> {
    try {
      const token = this.getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/jam-rooms`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to get active sessions');
      }

      return response.json();
    } catch (error) {
      console.error('Failed to get active sessions:', error);
      throw new Error('Failed to get active sessions');
    }
  }

  /**
   * Join an existing jam session
   * @param roomId - The room ID to join
   * @param events - Event handlers for the session
   * @param isGuest - Whether the user is joining as a guest
   */
  async joinSession(
    roomId: string,
    events: JamSessionEvents,
    isGuest: boolean = false,
  ) {
    try {
      console.log('Joining session:', roomId, 'as guest:', isGuest);

      // Nettoyer l'état précédent si existant
      if (this.socket) {
        this.socket.removeAllListeners();
        this.socket.disconnect();
        this.socket = null;
      }

      // Récupérer les détails de la room d'abord
      const roomDetails = await this.getSessionDetails(roomId);
      console.log('Room details:', roomDetails);

      this.roomId = roomId;
      this.events = events;
      this.currentState = {
        participants: roomDetails.participants || [],
        currentTrack: roomDetails.currentTrack,
        isPlaying: roomDetails.isPlaying,
        progress: roomDetails.progress,
      };

      // Initialiser la connexion socket
      this.initializeSocket(isGuest);

      // Émettre un événement pour demander l'état actuel de la room
      setTimeout(() => {
        if (this.socket?.connected) {
          console.log('Requesting current room state');
          this.socket.emit('room:request_state', { roomId });
        }
      }, 1000); // Attendre 1s pour s'assurer que la connexion est établie
    } catch (error) {
      console.error('Failed to join jam session:', error);
      throw new Error('Failed to join jam session');
    }
  }

  /**
   * Leave the current jam session
   */
  leaveSession() {
    if (this.socket) {
      this.socket.emit('room:leave', { roomId: this.roomId });
      this.socket.disconnect();
    }
    this.roomId = null;
    this.events = null;
  }

  /**
   * Update participant's instrument
   * @param instrument - The instrument being played
   */
  async updateInstrument(instrument: string) {
    if (!this.roomId) return;

    try {
      const token = this.getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/jam-rooms/${this.roomId}/participant`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ instrument }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to update instrument');
      }

      return response.json();
    } catch (error) {
      console.error('Failed to update instrument:', error);
      throw new Error('Failed to update instrument');
    }
  }

  /**
   * Close the jam session (host only)
   */
  async closeSession() {
    if (!this.roomId) return;

    try {
      const token = this.getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/jam-rooms/${this.roomId}/close`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to close session');
      }

      this.leaveSession();
      return response.json();
    } catch (error) {
      console.error('Failed to close session:', error);
      throw new Error('Failed to close session');
    }
  }

  /**
   * Update playback state
   * @param isPlaying - Whether the track is playing or paused
   */
  updatePlaybackState(isPlaying: boolean) {
    if (this.socket && this.roomId) {
      this.socket.emit('playback:state', { roomId: this.roomId, isPlaying });
    }
  }

  /**
   * Update current track
   * @param track - The new track being played
   */
  updateTrack(track: Track) {
    if (this.socket && this.roomId) {
      this.socket.emit('playback:track', { roomId: this.roomId, track });
    }
  }

  /**
   * Update playback progress
   * @param progress - Current playback position in seconds
   */
  updateProgress(progress: number) {
    if (this.socket && this.roomId) {
      this.socket.emit('playback:progress', { roomId: this.roomId, progress });
    }
  }

  /**
   * Get the current room ID
   */
  getCurrentRoomId(): string | null {
    return this.roomId;
  }

  /**
   * Check if currently in a jam session
   */
  isInSession(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Check if the current user is the host of the session
   */
  async isSessionHost(): Promise<boolean> {
    if (!this.roomId) return false;

    try {
      const details = await this.getSessionDetails(this.roomId);
      const userId = localStorage.getItem('userId');
      return details.createdBy === Number(userId);
    } catch {
      return false;
    }
  }
}

export default new JamSessionService();
