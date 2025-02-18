import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { useAuth } from '@/contexts/AuthContext';
import jamSessionService from '@/services/socket/jamSession.service';
import { toast } from 'react-hot-toast';

export async function getServerSideProps({
  locale,
  params,
}: {
  locale: string;
  params: { id: string };
}) {
  return {
    props: {
      jamSessionId: params.id,
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

interface JamSessionPageProps {
  jamSessionId: string;
}

export default function JamSessionPage({ jamSessionId }: JamSessionPageProps) {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const connect = async () => {
      if (!jamSessionId) return;

      try {
        setIsConnecting(true);
        setError(null);

        await jamSessionService.joinSession(
          jamSessionId,
          {
            onParticipantJoined: (participant) => {
              if (mounted) {
                toast.success(
                  t('jam.participantJoined', {
                    username: participant.username,
                  }),
                );
              }
            },
            onParticipantLeft: () => {},
            onPlaybackStateChanged: () => {},
            onTrackChanged: () => {},
            onProgressChanged: () => {},
            onError: (error) => {
              if (mounted) {
                setError(error);
                toast.error(error);
              }
            },
          },
          !user,
        );

        if (mounted) {
          // Redirect to home page with jam session active
          router.push('/?jam=true');
        }
      } catch (error) {
        if (mounted) {
          console.error('Failed to join jam session:', error);
          setError(t('jam.errors.joinFailed'));
          toast.error(t('jam.errors.joinFailed'));

          // Attendre un peu avant de rediriger
          setTimeout(() => {
            if (mounted) {
              router.push('/');
            }
          }, 3000);
        }
      } finally {
        if (mounted) {
          setIsConnecting(false);
        }
      }
    };

    connect();

    return () => {
      mounted = false;
    };
  }, [jamSessionId, user, router, t]);

  return (
    <>
      <Head>
        <title>{error ? t('jam.error') : t('jam.joining')} | ZakHarmony</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          {isConnecting && !error && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                {t('jam.joining')}...
              </p>
            </>
          )}
          {error && (
            <div className="text-red-600 dark:text-red-400">
              <p className="text-lg font-semibold mb-2">
                {t('jam.connectionError')}
              </p>
              <p>{error}</p>
              <p className="text-sm mt-2">{t('jam.redirecting')}...</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
