# Guitar Tutor — TODO & Feature Ideas

**Last updated:** 2026-02-20

---

## Recently Fixed (2026-02-20)

- ✅ ScalePositionPicker 3+3 grid — uniform `width: 33%` on all 6 buttons; [All/Box1/Box2] / [Box3/Box4/Box5] layout
- ✅ Three-ring Circle of Fifths — outer ring (major keys), middle ring (relative minors, muted blue), inner ring (leading-tone dim, muted red)
- ✅ Progressions repeated chords — tapping diatonic card always appends; long-press on progression card removes it
- ✅ Scale degree fretboard preview — tapping a progression card shows a FretboardViewer with chord tones highlighted in interval mode
- ✅ Favorites removed — FavoritesScreen + useFavorites deleted; all screens cleaned of heart icon/state; TODO updated with future design note
- ✅ Haptic feedback — expo-haptics already wired in all 5 picker/toggle components (Light impact before each selection callback)
- ✅ Scale box wrapping — boxes that would overflow TOTAL_FRETS now wrap backward to positions below baseRootE; all 5 boxes always fit on the neck; boxes renumbered by ascending fret position
- ✅ Triads page auto-scroll — FretboardViewer now centers on the selected triad's fret span (same mechanism as Scales page)
- ✅ Chords barre indicator — removed false barre overlay (was triggering on any 2 notes sharing a fret)
- ✅ Chords extended chord tones — all chord-tone intervals (7th, Sus tone, etc.) are now fully lit via `allChordToneSet`
- ✅ Chords default voicing — dedicated voicing generators for Sus4/Sus2/7th/Maj7/Min7 with open-position shapes sort to nut-closest by default
- ✅ Chords voicing selection — multiple voicings available for all chord types; alternate voicing tap works for Sus and extended types
- ✅ Enharmonic display in ProgressionsScreen — chord names and circle labels already respect ♯/♭ toggle (confirmed no changes needed)
- ✅ Left-handed mode — LH toggle in header, `mx()` mirror in GuitarNeck, ThemeContext + AsyncStorage persistence
- ✅ Capo support — −/C/+ picker in header, visual capo bar + note dimming in GuitarNeck, ThemeContext + AsyncStorage persistence
- ✅ Fretboard range filter (`fretRange` prop) — prop + filtering logic in GuitarNeck/FretboardViewer; picker UI deferred

---

## Completed (from previous sessions)

- ✅ Scale box positions — algorithm now searches all 6 strings (not just low E) when advancing to the next box start, so every box has the correct 2-note-per-string shape
- ✅ Scale box scroll centering — FretboardViewer now centers on the midpoint of the full box range so all notes are visible without scrolling
- ✅ Interactive Circle of Fifths — tapping a note in the circle changes the active key
- ✅ Enharmonic display (C#/Db) — ♯/♭ toggle in header, NotePicker and GuitarNeck respect the setting
- ✅ Integration tests — picker → state → fretboard update assertions for all 4 playable screens
- ✅ Extract `engine/tuning.ts` — STANDARD_TUNING, TOTAL_FRETS, STRING_NAMES live in their own file; notes.ts re-exports for backward compatibility

---

## P0 — Pentatonic Equator Mode (Co-design with Claude)

### Add Pentatonic Equator view to the Scales tab

**What:** Implement John Mayer's "Pentatonic Equator" approach as an alternative
position view alongside the standard Box 1–5 system on the Scales tab.

**Background:** This conversation introduced the idea but the method details need
to be fleshed out with the user before implementation. Resume this conversation
to describe the Pentatonic Equator concept, then design and build the feature.

**Design questions to resolve (start here):**
- How does the Equator system divide/label positions differently from standard boxes?
- Should it replace the box picker UI or sit alongside it as a toggle (e.g. "Boxes / Equator")?
- Does it apply only to Minor Pentatonic, or Major Pent / Blues as well?
- How should the fretboard highlight or annotate the equator concept visually?

**Status:** Not started — needs user to describe the method, then brainstorm session

---

## P0 — Visual Overhaul (Co-design with Claude)

### Visual design brainstorming and prototyping

**What:** The current UI is functional but lacks cohesion. Key pain points:
- Controls are inconsistent in size, orientation, and density across tabs (some are horizontal scrolling lists, some vertical, button sizes vary within and between tabs)
- Advanced settings like "Mode" are presented at the same visual weight as primary controls, adding clutter for average users
- No clear visual hierarchy or consistent spacing/color language across screens
- Opportunity to introduce progressive disclosure (collapse/expand advanced settings like Modes) to serve both casual and power users

**Goal:** Explore UI prototypes collaboratively — brainstorm layouts, try multiple approaches, and converge on a professional, cohesive visual design before implementing across all tabs.

**Approach:** Co-work with Claude using the brainstorming skill to explore options. Consider:
- Unified control style (pill selectors vs segmented controls vs cards)
- Collapsible "Advanced" sections for Modes and other power-user settings
- Consistent spacing grid and button sizing across all 5 tabs
- Whether settings (flats, left-hand, capo) belong in a dedicated Settings screen vs the header
- Interactive HTML prototypes to preview layout options before committing to code

**Status:** Not started — needs brainstorming session

---

## P1 — High Value Improvements

### Responsive layout for iPad, tablet, and web

**What:** The app currently targets iPhone portrait. It runs on iPadOS and web via Expo's web
support, but the layout does not adapt to wider screens — controls have excess whitespace,
and there is no multi-column arrangement that takes advantage of the extra real estate.

**Goal:** Make the app feel native and polished on iPadOS, Android tablets, and desktop
browsers, without breaking the existing iPhone experience.

**Surfaces to support:**
- iPhone (portrait primary, landscape secondary) — current baseline
- iPadOS (portrait + landscape, split-screen/Stage Manager aware)
- Android tablet (similar to iPad)
- Web/PWA in a mobile browser (375–430 px wide) — already close
- Web in a desktop browser (1024 px+) — needs max-width container and column layout

**Design questions to resolve:**
- Should wider layouts use a two-column arrangement (controls left, fretboard right), or
  a single wider column with larger controls?
- Should the Circle of Fifths and fretboard scale up proportionally or cap at a max size?
- Do the header toggles (flats, left-hand, capo) move into a sidebar or settings panel on
  iPad/desktop, or stay in the header?
- Should landscape iPhone get a different layout from portrait, or the same scrollable column?

**Implementation notes:**
- Use `useWindowDimensions` breakpoints (e.g. `width >= 768` = tablet/desktop mode)
- Wrap content in a `maxWidth` container centered on large screens
- Picker rows (NotePicker, TypePicker) may need to switch from horizontal scroll to a
  wrapping grid on wider screens
- SVG components (fretboard, Circle of Fifths) already use `useWindowDimensions` — cap at
  a sensible max (e.g. 600 px) rather than filling the full iPad width

**Status:** Not started — needs brainstorming session

---

*(All other P1 items complete — see Recently Fixed above)*

---

## P2 — Features That Add Meaningful Functionality

### Scale practice metronome with note highlighting (brainstorm needed)

**What:** A simple metronome on the Scales tab that steps through the notes of the
selected scale box in practice order — lowest note on the lowest string up to the
highest note on the highest string, then back down — highlighting each note on the
fretboard in sync with the beat.

**Goal:** Give beginners a visual and rhythmic guide for practicing scale patterns
in time, without needing an external metronome app.

**Design questions to resolve:**
- BPM input — simple −/+ stepper? Tap-tempo button? Slider?
- Play/pause control placement relative to the fretboard
- Should the highlighted note pulse or change color? Should the active dot grow?
- Up-only, down-only, or up-then-down as selectable modes?
- Does it loop continuously or play one pass and stop?
- Should it respect the selected Box position filter, or always play the full scale?
- Implementation: `setInterval` + React state, or Expo AV / `react-native-sound` for a click track?

**Status:** Not started — needs brainstorming session

---

### Diagonal scales spanning 2 octaves (brainstorm needed)

**What:** An alternative scale view on the Scales tab that shows diagonal/positional
patterns spanning 2 octaves across the neck, rather than the standard vertical box
positions. Common in jazz and advanced rock playing (e.g. 3-notes-per-string patterns).

**Design questions to resolve:**
- Should this be a new "Pattern" option alongside Boxes (e.g. "Boxes / Diagonal")?
- Starting string and direction — always low E upward, or user-selectable?
- How many 2-octave patterns exist per scale? (Typically 7 starting points for a 7-note scale)
- How does the ScalePositionPicker UI adapt — different labels (Pattern 1–7 vs Box 1–5)?
- Visual distinction from box positions — different highlight color or shape?
- Does it apply to pentatonic (fewer notes per string) as well as 7-note scales?

**Status:** Not started — needs brainstorming session

---

*(All implemented P2 items complete — see Recently Fixed above)*

### Favorites / Bookmarks — needs full design (future)

**What:** Let players save specific root + type + display mode combinations to a quick-access list.

**Status:** Previous half-implementation removed (broken navigation). Needs a fresh brainstorm before re-implementing.

**Design questions to resolve:**
- How should tapping a favourite restore tab + state (deep-link navigation vs shared state context)?
- Should favourites be global (AsyncStorage) or session-only?
- UI: dedicated tab vs overlay sheet vs home screen widget?

---

### 10a. Scales tab — scale tab notation display (brainstorm / design needed)

**What:** For any selected scale, provide an option to display a traditional guitar tab view showing the notes of the scale ascending/descending string by string. Useful for practice runs.

**Design challenges on portrait mobile:**
- Tab notation is wide; a single-position box is manageable but a full-neck run can span many columns
- Consider showing one box position at a time (matching the selected Box filter)
- Options: horizontal scroll within a fixed-height tab view; or a compact "block tab" showing just the fret numbers per string in a grid

**Files:** New component `src/components/ScaleTab.tsx`, `src/screens/ScalesScreen.tsx`

**What to do (once design is decided):**
- Add a "Tab" option to the Display toggle (alongside Interval / Note / Finger)
- When "Tab" is active, render a tab staff instead of the fretboard SVG
- Show fret numbers for each note in left-to-right, low-E-to-high-E order for the selected position

---

### 6. Chord transition helper

**What:** Show the finger movement between two chord shapes. Select chord A and chord B; GuitarNeck highlights shared finger positions in green and moving fingers in orange.

**Files:** New feature in `ChordsScreen.tsx` or a new `ChordCompareScreen.tsx`

**What to do:**
- Add a "Compare" mode to ChordsScreen: a secondary chord picker appears
- Compute set intersection of fret positions between voicing A and voicing B
- Pass `activeNoteSet` with color overrides to GuitarNeck (may require extending the color prop on individual notes)

---

### 7. Scale degree highlighting in Progressions

**What:** When a chord card is selected in the Progressions tab, show which scale degrees it contains relative to the key on a small fretboard preview.

**Files:** `src/screens/ProgressionsScreen.tsx`

**What to do:**
- When a chord is active, compute the chord tones relative to the key root (e.g., for V chord in C: G=5, B=7, D=2)
- Show a small `FretboardViewer` below the ChordPreview in interval mode, highlighting only those scale degree positions

---

### 8. Haptic feedback on note selection

**What:** A subtle haptic tap when pressing note picker buttons makes the app feel more tactile and native on iOS/Android.

**Files:** All picker components + install `expo-haptics`

**What to do:**
- `npx expo install expo-haptics`
- In `NotePicker`, `TypePicker`, `DisplayToggle`, `StringGroupPicker`, `ScalePositionPicker`: call `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)` in `onPress` handlers
- Wrap in a platform check so it's a no-op on web

---

## P3 — Polish & Infrastructure

### Capo control UX — make capo indicator self-explanatory

**What:** The current capo control in the header (`− C +`) is not discoverable. There is no
label or icon indicating that `C` stands for capo, and the `−`/`+` buttons look like they
could control anything. Users tapping the `C` label itself get no response since it is a
display-only element.

**Goal:** Make it immediately obvious that the control sets a capo, and make the active/
inactive states clearly distinct.

**Design options to consider:**
- Replace the bare `C` label with a capo icon (e.g. a clamp/bar icon from MaterialCommunityIcons)
  alongside the fret number when active
- Show a tooltip or brief label below the control on first use (e.g. "Capo: off")
- Use a modal or bottom sheet picker (fret 0–7) instead of `−`/`+` steppers, with a clear
  "Capo" heading
- Increase the `−`/`+` tap target size (currently only 6 px padding — easy to miss)
- When capo > 0, show `Capo 3` style text instead of just `C3` so the meaning is clear

**Files:** `App.tsx` (capo control in `headerRight`), possibly `src/theme/ThemeContext.tsx`

**Status:** Not started — pick an approach before implementing

---

### Fretboard nut spacing — remove gap between string names and nut

**What:** The gap between the string name labels (E A D G B e) and the nut line is currently
as wide as a full fret interval. The nut should sit flush against the string names with only
a small visual margin — the way a real guitar neck looks when viewed from the headstock end.

**Files:** `src/components/GuitarNeck.tsx` (and `FretboardViewer.tsx` if it owns the label
area)

**What to do:**
- Identify the layout constant that determines the offset of fret 0 (the nut) from the
  left edge of the SVG
- Reduce the label-column width / left-padding so the nut line is near-flush with the
  string name text, leaving only a small breathing gap (e.g. 4–6 px) rather than a full
  fret width
- Verify the fix in both standard and left-handed orientations

**Status:** Not started

---

### 9. Persist user preferences with AsyncStorage

**What:** Remember the last-used root, type, display mode, and ♯/♭ preference across app restarts.

**Files:** `src/theme/ThemeContext.tsx`, individual screens or a new `usePersistentState` hook

**Dependencies:** `@react-native-async-storage/async-storage`

---

### 10. Chord quality color coding in Progressions

**What:** The 7 diatonic chord cards currently use a single style. Color-coding by quality (Major=gold, Minor=blue, Dim=red) would make patterns more scannable.

**Files:** `src/screens/ProgressionsScreen.tsx`, `src/theme/colors.ts`

---

### 11. Arpeggio pattern display (sweep picking order)

**What:** Arpeggios tab currently shows all arpeggio tones on the full neck. Adding a numbered sweep-picking order (1, 2, 3... across strings from lowest to highest) in "Finger" mode would be more useful for technique practice.

**Files:** `src/engine/arpeggios.ts`, `src/screens/ArpeggiosScreen.tsx`

---

### 12. Integration tests for ProgressionsScreen circle interaction

**What:** The Circle of Fifths `G` elements use SVG's `onPress` prop which is not accessible via `findAllByType('TouchableOpacity')` in react-test-renderer. Testing circle interaction requires either:
- A test wrapper that renders with a real SVG touch system, or
- Extracting the key-change logic into a separate testable function and testing it in isolation

**Files:** `src/screens/__tests__/ProgressionsScreen.test.tsx`

---

## Out of Scope for v1

- Audio playback (sample-based chord/note playback)
- Alternate tunings UI (DADGAD, open G, etc.) — engine/tuning.ts is now ready for this
- Custom chord progressions beyond diatonic
- Sheet music / tab notation export
- Metronome / practice timer
