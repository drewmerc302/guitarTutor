// src/components/TypePicker.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeContext';

interface TypePickerProps {
  types: string[];
  activeType: string;
  onSelect: (type: string) => void;
}

export function TypePicker({ types, activeType, onSelect }: TypePickerProps) {
  const { theme } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {types.map((name) => (
        <TouchableOpacity
          key={name}
          style={[
            styles.button,
            {
              backgroundColor: name === activeType ? theme.accent : theme.bgTertiary,
              borderColor: theme.border,
            },
          ]}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            onSelect(name);
          }}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={name}
          accessibilityState={{ selected: name === activeType }}
        >
          <Text
            style={[
              styles.text,
              {
                color: name === activeType ? theme.bgPrimary : theme.textPrimary,
              },
            ]}
          >
            {name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
});
