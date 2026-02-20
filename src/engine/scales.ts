// src/engine/scales.ts
import { STANDARD_TUNING, TOTAL_FRETS, NOTE_NAMES } from './notes';
import { INTERVAL_NAMES, intervalFromRoot } from './intervals';
import { FretboardNote } from './fretboard';
import { assignFingers } from './fingers';

export const SCALE_TYPES: Record<string, number[]> = {
  'Major': [0,2,4,5,7,9,11],
  'Nat. Minor': [0,2,3,5,7,8,10],
  'Major Pent.': [0,2,4,7,9],
  'Minor Pent.': [0,3,5,7,10],
  'Blues': [0,3,5,6,7,10],
  'Harm. Minor': [0,2,3,5,7,8,11],
  'Melodic Minor': [0,2,3,5,7,9,11],
};

export const MODE_NAMES = ['Ionian','Dorian','Phrygian','Lydian','Mixolydian','Aeolian','Locrian'];

export interface ScalePosition {
  label: string;
  fretStart: number;
  fretEnd: number;
  notes: FretboardNote[];
}

/** Rotate a 7-note scale to produce a mode. */
export function applyModeRotation(intervals: number[], mode: number): number[] {
  if (mode === 0 || intervals.length !== 7) return [...intervals];
  return intervals
    .map((_, i) => {
      const idx = (i + mode) % intervals.length;
      return (intervals[idx] - intervals[mode] + 12) % 12;
    })
    .sort((a, b) => a - b);
}

/** Compute box positions for a scale across the neck, wrapping overflow boxes back toward nut. */
export function computeScalePositions(root: number, intervals: number[]): ScalePosition[] {
  const intervalSet = new Set(intervals.map(i => i % 12));
  const NUM_BOXES = intervals.length;

  // Find starting fret of root on low E string
  const baseRootE = (() => {
    for (let f = 0; f <= TOTAL_FRETS; f++) {
      if ((STANDARD_TUNING[5] + f) % 12 === root) return f;
    }
    return 0;
  })();

  // Helper: find next box start going forward (up the neck) from a given fret
  function nextBoxStart(from: number): number {
    const nextMin = from + 2;
    for (let f = nextMin; f <= nextMin + 3; f++) {
      for (let s = 0; s < 6; s++) {
        const noteVal = (STANDARD_TUNING[s] + f) % 12;
        const fromRoot = (noteVal - root + 12) % 12;
        if (intervalSet.has(fromRoot)) return f;
      }
    }
    return nextMin;
  }

  // Helper: find previous box start going backward (toward nut) from a given fret
  function prevBoxStart(from: number): number | null {
    const prevMax = from - 2;
    if (prevMax < 0) return null;
    for (let f = prevMax; f >= Math.max(0, prevMax - 3); f--) {
      for (let s = 0; s < 6; s++) {
        const noteVal = (STANDARD_TUNING[s] + f) % 12;
        const fromRoot = (noteVal - root + 12) % 12;
        if (intervalSet.has(fromRoot)) return f;
      }
    }
    return null;
  }

  // Generate forward box starts from baseRootE (ignore TOTAL_FRETS limit here)
  const forwardStarts: number[] = [baseRootE];
  let current = baseRootE;
  for (let i = 1; i < NUM_BOXES; i++) {
    current = nextBoxStart(current);
    forwardStarts.push(current);
  }

  // Separate into valid (fretEnd <= TOTAL_FRETS) and overflowing boxes
  const validStarts: number[] = [];
  let overflowCount = 0;
  for (const s of forwardStarts) {
    if (s + 3 <= TOTAL_FRETS) {
      validStarts.push(s);
    } else {
      overflowCount++;
    }
  }

  // Back-fill overflowing boxes by searching backward from baseRootE
  const wrappedStarts: number[] = [];
  let searchFrom = baseRootE;
  for (let i = 0; i < overflowCount; i++) {
    const prev = prevBoxStart(searchFrom);
    if (prev !== null && prev + 3 <= TOTAL_FRETS) {
      wrappedStarts.push(prev);
      searchFrom = prev;
    }
  }

  // Combine, deduplicate, sort ascending by fret position
  const allStartsSet = new Set([...validStarts, ...wrappedStarts]);
  const allStartsAsc = Array.from(allStartsSet).sort((a, b) => a - b);

  // Reorder so Box 1 starts at the root position on low E, then ascend,
  // with any wrapped (lower-fret) boxes cycling to the end.
  const rootIdx = allStartsAsc.indexOf(baseRootE);
  const allStarts = rootIdx >= 0
    ? [...allStartsAsc.slice(rootIdx), ...allStartsAsc.slice(0, rootIdx)]
    : allStartsAsc;

  // Build ScalePosition objects
  const positions: ScalePosition[] = [];
  for (let i = 0; i < allStarts.length; i++) {
    const startFret = allStarts[i];
    const endFret = startFret + 3;
    const boxNotes: FretboardNote[] = [];

    for (let s = 0; s < 6; s++) {
      for (let f = startFret; f <= Math.min(endFret, TOTAL_FRETS); f++) {
        const noteValue = (STANDARD_TUNING[s] + f) % 12;
        const fromRoot = (noteValue - root + 12) % 12;
        if (intervalSet.has(fromRoot)) {
          const intervalIndex = intervals.findIndex(iv => iv % 12 === fromRoot);
          boxNotes.push({
            string: s, fret: f, note: noteValue, interval: fromRoot,
            intervalLabel: INTERVAL_NAMES[intervals[intervalIndex]] || INTERVAL_NAMES[fromRoot],
            isRoot: fromRoot === 0, noteName: NOTE_NAMES[noteValue], finger: null,
          });
        }
      }
    }

    assignFingers(boxNotes);

    positions.push({
      label: `Box ${i + 1}`,
      fretStart: startFret,
      fretEnd: endFret,
      notes: boxNotes,
    });
  }

  return positions;
}
