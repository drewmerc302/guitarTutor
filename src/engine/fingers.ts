// src/engine/fingers.ts
import { FretboardNote } from './fretboard';

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
