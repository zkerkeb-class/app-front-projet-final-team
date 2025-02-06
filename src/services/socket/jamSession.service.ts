import { io, Socket } from 'socket.io-client';
import { Track } from '@/types/audio';

/**
 * Interface for participant data in a jam session
 */
interface Participant {
  id: string;
  username: string;
  avatar?: string;
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
}

class JamSessionService {
  private socket: Socket | null = null;
  private roomId: string | null = null;
  private events: JamSessionEvents | null = null;

  /**
   * Initialize socket connection
   */
  private initializeSocket() {
    if (this.socket) return;

    this.socket = io(
      process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001',
      {
        transports: ['websocket'],
        autoConnect: false,
      },
    );

    this.setupSocketListeners();
  }

  /**
   * Setup socket event listeners
   */
  private setupSocketListeners() {
    if (!this.socket || !this.events) return;

    this.socket.on('participant:joined', this.events.onParticipantJoined);
    this.socket.on('participant:left', this.events.onParticipantLeft);
    this.socket.on('playback:state', this.events.onPlaybackStateChanged);
    this.socket.on('playback:track', this.events.onTrackChanged);
    this.socket.on('playback:progress', this.events.onProgressChanged);
    this.socket.on('error', this.events.onError);
  }

  /**
   * Create a new jam session
   * @returns Promise with the room ID
   */
  async createSession(): Promise<string> {
    try {
      const response = await fetch('/api/jam/create', {
        method: 'POST',
      });
      const data = await response.json();
      return data.roomId;
    } catch (error) {
      console.error('Failed to create jam session:', error);
      throw new Error('Failed to create jam session');
    }
  }

  /**
   * Join an existing jam session
   * @param roomId - The room ID to join
   * @param events - Event handlers for the session
   */
  joinSession(roomId: string, events: JamSessionEvents) {
    this.roomId = roomId;
    this.events = events;
    this.initializeSocket();

    if (this.socket) {
      this.socket.connect();
      this.socket.emit('room:join', { roomId });
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
}

export default new JamSessionService();
