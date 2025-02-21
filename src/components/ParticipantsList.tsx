'use client';

interface Participant {
  userId: string;
  role: string;
  instrument: string;
  ready?: boolean;
  User: {
    username: string;
  };
}

interface ParticipantsListProps {
  participants: Participant[];
  isHost: boolean;
  maxParticipants: number;
  onKickParticipant: (userId: string) => void;
}

export default function ParticipantsList({
  participants,
  isHost,
  maxParticipants,
  onKickParticipant,
}: ParticipantsListProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
        Participants ({participants.length}/{maxParticipants})
      </h3>

      <div className="space-y-3">
        {participants.map((participant) => (
          <div
            key={participant.userId}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white font-medium">
                    {participant.User.username[0].toUpperCase()}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {participant.User.username}
                  {participant.ready && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Ready
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {participant.role} •{' '}
                  {participant.instrument || 'No instrument'}
                </p>
              </div>
            </div>

            {isHost && participant.role !== 'host' && (
              <button
                className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                onClick={() => onKickParticipant(participant.userId)}
              >
                Kick
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
