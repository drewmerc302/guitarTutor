// src/screens/ChordsScreen.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { FretboardViewer, RootPicker, ChordPreview } from '../components';
import { ChipPicker } from '../components/ChipPicker';
import { SegmentedControl } from '../components/SegmentedControl';
import { CHORD_TYPES, getChordVoicings, buildVoicingRegions, ChordVoicing } from '../engine/chords';
import { getNotesOnFretboard } from '../engine/fretboard';
import { assignFingers } from '../engine/fingers';
import { NATURAL_NAMES, ROOT_TO_NATURAL_POS } from '../components/RootPicker';
import { usePersistentState } from '../hooks/usePersistentState';

function getMinFret(voicing: ChordVoicing): number {
  let minFret = Infinity;
  for (const v of voicing) {
    if (v.f >= 0 && v.f < minFret) {
      minFret = v.f;
    }
  }
  return minFret === Infinity ? 0 : minFret;
}

function findClosestToNutIndex(voicings: ChordVoicing[]): number {
  let closestIndex = 0;
  let closestMinFret = Infinity;
  for (let i = 0; i < voicings.length; i++) {
    const minFret = getMinFret(voicings[i]);
    if (minFret < closestMinFret) {
      closestMinFret = minFret;
      closestIndex = i;
    }
  }
  return closestIndex;
}

export function ChordsScreen() {
  const { theme } = useTheme();
  const [root, setRoot] = usePersistentState<number>('chords.root', 0);
  const [type, setType] = usePersistentState<string>('chords.type', 'Major');
  const [display, setDisplay] = usePersistentState<string>('chords.display', 'interval');
  const [activeVoicingIndex, setActiveVoicingIndex] = useState(0);
  const [activeRootName, setActiveRootName] = useState(
    () => NATURAL_NAMES[ROOT_TO_NATURAL_POS[root]] ?? 'C'
  );

  const intervals = CHORD_TYPES[type];
  const allNotes = useMemo(() => getNotesOnFretboard(root, intervals), [root, intervals]);

  const voicings = useMemo(() => getChordVoicings(root, type), [root, type]);
  const voicingRegions = useMemo(() => buildVoicingRegions(voicings, root), [voicings, root]);

  // Default to voicing closest to nut
  const defaultVoicingIndex = useMemo(() => findClosestToNutIndex(voicings), [voicings]);
  useEffect(() => {
    setActiveVoicingIndex(defaultVoicingIndex);
  }, [defaultVoicingIndex]);

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
    if (display.toLowerCase() === 'finger' && activeVoicing) {
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
  }, [allNotes, display, activeVoicingSet, activeVoicing]);

  const handleRootChange = (newRoot: number) => {
    setRoot(newRoot);
    const newVoicings = getChordVoicings(newRoot, type);
    setActiveVoicingIndex(findClosestToNutIndex(newVoicings));
  };

  const handleTypeChange = (newType: string) => {
    setType(newType);
    const newVoicings = getChordVoicings(root, newType);
    setActiveVoicingIndex(findClosestToNutIndex(newVoicings));
  };

  const handleNotePress = (string: number, fret: number, isRoot: boolean) => {
    if (isRoot) {
      // First pass: exact match — find a voicing that contains this exact note position
      for (let i = 0; i < voicingRegions.length; i++) {
        if (voicingRegions[i].frets.has(`${string}-${fret}`)) {
          setActiveVoicingIndex(i);
          return;
        }
      }
      // Fallback: no voicing contains this note — switch to the voicing whose root note
      // is closest (by fret distance) to the tapped position
      let closestIdx = -1;
      let closestDist = Infinity;
      for (let i = 0; i < voicingRegions.length; i++) {
        const rf = voicingRegions[i].rootFret;
        if (rf) {
          const dist = Math.abs(rf.fret - fret);
          if (dist < closestDist) { closestDist = dist; closestIdx = i; }
        }
      }
      if (closestIdx >= 0) setActiveVoicingIndex(closestIdx);
    }
  };

  const chordTypes = Object.keys(CHORD_TYPES);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgPrimary }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Chords</Text>
        </View>

        <RootPicker
          root={root}
          onRootChange={handleRootChange}
          onDisplayNameChange={setActiveRootName}
        />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Type</Text>
        <ChipPicker options={chordTypes} activeOption={type} onSelect={handleTypeChange} />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Display</Text>
        <SegmentedControl options={['Finger', 'Interval', 'Note']} activeOption={display} onSelect={setDisplay} />

        <Text style={[styles.voicingHint, { color: theme.textMuted }]}>
          Tap a root to change voicings
        </Text>
        <View style={styles.neckContainer}>
          <FretboardViewer
            notes={displayNotes}
            displayMode={display.toLowerCase() as 'finger' | 'interval' | 'note'}
            activeVoicing={activeVoicingSet}
            hasVoicings={true}
            onNotePress={handleNotePress}
            barreFret={null}
          />
        </View>

        {activeVoicing && (
          <View style={styles.diagramContainer}>
            <Text style={[styles.diagramChordName, { color: theme.textSecondary }]}>
              {`${activeRootName} ${type}`}
            </Text>
            <ChordPreview
              voicing={activeVoicing}
              root={root}
              chordName={`${activeRootName} ${type}`}
            />
          </View>
        )}

        <Text style={[styles.voicingLabel, { color: theme.textMuted }]}>
          Voicing {activeVoicingIndex + 1}/{voicings.length}
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
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '700' },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 6,
  },
  voicingHint: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 4,
  },
  neckContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  voicingLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  diagramContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  diagramChordName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
});
