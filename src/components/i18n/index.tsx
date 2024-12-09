import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

export default function LanguageSwitcher() {
  const router = useRouter();
  const { t } = useTranslation('common');

  const changeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const locale = e.target.value;
    router.push(router.pathname, router.asPath, { locale });
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="language-select">{t('language')}:</label>
      <select
        id="language-select"
        onChange={changeLanguage}
        defaultValue={router.locale}
        className="p-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
      >
        <option value="fr">Français</option>
        <option value="en">English</option>
        <option value="ar">العربية</option>
      </select>
    </div>
  );
}