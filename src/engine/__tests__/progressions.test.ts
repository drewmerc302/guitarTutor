// src/engine/__tests__/progressions.test.ts
import { getDiatonicChords, CIRCLE_OF_FIFTHS, DiatonicChord } from '../progressions';

describe('getDiatonicChords', () => {
  test('returns 7 chords for any key', () => {
    const chords = getDiatonicChords(0); // C
    expect(chords).toHaveLength(7);
  });

  test('C major diatonic chords have correct roman numerals', () => {
    const chords = getDiatonicChords(0);
    expect(chords.map(c => c.numeral)).toEqual(['I','ii','iii','IV','V','vi','vii°']);
  });

  test('C major diatonic chord roots are correct', () => {
    const chords = getDiatonicChords(0);
    // C=0, D=2, E=4, F=5, G=7, A=9, B=11
    expect(chords.map(c => c.root)).toEqual([0, 2, 4, 5, 7, 9, 11]);
  });

  test('qualities follow Major-Minor-Minor-Major-Major-Minor-Dim pattern', () => {
    const chords = getDiatonicChords(0);
    expect(chords.map(c => c.quality)).toEqual(['Major','Minor','Minor','Major','Major','Minor','Dim']);
  });

  test('works for all 12 keys', () => {
    for (let root = 0; root < 12; root++) {
      const chords = getDiatonicChords(root);
      expect(chords).toHaveLength(7);
      expect(chords[0].quality).toBe('Major');
      expect(chords[0].root).toBe(root);
    }
  });
});

describe('CIRCLE_OF_FIFTHS', () => {
  test('has 12 notes in circle-of-fifths order', () => {
    expect(CIRCLE_OF_FIFTHS).toEqual([0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5]);
  });
});
