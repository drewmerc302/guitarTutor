// src/components/NotePicker.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeContext';
import { NOTE_NAMES, NOTE_NAMES_FLAT } from '../engine/notes';

interface NotePickerProps {
  activeNote: number;
  onSelect: (note: number) => void;
}

export function NotePicker({ activeNote, onSelect }: NotePickerProps) {
  const { theme, useFlats } = useTheme();
  const names = useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES;

  return (
    <View style={styles.container}>
      {names.map((name, index) => (
        <TouchableOpacity
          key={name}
          style={[
            styles.button,
            {
              backgroundColor: index === activeNote ? theme.accent : theme.bgTertiary,
              borderColor: theme.border,
            },
          ]}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            onSelect(index);
          }}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={name}
          accessibilityState={{ selected: index === activeNote }}
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
