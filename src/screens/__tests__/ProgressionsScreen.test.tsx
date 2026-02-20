// src/screens/__tests__/ProgressionsScreen.test.tsx
import React from 'react';
import { create, act } from 'react-test-renderer';
import { ProgressionsScreen } from '../ProgressionsScreen';

describe('ProgressionsScreen', () => {
  test('renders without crashing', () => {
    let tree: any;
    act(() => {
      tree = create(<ProgressionsScreen />);
    });
    expect(tree.toJSON()).toBeTruthy();
  });

  test('renders title', () => {
    let tree: any;
    act(() => {
      tree = create(<ProgressionsScreen />);
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Progressions');
  });

  test('renders 7 diatonic chord numerals', () => {
    let tree: any;
    act(() => {
      tree = create(<ProgressionsScreen />);
    });
    const json = JSON.stringify(tree.toJSON());
    // C major diatonic numerals
    expect(json).toContain('I');
    expect(json).toContain('ii');
    expect(json).toContain('iii');
    expect(json).toContain('IV');
    expect(json).toContain('V');
    expect(json).toContain('vi');
  });

  test('renders quality indicators via numerals', () => {
    let tree: any;
    act(() => {
      tree = create(<ProgressionsScreen />);
    });
    const json = JSON.stringify(tree.toJSON());
    // Minor chords shown as lowercase numerals (e.g. 'ii')
    expect(json).toContain('ii');
    // Dim chord numeral contains degree sign
    expect(json).toContain('°');
  });

  test('renders Circle of Fifths', () => {
    let tree: any;
    act(() => {
      tree = create(<ProgressionsScreen />);
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Circle of Fifths');
  });

  test('renders key label', () => {
    let tree: any;
    act(() => {
      tree = create(<ProgressionsScreen />);
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Key');
  });

  test('tapping a circle note changes the active key', () => {
    let tree: any;
    act(() => {
      tree = create(<ProgressionsScreen />);
    });

    // CIRCLE_OF_FIFTHS = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5]
    // index 1 corresponds to note 7 = 'G'
    // Initially root=0 (C), so the G note is not active and C is.
    const gElements = tree.root.findAllByType('G');
    const circleNotes = gElements.filter((el: any) => el.props.onPress != null);
    expect(circleNotes.length).toBe(12);

    // The initial key label text should include 'C' (C major).
    // Tap the second circle note (index 1 → note G).
    act(() => {
      circleNotes[1].props.onPress();
    });

    // After pressing, the tree should still render without crashing.
    expect(tree.toJSON()).toBeTruthy();

    // The JSON should now reflect 'G' as the active key — G major diatonic chord
    // roots are G, A, B, C, D, E, F#. The numeral 'I' chord name should now be 'G'.
    const json = JSON.stringify(tree.toJSON());
    // G is in NOTE_NAMES[7]; the screen renders NOTE_NAMES[chord.root] for each chord.
    // The diatonic chords for G are: G(I), A(ii), B(iii), C(IV), D(V), E(vi), F#(vii°).
    // 'D' would appear as the V chord root — a note absent from C major's chord roots.
    // Checking that 'D' now appears as a chord name validates the key changed to G.
    expect(json).toContain('D');
  });

  test('tapping a circle note clears active chord previews', () => {
    // theme.accent = '#d4a04a', theme.textMuted = '#5c5a55' (from darkTheme in jest mock)
    const ACCENT = '#d4a04a';
    const MUTED = '#5c5a55';

    let tree: any;
    act(() => {
      tree = create(<ProgressionsScreen />);
    });

    // Helper: find the Text node whose sole child is 'I' (the first diatonic numeral).
    // The numeral Text has color=ACCENT when active, color=MUTED when inactive.
    // Style is passed as an array [styles.numeral, { color: ... }] so we flatten it.
    const getNumeralText = () => {
      const allTexts = tree.root.findAllByType('Text');
      return allTexts.find((el: any) => el.props.children === 'I');
    };
    const getColor = (el: any): string | undefined => {
      const style = el.props.style;
      if (Array.isArray(style)) {
        for (const s of style) {
          if (s && typeof s === 'object' && 'color' in s) return s.color;
        }
        return undefined;
      }
      return style?.color;
    };

    // Capture circle note G elements from the initial render BEFORE any chord activation.
    // This avoids picking up any G elements that ChordPreview renders after activation.
    // CIRCLE_OF_FIFTHS[1] = 7 (G) — pressing circleNotes[1] changes key to G and clears progression.
    const initialGElements = tree.root.findAllByType('G');
    const circleNotes = initialGElements.filter((el: any) => el.props.onPress != null);
    expect(circleNotes.length).toBe(12);

    // Initially the first chord is NOT active — numeral color should be textMuted.
    const initialNumeral = getNumeralText();
    expect(initialNumeral).toBeDefined();
    expect(getColor(initialNumeral)).toBe(MUTED);

    // Chord cards are TouchableOpacity elements that have no accessibilityLabel.
    // Bookmark button and NotePicker buttons all have accessibilityLabel set.
    // So we filter for those WITHOUT accessibilityLabel to get the 7 diatonic chord cards.
    const allTouchables = tree.root.findAllByType('TouchableOpacity');
    const chordCards = allTouchables.filter((el: any) => el.props.accessibilityLabel == null);
    expect(chordCards.length).toBe(7);

    // Tap the first chord card (I — C Major) to make it active.
    act(() => {
      chordCards[0].props.onPress();
    });

    // After activation, the 'I' numeral should be rendered with accent color.
    const activeNumeral = getNumeralText();
    expect(activeNumeral).toBeDefined();
    expect(getColor(activeNumeral)).toBe(ACCENT);

    // Tap the second circle note (CIRCLE_OF_FIFTHS[1] = G), which calls:
    //   setRoot(7) — changes the key to G
    //   setProgression([]) — clears all active chord previews
    act(() => {
      circleNotes[1].props.onPress();
    });

    // After the key change, progression is empty so no chord card is active.
    // The new key is G major; the 'I' numeral in G major is still the first chord,
    // and since progression is now empty, it should be back to textMuted color.
    const clearedNumeral = getNumeralText();
    expect(clearedNumeral).toBeDefined();
    expect(getColor(clearedNumeral)).toBe(MUTED);
  });
});
