# Guitar Tutor App — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a cross-platform guitar reference app with 5 tabs (Chords, Scales, Progressions, Triads, Arpeggios) using React Native + Expo, backed by a pure TypeScript music theory engine.

**Architecture:** A pure TypeScript engine computes all music theory (notes, intervals, chords, scales, triads, arpeggios, progressions) with zero UI dependencies. A shared `GuitarNeck` SVG component renders any set of active notes on a horizontal fretboard. Five screen components compose the engine outputs with picker controls and the shared neck. Theme support via React context follows system preference with manual toggle.

**Tech Stack:** React Native, Expo (managed workflow), TypeScript, react-native-svg, React Navigation (bottom tabs), Jest

**Reference Prototype:** `mockups/guitar-tutor-prototype.html` — approved interactive prototype with all 5 tabs working. All logic, data structures, colors, and behaviors in this file are the source of truth.

**Design Document:** `docs/plans/2026-02-19-guitar-tutor-design.md`

---

## Stage 1: Project Scaffolding

### Task 1: Initialize Expo project

**Files:**
- Create: `package.json`, `tsconfig.json`, `app.json`, `App.tsx`, `babel.config.js`

**Step 1: Create Expo project with TypeScript template**

```bash
npx create-expo-app@latest . --template blank-typescript
```

**Step 2: Verify project runs**

```bash
npx expo start --web
```

Expected: Default Expo welcome screen in browser.

**Step 3: Commit**

```bash
git add -A
git commit -m "chore: initialize Expo TypeScript project"
```

---

### Task 2: Install dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install required packages**

```bash
npx expo install react-native-svg @react-navigation/native @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context
```

**Step 2: Install dev dependencies**

```bash
npm install --save-dev jest @types/jest ts-jest @testing-library/react-native @testing-library/jest-native
```

**Step 3: Verify installation**

```bash
npx expo start --web
```

Expected: App still launches without errors.

**Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install navigation, SVG, and testing dependencies"
```

---

### Task 3: Create project directory structure

**Files:**
- Create: `src/engine/`, `src/components/`, `src/screens/`, `src/theme/`

**Step 1: Create directories**

```bash
mkdir -p src/engine src/components src/screens src/theme
```

**Step 2: Create placeholder index files to verify imports work**

Create `src/engine/index.ts`:
```typescript
// Music theory engine — pure TypeScript, zero UI dependencies
export {};
```

**Step 3: Commit**

```bash
git add src/
git commit -m "chore: create project directory structure"
```

---

## Stage 2: Music Theory Engine

All engine modules are pure TypeScript with zero UI dependencies. Every function is test-driven.

### Task 4: Note representation and tuning

**Files:**
- Create: `src/engine/notes.ts`
- Test: `src/engine/__tests__/notes.test.ts`

**Step 1: Write the failing tests**

```typescript
// src/engine/__tests__/notes.test.ts
import { NOTE_NAMES, STANDARD_TUNING, TOTAL_FRETS, STRING_NAMES, noteValue } from '../notes';

describe('notes', () => {
  test('NOTE_NAMES has 12 chromatic notes starting from C', () => {
    expect(NOTE_NAMES).toEqual(['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']);
  });

  test('STANDARD_TUNING represents EADGBE high to low as note indices', () => {
    // E=4, B=11, G=7, D=2, A=9, E=4
    expect(STANDARD_TUNING).toEqual([4, 11, 7, 2, 9, 4]);
    expect(STANDARD_TUNING).toHaveLength(6);
  });

  test('STRING_NAMES labels are E B G D A E', () => {
    expect(STRING_NAMES).toEqual(['E','B','G','D','A','E']);
  });

  test('TOTAL_FRETS is 15', () => {
    expect(TOTAL_FRETS).toBe(15);
  });

  test('noteValue computes correct note at string/fret position', () => {
    // Open high E string (index 0) = E = 4
    expect(noteValue(0, 0)).toBe(4);
    // 1st fret high E = F = 5
    expect(noteValue(0, 1)).toBe(5);
    // Open A string (index 4) = A = 9
    expect(noteValue(4, 0)).toBe(9);
    // 3rd fret A string = C = 0
    expect(noteValue(4, 3)).toBe(0);
    // Wraps around: 12th fret = same as open
    expect(noteValue(0, 12)).toBe(4);
  });
});
```

**Step 2: Run tests to verify they fail**

```bash
npx jest src/engine/__tests__/notes.test.ts --verbose
```

Expected: FAIL — module not found.

**Step 3: Write minimal implementation**

```typescript
// src/engine/notes.ts
export const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
export const STANDARD_TUNING = [4, 11, 7, 2, 9, 4]; // E B G D A E (high to low)
export const STRING_NAMES = ['E','B','G','D','A','E'];
export const TOTAL_FRETS = 15;

/** Get the note value (0-11) at a given string and fret. */
export function noteValue(string: number, fret: number): number {
  return (STANDARD_TUNING[string] + fret) % 12;
}
```

**Step 4: Run tests to verify they pass**

```bash
npx jest src/engine/__tests__/notes.test.ts --verbose
```

Expected: All PASS.

**Step 5: Commit**

```bash
git add src/engine/notes.ts src/engine/__tests__/notes.test.ts
git commit -m "feat(engine): add note representation and tuning constants"
```

---

### Task 5: Interval definitions and names

**Files:**
- Create: `src/engine/intervals.ts`
- Test: `src/engine/__tests__/intervals.test.ts`

**Step 1: Write the failing tests**

```typescript
// src/engine/__tests__/intervals.test.ts
import { INTERVAL_NAMES, intervalFromRoot } from '../intervals';

describe('intervals', () => {
  test('INTERVAL_NAMES maps semitones to labels', () => {
    expect(INTERVAL_NAMES[0]).toBe('R');
    expect(INTERVAL_NAMES[4]).toBe('3');
    expect(INTERVAL_NAMES[7]).toBe('5');
    expect(INTERVAL_NAMES[10]).toBe('b7');
    expect(INTERVAL_NAMES[11]).toBe('7');
    expect(INTERVAL_NAMES[3]).toBe('b3');
    expect(INTERVAL_NAMES[6]).toBe('b5');
    expect(INTERVAL_NAMES[14]).toBe('9');
  });

  test('intervalFromRoot computes semitones from root', () => {
    // C (0) to E (4) = major 3rd = 4
    expect(intervalFromRoot(0, 4)).toBe(4);
    // A (9) to C (0) = minor 3rd = 3
    expect(intervalFromRoot(9, 0)).toBe(3);
    // E (4) to E (4) = unison = 0
    expect(intervalFromRoot(4, 4)).toBe(0);
  });
});
```

**Step 2: Run tests to verify they fail**

```bash
npx jest src/engine/__tests__/intervals.test.ts --verbose
```

Expected: FAIL.

**Step 3: Write minimal implementation**

```typescript
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
```

**Step 4: Run tests to verify they pass**

```bash
npx jest src/engine/__tests__/intervals.test.ts --verbose
```

Expected: All PASS.

**Step 5: Commit**

```bash
git add src/engine/intervals.ts src/engine/__tests__/intervals.test.ts
git commit -m "feat(engine): add interval names and calculation"
```

---

### Task 6: Fretboard note computation

**Files:**
- Create: `src/engine/fretboard.ts`
- Test: `src/engine/__tests__/fretboard.test.ts`

This is the core function that powers all 5 tabs: given root + interval pattern, compute all matching `{string, fret}` positions across the neck.

**Step 1: Write the failing tests**

```typescript
// src/engine/__tests__/fretboard.test.ts
import { getNotesOnFretboard, FretboardNote } from '../fretboard';

describe('getNotesOnFretboard', () => {
  test('C major triad (root=0, intervals=[0,4,7]) returns notes on all 6 strings', () => {
    const notes = getNotesOnFretboard(0, [0, 4, 7]);
    // Should have notes on every string
    const strings = new Set(notes.map(n => n.string));
    expect(strings.size).toBe(6);
    // Every note should be C, E, or G
    const validNotes = new Set([0, 4, 7]); // C, E, G
    for (const note of notes) {
      expect(validNotes.has(note.note)).toBe(true);
    }
  });

  test('root notes are flagged with isRoot=true', () => {
    const notes = getNotesOnFretboard(0, [0, 4, 7]);
    const roots = notes.filter(n => n.isRoot);
    expect(roots.length).toBeGreaterThan(0);
    for (const r of roots) {
      expect(r.note).toBe(0); // C
      expect(r.interval).toBe(0);
      expect(r.intervalLabel).toBe('R');
    }
  });

  test('intervalLabel matches interval name for each note', () => {
    const notes = getNotesOnFretboard(9, [0, 3, 7]); // A minor
    for (const n of notes) {
      if (n.interval === 0) expect(n.intervalLabel).toBe('R');
      else if (n.interval === 3) expect(n.intervalLabel).toBe('b3');
      else if (n.interval === 7) expect(n.intervalLabel).toBe('5');
    }
  });

  test('no notes beyond TOTAL_FRETS', () => {
    const notes = getNotesOnFretboard(0, [0, 4, 7]);
    for (const n of notes) {
      expect(n.fret).toBeLessThanOrEqual(15);
      expect(n.fret).toBeGreaterThanOrEqual(0);
    }
  });

  test('noteName is populated correctly', () => {
    const notes = getNotesOnFretboard(0, [0, 4, 7]);
    for (const n of notes) {
      if (n.note === 0) expect(n.noteName).toBe('C');
      else if (n.note === 4) expect(n.noteName).toBe('E');
      else if (n.note === 7) expect(n.noteName).toBe('G');
    }
  });
});
```

**Step 2: Run tests to verify they fail**

```bash
npx jest src/engine/__tests__/fretboard.test.ts --verbose
```

Expected: FAIL.

**Step 3: Write minimal implementation**

```typescript
// src/engine/fretboard.ts
import { NOTE_NAMES, STANDARD_TUNING, TOTAL_FRETS } from './notes';
import { INTERVAL_NAMES, intervalFromRoot } from './intervals';

export interface FretboardNote {
  string: number;
  fret: number;
  note: number;        // 0-11
  interval: number;    // semitones from root
  intervalLabel: string;
  isRoot: boolean;
  noteName: string;
  finger: number | null;
}

/**
 * Given a root note and interval pattern, find all matching positions on the fretboard.
 * This single function powers all 5 tabs.
 */
export function getNotesOnFretboard(root: number, intervals: number[]): FretboardNote[] {
  const notes: FretboardNote[] = [];
  const intervalSet = new Set(intervals.map(i => i % 12));

  for (let s = 0; s < 6; s++) {
    for (let f = 0; f <= TOTAL_FRETS; f++) {
      const noteValue = (STANDARD_TUNING[s] + f) % 12;
      const fromRoot = (noteValue - root + 12) % 12;
      if (intervalSet.has(fromRoot)) {
        const intervalIndex = intervals.findIndex(i => i % 12 === fromRoot);
        notes.push({
          string: s,
          fret: f,
          note: noteValue,
          interval: fromRoot,
          intervalLabel: INTERVAL_NAMES[intervals[intervalIndex]] || INTERVAL_NAMES[fromRoot],
          isRoot: fromRoot === 0,
          noteName: NOTE_NAMES[noteValue],
          finger: null,
        });
      }
    }
  }
  return notes;
}
```

**Step 4: Run tests to verify they pass**

```bash
npx jest src/engine/__tests__/fretboard.test.ts --verbose
```

Expected: All PASS.

**Step 5: Commit**

```bash
git add src/engine/fretboard.ts src/engine/__tests__/fretboard.test.ts
git commit -m "feat(engine): add fretboard note computation"
```

---

### Task 7: Finger assignment algorithm

**Files:**
- Create: `src/engine/fingers.ts`
- Test: `src/engine/__tests__/fingers.test.ts`

**Step 1: Write the failing tests**

```typescript
// src/engine/__tests__/fingers.test.ts
import { assignFingers } from '../fingers';
import { FretboardNote } from '../fretboard';

function makeNote(s: number, f: number): FretboardNote {
  return { string: s, fret: f, note: 0, interval: 0, intervalLabel: 'R', isRoot: true, noteName: 'C', finger: null };
}

describe('assignFingers', () => {
  test('all open strings get finger 0', () => {
    const notes = [makeNote(0, 0), makeNote(1, 0), makeNote(2, 0)];
    assignFingers(notes);
    expect(notes.every(n => n.finger === 0)).toBe(true);
  });

  test('standard 4-fret position assigns fingers 1-4', () => {
    const notes = [makeNote(0, 5), makeNote(1, 6), makeNote(2, 7), makeNote(3, 8)];
    assignFingers(notes);
    expect(notes[0].finger).toBe(1);
    expect(notes[1].finger).toBe(2);
    expect(notes[2].finger).toBe(3);
    expect(notes[3].finger).toBe(4);
  });

  test('mixed open and fretted notes', () => {
    const notes = [makeNote(0, 0), makeNote(1, 2), makeNote(2, 2), makeNote(3, 1)];
    assignFingers(notes);
    expect(notes[0].finger).toBe(0); // open
    expect(notes[3].finger).toBe(1); // fret 1 = index
  });

  test('single fretted note gets finger 1', () => {
    const notes = [makeNote(2, 5)];
    assignFingers(notes);
    expect(notes[0].finger).toBe(1);
  });

  test('fingers never exceed 4', () => {
    const notes = [makeNote(0, 1), makeNote(1, 3), makeNote(2, 5), makeNote(3, 7), makeNote(4, 9)];
    assignFingers(notes);
    for (const n of notes) {
      expect(n.finger).toBeLessThanOrEqual(4);
      expect(n.finger).toBeGreaterThanOrEqual(1);
    }
  });
});
```

**Step 2: Run tests to verify they fail**

```bash
npx jest src/engine/__tests__/fingers.test.ts --verbose
```

Expected: FAIL.

**Step 3: Write minimal implementation**

```typescript
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
```

**Step 4: Run tests to verify they pass**

```bash
npx jest src/engine/__tests__/fingers.test.ts --verbose
```

Expected: All PASS.

**Step 5: Commit**

```bash
git add src/engine/fingers.ts src/engine/__tests__/fingers.test.ts
git commit -m "feat(engine): add finger assignment algorithm"
```

---

### Task 8: Chord definitions and CAGED voicing system

**Files:**
- Create: `src/engine/chords.ts`
- Test: `src/engine/__tests__/chords.test.ts`

**Step 1: Write the failing tests**

```typescript
// src/engine/__tests__/chords.test.ts
import {
  CHORD_TYPES,
  generateBarreVoicings,
  generateMinorBarreVoicings,
  getChordVoicings,
  buildVoicingRegions,
  ChordVoicing,
} from '../chords';
import { STANDARD_TUNING, TOTAL_FRETS } from '../notes';

describe('CHORD_TYPES', () => {
  test('Major chord is [0,4,7]', () => {
    expect(CHORD_TYPES['Major']).toEqual([0, 4, 7]);
  });
  test('Minor chord is [0,3,7]', () => {
    expect(CHORD_TYPES['Minor']).toEqual([0, 3, 7]);
  });
  test('has all expected chord families', () => {
    const expected = ['Major','Minor','7th','Maj7','Min7','Dim','Aug','Sus2','Sus4','Dim7','Min7b5','9th'];
    for (const name of expected) {
      expect(CHORD_TYPES[name]).toBeDefined();
    }
  });
});

describe('generateBarreVoicings', () => {
  test('generates 5 CAGED shapes for C major (root=0)', () => {
    const voicings = generateBarreVoicings(0);
    expect(voicings.length).toBeGreaterThanOrEqual(3);
    expect(voicings.length).toBeLessThanOrEqual(5);
  });

  test('all voicings have 6 string entries', () => {
    const voicings = generateBarreVoicings(0);
    for (const v of voicings) {
      expect(v).toHaveLength(6);
    }
  });

  test('frets are within valid range or -1 for muted', () => {
    for (let root = 0; root < 12; root++) {
      const voicings = generateBarreVoicings(root);
      for (const v of voicings) {
        for (const note of v) {
          expect(note.f >= -1).toBe(true);
          if (note.f >= 0) expect(note.f <= TOTAL_FRETS).toBe(true);
        }
      }
    }
  });

  test('each voicing contains the correct root note on at least one string', () => {
    for (let root = 0; root < 12; root++) {
      const voicings = generateBarreVoicings(root);
      for (const v of voicings) {
        const playedNotes = v.filter(n => n.f >= 0).map(n => (STANDARD_TUNING[n.s] + n.f) % 12);
        expect(playedNotes).toContain(root);
      }
    }
  });
});

describe('generateMinorBarreVoicings', () => {
  test('generates voicings for all 12 roots', () => {
    for (let root = 0; root < 12; root++) {
      const voicings = generateMinorBarreVoicings(root);
      expect(voicings.length).toBeGreaterThanOrEqual(2);
    }
  });

  test('each voicing contains the minor third', () => {
    for (let root = 0; root < 12; root++) {
      const minorThird = (root + 3) % 12;
      const voicings = generateMinorBarreVoicings(root);
      for (const v of voicings) {
        const playedNotes = v.filter(n => n.f >= 0).map(n => (STANDARD_TUNING[n.s] + n.f) % 12);
        expect(playedNotes).toContain(minorThird);
      }
    }
  });
});

describe('getChordVoicings', () => {
  test('Major returns barre voicings', () => {
    const voicings = getChordVoicings(0, 'Major');
    expect(voicings.length).toBeGreaterThanOrEqual(3);
  });

  test('Minor returns minor barre voicings', () => {
    const voicings = getChordVoicings(0, 'Minor');
    expect(voicings.length).toBeGreaterThanOrEqual(2);
  });

  test('other types return at least one voicing', () => {
    const voicings = getChordVoicings(0, '7th');
    expect(voicings.length).toBeGreaterThanOrEqual(1);
  });
});

describe('buildVoicingRegions', () => {
  test('creates regions with fret sets and root fret info', () => {
    const voicings = generateBarreVoicings(0);
    const regions = buildVoicingRegions(voicings, 0);
    expect(regions.length).toBe(voicings.length);
    for (const r of regions) {
      expect(r.frets).toBeInstanceOf(Set);
      expect(r.voicing).toBeDefined();
    }
  });
});
```

**Step 2: Run tests to verify they fail**

```bash
npx jest src/engine/__tests__/chords.test.ts --verbose
```

Expected: FAIL.

**Step 3: Write minimal implementation**

```typescript
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
```

**Step 4: Run tests to verify they pass**

```bash
npx jest src/engine/__tests__/chords.test.ts --verbose
```

Expected: All PASS.

**Step 5: Commit**

```bash
git add src/engine/chords.ts src/engine/__tests__/chords.test.ts
git commit -m "feat(engine): add chord definitions and CAGED voicing system"
```

---

### Task 9: Scale definitions and box/position system

**Files:**
- Create: `src/engine/scales.ts`
- Test: `src/engine/__tests__/scales.test.ts`

**Step 1: Write the failing tests**

```typescript
// src/engine/__tests__/scales.test.ts
import { SCALE_TYPES, MODE_NAMES, computeScalePositions, applyModeRotation, ScalePosition } from '../scales';

describe('SCALE_TYPES', () => {
  test('Major scale is [0,2,4,5,7,9,11]', () => {
    expect(SCALE_TYPES['Major']).toEqual([0,2,4,5,7,9,11]);
  });
  test('Minor Pentatonic is [0,3,5,7,10]', () => {
    expect(SCALE_TYPES['Minor Pentatonic']).toEqual([0,3,5,7,10]);
  });
  test('Blues scale is [0,3,5,6,7,10]', () => {
    expect(SCALE_TYPES['Blues']).toEqual([0,3,5,6,7,10]);
  });
});

describe('MODE_NAMES', () => {
  test('has 7 modes in correct order', () => {
    expect(MODE_NAMES).toEqual(['Ionian','Dorian','Phrygian','Lydian','Mixolydian','Aeolian','Locrian']);
  });
});

describe('applyModeRotation', () => {
  test('mode 0 (Ionian) returns original intervals', () => {
    const result = applyModeRotation([0,2,4,5,7,9,11], 0);
    expect(result).toEqual([0,2,4,5,7,9,11]);
  });

  test('mode 1 (Dorian) rotates correctly', () => {
    const result = applyModeRotation([0,2,4,5,7,9,11], 1);
    expect(result).toEqual([0,2,3,5,7,9,10]);
  });

  test('mode 5 (Aeolian) equals natural minor', () => {
    const result = applyModeRotation([0,2,4,5,7,9,11], 5);
    expect(result).toEqual([0,2,3,5,7,8,10]);
  });
});

describe('computeScalePositions', () => {
  test('returns 5 positions for C major', () => {
    const positions = computeScalePositions(0, [0,2,4,5,7,9,11]);
    expect(positions).toHaveLength(5);
  });

  test('each position has label, fretStart, fretEnd, and notes', () => {
    const positions = computeScalePositions(0, [0,2,4,5,7,9,11]);
    for (const pos of positions) {
      expect(pos.label).toMatch(/^Box \d+$/);
      expect(typeof pos.fretStart).toBe('number');
      expect(typeof pos.fretEnd).toBe('number');
      expect(pos.fretEnd).toBeGreaterThan(pos.fretStart);
      expect(pos.notes.length).toBeGreaterThan(0);
    }
  });

  test('positions span 4-5 frets each', () => {
    const positions = computeScalePositions(0, [0,2,4,5,7,9,11]);
    for (const pos of positions) {
      expect(pos.fretEnd - pos.fretStart).toBeLessThanOrEqual(5);
      expect(pos.fretEnd - pos.fretStart).toBeGreaterThanOrEqual(3);
    }
  });

  test('notes only contain scale tones', () => {
    const intervals = [0,2,4,5,7,9,11];
    const intervalSet = new Set(intervals);
    const positions = computeScalePositions(0, intervals);
    for (const pos of positions) {
      for (const note of pos.notes) {
        expect(intervalSet.has(note.interval)).toBe(true);
      }
    }
  });

  test('notes have finger assignments', () => {
    const positions = computeScalePositions(0, [0,2,4,5,7,9,11]);
    for (const pos of positions) {
      for (const note of pos.notes) {
        expect(note.finger).not.toBeNull();
      }
    }
  });

  test('works for all 12 roots', () => {
    for (let root = 0; root < 12; root++) {
      const positions = computeScalePositions(root, [0,2,4,5,7,9,11]);
      expect(positions.length).toBe(5);
    }
  });
});
```

**Step 2: Run tests to verify they fail**

```bash
npx jest src/engine/__tests__/scales.test.ts --verbose
```

Expected: FAIL.

**Step 3: Write minimal implementation**

```typescript
// src/engine/scales.ts
import { STANDARD_TUNING, TOTAL_FRETS, NOTE_NAMES } from './notes';
import { INTERVAL_NAMES, intervalFromRoot } from './intervals';
import { FretboardNote } from './fretboard';
import { assignFingers } from './fingers';

export const SCALE_TYPES: Record<string, number[]> = {
  'Major': [0,2,4,5,7,9,11],
  'Natural Minor': [0,2,3,5,7,8,10],
  'Harmonic Minor': [0,2,3,5,7,8,11],
  'Melodic Minor': [0,2,3,5,7,9,11],
  'Major Pentatonic': [0,2,4,7,9],
  'Minor Pentatonic': [0,3,5,7,10],
  'Blues': [0,3,5,6,7,10],
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

/** Compute 5 box positions for a scale across the neck. */
export function computeScalePositions(root: number, intervals: number[]): ScalePosition[] {
  const intervalSet = new Set(intervals.map(i => i % 12));

  // Find starting fret near low E root
  const baseRootE = (() => {
    for (let f = 0; f <= 3; f++) {
      if ((STANDARD_TUNING[5] + f) % 12 === root) return f;
    }
    return 0;
  })();

  // Generate 5 box start frets
  const boxStarts: number[] = [];
  let current = baseRootE;
  for (let i = 0; i < 5 && current <= TOTAL_FRETS; i++) {
    boxStarts.push(current);
    const nextMin = current + 2;
    let nextStart = nextMin;
    for (let f = nextMin; f <= nextMin + 3 && f <= TOTAL_FRETS; f++) {
      const noteVal = (STANDARD_TUNING[5] + f) % 12;
      const fromRoot = (noteVal - root + 12) % 12;
      if (intervalSet.has(fromRoot)) {
        nextStart = f;
        break;
      }
    }
    current = nextStart;
  }

  const positions: ScalePosition[] = [];
  for (let i = 0; i < boxStarts.length; i++) {
    const startFret = boxStarts[i];
    const endFret = startFret + 4;
    const minFret = startFret === 0 ? 0 : startFret;
    const boxNotes: FretboardNote[] = [];

    for (let s = 0; s < 6; s++) {
      for (let f = minFret; f <= Math.min(endFret, TOTAL_FRETS); f++) {
        const noteValue = (STANDARD_TUNING[s] + f) % 12;
        const fromRoot = (noteValue - root + 12) % 12;
        if (intervalSet.has(fromRoot)) {
          const intervalIndex = intervals.findIndex(iv => iv % 12 === fromRoot);
          boxNotes.push({
            string: s, fret: f, note: noteValue, interval: fromRoot,
            intervalLabel: INTERVAL_NAMES[intervals[intervalIndex]] || INTERVAL_NAMES[fromRoot],
            isRoot: fromRoot === 0, noteName: NOTE_NAMES[noteValue], finger: null,
          });
        }
      }
    }

    assignFingers(boxNotes);

    positions.push({
      label: `Box ${i + 1}`,
      fretStart: minFret,
      fretEnd: endFret,
      notes: boxNotes,
    });
  }

  return positions;
}
```

**Step 4: Run tests to verify they pass**

```bash
npx jest src/engine/__tests__/scales.test.ts --verbose
```

Expected: All PASS.

**Step 5: Commit**

```bash
git add src/engine/scales.ts src/engine/__tests__/scales.test.ts
git commit -m "feat(engine): add scale definitions, mode rotation, and box position system"
```

---

### Task 10: Triad computation

**Files:**
- Create: `src/engine/triads.ts`
- Test: `src/engine/__tests__/triads.test.ts`

**Step 1: Write the failing tests**

```typescript
// src/engine/__tests__/triads.test.ts
import { TRIAD_TYPES, computeTriadPositions } from '../triads';
import { STANDARD_TUNING } from '../notes';

describe('TRIAD_TYPES', () => {
  test('Major triad is [0,4,7]', () => {
    expect(TRIAD_TYPES['Major']).toEqual([0,4,7]);
  });
  test('has all four qualities', () => {
    expect(Object.keys(TRIAD_TYPES)).toEqual(['Major','Minor','Dim','Aug']);
  });
});

describe('computeTriadPositions', () => {
  test('returns notes for C major root position on strings 1-2-3', () => {
    const notes = computeTriadPositions(0, [0,4,7], [[0,1,2]], 0);
    expect(notes.length).toBeGreaterThan(0);
  });

  test('returns notes for all string groups', () => {
    const groups = [[0,1,2],[1,2,3],[2,3,4],[3,4,5]];
    const notes = computeTriadPositions(0, [0,4,7], groups, 0);
    expect(notes.length).toBeGreaterThan(0);
    // Should have notes on multiple string groups
    const strings = new Set(notes.map(n => n.string));
    expect(strings.size).toBeGreaterThanOrEqual(3);
  });

  test('all notes are members of the triad', () => {
    const groups = [[0,1,2],[1,2,3],[2,3,4],[3,4,5]];
    const triadNoteSet = new Set([0, 4, 7]); // C, E, G
    const notes = computeTriadPositions(0, [0,4,7], groups, 0);
    for (const note of notes) {
      expect(triadNoteSet.has(note.note)).toBe(true);
    }
  });

  test('root position: lowest string in group has the root note', () => {
    // For group [0,1,2]: string 2 (G) is lowest pitched
    const notes = computeTriadPositions(0, [0,4,7], [[0,1,2]], 0);
    // Group by shapes (every 3 notes is a shape)
    for (let i = 0; i < notes.length; i += 3) {
      const shape = notes.slice(i, i + 3);
      const lowestStringNote = shape.reduce((a, b) => a.string > b.string ? a : b);
      expect(lowestStringNote.isRoot).toBe(true);
    }
  });

  test('1st inversion works', () => {
    const notes = computeTriadPositions(0, [0,4,7], [[0,1,2]], 1);
    expect(notes.length).toBeGreaterThan(0);
  });

  test('2nd inversion works', () => {
    const notes = computeTriadPositions(0, [0,4,7], [[0,1,2]], 2);
    expect(notes.length).toBeGreaterThan(0);
  });

  test('shapes have playable fret span (<=4)', () => {
    const groups = [[0,1,2],[1,2,3],[2,3,4],[3,4,5]];
    for (let root = 0; root < 12; root++) {
      const notes = computeTriadPositions(root, [0,4,7], groups, 0);
      for (let i = 0; i < notes.length; i += 3) {
        const shape = notes.slice(i, i + 3);
        const frets = shape.map(n => n.fret);
        const activeFrets = frets.filter(f => f > 0);
        if (activeFrets.length > 0) {
          const span = Math.max(...frets) - Math.min(...activeFrets, Math.max(...frets));
          expect(span).toBeLessThanOrEqual(4);
        }
      }
    }
  });

  test('works for all 12 roots and all qualities', () => {
    const groups = [[0,1,2],[1,2,3],[2,3,4],[3,4,5]];
    for (const [name, intervals] of Object.entries({ 'Major': [0,4,7], 'Minor': [0,3,7], 'Dim': [0,3,6], 'Aug': [0,4,8] })) {
      for (let root = 0; root < 12; root++) {
        const notes = computeTriadPositions(root, intervals, groups, 0);
        expect(notes.length).toBeGreaterThan(0);
      }
    }
  });
});
```

**Step 2: Run tests to verify they fail**

```bash
npx jest src/engine/__tests__/triads.test.ts --verbose
```

Expected: FAIL.

**Step 3: Write minimal implementation**

```typescript
// src/engine/triads.ts
import { STANDARD_TUNING, TOTAL_FRETS, NOTE_NAMES } from './notes';
import { INTERVAL_NAMES } from './intervals';
import { FretboardNote } from './fretboard';

export const TRIAD_TYPES: Record<string, number[]> = {
  'Major': [0,4,7], 'Minor': [0,3,7], 'Dim': [0,3,6], 'Aug': [0,4,8],
};

/**
 * Compute all playable triad shapes for a given root, intervals, string groups, and inversion.
 *
 * String groups are ordered high-to-low: [0,1,2] = high E, B, G.
 * For root position, the root goes on the lowest-pitched string in the group.
 */
export function computeTriadPositions(
  root: number, intervals: number[], stringGroups: number[][], inversion: number
): FretboardNote[] {
  // orderedIntervals: voices from LOW to HIGH pitch
  let orderedIntervals = [...intervals];
  if (inversion === 1) orderedIntervals = [intervals[1], intervals[2], intervals[0] + 12];
  else if (inversion === 2) orderedIntervals = [intervals[2], intervals[0] + 12, intervals[1] + 12];

  const targetNotes = orderedIntervals.map(iv => (root + iv) % 12);
  const notes: FretboardNote[] = [];
  const shapeKeys = new Set<string>();

  for (const group of stringGroups) {
    // group[0]=highest string, group[2]=lowest string
    // targetNotes[0]=lowest voice → goes on group[2] (lowest-pitched string)
    const strings = [group[2], group[1], group[0]]; // reorder: low to high pitch

    // For each string, find ALL frets where the target note occurs
    const fretOptions: { s: number; frets: number[] }[] = [];
    for (let voice = 0; voice < 3; voice++) {
      const s = strings[voice];
      const target = targetNotes[voice];
      const frets: number[] = [];
      for (let f = 0; f <= TOTAL_FRETS; f++) {
        if ((STANDARD_TUNING[s] + f) % 12 === target) frets.push(f);
      }
      fretOptions.push({ s, frets });
    }

    // Try all combinations of fret choices across the 3 strings
    for (const f0 of fretOptions[0].frets) {
      for (const f1 of fretOptions[1].frets) {
        for (const f2 of fretOptions[2].frets) {
          const frets = [f0, f1, f2];
          const maxF = Math.max(...frets);
          const nonZeroFrets = frets.filter(f => f > 0);
          const minF = nonZeroFrets.length > 0 ? Math.min(...nonZeroFrets) : maxF;
          if (maxF - minF <= 4 || maxF <= 4) {
            const key = `${fretOptions[0].s}:${f0}-${fretOptions[1].s}:${f1}-${fretOptions[2].s}:${f2}`;
            if (!shapeKeys.has(key)) {
              shapeKeys.add(key);
              for (let v = 0; v < 3; v++) {
                const s = fretOptions[v].s;
                const f = frets[v];
                const noteVal = (STANDARD_TUNING[s] + f) % 12;
                const fromRoot = (noteVal - root + 12) % 12;
                notes.push({
                  string: s, fret: f, note: noteVal, interval: fromRoot,
                  intervalLabel: INTERVAL_NAMES[fromRoot],
                  isRoot: fromRoot === 0, noteName: NOTE_NAMES[noteVal], finger: null,
                });
              }
            }
          }
        }
      }
    }
  }
  return notes;
}
```

**Step 4: Run tests to verify they pass**

```bash
npx jest src/engine/__tests__/triads.test.ts --verbose
```

Expected: All PASS.

**Step 5: Commit**

```bash
git add src/engine/triads.ts src/engine/__tests__/triads.test.ts
git commit -m "feat(engine): add triad computation with inversions and string groups"
```

---

### Task 11: Arpeggio definitions

**Files:**
- Create: `src/engine/arpeggios.ts`
- Test: `src/engine/__tests__/arpeggios.test.ts`

**Step 1: Write the failing tests**

```typescript
// src/engine/__tests__/arpeggios.test.ts
import { ARP_TYPES } from '../arpeggios';

describe('ARP_TYPES', () => {
  test('Major arpeggio is [0,4,7]', () => {
    expect(ARP_TYPES['Major']).toEqual([0,4,7]);
  });
  test('Dom7 is [0,4,7,10]', () => {
    expect(ARP_TYPES['Dom7']).toEqual([0,4,7,10]);
  });
  test('has all expected types', () => {
    const expected = ['Major','Minor','Dom7','Maj7','Min7','Dim7','Min7b5','Aug'];
    for (const name of expected) {
      expect(ARP_TYPES[name]).toBeDefined();
    }
  });
});
```

**Step 2: Run tests to verify they fail**

```bash
npx jest src/engine/__tests__/arpeggios.test.ts --verbose
```

Expected: FAIL.

**Step 3: Write minimal implementation**

```typescript
// src/engine/arpeggios.ts

/** Arpeggio interval patterns. Arpeggios use the same getNotesOnFretboard() as chords. */
export const ARP_TYPES: Record<string, number[]> = {
  'Major': [0,4,7], 'Minor': [0,3,7], 'Dom7': [0,4,7,10],
  'Maj7': [0,4,7,11], 'Min7': [0,3,7,10], 'Dim7': [0,3,6,9],
  'Min7b5': [0,3,6,10], 'Aug': [0,4,8],
};
```

**Step 4: Run tests to verify they pass**

```bash
npx jest src/engine/__tests__/arpeggios.test.ts --verbose
```

Expected: All PASS.

**Step 5: Commit**

```bash
git add src/engine/arpeggios.ts src/engine/__tests__/arpeggios.test.ts
git commit -m "feat(engine): add arpeggio type definitions"
```

---

### Task 12: Progression computation

**Files:**
- Create: `src/engine/progressions.ts`
- Test: `src/engine/__tests__/progressions.test.ts`

**Step 1: Write the failing tests**

```typescript
// src/engine/__tests__/progressions.test.ts
import { getDiatonicChords, CIRCLE_OF_FIFTHS, DiatonicChord } from '../progressions';

describe('getDiatonicChords', () => {
  test('returns 7 chords for any key', () => {
    const chords = getDiatonicChords(0); // C
    expect(chords).toHaveLength(7);
  });

  test('C major diatonic chords have correct roman numerals', () => {
    const chords = getDiatonicChords(0);
    expect(chords.map(c => c.numeral)).toEqual(['I','ii','iii','IV','V','vi','vii°']);
  });

  test('C major diatonic chord roots are correct', () => {
    const chords = getDiatonicChords(0);
    // C=0, D=2, E=4, F=5, G=7, A=9, B=11
    expect(chords.map(c => c.root)).toEqual([0, 2, 4, 5, 7, 9, 11]);
  });

  test('qualities follow Major-Minor-Minor-Major-Major-Minor-Dim pattern', () => {
    const chords = getDiatonicChords(0);
    expect(chords.map(c => c.quality)).toEqual(['Major','Minor','Minor','Major','Major','Minor','Dim']);
  });

  test('works for all 12 keys', () => {
    for (let root = 0; root < 12; root++) {
      const chords = getDiatonicChords(root);
      expect(chords).toHaveLength(7);
      expect(chords[0].quality).toBe('Major');
      expect(chords[0].root).toBe(root);
    }
  });
});

describe('CIRCLE_OF_FIFTHS', () => {
  test('has 12 notes in circle-of-fifths order', () => {
    expect(CIRCLE_OF_FIFTHS).toEqual([0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5]);
  });
});
```

**Step 2: Run tests to verify they fail**

```bash
npx jest src/engine/__tests__/progressions.test.ts --verbose
```

Expected: FAIL.

**Step 3: Write minimal implementation**

```typescript
// src/engine/progressions.ts

export interface DiatonicChord {
  numeral: string;
  root: number;
  quality: 'Major' | 'Minor' | 'Dim';
}

const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11];
const QUALITIES: ('Major' | 'Minor' | 'Dim')[] = ['Major','Minor','Minor','Major','Major','Minor','Dim'];
const NUMERALS = ['I','ii','iii','IV','V','vi','vii°'];

export const CIRCLE_OF_FIFTHS = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5];

/** Get the 7 diatonic chords for a given key root. */
export function getDiatonicChords(keyRoot: number): DiatonicChord[] {
  return MAJOR_SCALE.map((interval, i) => ({
    numeral: NUMERALS[i],
    root: (keyRoot + interval) % 12,
    quality: QUALITIES[i],
  }));
}
```

**Step 4: Run tests to verify they pass**

```bash
npx jest src/engine/__tests__/progressions.test.ts --verbose
```

Expected: All PASS.

**Step 5: Commit**

```bash
git add src/engine/progressions.ts src/engine/__tests__/progressions.test.ts
git commit -m "feat(engine): add diatonic chord progressions and circle of fifths"
```

---

### Task 13: Engine barrel export

**Files:**
- Modify: `src/engine/index.ts`

**Step 1: Update the barrel export**

```typescript
// src/engine/index.ts
export * from './notes';
export * from './intervals';
export * from './fretboard';
export * from './fingers';
export * from './chords';
export * from './scales';
export * from './triads';
export * from './arpeggios';
export * from './progressions';
```

**Step 2: Run all engine tests**

```bash
npx jest src/engine/ --verbose
```

Expected: All tests PASS.

**Step 3: Commit**

```bash
git add src/engine/index.ts
git commit -m "feat(engine): add barrel export for all engine modules"
```

---

## Stage 3: Theme System

### Task 14: Theme colors and context provider

**Files:**
- Create: `src/theme/colors.ts`
- Create: `src/theme/ThemeContext.tsx`
- Test: `src/theme/__tests__/colors.test.ts`

**Step 1: Write the failing tests**

```typescript
// src/theme/__tests__/colors.test.ts
import { lightTheme, darkTheme, getNoteColor, ThemeColors } from '../colors';

describe('theme colors', () => {
  test('darkTheme has all required color keys', () => {
    const keys: (keyof ThemeColors)[] = [
      'bgPrimary','bgSecondary','bgTertiary','bgElevated',
      'textPrimary','textSecondary','textMuted',
      'accent','accentDim','accentGlow',
      'fretWire','stringColor','dotText',
      'border','rootColor',
      'fretboardBg','fretboardGradientEnd','inlayColor','nutColor',
    ];
    for (const key of keys) {
      expect(darkTheme[key]).toBeDefined();
    }
  });

  test('lightTheme has all required color keys', () => {
    expect(lightTheme.bgPrimary).toBeDefined();
    expect(lightTheme.textPrimary).toBeDefined();
  });

  test('getNoteColor returns root color for root notes', () => {
    const color = getNoteColor(0, true); // interval=0, isRoot=true
    expect(color).toBe('#e8734a');
  });

  test('getNoteColor returns blue for thirds', () => {
    expect(getNoteColor(3, false)).toBe('#5ba3d9'); // minor third
    expect(getNoteColor(4, false)).toBe('#5ba3d9'); // major third
  });

  test('getNoteColor returns green for fifths', () => {
    expect(getNoteColor(7, false)).toBe('#6bc77a');
  });

  test('getNoteColor returns purple for sevenths', () => {
    expect(getNoteColor(10, false)).toBe('#c76bb8');
    expect(getNoteColor(11, false)).toBe('#c76bb8');
  });
});
```

**Step 2: Run tests to verify they fail**

```bash
npx jest src/theme/__tests__/colors.test.ts --verbose
```

Expected: FAIL.

**Step 3: Write implementation — colors.ts**

```typescript
// src/theme/colors.ts
export interface ThemeColors {
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  bgElevated: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentDim: string;
  accentGlow: string;
  fretWire: string;
  stringColor: string;
  dotText: string;
  border: string;
  rootColor: string;
  fretboardBg: string;
  fretboardGradientEnd: string;
  inlayColor: string;
  nutColor: string;
}

export const darkTheme: ThemeColors = {
  bgPrimary: '#0e0e10',
  bgSecondary: '#18181b',
  bgTertiary: '#232328',
  bgElevated: '#2a2a30',
  textPrimary: '#f0ece4',
  textSecondary: '#9a968e',
  textMuted: '#5c5a55',
  accent: '#d4a04a',
  accentDim: '#d4a04a33',
  accentGlow: '#d4a04a18',
  fretWire: '#8a8580',
  stringColor: '#c4beb4',
  dotText: '#0e0e10',
  border: '#2e2e33',
  rootColor: '#e8734a',
  fretboardBg: '#2c1f0e',
  fretboardGradientEnd: '#1e150a',
  inlayColor: '#4a3d28',
  nutColor: '#e8e0d0',
};

export const lightTheme: ThemeColors = {
  bgPrimary: '#f5f2eb',
  bgSecondary: '#ece8df',
  bgTertiary: '#e0dbd2',
  bgElevated: '#d6d1c8',
  textPrimary: '#1a1916',
  textSecondary: '#5a574f',
  textMuted: '#8a867e',
  accent: '#d4a04a',
  accentDim: '#d4a04a33',
  accentGlow: '#d4a04a18',
  fretWire: '#8a8580',
  stringColor: '#7a7060',
  dotText: '#f5f2eb',
  border: '#ccc8be',
  rootColor: '#e8734a',
  fretboardBg: '#c4a46a',
  fretboardGradientEnd: '#a88c52',
  inlayColor: '#b89a5e',
  nutColor: '#8a7a5e',
};

/** Get the dot color for a note based on its interval from root. */
export function getNoteColor(interval: number, isRoot: boolean): string {
  if (isRoot) return '#e8734a';
  if (interval === 3 || interval === 4) return '#5ba3d9';
  if (interval === 7) return '#6bc77a';
  if (interval === 10 || interval === 11) return '#c76bb8';
  return '#d4a04a';
}
```

**Step 4: Write implementation — ThemeContext.tsx**

```typescript
// src/theme/ThemeContext.tsx
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme, ThemeColors } from './colors';

interface ThemeContextType {
  theme: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: darkTheme,
  isDark: true,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [override, setOverride] = useState<boolean | null>(null);

  const isDark = override !== null ? override : systemScheme !== 'light';

  const toggleTheme = useCallback(() => {
    setOverride(prev => prev === null ? !isDark : !prev);
  }, [isDark]);

  const value = useMemo(() => ({
    theme: isDark ? darkTheme : lightTheme,
    isDark,
    toggleTheme,
  }), [isDark, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
```

**Step 5: Run tests to verify they pass**

```bash
npx jest src/theme/__tests__/colors.test.ts --verbose
```

Expected: All PASS.

**Step 6: Commit**

```bash
git add src/theme/
git commit -m "feat(theme): add light/dark theme colors and context provider"
```

---

## Stage 4: Shared UI Components

### Task 15: GuitarNeck SVG component

**Files:**
- Create: `src/components/GuitarNeck.tsx`
- Test: `src/components/__tests__/GuitarNeck.test.tsx`

This is the most complex component. It renders a full horizontal fretboard with SVG using react-native-svg. All 5 tabs use this component.

**Reference:** See `renderFretboard()` in `mockups/guitar-tutor-prototype.html:788-914` for the exact rendering logic including:
- Fretboard background gradient
- Nut, fret wires, strings, inlays
- Note dots with interval-based coloring
- Active vs faded (0.2 opacity) note distinction
- Box highlight overlays for scale positions
- Click handler for voicing switching
- Display mode (finger/interval/note) label rendering

**Step 1: Write the failing test**

```typescript
// src/components/__tests__/GuitarNeck.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { GuitarNeck } from '../GuitarNeck';
import { FretboardNote } from '../../engine/fretboard';

const mockNote: FretboardNote = {
  string: 0, fret: 3, note: 7, interval: 0,
  intervalLabel: 'R', isRoot: true, noteName: 'G', finger: 1,
};

describe('GuitarNeck', () => {
  test('renders without crashing', () => {
    const { toJSON } = render(
      <GuitarNeck notes={[mockNote]} displayMode="interval" />
    );
    expect(toJSON()).toBeTruthy();
  });

  test('renders with empty notes array', () => {
    const { toJSON } = render(
      <GuitarNeck notes={[]} displayMode="interval" />
    );
    expect(toJSON()).toBeTruthy();
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npx jest src/components/__tests__/GuitarNeck.test.tsx --verbose
```

Expected: FAIL.

**Step 3: Write implementation**

Create `src/components/GuitarNeck.tsx`. This is a large component — implement the full SVG rendering logic from the prototype's `renderFretboard()` function (`mockups/guitar-tutor-prototype.html:788-914`), translating HTML SVG strings to react-native-svg components (`Svg`, `Rect`, `Line`, `Circle`, `Text`, `G`, `Defs`, `LinearGradient`, `Stop`).

Key props interface:
```typescript
interface GuitarNeckProps {
  notes: FretboardNote[];
  displayMode: 'finger' | 'interval' | 'note';
  activeVoicing?: Set<string>;
  hasVoicings?: boolean;
  activeNoteSet?: Set<string> | null;
  boxHighlights?: { fretStart: number; fretEnd: number }[];
  onNotePress?: (string: number, fret: number, isRoot: boolean) => void;
}
```

Translate the rendering constants from the prototype:
```typescript
const FB = {
  padLeft: 40, padRight: 20, padTop: 30, padBottom: 30,
  fretWidth: 60, stringSpacing: 28, dotRadius: 11,
};
```

**Step 4: Run test to verify it passes**

```bash
npx jest src/components/__tests__/GuitarNeck.test.tsx --verbose
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/GuitarNeck.tsx src/components/__tests__/GuitarNeck.test.tsx
git commit -m "feat(components): add GuitarNeck SVG fretboard component"
```

---

### Task 16: NotePicker component

**Files:**
- Create: `src/components/NotePicker.tsx`
- Test: `src/components/__tests__/NotePicker.test.tsx`

**Reference:** `buildNotePicker()` in `mockups/guitar-tutor-prototype.html:1000-1010`

Renders 12 chromatic note buttons. Active note is highlighted.

**Step 1: Write the failing test**

```typescript
// src/components/__tests__/NotePicker.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NotePicker } from '../NotePicker';

describe('NotePicker', () => {
  test('renders 12 note buttons', () => {
    const { getAllByRole } = render(
      <NotePicker activeNote={0} onSelect={jest.fn()} />
    );
    // Should render all 12 chromatic notes
    const buttons = getAllByRole('button');
    expect(buttons).toHaveLength(12);
  });

  test('calls onSelect with note index when tapped', () => {
    const onSelect = jest.fn();
    const { getByText } = render(
      <NotePicker activeNote={0} onSelect={onSelect} />
    );
    fireEvent.press(getByText('E'));
    expect(onSelect).toHaveBeenCalledWith(4); // E=4
  });
});
```

**Step 2: Run test, then implement, then verify. Commit.**

Implementation: A row of 12 `TouchableOpacity` buttons, one per `NOTE_NAMES` entry. Active button gets accent background. Calls `onSelect(noteIndex)` on press.

```bash
git add src/components/NotePicker.tsx src/components/__tests__/NotePicker.test.tsx
git commit -m "feat(components): add NotePicker chromatic note selector"
```

---

### Task 17: TypePicker component

**Files:**
- Create: `src/components/TypePicker.tsx`
- Test: `src/components/__tests__/TypePicker.test.tsx`

**Reference:** `buildTypePicker()` in `mockups/guitar-tutor-prototype.html:1012-1023`

Renders a horizontally scrollable row of pill buttons. Accepts either an array of strings or an object (uses Object.keys).

**Step 1: Write test, implement, verify, commit.**

```bash
git add src/components/TypePicker.tsx src/components/__tests__/TypePicker.test.tsx
git commit -m "feat(components): add TypePicker type/family selector"
```

---

### Task 18: DisplayToggle component

**Files:**
- Create: `src/components/DisplayToggle.tsx`
- Test: `src/components/__tests__/DisplayToggle.test.tsx`

**Reference:** `buildDisplayToggle()` in `mockups/guitar-tutor-prototype.html:1025-1035`

Renders a segmented control with configurable modes. Default: `['Finger', 'Interval', 'Note']`. Some tabs pass custom subset like `['Interval', 'Note']`.

**Step 1: Write test, implement, verify, commit.**

```bash
git add src/components/DisplayToggle.tsx src/components/__tests__/DisplayToggle.test.tsx
git commit -m "feat(components): add DisplayToggle segmented control"
```

---

### Task 19: ChordPreview (mini chord diagram) component

**Files:**
- Create: `src/components/ChordPreview.tsx`
- Test: `src/components/__tests__/ChordPreview.test.tsx`

**Reference:** `renderMiniChordSVG()` in `mockups/guitar-tutor-prototype.html:918-987`

Renders a small chord diagram with:
- Fret offset logic (shows "Xfr" label when not in open position)
- Finger number display via `assignFingers()`
- Muted string (x) indicators
- Root note highlighted in orange

**Step 1: Write test, implement, verify, commit.**

```bash
git add src/components/ChordPreview.tsx src/components/__tests__/ChordPreview.test.tsx
git commit -m "feat(components): add ChordPreview mini chord diagram"
```

---

### Task 20: StringGroupPicker and ScalePositionPicker components

**Files:**
- Create: `src/components/StringGroupPicker.tsx`
- Create: `src/components/ScalePositionPicker.tsx`

**Reference:**
- `buildStringGroupPicker()` in `mockups/guitar-tutor-prototype.html:1059-1075`
- `buildScalePositionPicker()` in `mockups/guitar-tutor-prototype.html:1037-1057`

StringGroupPicker: buttons for All, 1-2-3, 2-3-4, 3-4-5, 4-5-6 (single select).
ScalePositionPicker: buttons for All + 5 box positions with fret ranges (multi-select).

**Step 1: Write tests, implement, verify, commit.**

```bash
git add src/components/StringGroupPicker.tsx src/components/ScalePositionPicker.tsx
git commit -m "feat(components): add StringGroupPicker and ScalePositionPicker"
```

---

### Task 21: Components barrel export

**Files:**
- Create: `src/components/index.ts`

```typescript
export { GuitarNeck } from './GuitarNeck';
export { NotePicker } from './NotePicker';
export { TypePicker } from './TypePicker';
export { DisplayToggle } from './DisplayToggle';
export { ChordPreview } from './ChordPreview';
export { StringGroupPicker } from './StringGroupPicker';
export { ScalePositionPicker } from './ScalePositionPicker';
```

**Commit:**

```bash
git add src/components/index.ts
git commit -m "feat(components): add barrel export"
```

---

## Stage 5: Screen Implementations

Each screen composes engine functions with shared components. Implement one tab at a time.

### Task 22: ChordsScreen

**Files:**
- Create: `src/screens/ChordsScreen.tsx`
- Test: `src/screens/__tests__/ChordsScreen.test.tsx`

**Reference:** `renderChordsTab()` in `mockups/guitar-tutor-prototype.html:1080-1123`

**Behavior:**
- State: `root`, `type`, `display`, `activeVoicingIndex`
- NotePicker selects root (resets voicing index to 0)
- TypePicker selects chord family from CHORD_TYPES
- DisplayToggle with all 3 modes: Finger, Interval, Note
- Computes `getNotesOnFretboard(root, intervals)` for all notes
- Computes `getChordVoicings(root, type)` and `buildVoicingRegions()`
- Active voicing region determines which notes are at full opacity
- When `display === 'finger'`: runs `assignFingers()` on active voicing notes and copies finger values to allNotes
- `onNotePress`: if tapped note isRoot, find matching voicing region and set `activeVoicingIndex`

**Step 1: Write the failing test**

```typescript
// src/screens/__tests__/ChordsScreen.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { ChordsScreen } from '../ChordsScreen';

describe('ChordsScreen', () => {
  test('renders without crashing', () => {
    const { toJSON } = render(<ChordsScreen />);
    expect(toJSON()).toBeTruthy();
  });
});
```

**Step 2: Run test, implement, verify, commit.**

```bash
git add src/screens/ChordsScreen.tsx src/screens/__tests__/ChordsScreen.test.tsx
git commit -m "feat(screens): add ChordsScreen with voicing system"
```

---

### Task 23: ScalesScreen

**Files:**
- Create: `src/screens/ScalesScreen.tsx`
- Test: `src/screens/__tests__/ScalesScreen.test.tsx`

**Reference:** `renderScalesTab()` in `mockups/guitar-tutor-prototype.html:1126-1200`

**Behavior:**
- State: `root`, `type`, `mode`, `display`, `activePositions` (Set)
- NotePicker, TypePicker (SCALE_TYPES), mode picker (show only for 7-note scales)
- DisplayToggle with ONLY `['Interval', 'Note']` — no Finger mode
- ScalePositionPicker: multi-select boxes or "All"
- Computes `applyModeRotation()` then `computeScalePositions()`
- When "All" selected: all notes at full opacity, no box highlights
- When specific boxes selected: builds `activeNoteSet` and `boxHighlights` arrays
- Passes both to GuitarNeck

**Step 1: Write test, implement, verify, commit.**

```bash
git add src/screens/ScalesScreen.tsx src/screens/__tests__/ScalesScreen.test.tsx
git commit -m "feat(screens): add ScalesScreen with box position system"
```

---

### Task 24: ProgressionsScreen

**Files:**
- Create: `src/screens/ProgressionsScreen.tsx`
- Test: `src/screens/__tests__/ProgressionsScreen.test.tsx`

**Reference:** `renderProgressionsTab()` in `mockups/guitar-tutor-prototype.html:1203-1258` and `renderCircleOfFifths()` at line 1260.

**Behavior:**
- State: `root`, `activeChords` (Set of indices 0-6)
- NotePicker selects key root
- Renders 7 roman numeral cards (I, ii, iii, IV, V, vi, vii°) via `getDiatonicChords()`
- Cards are multi-selectable (toggle on/off)
- Active cards show mini chord previews via `ChordPreview` component
- For Major quality: `generateBarreVoicings()[0]`
- For Minor quality: `generateMinorBarreVoicings()[0]`
- For Dim quality: A-shape dim voicing (see prototype line 1246-1249)
- Circle of fifths SVG below previews
- No GuitarNeck on this tab — uses ChordPreview cards instead

**Step 1: Write test, implement, verify, commit.**

```bash
git add src/screens/ProgressionsScreen.tsx src/screens/__tests__/ProgressionsScreen.test.tsx
git commit -m "feat(screens): add ProgressionsScreen with multi-select and mini chords"
```

---

### Task 25: TriadsScreen

**Files:**
- Create: `src/screens/TriadsScreen.tsx`
- Test: `src/screens/__tests__/TriadsScreen.test.tsx`

**Reference:** `renderTriadsTab()` in `mockups/guitar-tutor-prototype.html:1281-1299`

**Behavior:**
- State: `root`, `type`, `stringGroup`, `inversion`, `display`
- NotePicker, TypePicker (TRIAD_TYPES), StringGroupPicker, inversion picker (Root/1st Inv/2nd Inv)
- DisplayToggle with all 3 modes: Finger, Interval, Note
- Computes string groups from picker value: `'all'` → `[[0,1,2],[1,2,3],[2,3,4],[3,4,5]]`, or single group
- Calls `computeTriadPositions(root, intervals, groups, inversion)`
- When `display === 'finger'`: runs `assignFingers(notes)`
- Passes notes to GuitarNeck

**Step 1: Write test, implement, verify, commit.**

```bash
git add src/screens/TriadsScreen.tsx src/screens/__tests__/TriadsScreen.test.tsx
git commit -m "feat(screens): add TriadsScreen with string groups and inversions"
```

---

### Task 26: ArpeggiosScreen

**Files:**
- Create: `src/screens/ArpeggiosScreen.tsx`
- Test: `src/screens/__tests__/ArpeggiosScreen.test.tsx`

**Reference:** `renderArpeggiosTab()` in `mockups/guitar-tutor-prototype.html:1302-1311`

**Behavior:**
- State: `root`, `type`, `display`
- NotePicker, TypePicker (ARP_TYPES)
- DisplayToggle with ONLY `['Interval', 'Note']` — no Finger mode
- Calls `getNotesOnFretboard(root, intervals)`
- Passes notes to GuitarNeck

**Step 1: Write test, implement, verify, commit.**

```bash
git add src/screens/ArpeggiosScreen.tsx src/screens/__tests__/ArpeggiosScreen.test.tsx
git commit -m "feat(screens): add ArpeggiosScreen"
```

---

## Stage 6: Navigation and App Entry Point

### Task 27: Bottom tab navigator setup

**Files:**
- Modify: `App.tsx`

**Reference:** Tab bar HTML in `mockups/guitar-tutor-prototype.html:449-465`

**Behavior:**
- Bottom tab navigator with 5 tabs: Chords, Scales, Progressions, Triads, Arpeggios
- Tab bar styled to match prototype (dark background, accent color for active)
- Header with "GUITAR TUTOR" title and theme toggle button
- Wrap in `ThemeProvider`

**Step 1: Write implementation**

```typescript
// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { ChordsScreen } from './src/screens/ChordsScreen';
import { ScalesScreen } from './src/screens/ScalesScreen';
import { ProgressionsScreen } from './src/screens/ProgressionsScreen';
import { TriadsScreen } from './src/screens/TriadsScreen';
import { ArpeggiosScreen } from './src/screens/ArpeggiosScreen';

const Tab = createBottomTabNavigator();

function AppContent() {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: theme.bgSecondary,
            borderTopColor: theme.border,
          },
          tabBarActiveTintColor: theme.accent,
          tabBarInactiveTintColor: theme.textMuted,
          headerStyle: {
            backgroundColor: theme.bgSecondary,
            borderBottomColor: theme.border,
          },
          headerTintColor: theme.accent,
          headerTitleStyle: {
            fontWeight: '600',
            letterSpacing: 2,
            textTransform: 'uppercase',
            fontSize: 15,
          },
          headerRight: () => (
            // Theme toggle button — implement as TouchableOpacity
            null // placeholder
          ),
        }}
      >
        <Tab.Screen name="Chords" component={ChordsScreen} />
        <Tab.Screen name="Scales" component={ScalesScreen} />
        <Tab.Screen name="Progressions" component={ProgressionsScreen} />
        <Tab.Screen name="Triads" component={TriadsScreen} />
        <Tab.Screen name="Arpeggios" component={ArpeggiosScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
```

**Step 2: Run the app**

```bash
npx expo start --web
```

Expected: App loads with 5 tabs, each tab renders its content.

**Step 3: Commit**

```bash
git add App.tsx
git commit -m "feat: wire up bottom tab navigator with all 5 screens"
```

---

## Stage 7: Integration Testing and Polish

### Task 28: Run full test suite

**Step 1: Run all tests**

```bash
npx jest --verbose --coverage
```

Expected: All tests pass. Review coverage report for any gaps in engine modules (target >90% on engine).

**Step 2: Fix any failing tests**

**Step 3: Commit**

```bash
git commit -m "test: ensure full test suite passes with coverage"
```

---

### Task 29: Cross-platform smoke test

**Step 1: Test web**

```bash
npx expo start --web
```

Manually verify each tab works: select different roots, types, display modes.

**Step 2: Test iOS (if on Mac)**

```bash
npx expo start --ios
```

**Step 3: Test Android**

```bash
npx expo start --android
```

**Step 4: Document any platform-specific issues found**

**Step 5: Commit any fixes**

```bash
git commit -m "fix: resolve cross-platform rendering issues"
```

---

### Task 30: Final cleanup and README

**Step 1: Verify project structure matches design doc**

```
src/
  engine/
    notes.ts, intervals.ts, fretboard.ts, fingers.ts,
    chords.ts, scales.ts, triads.ts, arpeggios.ts, progressions.ts,
    index.ts
  components/
    GuitarNeck.tsx, NotePicker.tsx, TypePicker.tsx, DisplayToggle.tsx,
    ChordPreview.tsx, StringGroupPicker.tsx, ScalePositionPicker.tsx,
    index.ts
  screens/
    ChordsScreen.tsx, ScalesScreen.tsx, ProgressionsScreen.tsx,
    TriadsScreen.tsx, ArpeggiosScreen.tsx
  theme/
    colors.ts, ThemeContext.tsx
App.tsx
```

**Step 2: Run final test suite**

```bash
npx jest --verbose
```

**Step 3: Commit**

```bash
git commit -m "chore: final cleanup and structure verification"
```

---

## Appendix: Key Data Reference

These constants are defined in the prototype and must be replicated exactly in the engine modules.

### Note-to-Integer Mapping
```
C=0, C#=1, D=2, D#=3, E=4, F=5, F#=6, G=7, G#=8, A=9, A#=10, B=11
```

### Standard Tuning (high to low string index)
```
[4, 11, 7, 2, 9, 4]  →  E4, B3, G3, D3, A2, E2
```

### Interval Names
```
0:R, 1:b2, 2:2, 3:b3, 4:3, 5:4, 6:b5, 7:5, 8:#5, 9:6, 10:b7, 11:7, 12:R, 13:b9, 14:9
```

### Note Colors (used in GuitarNeck dot rendering)
```
Root (interval 0):           #e8734a (orange)
3rd (interval 3 or 4):       #5ba3d9 (blue)
5th (interval 7):            #6bc77a (green)
7th (interval 10 or 11):     #c76bb8 (purple)
Other:                       #d4a04a (gold/accent)
```

### Display Mode Availability by Tab
```
Chords:       Finger, Interval, Note
Scales:       Interval, Note (NO Finger)
Progressions: (no toggle — uses ChordPreview with finger numbers)
Triads:       Finger, Interval, Note
Arpeggios:    Interval, Note (NO Finger)
```
