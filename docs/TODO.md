# Guitar Tutor — TODO & Feature Ideas

**Last updated:** 2026-02-21 (session 2)

---

## Bugs — Found 2026-02-21

These are confirmed defects. No design work needed — just fix them.

| # | Screen | Bug |
|---|--------|-----|
| 1 | Triads | **2nd Inv blank fretboard** — Strings 1-2-3 + "2nd Inv" shows empty neck between frets 5–10; the triad actually starts at fret 12 but the scroll target points to the wrong region |
| 2 | Triads | **All Strings defaults to 8th fret** — entering the tab with "All Strings" selected scrolls to the 8th-fret root note instead of the nut; should always default to showing the nut end |
| 3 | Scales | **Advanced section unresponsive** — after selecting root A → Minor Pentatonic → Pos 1, tapping "Advanced" does nothing (LayoutAnimation state likely not resetting on position change) |
| 4 | Scales | **Note/Interval display wipes fretboard labels** — switching to Note or Interval removes all dot labels; navigating away and back does not restore them; requires app kill |
| 5 | Chords | **Dimmed root note unresponsive** — e.g. C Maj7: the greyed-out root on the 5th fret does nothing when tapped (should cycle voicings or show info) |
| 6 | Settings | **Display section rows non-interactive** — all three rows under "Display" (Note names, Hand, Theme) show a grey bar at the end and do nothing when tapped; SegmentedControl likely not rendering correctly in that context |

---

## Roadmap — Next Steps by Proximity to Task

### Ready to code — no design work needed

✅ **All items in this category are complete** (as of 2026-02-21). Bugs table above contains new ready-to-code items.

| Item | Status |
|---|---|
| **Fretboard nut spacing** — nut sits a full fret-width from string names | ✅ Done — `5c612d4` |
| **Progressions key picker** — remove redundant 12-note selector (circle does the same job) | ✅ Done — `eda2379` |
| **Chord quality color coding** — color diatonic buttons Major/Minor/Dim | ✅ Done (pre-existing) |
| **Arpeggio sweep order** — number notes in Finger mode | ✅ Done — `b8092b1` |
| **Persist user preferences** — remember root/type/display across restarts | ✅ Done — `346615b` |
| **Integration tests** — Circle of Fifths SVG press untestable | ✅ Done — engine-level tests added |

---

### Ready to start — needs a brainstorm first, but no prior decision required

These are well-defined enough to brainstorm in a single session and then implement.

| Item | Brainstorm focus |
|---|---|
| **Capo control UX** — `C` label not discoverable, tiny tap targets | Pick: icon, modal picker, or label change |
| **Common progression presets** — I–IV–V, ii–V–I, etc. auto-populate the row | Pick: chip strip vs modal, replace vs append |
| **Scale practice metronome** — highlight notes in beat order | Pick: BPM input style, loop behaviour, animation |
| **Diagonal 2-octave scales** — alternative to box positions | Pick: toggle UI, pattern count, visual style |
| **Favorites / Bookmarks** — save root+type+mode combinations | Pick: navigation model, storage scope, UI |
| **Scale tab notation** — show scale as guitar tab numbers | Pick: scroll vs grid, which positions shown |
| **Chord transition helper** — highlight shared/moving fingers between two chords | Pick: where it lives, color model |
| **UX audit** — beginner persona walkthrough | Run: read codebase, compile findings to `docs/ux-audit.md` |
| **Chords root picker — 7-note + ♯/♭ toggle** — replace the 12-note horizontal scroll with the 7 natural notes (A B C D E F G); add ♯ and ♭ symbol buttons next to the "Root" label that instantly shift all 7 buttons to their sharp/flat equivalents | Pick: toggle style (two symbols vs segmented control), whether accidentals hide naturals or show both |
| **Arpeggios display rethink** — current view highlights all notes at once making the fretboard confusing; need a new approach that makes the arpeggio shape and sweep order clear at a glance | Brainstorm: single-string-at-a-time animation, step-through mode, or note-by-note reveal |
| **Integration test suite** — full button-level tests verifying every interactive control on every screen does what it should (tap Note → labels change, tap Box 1 → fretboard scrolls, etc.) | Pick: scope (all screens or critical paths only), CI integration |

---

### Dependent on a prior decision — brainstorm the dependency first

These items can't be fully designed until a larger architectural question is resolved.

| Item | Blocked on |
|---|---|
| **Settings screen** — gear icon, dedicated settings page | P0 Visual Overhaul brainstorm |
| **Responsive layout** — iPad, tablet, desktop | P0 Visual Overhaul brainstorm (layout system) |
| **Color palette exploration** — 3–5 candidate themes | Run *before* Visual Overhaul brainstorm (informs it) |
| **P0 Visual Overhaul** — cohesive design across all tabs | Color palette + UX audit should precede this |
| **Pentatonic Equator mode** — Mayer's alternative box system | User needs to describe the method first |
| **Scales: Diagonal + Equator selector** — add a new selector between Type and Display with "Standard \| Diagonal \| JM Pent Equator"; Diagonal shows a 2-octave ascending run from low-E root; Equator shows Mayer's equator system | Depends on Pentatonic Equator brainstorm above; Diagonal spec is in P2 below |

---

### Suggested order going forward

1. ~~Knock out the ready-to-code small items~~ ✅ Done
2. Run the UX audit and color palette exploration in parallel
3. Use those findings to fuel the Visual Overhaul brainstorm
4. Settings screen and responsive layout flow naturally out of that

---

## Recently Fixed (2026-02-21)

- ✅ Fretboard nut spacing — `FB.openStringWidth: 20` constant added; nut now sits flush against string name labels instead of a full fret-width away; all 14 coordinate expressions in `GuitarNeck.tsx` updated
- ✅ Progressions key picker removed — redundant `NotePicker` row deleted from Progressions tab; hint text "Tap the circle to change key" added; Circle of Fifths is now the sole key selector
- ✅ Arpeggio sweep order — `assignSweepOrder()` in `engine/fingers.ts` numbers notes in Finger mode by string descending then fret ascending (low-E string first), giving a natural sweep-picking sequence
- ✅ Persist user preferences — `usePersistentState` hook created; all 5 screens (Chords, Scales, Triads, Arpeggios, Progressions) now remember root, type, and display mode across app restarts via `AsyncStorage`
- ✅ Integration tests (Circle of Fifths) — added engine-level `getDiatonicChords` tests; `testID`-based selectors replace brittle `findAllByProps` calls (React 19 fiber traversal workaround); all 179 tests green

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

### Visual Overhaul — Design Concepts Prompt

When ready to run the visual overhaul brainstorm, use the following system prompt verbatim
to seed Claude's design exploration. It establishes the designer persona, project scope,
output format, and constraints for generating 4 distinct visual concepts.

<details>
<summary>Expand to view full prompt</summary>

```
SYSTEM / ROLE PROMPT
You are a senior UI/UX and graphic designer with 12 years of experience shipping native
mobile and cross-platform applications. Your design philosophy centers on clean, modern
interfaces with purposeful use of whitespace, clear typographic hierarchy, and motion that
feels natural rather than decorative. You have deep familiarity with Apple's Human Interface
Guidelines and Google's Material Design 3 specification, and you know when to follow them
strictly and when to diverge tastefully.
You are also, personally, a beginner guitarist with about four months of experience. You've
been working through open chords, pentatonic scales, and your first arpeggios, and you
vividly remember what it felt like to open a guitar app and feel immediately overwhelmed by
terminology you didn't yet understand — capo positions, CAGED system, alternate tunings,
tritone substitutions. That experience shapes how you design: you protect the beginner from
cognitive overload without patronizing them or hiding the depth they'll eventually want.

CONTEXT
You are redesigning a guitar tutor application that runs across five surfaces: iOS
(portrait-first), Android (portrait-first), iPadOS (all orientations, multiple screen sizes
from 8.3" mini to 13" Pro), macOS (resizable window, minimum ~900px wide), and Web
(responsive, desktop-primary). The existing codebase is being refactored and you have been
given full creative latitude to propose new visual directions before implementation begins.
The app covers: tuning, chords, scales, arpeggios, chord progressions, metronome, ear
training, and a lesson/practice tracker. Some of these features are appropriate for day-one
beginners (tuner, open chords, basic scales). Others are intermediate or advanced (modes,
extended chords, CAGED, custom tunings, theory deep-dives).

YOUR TASK
Produce 4 distinct visual design concepts for this application. Each concept must be
meaningfully different in aesthetic direction — not just a color swap. Think of these as four
pitches you'd present to a client, each with its own personality and target feel.

For each concept, provide the following:

1. Concept Name & Design Philosophy (2–3 sentences)
Name the concept and describe the emotional and aesthetic intention behind it. What does this
design feel like? What does it communicate to the user?

2. Color Palette
Provide a complete palette with hex values including: primary brand color, secondary/accent
color, background (light mode), surface/card color, text primary, text secondary,
success/active state color, warning color, and a dark mode equivalent set. Explain briefly
why these colors suit the concept.

3. Typography
Specify a font pairing (use fonts available via Google Fonts or system fonts). Describe the
typographic scale and weight usage for: app title/logo, section headers, body content,
labels/captions, and any instrument-specific display elements (e.g. fret numbers, note names
on a tuner dial).

4. Navigation Architecture — Mobile (iOS & Android)
Describe the primary navigation pattern (tab bar, bottom nav, side drawer, etc.) and how it
adapts between iOS and Android conventions. List the top-level navigation destinations
visible to a beginner. Describe how more advanced sections are progressively disclosed — for
example, collapsed sections within a tab, a secondary "Explore" area locked behind an
expandable menu, or a contextual "Advanced" toggle within individual screens. Be specific
about which features are shown immediately and which are hidden by default.

5. Navigation Architecture — Tablet (iPadOS)
Describe how the layout changes on iPad. Consider sidebar navigation, split views, or
floating panels. How does the extra canvas change the experience? Specify behavior for both
compact (iPad mini) and large (iPad Pro 13") screens.

6. Navigation Architecture — macOS & Web
Describe the desktop layout. How is the persistent sidebar or top nav structured? How does
the application take advantage of wider viewports — for example, showing a chord diagram
alongside its theory explanation, or a multi-column practice dashboard? Note any
macOS-specific conventions used (e.g. toolbar, window chrome, menu bar integration).

7. Key Screen Mocks (described in detail)
For each of the following screens, write a detailed visual description precise enough that a
developer or another designer could build it without ambiguity. Describe layout, component
placement, visual treatment, and any interaction or animation details.
  - Home / Dashboard (mobile portrait)
  - Chord Library with the advanced chord filter hidden by default (mobile portrait)
  - Interactive Tuner (mobile portrait)
  - Scale Explorer with modes and theory collapsed behind an expandable section (mobile portrait)
  - Practice Session / Lesson View (iPad landscape, large screen)

8. Iconography & Visual Language
Describe the icon style (outlined, filled, duotone, etc.), any custom illustration or
decorative elements that reinforce the guitar theme without feeling kitschy, and how
micro-interactions (button press states, active tab indicators, loading states) behave in
this concept.

9. Beginner Onboarding Hook
Describe how this design concept's first-run experience introduces the app to a new user.
How does the UI communicate "start here" without a wall of text? What progressive disclosure
patterns appear during onboarding?

CONSTRAINTS & REQUIREMENTS APPLYING TO ALL 4 CONCEPTS

- Every concept must feel like a native app on both iOS and Android — meaning it should not
  feel like a web app crammed into a mobile shell. iOS concepts should feel at home next to
  GarageBand or Apollo; Android concepts should feel consistent with Spotify or Google's
  own apps.
- Bottom navigation on mobile must have no more than 5 top-level destinations visible to a
  beginner at any time.
- Advanced features (modes, extended harmony, alternate tunings, CAGED system, custom
  metronome subdivisions, ear training interval identification) must be reachable but not
  surfaced at the top level. Use expandable sections, a collapsible "Advanced" drawer, a
  secondary navigation tier, or a "Pro features" reveal — but make the mechanism clear in
  your description.
- All four concepts must support both light and dark mode.
- Touch targets on mobile must be described at sizes respecting platform minimums (44pt iOS,
  48dp Android).
- The tuner screen must be usable one-handed in portrait.

OUTPUT FORMAT
Present all four concepts sequentially. Use clear headers. After all four concepts, write a
brief Comparative Summary (one paragraph per concept, ~3 sentences each) that a
non-designer stakeholder could read to understand the tradeoffs and which user or brand
personality each concept suits best.
```

</details>

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

### Progressions tab — common progression presets

**What:** Let the user pick from a library of well-known chord progressions (e.g. I–V–vi–IV,
I–IV–V, ii–V–I, 12-bar blues) and have the progression row populate automatically with the
correct diatonic chords in the right order, transposed to the selected key.

**Goal:** Reduce the number of taps needed for a beginner to see and practice a real-world
progression, and serve as a teaching tool by labelling each preset with its common name and
genre context (e.g. "I–IV–V — Blues/Rock", "I–V–vi–IV — Pop"). Each preset should also
include a tappable "Famous songs using this" link that expands to show the top 5 most
well-known songs that use the progression, listed with the key they're commonly played in.

**Design questions to resolve:**
- UI placement: a scrollable horizontal chip strip above the progression row? A modal/sheet
  picker? A dropdown?
- How many presets to include in v1? Suggested starting set:
  - I–IV–V (blues, country, rock)
  - I–V–vi–IV (pop)
  - I–vi–IV–V (50s / doo-wop)
  - ii–V–I (jazz)
  - I–IV–ii–V (turnaround)
  - 12-bar blues (I–I–I–I / IV–IV–I–I / V–IV–I–V)
- Should selecting a preset replace the current progression or append to it?
- Should the user still be able to manually edit the progression after applying a preset?
- How does 12-bar blues (12 chords) fit in the wrapping progression row layout?
- Should a new `src/engine/progressionPresets.ts` file own the preset definitions (name,
  genre label, numeral sequence), keeping the screen component free of data?

**Files:** `src/screens/ProgressionsScreen.tsx`, possibly a new
`src/engine/progressionPresets.ts` for the preset definitions

**Status:** Not started — needs brainstorming session

---


### Color palette exploration — modernise the app's visual identity

**What:** The current palette is functional but generic. Explore alternative color schemes
before the P0 Visual Overhaul is implemented so there is a clear visual direction to build
toward.

**Goal:** Identify 3–5 candidate palettes with distinct personalities, prototype them as
theme objects, and pick one (or a hybrid) to carry forward as the app's design language.

**Palette directions to explore:**
- **Modern blue** — deep navy background, bright electric-blue accent, white text; feels
  techy and contemporary (think linear-gradient hero cards, glassy surfaces)
- **Off-white / warm neutral** — warm cream or light grey background, charcoal text, muted
  amber or teal accent; clean, approachable, textbook-like
- **Modern iOS** — ultra-light system background (`#F2F2F7`), SF-style grouped card rows,
  system blue (`#007AFF`) accent, heavy use of separators and rounded rect cards
- **Dark premium** — near-black background (`#0A0A0F`), gold or rose-gold accent, subtle
  gradient surfaces; feels like a pro music tool
- **Fretboard-inspired** — warm wood tones for backgrounds, ivory fret markers, brass/
  nickel string colors as accents; thematic to the instrument

**How to run this:**
1. Ask Claude to generate 3–5 complete theme objects (light + dark variant each) in
   `src/theme/colors.ts` style
2. Wire each as a selectable theme in a throwaway dev branch
3. Screenshot each on a real device or simulator across 2–3 tabs
4. Pick a direction and document it as the target palette in the design doc

**Note:** Closely related to the P0 Visual Overhaul — run this exploration first so the
brainstorming session has concrete palette options to anchor decisions.

**Files:** `src/theme/colors.ts`, `src/theme/ThemeContext.tsx`

**Status:** Not started

---

### UX audit — new guitar student persona review

**What:** Have Claude read through the full codebase and adopt the persona of a beginner
guitar student opening the app for the first time. From that perspective, identify what is
intuitive, what is confusing, what is missing, and what small changes would have the highest
usability impact.

**Goal:** Surface blind spots that are hard to see when you are deep in the implementation.
The output is a secondary candidate list of UX improvements to be evaluated for inclusion in
the main TODO on a case-by-case basis — not an automatic promotion.

**Scope of the review:**
- First-launch experience: is it obvious what each tab does?
- Each tab in isolation: can a beginner figure out what to do without instructions?
- Header controls: are LH, capo, ♯/♭, and theme discoverable and self-explanatory?
- Navigation: is the bottom tab order logical for a learning journey?
- Fretboard: are the note dots, interval labels, and finger numbers legible and meaningful
  to someone who has never seen them before?
- Progressions: is the relationship between the diatonic row, the progression builder, and
  the Circle of Fifths clear?
- Terminology: are labels like "Interval", "Box 1", "Sus4", "vii°" explained anywhere?

**How to run this:**
1. Ask Claude to read all screen files, component files, and the engine layer
2. Prompt: "You are a beginner guitar student who has just downloaded this app. Walk through
   each tab and tell me what you find intuitive, what confuses you, and what you wish the app
   explained or did differently."
3. Claude compiles findings into `docs/ux-audit-YYYY-MM-DD.md`
4. Review the findings together and promote worthy items to the main TODO

**Status:** Not started

---

### Settings screen — move header controls behind a gear icon

**What:** The header currently exposes LH, capo (− C +), ♯/♭, and dark/light mode controls
directly in the nav bar. As the app grows, cramming more global options into the header will
become untenable. Moving most of these into a dedicated Settings screen behind a gear icon
would clean up the main views, make each option more legible with a proper label, and open
room for future preferences without cluttering every tab.

**Goal:** A tappable ⚙ icon in the header opens a Settings screen (modal sheet or full
screen) containing all global preferences, leaving the header minimal. Capo may stay in the
header as a session-level control that guitarists toggle frequently mid-practice.

**Design questions to resolve:**
- Which controls move to Settings vs stay in the header?
  - Likely to Settings: ♯/♭, LH mode, dark/light theme
  - Likely to stay: capo (frequent, session-scoped) — or does it also move?
- Settings UI style: a modal bottom sheet, a slide-over panel, or a full navigation screen?
- Should settings be grouped with labels (e.g. "Display", "Playback", "Accessibility")?
- Does moving LH and ♯/♭ out of the header affect discoverability for new users, and if so
  how do we mitigate that (e.g. a first-launch nudge)?
- Future settings that could live here: alternate tunings, default tab per launch, font size,
  color-blind-friendly note palette

**Files:** `App.tsx` (header), new `src/screens/SettingsScreen.tsx`,
`src/theme/ThemeContext.tsx`

**Note:** This item is closely related to the P0 Visual Overhaul — consider tackling them
together in the same brainstorming session.

**Status:** Not started — needs brainstorming session

---

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


## Out of Scope for v1

- Audio playback (sample-based chord/note playback)
- Alternate tunings UI (DADGAD, open G, etc.) — engine/tuning.ts is now ready for this
- Custom chord progressions beyond diatonic
- Sheet music / tab notation export
- Metronome / practice timer
