/**
 * Дизайн-токени Відлуння (див. PLAN.md → «Дизайн-токени»).
 * Темна тема — основна.
 */

export type ColorScheme = 'dark' | 'light';

export type Palette = {
  background: string;
  surface: string;
  surfaceRaised: string;
  border: string;
  text: string;
  textSecondary: string;
  accent: string;
  accentText: string;
  timeCapsule: string;
  danger: string;
};

export const palettes: Record<ColorScheme, Palette> = {
  dark: {
    background: '#0E1013',
    surface: '#181B20',
    surfaceRaised: '#22262D',
    border: '#2A2F37',
    text: '#F2F3F5',
    textSecondary: '#9AA0AA',
    accent: '#8B7CFF',
    accentText: '#0E1013',
    timeCapsule: '#F5B544',
    danger: '#FF6B6B',
  },
  light: {
    background: '#F5F6F8',
    surface: '#FFFFFF',
    surfaceRaised: '#ECEEF2',
    border: '#DDE0E6',
    text: '#14161A',
    textSecondary: '#5E6470',
    accent: '#5A47F0',
    accentText: '#FFFFFF',
    timeCapsule: '#C98A12',
    danger: '#D93B3B',
  },
};

/** Імена шрифтів після завантаження через useFonts (ключі мапи в _layout). */
export const fonts = {
  display: 'Unbounded_600SemiBold',
  displayBold: 'Unbounded_700Bold',
  body: 'Manrope_400Regular',
  bodyMedium: 'Manrope_500Medium',
  bodySemiBold: 'Manrope_600SemiBold',
  bodyBold: 'Manrope_700Bold',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
  pill: 999,
} as const;
