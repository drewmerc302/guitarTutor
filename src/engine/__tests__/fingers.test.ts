// src/engine/__tests__/fingers.test.ts
import { assignFingers } from '../fingers';
import { FretboardNote } from '../fretboard';

function makeNote(s: number, f: number): FretboardNote {
  return { string: s, fret: f, note: 0, interval: 0, intervalLabel: 'R', isRoot: true, noteName: 'C', finger: null };
}

describe('assignFingers', () => {
  test('all open strings get finger 0', () => {
    const notes = [makeNote(0, 0), makeNote(1, 0), makeNote(2, 0)];
    assignFingers(notes);
    expect(notes.every(n => n.finger === 0)).toBe(true);
  });

  test('standard 4-fret position assigns fingers 1-4', () => {
    const notes = [makeNote(0, 5), makeNote(1, 6), makeNote(2, 7), makeNote(3, 8)];
    assignFingers(notes);
    expect(notes[0].finger).toBe(1);
    expect(notes[1].finger).toBe(2);
    expect(notes[2].finger).toBe(3);
    expect(notes[3].finger).toBe(4);
  });

  test('mixed open and fretted notes', () => {
    const notes = [makeNote(0, 0), makeNote(1, 2), makeNote(2, 2), makeNote(3, 1)];
    assignFingers(notes);
    expect(notes[0].finger).toBe(0); // open
    expect(notes[3].finger).toBe(1); // fret 1 = index
  });

  test('single fretted note gets finger 1', () => {
    const notes = [makeNote(2, 5)];
    assignFingers(notes);
    expect(notes[0].finger).toBe(1);
  });

  test('fingers never exceed 4', () => {
    const notes = [makeNote(0, 1), makeNote(1, 3), makeNote(2, 5), makeNote(3, 7), makeNote(4, 9)];
    assignFingers(notes);
    for (const n of notes) {
      expect(n.finger).toBeLessThanOrEqual(4);
      expect(n.finger).toBeGreaterThanOrEqual(1);
    }
  });
});
