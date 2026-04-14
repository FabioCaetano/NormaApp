import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const COUNTRIES = [
  { code: '+55', flag: '🇧🇷', label: 'BR', key: 'BR' },
  { code: '+1', flag: '🇺🇸', label: 'US', key: 'US' },
  { code: '+44', flag: '🇬🇧', label: 'UK', key: 'UK' },
  { code: '+33', flag: '🇫🇷', label: 'FR', key: 'FR' },
  { code: '+34', flag: '🇪🇸', label: 'ES', key: 'ES' },
  { code: '+49', flag: '🇩🇪', label: 'DE', key: 'DE' },
  { code: '+39', flag: '🇮🇹', label: 'IT', key: 'IT' },
  { code: '+351', flag: '🇵🇹', label: 'PT', key: 'PT' },
  { code: '+54', flag: '🇦🇷', label: 'AR', key: 'AR' },
  { code: '+595', flag: '🇵🇾', label: 'PY', key: 'PY' },
];

export default function CountryCodeSelector({ value = '+55', onChange }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const selected = COUNTRIES.find(c => c.code === value) || COUNTRIES[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="h-full px-3 bg-dark-600 border border-primary-600/30 rounded-l-lg text-white hover:border-accent-400 transition-colors flex items-center gap-1 text-sm"
      >
        <span>{selected.label}</span>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-50 bg-dark-600 border border-primary-600/30 rounded-lg shadow-lg max-h-60 overflow-y-auto min-w-[160px]">
            {COUNTRIES.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => { onChange(country.code); setOpen(false); }}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-dark-500 transition-colors flex items-center gap-2 ${
                  country.code === value ? 'bg-accent-400/10 text-accent-400' : 'text-white'
                }`}
              >
                <span>{country.flag} {country.label}</span>
                <span className="text-dark-400 text-xs">{country.code} {t(`countries.${country.key}`)}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
