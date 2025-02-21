import { io, Socket } from 'socket.io-client';
import { Track } from '@/types/audio';

/**
 * Interface for custom socket with lastError property
 */
interface CustomSocket extends Socket {
  lastError?: {
    message: string;
  };
}

/**
 * Interface for participant data in a jam session
 */
interface Participant {
  id: string;
  userId?: string;
  username: string;
  avatar?: string;
  instrument?: string;
  role: 'host' | 'participant';
  ready?: boolean;
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
 * Interface for playback control
 */
interface PlaybackControl {
  action: 'play' | 'pause' | 'seek' | 'track';
  time?: number;
  trackId?: number;
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
  onReaction?: (data: { type: string; username: string }) => void;
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
  private socket: CustomSocket | null = null;
  private roomId: string | null = null;
  private events: JamSessionEvents | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private currentState: RoomState | null = null;
  private lastEmittedProgress: number = 0;
  private lastEmittedTrack: number | null = null;
  private progressDebounceTimeout: NodeJS.Timeout | null = null;
  private connectionTimeout: NodeJS.Timeout | null = null;
  private readonly CONNECTION_TIMEOUT = 10000; // 10 secondes

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
        this.socket = null;
      }

      // Définir un timeout pour la connexion
      this.connectionTimeout = setTimeout(() => {
        if (this.socket && !this.socket.connected) {
          console.error('Connection timeout');
          this.socket.disconnect();
          this.events?.onError('Connection timeout');
        }
      }, this.CONNECTION_TIMEOUT);

      this.socket = io(
        process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8080',
        {
          transports: ['websocket', 'polling'],
          autoConnect: false,
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: 1000,
          timeout: this.CONNECTION_TIMEOUT,
          auth: {
            token,
            userId: userId ? Number(userId) : null,
            roomId: this.roomId,
            isGuest,
          },
        },
      );

      this.setupSocketListeners();
      this.socket.connect();

      console.log('Socket initialized and connecting...');
    } catch (error) {
      console.error('Error initializing socket:', error);
      if (this.connectionTimeout) {
        clearTimeout(this.connectionTimeout);
      }
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
      if (this.connectionTimeout) {
        clearTimeout(this.connectionTimeout);
      }
      this.reconnectAttempts = 0;
      if (this.roomId) {
        console.log('Joining room after connect:', this.roomId);
        const userId = localStorage.getItem('userId');
        this.socket?.emit('room:join', {
          roomId: this.roomId,
          userId: userId ? Number(userId) : null,
          username: localStorage.getItem('username'),
        });
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      if (this.connectionTimeout) {
        clearTimeout(this.connectionTimeout);
      }
      if (this.socket) {
        this.socket.lastError = error;
      }
      this.handleReconnect();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from jam session server:', reason);
      if (this.connectionTimeout) {
        clearTimeout(this.connectionTimeout);
      }
      if (reason === 'io server disconnect') {
        this.socket?.connect();
      }
    });

    // Room state event
    this.socket.on('room:state', (state: RoomState) => {
      console.log('Received initial room state:', state);
      this.currentState = state;
      if (this.events?.onRoomState) {
        this.events.onRoomState(state);
      }
      // Si on a une piste en cours, on la joue
      if (state.currentTrack && this.events?.onTrackChanged) {
        this.events.onTrackChanged(state.currentTrack);
      }
      // On met à jour l'état de lecture
      if (this.events?.onPlaybackStateChanged) {
        this.events.onPlaybackStateChanged(state.isPlaying);
      }
      // On met à jour la progression
      if (this.events?.onProgressChanged) {
        this.events.onProgressChanged(state.progress);
      }
    });

    // Room state update event
    this.socket.on('participants:update', (state: RoomState) => {
      console.log('Received participants:update', state);
      this.currentState = state;
      if (this.events?.onRoomState) {
        this.events.onRoomState(state);
      }
    });

    // Participant events
    this.socket.on('participant:joined', (participant: Participant) => {
      console.log('Participant joined:', participant);
      if (this.currentState) {
        if (participant.userId === localStorage.getItem('userId')) {
          return;
        }
        if (
          !this.currentState.participants.find(
            (p) => p.userId === participant.userId,
          )
        ) {
          this.currentState.participants.push(participant);
          this.events?.onParticipantJoined(participant);
          // Mettre à jour l'état global de la room
          if (this.events?.onRoomState) {
            this.events.onRoomState(this.currentState);
          }
        }
      }
    });

    this.socket.on('participant:left', ({ userId }: { userId: string }) => {
      console.log('Participant left:', userId);
      if (this.currentState) {
        const participant = this.currentState.participants.find(
          (p) => p.userId === userId,
        );
        if (participant) {
          this.currentState.participants =
            this.currentState.participants.filter((p) => p.userId !== userId);
          this.events?.onParticipantLeft(userId);
          // Mettre à jour l'état global de la room
          if (this.events?.onRoomState) {
            this.events.onRoomState(this.currentState);
          }
        }
      }
    });

    // Playback events
    this.socket.on('playback:control', (data: PlaybackControl) => {
      console.log('Received playback control:', data);
      if (this.currentState) {
        switch (data.action) {
          case 'play':
            this.currentState.isPlaying = true;
            this.events?.onPlaybackStateChanged(true);
            break;
          case 'pause':
            this.currentState.isPlaying = false;
            this.events?.onPlaybackStateChanged(false);
            break;
          case 'seek':
            if (data.time !== undefined) {
              this.currentState.progress = data.time;
              this.events?.onProgressChanged(data.time);
            }
            break;
          case 'track':
            if (
              data.trackId !== undefined &&
              this.currentState.currentTrack?.id !== data.trackId
            ) {
              // Mettre à jour la piste actuelle
              this.events?.onTrackChanged(this.currentState.currentTrack!);
            }
            break;
        }
      }
    });

    // Reaction events
    this.socket.on(
      'jam:reaction',
      (data: { type: string; username: string }) => {
        console.log('Received reaction:', data);
        if (this.events?.onReaction) {
          this.events.onReaction(data);
        }
      },
    );

    this.socket.on('error', (error: any) => {
      console.error('Socket error:', error);
      if (this.socket) {
        this.socket.lastError = error;
      }
      if (error.message === 'Room not found or closed') {
        this.leaveSession();
      }
      this.events?.onError(error.message || 'An error occurred');
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.events?.onError('Unable to connect to jam session server');
      return;
    }

    // Si la salle n'existe pas ou est fermée, ne pas tenter de reconnexion
    if (
      this.socket &&
      this.socket.disconnected &&
      this.socket.lastError?.message === 'Room not found or closed'
    ) {
      this.events?.onError('Room not found or closed');
      this.leaveSession();
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jam`, {
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
      });

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
        `${process.env.NEXT_PUBLIC_API_URL}/jam/${roomId}`,
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jam`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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

      // Vérifier si la salle existe et est active
      if (!roomDetails || roomDetails.status === 'closed') {
        throw new Error('Room not found or closed');
      }

      // Vérifier si la room n'est pas pleine
      if (roomDetails.participants.length >= roomDetails.maxParticipants) {
        throw new Error('Room is full');
      }

      // Définir les propriétés de la session avant d'initialiser le socket
      this.roomId = roomId;
      this.events = events;
      this.currentState = {
        participants: roomDetails.participants || [],
        currentTrack: roomDetails.currentTrack,
        isPlaying: roomDetails.isPlaying,
        progress: roomDetails.progress,
      };

      // Initialiser la connexion socket avec le roomId déjà défini
      this.initializeSocket(isGuest);

      // Émettre un événement pour demander l'état actuel de la room
      setTimeout(() => {
        if (this.socket?.connected) {
          console.log('Requesting current room state');
          this.socket.emit('room:request_state', { roomId });
        }
      }, 1000);
    } catch (error) {
      console.error('Failed to join jam session:', error);
      this.events?.onError(
        error instanceof Error ? error.message : 'Failed to join jam session',
      );
      throw error;
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
        `${process.env.NEXT_PUBLIC_API_URL}/jam/${this.roomId}/participant`,
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
        `${process.env.NEXT_PUBLIC_API_URL}/jam/${this.roomId}/close`,
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
   * Update playback control with debouncing and state checking
   */
  updatePlaybackControl(control: PlaybackControl) {
    if (!this.socket || !this.roomId) return;

    switch (control.action) {
      case 'seek':
        // Debounce seek events and only emit if significant change
        if (this.progressDebounceTimeout) {
          clearTimeout(this.progressDebounceTimeout);
        }
        if (
          control.time !== undefined &&
          Math.abs(this.lastEmittedProgress - control.time) > 1
        ) {
          this.progressDebounceTimeout = setTimeout(() => {
            this.socket?.emit('playback:control', {
              ...control,
              roomId: this.roomId,
            });
            this.lastEmittedProgress = control.time || 0;
          }, 500);
        }
        break;

      case 'track':
        // Only emit if track has changed
        if (control.trackId !== this.lastEmittedTrack) {
          this.socket.emit('playback:control', {
            ...control,
            roomId: this.roomId,
          });
          this.lastEmittedTrack = control.trackId || null;
        }
        break;

      default:
        // For play/pause, always emit as these are discrete actions
        this.socket.emit('playback:control', {
          ...control,
          roomId: this.roomId,
        });
    }
  }

  // Remove these deprecated methods as they're replaced by updatePlaybackControl
  updatePlaybackState(isPlaying: boolean) {
    if (this.socket && this.roomId) {
      this.updatePlaybackControl({
        action: isPlaying ? 'play' : 'pause',
      });
    }
  }

  updateTrack(track: Track) {
    if (this.socket && this.roomId) {
      this.updatePlaybackControl({
        action: 'track',
        trackId: track.id,
      });
    }
  }

  updateProgress(progress: number) {
    if (this.socket && this.roomId) {
      this.updatePlaybackControl({
        action: 'seek',
        time: progress,
      });
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
      return details.createdBy === (userId ? Number(userId) : null);
    } catch {
      return false;
    }
  }

  /**
   * Send a reaction in the jam session
   */
  sendReaction(type: string) {
    if (this.socket && this.roomId) {
      this.socket.emit('jam:reaction', { type });
    }
  }

  /**
   * Update participant's ready state
   */
  updateReadyState(ready: boolean) {
    if (this.socket && this.roomId) {
      const userId = localStorage.getItem('userId');
      this.socket.emit('participant:ready', {
        userId: userId ? Number(userId) : null,
        roomId: this.roomId,
        ready,
      });
    }
  }
}

export default new JamSessionService();
