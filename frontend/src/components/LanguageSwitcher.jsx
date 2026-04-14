import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'pt', label: '🇧🇷 PT', name: 'Português' },
  { code: 'en', label: '🇺🇸 EN', name: 'English' },
  { code: 'fr', label: '🇫🇷 FR', name: 'Français' },
  { code: 'es', label: '🇪🇸 ES', name: 'Español' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  return (
    <select
      value={i18n.language}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      className="bg-transparent text-white text-sm border border-primary-600/30 rounded px-2 py-1 focus:border-accent-400 focus:outline-none cursor-pointer"
      aria-label="Language"
    >
      {LANGUAGES.map((lang) => (
        <option key={lang.code} value={lang.code} className="bg-dark-800">
          {lang.label} - {lang.name}
        </option>
      ))}
    </select>
  );
}
