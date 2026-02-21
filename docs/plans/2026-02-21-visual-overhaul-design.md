# Visual Overhaul — Design Document
**Date:** 2026-02-21
**Status:** Approved — ready for implementation planning

---

## Context

This design was produced after two prerequisite steps:
- **UX audit** (`docs/ux-audit-2026-02-21.md`) — beginner persona walkthrough identifying top pain points
- **Palette exploration** — six candidate palettes reviewed on device; **Modern iOS** selected as the target

The overhaul scope is a **full structural redesign**: new control system, header cleanup, Settings screen, progressive disclosure of advanced controls, and tab reordering.

---

## 1. Header & Navigation

### Header
Post-overhaul the header has exactly two controls on the right:

```
GUITAR TUTOR                          📖  ⚙
```

- **📖** (`book-open-variant`) — opens Glossary modal (unchanged)
- **⚙** (`cog-outline`) — opens Settings modal

Everything previously in the header (LH, Capo, ♯/♭, theme) moves into Settings. Both icons use `textMuted` at rest.

### Tab bar
New order (frequency-of-use rationale):

| Position | Tab | Icon |
|---|---|---|
| 1 | Chords | `guitar-acoustic` |
| 2 | Scales | `music-note-eighth` |
| 3 | Progressions | `music-note-plus` |
| 4 | Arpeggios | `music` |
| 5 | Triads | `triangle-outline` |

Tab bar height: 80 pt, labels visible (`tabBarShowLabel: true`), active tint `theme.accent`.

---

## 2. Settings Screen

A new `SettingsScreen` component, opened from the ⚙ header icon as a `pageSheet` modal. iOS-style full-screen with inset grouped card rows.

### Structure

```
SETTINGS                                       ✕

DISPLAY
┌─────────────────────────────────────────────┐
│ Note names                    [ ♯ | ♭ ]    │
│─────────────────────────────────────────────│
│ Hand orientation   [ Right-handed | Left ]  │
│─────────────────────────────────────────────│
│ Theme                       [ Light | Dark ]│
└─────────────────────────────────────────────┘

PLAYBACK
┌─────────────────────────────────────────────┐
│ Capo                        0 frets   −   + │
└─────────────────────────────────────────────┘

ABOUT
┌─────────────────────────────────────────────┐
│ Glossary                                  › │
└─────────────────────────────────────────────┘
```

### Row specifications
- **Note names:** inline `SegmentedControl` (♯ / ♭) — replaces `toggleFlats`
- **Hand orientation:** inline `SegmentedControl` (Right-handed / Left-handed) — replaces `toggleLeftHanded`
- **Theme:** inline `SegmentedControl` (Light / Dark) — replaces `toggleTheme`
- **Capo:** label + current value text + − / + `TouchableOpacity` steppers; range 0–7
- **Glossary:** tappable row with `›` chevron; opens existing `GlossaryScreen` modal

### Styling
- Section headers: 11 pt, weight 600, uppercase, letter-spaced, `textMuted`
- Row height: 44 pt minimum
- Card background: `bgSecondary`
- Separator: `StyleSheet.hairlineWidth`, `border` color
- Card corner radius: 10 pt

### State
All values read from and write to `ThemeContext` — the same hooks as today. No new state required.

---

## 3. Control System

Two components replace the current ad-hoc mix of `TypePicker`, `DisplayToggle`, and one-off pickers.

### SegmentedControl
For **2–4 fixed options** where all fit in one row.

```
┌──────────┬──────────┬──────────┐
│  Finger  │ Interval │   Note   │
└──────────┴──────────┴──────────┘
```

- Continuous pill group, full content width
- 1 px `border` around the group, no internal gaps between segments
- **Active segment:** `accent` background, `dotText` label text
- **Inactive segment:** `bgTertiary` background, `textPrimary` label text
- Height: 36 pt
- Font: 13 pt, weight 600

**Replaces:** `DisplayToggle`, Inversion picker in Triads, Note names / Hand / Theme rows in Settings

### ChipPicker
For **larger sets** requiring horizontal scroll.

```
╭───────╮  ╭──────────╮  ╭───────╮  ╭────────╮  →
│   C   │  │  Major   │  │ Minor │  │  Maj7  │
╰───────╯  ╰──────────╯  ╰───────╯  ╰────────╯
```

- Individual rounded-rect pills, corner radius 8 pt
- Padding: 10 pt horizontal, 6 pt vertical
- **Active:** `accent` background, `dotText` label, no border
- **Inactive:** `bgTertiary` background, `textSecondary` label, 1 px `border`
- Horizontal `ScrollView`, no scroll indicator, chip gap 6 pt
- Chip height: 34 pt
- Font: 13 pt, weight 600

**Replaces:** `TypePicker`, `NotePicker`, `ScalePositionPicker`, `StringGroupPicker`

### Migration map

| Current component | New component |
|---|---|
| `NotePicker` | `ChipPicker` |
| `TypePicker` | `ChipPicker` |
| `DisplayToggle` | `SegmentedControl` |
| `ScalePositionPicker` | `ChipPicker` |
| `StringGroupPicker` | `ChipPicker` (inside Advanced section) |
| Inversion `TypePicker` in Triads | `SegmentedControl` (inside Advanced section) |

---

## 4. Per-Tab Changes

### Section labels (all tabs)
Standardise to: 12 pt, weight 600, `textSecondary`, `marginTop: 20`, `marginBottom: 6`.

### Chords
No structural change. Stack: Root (ChipPicker) → Type (ChipPicker) → Display (SegmentedControl) → hint → fretboard → voicing label.

### Scales
Progressive disclosure for Mode picker.

**Default (collapsed):**
```
Root → Type → Display → Position → [▸ Advanced] → fretboard
```

**Expanded:**
```
Root → Type → Display → Position → [▾ Advanced]
  Mode (ChipPicker)
→ fretboard
```

- `Advanced` row: `textMuted` label, `chevron-right` icon rotates 90° on expand
- Animated with `LayoutAnimation.configureNext` for smooth height change
- Mode picker only rendered when `is7Note` is true (same condition as today)
- Expansion state: session-local `useState`, not persisted

### Progressions
Visual polish only. Apply new spacing, ChipPicker and SegmentedControl styles. No layout changes.

### Arpeggios
No structural change. Stack: Root (ChipPicker) → Type (ChipPicker) → Display (SegmentedControl) → hint → fretboard.

### Triads
Progressive disclosure for String Group and Inversion pickers.

**Default (collapsed):**
```
Root → Type → Display → [▸ Advanced] → fretboard
```

**Expanded:**
```
Root → Type → Display → [▾ Advanced]
  Strings (ChipPicker)
  Inversion (SegmentedControl)
→ fretboard
```

- Same expand/collapse mechanics as Scales Advanced section
- Expansion state: session-local `useState`, not persisted

---

## 5. Typography & Spacing

### Type scale

| Role | Size | Weight | Color |
|---|---|---|---|
| Screen title | 28 pt | 700 | `textPrimary` |
| Section label | 12 pt | 600 | `textSecondary` |
| Chip / segment label | 13 pt | 600 | active: `dotText`, inactive: `textSecondary` |
| Hint text | 12 pt | 400 | `textMuted` |
| Settings row label | 15 pt | 400 | `textPrimary` |
| Settings section header | 11 pt | 600 | `textMuted` |
| Header title | 15 pt | 600 | `accent` |

Font family: system default (SF Pro on iOS) — no custom fonts.

### Spacing grid (8 pt base)

| Context | Value |
|---|---|
| Screen horizontal padding | 16 pt |
| Section label → control gap (`marginBottom`) | 6 pt |
| Control → next section label (`marginTop` on label) | 20 pt |
| Screen bottom padding | 32 pt |
| Chip gap in ChipPicker | 6 pt |
| Settings row height (min) | 44 pt |

### Colour application

| Element | Token | Modern iOS dark | Modern iOS light |
|---|---|---|---|
| Screen background | `bgPrimary` | `#000000` | `#f2f2f7` |
| Header / tab bar | `bgSecondary` | `#1c1c1e` | `#ffffff` |
| Chip inactive bg | `bgTertiary` | `#2c2c2e` | `#f2f2f7` |
| Chip / segment active bg | `accent` | `#0a84ff` | `#007aff` |
| Settings card bg | `bgSecondary` | `#1c1c1e` | `#ffffff` |
| Settings separator | `border` | `#38383a` | `#c6c6c8` |
| Advanced row bg | `bgTertiary` | `#2c2c2e` | `#f2f2f7` |

Fretboard note-dot colours are **unchanged** — they are perceptually tuned independently of the UI chrome.

---

## 6. Files to Create / Modify

### New files
- `src/components/SegmentedControl.tsx`
- `src/components/ChipPicker.tsx`
- `src/screens/SettingsScreen.tsx`

### Modified files
- `App.tsx` — remove header controls, add ⚙ button, reorder tabs, add Settings modal
- `src/theme/ThemeContext.tsx` — remove unused `lightTheme` import (now comes from PALETTES)
- `src/screens/ChordsScreen.tsx` — swap `TypePicker` → `ChipPicker`, `DisplayToggle` → `SegmentedControl`, update label styles
- `src/screens/ScalesScreen.tsx` — as above + add Advanced collapsible section for Mode
- `src/screens/ProgressionsScreen.tsx` — visual polish only, update label styles
- `src/screens/ArpeggiosScreen.tsx` — swap components, update label styles
- `src/screens/TriadsScreen.tsx` — swap components + add Advanced collapsible section for Strings/Inversion

### Deleted files
- `src/components/TypePicker.tsx` — fully replaced by `ChipPicker`
- `src/components/DisplayToggle.tsx` — fully replaced by `SegmentedControl`
- `src/components/NotePicker.tsx` — fully replaced by `ChipPicker`
- `src/components/StringGroupPicker.tsx` — fully replaced by `ChipPicker` inside Advanced section

### Component index
`src/components/index.ts` updated to export `SegmentedControl` and `ChipPicker`, remove deleted exports.

---

## 7. What Is Not Changing

- Fretboard rendering (`GuitarNeck.tsx`, `FretboardViewer.tsx`) — no changes
- Engine layer (`src/engine/`) — no changes
- `GlossaryScreen.tsx` — no changes (already implemented)
- `ChordDiagram.tsx`, `ScalePositionPicker.tsx` display logic — styling only
- `usePersistentState` hook — no changes
- All 179 existing tests must continue to pass; new tests needed for `SegmentedControl`, `ChipPicker`, `SettingsScreen`
