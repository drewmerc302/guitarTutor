// src/engine/intervals.ts
export const INTERVAL_NAMES: Record<number, string> = {
  0: 'R', 1: 'b2', 2: '2', 3: 'b3', 4: '3', 5: '4',
  6: 'b5', 7: '5', 8: '#5', 9: '6', 10: 'b7', 11: '7',
  12: 'R', 13: 'b9', 14: '9',
};

/** Compute interval in semitones from root to note (0-11). */
export function intervalFromRoot(root: number, noteVal: number): number {
  return (noteVal - root + 12) % 12;
}
