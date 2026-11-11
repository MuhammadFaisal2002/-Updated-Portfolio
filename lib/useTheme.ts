'use client';
import { useCallback, useSyncExternalStore } from 'react';

export type Theme = 'dark' | 'light';

function subscribeTheme(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}

function readTheme(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

/** Current theme, kept in sync with the `data-theme` attribute that ThemeToggle writes. */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribeTheme, readTheme, () => 'dark');
}

/** Reactive `window.matchMedia` without setState-in-effect. SSR value is `false`. */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener('change', callback);
      return () => mq.removeEventListener('change', callback);
    },
    [query],
  );
  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
