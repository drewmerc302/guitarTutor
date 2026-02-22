// src/theme/ThemeContext.tsx
import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkTheme, ThemeColors, PALETTES, PALETTE_NAMES, PaletteName } from './colors';

interface ThemeContextType {
  theme: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
  useFlats: boolean;
  toggleFlats: () => void;
  isLeftHanded: boolean;
  toggleLeftHanded: () => void;
  capo: number;
  setCapo: (n: number) => void;
  palette: PaletteName;
  setPalette: (name: PaletteName) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: darkTheme,
  isDark: true,
  toggleTheme: () => {},
  useFlats: false,
  toggleFlats: () => {},
  isLeftHanded: false,
  toggleLeftHanded: () => {},
  capo: 0,
  setCapo: () => {},
  palette: 'Modern iOS',
  setPalette: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [override, setOverride] = useState<boolean | null>(null);
  const [useFlats, setUseFlats] = useState(false);
  const [isLeftHanded, setIsLeftHanded] = useState(false);
  const [capo, setCapo] = useState(0);
  const [palette, setPaletteState] = useState<PaletteName>('Modern iOS');

  const isDark = override !== null ? override : systemScheme !== 'light';

  const mounted = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const [rawDark, rawFlats, rawLeftHanded, rawCapo, rawPalette] = await Promise.all([
          AsyncStorage.getItem('pref_isDark'),
          AsyncStorage.getItem('pref_useFlats'),
          AsyncStorage.getItem('pref_isLeftHanded'),
          AsyncStorage.getItem('pref_capo'),
          AsyncStorage.getItem('pref_palette'),
        ]);

        if (rawDark !== null) {
          setOverride(JSON.parse(rawDark) as boolean | null);
        }
        if (rawFlats !== null) {
          setUseFlats(JSON.parse(rawFlats) as boolean);
        }
        if (rawLeftHanded !== null) {
          setIsLeftHanded(JSON.parse(rawLeftHanded) as boolean);
        }
        if (rawCapo !== null) {
          setCapo(JSON.parse(rawCapo) as number);
        }
        if (rawPalette !== null) {
          const p = JSON.parse(rawPalette) as PaletteName;
          if (PALETTE_NAMES.includes(p)) setPaletteState(p);
        }
      } catch {
        // Storage failures are silently ignored; defaults remain in effect.
      } finally {
        mounted.current = true;
      }
    })();
  }, []);

  useEffect(() => {
    if (!mounted.current) return;
    AsyncStorage.setItem('pref_isDark', JSON.stringify(override)).catch(() => {});
  }, [override]);

  useEffect(() => {
    if (!mounted.current) return;
    AsyncStorage.setItem('pref_useFlats', JSON.stringify(useFlats)).catch(() => {});
  }, [useFlats]);

  useEffect(() => {
    if (!mounted.current) return;
    AsyncStorage.setItem('pref_isLeftHanded', JSON.stringify(isLeftHanded)).catch(() => {});
  }, [isLeftHanded]);

  useEffect(() => {
    if (!mounted.current) return;
    AsyncStorage.setItem('pref_capo', JSON.stringify(capo)).catch(() => {});
  }, [capo]);

  useEffect(() => {
    if (!mounted.current) return;
    AsyncStorage.setItem('pref_palette', JSON.stringify(palette)).catch(() => {});
  }, [palette]);

  const toggleTheme = useCallback(() => {
    setOverride(prev => prev === null ? !isDark : !prev);
  }, [isDark]);

  const toggleFlats = useCallback(() => {
    setUseFlats(prev => !prev);
  }, []);

  const toggleLeftHanded = useCallback(() => {
    setIsLeftHanded(prev => !prev);
  }, []);

  const setPalette = useCallback((name: PaletteName) => {
    setPaletteState(name);
  }, []);

  const activeTheme = useMemo(() => {
    const pair = PALETTES[palette] ?? PALETTES['Original'];
    return isDark ? pair.dark : pair.light;
  }, [isDark, palette]);

  const value = useMemo(() => ({
    theme: activeTheme,
    isDark,
    toggleTheme,
    useFlats,
    toggleFlats,
    isLeftHanded,
    toggleLeftHanded,
    capo,
    setCapo,
    palette,
    setPalette,
  }), [activeTheme, isDark, toggleTheme, useFlats, toggleFlats, isLeftHanded, toggleLeftHanded, capo, palette, setPalette]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
