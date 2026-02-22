// src/screens/__tests__/ArpeggiosScreen.test.tsx
import React from 'react';
import { create, act } from 'react-test-renderer';
import { ArpeggiosScreen } from '../ArpeggiosScreen';
import { assignSweepOrder } from '../../engine/fingers';
import { getNotesOnFretboard } from '../../engine/fretboard';
import { ARP_TYPES } from '../../engine/arpeggios';
import { FretboardViewer as _FV } from '../../components';

describe('ArpeggiosScreen', () => {
  test('renders without crashing', () => {
    let tree: any;
    act(() => { tree = create(<ArpeggiosScreen />); });
    expect(tree.toJSON()).toBeTruthy();
  });

  test('renders title', () => {
    let tree: any;
    act(() => { tree = create(<ArpeggiosScreen />); });
    expect(JSON.stringify(tree.toJSON())).toContain('Arpeggios');
  });

  test('renders arpeggio type options', () => {
    let tree: any;
    act(() => { tree = create(<ArpeggiosScreen />); });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Major');
    expect(json).toContain('Minor');
    expect(json).toContain('Dom7');
    expect(json).toContain('Maj7');
  });

  test('renders display modes', () => {
    let tree: any;
    act(() => { tree = create(<ArpeggiosScreen />); });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Interval');
    expect(json).toContain('Note');
    expect(json).toContain('Finger');
  });

  test('renders Root label', () => {
    let tree: any;
    act(() => { tree = create(<ArpeggiosScreen />); });
    expect(JSON.stringify(tree.toJSON())).toContain('Root');
  });

  test('renders hint text', () => {
    let tree: any;
    act(() => { tree = create(<ArpeggiosScreen />); });
    expect(JSON.stringify(tree.toJSON())).toContain('arpeggio');
  });

  // --- Interaction tests ---

  test('selecting a note updates active note highlight', () => {
    let tree: any;
    act(() => { tree = create(<ArpeggiosScreen />); });
    const root = tree.root;

    const initialButtons = root.findAllByType('TouchableOpacity');
    const activeStyle = JSON.stringify([].concat(...initialButtons[0].props.style));
    const inactiveStyle = JSON.stringify([].concat(...initialButtons[1].props.style));
    expect(activeStyle).not.toEqual(inactiveStyle); // C is active, C# is not

    act(() => { initialButtons[2].props.onPress(); }); // press D

    const updatedButtons = root.findAllByType('TouchableOpacity');
    const newActiveStyle = JSON.stringify([].concat(...updatedButtons[2].props.style));
    const prevActiveStyle = JSON.stringify([].concat(...updatedButtons[0].props.style));
    expect(newActiveStyle).not.toEqual(prevActiveStyle);
  });

  test('selecting an arpeggio type updates active type highlight', () => {
    let tree: any;
    act(() => { tree = create(<ArpeggiosScreen />); });
    const root = tree.root;

    // 0-11: note chips, 12+: type chips. Major (index 12) active by default.
    const initialButtons = root.findAllByType('TouchableOpacity');
    const majorStyle = JSON.stringify([].concat(...initialButtons[12].props.style));
    const dom7Style = JSON.stringify([].concat(...initialButtons[14].props.style));
    expect(majorStyle).not.toEqual(dom7Style);

    act(() => { initialButtons[14].props.onPress(); }); // press Dom7

    const updatedButtons = root.findAllByType('TouchableOpacity');
    const newDom7Style = JSON.stringify([].concat(...updatedButtons[14].props.style));
    const prevMajorStyle = JSON.stringify([].concat(...updatedButtons[12].props.style));
    expect(newDom7Style).not.toEqual(prevMajorStyle);
  });

  // --- Sweep order tests ---

  test('assignSweepOrder produces consecutive 1-based finger numbers for C Major arpeggio', () => {
    const intervals = ARP_TYPES['Major'];
    const notes = getNotesOnFretboard(0, intervals).map(n => ({ ...n }));
    assignSweepOrder(notes);
    const fingers = notes.map(n => n.finger).filter(f => f !== null) as number[];
    fingers.sort((a, b) => a - b);
    expect(fingers[0]).toBe(1);
    for (let i = 1; i < fingers.length; i++) {
      expect(fingers[i]).toBe(fingers[i - 1] + 1);
    }
  });

  test('sweep order is sorted: lowest string (string 5) gets the lowest sweep number', () => {
    const intervals = ARP_TYPES['Major'];
    const notes = getNotesOnFretboard(0, intervals).map(n => ({ ...n }));
    assignSweepOrder(notes);
    const string5Notes = notes.filter(n => n.string === 5);
    const string0Notes = notes.filter(n => n.string === 0);
    if (string5Notes.length > 0 && string0Notes.length > 0) {
      const minString5Finger = Math.min(...string5Notes.map(n => n.finger ?? Infinity));
      const maxString0Finger = Math.max(...string0Notes.map(n => n.finger ?? -Infinity));
      expect(minString5Finger).toBeLessThan(maxString0Finger);
    }
  });

  test('within same string, lower fret note has a lower sweep number than higher fret note', () => {
    const intervals = ARP_TYPES['Major'];
    const notes = getNotesOnFretboard(0, intervals).map(n => ({ ...n }));
    assignSweepOrder(notes);
    for (let s = 0; s < 6; s++) {
      const stringNotes = notes.filter(n => n.string === s).sort((a, b) => a.fret - b.fret);
      for (let i = 0; i < stringNotes.length - 1; i++) {
        expect(stringNotes[i].finger).toBeLessThan(stringNotes[i + 1].finger!);
      }
    }
  });

  // --- Display mode tests ---

  test('Finger display mode passes "finger" to FretboardViewer', () => {
    let tree: any;
    act(() => { tree = create(<ArpeggiosScreen />); });
    const fingerBtn = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Finger')[0];
    act(() => { fingerBtn.props.onPress(); });
    const FV = (_FV as any).type;
    const fv = tree.root.findByType(FV);
    expect(fv.props.displayMode).toBe('finger');
  });

  test('Note display mode passes "note" to FretboardViewer', () => {
    let tree: any;
    act(() => { tree = create(<ArpeggiosScreen />); });
    const noteBtn = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Note')[0];
    act(() => { noteBtn.props.onPress(); });
    const FV = (_FV as any).type;
    const fv = tree.root.findByType(FV);
    expect(fv.props.displayMode).toBe('note');
  });

  test('Interval display mode is default', () => {
    let tree: any;
    act(() => { tree = create(<ArpeggiosScreen />); });
    const FV = (_FV as any).type;
    const fv = tree.root.findByType(FV);
    expect(fv.props.displayMode).toBe('interval');
  });

  test('Finger mode renders sweep-picking hint text', () => {
    let tree: any;
    act(() => { tree = create(<ArpeggiosScreen />); });
    const fingerBtn = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Finger')[0];
    act(() => { fingerBtn.props.onPress(); });
    expect(JSON.stringify(tree.toJSON())).toContain('sweep');
  });

  test('non-Finger mode renders general arpeggio hint text', () => {
    let tree: any;
    act(() => { tree = create(<ArpeggiosScreen />); });
    // Default is Interval
    expect(JSON.stringify(tree.toJSON())).toContain('chord played one note at a time');
  });
});
