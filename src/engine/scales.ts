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

/** Internal helper: walk low E string, return N selected anchor frets.
 * Returns anchors sorted ascending, starting from max(0, idx_root - 1)
 * so at most 1 anchor below the root is included. */
function findAnchors(root: number, intervals: number[]): number[] {
  const intervalSet = new Set(intervals.map(iv => iv % 12));
  const N = intervals.length;

  // Collect all scale-tone frets on low E string
  const allAnchors: number[] = [];
  for (let f = 0; f <= TOTAL_FRETS; f++) {
    const fromRoot = ((STANDARD_TUNING[5] + f) % 12 - root + 12) % 12;
    if (intervalSet.has(fromRoot)) allAnchors.push(f);
  }

  // Find first occurrence of root pitch on low E
  const idxRoot = allAnchors.findIndex(f => (STANDARD_TUNING[5] + f) % 12 === root % 12);

  // Select N consecutive anchors starting at most 1 below the root
  const start = Math.max(0, idxRoot - 1);
  return allAnchors.slice(start, start + N);
}

/** Compute box positions for a scale across the neck.
 * Uses computed anchors from the low E string rather than hardcoded offsets.
 * Returns N boxes (N = intervals.length) sorted by fretStart ascending.
 * Box 1 = root position on low E; below-root position (if any) = Box N. */
export function computeScalePositions(root: number, intervals: number[]): ScalePosition[] {
  const intervalSet = new Set(intervals.map(iv => iv % 12));
  const selected = findAnchors(root, intervals);
  const N = selected.length;

  // Find root anchor's index within the selected set
  const rootIdx = selected.findIndex(f => (STANDARD_TUNING[5] + f) % 12 === root % 12);

  const positions: ScalePosition[] = [];

  for (let i = 0; i < N; i++) {
    const anchor = selected[i];
    // A_next: next anchor above this one; for the highest anchor, wrap to selected[0] + 12
    const nextAnchor = i < N - 1 ? selected[i + 1] : selected[0] + 12;

    const windowStart = Math.max(0, anchor - 1);
    const windowEnd = Math.min(TOTAL_FRETS, nextAnchor + 1);

    // Box label: root → Box 1; anchors above → Box 2..N; below-root → Box N
    let boxNumber: number;
    if (i === rootIdx) {
      boxNumber = 1;
    } else if (i > rootIdx) {
      boxNumber = i - rootIdx + 1;
    } else {
      boxNumber = N; // below-root anchor
    }

    // Collect notes within dynamic window
    const boxNotes: FretboardNote[] = [];
    for (let s = 0; s < 6; s++) {
      for (let f = windowStart; f <= windowEnd; f++) {
        const pitch = (STANDARD_TUNING[s] + f) % 12;
        const fromRoot = (pitch - root + 12) % 12;
        if (intervalSet.has(fromRoot)) {
          const ivIdx = intervals.findIndex(iv => iv % 12 === fromRoot);
          boxNotes.push({
            string: s, fret: f, note: pitch, interval: fromRoot,
            intervalLabel: INTERVAL_NAMES[intervals[ivIdx]] || INTERVAL_NAMES[fromRoot],
            isRoot: fromRoot === 0, noteName: NOTE_NAMES[pitch], finger: null,
          });
        }
      }
    }

    // Open-string rule: include fret 0 for scale-tone strings when anchor < 5.
    // Threshold is strict < 5 (not <= 5) so Box 1 at anchor=5 does not pull in open strings.
    if (anchor < 5) {
      for (let s = 0; s < 6; s++) {
        const pitch = STANDARD_TUNING[s] % 12;
        const fromRoot = (pitch - root + 12) % 12;
        if (intervalSet.has(fromRoot) && !boxNotes.some(n => n.string === s && n.fret === 0)) {
          const ivIdx = intervals.findIndex(iv => iv % 12 === fromRoot);
          boxNotes.push({
            string: s, fret: 0, note: pitch, interval: fromRoot,
            intervalLabel: INTERVAL_NAMES[intervals[ivIdx]] || INTERVAL_NAMES[fromRoot],
            isRoot: fromRoot === 0, noteName: NOTE_NAMES[pitch], finger: null,
          });
        }
      }
    }

    if (boxNotes.length === 0) continue;

    assignFingers(boxNotes);

    const fretStart = Math.min(...boxNotes.map(n => n.fret));
    const fretEnd = Math.max(...boxNotes.map(n => n.fret));

    positions.push({
      label: `Box ${boxNumber}`,
      fretStart,
      fretEnd,
      notes: boxNotes,
    });
  }

  // Sort by fretStart ascending (below-root box appears first/leftmost)
  positions.sort((a, b) => a.fretStart - b.fretStart);
  return positions;
}
