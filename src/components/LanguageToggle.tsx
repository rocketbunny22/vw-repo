'use client';

import { useLanguage } from '@/components/LanguageProvider';

export default function LanguageToggle({
  className = '',
  variant = 'nav',
}: {
  className?: string;
  variant?: 'nav' | 'settings';
}) {
  const { locale, toggleLocale } = useLanguage();
  const spanishActive = locale === 'es-MX';
  const isSettings = variant === 'settings';
  const baseClassName = isSettings
    ? 'border-gray-300 bg-gray-50 text-vw-blue hover:border-vw-blue hover:bg-white'
    : 'border-white/30';
  const activeClassName = isSettings
    ? 'text-vw-blue'
    : 'text-white transition-colors group-hover:text-vw-gold';
  const inactiveClassName = isSettings
    ? 'text-gray-400'
    : 'text-white/60 transition-colors group-hover:text-white/80';
  const dividerClassName = isSettings
    ? 'bg-gray-300'
    : 'bg-white/30 transition-colors group-hover:bg-white/50';

  return (
    <button
      type="button"
      onClick={toggleLocale}
      className={`group inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium ${baseClassName} ${className}`}
      aria-label={spanishActive ? 'Switch to English' : 'Cambiar a español'}
      title={spanishActive ? 'Switch to English' : 'Cambiar a español'}
      data-no-translate
    >
      <span className={spanishActive ? inactiveClassName : activeClassName}>EN</span>
      <span className={`h-4 w-px ${dividerClassName}`} aria-hidden="true" />
      <span className={spanishActive ? activeClassName : inactiveClassName}>ES</span>
    </button>
  );
}
