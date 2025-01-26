import { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

export default function Profile() {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{t('auth.profile')} | ZakHarmony</title>
        <meta name="description" content="Profil utilisateur ZakHarmony" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="p-8">
              <div className="flex flex-col items-center space-y-4">
                {user?.image_url ? (
                  <Image
                    src={user.image_url}
                    alt={user.username}
                    width={128}
                    height={128}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-32 h-32 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                    <span className="text-4xl text-purple-600 dark:text-purple-300">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user?.username}
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  {user?.email}
                </p>
              </div>

              <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('auth.firstName')}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {user?.first_name || '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('auth.lastName')}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {user?.last_name || '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('auth.userType')}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {user?.user_type
                        ? t(
                            `auth.userType${user.user_type.charAt(0).toUpperCase() + user.user_type.slice(1)}`,
                          )
                        : '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Membre depuis
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {user?.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : '-'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
