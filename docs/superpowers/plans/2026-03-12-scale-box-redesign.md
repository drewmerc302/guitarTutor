# Scale Box Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hardcoded CAGED-offset scale box algorithm with a computed approach that derives box positions from actual scale notes on the low E string, fixing wrong box counts for 7-note scales, incorrect wrapping, and missing stretch notes.

**Architecture:** `findAnchors()` (internal helper in `scales.ts`) walks the low E string and selects N consecutive anchor frets around the root; `computeScalePositions()` uses dynamic windows `[anchor−1, A_next+1]` per anchor to collect notes across all 6 strings, then labels and sorts boxes. `ScalesScreen` is updated to drive chips and note filtering directly from box labels, eliminating all `parseInt` index arithmetic.

**Tech Stack:** TypeScript, React Native, Jest. Run tests with `npx jest --testPathPattern="scales.test" --watch` during development.

---

## File Map

| File | Change |
|------|--------|
| `src/engine/scales.ts` | Delete `CAGED_OFFSETS`, `NUM_BOXES`. Add `findAnchors()`. Rewrite `computeScalePositions()`. |
| `src/engine/__tests__/scales.test.ts` | Delete 4 old tests. Update 1 test. Add Layer 1/2/3 test blocks. |
| `src/screens/ScalesScreen.tsx` | Add `useEffect` import, type-reset effect, rewrite 3 position chip helpers, remove 3 `parseInt` usages. |

---

## Chunk 1: Engine — tests first, then implementation

---

### Task 1: Delete retired tests and add failing property-based tests

**Context:** The current `scales.test.ts` has 4 tests that assert the old (wrong) behaviour. Delete them first so they don't mask failures. Then add the new Layer 1 property-based tests, which will fail until Task 3 rewrites the implementation.

**Files:**
- Modify: `src/engine/__tests__/scales.test.ts`

- [ ] **Step 1: Delete 4 retired tests**

Remove these complete `test(...)` blocks from `src/engine/__tests__/scales.test.ts`:

```
test('each box spans exactly 3 frets (fretEnd - fretStart === 3)', ...)
test('A minor pentatonic produces 5 boxes (single copy each)', ...)
test('Box 1 always starts at the root note on low E string', ...)
test('Box 1 starts at the root note on low E string for all 12 roots (major scale)', ...)
```

Also update the `'returns positions for C major...'` test (currently lines 41–52) to match the new behaviour — it currently asserts `positions[0].fretStart === 8` and `length >= 5`, both of which will be wrong after the redesign:

```typescript
test('returns 7 positions for C major', () => {
  const positions = computeScalePositions(0, [0,2,4,5,7,9,11]);
  expect(positions.length).toBe(7);
  for (const pos of positions) {
    expect(pos.fretStart).toBeLessThanOrEqual(TOTAL_FRETS);
  }
  const box1 = positions.find(p => p.label === 'Box 1')!;
  expect(box1.fretStart).toBe(7);
});
```

- [ ] **Step 2: Confirm 4 tests were deleted and 1 updated**

Run: `npx jest --testPathPattern="scales.test" --passWithNoTests`

Expected: the deleted tests are gone; `'returns 7 positions for C major'` is listed. The updated test will FAIL at this point — that is expected.

- [ ] **Step 3: Add Layer 1 property-based test block**

Add this new `describe` block at the end of the `describe('computeScalePositions', ...)` block in `src/engine/__tests__/scales.test.ts`:

```typescript
describe('property-based: all 12 roots × all scale types', () => {
  const ALL_ROOTS = Array.from({ length: 12 }, (_, i) => i);
  const ALL_ENTRIES = Object.entries(SCALE_TYPES) as [string, number[]][];

  test('returns exactly N positions for all combinations', () => {
    for (const [, intervals] of ALL_ENTRIES) {
      for (const root of ALL_ROOTS) {
        const positions = computeScalePositions(root, intervals);
        expect(positions.length).toBe(intervals.length);
      }
    }
  });

  test('Box 1 exists and contains root on low E (string 5) for all combinations', () => {
    for (const [, intervals] of ALL_ENTRIES) {
      for (const root of ALL_ROOTS) {
        const positions = computeScalePositions(root, intervals);
        const box1 = positions.find(p => p.label === 'Box 1');
        expect(box1).toBeDefined();
        const rootNote = box1!.notes.find(n => n.isRoot && n.string === 5);
        expect(rootNote).toBeDefined();
      }
    }
  });

  test('positions sorted by fretStart ascending for all combinations', () => {
    for (const [, intervals] of ALL_ENTRIES) {
      for (const root of ALL_ROOTS) {
        const positions = computeScalePositions(root, intervals);
        for (let i = 1; i < positions.length; i++) {
          expect(positions[i].fretStart).toBeGreaterThanOrEqual(positions[i - 1].fretStart);
        }
      }
    }
  });

  test('scale tones only for all combinations', () => {
    for (const [, intervals] of ALL_ENTRIES) {
      const intervalSet = new Set(intervals);
      for (const root of ALL_ROOTS) {
        const positions = computeScalePositions(root, intervals);
        for (const pos of positions) {
          for (const note of pos.notes) {
            expect(intervalSet.has(note.interval)).toBe(true);
          }
        }
      }
    }
  });

  test('fretEnd > fretStart for every position', () => {
    for (const [, intervals] of ALL_ENTRIES) {
      for (const root of ALL_ROOTS) {
        const positions = computeScalePositions(root, intervals);
        for (const pos of positions) {
          expect(pos.fretEnd).toBeGreaterThan(pos.fretStart);
        }
      }
    }
  });

  test('all note frets in [0, TOTAL_FRETS] for all combinations', () => {
    for (const [, intervals] of ALL_ENTRIES) {
      for (const root of ALL_ROOTS) {
        const positions = computeScalePositions(root, intervals);
        for (const pos of positions) {
          for (const note of pos.notes) {
            expect(note.fret).toBeGreaterThanOrEqual(0);
            expect(note.fret).toBeLessThanOrEqual(TOTAL_FRETS);
          }
        }
      }
    }
  });

  test('every note has a non-null finger for all combinations', () => {
    for (const [, intervals] of ALL_ENTRIES) {
      for (const root of ALL_ROOTS) {
        const positions = computeScalePositions(root, intervals);
        for (const pos of positions) {
          for (const note of pos.notes) {
            expect(note.finger).not.toBeNull();
          }
        }
      }
    }
  });

  test('all labels match /^Box \\d+$/ for all combinations', () => {
    for (const [, intervals] of ALL_ENTRIES) {
      for (const root of ALL_ROOTS) {
        const positions = computeScalePositions(root, intervals);
        for (const pos of positions) {
          expect(pos.label).toMatch(/^Box \d+$/);
        }
      }
    }
  });
});
```

- [ ] **Step 4: Run tests — new property tests must FAIL**

Run: `npx jest --testPathPattern="scales.test"`

Expected: the 8 new `property-based` tests fail (old algorithm returns 5 boxes for all scales, wrong count for 7-note scales, wrong sort order, etc.). The pre-existing passing tests still pass.

---

### Task 2: Add failing Layer 2 golden set tests and Layer 3 regression tests

**Context:** These tests pin specific expected values verified against standard guitar references. They will fail until Task 3 rewrites the algorithm.

**Files:**
- Modify: `src/engine/__tests__/scales.test.ts`

- [ ] **Step 1: Add Layer 2 golden set describe block**

Add after the property-based block:

```typescript
describe('golden set', () => {
  describe('Am pentatonic (root 9, intervals [0,3,5,7,10])', () => {
    // Am pentatonic low-E anchors: [3(G), 5(A=root), 8(C), 10(D), 12(E)]
    // Box 5 below root at 3, Box 1 at 5, Box 2 at 8, Box 3 at 10, Box 4 at 12
    let positions: ScalePosition[];
    beforeEach(() => { positions = computeScalePositions(9, [0, 3, 5, 7, 10]); });

    test('returns exactly 5 positions', () => {
      expect(positions.length).toBe(5);
    });

    test('Box 1 fretStart === 5', () => {
      const box = positions.find(p => p.label === 'Box 1')!;
      expect(box.fretStart).toBe(5);
    });

    test('Box 2 fretStart === 7 (G-string D at fret 7 is in the window)', () => {
      // anchor=8, windowStart=7; G string fret 7 = D (interval 5) is a scale tone
      const box = positions.find(p => p.label === 'Box 2')!;
      expect(box.fretStart).toBe(7);
    });

    test('Box 3 fretEnd >= 13 (B-string C at fret 13 is in the window)', () => {
      // anchor=10, A_next=12, windowEnd=13; B string fret 13 = C (interval 3) is a scale tone
      const box = positions.find(p => p.label === 'Box 3')!;
      expect(box.fretEnd).toBeGreaterThanOrEqual(13);
    });

    test('Box 4 fretStart === 12', () => {
      const box = positions.find(p => p.label === 'Box 4')!;
      expect(box.fretStart).toBe(12);
    });

    test('Box 5 fretStart <= 4 and includes at least one open string note', () => {
      // anchor=3, open string rule fires; open E/G/D/A strings are in Am pentatonic
      const box = positions.find(p => p.label === 'Box 5')!;
      expect(box.fretStart).toBeLessThanOrEqual(4);
      const openNote = box.notes.find(n => n.fret === 0);
      expect(openNote).toBeDefined();
    });
  });

  describe('C major (root 0, intervals [0,2,4,5,7,9,11])', () => {
    // C major low-E anchors (7-note): [7(B), 8(C=root), 10(D), 12(E), 13(F), 15(G), 17(A)]
    // Box 7 below root at 7, Box 1 at 8, Boxes 2-6 at 10,12,13,15,17
    let positions: ScalePosition[];
    beforeEach(() => { positions = computeScalePositions(0, [0, 2, 4, 5, 7, 9, 11]); });

    test('returns exactly 7 positions', () => {
      expect(positions.length).toBe(7);
    });

    test('Box 1 fretStart === 7 (anchor=8, windowStart=7; low E fret 7 = B is a scale tone)', () => {
      const box = positions.find(p => p.label === 'Box 1')!;
      expect(box.fretStart).toBe(7);
    });
  });
});
```

- [ ] **Step 2: Add Layer 3 regression describe block**

Add after the golden set block:

```typescript
describe('regression', () => {
  test('Am pentatonic: no Box 5 with fretStart >= 14 (old wrap bug gone)', () => {
    const positions = computeScalePositions(9, [0, 3, 5, 7, 10]);
    const box5 = positions.find(p => p.label === 'Box 5');
    expect(box5).toBeDefined();
    expect(box5!.fretStart).toBeLessThan(14);
  });

  test('no 7-note scale returns exactly 5 boxes for any root', () => {
    const sevenNoteScales = Object.entries(SCALE_TYPES).filter(([, iv]) => iv.length === 7);
    for (const [, intervals] of sevenNoteScales) {
      for (let root = 0; root < 12; root++) {
        const positions = computeScalePositions(root, intervals);
        expect(positions.length).toBe(7);
      }
    }
  });
});
```

- [ ] **Step 3: Run tests — golden/regression tests must FAIL**

Run: `npx jest --testPathPattern="scales.test"`

Expected: the new golden set and regression tests fail. Pre-existing passing tests still pass.

---

### Task 3: Rewrite `computeScalePositions` in `scales.ts`

**Context:** Delete `CAGED_OFFSETS` and the old loop. Add `findAnchors()` (internal helper). Rewrite `computeScalePositions()` using computed anchors and dynamic windows.

**Important:** The spec says open-string threshold is `anchor <= 5`, but that incorrectly includes Box 1 of Am pentatonic (anchor=5), giving fretStart=0 instead of the expected 5. Use `anchor < 5` (strictly less than) to match the golden tests — this correctly captures only the below-root open-position box.

**Files:**
- Modify: `src/engine/scales.ts`

- [ ] **Step 1: Replace `scales.ts` content from line 37 onwards**

Replace everything from `// Fixed CAGED offsets...` through the end of the file with:

```typescript
/** Internal helper: walk low E string, return N selected anchor frets.
 * Returns anchors sorted ascending, starting from max(0, idx_root - 1)
 * so at most 1 anchor below the root is included. */
function findAnchors(root: number, intervals: number[]): number[] {
  const intervalSet = new Set(intervals.map(iv => iv % 12));
  const N = intervals.length;

  // Collect all scale-tone frets on low E string
  const allAnchors: number[] = [];
  for (let f = 0; f <= TOTAL_FRETS; f++) {
    const fromRoot = ((STANDARD_TUNING[5] + f) % 12 - root + 12) % 12;
    if (intervalSet.has(fromRoot)) allAnchors.push(f);
  }

  // Find first occurrence of root pitch on low E
  const idxRoot = allAnchors.findIndex(f => (STANDARD_TUNING[5] + f) % 12 === root % 12);

  // Select N consecutive anchors starting at most 1 below the root
  const start = Math.max(0, idxRoot - 1);
  return allAnchors.slice(start, start + N);
}

/** Compute box positions for a scale across the neck.
 * Uses computed anchors from the low E string rather than hardcoded offsets.
 * Returns N boxes (N = intervals.length) sorted by fretStart ascending.
 * Box 1 = root position on low E; below-root position (if any) = Box N. */
export function computeScalePositions(root: number, intervals: number[]): ScalePosition[] {
  const intervalSet = new Set(intervals.map(iv => iv % 12));
  const selected = findAnchors(root, intervals);
  const N = selected.length;

  // Find root anchor's index within the selected set
  const rootIdx = selected.findIndex(f => (STANDARD_TUNING[5] + f) % 12 === root % 12);

  const positions: ScalePosition[] = [];

  for (let i = 0; i < N; i++) {
    const anchor = selected[i];
    // A_next: next anchor above this one; for the highest anchor, wrap to selected[0] + 12
    const nextAnchor = i < N - 1 ? selected[i + 1] : selected[0] + 12;

    const windowStart = Math.max(0, anchor - 1);
    const windowEnd = Math.min(TOTAL_FRETS, nextAnchor + 1);

    // Box label: root → Box 1; anchors above → Box 2..N; below-root → Box N
    let boxNumber: number;
    if (i === rootIdx) {
      boxNumber = 1;
    } else if (i > rootIdx) {
      boxNumber = i - rootIdx + 1;
    } else {
      boxNumber = N; // below-root anchor
    }

    // Collect notes within dynamic window
    const boxNotes: FretboardNote[] = [];
    for (let s = 0; s < 6; s++) {
      for (let f = windowStart; f <= windowEnd; f++) {
        const pitch = (STANDARD_TUNING[s] + f) % 12;
        const fromRoot = (pitch - root + 12) % 12;
        if (intervalSet.has(fromRoot)) {
          const ivIdx = intervals.findIndex(iv => iv % 12 === fromRoot);
          boxNotes.push({
            string: s, fret: f, note: pitch, interval: fromRoot,
            intervalLabel: INTERVAL_NAMES[intervals[ivIdx]] || INTERVAL_NAMES[fromRoot],
            isRoot: fromRoot === 0, noteName: NOTE_NAMES[pitch], finger: null,
          });
        }
      }
    }

    // Open-string rule: include fret 0 for scale-tone strings when anchor < 5.
    // Threshold is strict < 5 (not <= 5) so Box 1 at anchor=5 does not pull in open strings.
    if (anchor < 5) {
      for (let s = 0; s < 6; s++) {
        const pitch = STANDARD_TUNING[s] % 12;
        const fromRoot = (pitch - root + 12) % 12;
        if (intervalSet.has(fromRoot) && !boxNotes.some(n => n.string === s && n.fret === 0)) {
          const ivIdx = intervals.findIndex(iv => iv % 12 === fromRoot);
          boxNotes.push({
            string: s, fret: 0, note: pitch, interval: fromRoot,
            intervalLabel: INTERVAL_NAMES[intervals[ivIdx]] || INTERVAL_NAMES[fromRoot],
            isRoot: fromRoot === 0, noteName: NOTE_NAMES[pitch], finger: null,
          });
        }
      }
    }

    if (boxNotes.length === 0) continue;

    assignFingers(boxNotes);

    const fretStart = Math.min(...boxNotes.map(n => n.fret));
    const fretEnd = Math.max(...boxNotes.map(n => n.fret));

    positions.push({
      label: `Box ${boxNumber}`,
      fretStart,
      fretEnd,
      notes: boxNotes,
    });
  }

  // Sort by fretStart ascending (below-root box appears first/leftmost)
  positions.sort((a, b) => a.fretStart - b.fretStart);
  return positions;
}
```

- [ ] **Step 2: Run tests — all tests must now pass**

Run: `npx jest --testPathPattern="scales.test"`

Expected: all tests pass, including the 8 property-based, 8 golden-set, and 2 regression tests. Total in `scales.test.ts` should be approximately 30 tests (18 original − 4 deleted = 14 remaining, plus 18 new tests across Layer 1/2/3).

If any tests fail, debug with the algorithm trace:
- "Box count wrong": check `findAnchors` returns the correct N anchors
- "Box 1 not at root": check `rootIdx` computation in `computeScalePositions`
- "fretStart wrong": check `windowStart = Math.max(0, anchor - 1)` clamping
- "open strings missing from Box 5": verify `anchor < 5` condition fires for anchor=3
- "open strings incorrectly on Box 1": verify anchor=5 does NOT satisfy `anchor < 5`

- [ ] **Step 3: Run full test suite to confirm no regressions**

Run: `npx jest`

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/engine/scales.ts src/engine/__tests__/scales.test.ts
git commit -F /tmp/msg.txt
```

Write to `/tmp/msg.txt` first:
```
feat(engine): replace hardcoded CAGED offsets with computed anchor-based scale positions

- Adds findAnchors() internal helper: walks low E string, returns N consecutive
  anchor frets with at most 1 below-root position
- Rewrites computeScalePositions() with dynamic windows [anchor-1, A_next+1]
- Correct box count per scale type: 5 for pentatonic, 6 for blues, 7 for 7-note
- Open-string rule (anchor < 5) captures first-position patterns
- Sorts positions by fretStart; Box 1 = root, below-root = Box N
- Updates tests: deletes 4 old assertions, adds 18 new (property/golden/regression)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

---

## Chunk 2: ScalesScreen — label-based position chips

---

### Task 4: Update ScalesScreen to use label-based position chips

**Context:** The screen currently stores numeric index strings (`'0'`, `'1'`) in `activePositions` and uses `parseInt` arithmetic to convert between chip display labels (`"Pos 1"…"Pos 5"`) and box labels. After the redesign, `activePositions` stores box labels directly (`'Box 1'`, `'Box 2'`…), chip options derive from `positions.map(p => p.label)`, and no index arithmetic is needed. Three `parseInt` usages are removed.

**Also:** Add a `useEffect` that resets `activePositions` to `new Set(['all'])` when `type` changes, preventing stale labels (e.g. `'Box 6'` from Blues) when the user switches to a 5-box scale.

**Files:**
- Modify: `src/screens/ScalesScreen.tsx`

- [ ] **Step 1: Add `useEffect` to the React import**

Current line 2:
```typescript
import React, { useState, useMemo } from 'react';
```

New:
```typescript
import React, { useState, useMemo, useEffect } from 'react';
```

- [ ] **Step 2: Add type-reset effect after the `advancedOpen` state line**

Current line 22 area:
```typescript
const [advancedOpen, setAdvancedOpen] = useState(false);
```

Add after it:
```typescript
// Reset position selection when scale type changes to avoid stale box labels
// (e.g. 'Box 6' selected for Blues becoming invalid when switching to 5-box pentatonic)
useEffect(() => {
  setActivePositions(new Set(['all']));
}, [type]);
```

- [ ] **Step 3: Remove `NUM_BOXES` and rewrite `positionOptions`**

Delete lines 86–90:
```typescript
// CAGED system always has 5 boxes regardless of scale type
const NUM_BOXES = 5;
const positionOptions = useMemo(() => {
  return ['All', ...Array.from({ length: NUM_BOXES }, (_, i) => `Pos ${i + 1}`)];
}, []);
```

Replace with:
```typescript
const positionOptions = useMemo(
  () => ['All', ...positions.map(p => p.label)],
  [positions]
);
```

- [ ] **Step 4: Rewrite `activeChipOptions`**

Current (lines 92–95):
```typescript
const activeChipOptions = useMemo((): Set<string> => {
  if (activePositions.has('all')) return new Set(['All']);
  return new Set(Array.from(activePositions).map(k => `Pos ${parseInt(k) + 1}`));
}, [activePositions]);
```

Replace with:
```typescript
const activeChipOptions = useMemo((): Set<string> => {
  if (activePositions.has('all')) return new Set(['All']);
  return new Set(activePositions); // keys are already 'Box 1', 'Box 2', etc.
}, [activePositions]);
```

- [ ] **Step 5: Rewrite `handlePositionChipToggle`**

Current (lines 97–104):
```typescript
const handlePositionChipToggle = (opt: string) => {
  if (opt === 'All') {
    handlePositionToggle('all');
  } else {
    const idx = positionOptions.indexOf(opt) - 1; // -1 for 'All' at index 0
    handlePositionToggle(String(idx));
  }
};
```

Replace with:
```typescript
const handlePositionChipToggle = (opt: string) => {
  if (opt === 'All') {
    handlePositionToggle('all');
  } else {
    handlePositionToggle(opt); // opt is already 'Box 1', 'Box 2', etc.
  }
};
```

- [ ] **Step 6: Fix `activeNoteSet` memo — remove `parseInt`**

Current (lines 38–50):
```typescript
const activeNoteSet = useMemo(() => {
  if (isAllActive) return null;
  const set = new Set<string>();
  for (const key of activePositions) {
    const boxNum = parseInt(key);
    // Find ALL positions with this box number and add their notes
    const matchingPositions = positions.filter(p => p.label === `Box ${boxNum + 1}`);
    for (const pos of matchingPositions) {
      for (const note of pos.notes) {
        set.add(`${note.string}-${note.fret}`);
      }
    }
  }
  return set;
}, [activePositions, positions, isAllActive]);
```

Replace with:
```typescript
const activeNoteSet = useMemo(() => {
  if (isAllActive) return null;
  const set = new Set<string>();
  for (const key of activePositions) {
    for (const pos of positions.filter(p => p.label === key)) {
      for (const note of pos.notes) {
        set.add(`${note.string}-${note.fret}`);
      }
    }
  }
  return set;
}, [activePositions, positions, isAllActive]);
```

- [ ] **Step 7: Fix `boxHighlights` memo — remove `parseInt`**

Current (lines 52–65):
```typescript
const boxHighlights = useMemo(() => {
  if (isAllActive) return [];
  // When a box is selected, show ALL instances of that box pattern across the fretboard
  return activePositions.size > 0
    ? Array.from(activePositions).flatMap(key => {
        const boxNum = parseInt(key);
        // Find ALL positions with this box number (there may be multiple at different fret locations)
        return positions.filter(p => p.label === `Box ${boxNum + 1}`).map(p => ({
          fretStart: p.fretStart,
          fretEnd: p.fretEnd,
        }));
      })
    : [];
}, [activePositions, positions, isAllActive]);
```

Replace with:
```typescript
const boxHighlights = useMemo(() => {
  if (isAllActive) return [];
  return activePositions.size > 0
    ? Array.from(activePositions).flatMap(key =>
        positions.filter(p => p.label === key).map(p => ({
          fretStart: p.fretStart,
          fretEnd: p.fretEnd,
        }))
      )
    : [];
}, [activePositions, positions, isAllActive]);
```

- [ ] **Step 8: Fix `FretboardViewer` notes prop — remove `parseInt`**

Current (lines 161–166 in JSX):
```tsx
notes={isAllActive
  ? positions.flatMap(p => p.notes)
  : Array.from(activePositions).flatMap(key => {
      const boxNum = parseInt(key);
      return positions.filter(p => p.label === `Box ${boxNum + 1}`).flatMap(p => p.notes);
    })}
```

Replace with:
```tsx
notes={isAllActive
  ? positions.flatMap(p => p.notes)
  : Array.from(activePositions).flatMap(key =>
      positions.filter(p => p.label === key).flatMap(p => p.notes)
    )}
```

- [ ] **Step 9: Run full test suite**

Run: `npx jest`

Expected: all tests pass.

- [ ] **Step 10: Manual smoke test**

Open the app (or Storybook/Expo). Verify:
1. Major scale shows 7 position chips (`All`, `Box 1`…`Box 7`) instead of `Pos 1`…`Pos 5`
2. Blues scale shows 6 position chips (`All`, `Box 1`…`Box 6`)
3. Am pentatonic shows 5 chips; `Box 5` is left-most (below root, open position)
4. Selecting `Box 1` for Am pentatonic highlights the fret-5 region
5. Switching from Blues to Major Pent resets selection to `All`

- [ ] **Step 11: Commit**

Write to `/tmp/msg.txt`:
```
feat(ui): update ScalesScreen to use label-based position chips

- Position chips now show "Box 1"..."Box N" (was "Pos 1"..."Pos 5")
- Chip count matches scale type: 5/6/7 boxes as appropriate
- Removes all parseInt offset arithmetic from activeNoteSet, boxHighlights,
  and FretboardViewer notes prop
- Adds useEffect to reset selection when scale type changes

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

Then commit:
```bash
git add src/screens/ScalesScreen.tsx
git commit -F /tmp/msg.txt
```
