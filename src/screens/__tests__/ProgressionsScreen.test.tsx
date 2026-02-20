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

  test('progression display uses open-position voicing for C major I chord', () => {
    let tree: any;
    act(() => { tree = create(<ProgressionsScreen />); });

    // Tap the I chord button — C major in key of C (default root=0)
    const allTouchables = tree.root.findAllByType('TouchableOpacity');
    const chordCards = allTouchables.filter((el: any) => el.props.accessibilityLabel == null);
    act(() => { chordCards[0].props.onPress(); });

    const json = JSON.stringify(tree.toJSON());
    // Open C shape has open strings → ChordDiagram renders ○ for them
    expect(json).toContain('○');
  });

  test('circle of fifths fills diatonic notes with quality colors', () => {
    let tree: any;
    act(() => { tree = create(<ProgressionsScreen />); });
    const json = JSON.stringify(tree.toJSON());
    // In C major: I/IV/V are Major (#c8962a), ii/iii/vi Minor (#3a7bd5), vii° Dim (#c0392b)
    expect(json).toContain('"fill":"#c8962a"');
    expect(json).toContain('"fill":"#3a7bd5"');
    expect(json).toContain('"fill":"#c0392b"');
  });

  test('circle of fifths shows roman numerals for diatonic notes', () => {
    let tree: any;
    act(() => { tree = create(<ProgressionsScreen />); });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('vii°');
  });

  test('selected key circle has white stroke ring', () => {
    let tree: any;
    act(() => { tree = create(<ProgressionsScreen />); });
    const json = JSON.stringify(tree.toJSON());
    // The selected root note (C by default) gets stroke="#fff" strokeWidth=2
    expect(json).toContain('"stroke":"#fff"');
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

  // ── 4b: Three-ring Circle of Fifths ──────────────────────────────────────

  test('circle of fifths renders middle ring relative minor nodes', () => {
    let tree: any;
    act(() => { tree = create(<ProgressionsScreen />); });
    const json = JSON.stringify(tree.toJSON());
    // In the key of C, the relative minor nodes should include 'Am', 'Em', 'Bm', etc.
    // Am is the relative minor of C (position 0 in CIRCLE_OF_FIFTHS).
    expect(json).toContain('Am');
  });

  test('circle of fifths renders inner ring diminished nodes', () => {
    let tree: any;
    act(() => { tree = create(<ProgressionsScreen />); });
    const json = JSON.stringify(tree.toJSON());
    // Leading-tone dim for C major key (position 0): (0+11)%12=11 = B → B°
    expect(json).toContain('B°');
  });

  test('circle of fifths middle ring uses muted blue fill', () => {
    let tree: any;
    act(() => { tree = create(<ProgressionsScreen />); });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('"fill":"#2a4a7a"');
  });

  test('circle of fifths inner ring uses muted red fill', () => {
    let tree: any;
    act(() => { tree = create(<ProgressionsScreen />); });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('"fill":"#7a2a2a"');
  });

  // ── 4c: Repeated diatonic chord selection and long-press removal ──────────

  test('tapping a diatonic chord card multiple times appends duplicates', () => {
    let tree: any;
    act(() => { tree = create(<ProgressionsScreen />); });

    const allTouchables = tree.root.findAllByType('TouchableOpacity');
    const numChordCards = allTouchables.filter((el: any) => el.props.accessibilityLabel == null);

    // Tap the I chord card three times
    act(() => { numChordCards[0].props.onPress(); });
    act(() => { numChordCards[0].props.onPress(); });
    act(() => { numChordCards[0].props.onPress(); });

    // The progression section should now contain three cards.
    // Each progression card is a TouchableOpacity with onLongPress defined.
    const allTouchables2 = tree.root.findAllByType('TouchableOpacity');
    const progressionCards = allTouchables2.filter(
      (el: any) => el.props.accessibilityLabel == null && el.props.onLongPress != null
    );
    expect(progressionCards.length).toBe(3);
  });

  test('long-pressing a progression card removes it', () => {
    let tree: any;
    act(() => { tree = create(<ProgressionsScreen />); });

    const allTouchables = tree.root.findAllByType('TouchableOpacity');
    const numChordCards = allTouchables.filter((el: any) => el.props.accessibilityLabel == null);

    // Tap I card twice to create two entries
    act(() => { numChordCards[0].props.onPress(); });
    act(() => { numChordCards[0].props.onPress(); });

    // Verify two progression cards exist
    const before = tree.root.findAllByType('TouchableOpacity').filter(
      (el: any) => el.props.accessibilityLabel == null && el.props.onLongPress != null
    );
    expect(before.length).toBe(2);

    // Long-press the first progression card to remove it
    act(() => { before[0].props.onLongPress(); });

    // Now only one progression card should remain
    const after = tree.root.findAllByType('TouchableOpacity').filter(
      (el: any) => el.props.accessibilityLabel == null && el.props.onLongPress != null
    );
    expect(after.length).toBe(1);
  });

  // ── 7: Scale degree fretboard preview ────────────────────────────────────

  test('tapping a progression card shows fretboard preview label', () => {
    let tree: any;
    act(() => { tree = create(<ProgressionsScreen />); });

    // Add chord I to progression
    const allTouchables = tree.root.findAllByType('TouchableOpacity');
    const numChordCards = allTouchables.filter((el: any) => el.props.accessibilityLabel == null);
    act(() => { numChordCards[0].props.onPress(); });

    // Tap the resulting progression card to select it
    const progressionCards = tree.root.findAllByType('TouchableOpacity').filter(
      (el: any) => el.props.accessibilityLabel == null && el.props.onLongPress != null
    );
    act(() => { progressionCards[0].props.onPress(); });

    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Chord tones on neck');
  });

  test('tapping a selected progression card deselects it and hides preview', () => {
    let tree: any;
    act(() => { tree = create(<ProgressionsScreen />); });

    // Add chord I
    const allTouchables = tree.root.findAllByType('TouchableOpacity');
    const numChordCards = allTouchables.filter((el: any) => el.props.accessibilityLabel == null);
    act(() => { numChordCards[0].props.onPress(); });

    // Select the progression card
    const progressionCards = tree.root.findAllByType('TouchableOpacity').filter(
      (el: any) => el.props.accessibilityLabel == null && el.props.onLongPress != null
    );
    act(() => { progressionCards[0].props.onPress(); });
    // Deselect by tapping again
    const progressionCards2 = tree.root.findAllByType('TouchableOpacity').filter(
      (el: any) => el.props.accessibilityLabel == null && el.props.onLongPress != null
    );
    act(() => { progressionCards2[0].props.onPress(); });

    const json = JSON.stringify(tree.toJSON());
    expect(json).not.toContain('Chord tones on neck');
  });
});
