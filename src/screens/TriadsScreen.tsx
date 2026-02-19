// src/screens/TriadsScreen.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { NotePicker, Picker, DisplayToggle, StringGroupPicker, GuitarNeck } from '../components';
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgPrimary }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Triads</Text>

        <Text style={[styles.label, { color: theme.textSecondary }]}>Root</Text>
        <NotePicker activeNote={root} onSelect={setRoot} />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Type</Text>
        <Picker types={triadTypes} activeType={type} onSelect={setType} />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Strings</Text>
        <StringGroupPicker active={stringGroup} onSelect={setStringGroup} />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Inversion</Text>
        <Picker types={inversions} activeType={inversions[inversion]} onSelect={(v) => setInversion(inversions.indexOf(v))} />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Display</Text>
        <DisplayToggle modes={['Finger', 'Interval', 'Note']} activeMode={display} onSelect={setDisplay} />

        <View style={styles.neckContainer}>
          <GuitarNeck
            notes={displayNotes}
            displayMode={display as 'finger' | 'interval' | 'note'}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  neckContainer: { alignItems: 'center', marginTop: 24 },
});
