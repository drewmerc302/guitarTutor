// src/engine/arpeggios.ts

/** Arpeggio interval patterns. Arpeggios use the same getNotesOnFretboard() as chords. */
export const ARP_TYPES: Record<string, number[]> = {
  'Major': [0,4,7], 'Minor': [0,3,7], 'Dom7': [0,4,7,10],
  'Maj7': [0,4,7,11], 'Min7': [0,3,7,10], 'Dim7': [0,3,6,9],
  'Min7b5': [0,3,6,10], 'Aug': [0,4,8],
};
