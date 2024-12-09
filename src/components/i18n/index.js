import { useRouter } from 'next/router';

export default function LanguageSwitcher() {
  const router = useRouter();
  const changeLanguage = (e) => {
    const locale = e.target.value;
    router.push(router.pathname, router.asPath, { locale });
  };

  return (
    <div>
      <select
        onChange={changeLanguage}
        defaultValue={router.locale}
        className="p-2 rounded border border-gray-300"
      >
        <option value="en">English</option>
        <option value="fr">Français</option>
        <option value="ar">العربية</option>
      </select>
    </div>
  );
}
