import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { getItem, setItem, storageKeys } from '@/lib/storage';

import { palettes, type ColorScheme, type Palette } from './tokens';

export type ThemePreference = 'dark' | 'light' | 'system';

type ThemeContextValue = {
  scheme: ColorScheme;
  colors: Palette;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const isPreference = (value: string | null): value is ThemePreference =>
  value === 'dark' || value === 'light' || value === 'system';

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  // Темна тема — основна, тож за замовчуванням саме вона.
  const [preference, setPreferenceState] = useState<ThemePreference>('dark');

  useEffect(() => {
    getItem(storageKeys.themePreference).then((stored) => {
      if (isPreference(stored)) setPreferenceState(stored);
    });
  }, []);

  const setPreference = (next: ThemePreference) => {
    setPreferenceState(next);
    setItem(storageKeys.themePreference, next);
  };

  const scheme: ColorScheme =
    preference === 'system' ? (system === 'light' ? 'light' : 'dark') : preference;

  return (
    <ThemeContext.Provider value={{ scheme, colors: palettes[scheme], preference, setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used inside AppThemeProvider');
  return value;
}
