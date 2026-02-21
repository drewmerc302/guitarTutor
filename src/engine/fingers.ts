// src/engine/fingers.ts
import { FretboardNote } from './fretboard';

/**
 * Assign sweep-picking order numbers to arpeggio notes.
 * Notes are ordered from lowest string (high string index = low E) to highest string
 * (low string index = high E), and within each string from lowest fret to highest fret.
 * The finger field is set to the 1-based sweep index (1 = first note picked, N = last).
 * Mutates the notes in place.
 */
export function assignSweepOrder(notes: FretboardNote[]): void {
  if (!notes.length) return;
  const sorted = [...notes].sort((a, b) => {
    if (b.string !== a.string) return b.string - a.string; // string descending (5=low E first)
    return a.fret - b.fret;                                // fret ascending within string
  });
  for (let i = 0; i < sorted.length; i++) {
    sorted[i].finger = i + 1;
  }
}

/**
 * Assign finger numbers (1-4) to notes based on fret spread within a position.
 * Open strings get finger 0. Mutates the notes in place.
 */
export function assignFingers(notes: FretboardNote[]): void {
  if (!notes.length) return;

  const activeFrets = notes.filter(n => n.fret > 0).map(n => n.fret);
  if (activeFrets.length === 0) {
    notes.forEach(n => { n.finger = 0; }); // all open
    return;
  }

  const minFret = Math.min(...activeFrets);
  const maxFret = Math.max(...activeFrets);
  const span = maxFret - minFret;

  for (const n of notes) {
    if (n.fret === 0) {
      n.finger = 0;
    } else if (span <= 3) {
      n.finger = Math.min(4, Math.max(1, n.fret - minFret + 1));
    } else {
      const ratio = (n.fret - minFret) / Math.max(1, span);
      n.finger = Math.min(4, Math.max(1, Math.round(ratio * 3) + 1));
    }
  }
}
