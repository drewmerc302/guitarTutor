// src/theme/ThemeContext.tsx
import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkTheme, lightTheme, ThemeColors } from './colors';

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
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [override, setOverride] = useState<boolean | null>(null);
  const [useFlats, setUseFlats] = useState(false);
  const [isLeftHanded, setIsLeftHanded] = useState(false);
  const [capo, setCapo] = useState(0);

  const isDark = override !== null ? override : systemScheme !== 'light';

  // Track whether the initial load from AsyncStorage has completed so that
  // save effects do not persist default values before the real persisted
  // values have been applied.
  const mounted = useRef(false);

  // Load all preferences from AsyncStorage on mount.
  useEffect(() => {
    (async () => {
      try {
        const [rawDark, rawFlats, rawLeftHanded, rawCapo] = await Promise.all([
          AsyncStorage.getItem('pref_isDark'),
          AsyncStorage.getItem('pref_useFlats'),
          AsyncStorage.getItem('pref_isLeftHanded'),
          AsyncStorage.getItem('pref_capo'),
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
      } catch {
        // Storage failures are silently ignored; defaults remain in effect.
      } finally {
        mounted.current = true;
      }
    })();
  }, []);

  // Persist `override` (the isDark override) whenever it changes.
  useEffect(() => {
    if (!mounted.current) return;
    AsyncStorage.setItem('pref_isDark', JSON.stringify(override)).catch(() => {});
  }, [override]);

  // Persist `useFlats` whenever it changes.
  useEffect(() => {
    if (!mounted.current) return;
    AsyncStorage.setItem('pref_useFlats', JSON.stringify(useFlats)).catch(() => {});
  }, [useFlats]);

  // Persist `isLeftHanded` whenever it changes.
  useEffect(() => {
    if (!mounted.current) return;
    AsyncStorage.setItem('pref_isLeftHanded', JSON.stringify(isLeftHanded)).catch(() => {});
  }, [isLeftHanded]);

  // Persist `capo` whenever it changes.
  useEffect(() => {
    if (!mounted.current) return;
    AsyncStorage.setItem('pref_capo', JSON.stringify(capo)).catch(() => {});
  }, [capo]);

  const toggleTheme = useCallback(() => {
    setOverride(prev => prev === null ? !isDark : !prev);
  }, [isDark]);

  const toggleFlats = useCallback(() => {
    setUseFlats(prev => !prev);
  }, []);

  const toggleLeftHanded = useCallback(() => {
    setIsLeftHanded(prev => !prev);
  }, []);

  const value = useMemo(() => ({
    theme: isDark ? darkTheme : lightTheme,
    isDark,
    toggleTheme,
    useFlats,
    toggleFlats,
    isLeftHanded,
    toggleLeftHanded,
    capo,
    setCapo,
  }), [isDark, toggleTheme, useFlats, toggleFlats, isLeftHanded, toggleLeftHanded, capo]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
