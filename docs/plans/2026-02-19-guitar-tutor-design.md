# Guitar Tutor App — Design Document

**Date:** 2026-02-19
**Status:** Approved

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

**Chords:**
- Note picker + chord family picker (Major, Minor, 7th, Maj7, Min7, Dim, Aug, Sus2, Sus4, etc.)
- Display mode toggle
- All voicings shown; primary bold, alternates greyed
- Tap greyed root → promotes that voicing to bold

**Scales:**
- Note picker + scale type picker (Major, Minor, Harmonic Minor, Melodic Minor, Pentatonics, Blues, etc.)
- Mode selector (Ionian–Locrian) when applicable
- Display mode toggle
- Root notes visually distinguished (larger or different color)

**Progressions:**
- Note picker (selects key)
- Displays diatonic chords as roman numerals: I, ii, iii, IV, V, vi, vii°
- Tapping a chord shows inline preview (small fretboard diagram)
- Circle of fifths visualization as secondary view

**Triads:**
- Note picker + quality picker (Major, Minor, Dim, Aug)
- String group selector (1-2-3, 2-3-4, 3-4-5, 4-5-6, All)
- Inversion picker (Root, 1st, 2nd)
- Neck highlights triad shapes on selected string groups

**Arpeggios:**
- Note picker + arpeggio type picker (Major, Minor, Dom7, Maj7, Min7, etc.)
- Display mode toggle
- Neck highlights arpeggio tones across full neck

## Project Structure

```
src/
  engine/              # Pure music theory (zero UI dependencies)
    notes.ts           # Note representation, enharmonics
    intervals.ts       # Interval calculations
    chords.ts          # Chord definitions & voicing computation
    scales.ts          # Scale/mode definitions
    triads.ts          # Triad shapes by string group + inversion
    arpeggios.ts       # Arpeggio patterns
    progressions.ts    # Diatonic chord progressions, circle of fifths
    tuning.ts          # Tuning definitions (standard, extensible)
  components/
    GuitarNeck.tsx     # Shared SVG fretboard component
    NotePicker.tsx     # Reusable 12-note selector
    TypePicker.tsx     # Reusable type/family selector
    DisplayToggle.tsx  # Finger / Interval / Note toggle
    ChordPreview.tsx   # Small inline chord diagram for Progressions tab
  screens/
    ChordsScreen.tsx
    ScalesScreen.tsx
    ProgressionsScreen.tsx
    TriadsScreen.tsx
    ArpeggiosScreen.tsx
  theme/
    colors.ts          # Light/dark theme color definitions
    ThemeContext.tsx    # Theme toggle provider
  App.tsx              # Entry point, navigation setup
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

- **Engine:** Unit tests — given root + pattern, verify exact fret positions
- **Components:** Snapshot tests for GuitarNeck at key states
- **Screens:** Integration tests verifying picker → neck updates
