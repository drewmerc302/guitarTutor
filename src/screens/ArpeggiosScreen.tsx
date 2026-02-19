// src/screens/ArpeggiosScreen.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { NotePicker, Picker, DisplayToggle, GuitarNeck } from '../components';
import { ARP_TYPES } from '../engine/arpeggios';
import { getNotesOnFretboard } from '../engine/fretboard';

export function ArpeggiosScreen() {
  const { theme } = useTheme();
  const [root, setRoot] = useState(0);
  const [type, setType] = useState('Major');
  const [display, setDisplay] = useState('interval');

  const arpTypes = Object.keys(ARP_TYPES);
  const intervals = ARP_TYPES[type];

  const notes = useMemo(() => getNotesOnFretboard(root, intervals), [root, intervals]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgPrimary }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Arpeggios</Text>

        <Text style={[styles.label, { color: theme.textSecondary }]}>Root</Text>
        <NotePicker activeNote={root} onSelect={setRoot} />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Type</Text>
        <Picker types={arpTypes} activeType={type} onSelect={setType} />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Display</Text>
        <DisplayToggle modes={['Interval', 'Note']} activeMode={display} onSelect={setDisplay} />

        <View style={styles.neckContainer}>
          <GuitarNeck
            notes={notes}
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
