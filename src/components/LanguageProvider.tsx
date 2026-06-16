'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  Locale,
  localeLabels,
  mexicanSpanishTranslations,
} from '@/lib/translations';

interface LanguageContextValue {
  locale: Locale;
  label: string;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);
const originalText = new WeakMap<Text, string>();
const localeStorageKey = 'vw_repo_locale';
let translating = false;

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === 'undefined') return 'en';
    return window.localStorage.getItem(localeStorageKey) === 'es-MX' ? 'es-MX' : 'en';
  });

  useEffect(() => {
    document.documentElement.lang = locale === 'es-MX' ? 'es-MX' : 'en';
    window.localStorage.setItem(localeStorageKey, locale);
    translateDocument(locale);

    let timeoutId: number | undefined;
    const observer = new MutationObserver(() => {
      if (translating) return;
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => translateDocument(locale), 100);
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      window.clearTimeout(timeoutId);
      observer.disconnect();
    };
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

function translateDocument(locale: Locale): void {
  translating = true;

  try {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (!node.textContent?.trim()) return NodeFilter.FILTER_REJECT;
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          if (parent.closest('[data-no-translate]')) return NodeFilter.FILTER_REJECT;
          if (['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'CODE', 'PRE'].includes(parent.tagName)) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      },
    );

    const nodes: Text[] = [];
    let nextNode = walker.nextNode();
    while (nextNode) {
      nodes.push(nextNode as Text);
      nextNode = walker.nextNode();
    }

    for (const node of nodes) {
      if (!originalText.has(node)) {
        originalText.set(node, node.textContent || '');
      }

      const original = originalText.get(node) || '';
      node.textContent = locale === 'es-MX' ? translateText(original) : original;
    }
  } finally {
    translating = false;
  }
}

function translateText(value: string): string {
  const leadingSpace = value.match(/^\s*/)?.[0] || '';
  const trailingSpace = value.match(/\s*$/)?.[0] || '';
  const phrase = value.trim().replace(/\s+/g, ' ');
  const translated = mexicanSpanishTranslations[phrase];

  return translated ? `${leadingSpace}${translated}${trailingSpace}` : value;
}
