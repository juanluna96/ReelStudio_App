import {create} from 'zustand';
import {read, write} from './storage';
import type {ResolvedTheme, ThemePreference, ThemeState} from './theme.types';

// Light/dark theme: the .dark class on <html> (index.css). index.html applies the saved one before the first
// paint, so the page doesn't flash; this store keeps it in sync afterwards, also when the system's changes.
export const THEME_KEY = 'studio.theme';

const media = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null);

const resolve = (p: ThemePreference): ResolvedTheme => (p === 'system' ? (media()?.matches ? 'dark' : 'light') : p);

const saved = (): ThemePreference => {
  const v = read(THEME_KEY, 'system');
  return v === 'light' || v === 'dark' ? v : 'system';
};

function apply(t: ResolvedTheme) {
  const root = document.documentElement;
  // No transitions while every colour flips at once (they'd crawl one by one).
  root.classList.add('theme-switching');
  root.classList.toggle('dark', t === 'dark');
  root.style.colorScheme = t;
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('theme-switching')));
}

export const useThemeStore = create<ThemeState>()((set, get) => ({
  preference: saved(),
  resolved: resolve(saved()),
  setPreference: (p) => {
    write(THEME_KEY, p);
    const resolved = resolve(p);
    apply(resolved);
    set({preference: p, resolved});
  },
  toggle: () => get().setPreference(get().resolved === 'dark' ? 'light' : 'dark'),
}));

// Follow the system while the preference is "system".
media()?.addEventListener('change', () => {
  if (useThemeStore.getState().preference !== 'system') return;
  const resolved = resolve('system');
  apply(resolved);
  useThemeStore.setState({resolved});
});
