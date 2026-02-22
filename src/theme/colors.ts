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

// ─── Original palette (warm gold / charcoal) ────────────────────────────────

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

// ─── Palette 1 · Modern Blue ─────────────────────────────────────────────────
// Deep navy backgrounds, electric-blue accent. Feels techy, contemporary,
// like a developer tool or a modern music production app.

const modernBlueDark: ThemeColors = {
  bgPrimary: '#08091a',
  bgSecondary: '#0f1128',
  bgTertiary: '#171934',
  bgElevated: '#1f2240',
  textPrimary: '#e8eeff',
  textSecondary: '#8898cc',
  textMuted: '#4a5480',
  accent: '#4a9eff',
  accentDim: '#4a9eff33',
  accentGlow: '#4a9eff18',
  fretWire: '#6070a0',
  stringColor: '#a0b0d8',
  dotText: '#08091a',
  border: '#1e2448',
  rootColor: '#ff6060',
  fretboardBg: '#0d1030',
  fretboardGradientEnd: '#08091e',
  inlayColor: '#1e2860',
  nutColor: '#c0c8e8',
};

const modernBlueLight: ThemeColors = {
  bgPrimary: '#eef2ff',
  bgSecondary: '#e2e8ff',
  bgTertiary: '#d4dcff',
  bgElevated: '#c4d0ff',
  textPrimary: '#0a0e2a',
  textSecondary: '#3a4880',
  textMuted: '#7080b8',
  accent: '#2265d0',
  accentDim: '#2265d033',
  accentGlow: '#2265d018',
  fretWire: '#7080b0',
  stringColor: '#4060a0',
  dotText: '#eef2ff',
  border: '#b8c4e8',
  rootColor: '#d03830',
  fretboardBg: '#1a2050',
  fretboardGradientEnd: '#101440',
  inlayColor: '#2a3880',
  nutColor: '#dde4ff',
};

// ─── Palette 2 · Warm Neutral ────────────────────────────────────────────────
// Off-white / cream backgrounds, muted teal accent. Clean, approachable,
// textbook-like — feels educational rather than flashy.

const warmNeutralDark: ThemeColors = {
  bgPrimary: '#141210',
  bgSecondary: '#1e1c18',
  bgTertiary: '#282420',
  bgElevated: '#322e28',
  textPrimary: '#f2ede6',
  textSecondary: '#9a9288',
  textMuted: '#5a5550',
  accent: '#4aaa88',
  accentDim: '#4aaa8833',
  accentGlow: '#4aaa8818',
  fretWire: '#807868',
  stringColor: '#b8b0a4',
  dotText: '#141210',
  border: '#2e2a24',
  rootColor: '#e87050',
  fretboardBg: '#2a1c0c',
  fretboardGradientEnd: '#1e1408',
  inlayColor: '#48382a',
  nutColor: '#e8e0d0',
};

const warmNeutralLight: ThemeColors = {
  bgPrimary: '#f8f4ee',
  bgSecondary: '#efe9e0',
  bgTertiary: '#e6dfd4',
  bgElevated: '#ddd5c8',
  textPrimary: '#18140e',
  textSecondary: '#504840',
  textMuted: '#887f74',
  accent: '#2e8870',
  accentDim: '#2e887033',
  accentGlow: '#2e887018',
  fretWire: '#807060',
  stringColor: '#705848',
  dotText: '#f8f4ee',
  border: '#ccc4b8',
  rootColor: '#c85030',
  fretboardBg: '#b8904c',
  fretboardGradientEnd: '#a07c3c',
  inlayColor: '#c8a870',
  nutColor: '#908070',
};

// ─── Palette 3 · Modern iOS ──────────────────────────────────────────────────
// Ultra-light system backgrounds, system blue accent, heavy use of rounded
// cards and separators. Feels native iOS 17 — clean, spacious, familiar.

const modernIOSDark: ThemeColors = {
  bgPrimary: '#000000',
  bgSecondary: '#1c1c1e',
  bgTertiary: '#2c2c2e',
  bgElevated: '#3a3a3c',
  textPrimary: '#ffffff',
  textSecondary: '#ebebf5cc',
  textMuted: '#ebebf560',
  accent: '#0a84ff',
  accentDim: '#0a84ff33',
  accentGlow: '#0a84ff18',
  fretWire: '#636366',
  stringColor: '#aeaeb2',
  dotText: '#000000',
  border: '#38383a',
  rootColor: '#ff453a',
  fretboardBg: '#1a1a1c',
  fretboardGradientEnd: '#0e0e10',
  inlayColor: '#2c2c2e',
  nutColor: '#d1d1d6',
};

const modernIOSLight: ThemeColors = {
  bgPrimary: '#f2f2f7',
  bgSecondary: '#ffffff',
  bgTertiary: '#f2f2f7',
  bgElevated: '#e5e5ea',
  textPrimary: '#000000',
  textSecondary: '#3c3c4399',
  textMuted: '#3c3c4360',
  accent: '#007aff',
  accentDim: '#007aff33',
  accentGlow: '#007aff18',
  fretWire: '#8e8e93',
  stringColor: '#48484a',
  dotText: '#ffffff',
  border: '#c6c6c8',
  rootColor: '#ff3b30',
  fretboardBg: '#1c1c1e',
  fretboardGradientEnd: '#111113',
  inlayColor: '#3a3a3c',
  nutColor: '#d1d1d6',
};

// ─── Palette 4 · Dark Premium ────────────────────────────────────────────────
// Near-black backgrounds, rose-gold accent, subtle warm gradient surfaces.
// Feels like a pro audio plugin or a luxury music tool.

const darkPremiumDark: ThemeColors = {
  bgPrimary: '#0a0a0f',
  bgSecondary: '#131318',
  bgTertiary: '#1c1c24',
  bgElevated: '#24242e',
  textPrimary: '#f4ede8',
  textSecondary: '#a09088',
  textMuted: '#605858',
  accent: '#e8906a',
  accentDim: '#e8906a33',
  accentGlow: '#e8906a18',
  fretWire: '#706060',
  stringColor: '#c0b0a8',
  dotText: '#0a0a0f',
  border: '#282830',
  rootColor: '#e85050',
  fretboardBg: '#1a100c',
  fretboardGradientEnd: '#100a08',
  inlayColor: '#302020',
  nutColor: '#e0d0c8',
};

const darkPremiumLight: ThemeColors = {
  bgPrimary: '#faf6f2',
  bgSecondary: '#f0ebe4',
  bgTertiary: '#e8e0d8',
  bgElevated: '#dfd4ca',
  textPrimary: '#1a1210',
  textSecondary: '#605048',
  textMuted: '#a09088',
  accent: '#c05030',
  accentDim: '#c0503033',
  accentGlow: '#c0503018',
  fretWire: '#807068',
  stringColor: '#605040',
  dotText: '#faf6f2',
  border: '#cfc4bc',
  rootColor: '#c03030',
  fretboardBg: '#2a1c14',
  fretboardGradientEnd: '#1e140e',
  inlayColor: '#4a3028',
  nutColor: '#e8d8cc',
};

// ─── Palette 5 · Fretboard ───────────────────────────────────────────────────
// Warm wood tones throughout the UI — not just the neck. Rosewood dark,
// maple light. Thematic to the instrument without being kitschy.

const fretboardDark: ThemeColors = {
  bgPrimary: '#1a0e08',
  bgSecondary: '#261508',
  bgTertiary: '#321c0e',
  bgElevated: '#3e2414',
  textPrimary: '#f0e8d8',
  textSecondary: '#a89070',
  textMuted: '#685040',
  accent: '#c8a030',
  accentDim: '#c8a03033',
  accentGlow: '#c8a03018',
  fretWire: '#b8a060',
  stringColor: '#d0c080',
  dotText: '#1a0e08',
  border: '#3a2818',
  rootColor: '#e87030',
  fretboardBg: '#3d1a0a',
  fretboardGradientEnd: '#2a1008',
  inlayColor: '#604030',
  nutColor: '#f0e8c8',
};

const fretboardLight: ThemeColors = {
  bgPrimary: '#f4edd8',
  bgSecondary: '#ece3c8',
  bgTertiary: '#e2d8b8',
  bgElevated: '#d8ceac',
  textPrimary: '#1a1008',
  textSecondary: '#604830',
  textMuted: '#a08060',
  accent: '#a06820',
  accentDim: '#a0682033',
  accentGlow: '#a0682018',
  fretWire: '#907848',
  stringColor: '#705028',
  dotText: '#f4edd8',
  border: '#d0c098',
  rootColor: '#b84018',
  fretboardBg: '#5a2810',
  fretboardGradientEnd: '#441e0c',
  inlayColor: '#7a4c30',
  nutColor: '#e8dab8',
};

// ─── Palette registry ────────────────────────────────────────────────────────

export type PaletteName = 'Warm' | 'Modern Blue' | 'Warm Neutral' | 'Modern iOS' | 'Dark Premium' | 'Fretboard';

export const PALETTE_NAMES: PaletteName[] = [
  'Warm',
  'Modern Blue',
  'Warm Neutral',
  'Modern iOS',
  'Dark Premium',
  'Fretboard',
];

export const PALETTES: Record<PaletteName, { dark: ThemeColors; light: ThemeColors }> = {
  'Warm':         { dark: darkTheme,         light: lightTheme },
  'Modern Blue':   { dark: modernBlueDark,    light: modernBlueLight },
  'Warm Neutral':  { dark: warmNeutralDark,   light: warmNeutralLight },
  'Modern iOS':    { dark: modernIOSDark,     light: modernIOSLight },
  'Dark Premium':  { dark: darkPremiumDark,   light: darkPremiumLight },
  'Fretboard':     { dark: fretboardDark,     light: fretboardLight },
};

// ─── Utility functions ───────────────────────────────────────────────────────

/** Get the border accent color for a chord card based on its quality. */
export function getChordQualityColor(quality: string, isDark: boolean): string {
  switch (quality) {
    case 'Major': return '#c8962a';
    case 'Minor': return '#3a7bd5';
    case 'Dim':   return '#c0392b';
    default:      return '#555';
  }
}

/** Get the dot color for a note based on its interval from root. */
export function getNoteColor(interval: number, isRoot: boolean): string {
  if (isRoot) return '#e8734a';
  if (interval === 3 || interval === 4) return '#5ba3d9';
  if (interval === 7) return '#6bc77a';
  if (interval === 10 || interval === 11) return '#c76bb8';
  return '#d4a04a';
}
