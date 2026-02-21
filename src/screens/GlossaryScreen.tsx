// src/screens/GlossaryScreen.tsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

interface GlossaryScreenProps {
  onClose: () => void;
}

function ColorDot({ color }: { color: string }) {
  return <View style={[styles.colorDot, { backgroundColor: color }]} />;
}

export function GlossaryScreen({ onClose }: GlossaryScreenProps) {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgPrimary }]} edges={['top', 'bottom']}>
      <View style={[styles.header, { backgroundColor: theme.bgSecondary, borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.accent }]}>GLOSSARY</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Close glossary">
          <Text style={[styles.closeBtnText, { color: theme.textSecondary }]}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* ── Color Coding ── */}
        <Text style={[styles.sectionTitle, { color: theme.accent }]}>Fretboard Color Coding</Text>
        <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
          Every dot on the fretboard is colored by its role in the chord or scale.
        </Text>

        <View style={[styles.colorCard, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}>
          {[
            { color: '#e8734a', label: 'Root (R)', description: 'The note the chord or scale is named after. Always play this note — it\'s the foundation.' },
            { color: '#5ba3d9', label: '3rd (b3 or 3)', description: 'The note that determines mood. A major 3rd sounds bright and happy; a minor 3rd sounds darker.' },
            { color: '#6bc77a', label: '5th (5)', description: 'The stable, supporting note. It reinforces the root and gives the chord its fullness.' },
            { color: '#c76bb8', label: '7th (b7 or 7)', description: 'Adds richness and color. Common in blues (b7) and jazz (major 7).' },
            { color: '#d4a04a', label: 'Other intervals', description: 'All other notes: 2nds, 4ths, 6ths, and any extra tensions. Context depends on the chord or scale type.' },
          ].map(({ color, label, description }) => (
            <View key={label} style={styles.colorRow}>
              <ColorDot color={color} />
              <View style={styles.colorTextBlock}>
                <Text style={[styles.colorLabel, { color: theme.textPrimary }]}>{label}</Text>
                <Text style={[styles.colorDesc, { color: theme.textSecondary }]}>{description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Display Modes ── */}
        <Text style={[styles.sectionTitle, { color: theme.accent }]}>Display Modes</Text>

        {[
          { term: 'Finger', definition: 'Shows which left-hand finger to use for each note. 1 = index, 2 = middle, 3 = ring, 4 = pinky. "O" means open string (no finger needed). "R" marks the root note.' },
          { term: 'Interval', definition: 'Shows the musical role of each note (R = root, 3 = third, 5 = fifth, b7 = flat seventh, etc.). Useful once you understand basic music theory.' },
          { term: 'Note', definition: 'Shows the actual note name (C, D, E, F, G, A, B with sharps or flats). The most beginner-friendly option — you can match these to a piano or other instrument.' },
        ].map(({ term, definition }) => (
          <TermRow key={term} term={term} definition={definition} theme={theme} />
        ))}

        {/* ── Header Controls ── */}
        <Text style={[styles.sectionTitle, { color: theme.accent }]}>Header Controls</Text>

        {[
          { term: 'LH  (Left-Handed)', definition: 'Mirrors the fretboard horizontally for left-handed players. When active, the low E string appears on the right instead of the left.' },
          { term: 'Capo', definition: 'A capo is a clamp placed across all strings at a particular fret to raise the pitch of the guitar. Use the − and + buttons to set the fret. When a capo is active, the fretboard dims the notes behind it and shows the playable range in full color.' },
          { term: '♯ / ♭', definition: 'Toggles between sharp and flat note names. Sharp: C#, D#, F#, G#, A#. Flat: Db, Eb, Gb, Ab, Bb. These are the same physical notes — just two different names. Use whichever you prefer or whichever matches your sheet music.' },
          { term: '☀ / ☾  (Theme)', definition: 'Switches between light and dark mode.' },
        ].map(({ term, definition }) => (
          <TermRow key={term} term={term} definition={definition} theme={theme} />
        ))}

        {/* ── Basic Terms ── */}
        <Text style={[styles.sectionTitle, { color: theme.accent }]}>Basic Terms</Text>

        {[
          { term: 'Note', definition: 'A musical sound at a specific pitch. The 12 notes in Western music are: C, C#/Db, D, D#/Eb, E, F, F#/Gb, G, G#/Ab, A, A#/Bb, B.' },
          { term: 'Root', definition: 'The base note that gives a chord or scale its name. A "C Major" chord has C as its root.' },
          { term: 'Interval', definition: 'The distance between two notes, measured in semitones (frets). A 3rd is 3–4 semitones above the root; a 5th is 7 semitones above.' },
          { term: 'Fret', definition: 'The metal strips on a guitar neck. Each fret raises the pitch by one semitone (one half-step). The open string (no fret pressed) is the lowest pitch.' },
          { term: 'Open String', definition: 'A string played without pressing any fret. The 6 open strings on a standard-tuned guitar are (low to high): E, A, D, G, B, E.' },
          { term: 'Voicing', definition: 'A specific arrangement of a chord\'s notes on the fretboard. The same chord (e.g., C Major) can be played in many different positions and shapes — each is a different voicing. Tap a root dot on the Chords screen to cycle through voicings.' },
          { term: 'Semitone', definition: 'The smallest interval in Western music — one fret on the guitar. Two semitones = one tone (whole step).' },
        ].map(({ term, definition }) => (
          <TermRow key={term} term={term} definition={definition} theme={theme} />
        ))}

        {/* ── Chords ── */}
        <Text style={[styles.sectionTitle, { color: theme.accent }]}>Chord Types</Text>

        {[
          { term: 'Major', definition: 'The most common chord type. Sounds bright, happy, and resolved. Made of a root, a major 3rd (4 semitones up), and a perfect 5th (7 semitones up). Example: C Major = C, E, G.' },
          { term: 'Minor (m)', definition: 'Sounds darker and more emotional than major. The 3rd is lowered by one semitone. Example: A Minor = A, C, E.' },
          { term: '7th', definition: 'A major chord with an added flat 7th. Sounds bluesy and creates tension. Very common in blues, rock, and jazz. Example: G7 = G, B, D, F.' },
          { term: 'Major 7th (Maj7)', definition: 'A major chord with an added major 7th (one semitone below the octave). Sounds dreamy and sophisticated. Common in jazz and bossa nova. Example: Cmaj7 = C, E, G, B.' },
          { term: 'Minor 7th (Min7)', definition: 'A minor chord with an added flat 7th. Smooth and melancholy. Very common in soul, R&B, and jazz. Example: Am7 = A, C, E, G.' },
          { term: 'Diminished (Dim, °)', definition: 'A tense, unstable-sounding chord. All intervals are flattened. Often used as a passing chord to create tension before resolving. Example: B° = B, D, F.' },
          { term: 'Augmented (Aug)', definition: 'A mysterious, slightly eerie chord. The 5th is raised by a semitone. Creates a sense of movement or unease. Example: Caug = C, E, G#.' },
          { term: 'Suspended 4th (Sus4)', definition: 'The 3rd is replaced by a 4th (5 semitones up). Creates tension that wants to resolve back to major. Common in rock and pop. Example: Csus4 = C, F, G.' },
          { term: 'Suspended 2nd (Sus2)', definition: 'The 3rd is replaced by a 2nd (2 semitones up). Sounds open and ambiguous — neither major nor minor. Example: Csus2 = C, D, G.' },
          { term: 'Min7b5 (Half-Diminished, ø)', definition: 'A minor 7th chord with a flattened 5th. Sounds unstable and tense. The ii chord in a minor key jazz progression. Example: Bm7b5 = B, D, F, A.' },
          { term: 'Diminished 7th (Dim7)', definition: 'A fully diminished chord with an added diminished 7th. Very tense and dramatic. Each note is exactly 3 semitones apart. Example: Bdim7 = B, D, F, Ab.' },
          { term: '9th', definition: 'A dominant 7th chord with an added 9th (2nd an octave higher). Rich and complex. Common in funk, jazz, and R&B.' },
        ].map(({ term, definition }) => (
          <TermRow key={term} term={term} definition={definition} theme={theme} />
        ))}

        {/* ── Scales ── */}
        <Text style={[styles.sectionTitle, { color: theme.accent }]}>Scales</Text>

        {[
          { term: 'Scale', definition: 'A set of notes arranged in a specific ascending pattern. Scales are the foundation for melodies, solos, and understanding which notes work together.' },
          { term: 'Major Scale', definition: 'The most fundamental scale in Western music — the "do re mi" scale. Sounds bright and uplifting. The parent of all modes. 7 notes per octave.' },
          { term: 'Natural Minor Scale', definition: 'A darker, more emotional scale built on the 6th degree of the major scale. The foundation for most rock, metal, and classical minor keys.' },
          { term: 'Harmonic Minor', definition: 'A natural minor scale with the 7th raised by a semitone. Creates a tense, exotic sound just before the root — common in classical music, flamenco, and metal.' },
          { term: 'Melodic Minor', definition: 'Raises both the 6th and 7th when ascending (going up) for a smoother sound. Often used as a jazz scale in its ascending form.' },
          { term: 'Pentatonic Scale', definition: 'A 5-note scale (penta = 5). The most popular scale for guitar solos and improvisation. The minor pentatonic is the backbone of blues and rock.' },
          { term: 'Blues Scale', definition: 'The minor pentatonic with one extra note: the "blue note" (flat 5th). This note gives blues music its characteristic tension and expression.' },
          { term: 'Box Position', definition: 'A scale pattern that fits within 4–5 frets and all 6 strings. Each box covers a specific region of the neck. There are 5 box positions for any pentatonic scale — together they cover the entire fretboard. Start with Box 1 (closest to the nut).' },
        ].map(({ term, definition }) => (
          <TermRow key={term} term={term} definition={definition} theme={theme} />
        ))}

        {/* ── Modes ── */}
        <Text style={[styles.sectionTitle, { color: theme.accent }]}>Modes</Text>
        <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
          A mode is what you get when you play a major scale starting from a different note.
          Each mode has its own distinct color and feel.
        </Text>

        {[
          { term: 'Ionian (= Major)', definition: 'The standard major scale. Bright, happy, and resolved. The "do re mi" scale most people learn first.' },
          { term: 'Dorian', definition: 'A minor-flavored mode with a raised 6th. Slightly brighter than natural minor — sounds jazzy, funky, and smooth. Used by Carlos Santana and in most jazz standards.' },
          { term: 'Phrygian', definition: 'A very dark minor mode with a flattened 2nd. Has a Spanish/flamenco or Middle Eastern flavor. Common in metal and flamenco guitar.' },
          { term: 'Lydian', definition: 'A major mode with a raised 4th. Sounds dreamy, floaty, and otherworldly. Used in film scores and ambient music.' },
          { term: 'Mixolydian', definition: 'A major mode with a flattened 7th. Sounds bluesy and rock-like — a major scale that doesn\'t fully resolve. The foundation of many blues and rock riffs.' },
          { term: 'Aeolian (= Natural Minor)', definition: 'The natural minor scale. Dark and emotional. The most common minor key sound in rock, pop, and classical music.' },
          { term: 'Locrian', definition: 'The darkest mode — has both a flattened 2nd and a flattened 5th. Very dissonant and unstable. Rarely used in practice, but appears in metal and jazz theory.' },
        ].map(({ term, definition }) => (
          <TermRow key={term} term={term} definition={definition} theme={theme} />
        ))}

        {/* ── Triads ── */}
        <Text style={[styles.sectionTitle, { color: theme.accent }]}>Triads</Text>

        {[
          { term: 'Triad', definition: 'The simplest possible chord: just 3 notes (root, 3rd, and 5th). Every full chord is built by adding more notes to a triad. Triads are great for rhythm guitar and voice-leading exercises.' },
          { term: 'String Group', definition: 'Three adjacent strings on which a triad shape is played. For example, "1–2–3" means the highest three strings (high E, B, G). Restricting to a string group keeps the triad small and easy to move around the neck.' },
          { term: 'Inversion', definition: 'Which note sits at the bottom of the chord. In Root Position, the root is lowest (most natural sound). In 1st Inversion, the 3rd is lowest. In 2nd Inversion, the 5th is lowest. Inversions let you play the same chord without jumping too far up the neck.' },
          { term: 'Root Position', definition: 'The standard form of a chord: root note at the bottom. Sounds the most stable and "complete".' },
          { term: '1st Inversion', definition: 'The 3rd of the chord is the lowest note. Sounds slightly lighter than root position and is useful for smooth bass-line movement.' },
          { term: '2nd Inversion', definition: 'The 5th of the chord is the lowest note. Sounds floatier and less resolved — often used as a passing chord.' },
        ].map(({ term, definition }) => (
          <TermRow key={term} term={term} definition={definition} theme={theme} />
        ))}

        {/* ── Arpeggios ── */}
        <Text style={[styles.sectionTitle, { color: theme.accent }]}>Arpeggios</Text>

        {[
          { term: 'Arpeggio', definition: 'A chord played one note at a time in sequence, rather than all at once. Arpeggios are the bridge between chords and melodies — you\'re outlining the chord but with a melodic feel.' },
          { term: 'Sweep Picking', definition: 'A guitar technique where you play notes on different strings with one smooth, continuous pick stroke. The numbers shown in Finger mode indicate the sweep-picking order: start from 1 and play each number in sequence, moving across strings in one stroke.' },
        ].map(({ term, definition }) => (
          <TermRow key={term} term={term} definition={definition} theme={theme} />
        ))}

        {/* ── Progressions ── */}
        <Text style={[styles.sectionTitle, { color: theme.accent }]}>Progressions</Text>

        {[
          { term: 'Key', definition: 'The "home base" note and scale that a piece of music is built around. In the key of C Major, C feels like home — melodies and chords naturally want to return to it.' },
          { term: 'Diatonic Chords', definition: 'The 7 chords that naturally fit within a given key — built entirely from the notes of that key\'s scale. In the key of C Major: C (I), Dm (ii), Em (iii), F (IV), G (V), Am (vi), Bdim (vii°). These chords all sound "at home" in that key.' },
          { term: 'Roman Numerals (I, ii, V…)', definition: 'A shorthand for describing chords by their position in the scale, regardless of key. Uppercase (I, IV, V) = Major chord. Lowercase (ii, iii, vi) = minor chord. The ° symbol (vii°) = diminished chord. This system lets musicians describe progressions in any key.' },
          { term: 'Chord Progression', definition: 'A sequence of chords played in a repeating pattern. Famous examples: I–IV–V (blues, country), I–V–vi–IV (most pop songs), ii–V–I (jazz). Tap chords from the Diatonic row to build your own.' },
          { term: 'Circle of Fifths', definition: 'A diagram showing how all 12 musical keys relate to each other. Moving clockwise, each key is a perfect 5th higher. Adjacent keys share almost all the same notes — making it easy to modulate (change key). In this app: the outer ring shows major keys, the middle ring shows relative minor chords, and the inner ring shows the diminished chord. Tap any outer circle to change the key.' },
          { term: 'Relative Minor', definition: 'Every major key has a relative minor key that shares the same notes. For example, C Major and A Minor use identical notes. The relative minor starts on the 6th degree of the major scale.' },
          { term: 'I, IV, V (One-Four-Five)', definition: 'The most fundamental chord progression in Western music. I is home, IV moves away, V creates tension before returning home. The foundation of blues, country, rock, and folk.' },
          { term: 'ii–V–I (Two-Five-One)', definition: 'The cornerstone of jazz harmony. The ii chord sets up tension, V resolves it, I lands at home. Mastering ii–V–I in all 12 keys is a rite of passage for jazz musicians.' },
        ].map(({ term, definition }) => (
          <TermRow key={term} term={term} definition={definition} theme={theme} />
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

function TermRow({ term, definition, theme }: { term: string; definition: string; theme: ReturnType<typeof useTheme>['theme'] }) {
  return (
    <View style={[styles.termRow, { borderBottomColor: theme.border }]}>
      <Text style={[styles.termLabel, { color: theme.textPrimary }]}>{term}</Text>
      <Text style={[styles.termDefinition, { color: theme.textSecondary }]}>{definition}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 2,
  },
  closeBtn: {
    padding: 8,
  },
  closeBtnText: {
    fontSize: 18,
    fontWeight: '400',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 28,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  colorCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    gap: 14,
    marginTop: 8,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  colorDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginTop: 2,
    flexShrink: 0,
  },
  colorTextBlock: {
    flex: 1,
  },
  colorLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  colorDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  termRow: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  termLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 3,
  },
  termDefinition: {
    fontSize: 13,
    lineHeight: 19,
  },
});
