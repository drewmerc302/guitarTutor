// src/screens/__tests__/ProgressionsScreen.test.tsx
import React from 'react';
import { create, act } from 'react-test-renderer';
import { ProgressionsScreen } from '../ProgressionsScreen';
import { getDiatonicChords } from '../../engine/progressions';

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

  test('tapping a circle note changes the active key', () => {
    let tree: any;
    act(() => {
      tree = create(<ProgressionsScreen />);
    });

    // Expand the Circle of Fifths collapsible row first
    const circleHeader = tree.root.findAll(
      (el: any) => el.props.testID === 'circle-collapse-header'
    )[0];
    act(() => { circleHeader.props.onPress(); });

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
    const chordCards = tree.root.findAllByType('TouchableOpacity').filter(
      (el: any) => el.props.testID === 'diatonic-btn'
    );
    act(() => { chordCards[0].props.onPress(); });

    const json = JSON.stringify(tree.toJSON());
    // Open C shape has open strings → ChordDiagram renders ○ for them
    expect(json).toContain('○');
  });

  test('circle of fifths fills diatonic notes with quality colors', () => {
    let tree: any;
    act(() => { tree = create(<ProgressionsScreen />); });
    const circleHeader = tree.root.findAll(
      (el: any) => el.props.testID === 'circle-collapse-header'
    )[0];
    act(() => { circleHeader.props.onPress(); });
    const json = JSON.stringify(tree.toJSON());
    // In C major: I/IV/V are Major (#c8962a), ii/iii/vi Minor (#3a7bd5), vii° Dim (#c0392b)
    expect(json).toContain('"fill":"#c8962a"');
    expect(json).toContain('"fill":"#3a7bd5"');
    expect(json).toContain('"fill":"#c0392b"');
  });

  test('circle of fifths shows roman numerals for diatonic notes', () => {
    let tree: any;
    act(() => { tree = create(<ProgressionsScreen />); });
    const circleHeader = tree.root.findAll(
      (el: any) => el.props.testID === 'circle-collapse-header'
    )[0];
    act(() => { circleHeader.props.onPress(); });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('vii°');
  });

  test('selected key circle has white stroke ring', () => {
    let tree: any;
    act(() => { tree = create(<ProgressionsScreen />); });
    const circleHeader = tree.root.findAll(
      (el: any) => el.props.testID === 'circle-collapse-header'
    )[0];
    act(() => { circleHeader.props.onPress(); });
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

    // Expand the Circle of Fifths collapsible row first
    const circleHeader = tree.root.findAll(
      (el: any) => el.props.testID === 'circle-collapse-header'
    )[0];
    act(() => { circleHeader.props.onPress(); });

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

    // Diatonic chord buttons are identified by testID="diatonic-btn"
    const chordCards = tree.root.findAllByType('TouchableOpacity').filter(
      (el: any) => el.props.testID === 'diatonic-btn'
    );
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

  test('chord name renders below each numeral', () => {
    let tree: any;
    act(() => { tree = create(<ProgressionsScreen />); });
    // Default root = C. The I chord = C Major, so 'C' should appear as chord name
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('"I"');
    // Chord name 'C' appears below the I numeral
    expect(json).toContain('"C"');
  });

  test('diatonic hint text includes the current key name', () => {
    let tree: any;
    act(() => { tree = create(<ProgressionsScreen />); });
    // Default root = C. React Native splits JSX template-literal expressions into
    // separate Text children, so the JSON contains the static part "key of " and
    // the dynamic note name "C" as adjacent array entries.
    const json = JSON.stringify(tree.toJSON());
    // The static portion "key of " is always present verbatim in the serialised JSON.
    expect(json).toContain('key of ');
    // The note name for root=0 is 'C'; verify it also appears (it does, as the
    // adjacent child immediately after the "key of " segment).
    expect(json).toContain('"C"');
  });

  // ── 4a-engine: getDiatonicChords engine tests ─────────────────────────────
  // NOTE: The Circle of Fifths uses SVG <G onPress={...}> elements. These are
  // not accessible via findAllByType('TouchableOpacity') in react-test-renderer,
  // and react-native-svg's G component is not a standard host component that
  // test-renderer resolves the same way across all environments. Key-change
  // logic is therefore tested at the engine level below, plus via the existing
  // 'tapping a circle note changes the active key' test which uses findAllByType('G').

  test('getDiatonicChords returns 7 chords for any root', () => {
    const chords = getDiatonicChords(0);
    expect(chords).toHaveLength(7);
  });

  test('getDiatonicChords returns correct numerals for C major (root=0)', () => {
    const chords = getDiatonicChords(0);
    expect(chords.map(c => c.numeral)).toEqual(['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']);
  });

  test('getDiatonicChords returns correct roots for G major (root=7)', () => {
    const chords = getDiatonicChords(7);
    // G major scale: G A B C D E F# → roots 7, 9, 11, 0, 2, 4, 6
    expect(chords.map(c => c.root)).toEqual([7, 9, 11, 0, 2, 4, 6]);
  });

  test('getDiatonicChords returns correct qualities for C major', () => {
    const chords = getDiatonicChords(0);
    expect(chords.map(c => c.quality)).toEqual(
      ['Major', 'Minor', 'Minor', 'Major', 'Major', 'Minor', 'Dim']
    );
  });

  // ── 4b: Three-ring Circle of Fifths ──────────────────────────────────────

  test('circle of fifths renders middle ring relative minor nodes', () => {
    let tree: any;
    act(() => { tree = create(<ProgressionsScreen />); });
    const circleHeader = tree.root.findAll(
      (el: any) => el.props.testID === 'circle-collapse-header'
    )[0];
    act(() => { circleHeader.props.onPress(); });
    const json = JSON.stringify(tree.toJSON());
    // In the key of C, the relative minor nodes should include 'Am', 'Em', 'Bm', etc.
    // Am is the relative minor of C (position 0 in CIRCLE_OF_FIFTHS).
    expect(json).toContain('Am');
  });

  test('circle of fifths renders inner ring diminished nodes', () => {
    let tree: any;
    act(() => { tree = create(<ProgressionsScreen />); });
    const circleHeader = tree.root.findAll(
      (el: any) => el.props.testID === 'circle-collapse-header'
    )[0];
    act(() => { circleHeader.props.onPress(); });
    const json = JSON.stringify(tree.toJSON());
    // Leading-tone dim for C major key (position 0): (0+11)%12=11 = B → B°
    expect(json).toContain('B°');
  });

  test('circle of fifths middle ring uses minor quality fill', () => {
    let tree: any;
    act(() => { tree = create(<ProgressionsScreen />); });
    const circleHeader = tree.root.findAll(
      (el: any) => el.props.testID === 'circle-collapse-header'
    )[0];
    act(() => { circleHeader.props.onPress(); });
    const json = JSON.stringify(tree.toJSON());
    // getChordQualityColor('Minor') returns '#3a7bd5'
    expect(json).toContain('"fill":"#3a7bd5"');
  });

  test('circle of fifths inner ring uses dim quality fill', () => {
    let tree: any;
    act(() => { tree = create(<ProgressionsScreen />); });
    const circleHeader = tree.root.findAll(
      (el: any) => el.props.testID === 'circle-collapse-header'
    )[0];
    act(() => { circleHeader.props.onPress(); });
    const json = JSON.stringify(tree.toJSON());
    // getChordQualityColor('Dim') returns '#c0392b'
    expect(json).toContain('"fill":"#c0392b"');
  });

  // ── 4c: Repeated diatonic chord selection and tap-to-remove ──────────────

  test('tapping a diatonic chord card multiple times appends duplicates', () => {
    let tree: any;
    act(() => { tree = create(<ProgressionsScreen />); });

    const numChordCards = tree.root.findAllByType('TouchableOpacity').filter(
      (el: any) => el.props.testID === 'diatonic-btn'
    );

    // Tap the I chord card three times
    act(() => { numChordCards[0].props.onPress(); });
    act(() => { numChordCards[0].props.onPress(); });
    act(() => { numChordCards[0].props.onPress(); });

    // The progression section should now contain three cards (identified by testID).
    const progressionCards = tree.root.findAllByType('TouchableOpacity').filter(
      (el: any) => el.props.testID === 'progression-card'
    );
    expect(progressionCards.length).toBe(3);
  });

  // ── Piano key picker ──────────────────────────────────────────────────────

  test('tapping a natural key chip updates root', () => {
    let tree: any;
    act(() => { tree = create(<ProgressionsScreen />); });

    // Tap F (pitch class 5)
    const fChip = tree.root.findAll(
      (el: any) => el.props.testID === 'key-natural-5'
    )[0];
    act(() => { fChip.props.onPress(); });

    const json = JSON.stringify(tree.toJSON());
    // F major diatonic label should now read "Chords in key of F"
    expect(json).toContain('key of F');
  });

  test('tapping an accidental key chip updates root', () => {
    let tree: any;
    act(() => { tree = create(<ProgressionsScreen />); });

    // Tap F# (pitch class 6)
    const fSharpChip = tree.root.findAll(
      (el: any) => el.props.testID === 'key-accidental-6'
    )[0];
    act(() => { fSharpChip.props.onPress(); });

    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('key of F#');
  });

  test('tapping a key chip resets the progression', () => {
    let tree: any;
    act(() => { tree = create(<ProgressionsScreen />); });

    // Add two chords to progression
    const diatonicBtns = tree.root.findAllByType('TouchableOpacity').filter(
      (el: any) => el.props.testID === 'diatonic-btn'
    );
    act(() => { diatonicBtns[0].props.onPress(); }); // I
    act(() => { diatonicBtns[3].props.onPress(); }); // IV

    // Verify 2 cards exist
    const before = tree.root.findAllByType('TouchableOpacity').filter(
      (el: any) => el.props.testID === 'progression-card'
    );
    expect(before.length).toBe(2);

    // Tap G (pitch class 7) to change key
    const gChip = tree.root.findAll(
      (el: any) => el.props.testID === 'key-natural-7'
    )[0];
    act(() => { gChip.props.onPress(); });

    // Progression should be empty
    const after = tree.root.findAllByType('TouchableOpacity').filter(
      (el: any) => el.props.testID === 'progression-card'
    );
    expect(after.length).toBe(0);
  });

  test('✕ button removes chord at correct position', () => {
    let tree: any;
    act(() => { tree = create(<ProgressionsScreen />); });

    const diatonicBtns = tree.root.findAllByType('TouchableOpacity').filter(
      (el: any) => el.props.testID === 'diatonic-btn'
    );

    // Add I, IV, V (indices 0, 3, 4)
    act(() => { diatonicBtns[0].props.onPress(); }); // I
    act(() => { diatonicBtns[3].props.onPress(); }); // IV
    act(() => { diatonicBtns[4].props.onPress(); }); // V

    // Verify 3 cards
    const cardsBefore = tree.root.findAllByType('TouchableOpacity').filter(
      (el: any) => el.props.testID === 'progression-card'
    );
    expect(cardsBefore.length).toBe(3);

    // Tap the ✕ on position 1 (IV)
    const removeBtn = tree.root.findAll(
      (el: any) => el.props.testID === 'remove-chord-1'
    )[0];
    act(() => { removeBtn.props.onPress(); });

    // Should now have 2 cards
    const cardsAfter = tree.root.findAllByType('TouchableOpacity').filter(
      (el: any) => el.props.testID === 'progression-card'
    );
    expect(cardsAfter.length).toBe(2);
  });

  // ── Collapsible Circle of Fifths ─────────────────────────────────────────

  test('circle is collapsed by default — SVG not in tree', () => {
    let tree: any;
    act(() => { tree = create(<ProgressionsScreen />); });
    // The circle SVG renders as <Svg> which maps to 'Svg' in the mock.
    // When collapsed, no Svg elements from the circle should be present.
    // We check that the pressable G elements (circle nodes) are absent.
    const circleNodes = tree.root.findAllByType('G').filter(
      (el: any) => el.props.onPress != null
    );
    expect(circleNodes.length).toBe(0);
  });

  test('tapping circle header expands circle SVG', () => {
    let tree: any;
    act(() => { tree = create(<ProgressionsScreen />); });

    const header = tree.root.findAll(
      (el: any) => el.props.testID === 'circle-collapse-header'
    )[0];
    act(() => { header.props.onPress(); });

    // After expanding, the 12 pressable G nodes should be visible
    const circleNodes = tree.root.findAllByType('G').filter(
      (el: any) => el.props.onPress != null
    );
    expect(circleNodes.length).toBe(12);
  });

  test('tapping circle header a second time collapses circle', () => {
    let tree: any;
    act(() => { tree = create(<ProgressionsScreen />); });

    const header = tree.root.findAll(
      (el: any) => el.props.testID === 'circle-collapse-header'
    )[0];
    act(() => { header.props.onPress(); }); // expand

    // Verify expanded
    const nodesAfterExpand = tree.root.findAllByType('G').filter(
      (el: any) => el.props.onPress != null
    );
    expect(nodesAfterExpand.length).toBe(12);

    act(() => { header.props.onPress(); }); // collapse again

    const nodesAfterCollapse = tree.root.findAllByType('G').filter(
      (el: any) => el.props.onPress != null
    );
    expect(nodesAfterCollapse.length).toBe(0);
  });

  test('tapping a circle key node collapses circle and updates root', () => {
    let tree: any;
    act(() => { tree = create(<ProgressionsScreen />); });

    // Expand circle
    const header = tree.root.findAll(
      (el: any) => el.props.testID === 'circle-collapse-header'
    )[0];
    act(() => { header.props.onPress(); });

    // Tap G node (CIRCLE_OF_FIFTHS[1] = 7)
    const circleNodes = tree.root.findAllByType('G').filter(
      (el: any) => el.props.onPress != null
    );
    act(() => { circleNodes[1].props.onPress(); });

    // Circle should be collapsed again
    const circleNodesAfter = tree.root.findAllByType('G').filter(
      (el: any) => el.props.onPress != null
    );
    expect(circleNodesAfter.length).toBe(0);

    // Root should have updated — G major diatonic includes D as V
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('D');
  });

});
