# Scale Box Position Fix

**Date:** 2026-02-20

## Problem

`computeScalePositions` in `src/engine/scales.ts` searches only frets 0–3 on the low E string to find the root note for Box 1:

```ts
for (let f = 0; f <= 3; f++) {
  if ((STANDARD_TUNING[5] + f) % 12 === root) return f;
}
return 0; // wrong fallback
```

For any root whose lowest occurrence on the low E string is above fret 3, the search misses it and falls back to fret 0. This makes Box 1 start at the nut instead of the correct root position.

**Affected roots (8 of 12):** Ab(4), A(5), Bb(6), B(7), C(8), Db(9), D(10), Eb(11) — fret numbers in parentheses.

**Unaffected roots:** E(0), F(1), F#(2), G(3) — already within the 0–3 range.

## Fix

Change the upper bound of the search from `3` to `TOTAL_FRETS` (already imported). The first occurrence of the root note on the low E string is now always found correctly.

```ts
for (let f = 0; f <= TOTAL_FRETS; f++) {
```

All 5 subsequent box positions flow naturally from the corrected starting fret. No other logic changes are needed.

## Files Changed

| File | Change |
|------|--------|
| `src/engine/scales.ts` | `f <= 3` → `f <= TOTAL_FRETS` on line 43 |
| `src/engine/__tests__/scales.test.ts` | Add 2 new tests covering Box 1 root position |
