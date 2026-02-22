// src/engine/__tests__/scales.test.ts
import { SCALE_TYPES, MODE_NAMES, computeScalePositions, applyModeRotation, ScalePosition } from '../scales';
import { TOTAL_FRETS } from '../notes';

describe('SCALE_TYPES', () => {
  test('Major scale is [0,2,4,5,7,9,11]', () => {
    expect(SCALE_TYPES['Major']).toEqual([0,2,4,5,7,9,11]);
  });
  test('Minor Pent. is [0,3,5,7,10]', () => {
    expect(SCALE_TYPES['Minor Pent.']).toEqual([0,3,5,7,10]);
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
  test('returns positions for C major with all 7 box positions wrapped to fit neck', () => {
    // C major: low E (open=4), C=0, root at fret 8.
    // With TOTAL_FRETS=15, forward boxes overflow so the algorithm wraps them back toward nut.
    // All 7 positions of a 7-note scale should be generated, all with fretStart <= TOTAL_FRETS.
    const positions = computeScalePositions(0, [0,2,4,5,7,9,11]);
    expect(positions).toHaveLength(7);
    for (const pos of positions) {
      expect(pos.fretStart).toBeLessThanOrEqual(TOTAL_FRETS);
      expect(pos.fretEnd).toBeLessThanOrEqual(TOTAL_FRETS + 3); // fretEnd is informational
    }
    // Box 1 must start at the root (C) position on low E (fret 8)
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

  test('A minor pentatonic produces 5 boxes all within the neck', () => {
    // Low E (STANDARD_TUNING[5] = 4). A = note value 9. Root at fret 5.
    // With wrapping at fret 12, boxes wrap back to fill lower frets.
    const positions = computeScalePositions(9, [0, 3, 5, 7, 10]);
    expect(positions).toHaveLength(5);
    for (const pos of positions) {
      expect(pos.fretStart).toBeLessThanOrEqual(TOTAL_FRETS);
    }
    // Box 1 must start at the root position on low E (fret 5)
    expect(positions[0].fretStart).toBe(5);
    // Subsequent boxes ascend up the neck
    expect(positions[1].fretStart).toBe(7);
    expect(positions[2].fretStart).toBe(9);
    expect(positions[3].fretStart).toBe(12);
    // With wrapping, box 5 wraps back to lower fret
    expect(positions[4].fretStart).toBe(3);
  });

  test('all boxes have fretStart within TOTAL_FRETS for all 12 roots and all scale types', () => {
    for (const [, intervals] of Object.entries(SCALE_TYPES)) {
      for (let root = 0; root < 12; root++) {
        const positions = computeScalePositions(root, intervals);
        for (const pos of positions) {
          expect(pos.fretStart).toBeLessThanOrEqual(TOTAL_FRETS);
        }
      }
    }
  });

  test('box labels are sequential starting from Box 1', () => {
    const positions = computeScalePositions(9, [0, 3, 5, 7, 10]);
    positions.forEach((pos, i) => {
      expect(pos.label).toBe(`Box ${i + 1}`);
    });
  });

  test('Box 1 always starts at the root note on low E string', () => {
    const LOW_E_OPEN = 4; // STANDARD_TUNING[5]
    for (let root = 0; root < 12; root++) {
      let rootFret = 0;
      for (let f = 0; f <= TOTAL_FRETS; f++) {
        if ((LOW_E_OPEN + f) % 12 === root) { rootFret = f; break; }
      }
      const positions = computeScalePositions(root, [0, 3, 5, 7, 10]);
      expect(positions[0].fretStart).toBe(rootFret);
    }
  });

  test('Box 1 starts at the root note on low E string for all 12 roots (major scale)', () => {
    // Box 1 should always be the root position on low E, regardless of wrapping.
    const LOW_E_OPEN = 4; // STANDARD_TUNING[5]
    for (let root = 0; root < 12; root++) {
      let rootFret = 0;
      for (let f = 0; f <= TOTAL_FRETS; f++) {
        if ((LOW_E_OPEN + f) % 12 === root) { rootFret = f; break; }
      }
      const positions = computeScalePositions(root, [0, 2, 4, 5, 7, 9, 11]);
      expect(positions[0].fretStart).toBe(rootFret);
    }
  });
});
