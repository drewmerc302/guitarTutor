# Progressions Screen Redesign

**Date:** 2026-03-13
**Status:** Approved for implementation

---

## Problem

The current Progressions screen has three structural issues:

1. **Inverted hierarchy.** The Circle of Fifths (key selector) sits at the bottom of the screen, below the diatonic chord palette and progression builder that depend on it. Users must scroll past everything they're building just to change the key.
2. **No removal affordance.** Tapping a progression chord card removes it, but nothing on the card communicates this. The interaction is invisible.
3. **Circle consumes the full screen width.** A 300×300 SVG is the dominant visual on the screen, yet it only needs occasional use.

---

## Design

### Layout (top → bottom)

```
┌─────────────────────────────┐
│  Key picker (piano layout)  │  ← card
├─────────────────────────────┤
│  Chords in key of X         │  ← section label
│  I  ii  iii  IV  V  vi  vii°│  ← diatonic palette
├─────────────────────────────┤
│  Progression                │  ← section label
│  [C ✕][F ✕][G ✕][ + ]      │  ← horizontal ScrollView
├─────────────────────────────┤
│  ⬤ Circle of Fifths    ›   │  ← collapsible row
│  (expanded: full circle SVG)│
└─────────────────────────────┘
```

---

### 1. Key Picker

Replaces the Circle of Fifths as the primary key-selection control. Lives in a card (`bgSecondary` background, `borderRadius: 12`, subtle shadow) at the top of the screen, above the diatonic section label.

**Layout:** Two rows inside the card.

**Row 1 — naturals:** 7 chips (`C D E F G A B`), `flexDirection: 'row'`, each chip `flex: 1`, `gap: 3`.

**Row 2 — accidentals:** Same total width as Row 1. Render 7 equal-width slot views (`flex: 1`, `gap: 3`). Slots 0, 1, 3, 4, 5 contain a visible accidental chip; slots 2 and 6 are transparent empty views.

To align accidentals visually between their flanking naturals, apply `marginLeft: slotWidth / 2` to the accidentals container (a right-shift of half a slot). Derive `slotWidth` via `onLayout` on the naturals container: `slotWidth = measuredWidth / 7`. Store the measured width in `naturalRowWidth` state (init `0`). Apply `opacity: 0` to the accidentals row until `naturalRowWidth > 0` to avoid a visible layout jump on first render.

**Worked example (why this is correct):** With a 280px row and 7 natural chips, `slotWidth = 40px`. Natural chip centers: C=20, D=60, E=100, F=140, G=180, A=220, B=260. After shifting the accidentals container by `slotWidth/2 = 20px`, slot 0 starts at x=20, so the C# chip center is at `20 + 20 = 40px` — exactly between C (20px) and D (60px). ✓ Each accidental chip uses `flex: 1` within its slot (same visual width as a natural chip), giving a simplified piano layout where accidentals are the same width as naturals but positioned correctly. This differs from a real piano but matches the app's chip-style aesthetic.

**Accidental slot mapping:**

| Slot | Label (sharp) | Label (flat) | Pitch class | Notes |
|------|--------------|-------------|-------------|-------|
| 0    | C#           | Db          | 1           |       |
| 1    | D#           | Eb          | 3           |       |
| 2    | —            | —           | —           | Empty — E has no accidental |
| 3    | F#           | Gb          | 6           |       |
| 4    | G#           | Ab          | 8           |       |
| 5    | A#           | Bb          | 10          |       |
| 6    | —            | —           | —           | Empty — B has no accidental |

Use `NOTE_NAMES[pitchClass]` or `NOTE_NAMES_FLAT[pitchClass]` for chip labels based on `useFlats`. Pitch-class `1` → `NOTE_NAMES[1]` = `"C#"`, `NOTE_NAMES_FLAT[1]` = `"Db"`, etc.

**`testID` scheme:** Natural chips use `testID={"key-natural-" + pitchClass}` where `pitchClass` is the pitch-class integer of that natural note (C=0, D=2, E=4, F=5, G=7, A=9, B=11). Accidental chips use `testID={"key-accidental-" + pitchClass}` where `pitchClass` is the pitch-class integer of that accidental (C#/Db=1, D#/Eb=3, F#/Gb=6, G#/Ab=8, A#/Bb=10). Suffix is always pitch class, never slot index.

**Active state:** The chip whose pitch class equals `root` fills with `accent` background and white text. Only one chip (natural or accidental) is highlighted at a time — if `root` is an accidental pitch class, no natural chip is highlighted.

**Interaction:** Tapping any chip calls `handleKeySelect(pitchClass)`, which sets `root` and resets `progression` (same behaviour as circle node tap currently).

**`useFlats` changes:** `root` is stored as a pitch-class integer (0–11), so toggling `useFlats` has no effect on `root`. Only the displayed chip labels change. No action is required when `useFlats` toggles.

---

### 2. Diatonic Chord Palette

No structural change from the current implementation.

- Section label: `"Chords in key of [root name]"` — dynamic, using `(useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES)[root]`. Example: `"Chords in key of C"`.
- Remove the existing hint text paragraph (`"These 7 chords all belong to the key of…"`) — the dynamic label replaces it.
- Each button retains the quality-colour bottom border (gold = Major, blue = Minor, red = Dim).
- A button is highlighted (`bgElevated` background, `accent` border and numeral text) when that button's **diatonic position index (0–6)** appears anywhere in the `progression` array. The `progression` stores diatonic position indices, not pitch classes.
- Tapping a button appends that diatonic position index to `progression` (unchanged).

---

### 3. Progression Builder

The progression row is a **horizontal `ScrollView`** (`horizontal={true}`, `showsHorizontalScrollIndicator={false}`). This replaces the current `View` with `flexWrap: 'wrap'` — chords scroll horizontally rather than wrapping.

**Chord cards** (`testID="progression-card"`) — each card shows:
- Roman numeral (top, `textMuted`)
- Chord name (`textPrimary`, bold)
- `ChordDiagram` component

**✕ remove button:** A `TouchableOpacity` with `position: 'absolute'`, `top: 4`, `right: 4`, `testID={"remove-chord-" + pos}`, inside the card. Contains a `✕` `Text` element in `textMuted`. Apply `hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}` for a ~44pt minimum tap area. `accessibilityLabel={"Remove " + noteName + qualitySuffix}`. Tapping calls the existing `removeChordAtPos(pos)` function (no change to the function itself).

**Removing by tapping the card body** is no longer supported. Remove `onPress` from the card `TouchableOpacity`. The outer card element **must remain a `TouchableOpacity`** (not changed to a `View`) so that existing tests using `findAllByType('TouchableOpacity').filter(el => el.props.testID === 'progression-card')` continue to locate cards.

**Placeholder** at the end of the row (retained, with updated empty-state text):
- `progression.length === 0` → `"Tap a chord above"` ← changed from current `"Tap a diatonic above"`
- `progression.length > 0` → `"Add more"` ← unchanged

---

### 4. Circle of Fifths (Collapsible)

A collapsible row below the progression. **Collapsed by default** (`circleExpanded` initialises to `false`).

**Collapsed state:** A single-row `TouchableOpacity` card (`bgSecondary` background, `borderRadius: 10`, `borderWidth: 1`, `borderColor: theme.border`) containing:
- A `●` icon
- Label: `"Circle of Fifths"` in `textPrimary`
- Subtitle: `"Tap to explore key relationships"` in `textMuted`
- A `›` chevron in `textMuted` on the right, with `transform: [{ rotate: '0deg' }]`

Tapping the row calls `toggleCircle()`.

**Expanded state:** Chevron uses `transform: [{ rotate: '90deg' }]` — static transform driven by `circleExpanded` state, no separate animation. The full Circle of Fifths SVG renders below the header row inside the same card. SVG is identical to the current `renderCircleOfFifths()` output — same three-ring layout, same diatonic highlighting logic. Tapping the header row again collapses it.

**Key selection from the circle:** Tapping a major key node in the outer ring calls `handleKeySelect(note)`, which: (1) calls `LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)`, (2) sets `root` to `note`, (3) resets `progression` to `[]`, (4) calls `setCircleExpanded(false)` directly — **not** `toggleCircle()`, which would re-read state and risk double-animation if called back-to-back. The circle collapses immediately after selection so the updated key is visible in the piano picker.

**Expand/collapse animation:** `toggleCircle()` calls `LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)` then flips `circleExpanded`. `handleKeySelect` also calls `LayoutAnimation.configureNext` before `setCircleExpanded(false)` — these are separate call sites, not shared via `toggleCircle`.

In tests, `LayoutAnimation` is already mocked in `jest.setup.ts` (line 23–32) as `{ configureNext: jest.fn(), Presets: { easeInEaseOut: {} } }` — no additional test setup is needed.

On Android in production, `LayoutAnimation` requires `UIManager.setLayoutAnimationEnabledExperimental(true)` at app startup. Add this to `App.tsx` guarded by `Platform.OS === 'android'` if not already present. `UIManager` is also already mocked in `jest.setup.ts` (line 33–35).

---

## State

| Variable          | Type       | Init  | Persisted | Notes |
|------------------|------------|-------|-----------|-------|
| `root`           | `number`   | `0`   | Yes — `usePersistentState('progressions.root', 0)` | |
| `progression`    | `number[]` | `[]`  | No — `useState` | Diatonic position indices |
| `circleExpanded` | `boolean`  | `false` | No — `useState` | |
| `naturalRowWidth`| `number`   | `0`   | No — `useState` | Set via `onLayout` on naturals row |

---

## Component Changes

All changes are in **`src/screens/ProgressionsScreen.tsx`**. No engine changes required.

1. Add `circleExpanded` and `naturalRowWidth` state.
2. Add `toggleCircle()` — calls `LayoutAnimation.configureNext` then flips `circleExpanded`.
3. Update `handleKeySelect` to also set `circleExpanded = false` (preceded by `LayoutAnimation.configureNext`).
4. Add piano key picker UI (naturals row + accidentals row) in a card at the top.
5. Replace progression container (`View` with `flexWrap`) with a horizontal `ScrollView`.
6. Remove `onPress` from progression card (keep `TouchableOpacity` element type and `testID`); add absolutely-positioned ✕ `TouchableOpacity`. Reuse existing `removeChordAtPos(pos)`.
7. Replace always-visible circle section (section label + SVG) with the collapsible row.
8. Update diatonic section label to dynamic `"Chords in key of [root name]"` string.
9. Remove hint text paragraph below diatonic section label.
10. Update empty-state placeholder text from `"Tap a diatonic above"` to `"Tap a chord above"`.
11. Add `Platform.OS === 'android'` guard for `UIManager.setLayoutAnimationEnabledExperimental` in `App.tsx` if not already present.

**Not changing:**
- `renderCircleOfFifths()` SVG function body
- `getChordVoicings` / `ChordDiagram` in progression cards
- `useFlats` / `isDark` integrations
- `RootPicker` not used (piano picker is purpose-built)

---

## Testing

### Tests to delete

| Test name (exact) | Reason |
|---|---|
| `'tapping a progression card removes it'` (line 325) | `onPress` on card removed; ✕ button is the new mechanism |
| `'renders circle of fifths hint text'` (line 61) | Asserts `'Tap the circle to change key'`; hint text removed |

### Tests to update (must expand circle before querying SVG content)

All of the following query the Circle SVG directly on initial render. After the redesign, the SVG is not in the tree when `circleExpanded === false`. Each test must first tap the collapsible header (`testID="circle-collapse-header"`) to expand it before querying SVG content.

| Test name (exact) | Line |
|---|------|
| `'tapping a circle note changes the active key'` | 70 |
| `'circle of fifths fills diatonic notes with quality colors'` | 117 |
| `'circle of fifths shows roman numerals for diatonic notes'` | 127 |
| `'selected key circle has white stroke ring'` | 134 |
| `'tapping a circle note clears active chord previews'` | 142 |
| `'circle of fifths renders middle ring relative minor nodes'` | 270 |
| `'circle of fifths renders inner ring diminished nodes'` | 279 |
| `'circle of fifths middle ring uses minor quality fill'` | 287 |
| `'circle of fifths inner ring uses dim quality fill'` | 295 |

Also update `'tapping a diatonic chord card multiple times appends duplicates'` (line 305): if `testID="progression-card"` is retained on the card container (even without `onPress`), the test still works. Confirm the testID is kept on the outer card `View`/`TouchableOpacity`.

### Tests to add

| Behaviour | Assert |
|---|---|
| Piano natural chip sets root | Tap `testID="key-natural-5"` (F, pitch class 5) → diatonic palette shows "Chords in key of F" |
| Piano accidental chip sets root | Tap `testID="key-accidental-6"` (F#, pitch class 6) → diatonic palette shows "Chords in key of F#" |
| Key change resets progression | Add two chords → tap `testID="key-natural-7"` → progression cards count becomes 0 |
| ✕ removes correct position | Add I, IV, V → find `testID="remove-chord-1"` → tap it → 2 progression cards remain |
| Circle expands on header tap | Tap `testID="circle-collapse-header"` → SVG content (`'Circle of Fifths'` SVG) visible in tree |
| Circle collapses on second tap | Expand then tap header again → SVG hidden |
| Key select from circle collapses it | Expand circle → tap a key node → `circleExpanded` false, root updated |
