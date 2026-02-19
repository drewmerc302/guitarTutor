// src/components/ScalePositionPicker.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ScalePosition } from '../engine/scales';

interface ScalePositionPickerProps {
  positions: ScalePosition[];
  activeSet: Set<string>;
  onToggle: (key: string) => void;
}

export function ScalePositionPicker({ positions, activeSet, onToggle }: ScalePositionPickerProps) {
  const { theme } = useTheme();

  const isAllActive = activeSet.has('all');

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: isAllActive ? theme.accent : theme.bgTertiary,
            borderColor: theme.border,
          },
        ]}
        onPress={() => onToggle('all')}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.text,
            {
              color: isAllActive ? theme.bgPrimary : theme.textPrimary,
            },
          ]}
        >
          All
        </Text>
      </TouchableOpacity>

      {positions.map((pos, i) => {
        const key = String(i);
        const isActive = activeSet.has(key);
        return (
          <TouchableOpacity
            key={key}
            style={[
              styles.button,
              {
                backgroundColor: isActive ? theme.accent : theme.bgTertiary,
                borderColor: theme.border,
              },
            ]}
            onPress={() => onToggle(key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.text,
                {
                  color: isActive ? theme.bgPrimary : theme.textPrimary,
                },
              ]}
            >
              {pos.label} ({pos.fretStart}-{pos.fretEnd})
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});
