// src/components/StringGroupPicker.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface StringGroupPickerProps {
  active: string;
  onSelect: (value: string) => void;
}

const STRING_GROUPS = [
  { label: 'All', value: 'all' },
  { label: '1-2-3', value: '0,1,2' },
  { label: '2-3-4', value: '1,2,3' },
  { label: '3-4-5', value: '2,3,4' },
  { label: '4-5-6', value: '3,4,5' },
];

export function StringGroupPicker({ active, onSelect }: StringGroupPickerProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {STRING_GROUPS.map((group) => (
        <TouchableOpacity
          key={group.value}
          style={[
            styles.button,
            {
              backgroundColor: group.value === active ? theme.accent : theme.bgTertiary,
              borderColor: theme.border,
            },
          ]}
          onPress={() => onSelect(group.value)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.text,
              {
                color: group.value === active ? theme.bgPrimary : theme.textPrimary,
              },
            ]}
          >
            {group.label}
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
    gap: 8,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
