// src/screens/TriadsScreen.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { NotePicker, TypePicker, DisplayToggle, StringGroupPicker, FretboardViewer } from '../components';
import { TRIAD_TYPES, computeTriadPositions } from '../engine/triads';
import { assignFingers } from '../engine/fingers';

export function TriadsScreen() {
  const { theme } = useTheme();
  const [root, setRoot] = useState(0);
  const [type, setType] = useState('Major');
  const [stringGroup, setStringGroup] = useState('all');
  const [inversion, setInversion] = useState(0);
  const [display, setDisplay] = useState('interval');

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

  const displayNotes = useMemo(() => {
    if (display === 'finger') {
      const notesCopy = [...notes];
      assignFingers(notesCopy);
      return notesCopy;
    }
    return notes;
  }, [notes, display]);

  const inversions = ['Root', '1st Inv', '2nd Inv'];

  const boxHighlights = useMemo(() => {
    const frets = notes.map(n => n.fret).filter(f => f > 0);
    if (frets.length === 0) return [];
    const minFret = Math.min(...frets);
    const maxFret = Math.max(...frets);
    return [{ fretStart: minFret, fretEnd: maxFret }];
  }, [notes]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgPrimary }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Triads</Text>
        </View>

        <Text style={[styles.label, { color: theme.textSecondary }]}>Root</Text>
        <NotePicker activeNote={root} onSelect={setRoot} />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Type</Text>
        <TypePicker types={triadTypes} activeType={type} onSelect={setType} />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Strings</Text>
        <StringGroupPicker active={stringGroup} onSelect={setStringGroup} />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Inversion</Text>
        <TypePicker types={inversions} activeType={inversions[inversion]} onSelect={(v) => setInversion(inversions.indexOf(v))} />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Display</Text>
        <DisplayToggle modes={['Finger', 'Interval', 'Note']} activeMode={display} onSelect={setDisplay} />

        <View style={styles.neckContainer}>
          <FretboardViewer
            notes={displayNotes}
            displayMode={display as 'finger' | 'interval' | 'note'}
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
