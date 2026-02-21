// src/hooks/usePersistentState.ts
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function usePersistentState<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const [state, setState] = useState<T>(defaultValue);

  useEffect(() => {
    AsyncStorage.getItem(key).then(stored => {
      if (stored !== null) {
        try { setState(JSON.parse(stored)); } catch {}
      }
    });
  }, [key]);

  const setPersistent = (value: T) => {
    setState(value);
    AsyncStorage.setItem(key, JSON.stringify(value));
  };

  return [state, setPersistent];
}
