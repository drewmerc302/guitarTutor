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

export type InversionFilter = 'all' | 'root' | '1st' | '2nd';

// --- Memoization cache ---
const voicingCache = new Map<string, ChordVoicing[]>();

/**
 * Compute required and optional pitch classes for a chord.
 * For chords with 4+ tones, the perfect 5th (interval index 2) is optional.
 * Diminished/augmented 5ths are NOT optional — they are defining tones.
 */
function computePitchClasses(root: number, intervals: number[]): {
  required: Set<number>;
  all: Set<number>;
} {
  const allPCs = new Set(intervals.map(i => (root + i) % 12));
  if (intervals.length >= 4 && intervals[2] === 7) {
    const fifthPC = (root + 7) % 12;
    const required = new Set(allPCs);
    required.delete(fifthPC);
    return { required, all: allPCs };
  }
  return { required: allPCs, all: allPCs };
}

/**
 * For each string, compute the valid fret assignments within a given window.
 * Returns an array of 6 arrays, one per string, each containing valid fret values.
 * Open strings (fret 0) are always candidates if their pitch class is in the chord.
 */
function validAssignmentsPerString(
  chordPCs: Set<number>,
  windowStart: number,
  windowEnd: number,
): number[][] {
  const result: number[][] = [];
  for (let s = 0; s < 6; s++) {
    const options: number[] = [-1]; // mute is always an option
    // Open string
    if (chordPCs.has(STANDARD_TUNING[s] % 12)) {
      options.push(0);
    }
    // Fretted within window
    for (let f = windowStart; f <= windowEnd; f++) {
      if (f > TOTAL_FRETS) break;
      const pc = (STANDARD_TUNING[s] + f) % 12;
      if (chordPCs.has(pc)) {
        options.push(f);
      }
    }
    result.push(options);
  }
  return result;
}

/**
 * Count interior muted strings (gaps between played strings).
 */
function countInteriorMutes(voicing: ChordVoicing): number {
  let lo = 6, hi = -1;
  for (const v of voicing) {
    if (v.f >= 0) {
      if (v.s < lo) lo = v.s;
      if (v.s > hi) hi = v.s;
    }
  }
  if (lo >= hi) return 0;
  let gaps = 0;
  for (const v of voicing) {
    if (v.f === -1 && v.s > lo && v.s < hi) {
      gaps++;
    }
  }
  return gaps;
}

/**
 * Score a voicing for playability (lower = better).
 */
function scorePlayability(voicing: ChordVoicing): number {
  let score = 0;
  const fretted = voicing.filter(v => v.f > 0).map(v => v.f);
  const played = voicing.filter(v => v.f >= 0).length;
  const muted = voicing.filter(v => v.f === -1).length;

  if (fretted.length > 0) {
    score += Math.max(...fretted) - Math.min(...fretted); // +1 per fret of stretch
  }
  score += countInteriorMutes(voicing) * 2; // +2 per interior gap (exterior mutes not penalized)
  score -= Math.min(3, Math.max(0, played - 3)); // -1 per extra string beyond 3, capped at -3
  // Bonus for open-string voicings (practical low-fret shapes)
  if (voicing.some(v => v.f === 0)) score -= 1;
  // Bonus for first-position voicings (all fretted notes in frets 1-4)
  if (fretted.length > 0 && Math.max(...fretted) <= 4) score -= 2;

  return score;
}

/**
 * Classify voicing inversion based on bass note relative to interval array.
 * Inversions are always relative to the requested root.
 */
function classifyInversion(
  voicing: ChordVoicing,
  root: number,
  intervals: number[],
): 'root' | '1st' | '2nd' | 'other' {
  // Find bass note: lowest-pitched non-muted string (highest string index = low E)
  let bassPC: number | null = null;
  for (let s = 5; s >= 0; s--) {
    const note = voicing.find(v => v.s === s);
    if (note && note.f >= 0) {
      bassPC = (STANDARD_TUNING[s] + note.f) % 12;
      break;
    }
  }
  if (bassPC === null) return 'other';

  const rootPC = (root + intervals[0]) % 12;
  const firstPC = intervals.length > 1 ? (root + intervals[1]) % 12 : -1;
  const secondPC = intervals.length > 2 ? (root + intervals[2]) % 12 : -1;

  if (bassPC === rootPC) return 'root';
  if (bassPC === firstPC) return '1st';
  if (bassPC === secondPC) return '2nd';
  return 'other';
}

/**
 * Core constraint-based voicing generator.
 * Enumerates all valid voicings across 24 frets for a given root + intervals.
 */
function generateVoicings(root: number, intervals: number[]): ChordVoicing[] {
  const { required, all: chordPCs } = computePitchClasses(root, intervals);
  const seen = new Set<string>();
  const results: Array<{ voicing: ChordVoicing; score: number }> = [];

  for (let windowStart = 1; windowStart <= TOTAL_FRETS - 3; windowStart++) {
    const windowEnd = windowStart + 3;
    const options = validAssignmentsPerString(chordPCs, windowStart, windowEnd);

    const counts = options.map(o => o.length);
    let total = 1;
    for (const c of counts) total *= c;

    for (let combo = 0; combo < total; combo++) {
      const voicing: ChordVoicing = [];
      let idx = combo;
      for (let s = 0; s < 6; s++) {
        const choice = idx % counts[s];
        idx = Math.floor(idx / counts[s]);
        voicing.push({ s, f: options[s][choice] });
      }

      // Quick reject: must have at least one non-muted string
      if (voicing.every(v => v.f === -1)) continue;

      // Check fretted span <= 4
      const fretted = voicing.filter(v => v.f > 0).map(v => v.f);
      if (fretted.length > 0) {
        const span = Math.max(...fretted) - Math.min(...fretted);
        if (span > 4) continue;
      }

      // Check all required pitch classes present
      const pcs = new Set<number>();
      for (const v of voicing) {
        if (v.f >= 0) {
          pcs.add((STANDARD_TUNING[v.s] + v.f) % 12);
        }
      }
      let hasAll = true;
      for (const pc of required) {
        if (!pcs.has(pc)) { hasAll = false; break; }
      }
      if (!hasAll) continue;

      // Dedup by string-to-fret mapping
      const key = voicing
        .slice()
        .sort((a, b) => a.s - b.s)
        .map(v => `${v.s}:${v.f}`)
        .join(',');
      if (seen.has(key)) continue;
      seen.add(key);

      results.push({ voicing, score: scorePlayability(voicing) });
    }
  }

  // Sort by playability score (lower = better), take top 50
  results.sort((a, b) => a.score - b.score);
  return results.slice(0, 100).map(r => r.voicing);
}

/**
 * Get chord voicings for a root + type, with optional inversion filter.
 * Results are memoized per (root, type) pair.
 * Inversion classification uses interval-array position:
 *   interval[0]=root position, interval[1]=1st inversion, interval[2]=2nd inversion
 *   Any other bass note (e.g. 7th) is classified as 'other' and only visible under 'all'.
 */
export function getChordVoicings(
  root: number,
  type: string,
  inversion: InversionFilter = 'all',
): ChordVoicing[] {
  const cacheKey = `${root}|${type}`;
  let voicings = voicingCache.get(cacheKey);
  if (!voicings) {
    const intervals = CHORD_TYPES[type];
    if (!intervals) return [];
    voicings = generateVoicings(root, intervals);
    voicingCache.set(cacheKey, voicings);
  }

  if (inversion === 'all') return voicings;

  const intervals = CHORD_TYPES[type];
  if (!intervals) return [];

  return voicings.filter(v => classifyInversion(v, root, intervals) === inversion);
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
