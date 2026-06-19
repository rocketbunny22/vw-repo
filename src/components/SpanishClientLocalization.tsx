'use client';

import { useEffect } from 'react';
import { toSpanishPath } from '@/lib/localization';
import { translateMexicanSpanish } from '@/lib/translations';

const directPaths = new Set([
  '/', '/guides', '/library', '/search', '/profile', '/feedback', '/submit-guide',
  '/login', '/signup', '/reset-password', '/my-vw', '/bookmarks', '/upload', '/admin', '/privacy-policy',
  '/terms-of-use',
]);

function localizeHref(value: string): string {
  if (!value.startsWith('/') || value.startsWith('/es-mx') || value.startsWith('/api/')) return value;

  const url = new URL(value, window.location.origin);
  const pathname = url.pathname;
  const localizable = directPaths.has(pathname)
    || pathname.startsWith('/generation/')
    || pathname.startsWith('/systems/')
    || pathname.startsWith('/users/')
    || pathname.startsWith('/guides/');

  return localizable ? toSpanishPath(`${pathname}${url.search}${url.hash}`) : value;
}

function translateTextNode(node: Text) {
  const value = node.nodeValue || '';
  const trimmed = value.trim();
  if (!trimmed) return;

  const translated = translateMexicanSpanish(trimmed);
  if (translated !== trimmed) {
    node.nodeValue = value.replace(trimmed, translated);
  }
}

function localizeElement(element: Element) {
  element.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) translateTextNode(node as Text);
  });

  for (const attribute of ['placeholder', 'aria-label', 'title'] as const) {
    const value = element.getAttribute(attribute);
    if (value) {
      const translated = translateMexicanSpanish(value);
      if (translated !== value) element.setAttribute(attribute, translated);
    }
  }

  if (element instanceof HTMLAnchorElement) {
    const rawHref = element.getAttribute('href');
    if (rawHref) {
      const localizedHref = localizeHref(rawHref);
      if (localizedHref !== rawHref) element.setAttribute('href', localizedHref);
    }
  }

  if (element instanceof HTMLFormElement) {
    const rawAction = element.getAttribute('action');
    if (rawAction) {
      const localizedAction = localizeHref(rawAction);
      if (localizedAction !== rawAction) element.setAttribute('action', localizedAction);
    }
  }
}

function localizeTree(root: Element) {
  localizeElement(root);
  root.querySelectorAll('*').forEach(localizeElement);
}

export default function SpanishClientLocalization() {
  useEffect(() => {
    const root = document.querySelector('main');
    if (!root) return;

    localizeTree(root);
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes') {
          localizeElement(mutation.target as Element);
          continue;
        }

        if (mutation.type === 'characterData') {
          translateTextNode(mutation.target as Text);
          continue;
        }

        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) translateTextNode(node as Text);
          if (node instanceof Element) localizeTree(node);
        });
      }
    });

    observer.observe(root, {
      attributes: true,
      attributeFilter: ['href', 'action', 'placeholder', 'aria-label', 'title'],
      childList: true,
      characterData: true,
      subtree: true,
    });
    return () => observer.disconnect();
  }, []);

  return null;
}
