'use client';

import { useLanguage } from '@/components/LanguageProvider';
import { usePathname, useRouter } from 'next/navigation';
import { localizedPath } from '@/lib/localization';

export default function LanguageToggle({
  className = '',
  variant = 'nav',
}: {
  className?: string;
  variant?: 'nav' | 'settings';
}) {
  const { locale, setLocale } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const spanishActive = locale === 'es-MX';
  const isSettings = variant === 'settings';
  const baseClassName = isSettings
    ? 'border-vw-line bg-vw-paper text-vw-blue shadow-sm transition-colors hover:border-vw-gold/60 hover:bg-vw-cream'
    : 'border-white/25 bg-white/5 transition-colors hover:border-vw-gold/50 hover:bg-white/10';
  const activeClassName = isSettings
    ? 'text-vw-blue'
    : 'text-white transition-colors group-hover:text-vw-gold';
  const inactiveClassName = isSettings
    ? 'text-vw-muted/65'
    : 'text-white/60 transition-colors group-hover:text-white/80';
  const dividerClassName = isSettings
    ? 'bg-vw-line'
    : 'bg-white/30 transition-colors group-hover:bg-white/50';
  const changeLocale = () => {
    const nextLocale = spanishActive ? 'en' : 'es-MX';
    setLocale(nextLocale);
    router.push(`${localizedPath(pathname, nextLocale)}${window.location.search}${window.location.hash}`);
  };

  return (
    <button
      type="button"
      onClick={changeLocale}
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
