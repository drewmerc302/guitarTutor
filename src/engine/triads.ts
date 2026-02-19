// src/engine/triads.ts
import { STANDARD_TUNING, TOTAL_FRETS, NOTE_NAMES } from './notes';
import { INTERVAL_NAMES } from './intervals';
import { FretboardNote } from './fretboard';

export const TRIAD_TYPES: Record<string, number[]> = {
  'Major': [0,4,7], 'Minor': [0,3,7], 'Dim': [0,3,6], 'Aug': [0,4,8],
};

/**
 * Compute all playable triad shapes for a given root, intervals, string groups, and inversion.
 *
 * String groups are ordered high-to-low: [0,1,2] = high E, B, G.
 * For root position, the root goes on the lowest-pitched string in the group.
 */
export function computeTriadPositions(
  root: number, intervals: number[], stringGroups: number[][], inversion: number
): FretboardNote[] {
  // orderedIntervals: voices from LOW to HIGH pitch
  let orderedIntervals = [...intervals];
  if (inversion === 1) orderedIntervals = [intervals[1], intervals[2], intervals[0] + 12];
  else if (inversion === 2) orderedIntervals = [intervals[2], intervals[0] + 12, intervals[1] + 12];

  const targetNotes = orderedIntervals.map(iv => (root + iv) % 12);
  const notes: FretboardNote[] = [];
  const shapeKeys = new Set<string>();

  for (const group of stringGroups) {
    // group[0]=highest string, group[2]=lowest string
    // targetNotes[0]=lowest voice → goes on group[2] (lowest-pitched string)
    const strings = [group[2], group[1], group[0]]; // reorder: low to high pitch

    // For each string, find ALL frets where the target note occurs
    const fretOptions: { s: number; frets: number[] }[] = [];
    for (let voice = 0; voice < 3; voice++) {
      const s = strings[voice];
      const target = targetNotes[voice];
      const frets: number[] = [];
      for (let f = 0; f <= TOTAL_FRETS; f++) {
        if ((STANDARD_TUNING[s] + f) % 12 === target) frets.push(f);
      }
      fretOptions.push({ s, frets });
    }

    // Try all combinations of fret choices across the 3 strings
    for (const f0 of fretOptions[0].frets) {
      for (const f1 of fretOptions[1].frets) {
        for (const f2 of fretOptions[2].frets) {
          const frets = [f0, f1, f2];
          const maxF = Math.max(...frets);
          const nonZeroFrets = frets.filter(f => f > 0);
          const minF = nonZeroFrets.length > 0 ? Math.min(...nonZeroFrets) : maxF;
          if (maxF - minF <= 4 || maxF <= 4) {
            const key = `${fretOptions[0].s}:${f0}-${fretOptions[1].s}:${f1}-${fretOptions[2].s}:${f2}`;
            if (!shapeKeys.has(key)) {
              shapeKeys.add(key);
              for (let v = 0; v < 3; v++) {
                const s = fretOptions[v].s;
                const f = frets[v];
                const noteVal = (STANDARD_TUNING[s] + f) % 12;
                const fromRoot = (noteVal - root + 12) % 12;
                notes.push({
                  string: s, fret: f, note: noteVal, interval: fromRoot,
                  intervalLabel: INTERVAL_NAMES[fromRoot],
                  isRoot: fromRoot === 0, noteName: NOTE_NAMES[noteVal], finger: null,
                });
              }
            }
          }
        }
      }
    }
  }
  return notes;
}
