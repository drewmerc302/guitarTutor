// src/engine/__tests__/fingers.test.ts
import { assignFingers, assignSweepOrder } from '../fingers';
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

describe('assignSweepOrder', () => {
  test('assigns 1-based sweep order starting from lowest string (highest index)', () => {
    // string 5 = low E, string 0 = high E
    const notes = [makeNote(0, 3), makeNote(3, 5), makeNote(5, 3)];
    assignSweepOrder(notes);
    // string 5 fret 3 should be first (1), string 3 fret 5 second (2), string 0 fret 3 last (3)
    const byString5 = notes.find(n => n.string === 5)!;
    const byString3 = notes.find(n => n.string === 3)!;
    const byString0 = notes.find(n => n.string === 0)!;
    expect(byString5.finger).toBe(1);
    expect(byString3.finger).toBe(2);
    expect(byString0.finger).toBe(3);
  });

  test('within same string, lower fret gets lower sweep number', () => {
    const notes = [makeNote(2, 7), makeNote(2, 5), makeNote(2, 3)];
    assignSweepOrder(notes);
    const atFret3 = notes.find(n => n.fret === 3)!;
    const atFret5 = notes.find(n => n.fret === 5)!;
    const atFret7 = notes.find(n => n.fret === 7)!;
    expect(atFret3.finger).toBe(1);
    expect(atFret5.finger).toBe(2);
    expect(atFret7.finger).toBe(3);
  });

  test('sweep order covers all notes with consecutive 1-based indices', () => {
    const notes = [makeNote(0, 3), makeNote(1, 5), makeNote(2, 7), makeNote(3, 5), makeNote(4, 3), makeNote(5, 3)];
    assignSweepOrder(notes);
    const fingers = notes.map(n => n.finger).sort((a, b) => (a ?? 0) - (b ?? 0));
    expect(fingers).toEqual([1, 2, 3, 4, 5, 6]);
  });

  test('empty array is a no-op', () => {
    expect(() => assignSweepOrder([])).not.toThrow();
  });

  test('single note gets sweep order 1', () => {
    const notes = [makeNote(3, 5)];
    assignSweepOrder(notes);
    expect(notes[0].finger).toBe(1);
  });

  test('mutates notes in place', () => {
    const note = makeNote(2, 4);
    const notes = [note];
    assignSweepOrder(notes);
    expect(note.finger).toBe(1);
  });
});
