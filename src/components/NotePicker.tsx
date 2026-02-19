// src/components/NotePicker.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { NOTE_NAMES } from '../engine/notes';

interface NotePickerProps {
  activeNote: number;
  onSelect: (note: number) => void;
}

export function NotePicker({ activeNote, onSelect }: NotePickerProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {NOTE_NAMES.map((name, index) => (
        <TouchableOpacity
          key={name}
          style={[
            styles.button,
            {
              backgroundColor: index === activeNote ? theme.accent : theme.bgTertiary,
              borderColor: theme.border,
            },
          ]}
          onPress={() => onSelect(index)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.text,
              {
                color: index === activeNote ? theme.bgPrimary : theme.textPrimary,
              },
            ]}
          >
            {name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  button: {
    width: 52,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
});
