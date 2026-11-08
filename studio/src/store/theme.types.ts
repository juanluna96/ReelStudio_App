/** What the creator picked: a fixed theme, or follow the system's. */
export type ThemePreference = 'light' | 'dark' | 'system';

/** What is actually showing. */
export type ResolvedTheme = 'light' | 'dark';

export type ThemeState = {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  setPreference: (p: ThemePreference) => void;
  /** Light ↔ dark (leaves "system" for a fixed theme). */
  toggle: () => void;
};
