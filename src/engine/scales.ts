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
    // Search from fret 0 up to 3 frets before current position
    const searchStart = Math.max(0, from - 3);
    for (let f = searchStart; f < from; f++) {
      for (let s = 0; s < 6; s++) {
        const noteVal = (STANDARD_TUNING[s] + f) % 12;
        const fromRoot = (noteVal - root + 12) % 12;
        if (intervalSet.has(fromRoot)) return f;
      }
    }
    return null;
  }

  // Start with Box 1 at baseRootE
  const boxStarts: number[] = [baseRootE];

  // Generate forward boxes going UP the neck from Box 1
  let current = baseRootE;
  for (let i = 1; i < NUM_BOXES; i++) {
    current = nextBoxStart(current);
    if (current + 3 <= TOTAL_FRETS) {
      boxStarts.push(current);
    }
  }

  // Generate backward boxes going DOWN toward nut from Box 1
  const backwardStarts: number[] = [];
  current = baseRootE;
  for (let i = 0; i < NUM_BOXES - 1; i++) {
    const prev = prevBoxStart(current);
    if (prev !== null) {
      backwardStarts.push(prev);
      current = prev;
    } else {
      break;
    }
  }

  // Keep forward boxes in order (Box 1, Box 2, etc.), append backward boxes at the end
  // Backward boxes fill in the gaps - if we have 2 backward boxes, they're positions before Box 1
  const allStarts = [...boxStarts, ...backwardStarts];

  // Build ScalePosition objects
  const positions: ScalePosition[] = [];
  
  // First, create forward boxes with labels Box 1, Box 2, etc.
  for (let i = 0; i < boxStarts.length; i++) {
    const startFret = boxStarts[i];
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

  // Then add backward boxes - they fill the "missing" positions
  // If we have 5 boxes total but only 3 forward, we add 2 backward with labels Box 4 and Box 5
  const backwardLabels: string[] = [];
  for (let i = boxStarts.length; i < NUM_BOXES; i++) {
    backwardLabels.push(`Box ${NUM_BOXES - (i - boxStarts.length)}`);
  }
  
  for (let i = 0; i < backwardStarts.length; i++) {
    const startFret = backwardStarts[i];
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

    const label = backwardLabels[i] || `Box ${boxStarts.length + i + 1}`;
    positions.push({
      label: label,
      fretStart: startFret,
      fretEnd: endFret,
      notes: boxNotes,
    });
  }

  return positions;
}
