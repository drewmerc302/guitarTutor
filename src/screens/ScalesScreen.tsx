// src/screens/ScalesScreen.tsx
import React, { useState, useMemo } from 'react';
import { usePersistentState } from '../hooks/usePersistentState';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { ChipPicker, SegmentedControl, FretboardViewer, RootPicker } from '../components';
import { SCALE_TYPES, MODE_NAMES, applyModeRotation, computeScalePositions } from '../engine/scales';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export function ScalesScreen() {
  const { theme } = useTheme();
  const [root, setRoot] = usePersistentState<number>('scales.root', 0);
  const [type, setType] = usePersistentState<string>('scales.type', 'Major');
  const [mode, setMode] = usePersistentState<number>('scales.mode', 0);
  const [display, setDisplay] = usePersistentState<string>('scales.display', 'interval');
  const [activePositions, setActivePositions] = useState<Set<string>>(new Set(['all']));
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const scaleTypes = Object.keys(SCALE_TYPES);
  const is7Note = SCALE_TYPES[type]?.length === 7;

  const intervals = SCALE_TYPES[type] || [0, 2, 4, 5, 7, 9, 11];
  const rotatedIntervals = useMemo(() => {
    return is7Note ? applyModeRotation(intervals, mode) : intervals;
  }, [intervals, mode, is7Note]);

  const positions = useMemo(() => computeScalePositions(root, rotatedIntervals), [root, rotatedIntervals]);

  const isAllActive = activePositions.has('all');

  const activeNoteSet = useMemo(() => {
    if (isAllActive) return null;
    const set = new Set<string>();
    for (const key of activePositions) {
      const idx = parseInt(key);
      if (positions[idx]) {
        for (const note of positions[idx].notes) {
          set.add(`${note.string}-${note.fret}`);
        }
      }
    }
    return set;
  }, [activePositions, positions, isAllActive]);

  const boxHighlights = useMemo(() => {
    if (isAllActive) return [];
    return activePositions.size > 0
      ? Array.from(activePositions).map(key => positions[parseInt(key)]).filter(Boolean).map(p => ({
          fretStart: p.fretStart,
          fretEnd: p.fretEnd,
        }))
      : [];
  }, [activePositions, positions, isAllActive]);

  const handlePositionToggle = (key: string) => {
    setActivePositions(prev => {
      const next = new Set(prev);
      if (key === 'all') {
        if (next.has('all')) return next;
        return new Set(['all']);
      } else {
        const nextWithoutAll = new Set(Array.from(next).filter(k => k !== 'all'));
        if (nextWithoutAll.has(key)) {
          nextWithoutAll.delete(key);
          return nextWithoutAll.size === 0 ? new Set(['all']) : nextWithoutAll;
        } else {
          nextWithoutAll.add(key);
          return nextWithoutAll;
        }
      }
    });
  };

  const positionOptions = useMemo(() => {
    return ['All', ...positions.map((_, i) => `Pos ${i + 1}`)];
  }, [positions]);

  const activeChipOptions = useMemo((): Set<string> => {
    if (activePositions.has('all')) return new Set(['All']);
    return new Set(Array.from(activePositions).map(k => `Pos ${parseInt(k) + 1}`));
  }, [activePositions]);

  const handlePositionChipToggle = (opt: string) => {
    if (opt === 'All') {
      handlePositionToggle('all');
    } else {
      const idx = positionOptions.indexOf(opt) - 1; // -1 for 'All' at index 0
      handlePositionToggle(String(idx));
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgPrimary }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Scales</Text>
        </View>

        <RootPicker root={root} onRootChange={(r) => setRoot(r)} />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Type</Text>
        <ChipPicker options={scaleTypes} activeOption={type} onSelect={setType} />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Display</Text>
        <SegmentedControl options={['Interval', 'Note']} activeOption={display} onSelect={setDisplay} />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Position</Text>
        <ChipPicker
          multiSelect
          options={positionOptions}
          activeOptions={activeChipOptions}
          onToggle={handlePositionChipToggle}
        />
        <Text style={[styles.hint, { color: theme.textMuted }]}>
          A box is a scale pattern that fits within a small section of the neck. Select a numbered box to focus on that region — tap multiple to compare them side by side.
        </Text>

        <TouchableOpacity
          style={[styles.advancedToggle, { backgroundColor: theme.bgTertiary }]}
          onPress={() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setAdvancedOpen(v => !v);
          }}
          accessibilityLabel="Toggle advanced options"
        >
          <Text style={[styles.advancedLabel, { color: theme.textSecondary }]}>Advanced</Text>
          <MaterialCommunityIcons
            name={advancedOpen ? 'chevron-down' : 'chevron-right'}
            size={18}
            color={theme.textMuted}
          />
        </TouchableOpacity>

        {advancedOpen && is7Note && (
          <>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Mode</Text>
            <ChipPicker
              options={MODE_NAMES}
              activeOption={MODE_NAMES[mode]}
              onSelect={(m) => setMode(MODE_NAMES.indexOf(m))}
            />
          </>
        )}

        <View style={styles.neckContainer}>
          <FretboardViewer
            notes={isAllActive ? positions.flatMap(p => p.notes) : Array.from(activePositions).flatMap(key => positions[parseInt(key)]?.notes || [])}
            displayMode={display.toLowerCase() as 'finger' | 'interval' | 'note'}
            activeNoteSet={activeNoteSet}
            boxHighlights={boxHighlights}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '700' },
  label: { fontSize: 12, fontWeight: '600', marginTop: 20, marginBottom: 6 },
  neckContainer: { alignItems: 'center', marginTop: 24 },
  hint: { fontSize: 12, lineHeight: 17, marginTop: 10 },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  advancedLabel: { fontSize: 14, fontWeight: '600' },
});
