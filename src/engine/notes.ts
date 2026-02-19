// src/engine/notes.ts
export const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
export const STANDARD_TUNING = [4, 11, 7, 2, 9, 4]; // E B G D A E (high to low)
export const STRING_NAMES = ['E','B','G','D','A','E'];
export const TOTAL_FRETS = 15;

/** Get the note value (0-11) at a given string and fret. */
export function noteValue(string: number, fret: number): number {
  return (STANDARD_TUNING[string] + fret) % 12;
}
