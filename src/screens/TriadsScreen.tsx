// src/screens/TriadsScreen.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../theme/ThemeContext';
import { usePersistentState } from '../hooks/usePersistentState';
import { ChipPicker, SegmentedControl, FretboardViewer, RootPicker } from '../components';
import { TRIAD_TYPES, computeTriadPositions } from '../engine/triads';
import { assignFingers } from '../engine/fingers';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export function TriadsScreen() {
  const { theme } = useTheme();
  const [root, setRoot] = usePersistentState<number>('triads.root', 0);
  const [type, setType] = usePersistentState<string>('triads.type', 'Major');
  const [stringGroup, setStringGroup] = usePersistentState<string>('triads.stringGroup', 'all');
  const [inversion, setInversion] = useState(0);
  const [display, setDisplay] = usePersistentState<string>('triads.display', 'interval');
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const STRING_GROUP_OPTIONS = [
    { label: 'All strings', value: 'all' },
    { label: '1-2-3', value: '0,1,2' },
    { label: '2-3-4', value: '1,2,3' },
    { label: '3-4-5', value: '2,3,4' },
    { label: '4-5-6', value: '3,4,5' },
  ];
  const stringGroupLabel = STRING_GROUP_OPTIONS.find(g => g.value === stringGroup)?.label ?? 'All strings';

  const triadTypes = Object.keys(TRIAD_TYPES);

  const stringGroups = useMemo(() => {
    if (stringGroup === 'all') {
      return [[0, 1, 2], [1, 2, 3], [2, 3, 4], [3, 4, 5]];
    }
    const groups = stringGroup.split(',').map(s => parseInt(s));
    return [groups];
  }, [stringGroup]);

  const intervals = TRIAD_TYPES[type];

  const notes = useMemo(() => {
    return computeTriadPositions(root, intervals, stringGroups, inversion);
  }, [root, intervals, stringGroups, inversion]);

  // When a specific string group is selected, the engine may return multiple valid shapes
  // (e.g. A Major on strings 1-2-3 yields shapes at fret 2 and fret 14). Each shape is
  // exactly 3 consecutive notes in the flat array. Pick only the shape closest to the nut
  // so the view defaults near the nut, consistent with Chords voicing selection.
  const closestNotes = useMemo(() => {
    if (stringGroup === 'all' || notes.length === 0) return notes;
    let closestStart = 0;
    let closestMin = Infinity;
    for (let i = 0; i < notes.length; i += 3) {
      const nonZero = notes.slice(i, i + 3).map(n => n.fret).filter(f => f > 0);
      const min = nonZero.length > 0 ? Math.min(...nonZero) : 0;
      if (min < closestMin) { closestMin = min; closestStart = i; }
    }
    return notes.slice(closestStart, closestStart + 3);
  }, [notes, stringGroup]);

  const displayNotes = useMemo(() => {
    if (display.toLowerCase() === 'finger') {
      const notesCopy = [...notes];
      assignFingers(notesCopy);
      return notesCopy;
    }
    return notes;
  }, [notes, display]);

  const boxHighlights = useMemo(() => {
    // 'All Strings' shows all positions combined — don't force a scroll region
    if (stringGroup === 'all') return [];
    const frets = closestNotes.map(n => n.fret).filter(f => f > 0);
    // Edge case: notes exist but all at fret 0 — send sentinel to scroll to nut
    if (frets.length === 0) {
      return closestNotes.length > 0 ? [{ fretStart: 0, fretEnd: 0 }] : [];
    }
    return [{ fretStart: Math.min(...frets), fretEnd: Math.max(...frets) }];
  }, [closestNotes, stringGroup]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgPrimary }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Triads</Text>
        </View>

        <RootPicker root={root} onRootChange={(r) => setRoot(r)} />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Type</Text>
        <ChipPicker options={triadTypes} activeOption={type} onSelect={setType} />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Display</Text>
        <SegmentedControl options={['Finger', 'Interval', 'Note']} activeOption={display} onSelect={setDisplay} />

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

        {advancedOpen && (
          <>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Strings</Text>
            <ChipPicker
              options={STRING_GROUP_OPTIONS.map(g => g.label)}
              activeOption={stringGroupLabel}
              onSelect={(label) => setStringGroup(
                STRING_GROUP_OPTIONS.find(g => g.label === label)?.value ?? 'all'
              )}
            />

            <Text style={[styles.label, { color: theme.textSecondary }]}>Inversion</Text>
            <SegmentedControl
              options={['Root Pos', '1st Inv', '2nd Inv']}
              activeOption={['Root Pos', '1st Inv', '2nd Inv'][inversion]}
              onSelect={(v) => setInversion(['Root Pos', '1st Inv', '2nd Inv'].indexOf(v))}
            />
          </>
        )}

        <Text style={[styles.hint, { color: theme.textMuted }]}>
          A triad is a 3-note chord (root, 3rd, 5th) — the building block of all larger chords. Try different string groups and inversions to find the shape nearest to where you're already playing.
        </Text>

        <View style={styles.neckContainer}>
          <FretboardViewer
            notes={displayNotes}
            displayMode={display.toLowerCase() as 'finger' | 'interval' | 'note'}
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
  neckContainer: { alignItems: 'center', marginTop: 16 },
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
