// src/components/DisplayToggle.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface DisplayToggleProps {
  modes: string[];
  activeMode: string;
  onSelect: (mode: string) => void;
}

export function DisplayToggle({ modes, activeMode, onSelect }: DisplayToggleProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {modes.map((mode) => (
        <TouchableOpacity
          key={mode}
          style={[
            styles.button,
            {
              backgroundColor: mode.toLowerCase() === activeMode ? theme.accent : theme.bgTertiary,
              borderColor: theme.border,
            },
          ]}
          onPress={() => onSelect(mode.toLowerCase())}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.text,
              {
                color: mode.toLowerCase() === activeMode ? theme.bgPrimary : theme.textPrimary,
              },
            ]}
          >
            {mode}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 0,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
});
