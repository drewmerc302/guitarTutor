// src/components/ScalePositionPicker.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
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
        onPress={() => {
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          onToggle('all');
        }}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="All positions"
        accessibilityState={{ selected: isAllActive }}
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
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              onToggle(key);
            }}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`${pos.label} position, frets ${pos.fretStart} to ${pos.fretEnd}`}
            accessibilityState={{ selected: isActive }}
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
  },
  button: {
    width: '33%',
    paddingHorizontal: 4,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 6,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});
