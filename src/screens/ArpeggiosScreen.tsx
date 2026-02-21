// src/screens/ArpeggiosScreen.tsx
import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { usePersistentState } from '../hooks/usePersistentState';
import { NotePicker, TypePicker, DisplayToggle, FretboardViewer } from '../components';
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

        <Text style={[styles.label, { color: theme.textSecondary }]}>Root</Text>
        <NotePicker activeNote={root} onSelect={setRoot} />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Type</Text>
        <TypePicker types={arpTypes} activeType={type} onSelect={setType} />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Display</Text>
        <DisplayToggle modes={['Interval', 'Note', 'Finger']} activeMode={display} onSelect={setDisplay} />

        <View style={styles.neckContainer}>
          <FretboardViewer
            notes={display === 'finger' ? sweepNotes : notes}
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
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '700' },
  label: { fontSize: 14, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  neckContainer: { alignItems: 'center', marginTop: 24 },
});
