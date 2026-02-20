// src/screens/ProgressionsScreen.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Text as SvgText, G } from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';
import { getChordQualityColor } from '../theme/colors';
import { NotePicker, ChordDiagram } from '../components';
import { getDiatonicChords, CIRCLE_OF_FIFTHS } from '../engine/progressions';
import { getChordVoicings, ChordVoicing } from '../engine/chords';
import { NOTE_NAMES, NOTE_NAMES_FLAT } from '../engine/notes';

export function ProgressionsScreen() {
  const { theme, useFlats, isDark } = useTheme();
  const [root, setRoot] = useState(0);
  // Each entry is a diatonic chord index; duplicates allowed
  const [progression, setProgression] = useState<number[]>([]);

  const diatonicChords = useMemo(() => getDiatonicChords(root), [root]);

  // Always appends the chord index to the progression (allows duplicates)
  const appendChord = (index: number) => {
    setProgression(prev => [...prev, index]);
  };

  // Remove a chord at a specific position in the progression list
  const removeChordAtPos = (pos: number) => {
    setProgression(prev => prev.filter((_, i) => i !== pos));
  };

  const getVoicing = (chordRoot: number, quality: string): ChordVoicing | null => {
    const voicings = getChordVoicings(chordRoot, quality);
    if (voicings.length === 0) return null;
    const minFret = (v: ChordVoicing) =>
      Math.min(...v.filter(n => n.f >= 0).map(n => n.f));
    return voicings.reduce((best, v) => minFret(v) < minFret(best) ? v : best);
  };

  const { width: screenWidth } = useWindowDimensions();
  const svgSize = screenWidth - 32; // account for 16px padding on each side

  const renderCircleOfFifths = () => {
    // Use fixed viewBox coordinates; SVG scales to svgSize
    const cx = 150, cy = 150;
    // Three rings: outer (major), middle (relative minor), inner (leading-tone dim)
    const outerR = 120;
    const middleR = Math.round(outerR * 0.67); // ~80
    const innerR  = Math.round(outerR * 0.42); // ~50
    const notes = CIRCLE_OF_FIFTHS;

    const diatonicMap: Record<number, { numeral: string; quality: string }> = {};
    for (const chord of diatonicChords) {
      diatonicMap[chord.root] = { numeral: chord.numeral, quality: chord.quality };
    }

    return (
      <Svg width={svgSize} height={svgSize} viewBox="0 0 300 300">
        {/* Ring guide circles */}
        <Circle cx={cx} cy={cy} r={outerR}  fill="none" stroke={theme.border} strokeWidth={1} />
        <Circle cx={cx} cy={cy} r={middleR} fill="none" stroke={theme.border} strokeWidth={1} />
        <Circle cx={cx} cy={cy} r={innerR}  fill="none" stroke={theme.border} strokeWidth={1} />

        {notes.map((note, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const noteNames = useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES;

          // --- Outer ring: major key ---
          const ox = cx + outerR * Math.cos(angle);
          const oy = cy + outerR * Math.sin(angle);
          const isSelectedKey = note === root;
          const diatonic = diatonicMap[note];
          // Only Major diatonic chords (I, IV, V) get a quality colour
          const outerIsMajorDiatonic = diatonic && diatonic.quality === 'Major';
          const outerFill = outerIsMajorDiatonic
            ? getChordQualityColor('Major', isDark)
            : theme.bgTertiary;
          const outerTextColor = outerIsMajorDiatonic ? '#fff' : theme.textPrimary;

          // --- Middle ring: relative minor (vi of this major key) ---
          const relMinorRoot = (note + 9) % 12;
          const mx2 = cx + middleR * Math.cos(angle);
          const my2 = cy + middleR * Math.sin(angle);
          const relMinorName = noteNames[relMinorRoot] + 'm';
          const middleDiatonic = diatonicMap[relMinorRoot];
          const middleIsMinorDiatonic = middleDiatonic && middleDiatonic.quality === 'Minor';
          const middleFill = middleIsMinorDiatonic
            ? getChordQualityColor('Minor', isDark)
            : theme.bgTertiary;
          const middleTextColor = middleIsMinorDiatonic ? '#fff' : theme.textPrimary;

          // --- Inner ring: leading-tone diminished (vii° of this major key) ---
          const dimRoot = (note + 11) % 12;
          const ix = cx + innerR * Math.cos(angle);
          const iy = cy + innerR * Math.sin(angle);
          const dimName = noteNames[dimRoot] + '°';
          const innerDiatonic = diatonicMap[dimRoot];
          const innerIsDimDiatonic = innerDiatonic && innerDiatonic.quality === 'Dim';
          const innerFill = innerIsDimDiatonic
            ? getChordQualityColor('Dim', isDark)
            : theme.bgTertiary;
          const innerTextColor = innerIsDimDiatonic ? '#fff' : theme.textPrimary;

          return (
            <G key={i}>
              {/* Outer: major key node — tapping selects this key */}
              <G
                onPress={() => { setRoot(note); setProgression([]); }}
                accessibilityRole="button"
                accessibilityLabel={`Select ${noteNames[note]} as key`}
              >
                <Circle
                  cx={ox}
                  cy={oy}
                  r={17}
                  fill={outerFill}
                  stroke={isSelectedKey ? '#fff' : theme.border}
                  strokeWidth={isSelectedKey ? 2.5 : 1}
                />
                <SvgText
                  x={ox}
                  y={diatonic ? oy - 4 : oy}
                  fill={outerTextColor}
                  fontSize={diatonic ? 9 : 11}
                  fontWeight="600"
                  textAnchor="middle"
                  alignmentBaseline="central"
                >
                  {noteNames[note]}
                </SvgText>
                {diatonic && (
                  <SvgText
                    x={ox}
                    y={oy + 5}
                    fill={outerTextColor}
                    fontSize={7}
                    fontWeight="600"
                    textAnchor="middle"
                    alignmentBaseline="central"
                  >
                    {diatonic.numeral}
                  </SvgText>
                )}
              </G>

              {/* Middle: relative minor node */}
              <Circle
                cx={mx2}
                cy={my2}
                r={13}
                fill={middleFill}
                stroke={theme.border}
                strokeWidth={1}
              />
              <SvgText
                x={mx2}
                y={middleIsMinorDiatonic ? my2 - 4 : my2}
                fill={middleTextColor}
                fontSize={middleIsMinorDiatonic ? 7 : 8}
                fontWeight="600"
                textAnchor="middle"
                alignmentBaseline="central"
              >
                {relMinorName}
              </SvgText>
              {middleIsMinorDiatonic && (
                <SvgText
                  x={mx2}
                  y={my2 + 5}
                  fill={middleTextColor}
                  fontSize={6}
                  fontWeight="600"
                  textAnchor="middle"
                  alignmentBaseline="central"
                >
                  {middleDiatonic.numeral}
                </SvgText>
              )}

              {/* Inner: leading-tone diminished node */}
              <Circle
                cx={ix}
                cy={iy}
                r={10}
                fill={innerFill}
                stroke={theme.border}
                strokeWidth={1}
              />
              <SvgText
                x={ix}
                y={innerIsDimDiatonic ? iy - 3 : iy}
                fill={innerTextColor}
                fontSize={innerIsDimDiatonic ? 6 : 7}
                fontWeight="600"
                textAnchor="middle"
                alignmentBaseline="central"
              >
                {dimName}
              </SvgText>
              {innerIsDimDiatonic && (
                <SvgText
                  x={ix}
                  y={iy + 4}
                  fill={innerTextColor}
                  fontSize={5}
                  fontWeight="600"
                  textAnchor="middle"
                  alignmentBaseline="central"
                >
                  {innerDiatonic.numeral}
                </SvgText>
              )}
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
                onPress={() => appendChord(index)}
              >
                <Text style={[styles.numeralText, { color: isActive ? theme.accent : theme.textMuted }]}>
                  {chord.numeral}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.label, { color: theme.textSecondary }]}>Progression</Text>
        <View style={styles.progressionRow}>
          {progression.map((chordIndex, pos) => {
            const chord = diatonicChords[chordIndex];
            const voicing = getVoicing(chord.root, chord.quality);
            const noteName = (useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES)[chord.root];
            const qualitySuffix = chord.quality === 'Dim' ? '°' : chord.quality === 'Minor' ? 'm' : '';
            return (
              <TouchableOpacity
                key={pos}
                onPress={() => removeChordAtPos(pos)}
                style={[
                  styles.progressionCard,
                  {
                    backgroundColor: theme.bgSecondary,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Text style={[styles.progressionNumeral, { color: theme.textMuted }]}>
                  {chord.numeral}
                </Text>
                <Text style={[styles.progressionChordName, { color: theme.textPrimary }]}>
                  {noteName}{qualitySuffix}
                </Text>
                <ChordDiagram voicing={voicing} root={chord.root} />
              </TouchableOpacity>
            );
          })}

          {/* Placeholder: always shown at the end to hint that tapping a chord adds it */}
          <View style={[styles.progressionPlaceholder, { borderColor: theme.border }]}>
            <Text style={[styles.placeholderIcon, { color: theme.textMuted }]}>+</Text>
            <Text style={[styles.placeholderLabel, { color: theme.textMuted }]}>
              {progression.length === 0 ? 'Tap a diatonic above' : 'Add more'}
            </Text>
          </View>
        </View>


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
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '700' },
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  progressionCard: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  progressionPlaceholder: {
    width: 90,
    height: 128,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    gap: 4,
  },
  placeholderIcon: {
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
  },
  placeholderLabel: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
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
    width: '100%',
  },
});
