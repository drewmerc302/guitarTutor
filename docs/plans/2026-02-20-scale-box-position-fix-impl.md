# Scale Box Position Fix Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix `computeScalePositions` so Box 1 always starts at the root note on the low E string, not at the nut.

**Architecture:** Single character change in `src/engine/scales.ts` — the fret search upper bound changes from `3` to `TOTAL_FRETS`. No other logic changes. Two new tests are added to `src/engine/__tests__/scales.test.ts` to lock in the correct behaviour.

**Tech Stack:** TypeScript, Jest

---

### Task 1: Fix the fret search bound and add tests

**Files:**
- Modify: `src/engine/scales.ts:43`
- Test: `src/engine/__tests__/scales.test.ts`

**Background on the bug:**

`STANDARD_TUNING[5]` is `4` (low E string). To find the root note `A` (value `9`) on that string:
```
(4 + f) % 12 === 9  →  f = 5
```
But the current code only searches `f = 0..3`, misses fret 5, and falls back to `return 0`. So Box 1 starts at fret 0 for A, Bb, B, C, Db, D, and Eb roots.

`TOTAL_FRETS` is already imported at the top of `scales.ts` — use it as the upper bound.

**Step 1: Write the failing tests**

Add these two tests inside the existing `describe('computeScalePositions')` block in `src/engine/__tests__/scales.test.ts`:

```ts
test('A minor pentatonic Box 1 starts at fret 5 (root A on low E)', () => {
  // Low E (STANDARD_TUNING[5] = 4). A = note value 9. Fret: (4 + 5) % 12 = 9. ✓
  const positions = computeScalePositions(9, [0, 3, 5, 7, 10]);
  expect(positions[0].fretStart).toBe(5);
});

test('Box 1 always starts at the root note on the low E string for all 12 roots', () => {
  const LOW_E_OPEN = 4; // STANDARD_TUNING[5]
  for (let root = 0; root < 12; root++) {
    // Find the first fret on low E that produces this root note
    let expectedFret = 0;
    for (let f = 0; f <= 24; f++) {
      if ((LOW_E_OPEN + f) % 12 === root) { expectedFret = f; break; }
    }
    const positions = computeScalePositions(root, [0, 2, 4, 5, 7, 9, 11]);
    expect(positions[0].fretStart).toBe(expectedFret);
  }
});
```

**Step 2: Run tests to verify they fail**

```bash
npx jest src/engine/__tests__/scales.test.ts --no-coverage -t "fret 5|low E string"
```

Expected: Both FAIL. The first fails with `expect(received).toBe(expected) — Expected: 5, Received: 0`. The second fails for roots Ab through Eb (those whose first occurrence on low E is above fret 3).

**Step 3: Apply the one-line fix in `src/engine/scales.ts`**

Find this block (around line 42–47):

```ts
const baseRootE = (() => {
  for (let f = 0; f <= 3; f++) {
    if ((STANDARD_TUNING[5] + f) % 12 === root) return f;
  }
  return 0;
})();
```

Change `f <= 3` to `f <= TOTAL_FRETS`:

```ts
const baseRootE = (() => {
  for (let f = 0; f <= TOTAL_FRETS; f++) {
    if ((STANDARD_TUNING[5] + f) % 12 === root) return f;
  }
  return 0;
})();
```

That is the entire change. `TOTAL_FRETS` is already imported on line 2.

**Step 4: Run new tests to verify they pass**

```bash
npx jest src/engine/__tests__/scales.test.ts --no-coverage -t "fret 5|low E string"
```

Expected: Both PASS.

**Step 5: Run the full scales test suite**

```bash
npx jest src/engine/__tests__/scales.test.ts --no-coverage
```

Expected: All 8 tests pass (6 existing + 2 new). The existing `'works for all 12 roots'` test (which checks `positions.length === 5`) must still pass — verify it does.

**Step 6: Run the full test suite**

```bash
npx jest --no-coverage
```

Expected: All 157 tests pass (155 existing + 2 new), 0 failures.

**Step 7: Commit**

Write commit message to `/tmp/msg.txt` using the Write tool:

```
fix(engine): fix scale box positions to start at root note on low E string

Expanded fret search from 0-3 to full neck. Fixes Box 1 starting at
the nut instead of the correct root fret for 8 of 12 roots (Ab-Eb).
```

Then:
```bash
git add src/engine/scales.ts src/engine/__tests__/scales.test.ts
git commit -F /tmp/msg.txt
```
