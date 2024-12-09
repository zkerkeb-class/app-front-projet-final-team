import { useRouter } from 'next/router';
import Select from '../common/Select';

export default function LanguageSwitcher() {
  const router = useRouter();

  const languageOptions = [
    { value: 'fr', label: 'Français' },
    { value: 'en', label: 'English' },
    { value: 'ar', label: 'العربية' },
  ];

  const changeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const locale = e.target.value;
    router.push(router.pathname, router.asPath, { locale });
  };

  return (
    <Select
      id="language-select"
      options={languageOptions}
      onChange={changeLanguage}
      defaultValue={router.locale}
      className="min-w-[120px]"
    />
  );
}
