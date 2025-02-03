import { useRouter } from 'next/router';
import Select from '../common/Select';
import { useEffect, useState } from 'react';

export default function LanguageSwitcher() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const languageOptions = [
    { value: 'fr', label: isMobile ? 'FR' : 'Français' },
    { value: 'en', label: isMobile ? 'EN' : 'English' },
    { value: 'ar', label: isMobile ? 'AR' : 'العربية' },
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
      className={`${isMobile ? 'min-w-[80px]' : 'min-w-[120px]'}`}
    />
  );
}
