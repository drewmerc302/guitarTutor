// src/screens/ChordsScreen.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { NotePicker, Picker, DisplayToggle, GuitarNeck } from '../components';
import { CHORD_TYPES, getChordVoicings, buildVoicingRegions } from '../engine/chords';
import { getNotesOnFretboard } from '../engine/fretboard';
import { assignFingers } from '../engine/fingers';
import { FretboardNote } from '../engine/fretboard';
import { NOTE_NAMES } from '../engine/notes';

export function ChordsScreen() {
  const { theme } = useTheme();
  const [root, setRoot] = useState(0);
  const [type, setType] = useState('Major');
  const [display, setDisplay] = useState('interval');
  const [activeVoicingIndex, setActiveVoicingIndex] = useState(0);

  const intervals = CHORD_TYPES[type];
  const allNotes = useMemo(() => getNotesOnFretboard(root, intervals), [root, intervals]);

  const voicings = useMemo(() => getChordVoicings(root, type), [root, type]);
  const voicingRegions = useMemo(() => buildVoicingRegions(voicings, root), [voicings, root]);

  const activeRegion = voicingRegions[activeVoicingIndex];
  const activeVoicing = activeRegion ? activeRegion.voicing : null;

  const activeVoicingSet = useMemo(() => {
    if (!activeVoicing) return new Set<string>();
    const set = new Set<string>();
    for (const v of activeVoicing) {
      if (v.f >= 0) {
        set.add(`${v.s}-${v.f}`);
      }
    }
    return set;
  }, [activeVoicing]);

  const displayNotes = useMemo(() => {
    if (display === 'finger' && activeVoicing) {
      const fingerNotes = allNotes.filter(n => activeVoicingSet.has(`${n.string}-${n.fret}`));
      assignFingers(fingerNotes);
      const fingerMap: Record<string, number> = {};
      for (const n of fingerNotes) {
        fingerMap[`${n.string}-${n.fret}`] = n.finger ?? 0;
      }
      return allNotes.map(n => ({
        ...n,
        finger: fingerMap[`${n.string}-${n.fret}`] ?? null,
      }));
    }
    return allNotes;
  }, [allNotes, display, activeVoicingSet]);

  const handleRootChange = (newRoot: number) => {
    setRoot(newRoot);
    setActiveVoicingIndex(0);
  };

  const handleNotePress = (string: number, fret: number, isRoot: boolean) => {
    if (isRoot) {
      for (let i = 0; i < voicingRegions.length; i++) {
        if (voicingRegions[i].frets.has(`${string}-${fret}`)) {
          setActiveVoicingIndex(i);
          break;
        }
      }
    }
  };

  const chordTypes = Object.keys(CHORD_TYPES);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgPrimary }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Chords</Text>

        <Text style={[styles.label, { color: theme.textSecondary }]}>Root</Text>
        <NotePicker activeNote={root} onSelect={handleRootChange} />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Type</Text>
        <Picker types={chordTypes} activeType={type} onSelect={setType} />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Display</Text>
        <DisplayToggle
          modes={['Finger', 'Interval', 'Note']}
          activeMode={display}
          onSelect={setDisplay}
        />

        <View style={styles.neckContainer}>
          <GuitarNeck
            notes={displayNotes}
            displayMode={display as 'finger' | 'interval' | 'note'}
            activeVoicing={activeVoicingSet}
            hasVoicings={true}
            onNotePress={handleNotePress}
          />
        </View>

        <Text style={[styles.voicingLabel, { color: theme.textSecondary }]}>
          Voicing: {NOTE_NAMES[root]} {type} ({activeVoicingIndex + 1}/{voicings.length})
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  neckContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  voicingLabel: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
});
