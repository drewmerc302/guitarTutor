// src/engine/progressions.ts

export interface DiatonicChord {
  numeral: string;
  root: number;
  quality: 'Major' | 'Minor' | 'Dim';
}

const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11];
const QUALITIES: ('Major' | 'Minor' | 'Dim')[] = ['Major','Minor','Minor','Major','Major','Minor','Dim'];
const NUMERALS = ['I','ii','iii','IV','V','vi','vii°'];

export const CIRCLE_OF_FIFTHS = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5];

/** Get the 7 diatonic chords for a given key root. */
export function getDiatonicChords(keyRoot: number): DiatonicChord[] {
  return MAJOR_SCALE.map((interval, i) => ({
    numeral: NUMERALS[i],
    root: (keyRoot + interval) % 12,
    quality: QUALITIES[i],
  }));
}
