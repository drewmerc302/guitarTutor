// src/components/RootPicker.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ChipPicker } from './ChipPicker';

// 7 natural positions → chromatic index (0-11)
export const NATURAL_INDICES = [0, 2, 4, 5, 7, 9, 11]; // C D E F G A B
export const NATURAL_NAMES   = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

// Sharp equivalents — E(4) and B(11) have no standard sharp, stay as-is
export const SHARP_NAMES   = ['C#', 'D#', 'E', 'F#', 'G#', 'A#', 'B'];
export const SHARP_INDICES = [1,    3,    4,   6,    8,    10,   11];

// Flat equivalents — C(0) and F(5) have no standard flat, stay as-is
export const FLAT_NAMES   = ['C', 'Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb'];
export const FLAT_INDICES = [0,   1,    3,    5,   6,    8,    10];

// Chromatic index → natural position (0-6)
export const ROOT_TO_NATURAL_POS = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6];

interface RootPickerProps {
  root: number;
  onRootChange: (root: number) => void;
  onDisplayNameChange?: (name: string) => void;
}

export function RootPicker({ root, onRootChange, onDisplayNameChange }: RootPickerProps) {
  const { theme } = useTheme();
  const [accidental, setAccidental] = useState<'sharp' | 'flat' | null>(null);

  const rootOptions = accidental === 'sharp' ? SHARP_NAMES
                    : accidental === 'flat'  ? FLAT_NAMES
                    : NATURAL_NAMES;
  const rootIndices = accidental === 'sharp' ? SHARP_INDICES
                    : accidental === 'flat'  ? FLAT_INDICES
                    : NATURAL_INDICES;
  const activeRootName = rootOptions[ROOT_TO_NATURAL_POS[root]];

  useEffect(() => {
    onDisplayNameChange?.(activeRootName);
  }, [activeRootName, onDisplayNameChange]);

  const handleAccidental = (kind: 'sharp' | 'flat') => {
    const next = accidental === kind ? null : kind;
    setAccidental(next);
    const pos = ROOT_TO_NATURAL_POS[root];
    const newRoot = next === 'sharp' ? SHARP_INDICES[pos]
                  : next === 'flat'  ? FLAT_INDICES[pos]
                  : NATURAL_INDICES[pos];
    onRootChange(newRoot);
  };

  return (
    <View>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Root</Text>
        <TouchableOpacity
          onPress={() => handleAccidental('sharp')}
          accessibilityLabel="Sharp"
          accessibilityRole="button"
          accessibilityState={{ selected: accidental === 'sharp' }}
          style={[styles.accidentalBtn, accidental === 'sharp' && { backgroundColor: theme.accent }]}
        >
          <Text style={[styles.accidentalText, { color: accidental === 'sharp' ? theme.dotText : theme.textSecondary }]}>♯</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleAccidental('flat')}
          accessibilityLabel="Flat"
          accessibilityRole="button"
          accessibilityState={{ selected: accidental === 'flat' }}
          style={[styles.accidentalBtn, accidental === 'flat' && { backgroundColor: theme.accent }]}
        >
          <Text style={[styles.accidentalText, { color: accidental === 'flat' ? theme.dotText : theme.textSecondary }]}>♭</Text>
        </TouchableOpacity>
      </View>
      <ChipPicker
        options={rootOptions}
        activeOption={activeRootName}
        onSelect={(name) => onRootChange(rootIndices[rootOptions.indexOf(name)])}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  accidentalBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  accidentalText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
