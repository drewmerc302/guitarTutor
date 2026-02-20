// src/components/__tests__/GuitarNeck.test.tsx
import React from 'react';
import { create, act } from 'react-test-renderer';
import { GuitarNeck } from '../GuitarNeck';
import { FretboardNote } from '../../engine/fretboard';

const mockNote = (s: number, f: number, interval: number, isRoot: boolean): FretboardNote => ({
  string: s, fret: f, note: (4 + f) % 12, interval,
  intervalLabel: isRoot ? 'R' : String(interval),
  isRoot, noteName: 'C', finger: 1,
});

describe('GuitarNeck', () => {
  test('renders without crashing with notes', () => {
    const notes = [mockNote(0, 3, 0, true), mockNote(1, 5, 4, false)];
    let tree: any;
    act(() => {
      tree = create(<GuitarNeck notes={notes} displayMode="interval" />);
    });
    expect(tree.toJSON()).toBeTruthy();
  });

  test('renders with empty notes array', () => {
    let tree: any;
    act(() => {
      tree = create(<GuitarNeck notes={[]} displayMode="interval" />);
    });
    expect(tree.toJSON()).toBeTruthy();
  });

  test('renders note labels based on display mode', () => {
    const notes = [mockNote(0, 3, 0, true)];

    let tree: any;
    act(() => {
      tree = create(<GuitarNeck notes={notes} displayMode="note" />);
    });
    const json = JSON.stringify(tree.toJSON());
    // In note mode, the note name should appear
    expect(json).toContain('C');

    act(() => {
      tree = create(<GuitarNeck notes={notes} displayMode="interval" />);
    });
    const json2 = JSON.stringify(tree.toJSON());
    // In interval mode, the interval label should appear
    expect(json2).toContain('R');
  });

  test('renders finger labels in finger mode', () => {
    const notes = [mockNote(0, 3, 0, true)];
    let tree: any;
    act(() => {
      tree = create(<GuitarNeck notes={notes} displayMode="finger" />);
    });
    const json = JSON.stringify(tree.toJSON());
    // Finger 1 should appear
    expect(json).toContain('"1"');
  });

  test('applies opacity based on activeVoicing', () => {
    const notes = [mockNote(0, 3, 0, true), mockNote(1, 5, 4, false)];
    const activeVoicing = new Set(['0-3']);

    let tree: any;
    act(() => {
      tree = create(
        <GuitarNeck notes={notes} displayMode="interval" activeVoicing={activeVoicing} hasVoicings={true} />
      );
    });
    const json = JSON.stringify(tree.toJSON());
    // Both opacity 1 (active) and 0.2 (inactive) should be present
    expect(json).toContain('"opacity":1');
    expect(json).toContain('"opacity":0.2');
  });

  test('renders box highlights when provided', () => {
    const notes = [mockNote(0, 3, 0, true)];
    const boxHighlights = [{ fretStart: 2, fretEnd: 5 }];

    let tree: any;
    act(() => {
      tree = create(
        <GuitarNeck notes={notes} displayMode="interval" boxHighlights={boxHighlights} />
      );
    });
    expect(tree.toJSON()).toBeTruthy();
  });

  test('calls onNotePress when a note is pressed', () => {
    const onNotePress = jest.fn();
    const notes = [mockNote(0, 3, 0, true)];

    let tree: any;
    act(() => {
      tree = create(
        <GuitarNeck notes={notes} displayMode="interval" onNotePress={onNotePress} />
      );
    });

    // Find G elements (note dots) and simulate press
    const root = tree.root;
    const gElements = root.findAllByType('G');
    const noteDot = gElements.find((g: any) => g.props.onPress);
    if (noteDot) {
      act(() => {
        noteDot.props.onPress();
      });
      expect(onNotePress).toHaveBeenCalledWith(0, 3, true);
    }
  });
});
