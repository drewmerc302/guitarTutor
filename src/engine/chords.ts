// src/engine/chords.ts
import { STANDARD_TUNING, TOTAL_FRETS } from './notes';

export interface ChordVoicingNote {
  s: number; // string index (0=high E, 5=low E)
  f: number; // fret (-1 = muted)
}

export type ChordVoicing = ChordVoicingNote[];

export interface VoicingRegion {
  frets: Set<string>;
  rootFret: { string: number; fret: number } | null;
  voicing: ChordVoicing;
  barreFret: number | null;
}

export const CHORD_TYPES: Record<string, number[]> = {
  'Major': [0,4,7], 'Minor': [0,3,7], '7th': [0,4,7,10],
  'Maj7': [0,4,7,11], 'Min7': [0,3,7,10], 'Dim': [0,3,6],
  'Aug': [0,4,8], 'Sus2': [0,2,7], 'Sus4': [0,5,7],
  'Dim7': [0,3,6,9], 'Min7b5': [0,3,6,10], '9th': [0,4,7,10,14],
};

export function generateBarreVoicings(root: number): ChordVoicing[] {
  const eShapeFret = (root - 4 + 12) % 12;
  const eShape: ChordVoicing = eShapeFret === 0
    ? [{s:0,f:0},{s:1,f:0},{s:2,f:1},{s:3,f:2},{s:4,f:2},{s:5,f:0}]
    : [{s:0,f:eShapeFret},{s:1,f:eShapeFret},{s:2,f:eShapeFret+1},{s:3,f:eShapeFret+2},{s:4,f:eShapeFret+2},{s:5,f:eShapeFret}];

  const aShapeFret = (root - 9 + 12) % 12;
  const aShape: ChordVoicing = aShapeFret === 0
    ? [{s:0,f:0},{s:1,f:2},{s:2,f:2},{s:3,f:2},{s:4,f:0},{s:5,f:-1}]
    : [{s:0,f:aShapeFret},{s:1,f:aShapeFret+2},{s:2,f:aShapeFret+2},{s:3,f:aShapeFret+2},{s:4,f:aShapeFret},{s:5,f:-1}];

  const cShapeFret = (root - 0 + 12) % 12;
  const cOffset = cShapeFret === 0 ? 0 : cShapeFret;
  const cShape: ChordVoicing = [{s:0,f:cOffset},{s:1,f:cOffset+1},{s:2,f:cOffset},{s:3,f:cOffset+2},{s:4,f:cOffset+3},{s:5,f:-1}];

  const dShapeFret = (root - 2 + 12) % 12;
  const dShape: ChordVoicing = dShapeFret === 0
    ? [{s:0,f:2},{s:1,f:3},{s:2,f:2},{s:3,f:0},{s:4,f:-1},{s:5,f:-1}]
    : [{s:0,f:dShapeFret+2},{s:1,f:dShapeFret+3},{s:2,f:dShapeFret+2},{s:3,f:dShapeFret},{s:4,f:-1},{s:5,f:-1}];

  const gShapeFret = (root - 7 + 12) % 12;
  const gShape: ChordVoicing = gShapeFret === 0
    ? [{s:0,f:3},{s:1,f:0},{s:2,f:0},{s:3,f:0},{s:4,f:2},{s:5,f:3}]
    : [{s:0,f:gShapeFret+3},{s:1,f:gShapeFret},{s:2,f:gShapeFret},{s:3,f:gShapeFret},{s:4,f:gShapeFret+2},{s:5,f:gShapeFret+3}];

  return [eShape, aShape, cShape, dShape, gShape].filter(shape =>
    shape.every(v => v.f < 0 || (v.f >= 0 && v.f <= TOTAL_FRETS))
  );
}

export function generateMinorBarreVoicings(root: number): ChordVoicing[] {
  const eShapeFret = (root - 4 + 12) % 12;
  const eShape: ChordVoicing = eShapeFret === 0
    ? [{s:0,f:0},{s:1,f:0},{s:2,f:0},{s:3,f:2},{s:4,f:2},{s:5,f:0}]
    : [{s:0,f:eShapeFret},{s:1,f:eShapeFret},{s:2,f:eShapeFret},{s:3,f:eShapeFret+2},{s:4,f:eShapeFret+2},{s:5,f:eShapeFret}];

  const aShapeFret = (root - 9 + 12) % 12;
  const aShape: ChordVoicing = aShapeFret === 0
    ? [{s:0,f:0},{s:1,f:1},{s:2,f:2},{s:3,f:2},{s:4,f:0},{s:5,f:-1}]
    : [{s:0,f:aShapeFret},{s:1,f:aShapeFret+1},{s:2,f:aShapeFret+2},{s:3,f:aShapeFret+2},{s:4,f:aShapeFret},{s:5,f:-1}];

  const dShapeFret = (root - 2 + 12) % 12;
  const dShape: ChordVoicing = dShapeFret === 0
    ? [{s:0,f:1},{s:1,f:3},{s:2,f:2},{s:3,f:0},{s:4,f:-1},{s:5,f:-1}]
    : [{s:0,f:dShapeFret+1},{s:1,f:dShapeFret+3},{s:2,f:dShapeFret+2},{s:3,f:dShapeFret},{s:4,f:-1},{s:5,f:-1}];

  return [eShape, aShape, dShape].filter(shape =>
    shape.every(v => v.f < 0 || (v.f >= 0 && v.f <= TOTAL_FRETS))
  );
}

// --- Open/common voicings for Sus4 and Sus2 ---

function generateSus4Voicings(root: number): ChordVoicing[] {
  // Common open and barre voicings for sus4 chords.
  // Root=D (2): x-x-0-2-3-3 (open Dsus4), root=A (9): x-0-2-2-3-x (open Asus4), etc.
  const voicings: ChordVoicing[] = [];

  // Open position Dsus4 (root=D=2): x-x-0-2-3-3
  if (root === 2) {
    voicings.push([{s:0,f:3},{s:1,f:3},{s:2,f:2},{s:3,f:0},{s:4,f:-1},{s:5,f:-1}]);
  }
  // Open position Asus4 (root=A=9): x-0-2-2-3-x
  if (root === 9) {
    voicings.push([{s:0,f:-1},{s:1,f:3},{s:2,f:2},{s:3,f:2},{s:4,f:0},{s:5,f:-1}]);
  }
  // Open position Esus4 (root=E=4): 0-0-2-2-0-0
  if (root === 4) {
    voicings.push([{s:0,f:0},{s:1,f:0},{s:2,f:2},{s:3,f:2},{s:4,f:0},{s:5,f:0}]);
  }
  // Open position Gsus4 (root=G=7): 3-1-0-0-3-3
  if (root === 7) {
    voicings.push([{s:0,f:3},{s:1,f:3},{s:2,f:0},{s:3,f:0},{s:4,f:1},{s:5,f:3}]);
  }
  // Open position Csus4 (root=C=0): x-3-3-0-1-x (Csus4)
  if (root === 0) {
    voicings.push([{s:0,f:-1},{s:1,f:1},{s:2,f:0},{s:3,f:3},{s:4,f:3},{s:5,f:-1}]);
  }

  // Barre voicings: E-shape sus4 and A-shape sus4
  // E-shape sus4: barre at eShapeFret, add sus4 (+5 from root relative to E shape)
  const eShapeFret = (root - 4 + 12) % 12;
  const eSus4: ChordVoicing = eShapeFret === 0
    ? [{s:0,f:0},{s:1,f:0},{s:2,f:2},{s:3,f:2},{s:4,f:0},{s:5,f:0}]
    : [{s:0,f:eShapeFret},{s:1,f:eShapeFret},{s:2,f:eShapeFret+2},{s:3,f:eShapeFret+2},{s:4,f:eShapeFret},{s:5,f:eShapeFret}];
  voicings.push(eSus4);

  // A-shape sus4: barre at aShapeFret
  const aShapeFret = (root - 9 + 12) % 12;
  const aSus4: ChordVoicing = aShapeFret === 0
    ? [{s:0,f:-1},{s:1,f:3},{s:2,f:2},{s:3,f:2},{s:4,f:0},{s:5,f:-1}]
    : [{s:0,f:-1},{s:1,f:aShapeFret+3},{s:2,f:aShapeFret+2},{s:3,f:aShapeFret+2},{s:4,f:aShapeFret},{s:5,f:-1}];
  voicings.push(aSus4);

  return voicings.filter(v => v.every(n => n.f < 0 || (n.f >= 0 && n.f <= TOTAL_FRETS)));
}

function generateSus2Voicings(root: number): ChordVoicing[] {
  const voicings: ChordVoicing[] = [];

  // Open position Dsus2 (root=D=2): x-x-0-2-3-0
  if (root === 2) {
    voicings.push([{s:0,f:0},{s:1,f:3},{s:2,f:2},{s:3,f:0},{s:4,f:-1},{s:5,f:-1}]);
  }
  // Open Asus2 (root=A=9): x-0-2-2-0-x
  if (root === 9) {
    voicings.push([{s:0,f:-1},{s:1,f:0},{s:2,f:2},{s:3,f:2},{s:4,f:0},{s:5,f:-1}]);
  }
  // Open Esus2 (root=E=4): 0-0-4-4-0-0
  if (root === 4) {
    voicings.push([{s:0,f:0},{s:1,f:0},{s:2,f:4},{s:3,f:4},{s:4,f:0},{s:5,f:0}]);
  }

  // E-shape sus2 barre voicings
  const eShapeFret = (root - 4 + 12) % 12;
  const eSus2: ChordVoicing = eShapeFret === 0
    ? [{s:0,f:0},{s:1,f:0},{s:2,f:4},{s:3,f:4},{s:4,f:0},{s:5,f:0}]
    : [{s:0,f:eShapeFret},{s:1,f:eShapeFret},{s:2,f:eShapeFret+4},{s:3,f:eShapeFret+4},{s:4,f:eShapeFret},{s:5,f:eShapeFret}];
  voicings.push(eSus2);

  // A-shape sus2
  const aShapeFret = (root - 9 + 12) % 12;
  const aSus2: ChordVoicing = aShapeFret === 0
    ? [{s:0,f:-1},{s:1,f:2},{s:2,f:2},{s:3,f:2},{s:4,f:0},{s:5,f:-1}]
    : [{s:0,f:-1},{s:1,f:aShapeFret+2},{s:2,f:aShapeFret+2},{s:3,f:aShapeFret+2},{s:4,f:aShapeFret},{s:5,f:-1}];
  voicings.push(aSus2);

  return voicings.filter(v => v.every(n => n.f < 0 || (n.f >= 0 && n.f <= TOTAL_FRETS)));
}

function generateDominant7Voicings(root: number): ChordVoicing[] {
  const voicings: ChordVoicing[] = [];

  // Common open 7th chord voicings
  // E7 (root=4): 0-0-1-0-2-0
  if (root === 4) {
    voicings.push([{s:0,f:0},{s:1,f:2},{s:2,f:0},{s:3,f:1},{s:4,f:0},{s:5,f:0}]);
  }
  // A7 (root=9): x-0-2-0-2-0
  if (root === 9) {
    voicings.push([{s:0,f:0},{s:1,f:2},{s:2,f:0},{s:3,f:2},{s:4,f:0},{s:5,f:-1}]);
  }
  // D7 (root=2): x-x-0-2-1-2
  if (root === 2) {
    voicings.push([{s:0,f:2},{s:1,f:1},{s:2,f:2},{s:3,f:0},{s:4,f:-1},{s:5,f:-1}]);
  }
  // G7 (root=7): 1-0-0-0-2-3
  if (root === 7) {
    voicings.push([{s:0,f:1},{s:1,f:3},{s:2,f:0},{s:3,f:0},{s:4,f:0},{s:5,f:3}]);
  }
  // C7 (root=0): x-3-2-3-1-x
  if (root === 0) {
    voicings.push([{s:0,f:-1},{s:1,f:1},{s:2,f:3},{s:3,f:2},{s:4,f:3},{s:5,f:-1}]);
  }
  // B7 (root=11): x-2-1-2-0-2
  if (root === 11) {
    voicings.push([{s:0,f:2},{s:1,f:0},{s:2,f:2},{s:3,f:1},{s:4,f:2},{s:5,f:-1}]);
  }

  // E-shape 7th barre voicing
  const eShapeFret = (root - 4 + 12) % 12;
  const e7: ChordVoicing = eShapeFret === 0
    ? [{s:0,f:0},{s:1,f:2},{s:2,f:0},{s:3,f:1},{s:4,f:0},{s:5,f:0}]
    : [{s:0,f:eShapeFret},{s:1,f:eShapeFret+2},{s:2,f:eShapeFret},{s:3,f:eShapeFret+1},{s:4,f:eShapeFret},{s:5,f:eShapeFret}];
  voicings.push(e7);

  // A-shape 7th barre voicing
  const aShapeFret = (root - 9 + 12) % 12;
  const a7: ChordVoicing = aShapeFret === 0
    ? [{s:0,f:0},{s:1,f:2},{s:2,f:0},{s:3,f:2},{s:4,f:0},{s:5,f:-1}]
    : [{s:0,f:aShapeFret},{s:1,f:aShapeFret+2},{s:2,f:aShapeFret},{s:3,f:aShapeFret+2},{s:4,f:aShapeFret},{s:5,f:-1}];
  voicings.push(a7);

  return voicings.filter(v => v.every(n => n.f < 0 || (n.f >= 0 && n.f <= TOTAL_FRETS)));
}

function generateMaj7Voicings(root: number): ChordVoicing[] {
  const voicings: ChordVoicing[] = [];

  // Open Emaj7 (root=4): 0-0-1-1-0-0
  if (root === 4) {
    voicings.push([{s:0,f:0},{s:1,f:0},{s:2,f:1},{s:3,f:1},{s:4,f:0},{s:5,f:0}]);
  }
  // Open Amaj7 (root=9): x-0-2-1-2-0
  if (root === 9) {
    voicings.push([{s:0,f:0},{s:1,f:2},{s:2,f:1},{s:3,f:2},{s:4,f:0},{s:5,f:-1}]);
  }
  // Open Dmaj7 (root=2): x-x-0-2-2-2
  if (root === 2) {
    voicings.push([{s:0,f:2},{s:1,f:2},{s:2,f:2},{s:3,f:0},{s:4,f:-1},{s:5,f:-1}]);
  }
  // Open Gmaj7 (root=7): 2-0-0-0-2-3
  if (root === 7) {
    voicings.push([{s:0,f:2},{s:1,f:3},{s:2,f:0},{s:3,f:0},{s:4,f:0},{s:5,f:3}]);
  }
  // Open Cmaj7 (root=0): x-3-2-0-0-x
  if (root === 0) {
    voicings.push([{s:0,f:-1},{s:1,f:0},{s:2,f:0},{s:3,f:2},{s:4,f:3},{s:5,f:-1}]);
  }
  // Open Fmaj7 (root=5): x-x-3-2-1-0
  if (root === 5) {
    voicings.push([{s:0,f:0},{s:1,f:1},{s:2,f:2},{s:3,f:3},{s:4,f:-1},{s:5,f:-1}]);
  }

  // E-shape maj7 barre
  const eShapeFret = (root - 4 + 12) % 12;
  const emaj7: ChordVoicing = eShapeFret === 0
    ? [{s:0,f:0},{s:1,f:0},{s:2,f:1},{s:3,f:1},{s:4,f:0},{s:5,f:0}]
    : [{s:0,f:eShapeFret},{s:1,f:eShapeFret},{s:2,f:eShapeFret+1},{s:3,f:eShapeFret+1},{s:4,f:eShapeFret},{s:5,f:eShapeFret}];
  voicings.push(emaj7);

  // A-shape maj7 barre
  const aShapeFret = (root - 9 + 12) % 12;
  const amaj7: ChordVoicing = aShapeFret === 0
    ? [{s:0,f:0},{s:1,f:2},{s:2,f:1},{s:3,f:2},{s:4,f:0},{s:5,f:-1}]
    : [{s:0,f:aShapeFret},{s:1,f:aShapeFret+2},{s:2,f:aShapeFret+1},{s:3,f:aShapeFret+2},{s:4,f:aShapeFret},{s:5,f:-1}];
  voicings.push(amaj7);

  return voicings.filter(v => v.every(n => n.f < 0 || (n.f >= 0 && n.f <= TOTAL_FRETS)));
}

function generateMin7Voicings(root: number): ChordVoicing[] {
  const voicings: ChordVoicing[] = [];

  // Open Em7 (root=4): 0-0-0-0-2-0
  if (root === 4) {
    voicings.push([{s:0,f:0},{s:1,f:0},{s:2,f:0},{s:3,f:0},{s:4,f:2},{s:5,f:0}]);
  }
  // Open Am7 (root=9): x-0-2-0-1-0
  if (root === 9) {
    voicings.push([{s:0,f:0},{s:1,f:1},{s:2,f:0},{s:3,f:2},{s:4,f:0},{s:5,f:-1}]);
  }
  // Open Dm7 (root=2): x-x-0-2-1-1
  if (root === 2) {
    voicings.push([{s:0,f:1},{s:1,f:1},{s:2,f:2},{s:3,f:0},{s:4,f:-1},{s:5,f:-1}]);
  }

  // E-shape min7 barre
  const eShapeFret = (root - 4 + 12) % 12;
  const em7: ChordVoicing = eShapeFret === 0
    ? [{s:0,f:0},{s:1,f:0},{s:2,f:0},{s:3,f:0},{s:4,f:2},{s:5,f:0}]
    : [{s:0,f:eShapeFret},{s:1,f:eShapeFret},{s:2,f:eShapeFret},{s:3,f:eShapeFret},{s:4,f:eShapeFret+2},{s:5,f:eShapeFret}];
  voicings.push(em7);

  // A-shape min7 barre
  const aShapeFret = (root - 9 + 12) % 12;
  const am7: ChordVoicing = aShapeFret === 0
    ? [{s:0,f:0},{s:1,f:1},{s:2,f:0},{s:3,f:2},{s:4,f:0},{s:5,f:-1}]
    : [{s:0,f:aShapeFret},{s:1,f:aShapeFret+1},{s:2,f:aShapeFret},{s:3,f:aShapeFret+2},{s:4,f:aShapeFret},{s:5,f:-1}];
  voicings.push(am7);

  return voicings.filter(v => v.every(n => n.f < 0 || (n.f >= 0 && n.f <= TOTAL_FRETS)));
}

export function getChordVoicings(root: number, type: string): ChordVoicing[] {
  if (type === 'Major') return generateBarreVoicings(root);
  if (type === 'Minor') return generateMinorBarreVoicings(root);
  if (type === 'Sus4') return generateSus4Voicings(root);
  if (type === 'Sus2') return generateSus2Voicings(root);
  if (type === '7th') return generateDominant7Voicings(root);
  if (type === 'Maj7') return generateMaj7Voicings(root);
  if (type === 'Min7') return generateMin7Voicings(root);
  // Fallback: return all major barre shapes as positional reference voicings
  return generateBarreVoicings(root);
}

function findBarreFret(voicing: ChordVoicing): number | null {
  const fretCounts: Record<number, number> = {};
  for (const v of voicing) {
    if (v.f >= 0) {
      fretCounts[v.f] = (fretCounts[v.f] || 0) + 1;
    }
  }
  const fretsWithNotes = Object.keys(fretCounts)
    .map(f => parseInt(f))
    .filter(f => f > 0)
    .sort((a, b) => a - b);
  
  for (const fret of fretsWithNotes) {
    if (fretCounts[fret] >= 2) {
      return fret;
    }
  }
  return null;
}

export function buildVoicingRegions(voicings: ChordVoicing[], root: number): VoicingRegion[] {
  return voicings.map(voicing => {
    const frets = new Set<string>();
    let rootFret: { string: number; fret: number } | null = null;
    for (const v of voicing) {
      if (v.f >= 0) {
        frets.add(`${v.s}-${v.f}`);
        const noteVal = (STANDARD_TUNING[v.s] + v.f) % 12;
        if (noteVal === root && rootFret === null) {
          rootFret = { string: v.s, fret: v.f };
        }
      }
    }
    const barreFret = findBarreFret(voicing);
    return { frets, rootFret, voicing, barreFret };
  });
}
