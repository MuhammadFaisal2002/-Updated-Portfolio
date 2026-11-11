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

/** Write the theme to the DOM and persist it; every `useTheme` subscriber updates. */
export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem('theme', theme);
  } catch {
    /* localStorage unavailable (private mode, blocked storage) */
  }
}

/** Theme plus a toggle, for controls such as ThemeToggle. */
export function useThemeToggle() {
  const theme = useTheme();
  const toggleTheme = useCallback(() => {
    applyTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme]);
  return { theme, toggleTheme };
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
