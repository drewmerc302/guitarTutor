// src/screens/ScalesScreen.tsx
import React, { useState, useMemo } from 'react';
import { usePersistentState } from '../hooks/usePersistentState';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { NotePicker, TypePicker, DisplayToggle, FretboardViewer, ScalePositionPicker } from '../components';
import { SCALE_TYPES, MODE_NAMES, applyModeRotation, computeScalePositions } from '../engine/scales';

export function ScalesScreen() {
  const { theme } = useTheme();
  const [root, setRoot] = usePersistentState<number>('scales.root', 0);
  const [type, setType] = usePersistentState<string>('scales.type', 'Major');
  const [mode, setMode] = usePersistentState<number>('scales.mode', 0);
  const [display, setDisplay] = usePersistentState<string>('scales.display', 'interval');
  const [activePositions, setActivePositions] = useState<Set<string>>(new Set(['all']));

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgPrimary }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Scales</Text>
        </View>

        <Text style={[styles.label, { color: theme.textSecondary }]}>Root</Text>
        <NotePicker activeNote={root} onSelect={setRoot} />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Type</Text>
        <TypePicker types={scaleTypes} activeType={type} onSelect={setType} />

        {is7Note && (
          <>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Mode</Text>
            <TypePicker types={MODE_NAMES} activeType={MODE_NAMES[mode]} onSelect={(m) => setMode(MODE_NAMES.indexOf(m))} />
          </>
        )}

        <Text style={[styles.label, { color: theme.textSecondary }]}>Display</Text>
        <DisplayToggle modes={['Interval', 'Note']} activeMode={display} onSelect={setDisplay} />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Position</Text>
        <ScalePositionPicker positions={positions} activeSet={activePositions} onToggle={handlePositionToggle} />

        <View style={styles.neckContainer}>
          <FretboardViewer
            notes={isAllActive ? positions.flatMap(p => p.notes) : Array.from(activePositions).flatMap(key => positions[parseInt(key)]?.notes || [])}
            displayMode={display as 'finger' | 'interval' | 'note'}
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
  label: { fontSize: 14, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  neckContainer: { alignItems: 'center', marginTop: 24 },
});
