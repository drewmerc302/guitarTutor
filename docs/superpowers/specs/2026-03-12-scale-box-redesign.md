# Scale Box Redesign: Computed Position Anchors

**Date:** 2026-03-12
**Status:** Draft

## Problem

`computeScalePositions` in `src/engine/scales.ts` uses hardcoded offsets `[0, 2, 4, 7, 9]` to place boxes on the fretboard. This produces several concrete bugs:

1. **Incorrect octave wrap.** `if (startFret > 12) startFret -= 12` wraps boxes that exceed fret 12 to a lower position. For A minor pentatonic (root at fret 5), Box 5 is placed at frets 2–5 instead of the correct 14–17. All positions ≤ TOTAL_FRETS are valid on a 24-fret guitar and should never wrap.

2. **Missing stretch notes.** The fixed 4-fret span (`endFret = startFret + 3`) excludes notes just outside the window. For Am pentatonic Box 3, the standard B-string note at fret 13 is cut off because the window ends at fret 12.

3. **Wrong box count for 7-note scales.** The code always generates 5 boxes regardless of scale type. Major, natural minor, harmonic minor, and melodic minor have 7 unique hand positions (one per scale degree), not 5.

4. **Hardcoded offsets don't generalize.** The offsets are empirically tuned for pentatonic patterns. They produce incorrect anchor positions for 7-note scales where the interval spacing differs.

## Goal

Replace hardcoded offsets with a computed approach that derives box anchor positions directly from scale notes on the low E string. This generalizes correctly to all scale types without manual tuning, produces the right number of boxes per scale, includes standard stretch notes, and eliminates the wrap bug.

## Design

### Core Algorithm

`computeScalePositions(root, intervals)` is rewritten in three steps.

#### Step 1 — Find anchors

Walk the low E string (`STANDARD_TUNING[5]`) from fret 0 to `TOTAL_FRETS`, collecting every fret where the pitch is a scale tone. Each such fret is a natural hand-position anchor — the fret where the index finger lands for that box.

`N = intervals.length` defines the number of unique positions: 5 for pentatonic and blues, 7 for 7-note scales (major, natural minor, harmonic minor, melodic minor).

Extract a window of N consecutive anchors from the full low-E anchor list such that:
- The anchor where `(STANDARD_TUNING[5] + fret) % 12 === root` is included and labeled **Box 1**
- Anchors ascending from Box 1 are labeled Box 2, Box 3 … Box N
- Anchors below Box 1 (lower frets) receive the highest box numbers, wrapping: the anchor just below Box 1 is Box N, the next lower is Box N−1, and so on

Any anchor whose box window would fall entirely off the fretboard is skipped. The function may return fewer than N boxes for extreme roots near fret 0 or fret 24.

#### Step 2 — Build box notes (dynamic span)

For each box with anchor `A[i]`, define the note window as:

```
windowStart = A[i] - 1
windowEnd   = A_next + 1
```

where `A_next` is the anchor immediately above `A[i]` in the cycle. For the last (highest) box, `A_next = anchors[0] + 12` (the first anchor one octave up), guaranteeing a well-defined window for all boxes.

The `-1` on `windowStart` captures notes one fret below the anchor that appear on the A, D, and G strings in several pentatonic and major scale positions. The `+1` on `windowEnd` captures the one-fret overhang on the B string caused by the major-third tuning interval between the G and B strings (e.g., the B-string note at fret 13 in Am pentatonic Box 3, which is part of every standard reference for that position).

Include all scale tones on all 6 strings with `fret ∈ [windowStart, windowEnd]`, clamped to `[0, TOTAL_FRETS]`. Open strings (fret 0) are included naturally when `windowStart ≤ 0`.

```
fretStart = min(note.fret for all included notes)
fretEnd   = max(note.fret for all included notes)
```

`assignFingers` is called on the box notes after collection, unchanged from the current implementation.

#### Step 3 — Sort and label

Sort the N boxes by `fretStart` ascending before returning. The box labeled Box 1 appears at whatever position it falls in the sorted order (not necessarily first, since below-root boxes have lower fret positions). Labels are stable: Box 1 always means the root position, Box 2 is the next pattern up the neck from Box 1, and so on.

### What Changes

**`src/engine/scales.ts`:**
- Delete `CAGED_OFFSETS` constant
- Delete `NUM_BOXES` constant
- Delete the octave-wrap block (`if (startFret > 12) startFret -= 12`)
- Delete the fixed `endFret = startFret + 3` logic
- Add `findAnchors(root, intervals)` — walks low E, returns the N anchor frets with the root anchor identified
- Rewrite the main loop in `computeScalePositions` to use computed anchors and dynamic windows

**`src/screens/ScalesScreen.tsx`:**
- Remove the hardcoded `const NUM_BOXES = 5`
- Derive position chips directly from `positions.map(p => p.label)` instead of generating `Pos 1`…`Pos 5` independently
- Change `activePositions` Set to store box labels (`'Box 1'`, `'Box 2'`…) instead of index strings, simplifying the lookup — no more `parseInt` offset arithmetic
- Update `activeNoteSet` and `boxHighlights` memos to match by `p.label === key` directly

### What Does NOT Change

- `ScalePosition` interface (`label`, `fretStart`, `fretEnd`, `notes`)
- `computeScalePositions` function signature
- `SCALE_TYPES`, `MODE_NAMES`, `applyModeRotation`
- `assignFingers` call
- `FretboardViewer`, `GuitarNeck`, display modes, mode rotation, root picker, persistent state
- String numbering: s:0 = high E, s:5 = low E

## Testing Strategy

### Layer 1: Property-Based Tests

Run across all 12 roots × 7 scale types (84 combinations):

- **Correct box count:** returns exactly `intervals.length` positions (or fewer only when boxes fall off the fretboard near the edges)
- **Box 1 contains root on low E:** the notes for the Box 1 position include the root pitch class on string s:5
- **Ascending order:** positions are sorted by `fretStart` ascending
- **Scale tones only:** every note in every box has `interval` in the scale's interval set
- **Valid span:** `fretEnd > fretStart` for every box
- **Valid fret range:** all fret values in `[0, TOTAL_FRETS]`
- **Finger assignments:** every note has a non-null `finger`
- **Labels:** every box label matches `/^Box \d+$/`

### Layer 2: Golden Set Tests

Specific positions verified against standard guitar references:

- **Am pentatonic (root 9):**
  - Returns exactly 5 positions
  - Box 1 fretStart = 5
  - Box 2 fretStart = 7 (or 8 — the anchor on low E)
  - Box 3 fretStart ≤ 10, fretEnd ≥ 13 (includes B-string stretch note)
  - Box 4 fretStart = 12
  - Box 5 fretStart = 14 (NOT 2 — the old wrap artifact)
  - Box 5 (or lowest box) includes open-string notes (fret 0 on low E and high E = E, open A = A)

- **C major (root 0):**
  - Returns exactly 7 positions
  - Box 1 fretStart = 8

### Layer 3: Regression Tests

- Am pentatonic produces no position with `fretStart === 2` (old wrap artifact)
- No scale type produces exactly 5 boxes when `intervals.length === 7`

## Known Limitations

- **Adjacent boxes share notes.** The `[A-1, A_next+1]` window means notes in the overlap zone appear in two consecutive boxes. This matches standard guitar teaching (adjacent positions share boundary notes) and is intentional.
- **Open-position boxes span fret 0.** When a box includes open strings, `fretStart = 0`. The box highlight in `GuitarNeck` already handles fret 0 correctly via the `FB.openStringWidth` path.
- **Extreme roots near high frets.** For roots that place Box N near fret 21+, the dynamic window may clip some notes at TOTAL_FRETS. These edge cases are acceptable — no guitarist regularly plays 7-box patterns starting at fret 20.
