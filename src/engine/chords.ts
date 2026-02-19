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

export function getChordVoicings(root: number, type: string): ChordVoicing[] {
  if (type === 'Major') return generateBarreVoicings(root);
  if (type === 'Minor') return generateMinorBarreVoicings(root);
  return [generateBarreVoicings(root)[0]]; // fallback: E-shape for other types
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
    return { frets, rootFret, voicing };
  });
}
