import { useTranslation } from 'next-i18next';
import LanguageSwitcher from './i18n';

export default function Layout({ children }) {
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen">
      <header className="p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('welcome')}</h1>
        <LanguageSwitcher />
      </header>
      <main className="container mx-auto px-4">
        {children}
      </main>
    </div>
  );
}