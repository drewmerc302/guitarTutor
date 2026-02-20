// src/screens/ChordsScreen.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { NotePicker, TypePicker, DisplayToggle, FretboardViewer } from '../components';
import { CHORD_TYPES, getChordVoicings, buildVoicingRegions, ChordVoicing } from '../engine/chords';
import { getNotesOnFretboard } from '../engine/fretboard';
import { assignFingers } from '../engine/fingers';
import { FretboardNote } from '../engine/fretboard';
import { NOTE_NAMES } from '../engine/notes';

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
  const [root, setRoot] = useState(0);
  const [type, setType] = useState('Major');
  const [display, setDisplay] = useState('interval');
  const [activeVoicingIndex, setActiveVoicingIndex] = useState(0);

  // Compare mode state
  const [compareMode, setCompareMode] = useState(false);
  const [rootB, setRootB] = useState(0);
  const [typeB, setTypeB] = useState('Major');

  // --- Chord A ---
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
  // Barre indicator disabled: too many false positives on non-barre chords.
  const activeBarreFret = null;

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

  // All chord-tone positions on the fretboard, used so every chord tone is fully
  // lit (not dimmed) regardless of which voicing is active (fixes 7th/Sus greyout).
  const allChordToneSet = useMemo(() => {
    const set = new Set<string>();
    for (const n of allNotes) {
      set.add(`${n.string}-${n.fret}`);
    }
    return set;
  }, [allNotes]);

  // --- Chord B (compare mode) ---
  const intervalsB = CHORD_TYPES[typeB];
  const allNotesB = useMemo(
    () => (compareMode ? getNotesOnFretboard(rootB, intervalsB) : []),
    [compareMode, rootB, intervalsB],
  );

  const voicingsB = useMemo(
    () => (compareMode ? getChordVoicings(rootB, typeB) : []),
    [compareMode, rootB, typeB],
  );
  const voicingRegionsB = useMemo(
    () => (compareMode ? buildVoicingRegions(voicingsB, rootB) : []),
    [compareMode, voicingsB, rootB],
  );

  const activeVoicingSetB = useMemo(() => {
    if (!compareMode) return new Set<string>();
    const regionB = voicingRegionsB[0];
    if (!regionB) return new Set<string>();
    const set = new Set<string>();
    for (const v of regionB.voicing) {
      if (v.f >= 0) {
        set.add(`${v.s}-${v.f}`);
      }
    }
    return set;
  }, [compareMode, voicingRegionsB]);

  // --- Display notes (non-compare path) ---
  const displayNotes = useMemo(() => {
    if (compareMode) return []; // handled separately below
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
  }, [allNotes, display, activeVoicingSet, compareMode, activeVoicing]);

  // --- Compare mode: union of notes A and B + color overrides ---
  const { compareNotes, noteColorOverrides } = useMemo(() => {
    if (!compareMode) return { compareNotes: [] as FretboardNote[], noteColorOverrides: undefined };

    // Build a map keyed by "string-fret" containing the note to display.
    // Notes that appear in both chords are represented by the Chord A note entry
    // (interval labels etc. come from Chord A's perspective).
    const noteMap = new Map<string, FretboardNote>();

    for (const n of allNotes) {
      noteMap.set(`${n.string}-${n.fret}`, n);
    }
    for (const n of allNotesB) {
      const key = `${n.string}-${n.fret}`;
      if (!noteMap.has(key)) {
        noteMap.set(key, n);
      }
    }

    const overrides: Record<string, string> = {};

    // Keys only in B get orange; keys in both A and B get green.
    // Keys only in A keep their default color (no entry in overrides).
    for (const key of activeVoicingSetB) {
      if (activeVoicingSet.has(key)) {
        overrides[key] = '#4CAF50'; // shared / pivot — green
      } else {
        overrides[key] = '#FF9800'; // destination — orange
      }
    }
    // Keys only in A: no override entry, getNoteColor used by GuitarNeck.

    return {
      compareNotes: Array.from(noteMap.values()),
      noteColorOverrides: overrides,
    };
  }, [compareMode, allNotes, allNotesB, activeVoicingSet, activeVoicingSetB]);

  // The combined voicing set shown as "active" in compare mode is A ∪ B.
  const compareActiveVoicingSet = useMemo(() => {
    if (!compareMode) return activeVoicingSet;
    const combined = new Set<string>(activeVoicingSet);
    for (const key of activeVoicingSetB) {
      combined.add(key);
    }
    return combined;
  }, [compareMode, activeVoicingSet, activeVoicingSetB]);

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
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Chords</Text>
        </View>

        <Text style={[styles.label, { color: theme.textSecondary }]}>Root</Text>
        <NotePicker activeNote={root} onSelect={handleRootChange} />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Type</Text>
        <TypePicker types={chordTypes} activeType={type} onSelect={handleTypeChange} />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Display</Text>
        <DisplayToggle
          modes={['Finger', 'Interval', 'Note']}
          activeMode={display}
          onSelect={setDisplay}
        />

        {/* Compare toggle */}
        <TouchableOpacity
          style={[
            styles.compareButton,
            {
              backgroundColor: compareMode ? theme.accent : theme.bgTertiary,
              borderColor: theme.border,
            },
          ]}
          onPress={() => setCompareMode(prev => !prev)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Toggle chord comparison mode"
          accessibilityState={{ selected: compareMode }}
        >
          <Text
            style={[
              styles.compareButtonText,
              { color: compareMode ? theme.bgPrimary : theme.textPrimary },
            ]}
          >
            {compareMode ? 'Compare: On' : 'Compare'}
          </Text>
        </TouchableOpacity>

        {/* Chord B pickers (only visible in compare mode) */}
        {compareMode && (
          <View style={styles.chordBContainer}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Chord B — Root</Text>
            <NotePicker activeNote={rootB} onSelect={setRootB} />
            <Text style={[styles.label, { color: theme.textSecondary }]}>Chord B — Type</Text>
            <TypePicker types={chordTypes} activeType={typeB} onSelect={setTypeB} />

            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
                <Text style={[styles.legendText, { color: theme.textSecondary }]}>Shared fingers</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#FF9800' }]} />
                <Text style={[styles.legendText, { color: theme.textSecondary }]}>Chord B fingers</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.neckContainer}>
          <FretboardViewer
            notes={compareMode ? compareNotes : displayNotes}
            displayMode={display as 'finger' | 'interval' | 'note'}
            activeVoicing={compareActiveVoicingSet}
            hasVoicings={true}
            activeNoteSet={compareMode ? undefined : allChordToneSet}
            onNotePress={compareMode ? undefined : handleNotePress}
            noteColorOverrides={compareMode ? noteColorOverrides : undefined}
            barreFret={compareMode ? null : activeBarreFret}
          />
        </View>

        {compareMode ? (
          <Text style={[styles.voicingLabel, { color: theme.textSecondary }]}>
            {NOTE_NAMES[root]} {type} vs {NOTE_NAMES[rootB]} {typeB}
          </Text>
        ) : (
          <Text style={[styles.voicingLabel, { color: theme.textSecondary }]}>
            Voicing: {NOTE_NAMES[root]} {type} ({activeVoicingIndex + 1}/{voicings.length})
          </Text>
        )}
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
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  compareButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  compareButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chordBContainer: {
    marginTop: 8,
  },
  legend: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
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
