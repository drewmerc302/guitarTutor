// src/screens/__tests__/ArpeggiosScreen.test.tsx
import React from 'react';
import { create, act } from 'react-test-renderer';
import { ArpeggiosScreen } from '../ArpeggiosScreen';
import { assignSweepOrder } from '../../engine/fingers';
import { getNotesOnFretboard } from '../../engine/fretboard';
import { ARP_TYPES } from '../../engine/arpeggios';

describe('ArpeggiosScreen', () => {
  test('renders without crashing', () => {
    let tree: any;
    act(() => {
      tree = create(<ArpeggiosScreen />);
    });
    expect(tree.toJSON()).toBeTruthy();
  });

  test('renders title', () => {
    let tree: any;
    act(() => {
      tree = create(<ArpeggiosScreen />);
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Arpeggios');
  });

  test('renders arpeggio type options', () => {
    let tree: any;
    act(() => {
      tree = create(<ArpeggiosScreen />);
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Major');
    expect(json).toContain('Minor');
    expect(json).toContain('Dom7');
    expect(json).toContain('Maj7');
  });

  test('renders DisplayToggle with Interval, Note, and Finger modes', () => {
    let tree: any;
    act(() => {
      tree = create(<ArpeggiosScreen />);
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Interval');
    expect(json).toContain('Note');
    expect(json).toContain('"Finger"');
  });

  test('renders root note picker', () => {
    let tree: any;
    act(() => {
      tree = create(<ArpeggiosScreen />);
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Root');
  });

  // --- Interaction tests ---

  test('selecting a note updates active note highlight', () => {
    let tree: any;
    act(() => { tree = create(<ArpeggiosScreen />); });
    const root = tree.root;

    // C (index 0) is active by default
    const initialButtons = root.findAllByType('TouchableOpacity');
    const initialStyle = [].concat(...initialButtons[0].props.style);
    expect(JSON.stringify(initialStyle)).toContain('#d4a04a');

    // Press D (index 2 in NotePicker)
    act(() => { initialButtons[2].props.onPress(); });

    const updatedButtons = root.findAllByType('TouchableOpacity');
    const updatedStyle = [].concat(...updatedButtons[2].props.style);
    expect(JSON.stringify(updatedStyle)).toContain('#d4a04a');

    const prevStyle = [].concat(...updatedButtons[0].props.style);
    expect(JSON.stringify(prevStyle)).not.toContain('#d4a04a');
  });

  test('selecting an arpeggio type updates active type highlight', () => {
    let tree: any;
    act(() => { tree = create(<ArpeggiosScreen />); });
    const root = tree.root;

    // 0-11 NotePicker, 12-19 TypePicker (Major=12, Minor=13, Dom7=14, ...)
    const initialButtons = root.findAllByType('TouchableOpacity');
    const majorStyle = [].concat(...initialButtons[12].props.style);
    expect(JSON.stringify(majorStyle)).toContain('#d4a04a');

    act(() => { initialButtons[14].props.onPress(); }); // press Dom7

    const updatedButtons = root.findAllByType('TouchableOpacity');
    const dom7Style = [].concat(...updatedButtons[14].props.style);
    expect(JSON.stringify(dom7Style)).toContain('#d4a04a');

    const prevMajorStyle = [].concat(...updatedButtons[12].props.style);
    expect(JSON.stringify(prevMajorStyle)).not.toContain('#d4a04a');
  });

  // --- Sweep order tests ---

  test('assignSweepOrder produces consecutive 1-based finger numbers for C Major arpeggio', () => {
    const intervals = ARP_TYPES['Major'];
    const notes = getNotesOnFretboard(0, intervals).map(n => ({ ...n }));
    assignSweepOrder(notes);
    const fingers = notes.map(n => n.finger).filter(f => f !== null) as number[];
    fingers.sort((a, b) => a - b);
    // Should be 1, 2, 3, ... N with no gaps
    expect(fingers[0]).toBe(1);
    for (let i = 1; i < fingers.length; i++) {
      expect(fingers[i]).toBe(fingers[i - 1] + 1);
    }
  });

  test('sweep order is sorted: lowest string (string 5) gets the lowest sweep number', () => {
    const intervals = ARP_TYPES['Major'];
    const notes = getNotesOnFretboard(0, intervals).map(n => ({ ...n }));
    assignSweepOrder(notes);
    // Find the note on the highest string index (string 5 = low E) with lowest fret
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
    // For each string that has multiple notes, verify fret order matches sweep order
    for (let s = 0; s < 6; s++) {
      const stringNotes = notes.filter(n => n.string === s).sort((a, b) => a.fret - b.fret);
      for (let i = 0; i < stringNotes.length - 1; i++) {
        expect(stringNotes[i].finger).toBeLessThan(stringNotes[i + 1].finger!);
      }
    }
  });
});
