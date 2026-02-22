// src/screens/ArpeggiosScreen.tsx
import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { usePersistentState } from '../hooks/usePersistentState';
import { ChipPicker, SegmentedControl, FretboardViewer, RootPicker } from '../components';
import { ARP_TYPES } from '../engine/arpeggios';
import { getNotesOnFretboard } from '../engine/fretboard';
import { assignSweepOrder } from '../engine/fingers';

export function ArpeggiosScreen() {
  const { theme } = useTheme();
  const [root, setRoot] = usePersistentState<number>('arpeggios.root', 0);
  const [type, setType] = usePersistentState<string>('arpeggios.type', 'Major');
  const [display, setDisplay] = usePersistentState<string>('arpeggios.display', 'interval');

  const arpTypes = Object.keys(ARP_TYPES);
  const intervals = ARP_TYPES[type];

  const notes = useMemo(() => getNotesOnFretboard(root, intervals), [root, intervals]);

  const sweepNotes = useMemo(() => {
    const copied = notes.map(n => ({ ...n }));
    assignSweepOrder(copied);
    return copied;
  }, [notes]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgPrimary }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Arpeggios</Text>
        </View>

        <RootPicker root={root} onRootChange={(r) => setRoot(r)} />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Type</Text>
        <ChipPicker options={arpTypes} activeOption={type} onSelect={setType} />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Display</Text>
        <SegmentedControl options={['Interval', 'Note', 'Finger']} activeOption={display} onSelect={setDisplay} />
        <Text style={[styles.hint, { color: theme.textMuted }]}>
          {display.toLowerCase() === 'finger'
            ? 'Numbers show the order to play each note. Start at 1 and sweep across strings in one smooth stroke (sweep picking).'
            : 'An arpeggio is a chord played one note at a time. Switch to Finger view to see the sweep-picking order.'}
        </Text>

        <View style={styles.neckContainer}>
          <FretboardViewer
            notes={display.toLowerCase() === 'finger' ? sweepNotes : notes}
            displayMode={display.toLowerCase() as 'finger' | 'interval' | 'note'}
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
});
