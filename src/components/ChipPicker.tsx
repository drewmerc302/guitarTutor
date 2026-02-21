import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

type ChipPickerProps =
  | {
      options: string[];
      activeOption: string;
      onSelect: (opt: string) => void;
      multiSelect?: never;
      activeOptions?: never;
      onToggle?: never;
    }
  | {
      options: string[];
      multiSelect: true;
      activeOptions: Set<string>;
      onToggle: (opt: string) => void;
      activeOption?: never;
      onSelect?: never;
    };

export function ChipPicker(props: ChipPickerProps) {
  const { theme } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {props.options.map((opt, i) => {
        const isActive = props.multiSelect
          ? props.activeOptions.has(opt)
          : opt === props.activeOption;
        const handlePress = props.multiSelect
          ? () => props.onToggle(opt)
          : () => props.onSelect(opt);

        return (
          <TouchableOpacity
            key={`${opt}-${i}`}
            onPress={handlePress}
            accessibilityLabel={opt}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            style={[
              styles.chip,
              isActive
                ? { backgroundColor: theme.accent }
                : { backgroundColor: theme.bgTertiary, borderWidth: 1, borderColor: theme.border },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: isActive ? theme.dotText : theme.textSecondary },
              ]}
            >
              {opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  chip: {
    height: 34,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});
