// src/engine/scales.ts
import { STANDARD_TUNING, TOTAL_FRETS, NOTE_NAMES } from './notes';
import { INTERVAL_NAMES, intervalFromRoot } from './intervals';
import { FretboardNote } from './fretboard';
import { assignFingers } from './fingers';

export const SCALE_TYPES: Record<string, number[]> = {
  'Major': [0,2,4,5,7,9,11],
  'Natural Minor': [0,2,3,5,7,8,10],
  'Harmonic Minor': [0,2,3,5,7,8,11],
  'Melodic Minor': [0,2,3,5,7,9,11],
  'Major Pentatonic': [0,2,4,7,9],
  'Minor Pentatonic': [0,3,5,7,10],
  'Blues': [0,3,5,6,7,10],
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

/** Compute 5 box positions for a scale across the neck. */
export function computeScalePositions(root: number, intervals: number[]): ScalePosition[] {
  const intervalSet = new Set(intervals.map(i => i % 12));

  // Find starting fret near low E root
  const baseRootE = (() => {
    for (let f = 0; f <= TOTAL_FRETS; f++) {
      if ((STANDARD_TUNING[5] + f) % 12 === root) return f;
    }
    return 0;
  })();

  // Generate 5 box start frets
  const boxStarts: number[] = [];
  let current = baseRootE;
  for (let i = 0; i < 5 && current <= TOTAL_FRETS; i++) {
    boxStarts.push(current);
    const nextMin = current + 2;
    let nextStart = nextMin;
    for (let f = nextMin; f <= nextMin + 3 && f <= TOTAL_FRETS; f++) {
      const noteVal = (STANDARD_TUNING[5] + f) % 12;
      const fromRoot = (noteVal - root + 12) % 12;
      if (intervalSet.has(fromRoot)) {
        nextStart = f;
        break;
      }
    }
    current = nextStart;
  }

  const positions: ScalePosition[] = [];
  for (let i = 0; i < boxStarts.length; i++) {
    const startFret = boxStarts[i];
    const endFret = startFret + 3;
    const minFret = startFret === 0 ? 0 : startFret;
    const boxNotes: FretboardNote[] = [];

    for (let s = 0; s < 6; s++) {
      for (let f = minFret; f <= Math.min(endFret, TOTAL_FRETS); f++) {
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
      fretStart: minFret,
      fretEnd: endFret,
      notes: boxNotes,
    });
  }

  return positions;
}
