# Chord Generator Redesign: Constraint-Based Voicing Generation

**Date:** 2026-03-12
**Status:** Draft

## Problem

The current chord generator in `src/engine/chords.ts` uses hardcoded CAGED voicings. Each chord type has manually defined shapes (E-shape, A-shape, etc.) transposed to all 12 roots. This has several issues:

- Major/Minor get 3-5 voicings; other types get 2-3 at best
- Dim, Aug, Dim7, Min7b5, 9th fall back to Major voicings (wrong chord tones)
- No inversions support
- Adding a new chord type requires writing a new generator function with manual voicings
- CAGED shapes don't cover the full fretboard — many practical voicings are missing

## Goal

Replace the hardcoded CAGED system with a constraint-based algorithmic generator that finds every playable voicing for any chord type across the full 24-fret neck, with inversion filtering.

## Design

### Core Algorithm

A single `generateVoicings(root, intervals)` function replaces all existing generators. It works by enumerated search with constraint filtering:

1. **Compute required pitch classes.** From root and interval array, derive the set of pitch classes. For chords with 4+ tones, the perfect 5th (interval[2] === 7 semitones) is optional. Diminished and augmented 5ths are NOT optional — they are defining tones for those chord types.
   - Example: C Major (root=0, intervals=[0,4,7]) -> required: {0, 4, 7}
   - Example: C9 (root=0, intervals=[0,4,7,10,14]) -> required: {0, 4, 10, 2}, optional: {7}
   - Example: Cdim7 (root=0, intervals=[0,3,6,9]) -> required: {0, 3, 6, 9} (b5 is NOT optional)

2. **Enumerate fret windows.** Slide a 4-fret window across the neck: [1-4], [2-5], ..., [21-24]. Within each window, open strings (fret 0) are always available as candidates — they are "free" and do not count toward the 4-fret span. There is no separate open-string variant; every window naturally includes fret 0 as an option for any string whose open pitch class is in the chord's set.

3. **Per string, enumerate valid assignments.** Each of the 6 strings can be:
   - Muted (-1)
   - Open (0) — only if the string's open pitch class is in the chord's pitch class set
   - Fretted at any fret in the window — only if the resulting pitch class is in the chord's pitch class set

   Pitch-class filtering per string reduces the branching factor to ~3 options per string for triads, up to ~4-5 for extended chords (more pitch classes means more fret matches). Worst case for a 5-tone chord: ~5^6 = 15,625 per window x 21 windows = ~328K evaluations. This is still well within millisecond-range computation on mobile.

4. **Filter valid voicings.** A candidate is valid if:
   - All required pitch classes are present (5th optional for 4+ tone chords). A pitch class counts as "present" regardless of which string or octave it appears on — including the bass note. So a voicing with the 5th only in the bass (2nd inversion) is valid.
   - At least one non-muted string
   - Fretted notes (fret > 0) span <= 4 frets
   - All-open voicings (no fretted notes) are valid if they contain all required pitch classes

5. **Classify by inversion.** Based on the lowest-pitched non-muted string's pitch class, using the interval array position (not traditional names — this handles sus chords and other non-tertian types correctly):
   - Bass note = interval[0] (root) -> root position
   - Bass note = interval[1] (e.g., 3rd for triads, 4th for sus4) -> 1st inversion
   - Bass note = interval[2] (e.g., 5th for triads) -> 2nd inversion
   - Bass note = any other interval (7th, 9th, etc.) -> unclassified, only visible under "All" filter

   Inversions are always relative to the requested root, not the pitch class set. This means Cdim7 and Ebdim7 (which share the same pitch classes) will have different inversion classifications for the same voicing.

6. **Deduplicate.** Remove voicings with identical string-to-fret mappings.

7. **Rank by playability score** (lower = better):
   - +1 per muted string
   - +1 per fret of stretch (maxFret - minFret among fretted notes)
   - +2 per interior muted string (gap between played strings)
   - -1 per additional string played beyond 3 (capped at -3 to avoid overwhelming other factors)

   Return the top 50 voicings by playability score. This cap prevents overwhelming the user with hundreds of voicings while still providing comprehensive neck coverage.

### Caching

A module-level `Map<string, ChordVoicing[]>` keyed by `"${root}-${type}"`. Inversion filtering happens after cache lookup (cheap array filter). The cache is deterministic, requires no invalidation, and holds at most 144 entries.

### Interface Changes

**`getChordVoicings` signature update:**

```typescript
export type InversionFilter = 'all' | 'root' | '1st' | '2nd';

export function getChordVoicings(
  root: number,
  type: string,
  inversion?: InversionFilter  // defaults to 'all'
): ChordVoicing[];
```

**Deleted functions:**
- `generateBarreVoicings()`
- `generateMinorBarreVoicings()`
- `generateSus4Voicings()`
- `generateSus2Voicings()`
- `generateDominant7Voicings()`
- `generateMaj7Voicings()`
- `generateMin7Voicings()`

### UI Change

New `SegmentedControl` in `ChordsScreen.tsx` for inversion filtering, placed below the Display selector:

```
Type:       [Major] [Minor] [7th] [Maj7] ...
Display:    [Finger | Interval | Note]
Inversion:  [All | Root | 1st | 2nd]       <- new
```

Uses `usePersistentState` like other controls. If a filter yields zero voicings, it resets to "All".

### Fallback Behavior

If the inversion filter produces no results for a given chord, the filter resets to "All" automatically.

## What Does NOT Change

- `CHORD_TYPES` dictionary (same interval definitions)
- `ChordVoicingNote`, `ChordVoicing`, `VoicingRegion` types
- `buildVoicingRegions()`, `findBarreFret()`
- `ChordDiagram`, `ChordPreview`, `GuitarNeck` components
- `assignFingers()`
- `ProgressionsScreen` (calls `getChordVoicings(root, type)` without inversion, works as before)
- String numbering: s:0 = high E, s:5 = low E
- Voicing selection UX (tap root notes to switch voicings)
- Persistent state for root/type/display

## Files Changed

1. **`src/engine/chords.ts`** — delete hardcoded generators, add constraint-based algorithm + cache
2. **`src/screens/ChordsScreen.tsx`** — add inversion SegmentedControl, pass filter to `getChordVoicings`
3. **`src/engine/__tests__/chords.test.ts`** — rewrite tests entirely

## Testing Strategy

### Layer 1: Property-Based Tests

Run across all 144 (root, type) combinations:

- **Pitch class correctness:** All required chord tones present. 5th may be absent for 4+ tone chords.
- **Fret span constraint:** Fretted notes (fret > 0) span <= 4 frets.
- **Valid fret range:** All frets are -1, 0, or 1-24.
- **Open string correctness:** Open strings (fret 0) must have a pitch class in the chord's set.
- **Inversion correctness:** When filtered, the bass note matches the expected inversion.
- **Non-empty results:** Every (root, type) pair produces >= 1 voicing.
- **No duplicates:** No identical voicings in a result set.

### Layer 2: Golden Set Regression Tests

~25-30 hand-curated voicings that the generator must include. Notation is low-E-first (conventional tab order: string 5 to string 0, matching standard guitar tablature):

- Open C Major: x-3-2-0-1-0
- Open G Major: 3-2-0-0-0-3
- Open Am: x-0-2-2-1-0
- Open E: 0-2-2-1-0-0
- Open D: x-x-0-2-3-2
- F barre (E-shape, fret 1): 1-3-3-2-1-1
- Bb barre (A-shape, fret 1): x-1-3-3-3-1
- Open Em7: 0-2-0-0-0-0
- Open Cmaj7: x-3-2-0-0-0
- Open Dsus4: x-x-0-2-3-3
- Additional jazz partial voicings

Tests assert the golden voicing appears in the output, not at a specific index.

### Layer 3: Snapshot/Count Tests

Capture voicing count per (root, type) as a snapshot. Acts as a canary for unexpected changes to generator output.

## Known Limitations

- **Pathological muting patterns:** Voicings with many interior muted strings (e.g., play string 6 and 1, mute 2-5) are technically valid but impractical. These are not hard-rejected; instead, the +2 per interior gap penalty in the playability score pushes them below the top-50 cutoff in practice.
- **Physical playability beyond fret span:** The 4-fret span constraint is necessary but not sufficient for playability. Some generated voicings may require finger stretches or barre patterns that are difficult in practice. The `assignFingers()` heuristic approximates fingering but does not reject unplayable shapes. This is acceptable — the playability score ranks easier voicings higher, pushing awkward ones toward the bottom.
- **Octave equivalence:** Voicings at fret N and fret N+12 produce the same pitch classes in different octaves. Both are included in results since a player may want high-register voicings. They are not deduplicated.
- **Symmetric chords:** Dim7 and Aug chords have symmetric pitch class sets (Cdim7 = Ebdim7 = Gbdim7 = Adim7). The generator produces identical voicing sets for enharmonic roots but classifies inversions relative to the requested root.

## Performance

- Computation: ~1-5ms per (root, type) pair for triads, up to ~10ms for extended chords on mobile (Hermes engine)
- Cache: instant lookup after first computation
- Precomputation: not needed, lazy computation is fast enough
- Memory: negligible (~144 entries, up to 50 voicings each)
