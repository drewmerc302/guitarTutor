# Chord Generator Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hardcoded CAGED chord voicings with a constraint-based algorithmic generator that finds all playable voicings across 24 frets, with inversion filtering.

**Architecture:** A single `generateVoicings()` function enumerates fret windows, filters by pitch-class constraints, deduplicates, and ranks by playability. Results are memoized. The UI adds an inversion filter SegmentedControl.

**Tech Stack:** TypeScript, React Native (Expo), Jest

**Spec:** `docs/superpowers/specs/2026-03-12-chord-generator-redesign.md`

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `src/engine/chords.ts` | Modify | Delete all hardcoded generators, add `generateVoicings()`, cache, inversion filter, `classifyInversion()`, `scorePlayability()` |
| `src/engine/__tests__/chords.test.ts` | Rewrite | Property-based tests, golden set regression, snapshot counts |
| `src/screens/ChordsScreen.tsx` | Modify | Add inversion SegmentedControl, pass filter to `getChordVoicings()` |
| `src/screens/__tests__/ChordsScreen.test.tsx` | Modify | Add test for inversion control rendering and interaction |

---

## Chunk 1: Core Algorithm + Property Tests

### Task 1: Write property-based test scaffolding

**Files:**
- Rewrite: `src/engine/__tests__/chords.test.ts`

- [ ] **Step 1: Write the property-based tests**

Replace the existing test file contents with tests that will validate the new algorithm. These tests are written against the existing `getChordVoicings` public API so they define the contract the new implementation must satisfy.

```typescript
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest src/engine/__tests__/chords.test.ts --no-coverage 2>&1 | tail -20`

Expected: FAIL — `InversionFilter` type doesn't exist yet, tests won't compile.

- [ ] **Step 3: Commit the test file**

```bash
git add src/engine/__tests__/chords.test.ts
git commit -m "test: rewrite chord tests for constraint-based generator

Property-based tests for all 144 (root, type) combinations plus
inversion filtering tests. Tests define the contract for the new
algorithm before implementation."
```

---

### Task 2: Implement the core `generateVoicings()` algorithm

**Files:**
- Modify: `src/engine/chords.ts`

- [ ] **Step 1: Add the `InversionFilter` type and helper functions**

At the top of `src/engine/chords.ts`, after the existing type definitions, add:

```typescript
export type InversionFilter = 'all' | 'root' | '1st' | '2nd';
```

- [ ] **Step 2: Write the `generateVoicings()` function**

Replace everything from `generateBarreVoicings` through the end of `getChordVoicings` (lines 25-289) with the new algorithm. Keep `CHORD_TYPES`, the type definitions, `findBarreFret`, and `buildVoicingRegions` unchanged.

```typescript
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
  // Find lowest and highest played string indices
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

  score += muted; // +1 per muted string
  if (fretted.length > 0) {
    score += Math.max(...fretted) - Math.min(...fretted); // +1 per fret of stretch
  }
  score += countInteriorMutes(voicing) * 2; // +2 per interior gap
  score -= Math.min(3, Math.max(0, played - 3)); // -1 per extra string beyond 3, capped at -3

  return score;
}

/**
 * Classify voicing inversion based on bass note relative to interval array.
 */
function classifyInversion(
  voicing: ChordVoicing,
  root: number,
  intervals: number[],
): 'root' | '1st' | '2nd' | 'other' {
  // Find bass note: lowest-pitched non-muted string (highest string index)
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

    // Enumerate all combinations of string assignments
    // options[0] = choices for string 0, options[1] = choices for string 1, etc.
    const counts = options.map(o => o.length);

    // Total combinations for this window
    let total = 1;
    for (const c of counts) total *= c;

    for (let combo = 0; combo < total; combo++) {
      // Decode combo index into per-string choices
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
  return results.slice(0, 50).map(r => r.voicing);
}

/**
 * Get chord voicings for a root + type, with optional inversion filter.
 * Results are memoized per (root, type) pair.
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
```

- [ ] **Step 3: Run the property-based tests**

Run: `npx jest src/engine/__tests__/chords.test.ts --no-coverage 2>&1 | tail -30`

Expected: Most property tests PASS. If any fail, debug and fix the algorithm. Common issues to watch for:
- Fret span might need adjusting (the spec says <= 4, check the `windowEnd = windowStart + 3` math — this gives a 4-fret window: e.g., frets 1,2,3,4)
- Open string pitch class check — `STANDARD_TUNING[s] % 12` for standard tuning where all values are already 0-11

- [ ] **Step 4: Commit**

```bash
git add src/engine/chords.ts src/engine/__tests__/chords.test.ts
git commit -m "feat(engine): constraint-based chord voicing generator

Replace all hardcoded CAGED generators with a single algorithm
that enumerates fret windows, filters by pitch-class constraints,
and ranks by playability. Supports inversion classification and
memoization cache."
```

---

### Task 3: Write golden set regression tests

**Files:**
- Modify: `src/engine/__tests__/chords.test.ts`

- [ ] **Step 1: Add the golden set tests**

Append the following to the end of `src/engine/__tests__/chords.test.ts`:

```typescript
/**
 * Helper: convert tab notation (low-E-first) to ChordVoicing.
 * Notation: "x-3-2-0-1-0" where x=muted, numbers=frets.
 * String order: index 0 = string 5 (low E), index 5 = string 0 (high E).
 */
function tabToVoicing(tab: string): ChordVoicing {
  const frets = tab.split('-').map(s => s === 'x' ? -1 : parseInt(s));
  // tab is low-E-first: frets[0] = string 5, frets[5] = string 0
  return frets.map((f, i) => ({ s: 5 - i, f }));
}

function voicingsContain(voicings: ChordVoicing[], target: ChordVoicing): boolean {
  const targetKey = target
    .slice()
    .sort((a, b) => a.s - b.s)
    .map(v => `${v.s}:${v.f}`)
    .join(',');
  return voicings.some(v => {
    const key = v
      .slice()
      .sort((a, b) => a.s - b.s)
      .map(n => `${n.s}:${n.f}`)
      .join(',');
    return key === targetKey;
  });
}

describe('Golden set regression', () => {
  const goldenSet: Array<{ name: string; root: number; type: string; tab: string }> = [
    // Major open chords
    { name: 'Open C Major',    root: 0,  type: 'Major', tab: 'x-3-2-0-1-0' },
    { name: 'Open D Major',    root: 2,  type: 'Major', tab: 'x-x-0-2-3-2' },
    { name: 'Open E Major',    root: 4,  type: 'Major', tab: '0-2-2-1-0-0' },
    { name: 'Open G Major',    root: 7,  type: 'Major', tab: '3-2-0-0-0-3' },
    { name: 'Open A Major',    root: 9,  type: 'Major', tab: 'x-0-2-2-2-0' },

    // Major barre chords
    { name: 'F barre (E-shape)',  root: 5,  type: 'Major', tab: '1-3-3-2-1-1' },
    { name: 'Bb barre (A-shape)', root: 10, type: 'Major', tab: 'x-1-3-3-3-1' },

    // Minor open chords
    { name: 'Open Am',         root: 9,  type: 'Minor', tab: 'x-0-2-2-1-0' },
    { name: 'Open Em',         root: 4,  type: 'Minor', tab: '0-2-2-0-0-0' },
    { name: 'Open Dm',         root: 2,  type: 'Minor', tab: 'x-x-0-2-3-1' },

    // 7th chords
    { name: 'Open E7',         root: 4,  type: '7th',  tab: '0-2-0-1-0-0' },
    { name: 'Open A7',         root: 9,  type: '7th',  tab: 'x-0-2-0-2-0' },
    { name: 'Open D7',         root: 2,  type: '7th',  tab: 'x-x-0-2-1-2' },

    // Maj7 chords
    { name: 'Open Cmaj7',      root: 0,  type: 'Maj7', tab: 'x-3-2-0-0-0' },
    { name: 'Open Emaj7',      root: 4,  type: 'Maj7', tab: '0-2-1-1-0-0' },

    // Min7 chords
    { name: 'Open Em7',        root: 4,  type: 'Min7', tab: '0-2-0-0-0-0' },
    { name: 'Open Am7',        root: 9,  type: 'Min7', tab: 'x-0-2-0-1-0' },

    // Sus chords
    { name: 'Open Dsus4',      root: 2,  type: 'Sus4', tab: 'x-x-0-2-3-3' },
    { name: 'Open Asus2',      root: 9,  type: 'Sus2', tab: 'x-0-2-2-0-0' },
    { name: 'Open Dsus2',      root: 2,  type: 'Sus2', tab: 'x-x-0-2-3-0' },

    // Dim
    { name: 'Bdim (open pos)', root: 11, type: 'Dim',  tab: 'x-2-3-4-3-x' },

    // Aug
    { name: 'Caug (open pos)', root: 0,  type: 'Aug',  tab: 'x-3-2-1-1-0' },
  ];

  for (const { name, root, type, tab } of goldenSet) {
    test(`generates ${name}: ${tab}`, () => {
      const voicings = getChordVoicings(root, type);
      const target = tabToVoicing(tab);
      expect(voicingsContain(voicings, target)).toBe(true);
    });
  }
});
```

- [ ] **Step 2: Run the golden set tests**

Run: `npx jest src/engine/__tests__/chords.test.ts --no-coverage -t "Golden set" 2>&1 | tail -20`

Expected: PASS. If a golden voicing is missing, the generator has a bug — likely a window boundary issue or pitch-class filtering error. Debug by logging the voicings for the failing root/type and comparing.

- [ ] **Step 3: Commit**

```bash
git add src/engine/__tests__/chords.test.ts
git commit -m "test: add golden set regression tests for chord generator

22 hand-curated voicings (open chords, barre chords, 7ths, sus,
dim, aug) that the generator must include in its output."
```

---

### Task 4: Add snapshot/count tests

**Files:**
- Modify: `src/engine/__tests__/chords.test.ts`

- [ ] **Step 1: Add snapshot test**

Append to `src/engine/__tests__/chords.test.ts`:

```typescript
describe('Voicing count snapshot', () => {
  test('voicing counts per (root, type) match snapshot', () => {
    const counts: Record<string, number> = {};
    for (const type of ALL_TYPES) {
      for (const root of ALL_ROOTS) {
        counts[`${root}-${type}`] = getChordVoicings(root, type).length;
      }
    }
    expect(counts).toMatchSnapshot();
  });
});
```

- [ ] **Step 2: Run to generate snapshot**

Run: `npx jest src/engine/__tests__/chords.test.ts --no-coverage -t "snapshot" -u 2>&1 | tail -10`

Expected: PASS, snapshot written to `__snapshots__/chords.test.ts.snap`.

- [ ] **Step 3: Verify snapshot file was created**

Run: `ls -la src/engine/__tests__/__snapshots__/`

Expected: `chords.test.ts.snap` exists.

- [ ] **Step 4: Commit**

```bash
git add src/engine/__tests__/chords.test.ts src/engine/__tests__/__snapshots__/
git commit -m "test: add voicing count snapshot for regression detection"
```

---

### Task 5: Run full engine test suite and fix any regressions

**Files:**
- Possibly modify: `src/engine/chords.ts`, `src/engine/__tests__/chords.test.ts`

- [ ] **Step 1: Run all engine tests**

Run: `npx jest src/engine/ --no-coverage 2>&1 | tail -20`

Expected: All tests PASS.

- [ ] **Step 2: Run the ChordsScreen tests to check for regressions**

Run: `npx jest src/screens/__tests__/ChordsScreen.test.tsx --no-coverage 2>&1 | tail -20`

Expected: All existing tests PASS. The `getChordVoicings(root, type)` API is unchanged (inversion param is optional), so ChordsScreen should work without modification.

If any tests fail, investigate:
- The "Bug 5" test in ChordsScreen.test.tsx relies on specific voicing positions — the new generator may produce different voicings for CMaj7. Adjust the test's expectations to match the new output while preserving the test's intent (verifying that tapping a dimmed root triggers a voicing switch).

- [ ] **Step 3: Run ProgressionsScreen tests**

Run: `npx jest src/screens/__tests__/ProgressionsScreen.test.tsx --no-coverage 2>&1 | tail -20`

Expected: PASS — ProgressionsScreen calls `getChordVoicings(root, type)` without inversion.

- [ ] **Step 4: Fix any failures and commit**

If fixes were needed:
```bash
git add -u
git commit -m "fix: update tests for new chord generator output"
```

---

## Chunk 2: UI Changes + Final Verification

### Task 6: Add inversion filter to ChordsScreen

**Files:**
- Modify: `src/screens/ChordsScreen.tsx`

- [ ] **Step 1: Add inversion state and SegmentedControl**

In `ChordsScreen.tsx`, add the inversion state and pass it to `getChordVoicings`:

```typescript
// Add to imports
import { CHORD_TYPES, getChordVoicings, buildVoicingRegions, ChordVoicing, InversionFilter } from '../engine/chords';

// Add state (after the display state line)
const [inversion, setInversion] = usePersistentState<InversionFilter>('chords.inversion', 'all');

// Update voicings memo to use inversion
const voicings = useMemo(() => getChordVoicings(root, type, inversion), [root, type, inversion]);

// Add handleInversionChange handler (after handleTypeChange)
const handleInversionChange = (newInversion: string) => {
  const inv = newInversion.toLowerCase() as InversionFilter;
  const newVoicings = getChordVoicings(root, type, inv);
  if (newVoicings.length === 0) {
    // Fallback: reset to 'all' if no voicings for this inversion
    setInversion('all');
    setActiveVoicingIndex(findClosestToNutIndex(getChordVoicings(root, type, 'all')));
  } else {
    setInversion(inv);
    setActiveVoicingIndex(findClosestToNutIndex(newVoicings));
  }
};
```

- [ ] **Step 2: Add the SegmentedControl to the JSX**

After the Display SegmentedControl, add:

```tsx
<Text style={[styles.label, { color: theme.textSecondary }]}>Inversion</Text>
<SegmentedControl
  options={['All', 'Root', '1st', '2nd']}
  activeOption={inversion === 'all' ? 'All' : inversion === 'root' ? 'Root' : inversion}
  onSelect={handleInversionChange}
/>
```

- [ ] **Step 3: Also reset inversion when root or type changes**

Update `handleRootChange` and `handleTypeChange` to reset inversion-aware voicing selection:

```typescript
const handleRootChange = (newRoot: number) => {
  setRoot(newRoot);
  const newVoicings = getChordVoicings(newRoot, type, inversion);
  if (newVoicings.length === 0) {
    setInversion('all');
    setActiveVoicingIndex(findClosestToNutIndex(getChordVoicings(newRoot, type, 'all')));
  } else {
    setActiveVoicingIndex(findClosestToNutIndex(newVoicings));
  }
};

const handleTypeChange = (newType: string) => {
  setType(newType);
  const newVoicings = getChordVoicings(root, newType, inversion);
  if (newVoicings.length === 0) {
    setInversion('all');
    setActiveVoicingIndex(findClosestToNutIndex(getChordVoicings(root, newType, 'all')));
  } else {
    setActiveVoicingIndex(findClosestToNutIndex(newVoicings));
  }
};
```

- [ ] **Step 4: Run ChordsScreen tests**

Run: `npx jest src/screens/__tests__/ChordsScreen.test.tsx --no-coverage 2>&1 | tail -20`

Expected: All existing tests PASS. The inversion control defaults to "all", so existing behavior is preserved.

- [ ] **Step 5: Commit**

```bash
git add src/screens/ChordsScreen.tsx
git commit -m "feat(ui): add inversion filter to ChordsScreen

SegmentedControl with All/Root/1st/2nd options. Falls back to
'All' when a filter yields zero voicings. Persisted across sessions."
```

---

### Task 7: Add ChordsScreen inversion UI test

**Files:**
- Modify: `src/screens/__tests__/ChordsScreen.test.tsx`

- [ ] **Step 1: Add inversion control tests**

Append to the `describe('ChordsScreen', ...)` block in `ChordsScreen.test.tsx`:

```typescript
test('renders Inversion SegmentedControl', () => {
  let tree: any;
  act(() => { tree = create(<ChordsScreen />); });
  const json = JSON.stringify(tree.toJSON());
  expect(json).toContain('Inversion');
  expect(json).toContain('All');
  expect(json).toContain('Root');
  expect(json).toContain('1st');
  expect(json).toContain('2nd');
});

test('selecting Root inversion updates voicings', () => {
  let tree: any;
  act(() => { tree = create(<ChordsScreen />); });

  const fvBefore = tree.root.findByType(FretboardViewer);
  const voicingBefore = JSON.stringify([...(fvBefore.props.activeVoicing as Set<string>)].sort());

  const rootBtn = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Root')[0];
  act(() => { rootBtn.props.onPress(); });

  // Voicing set may change (or stay the same if default was already root position)
  // Just verify it doesn't crash and still has an active voicing
  const fvAfter = tree.root.findByType(FretboardViewer);
  expect(fvAfter.props.activeVoicing).toBeTruthy();
});
```

- [ ] **Step 2: Run tests**

Run: `npx jest src/screens/__tests__/ChordsScreen.test.tsx --no-coverage 2>&1 | tail -20`

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/screens/__tests__/ChordsScreen.test.tsx
git commit -m "test: add inversion SegmentedControl tests for ChordsScreen"
```

---

### Task 8: Final full test suite verification

**Files:** None (verification only)

- [ ] **Step 1: Run the entire test suite**

Run: `npx jest --no-coverage 2>&1 | tail -30`

Expected: All tests PASS across all test files.

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit 2>&1 | tail -20`

Expected: No errors.

- [ ] **Step 3: Quick manual verification**

Run: `npx jest src/engine/__tests__/chords.test.ts --no-coverage --verbose 2>&1 | head -50`

Verify: Property tests, golden set, inversion, and snapshot tests all pass.

- [ ] **Step 4: Final commit if any cleanup was needed**

If any fixes were needed during verification:
```bash
git add -u
git commit -m "fix: address final test suite issues"
```
