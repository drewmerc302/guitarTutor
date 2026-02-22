import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface SegmentedControlProps {
  options: string[];
  activeOption: string;
  onSelect: (option: string) => void;
  style?: ViewStyle;
  minWidth?: number;
}

export function SegmentedControl({ options, activeOption, onSelect, style, minWidth }: SegmentedControlProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { borderColor: theme.border }, minWidth ? { width: minWidth } : null, style]}>
      {options.map((opt, i) => {
        const isActive = opt === activeOption;
        return (
          <TouchableOpacity
            key={`${opt}-${i}`}
            onPress={() => onSelect(opt)}
            style={[
              styles.segment,
              minWidth ? { width: minWidth / options.length } : null,
              i < options.length - 1 && [styles.segmentBorder, { borderRightColor: theme.border }],
              { backgroundColor: isActive ? theme.accent : theme.bgTertiary },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={opt}
          >
            <Text
              style={[
                styles.label,
                { color: isActive ? theme.dotText : theme.textPrimary },
              ]}
            >
              {opt}
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
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    height: 36,
    width: '100%',
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBorder: {
    borderRightWidth: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});
