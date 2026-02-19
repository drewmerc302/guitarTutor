// src/components/Picker.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface PickerProps {
  types: string[];
  activeType: string;
  onSelect: (type: string) => void;
}

export function Picker({ types, activeType, onSelect }: PickerProps) {
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
          onPress={() => onSelect(name)}
          activeOpacity={0.7}
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
