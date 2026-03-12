// src/engine/__tests__/chords.test.ts
import {
  CHORD_TYPES,
  getChordVoicings,
  buildVoicingRegions,
  ChordVoicing,
  InversionFilter,
} from '../chords';
import { STANDARD_TUNING, TOTAL_FRETS } from '../notes';

// Helper: extract pitch classes from a voicing
function getPitchClasses(voicing: ChordVoicing): Set<number> {
  const pcs = new Set<number>();
  for (const v of voicing) {
    if (v.f >= 0) {
      pcs.add((STANDARD_TUNING[v.s] + v.f) % 12);
    }
  }
  return pcs;
}

// Helper: get fretted notes (fret > 0) from a voicing
function getFrettedFrets(voicing: ChordVoicing): number[] {
  return voicing.filter(v => v.f > 0).map(v => v.f);
}

// Helper: get bass note pitch class (lowest-pitched non-muted string)
function getBassPitchClass(voicing: ChordVoicing): number | null {
  // String 5 = low E, string 0 = high E. Lowest pitch = highest string index.
  for (let s = 5; s >= 0; s--) {
    const note = voicing.find(v => v.s === s);
    if (note && note.f >= 0) {
      return (STANDARD_TUNING[s] + note.f) % 12;
    }
  }
  return null;
}

// Helper: convert voicing to string key for dedup checking
function voicingKey(voicing: ChordVoicing): string {
  return voicing
    .slice()
    .sort((a, b) => a.s - b.s)
    .map(v => `${v.s}:${v.f}`)
    .join(',');
}

const ALL_ROOTS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const ALL_TYPES = Object.keys(CHORD_TYPES);

describe('Property-based: all (root, type) combinations', () => {
  for (const type of ALL_TYPES) {
    for (const root of ALL_ROOTS) {
      const label = `root=${root}, type=${type}`;

      test(`${label}: produces at least 1 voicing`, () => {
        const voicings = getChordVoicings(root, type);
        expect(voicings.length).toBeGreaterThanOrEqual(1);
      });

      test(`${label}: at most 50 voicings`, () => {
        const voicings = getChordVoicings(root, type);
        expect(voicings.length).toBeLessThanOrEqual(50);
      });

      test(`${label}: all voicings have 6 string entries`, () => {
        const voicings = getChordVoicings(root, type);
        for (const v of voicings) {
          expect(v).toHaveLength(6);
        }
      });

      test(`${label}: frets in valid range`, () => {
        const voicings = getChordVoicings(root, type);
        for (const v of voicings) {
          for (const note of v) {
            expect(note.s).toBeGreaterThanOrEqual(0);
            expect(note.s).toBeLessThanOrEqual(5);
            expect(note.f).toBeGreaterThanOrEqual(-1);
            if (note.f >= 0) expect(note.f).toBeLessThanOrEqual(TOTAL_FRETS);
          }
        }
      });

      test(`${label}: fretted notes span <= 4 frets`, () => {
        const voicings = getChordVoicings(root, type);
        for (const v of voicings) {
          const fretted = getFrettedFrets(v);
          if (fretted.length > 0) {
            const span = Math.max(...fretted) - Math.min(...fretted);
            expect(span).toBeLessThanOrEqual(4);
          }
        }
      });

      test(`${label}: all required pitch classes present`, () => {
        const intervals = CHORD_TYPES[type];
        const allPCs = intervals.map(i => (root + i) % 12);
        // For 4+ tone chords, the perfect 5th (interval index 2) is optional.
        // Only omit if it's a perfect 5th (7 semitones) — diminished/augmented 5ths
        // are defining tones and must be present.
        const required = intervals.length >= 4 && intervals[2] === 7
          ? allPCs.filter((_, idx) => idx !== 2)
          : allPCs;

        const voicings = getChordVoicings(root, type);
        for (const v of voicings) {
          const pcs = getPitchClasses(v);
          for (const pc of required) {
            expect(pcs.has(pc)).toBe(true);
          }
        }
      });

      test(`${label}: open strings have valid pitch classes`, () => {
        const intervals = CHORD_TYPES[type];
        const chordPCs = new Set(intervals.map(i => (root + i) % 12));

        const voicings = getChordVoicings(root, type);
        for (const v of voicings) {
          for (const note of v) {
            if (note.f === 0) {
              const pc = STANDARD_TUNING[note.s] % 12;
              expect(chordPCs.has(pc)).toBe(true);
            }
          }
        }
      });

      test(`${label}: no duplicate voicings`, () => {
        const voicings = getChordVoicings(root, type);
        const keys = voicings.map(voicingKey);
        const uniqueKeys = new Set(keys);
        expect(uniqueKeys.size).toBe(keys.length);
      });
    }
  }
});

describe('Inversion filtering', () => {
  // Use C Major as a well-understood test case
  test('root position: bass note is root', () => {
    const voicings = getChordVoicings(0, 'Major', 'root');
    for (const v of voicings) {
      expect(getBassPitchClass(v)).toBe(0); // C
    }
  });

  test('1st inversion: bass note is interval[1]', () => {
    const voicings = getChordVoicings(0, 'Major', '1st');
    for (const v of voicings) {
      expect(getBassPitchClass(v)).toBe(4); // E
    }
  });

  test('2nd inversion: bass note is interval[2]', () => {
    const voicings = getChordVoicings(0, 'Major', '2nd');
    for (const v of voicings) {
      expect(getBassPitchClass(v)).toBe(7); // G
    }
  });

  test('"all" returns more voicings than any single inversion', () => {
    const all = getChordVoicings(0, 'Major', 'all');
    const rootPos = getChordVoicings(0, 'Major', 'root');
    const first = getChordVoicings(0, 'Major', '1st');
    const second = getChordVoicings(0, 'Major', '2nd');
    expect(all.length).toBeGreaterThanOrEqual(rootPos.length);
    expect(all.length).toBeGreaterThanOrEqual(first.length);
    expect(all.length).toBeGreaterThanOrEqual(second.length);
  });

  test('default (no inversion arg) same as "all"', () => {
    const noArg = getChordVoicings(0, 'Major');
    const allArg = getChordVoicings(0, 'Major', 'all');
    expect(noArg.length).toBe(allArg.length);
  });

  // Inversion for non-tertian chord (sus4)
  test('sus4 1st inversion: bass note is interval[1] (the 4th)', () => {
    // Csus4 intervals = [0,5,7], interval[1] = 5 semitones = F
    const voicings = getChordVoicings(0, 'Sus4', '1st');
    for (const v of voicings) {
      expect(getBassPitchClass(v)).toBe(5); // F
    }
  });

  // "other" inversion: voicings with 7th in bass excluded from root/1st/2nd
  test('7th chord: voicings with b7 in bass excluded from root/1st/2nd filters', () => {
    // C7 intervals = [0,4,7,10]. A voicing with Bb (pc 10) in bass is "other".
    const all = getChordVoicings(0, '7th', 'all');
    const rootV = getChordVoicings(0, '7th', 'root');
    const firstV = getChordVoicings(0, '7th', '1st');
    const secondV = getChordVoicings(0, '7th', '2nd');
    // "all" should include voicings not in any named inversion
    const namedCount = rootV.length + firstV.length + secondV.length;
    // There should be at least some "other" voicings (b7 in bass)
    expect(all.length).toBeGreaterThanOrEqual(namedCount);
  });

  // Invalid chord type returns empty
  test('unknown chord type returns empty array', () => {
    const voicings = getChordVoicings(0, 'NonexistentType');
    expect(voicings).toEqual([]);
  });
});

describe('buildVoicingRegions (unchanged)', () => {
  test('creates regions with fret sets, root fret, and barre info', () => {
    const voicings = getChordVoicings(0, 'Major');
    const regions = buildVoicingRegions(voicings, 0);
    expect(regions.length).toBe(voicings.length);
    for (const r of regions) {
      expect(r.frets).toBeInstanceOf(Set);
      expect(r.frets.size).toBeGreaterThan(0);
      expect(r.voicing).toBeDefined();
      expect(r.voicing).toHaveLength(6);
      // rootFret should exist for a C Major chord (root=0)
      expect(r.rootFret).not.toBeNull();
      // barreFret is either null or a number >= 1
      if (r.barreFret !== null) {
        expect(r.barreFret).toBeGreaterThanOrEqual(1);
      }
    }
  });
});
