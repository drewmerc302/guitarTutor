// src/engine/__tests__/triads.test.ts
import { TRIAD_TYPES, computeTriadPositions } from '../triads';
import { FretboardNote } from '../fretboard';
import { STANDARD_TUNING } from '../notes';

describe('TRIAD_TYPES', () => {
  test('Major triad is [0,4,7]', () => {
    expect(TRIAD_TYPES['Major']).toEqual([0,4,7]);
  });
  test('has all four qualities', () => {
    expect(Object.keys(TRIAD_TYPES)).toEqual(['Major','Minor','Dim','Aug']);
  });
});

describe('computeTriadPositions', () => {
  test('returns notes for C major root position on strings 1-2-3', () => {
    const notes = computeTriadPositions(0, [0,4,7], [[0,1,2]], 0);
    expect(notes.length).toBeGreaterThan(0);
  });

  test('returns notes for all string groups', () => {
    const groups = [[0,1,2],[1,2,3],[2,3,4],[3,4,5]];
    const notes = computeTriadPositions(0, [0,4,7], groups, 0);
    expect(notes.length).toBeGreaterThan(0);
    // Should have notes on multiple string groups
    const strings = new Set(notes.map((n: { string: number }) => n.string));
    expect(strings.size).toBeGreaterThanOrEqual(3);
  });

  test('all notes are members of the triad', () => {
    const groups = [[0,1,2],[1,2,3],[2,3,4],[3,4,5]];
    const triadNoteSet = new Set([0, 4, 7]); // C, E, G
    const notes = computeTriadPositions(0, [0,4,7], groups, 0);
    for (const note of notes) {
      expect(triadNoteSet.has(note.note)).toBe(true);
    }
  });

  test('root position: lowest string in group has the root note', () => {
    // For group [0,1,2]: string 2 (G) is lowest pitched
    const notes = computeTriadPositions(0, [0,4,7], [[0,1,2]], 0);
    // Group by shapes (every 3 notes is a shape)
    for (let i = 0; i < notes.length; i += 3) {
      const shape = notes.slice(i, i + 3);
      const lowestStringNote = shape.reduce((a, b) => a.string > b.string ? a : b);
      expect(lowestStringNote.isRoot).toBe(true);
    }
  });

  test('1st inversion works', () => {
    const notes = computeTriadPositions(0, [0,4,7], [[0,1,2]], 1);
    expect(notes.length).toBeGreaterThan(0);
  });

  test('2nd inversion works', () => {
    const notes = computeTriadPositions(0, [0,4,7], [[0,1,2]], 2);
    expect(notes.length).toBeGreaterThan(0);
  });

  test('shapes have playable fret span (<=4)', () => {
    const groups = [[0,1,2],[1,2,3],[2,3,4],[3,4,5]];
    for (let root = 0; root < 12; root++) {
      const notes = computeTriadPositions(root, [0,4,7], groups, 0);
      for (let i = 0; i < notes.length; i += 3) {
        const shape = notes.slice(i, i + 3);
        const frets = shape.map((n: { fret: number }) => n.fret);
        const activeFrets = frets.filter((f: number) => f > 0);
        if (activeFrets.length > 0) {
          const span = Math.max(...frets) - Math.min(...activeFrets, Math.max(...frets));
          expect(span).toBeLessThanOrEqual(4);
        }
      }
    }
  });

  test('works for all 12 roots and all qualities', () => {
    const groups = [[0,1,2],[1,2,3],[2,3,4],[3,4,5]];
    for (const [name, intervals] of Object.entries({ 'Major': [0,4,7], 'Minor': [0,3,7], 'Dim': [0,3,6], 'Aug': [0,4,8] })) {
      for (let root = 0; root < 12; root++) {
        const notes = computeTriadPositions(root, intervals as number[], groups, 0);
        expect(notes.length).toBeGreaterThan(0);
      }
    }
  });
});
