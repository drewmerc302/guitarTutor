# Scale Box Redesign: Computed Position Anchors

**Date:** 2026-03-12
**Status:** Draft

## Problem

`computeScalePositions` in `src/engine/scales.ts` uses hardcoded offsets `[0, 2, 4, 7, 9]` to place boxes on the fretboard. This produces several concrete bugs:

1. **Incorrect octave wrap.** `if (startFret > 12) startFret -= 12` wraps any box anchor exceeding fret 12 to a lower position. For most roots this fires incorrectly — Box 5 of Am pentatonic (natural anchor fret 14) is displaced to fret 2, but in the wrong way: the displacement happens because the anchor is computed as 14, not because fret 2 is the correct below-root position. The notes end up approximately right but for the wrong reason.

2. **Missing stretch notes.** The fixed 4-fret span (`endFret = startFret + 3`) excludes notes just outside the window. For Am pentatonic Box 3, the standard B-string note at fret 13 is cut off because the window ends at fret 12.

3. **Wrong box count for 7-note scales.** The code always generates 5 boxes. Major, natural minor, harmonic minor, and melodic minor have 7 unique hand positions (one per scale degree). Blues has 6. Only the 5-note pentatonic scales naturally produce exactly 5 positions.

4. **Hardcoded offsets don't generalize.** The offsets are empirically tuned for pentatonic patterns and produce incorrect anchor positions for other scale types.

## Goal

Replace hardcoded offsets with a computed approach that derives box anchor positions directly from scale notes on the low E string. This generalizes correctly to all scale types, produces the right number of boxes per scale, includes standard stretch notes and open strings, and eliminates the wrap bug.

**Box 1 is always the position containing the root note on the low E string. Boxes 2…N ascend the neck. If positions exist below Box 1 on the neck (i.e., the root is not the lowest scale tone on low E), those positions are assigned the high box numbers (Box N just below root, Box N−1 one step further down, etc.) and displayed to the left of Box 1 on screen.**

## Design

### Core Algorithm

`computeScalePositions(root, intervals)` is rewritten in three steps.

#### Step 1 — Find anchors

Walk the low E string (`STANDARD_TUNING[5] = 4`) from fret 0 to `TOTAL_FRETS`, collecting every fret where the pitch is a scale tone. Sort ascending. Call this the **low-E anchor list**.

`N = intervals.length` — the number of unique positions:
- 5 for 5-note scales (Major Pent., Minor Pent.)
- 6 for 6-note scales (Blues)
- 7 for 7-note scales (Major, Nat. Minor, Harm. Minor, Melodic Minor)

Find `idx_root` = the index of the root anchor in the sorted low-E anchor list (first fret where `(STANDARD_TUNING[5] + fret) % 12 === root`).

**Select N consecutive anchors** starting from index `max(0, idx_root - 1)`. This always includes at most 1 anchor below the root anchor (when one exists), plus the root anchor, plus N−2 anchors above it.

Label the selected anchors:
- The anchor at `idx_root` → **Box 1**
- Anchors above Box 1 in ascending order → Box 2, Box 3 … Box N (or Box N−1 when a below-root anchor is present)
- The anchor below Box 1 (if present at position `idx_root - 1`) → Box N

When there is no below-root anchor (i.e. `idx_root = 0`, so `max(0, idx_root - 1) = 0`), all N anchors start at the root and ascend: Box 1, Box 2 … Box N. There is no gap in numbering.

**If there are fewer than N anchors from the starting index to the end of the low-E anchor list**, take as many as are available (truncate rather than wrap). Any anchor whose computed box window falls entirely off the fretboard is then skipped. In practice, for all 12 roots with TOTAL_FRETS = 24, the full anchor list has enough entries that this truncation does not occur — the property-based tests may assert exactly `intervals.length` positions for all 84 root × scale-type combinations.

**Example — Am pentatonic (root A = 9):**

Low-E anchor list: frets 0(E), 3(G), 5(A), 8(C), 10(D), 12(E), 15(G), …

`idx_root = 2` (fret 5). `max(0, 2-1) = 1`. Take 5 anchors starting from index 1: **[3, 5, 8, 10, 12]**.

Labeling: anchor 3 → Box 5 (below root), anchor 5 → Box 1, anchor 8 → Box 2, anchor 10 → Box 3, anchor 12 → Box 4.

Boxes appear on screen left to right as: Box 5, Box 1, Box 2, Box 3, Box 4.

#### Step 2 — Build box notes (dynamic span)

For each box with anchor `A[i]`, define:

```
A_next  = the anchor immediately above A[i] in the selected N-anchor set
          (for the highest anchor in the set, A_next = selected[0] + 12,
           where selected[0] is the lowest-fret anchor in the selected N-anchor set —
           this may be the below-root Box N anchor when one exists, e.g. for Am pentatonic
           selected = [3, 5, 8, 10, 12], so selected[0] = 3 and A_next = 15)

windowStart = A[i] - 1
windowEnd   = A_next + 1
```

Include all scale tones on all 6 strings with `fret ∈ [max(0, windowStart), min(TOTAL_FRETS, windowEnd)]`.

The `-1` on `windowStart` captures notes one fret below the anchor that appear on the A, D, and G strings in several pentatonic and major-scale positions. The `+1` on `windowEnd` captures the one-fret overhang on the B string caused by the major-third tuning interval between G and B strings (e.g., the B-string note at fret 13 in Am pentatonic Box 3).

Note that `windowStart` may be negative (e.g., anchor at fret 0 gives `windowStart = -1`); the loop is clamped to `max(0, windowStart)` so it is always non-negative.

**Open strings:** Additionally, for any string where the open-string pitch (fret 0) is a scale tone, include fret 0 if the box's anchor `A[i] ≤ 5`. This captures standard open-position fingering patterns (e.g., Box 5 of Am pentatonic anchored at fret 3 naturally includes open E, A, D, G strings) without adding spurious open-string notes to upper-neck positions.

After collecting all notes:

```
fretStart = min(note.fret for all included notes)
fretEnd   = max(note.fret for all included notes)
```

`assignFingers` is called on the box notes after collection, unchanged from the current implementation.

#### Step 3 — Sort and label

Sort the N boxes by `fretStart` ascending before returning. The box labeled Box 1 will appear at whatever position it occupies in the sorted order — not necessarily first, since below-root boxes sort lower.

### What Changes

**`src/engine/scales.ts`:**
- Delete `CAGED_OFFSETS` constant
- Delete `NUM_BOXES` constant
- Delete the octave-wrap block (`if (startFret > 12) startFret -= 12`)
- Delete the fixed `endFret = startFret + 3` logic
- Add `findAnchors(root, intervals): number[]` — walks low E, returns the N selected anchor frets in ascending order. This is an internal (non-exported) helper; it is not part of the public API.
- Rewrite the main loop in `computeScalePositions` to use computed anchors and dynamic windows

**`src/screens/ScalesScreen.tsx`:**
- Remove the hardcoded `const NUM_BOXES = 5` and the static `'Pos 1'…'Pos 5'` chip labels (visible text changes from `"Pos N"` to `"Box N"` — intentional)
- Remove `positionOptions` memo; derive chip options inline from `positions` (dependent on `positions`, not a static empty-dep array — the count changes between scale types)
- Change `activePositions` Set to store box labels (`'Box 1'`, `'Box 2'`…) instead of numeric index strings
- Replace all three `parseInt(key)` / `` `Box ${boxNum + 1}` `` usages with direct label lookups (`p.label === key`):
  1. `activeNoteSet` memo
  2. `boxHighlights` memo
  3. Inline `FretboardViewer` `notes` prop (currently `positions.filter(p => p.label === \`Box ${parseInt(key) + 1}\`).flatMap(...)`)
- Reset `activePositions` to `new Set(['all'])` whenever `type` changes (add a `useEffect` on `type` that calls `setActivePositions(new Set(['all']))`). This prevents stale labels (e.g. `'Box 6'` selected for Blues, then switching to Major Pent. which has 5 boxes) from producing an empty fretboard.
- Rewrite `positionOptions`, `activeChipOptions`, and `handlePositionChipToggle` so chip labels match box labels exactly:
  - `positionOptions = ['All', ...positions.map(p => p.label)]` (depends on `positions`)
  - `activeChipOptions`: when `activePositions.has('all')` return `new Set(['All'])`; otherwise return the `activePositions` Set directly (keys are already display labels)
  - `handlePositionChipToggle`: when opt === `'All'` call `handlePositionToggle('all')`; otherwise call `handlePositionToggle(opt)` directly (no index arithmetic needed)

### What Does NOT Change

- `ScalePosition` interface (`label`, `fretStart`, `fretEnd`, `notes`)
- `computeScalePositions` function signature
- `SCALE_TYPES`, `MODE_NAMES`, `applyModeRotation`
- `assignFingers` call
- `FretboardViewer`, `GuitarNeck`, display modes, mode rotation, root picker, persistent state
- String numbering: s:0 = high E, s:5 = low E

## Testing Strategy

### Tests to Retire

The following existing tests assert the old (incorrect) behaviour and must be deleted or replaced:

- `'each box spans exactly 3 frets (fretEnd - fretStart === 3)'` — delete; dynamic spans replace the fixed 4-fret window
- `'A minor pentatonic produces 5 boxes (single copy each)'` — replace with updated assertions (correct fretStart values)
- `'Box 1 always starts at the root note on low E string'` (both variants) — update: after the redesign, `positions[0]` is the lowest-fret box (Box N, a below-root box), not Box 1. The test must find the position with `label === 'Box 1'` before asserting its fretStart

### Layer 1: Property-Based Tests

Run across all 12 roots × 7 scale types (84 combinations):

- **Correct box count:** returns exactly `intervals.length` positions (for all 12 roots with TOTAL_FRETS = 24 this should always be exactly N — the truncation path is not expected to fire)
- **Box 1 exists and contains root on low E:** the position with `label === 'Box 1'` has at least one note with `isRoot === true` on string s:5
- **Ascending order:** positions are sorted by `fretStart` ascending
- **Scale tones only:** every note in every box has `interval` in the scale's interval set
- **Valid span:** `fretEnd > fretStart` for every box
- **Valid fret range:** all fret values in `[0, TOTAL_FRETS]`
- **Finger assignments:** every note has a non-null `finger`
- **Labels:** every box label matches `/^Box \d+$/`

### Layer 2: Golden Set Tests

Specific positions verified against standard guitar references:

**Am pentatonic (root 9, intervals `[0,3,5,7,10]`):**
- Returns exactly 5 positions
- The position with `label === 'Box 1'` has `fretStart === 5`
- The position with `label === 'Box 2'` has `fretStart === 8` (anchor at fret 8; windowStart = 7, but fret 7 on all strings is B♭ — not a minor pentatonic tone — so the first included note is at fret 8)
- The position with `label === 'Box 3'` has `fretEnd >= 13` (includes the B-string stretch note at fret 13)
- The position with `label === 'Box 4'` has `fretStart === 12`
- The position with `label === 'Box 5'` has `fretStart <= 4` (the below-root open-position box) and includes at least one note at `fret === 0` (open string)

**C major (root 0, intervals `[0,2,4,5,7,9,11]`):**
- Returns exactly 7 positions
- The position with `label === 'Box 1'` has `fretStart === 8`

### Layer 3: Regression Tests

- Am pentatonic: no position has `label === 'Box 5'` AND `fretStart >= 14` (the old wrap-produced high-fret Box 5 no longer appears at the expense of the below-root position)
- No 7-note scale returns exactly 5 boxes for any root (box count must be 7, not 5)

## Known Limitations

- **Adjacent boxes share notes.** The `[A-1, A_next+1]` window plus the open-string rule means notes in the overlap zone appear in two consecutive boxes. This matches standard guitar teaching (adjacent positions share boundary notes) and is intentional.
- **Blues produces 6 positions.** `intervals.length = 6` for the Blues scale, so the algorithm returns 6 positions and the position chip row shows 7 chips (All + Box 1…Box 6). Most beginner references fold the blue note (b5) into the surrounding pentatonic boxes rather than treating it as a separate position anchor. Displaying 6 positions is technically correct and the variable chip count is intentional; whether the UI should cap Blues at 5 is a future UX decision.
- **Extreme roots near high frets.** For roots where boxes fall near fret 24, the dynamic window may clip some notes at `TOTAL_FRETS`. These edge cases are acceptable.
