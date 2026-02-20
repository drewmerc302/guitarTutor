// src/engine/notes.ts
export const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
export const NOTE_NAMES_FLAT = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
import { STANDARD_TUNING } from './tuning';
export { STANDARD_TUNING, TOTAL_FRETS, STRING_NAMES } from './tuning';

/** Get the note value (0-11) at a given string and fret. */
export function noteValue(string: number, fret: number): number {
  return (STANDARD_TUNING[string] + fret) % 12;
}
