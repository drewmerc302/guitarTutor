// src/screens/__tests__/ChordsScreen.test.tsx
import React from 'react';
import { create, act } from 'react-test-renderer';
import { ChordsScreen } from '../ChordsScreen';
import { FretboardViewer as _FretboardViewer } from '../../components';
// React.memo wraps FretboardViewerInner; react-test-renderer stores the inner
// function as the fiber type, so findByType requires the unwrapped component.
const FretboardViewer = (_FretboardViewer as any).type as typeof _FretboardViewer;

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
    // Should have all 12 notes for root selection
    expect(json).toContain('"C"');
    expect(json).toContain('"G"');
    expect(json).toContain('"A"');
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
    expect(json).toContain('Voicing:');
  });

  // --- Interaction tests ---

  test('selecting a note updates active note highlight', () => {
    let tree: any;
    act(() => { tree = create(<ChordsScreen />); });
    const root = tree.root;

    const initialButtons = root.findAllByType('TouchableOpacity');
    const activeStyle = JSON.stringify([].concat(...initialButtons[0].props.style));
    const inactiveStyle = JSON.stringify([].concat(...initialButtons[1].props.style));
    expect(activeStyle).not.toEqual(inactiveStyle); // C is active, C# is not

    act(() => { initialButtons[4].props.onPress(); }); // press E (index 4)

    const updatedButtons = root.findAllByType('TouchableOpacity');
    const newActiveStyle = JSON.stringify([].concat(...updatedButtons[4].props.style));
    const prevActiveStyle = JSON.stringify([].concat(...updatedButtons[0].props.style));
    expect(newActiveStyle).not.toEqual(prevActiveStyle);
  });

  test('selecting a chord type updates active type highlight', () => {
    let tree: any;
    act(() => { tree = create(<ChordsScreen />); });
    const root = tree.root;

    // 0-11: note chips, 12: Major (first type, active by default)
    const initialButtons = root.findAllByType('TouchableOpacity');
    const majorStyle = JSON.stringify([].concat(...initialButtons[12].props.style));
    const minorStyle = JSON.stringify([].concat(...initialButtons[13].props.style));
    expect(majorStyle).not.toEqual(minorStyle);

    act(() => { initialButtons[13].props.onPress(); }); // press Minor

    const updatedButtons = root.findAllByType('TouchableOpacity');
    const newMinorStyle = JSON.stringify([].concat(...updatedButtons[13].props.style));
    const prevMajorStyle = JSON.stringify([].concat(...updatedButtons[12].props.style));
    expect(newMinorStyle).not.toEqual(prevMajorStyle);
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
});
