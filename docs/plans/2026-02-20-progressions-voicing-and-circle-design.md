# Progressions Screen: Voicing Selection + Circle of Fifths Annotations

**Date:** 2026-02-20

## Problems

1. `getVoicing` always returns the first voicing (E-shape barre), even when a simpler open-position chord exists for that root.
2. The Circle of Fifths shows all 12 notes identically (except the selected key), giving no information about which notes belong to the current key or their diatonic function.

## Design

### Change 1: Voicing Selection — Closest to Nut

**Location:** `getVoicing` helper in `src/screens/ProgressionsScreen.tsx`

**Algorithm:** For each voicing, compute `min(v.f for all v where v.f >= 0)`. Pick the voicing with the smallest result. Open strings contribute `f=0`, so open-position chords always score lower than any barre chord. Among barre-only voicings, the one physically closest to the nut wins.

**Examples:**
- C major: open C-shape scores 0 (has open strings) → selected over E-shape at fret 8 ✓
- F major: no open voicing exists; E-shape barre at fret 1 scores 1 → selected ✓

### Change 2: Circle of Fifths Diatonic Annotations

**Location:** `renderCircleOfFifths` in `src/screens/ProgressionsScreen.tsx`

For each of the 12 circle notes, check whether it is a diatonic chord root in the current key (using `diatonicChords` already in scope). Apply the following rendering:

| Note type | Circle fill | Text color | Note name size | Additional |
|-----------|------------|------------|---------------|------------|
| Non-diatonic | `theme.bgTertiary` | `theme.textPrimary` | `fontSize: 11` | — |
| Diatonic (major) | `#c8962a` | `#fff` | `fontSize: 9` | Roman numeral below, `fontSize: 7` |
| Diatonic (minor) | `#3a7bd5` | `#fff` | `fontSize: 9` | Roman numeral below, `fontSize: 7` |
| Diatonic (dim) | `#c0392b` | `#fff` | `fontSize: 9` | Roman numeral below, `fontSize: 7` |

The selected key circle (the one the user tapped to choose the key) also gets a white outer stroke ring (`stroke: '#fff', strokeWidth: 2`) to distinguish it as the active selection, regardless of its diatonic color.

Colors match `getChordQualityColor` exactly — same as the diatonic button bottom borders.

**Layout of two-line text inside the circle (r=15):**
- Note name: `y - 4` (slightly raised)
- Roman numeral: `y + 5` (below)

## Files Changed

| File | Change |
|------|--------|
| `src/screens/ProgressionsScreen.tsx` | Fix `getVoicing` + update `renderCircleOfFifths` |
| `src/screens/__tests__/ProgressionsScreen.test.tsx` | Add tests for voicing selection and circle annotations |
