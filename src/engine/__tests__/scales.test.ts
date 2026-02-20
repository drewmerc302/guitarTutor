// src/engine/__tests__/scales.test.ts
import { SCALE_TYPES, MODE_NAMES, computeScalePositions, applyModeRotation, ScalePosition } from '../scales';

describe('SCALE_TYPES', () => {
  test('Major scale is [0,2,4,5,7,9,11]', () => {
    expect(SCALE_TYPES['Major']).toEqual([0,2,4,5,7,9,11]);
  });
  test('Minor Pentatonic is [0,3,5,7,10]', () => {
    expect(SCALE_TYPES['Minor Pentatonic']).toEqual([0,3,5,7,10]);
  });
  test('Blues scale is [0,3,5,6,7,10]', () => {
    expect(SCALE_TYPES['Blues']).toEqual([0,3,5,6,7,10]);
  });
});

describe('MODE_NAMES', () => {
  test('has 7 modes in correct order', () => {
    expect(MODE_NAMES).toEqual(['Ionian','Dorian','Phrygian','Lydian','Mixolydian','Aeolian','Locrian']);
  });
});

describe('applyModeRotation', () => {
  test('mode 0 (Ionian) returns original intervals', () => {
    const result = applyModeRotation([0,2,4,5,7,9,11], 0);
    expect(result).toEqual([0,2,4,5,7,9,11]);
  });

  test('mode 1 (Dorian) rotates correctly', () => {
    const result = applyModeRotation([0,2,4,5,7,9,11], 1);
    expect(result).toEqual([0,2,3,5,7,9,10]);
  });

  test('mode 5 (Aeolian) equals natural minor', () => {
    const result = applyModeRotation([0,2,4,5,7,9,11], 5);
    expect(result).toEqual([0,2,3,5,7,8,10]);
  });
});

describe('computeScalePositions', () => {
  test('returns positions for C major (Box 1 starts at fret 8, root C on low E)', () => {
    // C major: low E (open=4), C=0, first fret: (4+8)%12=0. Root at fret 8.
    // With TOTAL_FRETS=15, boxes fit from fret 8 onward within the neck.
    const positions = computeScalePositions(0, [0,2,4,5,7,9,11]);
    expect(positions).toHaveLength(4);
    expect(positions[0].fretStart).toBe(8);
  });

  test('each position has label, fretStart, fretEnd, and notes', () => {
    const positions = computeScalePositions(0, [0,2,4,5,7,9,11]);
    for (const pos of positions) {
      expect(pos.label).toMatch(/^Box \d+$/);
      expect(typeof pos.fretStart).toBe('number');
      expect(typeof pos.fretEnd).toBe('number');
      expect(pos.fretEnd).toBeGreaterThan(pos.fretStart);
      expect(pos.notes.length).toBeGreaterThan(0);
    }
  });

  test('each box spans exactly 3 frets (fretEnd - fretStart === 3)', () => {
    const positions = computeScalePositions(9, [0, 3, 5, 7, 10]);
    for (const pos of positions) {
      expect(pos.fretEnd - pos.fretStart).toBe(3);
    }
  });

  test('notes only contain scale tones', () => {
    const intervals = [0,2,4,5,7,9,11];
    const intervalSet = new Set(intervals);
    const positions = computeScalePositions(0, intervals);
    for (const pos of positions) {
      for (const note of pos.notes) {
        expect(intervalSet.has(note.interval)).toBe(true);
      }
    }
  });

  test('notes have finger assignments', () => {
    const positions = computeScalePositions(0, [0,2,4,5,7,9,11]);
    for (const pos of positions) {
      for (const note of pos.notes) {
        expect(note.finger).not.toBeNull();
      }
    }
  });

  test('works for all 12 roots', () => {
    for (let root = 0; root < 12; root++) {
      const positions = computeScalePositions(root, [0,2,4,5,7,9,11]);
      expect(positions.length).toBeGreaterThanOrEqual(3);
    }
  });

  test('A minor pentatonic Box 1 starts at fret 5 (root A on low E)', () => {
    // Low E (STANDARD_TUNING[5] = 4). A = note value 9. Fret: (4 + 5) % 12 = 9. ✓
    const positions = computeScalePositions(9, [0, 3, 5, 7, 10]);
    expect(positions[0].fretStart).toBe(5);
  });

  test('Box 1 always starts at the root note on the low E string for all 12 roots', () => {
    const LOW_E_OPEN = 4; // STANDARD_TUNING[5]
    for (let root = 0; root < 12; root++) {
      // Find the first fret on low E that produces this root note
      let expectedFret = 0;
      for (let f = 0; f <= 24; f++) {
        if ((LOW_E_OPEN + f) % 12 === root) { expectedFret = f; break; }
      }
      const positions = computeScalePositions(root, [0, 2, 4, 5, 7, 9, 11]);
      expect(positions[0].fretStart).toBe(expectedFret);
    }
  });
});
