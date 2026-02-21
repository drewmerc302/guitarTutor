# Integration Test Suite & Bug Fixes — Design

**Date:** 2026-02-21
**Goal:** Expand the 69 existing screen tests with full button-level behavioral coverage and red-green bug-catching test pairs for all 6 documented bugs, then fix each bug.

---

## Architecture

- **Same toolchain** as existing tests: `react-test-renderer` + `act` + mocks in `jest.setup.ts`. No new dependencies.
- **Same pattern**: find elements via `accessibilityLabel` or `findAllByType`, stringify the JSON tree for text checks.
- **New technique**: `tree.root.findByType(ComponentClass)` to inspect props passed to child components — used to verify what `displayMode` and `boxHighlights` the screen passes to `FretboardViewer`.
- **Expand existing files**: tests go into the existing `src/screens/__tests__/*.test.tsx` files, not new files.
- **Execution order per screen**: write failing test → confirm fail → fix bug → confirm pass → add remaining coverage tests.

---

## Bug-Catching Tests (6 red-green pairs)

### Bug 1 — TriadsScreen: 2nd Inv + strings 1-2-3 shows wrong scroll region

**Root cause:** `boxHighlights` filters out fret-0 notes (`filter(f => f > 0)`). When the only non-zero fret is missing (all notes land at fret 0 or very low), `boxHighlights` returns `[]`. The `FretboardViewer` only re-scrolls when `boxHighlights.length > 0`, so the view stays at whatever position the previous selection left it (e.g. frets 5–10), making the nut-area notes invisible — a blank fretboard.

**Test (fails before fix):** Render TriadsScreen → expand Advanced → select strings "1-2-3" and inversion "2nd Inv" → find `FretboardViewer` in the tree → assert `boxHighlights` is non-empty and `fretStart ≤ 2`.

**Fix:** In TriadsScreen `boxHighlights` useMemo: when `frets` (non-zero) is empty but `notes.length > 0`, return `[{ fretStart: 0, fretEnd: 0 }]` to trigger a scroll-to-nut.

---

### Bug 2 — TriadsScreen: "All Strings" default scrolls to mid-neck (~fret 8)

**Root cause:** In "All Strings" mode, `computeTriadPositions` returns notes from all 4 string groups combined. These span frets 1–10+. `boxHighlights` covers the full range and the viewer centers on ~fret 5–6, hiding nut-position shapes.

**Test (fails before fix):** Render TriadsScreen (default state is "All Strings") → find `FretboardViewer` → assert `boxHighlights` is `[]`.

**Fix:** In TriadsScreen `boxHighlights` useMemo: when `stringGroup === 'all'`, return `[]` immediately (let the fretboard stay at the nut by default).

---

### Bug 3 — ScalesScreen: Advanced section unresponsive after Minor Pent + Pos 1

**Root cause:** To be confirmed during implementation. Hypothesis: after switching to a 5-note scale type (Minor Pentatonic) and selecting a position, a re-render interaction causes the Advanced toggle button to stop responding.

**Test (fails before fix):** Render ScalesScreen → select type "Minor Pent" → select position "Pos 1" → press Advanced toggle → assert the chevron icon name changes from `chevron-right` to `chevron-down` (i.e. `advancedOpen` toggled).

**Fix:** Identified and applied during the implementation step for this bug.

---

### Bug 4 — ScalesScreen: Note/Interval display mode not lowercased

**Root cause:** `SegmentedControl` emits Title-case values ("Note", "Interval"). `ChordsScreen` and `TriadsScreen` call `.toLowerCase()` before passing `displayMode` to `FretboardViewer`. `ScalesScreen` passes `display` directly, so `displayMode="Note"` instead of `"note"` — `GuitarNeck` comparisons fail and labels are wiped.

**Test (fails before fix):** Render ScalesScreen → press "Note" in the Display SegmentedControl → find `FretboardViewer` in tree → assert `props.displayMode === "note"` (lowercase).

**Fix:** Change `displayMode={display as ...}` to `displayMode={display.toLowerCase() as 'finger' | 'interval' | 'note'}` in ScalesScreen.

---

### Bug 5 — ChordsScreen: Tapping a dimmed root note does nothing

**Root cause:** To be confirmed during implementation. `handleNotePress` only acts when `isRoot === true`, and iterates `voicingRegions` looking for a region whose `frets` set contains the pressed `string-fret` key. The hypothesis is that `voicingRegions[i].frets` doesn't include all root positions, so the lookup finds no match and the voicing index never updates.

**Test (fails before fix):** Render ChordsScreen → capture initial `activeVoicingIndex` → find a root note coordinate that exists in `allNotes` but is NOT in the current active voicing → call `onNotePress(string, fret, true)` on `FretboardViewer` → assert `activeVoicingIndex` changed.

**Fix:** Identified and applied during the implementation step for this bug.

---

### Bug 6 — SettingsScreen: Display SegmentedControl rows non-interactive

**Root cause:** `SegmentedControl`'s container has `flexDirection: 'row'` with `flex: 1` per segment. When placed as the second child of a `justifyContent: 'space-between'` row alongside a text label, the container gets no defined width, causing segments to collapse to 0 width. The visible result is a thin grey bar (the border) — tappable area is effectively zero.

**Test (fails before fix):** Render SettingsScreen → find the "♭" TouchableOpacity in the Note names SegmentedControl → press it → assert `toggleFlats` was called once. (Also: press "♯" — already active — assert `toggleFlats` NOT called again.)

**Fix:** Add a `style` prop to `SegmentedControl` that merges with the container style. In `SettingsScreen`, pass `style={{ flex: 1 }}` (or a fixed `minWidth`) to each SegmentedControl in a settings row so segments get a defined width.

---

## Full Button-Level Coverage (additions per screen)

### ChordsScreen
- Each display mode option (Finger, Interval, Note) → active highlight changes
- `onNotePress` with `isRoot=true` on a root note IN the active voicing → no voicing change (correct no-op)
- `onNotePress` with `isRoot=false` → no state change

### ScalesScreen
- Position multi-select: Pos 1 + Pos 2 both active, "All" deactivated
- Tapping the last active position → reverts to "All"
- Mode picker visible after opening Advanced on a 7-note scale
- Mode selection changes the active mode chip
- Switching from 7-note to 5-note scale collapses Mode picker even if Advanced is open
- Bug 3 and Bug 4 from above

### TriadsScreen
- Each inversion (Root Pos, 1st Inv, 2nd Inv) changes active option in SegmentedControl
- Each string group (1-2-3, 2-3-4, 3-4-5, All strings) changes active ChipPicker option
- Bug 1 and Bug 2 from above

### ArpeggiosScreen
- Each display mode (Interval, Note, Finger) changes active option
- Finger mode renders sweep-order hint text; other modes render the general arpeggio hint

### ProgressionsScreen
- Chord name (e.g. "Cm") renders below each numeral after a key is selected
- Diatonic hint text includes the current key name ("key of C" for default root)

### SettingsScreen
- Bug 6 from above (♭ calls `toggleFlats`; ♯ when already active does not)
- Left-handed option calls `toggleLeftHanded`; Right-handed (already active) does not
- Dark option calls `toggleTheme`; Light (already active per mock) does not
- Capo "+" increases value; "−" decreases; "−" at 0 does not go below 0

---

## Implementation Order

For each screen in this order: ChordsScreen → ScalesScreen → TriadsScreen → ArpeggiosScreen → ProgressionsScreen → SettingsScreen:

1. Write the bug-catching test(s) for that screen
2. Run — confirm they fail (bug verified)
3. Fix the bug
4. Run — confirm they pass
5. Add remaining button-coverage tests for that screen
6. Run full suite — confirm 0 regressions
7. Commit

Final step: run the complete test suite and confirm all tests pass.
