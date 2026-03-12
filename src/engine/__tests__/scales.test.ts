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
  test('returns 7 positions for C major', () => {
    const positions = computeScalePositions(0, [0,2,4,5,7,9,11]);
    expect(positions.length).toBe(7);
    for (const pos of positions) {
      expect(pos.fretStart).toBeLessThanOrEqual(TOTAL_FRETS);
    }
    const box1 = positions.find(p => p.label === 'Box 1')!;
    expect(box1.fretStart).toBe(7);
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

  test('box labels contain Box and number', () => {
    const positions = computeScalePositions(9, [0, 3, 5, 7, 10]);
    positions.forEach((pos) => {
      expect(pos.label).toMatch(/^Box \d+$/);
    });
  });

  describe('property-based: all 12 roots × all scale types', () => {
    const ALL_ROOTS = Array.from({ length: 12 }, (_, i) => i);
    const ALL_ENTRIES = Object.entries(SCALE_TYPES) as [string, number[]][];

    test('returns exactly N positions for all combinations', () => {
      for (const [, intervals] of ALL_ENTRIES) {
        for (const root of ALL_ROOTS) {
          const positions = computeScalePositions(root, intervals);
          expect(positions.length).toBe(intervals.length);
        }
      }
    });

    test('Box 1 exists and contains root on low E (string 5) for all combinations', () => {
      for (const [, intervals] of ALL_ENTRIES) {
        for (const root of ALL_ROOTS) {
          const positions = computeScalePositions(root, intervals);
          const box1 = positions.find(p => p.label === 'Box 1');
          expect(box1).toBeDefined();
          const rootNote = box1!.notes.find(n => n.isRoot && n.string === 5);
          expect(rootNote).toBeDefined();
        }
      }
    });

    test('positions sorted by fretStart ascending for all combinations', () => {
      for (const [, intervals] of ALL_ENTRIES) {
        for (const root of ALL_ROOTS) {
          const positions = computeScalePositions(root, intervals);
          for (let i = 1; i < positions.length; i++) {
            expect(positions[i].fretStart).toBeGreaterThanOrEqual(positions[i - 1].fretStart);
          }
        }
      }
    });

    test('scale tones only for all combinations', () => {
      for (const [, intervals] of ALL_ENTRIES) {
        const intervalSet = new Set(intervals);
        for (const root of ALL_ROOTS) {
          const positions = computeScalePositions(root, intervals);
          for (const pos of positions) {
            for (const note of pos.notes) {
              expect(intervalSet.has(note.interval)).toBe(true);
            }
          }
        }
      }
    });

    test('fretEnd > fretStart for every position', () => {
      for (const [, intervals] of ALL_ENTRIES) {
        for (const root of ALL_ROOTS) {
          const positions = computeScalePositions(root, intervals);
          for (const pos of positions) {
            expect(pos.fretEnd).toBeGreaterThan(pos.fretStart);
          }
        }
      }
    });

    test('all note frets in [0, TOTAL_FRETS] for all combinations', () => {
      for (const [, intervals] of ALL_ENTRIES) {
        for (const root of ALL_ROOTS) {
          const positions = computeScalePositions(root, intervals);
          for (const pos of positions) {
            for (const note of pos.notes) {
              expect(note.fret).toBeGreaterThanOrEqual(0);
              expect(note.fret).toBeLessThanOrEqual(TOTAL_FRETS);
            }
          }
        }
      }
    });

    test('every note has a non-null finger for all combinations', () => {
      for (const [, intervals] of ALL_ENTRIES) {
        for (const root of ALL_ROOTS) {
          const positions = computeScalePositions(root, intervals);
          for (const pos of positions) {
            for (const note of pos.notes) {
              expect(note.finger).not.toBeNull();
            }
          }
        }
      }
    });

    test('all labels match /^Box \\d+$/ for all combinations', () => {
      for (const [, intervals] of ALL_ENTRIES) {
        for (const root of ALL_ROOTS) {
          const positions = computeScalePositions(root, intervals);
          for (const pos of positions) {
            expect(pos.label).toMatch(/^Box \d+$/);
          }
        }
      }
    });
  });

  describe('golden set', () => {
    describe('Am pentatonic (root 9, intervals [0,3,5,7,10])', () => {
      // Am pentatonic low-E anchors: [3(G), 5(A=root), 8(C), 10(D), 12(E)]
      // Box 5 below root at 3, Box 1 at 5, Box 2 at 8, Box 3 at 10, Box 4 at 12
      let positions: ScalePosition[];
      beforeEach(() => { positions = computeScalePositions(9, [0, 3, 5, 7, 10]); });

      test('returns exactly 5 positions', () => {
        expect(positions.length).toBe(5);
      });

      test('Box 1 fretStart === 5', () => {
        const box = positions.find(p => p.label === 'Box 1')!;
        expect(box.fretStart).toBe(5);
      });

      test('Box 2 fretStart === 7 (G-string D at fret 7 is in the window)', () => {
        // anchor=8, windowStart=7; G string fret 7 = D (interval 5) is a scale tone
        const box = positions.find(p => p.label === 'Box 2')!;
        expect(box.fretStart).toBe(7);
      });

      test('Box 3 fretEnd >= 13 (B-string C at fret 13 is in the window)', () => {
        // anchor=10, A_next=12, windowEnd=13; B string fret 13 = C (interval 3) is a scale tone
        const box = positions.find(p => p.label === 'Box 3')!;
        expect(box.fretEnd).toBeGreaterThanOrEqual(13);
      });

      test('Box 4 fretStart === 12', () => {
        const box = positions.find(p => p.label === 'Box 4')!;
        expect(box.fretStart).toBe(12);
      });

      test('Box 5 fretStart <= 4 and includes at least one open string note', () => {
        // anchor=3, open string rule fires; open E/G/D/A strings are in Am pentatonic
        const box = positions.find(p => p.label === 'Box 5')!;
        expect(box.fretStart).toBeLessThanOrEqual(4);
        const openNote = box.notes.find(n => n.fret === 0);
        expect(openNote).toBeDefined();
      });
    });

    describe('C major (root 0, intervals [0,2,4,5,7,9,11])', () => {
      // C major low-E anchors (7-note): [7(B), 8(C=root), 10(D), 12(E), 13(F), 15(G), 17(A)]
      // Box 7 below root at 7, Box 1 at 8, Boxes 2-6 at 10,12,13,15,17
      let positions: ScalePosition[];
      beforeEach(() => { positions = computeScalePositions(0, [0, 2, 4, 5, 7, 9, 11]); });

      test('returns exactly 7 positions', () => {
        expect(positions.length).toBe(7);
      });

      test('Box 1 fretStart === 7 (anchor=8, windowStart=7; low E fret 7 = B is a scale tone)', () => {
        const box = positions.find(p => p.label === 'Box 1')!;
        expect(box.fretStart).toBe(7);
      });
    });
  });

  describe('regression', () => {
    test('Am pentatonic: no Box 5 with fretStart >= 14 (old wrap bug gone)', () => {
      const positions = computeScalePositions(9, [0, 3, 5, 7, 10]);
      const box5 = positions.find(p => p.label === 'Box 5');
      expect(box5).toBeDefined();
      expect(box5!.fretStart).toBeLessThan(14);
    });

    test('no 7-note scale returns exactly 5 boxes for any root', () => {
      const sevenNoteScales = Object.entries(SCALE_TYPES).filter(([, iv]) => iv.length === 7);
      for (const [, intervals] of sevenNoteScales) {
        for (let root = 0; root < 12; root++) {
          const positions = computeScalePositions(root, intervals);
          expect(positions.length).toBe(7);
        }
      }
    });
  });

});
