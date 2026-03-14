// src/screens/ProgressionsScreen.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions, LayoutAnimation } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Text as SvgText, G } from 'react-native-svg';
import { usePersistentState } from '../hooks/usePersistentState';
import { useTheme } from '../theme/ThemeContext';
import { getChordQualityColor } from '../theme/colors';
import { ChordDiagram } from '../components';
import { getDiatonicChords, CIRCLE_OF_FIFTHS } from '../engine/progressions';
import { getChordVoicings, ChordVoicing } from '../engine/chords';
import { NOTE_NAMES, NOTE_NAMES_FLAT } from '../engine/notes';

const NATURAL_KEYS: { label: string; pc: number }[] = [
  { label: 'C', pc: 0 }, { label: 'D', pc: 2 }, { label: 'E', pc: 4 },
  { label: 'F', pc: 5 }, { label: 'G', pc: 7 }, { label: 'A', pc: 9 },
  { label: 'B', pc: 11 },
];

const ACCIDENTAL_SLOTS: ({ pc: number } | null)[] = [
  { pc: 1 }, { pc: 3 }, null, { pc: 6 }, { pc: 8 }, { pc: 10 }, null,
];

export function ProgressionsScreen() {
  const { theme, useFlats, isDark } = useTheme();
  const [root, setRoot] = usePersistentState<number>('progressions.root', 0);
  // Each entry is a diatonic chord index; duplicates allowed
  const [progression, setProgression] = useState<number[]>([]);
  const [naturalRowWidth, setNaturalRowWidth] = useState(0);
  const slotWidth = naturalRowWidth > 0 ? naturalRowWidth / 7 : 0;

  const diatonicChords = useMemo(() => getDiatonicChords(root), [root]);

  // Called when the user taps a note on the Circle of Fifths to change the key
  const handleKeySelect = (note: number) => {
    setRoot(note);
    setProgression([]);
  };

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
                onPress={() => handleKeySelect(note)}
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

        {/* Piano key picker */}
        <View style={[styles.keyCard, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}>
          <View
            style={styles.naturalsRow}
            onLayout={(e) => setNaturalRowWidth(e.nativeEvent.layout.width)}
          >
            {NATURAL_KEYS.map(({ label, pc }) => (
              <TouchableOpacity
                key={pc}
                testID={`key-natural-${pc}`}
                style={[
                  styles.keyChip,
                  {
                    backgroundColor: root === pc ? theme.accent : theme.bgTertiary,
                    borderColor: root === pc ? theme.accent : theme.border,
                  },
                ]}
                onPress={() => handleKeySelect(pc)}
              >
                <Text style={[styles.keyChipText, { color: root === pc ? '#fff' : theme.textPrimary }]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View
            style={[
              styles.accidentalsRow,
              { marginLeft: slotWidth / 2, opacity: naturalRowWidth > 0 ? 1 : 0 },
            ]}
          >
            {ACCIDENTAL_SLOTS.map((slot, i) =>
              !slot ? (
                <View key={`gap-${i}`} style={styles.keySlot} />
              ) : (
                <TouchableOpacity
                  key={slot.pc}
                  testID={`key-accidental-${slot.pc}`}
                  style={[
                    styles.keyChip,
                    {
                      backgroundColor: root === slot.pc ? theme.accent : theme.bgTertiary,
                      borderColor: root === slot.pc ? theme.accent : theme.border,
                    },
                  ]}
                  onPress={() => handleKeySelect(slot.pc)}
                >
                  <Text style={[styles.keyChipText, { color: root === slot.pc ? '#fff' : theme.textPrimary }]}>
                    {(useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES)[slot.pc]}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          {'Chords in key of ' + (useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES)[root]}
        </Text>
        <View style={styles.numeralRow}>
          {diatonicChords.map((chord, index) => {
            const isActive = progression.includes(index);
            return (
              <TouchableOpacity
                key={index}
                testID="diatonic-btn"
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
                <Text style={[styles.numeralChordName, { color: isActive ? theme.textPrimary : theme.textSecondary }]}>
                  {(useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES)[chord.root]}{chord.quality === 'Minor' ? 'm' : chord.quality === 'Dim' ? '°' : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.label, { color: theme.textSecondary }]}>Progression</Text>
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.progressionRow}
        >
          {progression.map((chordIndex, pos) => {
            const chord = diatonicChords[chordIndex];
            const voicing = getVoicing(chord.root, chord.quality);
            const noteName = (useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES)[chord.root];
            const qualitySuffix = chord.quality === 'Dim' ? '°' : chord.quality === 'Minor' ? 'm' : '';
            return (
              <TouchableOpacity
                key={pos}
                testID="progression-card"
                style={[
                  styles.progressionCard,
                  { backgroundColor: theme.bgSecondary, borderColor: theme.border },
                ]}
              >
                <TouchableOpacity
                  testID={`remove-chord-${pos}`}
                  style={styles.removeBtn}
                  hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                  accessibilityLabel={`Remove ${noteName}${qualitySuffix}`}
                  onPress={() => removeChordAtPos(pos)}
                >
                  <Text style={[styles.removeBtnText, { color: theme.textMuted }]}>✕</Text>
                </TouchableOpacity>
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
          <View style={[styles.progressionPlaceholder, { borderColor: theme.border }]}>
            <Text style={[styles.placeholderIcon, { color: theme.textMuted }]}>+</Text>
            <Text style={[styles.placeholderLabel, { color: theme.textMuted }]}>
              {progression.length === 0 ? 'Tap a chord above' : 'Add more'}
            </Text>
          </View>
        </ScrollView>


        <Text style={[styles.label, { color: theme.textSecondary }]}>Circle of Fifths</Text>
        <Text style={[styles.hint, { color: theme.textMuted }]}>Tap the circle to change key</Text>
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
  label: { fontSize: 12, fontWeight: '600', marginTop: 20, marginBottom: 6 },
  hint: { fontSize: 12, marginBottom: 8 },
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
  numeralChordName: {
    fontSize: 9,
    fontWeight: '500',
    marginTop: 2,
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
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  removeBtnText: {
    fontSize: 12,
    fontWeight: '300',
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
  keyCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    marginBottom: 12,
  },
  naturalsRow: {
    flexDirection: 'row',
    gap: 3,
    marginBottom: 3,
  },
  accidentalsRow: {
    flexDirection: 'row',
    gap: 3,
  },
  keySlot: {
    flex: 1,
  },
  keyChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1,
  },
  keyChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
