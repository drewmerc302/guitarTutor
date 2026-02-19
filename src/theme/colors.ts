// src/theme/colors.ts
export interface ThemeColors {
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  bgElevated: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentDim: string;
  accentGlow: string;
  fretWire: string;
  stringColor: string;
  dotText: string;
  border: string;
  rootColor: string;
  fretboardBg: string;
  fretboardGradientEnd: string;
  inlayColor: string;
  nutColor: string;
}

export const darkTheme: ThemeColors = {
  bgPrimary: '#0e0e10',
  bgSecondary: '#18181b',
  bgTertiary: '#232328',
  bgElevated: '#2a2a30',
  textPrimary: '#f0ece4',
  textSecondary: '#9a968e',
  textMuted: '#5c5a55',
  accent: '#d4a04a',
  accentDim: '#d4a04a33',
  accentGlow: '#d4a04a18',
  fretWire: '#8a8580',
  stringColor: '#c4beb4',
  dotText: '#0e0e10',
  border: '#2e2e33',
  rootColor: '#e8734a',
  fretboardBg: '#2c1f0e',
  fretboardGradientEnd: '#1e150a',
  inlayColor: '#4a3d28',
  nutColor: '#e8e0d0',
};

export const lightTheme: ThemeColors = {
  bgPrimary: '#f5f2eb',
  bgSecondary: '#ece8df',
  bgTertiary: '#e0dbd2',
  bgElevated: '#d6d1c8',
  textPrimary: '#1a1916',
  textSecondary: '#5a574f',
  textMuted: '#8a867e',
  accent: '#d4a04a',
  accentDim: '#d4a04a33',
  accentGlow: '#d4a04a18',
  fretWire: '#8a8580',
  stringColor: '#7a7060',
  dotText: '#f5f2eb',
  border: '#ccc8be',
  rootColor: '#e8734a',
  fretboardBg: '#c4a46a',
  fretboardGradientEnd: '#a88c52',
  inlayColor: '#b89a5e',
  nutColor: '#8a7a5e',
};

/** Get the dot color for a note based on its interval from root. */
export function getNoteColor(interval: number, isRoot: boolean): string {
  if (isRoot) return '#e8734a';
  if (interval === 3 || interval === 4) return '#5ba3d9';
  if (interval === 7) return '#6bc77a';
  if (interval === 10 || interval === 11) return '#c76bb8';
  return '#d4a04a';
}
