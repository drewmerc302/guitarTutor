// src/screens/ProgressionsScreen.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Text as SvgText, G } from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';
import { NotePicker, ChordPreview } from '../components';
import { getDiatonicChords, CIRCLE_OF_FIFTHS } from '../engine/progressions';
import { generateBarreVoicings, generateMinorBarreVoicings, ChordVoicing } from '../engine/chords';
import { NOTE_NAMES } from '../engine/notes';

export function ProgressionsScreen() {
  const { theme } = useTheme();
  const [root, setRoot] = useState(0);
  const [activeChords, setActiveChords] = useState<Set<number>>(new Set());

  const diatonicChords = useMemo(() => getDiatonicChords(root), [root]);

  const toggleChord = (index: number) => {
    setActiveChords(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const getVoicing = (quality: string): ChordVoicing | null => {
    if (quality === 'Major') {
      return generateBarreVoicings(root)[0];
    } else if (quality === 'Minor') {
      return generateMinorBarreVoicings(root)[0];
    }
    return generateBarreVoicings(root)[0];
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
            <G key={i}>
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
                {NOTE_NAMES[note]}
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
        <Text style={[styles.title, { color: theme.textPrimary }]}>Progressions</Text>

        <Text style={[styles.label, { color: theme.textSecondary }]}>Key</Text>
        <NotePicker activeNote={root} onSelect={setRoot} />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Diatonic Chords</Text>
        <View style={styles.chordsContainer}>
          {diatonicChords.map((chord, index) => {
            const isActive = activeChords.has(index);
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.chordCard,
                  {
                    backgroundColor: isActive ? theme.bgElevated : theme.bgSecondary,
                    borderColor: theme.border,
                  },
                ]}
                onPress={() => toggleChord(index)}
              >
                <Text style={[styles.numeral, { color: isActive ? theme.accent : theme.textMuted }]}>
                  {chord.numeral}
                </Text>
                <Text style={[styles.chordName, { color: theme.textPrimary }]}>
                  {NOTE_NAMES[chord.root]} {chord.quality === 'Dim' ? '°' : chord.quality === 'Minor' ? 'm' : ''}
                </Text>
                {isActive && (
                  <View style={styles.previewContainer}>
                    <ChordPreview
                      voicing={getVoicing(chord.quality)}
                      root={chord.root}
                      chordName=""
                    />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
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
  title: { fontSize: 28, fontWeight: '700', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  chordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chordCard: {
    width: '30%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  numeral: {
    fontSize: 18,
    fontWeight: '700',
  },
  chordName: {
    fontSize: 12,
    marginTop: 4,
  },
  previewContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  circleContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
});
