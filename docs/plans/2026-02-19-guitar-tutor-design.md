# Guitar Tutor App — Design Document

**Date:** 2026-02-19
**Status:** Approved
**Implementation Status:** Substantially complete — see [TODO.md](../TODO.md) for remaining items

## Implementation Status Summary

| Area | Status | Notes |
|------|--------|-------|
| Music theory engine | ✅ Complete | All 10 modules implemented and tested |
| Theme system (light/dark) | ✅ Complete | System preference + manual toggle |
| GuitarNeck SVG component | ✅ Complete | All display modes, voicing highlight, box highlight |
| FretboardViewer (scrollable) | ✅ Complete | Auto-scrolls on narrow screens |
| NotePicker | ✅ Complete | 12-note chromatic selector with accessibility |
| TypePicker | ✅ Complete | Horizontal scroll pill selector |
| DisplayToggle | ✅ Complete | Configurable mode segmented control |
| ChordPreview (mini diagram) | ✅ Complete | Fret offset, muted strings, finger numbers |
| StringGroupPicker | ✅ Complete | All / 1-2-3 / 2-3-4 / 3-4-5 / 4-5-6 |
| ScalePositionPicker | ✅ Complete | Multi-select with fret range labels |
| ErrorBoundary | ✅ Complete | Wraps all 5 tab screens |
| Chords tab | ✅ Complete | All voicings, promote via tap, Finger/Interval/Note |
| Scales tab | ✅ Complete | All modes, 5 box positions, box highlights |
| Progressions tab | ✅ Complete | Diatonic chords, interactive Circle of Fifths |
| Triads tab | ✅ Complete | All qualities, inversions, string groups |
| Arpeggios tab | ✅ Complete | All 8 types, Interval/Note display |
| Navigation + tab icons | ✅ Complete | MaterialCommunityIcons, header theme toggle |
| Accessibility | ✅ Complete | accessibilityRole + accessibilityLabel throughout |
| React.memo optimization | ✅ Complete | GuitarNeck, ChordPreview, FretboardViewer |
| Engine unit tests | ✅ Complete | 134 tests across all engine + UI modules |
| Integration tests | ✅ Complete | Picker→state→highlight assertions on all 4 playable screens |
| Enharmonic display (C#/Db) | ✅ Complete | ♯/♭ toggle in header; NotePicker + GuitarNeck use flat names |
| engine/tuning.ts separation | ✅ Complete | STANDARD_TUNING, TOTAL_FRETS, STRING_NAMES in tuning.ts |

## Overview

A cross-platform guitar reference app (iOS, iPadOS, Mac, Android, Web) that helps players visualize chords, scales, progressions, triads, and arpeggios on an interactive guitar fretboard.

## Target Platforms

iOS, iPadOS, macOS, Android, Web — all from a single codebase.

## Technology Stack

- **React Native + Expo** (managed workflow) — single codebase for all platforms
- **React Native Web** — web target via Expo
- **TypeScript** throughout
- **react-native-svg** — SVG-based guitar neck rendering
- **React Navigation** — bottom tab navigator
- **Jest** — testing

## Core Decisions

- **Standard tuning only (EADGBE)** for v1. Data model supports alternate tunings for future extension.
- **Full neck always visible** (horizontal orientation, scrollable if needed).
- **All chord voicings shown simultaneously** — primary voicing bold, alternates greyed. Tapping a greyed root promotes that voicing.
- **No audio in v1** — data model outputs structured note data suitable for a future audio module.
- **Light and dark theme** — follows system preference, manual toggle available.

## Music Theory Engine

Pure TypeScript library with zero UI dependencies. All music concepts are represented as interval arrays from a root note.

### Note Representation

- Notes as integers 0–11 (C=0, C#=1, D=2, ... B=11)
- Enharmonic display support (C#/Db)
- Tuning = array of 6 note values, e.g. `[E2, A2, D3, G3, B3, E4]`

### Interval-Based Definitions

All chords, scales, modes, triads, and arpeggios defined as interval arrays:

- Major chord: `[0, 4, 7]`
- Minor pentatonic: `[0, 3, 5, 7, 10]`
- Dorian mode: `[0, 2, 3, 5, 7, 9, 10]`

Given root + interval pattern + tuning → compute active (string, fret) pairs. This single computation powers all 5 tabs.

### Voicing System

- Chord voicings are specific (string, fret) combinations for a given chord
- Each voicing has a priority; most common open/barre chord is primary
- All voicings are computed and returned for display

### Triad System

- Triads organized by string group (1-2-3, 2-3-4, 3-4-5, 4-5-6)
- Supports root position, 1st inversion, 2nd inversion
- Uses the same interval engine

## UI Design

### Navigation

Bottom tab bar with 5 tabs: **Chords | Scales | Progressions | Triads | Arpeggios**

### Shared Layout Pattern

Every tab follows a consistent structure:

1. **Selector row** — note picker (12 chromatic notes)
2. **Type picker** — context-specific (chord family, scale type, etc.)
3. **Display mode toggle** — Finger (1-2-3-4) / Interval (R-3-5) / Note name (C-E-G)
4. **Guitar neck** — full horizontal fretboard, SVG-rendered, active notes as colored dots with labels

### Shared Guitar Neck Component

Single reusable `<GuitarNeck />` SVG component accepting:
- `activeNotes`: array of `{string, fret, label, style}`
- `labelMode`: `"finger" | "interval" | "note"`
- `onNotePress`: callback for interactivity

### Tab Details

**Chords:** ✅ Complete
- Note picker + chord family picker (Major, Minor, 7th, Maj7, Min7, Dim, Aug, Sus2, Sus4, Dim7, Min7b5, 9th)
- Display mode toggle (Finger / Interval / Note)
- All voicings shown; primary bold, alternates greyed (0.2 opacity)
- Tap greyed root → promotes that voicing to bold
- 5 CAGED shapes for Major, 3 shapes for Minor, dedicated shapes for all other types

**Scales:** ✅ Complete
- Note picker + scale type picker (Major, Natural Minor, Harmonic Minor, Melodic Minor, Major Pentatonic, Minor Pentatonic, Blues)
- Mode selector (Ionian–Locrian) — shown only for 7-note scales
- Display mode toggle (Interval / Note — no Finger mode)
- Root notes visually distinguished (slightly larger dot)
- ScalePositionPicker: multi-select 5 box positions with fret ranges; "All" shows full neck

**Progressions:** ✅ Complete
- Note picker (selects key)
- Displays diatonic chords as roman numerals: I, ii, iii, IV, V, vi, vii°
- Tapping a chord shows inline ChordPreview (mini fretboard diagram with finger numbers)
- Circle of Fifths is interactive — tapping any note changes the active key (and clears open chord previews)

**Triads:** ✅ Complete
- Note picker + quality picker (Major, Minor, Dim, Aug)
- String group selector (All, 1-2-3, 2-3-4, 3-4-5, 4-5-6)
- Inversion picker (Root, 1st Inv, 2nd Inv)
- Display mode toggle (Finger / Interval / Note)
- Neck highlights all playable triad shapes for the selected string groups and inversion

**Arpeggios:** ✅ Complete
- Note picker + arpeggio type picker (Major, Minor, Dom7, Maj7, Min7, Dim7, Min7b5, Aug)
- Display mode toggle (Interval / Note — no Finger mode)
- Neck highlights arpeggio tones across full neck with interval-based coloring

## Project Structure

```
src/
  engine/              # Pure music theory (zero UI dependencies)
    notes.ts           # ✅ NOTE_NAMES, STANDARD_TUNING, noteValue()
    intervals.ts       # ✅ INTERVAL_NAMES, intervalFromRoot()
    fretboard.ts       # ✅ getNotesOnFretboard() — core function for all 5 tabs
    fingers.ts         # ✅ assignFingers() algorithm
    chords.ts          # ✅ CHORD_TYPES, CAGED voicings, all 12 chord type generators
    scales.ts          # ✅ SCALE_TYPES, mode rotation, 5-position box system
    triads.ts          # ✅ TRIAD_TYPES, inversions, multi-group computation
    arpeggios.ts       # ✅ ARP_TYPES (8 types)
    progressions.ts    # ✅ getDiatonicChords(), CIRCLE_OF_FIFTHS
    tuning.ts          # ✅ STANDARD_TUNING, TOTAL_FRETS, STRING_NAMES (re-exported from notes.ts for compat)
    __tests__/         # ✅ Unit tests for all engine modules
  components/
    GuitarNeck.tsx          # ✅ Shared SVG fretboard (React.memo)
    FretboardViewer.tsx     # ✅ Scrollable wrapper for narrow screens (React.memo)
    NotePicker.tsx          # ✅ 12-note chromatic selector with accessibility
    TypePicker.tsx          # ✅ Horizontal scroll pill selector with accessibility
    DisplayToggle.tsx       # ✅ Segmented control with accessibility
    ChordPreview.tsx        # ✅ Mini chord diagram for Progressions tab (React.memo)
    StringGroupPicker.tsx   # ✅ String group selector with accessibility
    ScalePositionPicker.tsx # ✅ Box position multi-selector with accessibility
    ErrorBoundary.tsx       # ✅ Class component error boundary
    index.ts                # ✅ Barrel export
    __tests__/              # ✅ Component render tests
  screens/
    ChordsScreen.tsx        # ✅ Complete
    ScalesScreen.tsx        # ✅ Complete
    ProgressionsScreen.tsx  # ✅ Complete — Circle of Fifths interactive
    TriadsScreen.tsx        # ✅ Complete
    ArpeggiosScreen.tsx     # ✅ Complete
    __tests__/              # ✅ Render tests + interaction tests (picker→state→highlight)
  theme/
    colors.ts          # ✅ Light/dark theme colors, getNoteColor()
    ThemeContext.tsx   # ✅ System preference + manual toggle
  App.tsx              # ✅ Bottom tabs, MaterialCommunityIcons, ErrorBoundary wrappers
```

## Theme Support

- Light and dark modes
- Follows system preference by default
- Manual toggle via settings gear or header button
- Theme applied via React context

## Future Extensibility

- **Audio playback:** Engine already outputs structured pitch data; add a sampler module
- **Alternate tunings:** Swap tuning array in `tuning.ts`; add UI picker
- **Custom chord progressions:** Allow user-defined progressions beyond diatonic

## Testing Strategy

- **Engine:** ✅ Unit tests — given root + pattern, verify exact fret positions
- **Components:** ✅ Render tests for all 8 components (7 test suites)
- **Screens:** ✅ Render tests for all 5 screens; ✅ interaction tests (picker→state→highlight) for 4 screens; 142 tests total passing
