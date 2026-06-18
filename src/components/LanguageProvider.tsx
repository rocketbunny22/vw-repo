'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  Locale,
  localeLabels,
} from '@/lib/translations';

interface LanguageContextValue {
  locale: Locale;
  label: string;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);
const localeStorageKey = 'vw_repo_locale';

export function LanguageProvider({
  children,
  initialLocale = 'en',
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    document.documentElement.lang = locale === 'es-MX' ? 'es-MX' : 'en';
    window.localStorage.setItem(localeStorageKey, locale);
  }, [locale]);

  const value = useMemo<LanguageContextValue>(() => ({
    locale,
    label: localeLabels[locale],
    setLocale: setLocaleState,
    toggleLocale: () => setLocaleState((current) => (current === 'en' ? 'es-MX' : 'en')),
  }), [locale]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }

  return context;
}
