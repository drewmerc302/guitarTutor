// src/engine/__tests__/notes.test.ts
import { NOTE_NAMES, STANDARD_TUNING, TOTAL_FRETS, STRING_NAMES, noteValue } from '../notes';

describe('notes', () => {
  test('NOTE_NAMES has 12 chromatic notes starting from C', () => {
    expect(NOTE_NAMES).toEqual(['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']);
  });

  test('STANDARD_TUNING represents EADGBE high to low as note indices', () => {
    // E=4, B=11, G=7, D=2, A=9, E=4
    expect(STANDARD_TUNING).toEqual([4, 11, 7, 2, 9, 4]);
    expect(STANDARD_TUNING).toHaveLength(6);
  });

  test('STRING_NAMES labels are E B G D A E', () => {
    expect(STRING_NAMES).toEqual(['E','B','G','D','A','E']);
  });

  test('TOTAL_FRETS is 24', () => {
    expect(TOTAL_FRETS).toBe(24);
  });

  test('noteValue computes correct note at string/fret position', () => {
    // Open high E string (index 0) = E = 4
    expect(noteValue(0, 0)).toBe(4);
    // 1st fret high E = F = 5
    expect(noteValue(0, 1)).toBe(5);
    // Open A string (index 4) = A = 9
    expect(noteValue(4, 0)).toBe(9);
    // 3rd fret A string = C = 0
    expect(noteValue(4, 3)).toBe(0);
    // Wraps around: 12th fret = same as open
    expect(noteValue(0, 12)).toBe(4);
  });
});
