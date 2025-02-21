import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { useAuth } from '@/contexts/AuthContext';
import jamSessionService from '@/services/socket/jamSession.service';
import { toast } from 'react-hot-toast';

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
  };
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

export default function JamSessionPage() {
  const router = useRouter();
  const { id } = router.query;
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState('checking');

  useEffect(() => {
    if (!user) {
      setConnectionStatus('unauthorized');
      router.push('/auth/login');
      return;
    }

    if (id && typeof id === 'string') {
      setConnectionStatus('connecting');
      joinSession(id);
    }
  }, [id, user]);

  const joinSession = async (roomId: string) => {
    try {
      setConnectionStatus('joining');
      jamSessionService.joinSession(roomId, {
        onParticipantJoined: (participant) => {
          toast.success(
            t('jam.participantJoined', { username: participant.username }),
          );
        },
        onParticipantLeft: () => {},
        onPlaybackStateChanged: () => {},
        onTrackChanged: () => {},
        onProgressChanged: () => {},
        onError: (error) => {
          setConnectionStatus('error');
          toast.error(error);
        },
        onRoomState: () => {
          setConnectionStatus('connected');
        },
      });

      // Redirect to home page with jam session active
      router.push('/?jam=true');
    } catch (error) {
      console.error('Failed to join jam session:', error);
      setConnectionStatus('error');
      toast.error(t('jam.errors.joinFailed'));
      router.push('/');
    }
  };

  return (
    <>
      <Head>
        <title>{t('jam.joining')} | ZakHarmony</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            {t(`jam.status.${connectionStatus}`)}
          </p>
          {connectionStatus === 'error' && (
            <button
              onClick={() => id && typeof id === 'string' && joinSession(id)}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              {t('jam.retry')}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
