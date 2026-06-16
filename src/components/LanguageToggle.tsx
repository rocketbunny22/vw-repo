'use client';

import { useLanguage } from '@/components/LanguageProvider';

export default function LanguageToggle({ className = '' }: { className?: string }) {
  const { locale, toggleLocale } = useLanguage();
  const spanishActive = locale === 'es-MX';

  return (
    <button
      type="button"
      onClick={toggleLocale}
      className={`group inline-flex items-center gap-1.5 rounded-md border border-white/30 px-3 py-2 text-sm font-medium ${className}`}
      aria-label={spanishActive ? 'Switch to English' : 'Cambiar a español'}
      title={spanishActive ? 'Switch to English' : 'Cambiar a español'}
      data-no-translate
    >
      <span className={spanishActive ? 'text-white/60 transition-colors group-hover:text-white/80' : 'text-white transition-colors group-hover:text-vw-gold'}>EN</span>
      <span className="h-4 w-px bg-white/30 transition-colors group-hover:bg-white/50" aria-hidden="true" />
      <span className={spanishActive ? 'text-white transition-colors group-hover:text-vw-gold' : 'text-white/60 transition-colors group-hover:text-white/80'}>ES</span>
    </button>
  );
}
