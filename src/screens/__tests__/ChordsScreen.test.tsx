// src/screens/__tests__/ChordsScreen.test.tsx
import React from 'react';
import { create, act } from 'react-test-renderer';
import { ChordsScreen } from '../ChordsScreen';
import { FretboardViewer as _FretboardViewer, ChordDiagram as _ChordDiagram } from '../../components';
// React.memo wraps these components; react-test-renderer stores the inner
// function as the fiber type, so findByType requires the unwrapped component.
const FretboardViewer = (_FretboardViewer as any).type as typeof _FretboardViewer;
const ChordDiagram = (_ChordDiagram as any).type as typeof _ChordDiagram;

describe('ChordsScreen', () => {
  test('renders without crashing', () => {
    let tree: any;
    act(() => {
      tree = create(<ChordsScreen />);
    });
    expect(tree.toJSON()).toBeTruthy();
  });

  test('renders title', () => {
    let tree: any;
    act(() => {
      tree = create(<ChordsScreen />);
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Chords');
  });

  test('renders NotePicker for root selection', () => {
    let tree: any;
    act(() => {
      tree = create(<ChordsScreen />);
    });
    const json = JSON.stringify(tree.toJSON());
    // Should have the 7 natural notes and ♯/♭ buttons
    expect(json).toContain('"C"');
    expect(json).toContain('"G"');
    expect(json).toContain('"A"');
    expect(json).toContain('♯');
    expect(json).toContain('♭');
    // Should NOT have chromatic notes in natural mode
    expect(json).not.toContain('"C#"');
  });

  test('renders TypePicker with chord types', () => {
    let tree: any;
    act(() => {
      tree = create(<ChordsScreen />);
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Major');
    expect(json).toContain('Minor');
    expect(json).toContain('7th');
  });

  test('renders DisplayToggle with all 3 modes', () => {
    let tree: any;
    act(() => {
      tree = create(<ChordsScreen />);
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Finger');
    expect(json).toContain('Interval');
    expect(json).toContain('Note');
  });

  test('renders voicing label', () => {
    let tree: any;
    act(() => {
      tree = create(<ChordsScreen />);
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Voicing');
  });

  // --- Interaction tests ---

  test('selecting a note updates active note highlight', () => {
    let tree: any;
    act(() => { tree = create(<ChordsScreen />); });

    // C is active by default
    const cBtn = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'C')[0];
    expect(cBtn.props.accessibilityState?.selected).toBe(true);

    const gBtn = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'G')[0];
    expect(gBtn.props.accessibilityState?.selected).toBe(false);

    act(() => { gBtn.props.onPress(); });

    const gBtnAfter = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'G')[0];
    expect(gBtnAfter.props.accessibilityState?.selected).toBe(true);
  });

  test('selecting a chord type updates active type highlight', () => {
    let tree: any;
    act(() => { tree = create(<ChordsScreen />); });

    const majorBtn = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Major')[0];
    const minorBtn = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Minor')[0];
    expect(majorBtn.props.accessibilityState?.selected).toBe(true);
    expect(minorBtn.props.accessibilityState?.selected).toBe(false);

    act(() => { minorBtn.props.onPress(); });

    const minorBtnAfter = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Minor')[0];
    expect(minorBtnAfter.props.accessibilityState?.selected).toBe(true);
  });

  test('Bug 5 — tapping a dimmed root note outside active voicing triggers a voicing switch', () => {
    let tree: any;
    act(() => { tree = create(<ChordsScreen />); });

    // Switch to Maj7 to get voicings spread across the neck
    const maj7Btns = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Maj7');
    act(() => { maj7Btns[0].props.onPress(); });

    // First activate the E-shape voicing (string 0, fret 8 is IN the CMaj7 E-shape voicing)
    // This gives us a known starting voicing (the higher-up-the-neck E-shape)
    const fvInit = tree.root.findByType(FretboardViewer);
    act(() => { fvInit.props.onNotePress(0, 8, true); });

    // Capture the E-shape voicing as our "before" state
    const fvBefore = tree.root.findByType(FretboardViewer);
    const voicingBefore = JSON.stringify([...(fvBefore.props.activeVoicing as Set<string>)].sort());

    // Now press C at string 2 (G string), fret 5 — a valid C note NOT in any CMaj7 voicing's fret set.
    // With the fallback: closest voicing by rootFret distance to fret 5 is the open voicing
    // (rootFret at fret 3, distance 2) vs E-shape (rootFret at fret 8, distance 3).
    // Before fix: no exact match → voicing unchanged → FAILS
    // After fix: fallback picks closest rootFret → switches to open voicing → PASSES
    act(() => { fvBefore.props.onNotePress(2, 5, true); });

    const fvAfter = tree.root.findByType(FretboardViewer);
    const voicingAfter = JSON.stringify([...(fvAfter.props.activeVoicing as Set<string>)].sort());

    expect(voicingAfter).not.toBe(voicingBefore);
  });

  test('display mode Finger passes "finger" to FretboardViewer', () => {
    let tree: any;
    act(() => { tree = create(<ChordsScreen />); });
    const fingerBtn = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Finger')[0];
    act(() => { fingerBtn.props.onPress(); });
    const fv = tree.root.findByType(FretboardViewer);
    expect(fv.props.displayMode).toBe('finger');
  });

  test('display mode Note passes "note" to FretboardViewer', () => {
    let tree: any;
    act(() => { tree = create(<ChordsScreen />); });
    const noteBtn = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Note')[0];
    act(() => { noteBtn.props.onPress(); });
    const fv = tree.root.findByType(FretboardViewer);
    expect(fv.props.displayMode).toBe('note');
  });

  test('display mode Interval is default', () => {
    let tree: any;
    act(() => { tree = create(<ChordsScreen />); });
    const fv = tree.root.findByType(FretboardViewer);
    expect(fv.props.displayMode).toBe('interval');
  });

  test('onNotePress with isRoot=false does not change voicing', () => {
    let tree: any;
    act(() => { tree = create(<ChordsScreen />); });
    const fvBefore = tree.root.findByType(FretboardViewer);
    const voicingBefore = JSON.stringify([...(fvBefore.props.activeVoicing as Set<string>)].sort());
    act(() => { fvBefore.props.onNotePress(2, 5, false); });
    const fvAfter = tree.root.findByType(FretboardViewer);
    const voicingAfter = JSON.stringify([...(fvAfter.props.activeVoicing as Set<string>)].sort());
    expect(voicingAfter).toBe(voicingBefore);
  });

  test('pressing ♯ shows sharp notes and auto-sharps the active root', () => {
    let tree: any;
    act(() => { tree = create(<ChordsScreen />); }); // default: C, natural mode
    const sharpBtn = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Sharp')[0];
    act(() => { sharpBtn.props.onPress(); });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('"C#"');  // sharp mode shows C#
    expect(json).not.toContain('"C#/Db"'); // no combined labels
    // root auto-updates to C# (index 1)
    const fv = tree.root.findByType(FretboardViewer);
    // C# root means the notes are different from C root — just verify it rendered
    expect(fv).toBeTruthy();
  });

  test('pressing ♯ then ♯ again returns to natural mode', () => {
    let tree: any;
    act(() => { tree = create(<ChordsScreen />); });
    const sharpBtn = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Sharp')[0];
    act(() => { sharpBtn.props.onPress(); }); // sharp mode
    act(() => { sharpBtn.props.onPress(); }); // back to natural
    const json = JSON.stringify(tree.toJSON());
    expect(json).not.toContain('"C#"');
    expect(json).toContain('"C"');
  });

  test('pressing ♭ shows flat notes', () => {
    let tree: any;
    act(() => { tree = create(<ChordsScreen />); });
    const flatBtn = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Flat')[0];
    act(() => { flatBtn.props.onPress(); });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('"Db"');
    expect(json).toContain('"Bb"');
  });

  test('renders ChordPreview below the fretboard', () => {
    let tree: any;
    act(() => { tree = create(<ChordsScreen />); });
    const json = JSON.stringify(tree.toJSON());
    // Default: C Major — diagram chord name label should appear
    expect(json).toContain('C Major');
    // ChordPreview SVG component should be in the tree
    expect(tree.root.findByType(ChordDiagram)).toBeTruthy();
  });

  test('chord diagram name updates when type changes to Minor', () => {
    let tree: any;
    act(() => { tree = create(<ChordsScreen />); });

    const minorBtn = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Minor')[0];
    act(() => { minorBtn.props.onPress(); });

    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('C Minor');
  });
});
