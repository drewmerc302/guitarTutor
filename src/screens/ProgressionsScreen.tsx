// src/screens/ProgressionsScreen.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Text as SvgText, G } from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';
import { getChordQualityColor } from '../theme/colors';
import { NotePicker, ChordDiagram } from '../components';
import { getDiatonicChords, CIRCLE_OF_FIFTHS } from '../engine/progressions';
import { getChordVoicings, ChordVoicing } from '../engine/chords';
import { NOTE_NAMES, NOTE_NAMES_FLAT } from '../engine/notes';
import { useFavorites } from '../hooks/useFavorites';

export function ProgressionsScreen() {
  const { theme, useFlats, isDark } = useTheme();
  const { addFavorite, isFavorite } = useFavorites();
  const [root, setRoot] = useState(0);
  const bookmarked = isFavorite('Progressions', root);
  const [progression, setProgression] = useState<number[]>([]);

  const diatonicChords = useMemo(() => getDiatonicChords(root), [root]);

  const toggleChord = (index: number) => {
    setProgression(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const getVoicing = (chordRoot: number, quality: string): ChordVoicing | null => {
    const voicings = getChordVoicings(chordRoot, quality);
    return voicings.length > 0 ? voicings[0] : null;
  };

  const renderCircleOfFifths = () => {
    const cx = 150, cy = 150, r = 100;
    const notes = CIRCLE_OF_FIFTHS;

    return (
      <Svg width={300} height={300} viewBox="0 0 300 300">
        <Circle cx={cx} cy={cy} r={r} fill="none" stroke={theme.border} strokeWidth={1} />
        {notes.map((note, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          const isActive = note === root;
          return (
            <G
              key={i}
              onPress={() => { setRoot(note); setProgression([]); }}
              accessibilityRole="button"
              accessibilityLabel={`Select ${(useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES)[note]} as key`}
            >
              <Circle
                cx={x}
                cy={y}
                r={15}
                fill={isActive ? theme.accent : theme.bgTertiary}
                stroke={theme.border}
                strokeWidth={1}
              />
              <SvgText
                x={x}
                y={y}
                fill={isActive ? theme.bgPrimary : theme.textPrimary}
                fontSize={12}
                fontWeight="600"
                textAnchor="middle"
                alignmentBaseline="central"
              >
                {(useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES)[note]}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgPrimary }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Progressions</Text>
          <TouchableOpacity
            onPress={() => addFavorite({ tab: 'Progressions', root })}
            accessibilityRole="button"
            accessibilityLabel={bookmarked ? 'Already saved' : 'Save to favorites'}
          >
            <Text style={[styles.bookmark, { color: bookmarked ? theme.accent : theme.textMuted }]}>
              {bookmarked ? '♥' : '♡'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { color: theme.textSecondary }]}>Key</Text>
        <NotePicker activeNote={root} onSelect={(note) => { setRoot(note); setProgression([]); }} />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Diatonic Chords</Text>
        <View style={styles.numeralRow}>
          {diatonicChords.map((chord, index) => {
            const isActive = progression.includes(index);
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.numeralButton,
                  {
                    backgroundColor: isActive ? theme.bgElevated : theme.bgSecondary,
                    borderColor: isActive ? theme.accent : theme.border,
                    borderBottomColor: getChordQualityColor(chord.quality, isDark),
                  },
                ]}
                onPress={() => toggleChord(index)}
              >
                <Text style={[styles.numeralText, { color: isActive ? theme.accent : theme.textMuted }]}>
                  {chord.numeral}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {progression.length > 0 && (
          <>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Progression</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.progressionRow}
            >
              {progression.map((chordIndex, pos) => {
                const chord = diatonicChords[chordIndex];
                const voicing = getVoicing(chord.root, chord.quality);
                const noteName = (useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES)[chord.root];
                const qualitySuffix = chord.quality === 'Dim' ? '°' : chord.quality === 'Minor' ? 'm' : '';
                return (
                  <View
                    key={pos}
                    style={[styles.progressionCard, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}
                  >
                    <Text style={[styles.progressionNumeral, { color: theme.textMuted }]}>
                      {chord.numeral}
                    </Text>
                    <Text style={[styles.progressionChordName, { color: theme.textPrimary }]}>
                      {noteName}{qualitySuffix}
                    </Text>
                    <ChordDiagram voicing={voicing} root={chord.root} />
                  </View>
                );
              })}
            </ScrollView>
          </>
        )}

        <Text style={[styles.label, { color: theme.textSecondary }]}>Circle of Fifths</Text>
        <View style={styles.circleContainer}>
          {renderCircleOfFifths()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '700' },
  bookmark: { fontSize: 28, paddingHorizontal: 4 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  numeralRow: {
    flexDirection: 'row',
    gap: 4,
  },
  numeralButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderBottomWidth: 3,
    alignItems: 'center',
  },
  numeralText: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressionRow: {
    gap: 8,
    paddingBottom: 4,
  },
  progressionCard: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  progressionNumeral: {
    fontSize: 10,
    fontWeight: '600',
  },
  progressionChordName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  circleContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
});
