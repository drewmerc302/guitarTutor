// src/engine/fretboard.ts
import { NOTE_NAMES, STANDARD_TUNING, TOTAL_FRETS } from './notes';
import { INTERVAL_NAMES, intervalFromRoot } from './intervals';

export interface FretboardNote {
  string: number;
  fret: number;
  note: number;        // 0-11
  interval: number;    // semitones from root
  intervalLabel: string;
  isRoot: boolean;
  noteName: string;
  finger: number | null;
}

/**
 * Given a root note and interval pattern, find all matching positions on the fretboard.
 * This single function powers all 5 tabs.
 */
export function getNotesOnFretboard(root: number, intervals: number[]): FretboardNote[] {
  const notes: FretboardNote[] = [];
  const intervalSet = new Set(intervals.map(i => i % 12));

  for (let s = 0; s < 6; s++) {
    for (let f = 0; f <= TOTAL_FRETS; f++) {
      const noteValue = (STANDARD_TUNING[s] + f) % 12;
      const fromRoot = (noteValue - root + 12) % 12;
      if (intervalSet.has(fromRoot)) {
        const intervalIndex = intervals.findIndex(i => i % 12 === fromRoot);
        notes.push({
          string: s,
          fret: f,
          note: noteValue,
          interval: fromRoot,
          intervalLabel: INTERVAL_NAMES[intervals[intervalIndex]] || INTERVAL_NAMES[fromRoot],
          isRoot: fromRoot === 0,
          noteName: NOTE_NAMES[noteValue],
          finger: null,
        });
      }
    }
  }
  return notes;
}
