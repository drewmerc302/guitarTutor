// src/engine/__tests__/fretboard.test.ts
import { getNotesOnFretboard, FretboardNote } from '../fretboard';

describe('getNotesOnFretboard', () => {
  test('C major triad (root=0, intervals=[0,4,7]) returns notes on all 6 strings', () => {
    const notes = getNotesOnFretboard(0, [0, 4, 7]);
    // Should have notes on every string
    const strings = new Set(notes.map(n => n.string));
    expect(strings.size).toBe(6);
    // Every note should be C, E, or G
    const validNotes = new Set([0, 4, 7]); // C, E, G
    for (const note of notes) {
      expect(validNotes.has(note.note)).toBe(true);
    }
  });

  test('root notes are flagged with isRoot=true', () => {
    const notes = getNotesOnFretboard(0, [0, 4, 7]);
    const roots = notes.filter(n => n.isRoot);
    expect(roots.length).toBeGreaterThan(0);
    for (const r of roots) {
      expect(r.note).toBe(0); // C
      expect(r.interval).toBe(0);
      expect(r.intervalLabel).toBe('R');
    }
  });

  test('intervalLabel matches interval name for each note', () => {
    const notes = getNotesOnFretboard(9, [0, 3, 7]); // A minor
    for (const n of notes) {
      if (n.interval === 0) expect(n.intervalLabel).toBe('R');
      else if (n.interval === 3) expect(n.intervalLabel).toBe('b3');
      else if (n.interval === 7) expect(n.intervalLabel).toBe('5');
    }
  });

  test('no notes beyond TOTAL_FRETS', () => {
    const notes = getNotesOnFretboard(0, [0, 4, 7]);
    for (const n of notes) {
      expect(n.fret).toBeLessThanOrEqual(15);
      expect(n.fret).toBeGreaterThanOrEqual(0);
    }
  });

  test('noteName is populated correctly', () => {
    const notes = getNotesOnFretboard(0, [0, 4, 7]);
    for (const n of notes) {
      if (n.note === 0) expect(n.noteName).toBe('C');
      else if (n.note === 4) expect(n.noteName).toBe('E');
      else if (n.note === 7) expect(n.noteName).toBe('G');
    }
  });
});
