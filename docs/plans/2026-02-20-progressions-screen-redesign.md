# Progressions Screen Redesign

**Date:** 2026-02-20

## Problems

1. Selecting a diatonic chord expands its card inline, causing the entire flex row to grow in height — making the ii and iii cards on the same row appear "expanded" even though they have no content.
2. `ChordPreview` renders in landscape orientation (nut on left, strings horizontal) — chord diagrams should be traditional portrait style (nut at top, strings vertical).
3. Chord diagram appears inside the button card instead of in a dedicated display section below.
4. Chord display order is determined by numeral position, not click order.
5. The 7 diatonic chord buttons wrap across multiple rows instead of fitting on one line.

## Design

### 1. Diatonic Chord Buttons — Compact Single Row

- Use `flexDirection: 'row'` with `flex: 1` on each button so all 7 fill the screen width equally.
- Display only the roman numeral (`I`, `ii`, `iii`, `IV`, `V`, `vi`, `vii°`) — drop the full chord name label.
- Retain the quality-coded left border (major / minor / dim color).
- Button highlighted (accent color) when that chord is in the current progression.

### 2. Ordered Progression State

- Replace `activeChords: Set<number>` with `progression: number[]` (ordered array of diatonic chord indices).
- **Add:** clicking a chord not in the array appends it to the end.
- **Remove:** clicking a chord already in the array removes all instances of it (effectively a toggle — since duplicate prevention isn't enforced, removing all instances is the safest interpretation).
- Clear `progression` when the root key changes.

### 3. Progression Display Section

- A labelled section ("Progression") appears below the diatonic buttons.
- Hidden when `progression` is empty; shown otherwise.
- A horizontal `ScrollView` renders one `ChordDiagram` card per entry in `progression`, in click order.
- Each card shows: chord name (e.g. `Am`) above the diagram.

### 4. ChordDiagram — New Portrait Component

- New component `src/components/ChordDiagram.tsx` (separate from `ChordPreview`, which stays unchanged for other screens).
- Traditional chord box layout:
  - 6 vertical lines = strings (low E left → high e right)
  - 5 horizontal lines = frets (nut at top, fret 5 at bottom)
  - Thick top line or nut marker when in open position; fret number label when up the neck
  - Dots between fret lines at the correct string
  - Root note dot uses `rootColor`; other dots use `accent`
  - Muted strings marked with × above the nut
  - Open strings marked with ○ above the nut
- Sized to fit comfortably in a horizontal scroll row (~90×110px SVG viewport).
- Exported from `src/components/index.ts`.

## Files Changed

| File | Change |
|------|--------|
| `src/screens/ProgressionsScreen.tsx` | State → ordered array; compact buttons; progression display section |
| `src/components/ChordDiagram.tsx` | New portrait chord diagram component |
| `src/components/index.ts` | Export `ChordDiagram` |
| `src/screens/__tests__/ProgressionsScreen.test.tsx` | Update tests for new state shape and layout |
| `src/components/__tests__/ChordDiagram.test.tsx` | New tests for ChordDiagram |

## Out of Scope

- `ChordPreview` is unchanged (used on Chords and Arpeggios screens in landscape mode).
- No persistence of progressions (save to favorites covers this separately).
- No reordering of chords in the progression (drag-to-reorder is a future feature).
