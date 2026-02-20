# Progressions Screen Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix 5 UX issues in the Progressions tab: compact single-row diatonic buttons, ordered chord progression display below the buttons, and a portrait-oriented chord diagram component.

**Architecture:** New `ChordDiagram` component renders traditional vertical chord box SVG. `ProgressionsScreen` state changes from `Set<number>` to `number[]` (ordered). The inline chord preview inside buttons is replaced by a horizontal scroll section below.

**Tech Stack:** React Native, react-native-svg, TypeScript, Jest + react-test-renderer

---

### Task 1: Create `ChordDiagram` component (portrait orientation)

**Files:**
- Create: `src/components/ChordDiagram.tsx`
- Create: `src/components/__tests__/ChordDiagram.test.tsx`

**Step 1: Write the failing test**

Create `src/components/__tests__/ChordDiagram.test.tsx`:

```tsx
// src/components/__tests__/ChordDiagram.test.tsx
import React from 'react';
import { create, act } from 'react-test-renderer';
import { ChordDiagram } from '../ChordDiagram';
import { ChordVoicing } from '../../engine/chords';

describe('ChordDiagram', () => {
  const openCVoicing: ChordVoicing = [
    { s: 0, f: 0 }, { s: 1, f: 1 }, { s: 2, f: 0 },
    { s: 3, f: 2 }, { s: 4, f: 3 }, { s: 5, f: -1 },
  ];

  const barreVoicing: ChordVoicing = [
    { s: 0, f: 5 }, { s: 1, f: 5 }, { s: 2, f: 6 },
    { s: 3, f: 7 }, { s: 4, f: 7 }, { s: 5, f: 5 },
  ];

  test('renders without crashing', () => {
    let tree: any;
    act(() => { tree = create(<ChordDiagram voicing={openCVoicing} root={0} />); });
    expect(tree.toJSON()).toBeTruthy();
  });

  test('renders null when voicing is null', () => {
    let tree: any;
    act(() => { tree = create(<ChordDiagram voicing={null} root={0} />); });
    expect(tree.toJSON()).toBeNull();
  });

  test('renders × for muted strings', () => {
    let tree: any;
    act(() => { tree = create(<ChordDiagram voicing={openCVoicing} root={0} />); });
    expect(JSON.stringify(tree.toJSON())).toContain('×');
  });

  test('renders ○ for open strings', () => {
    let tree: any;
    act(() => { tree = create(<ChordDiagram voicing={openCVoicing} root={0} />); });
    expect(JSON.stringify(tree.toJSON())).toContain('○');
  });

  test('renders nut line (strokeWidth 3) for open position chords', () => {
    let tree: any;
    act(() => { tree = create(<ChordDiagram voicing={openCVoicing} root={0} />); });
    expect(JSON.stringify(tree.toJSON())).toContain('"strokeWidth":3');
  });

  test('renders fret label for barre chords', () => {
    let tree: any;
    act(() => { tree = create(<ChordDiagram voicing={barreVoicing} root={9} />); });
    expect(JSON.stringify(tree.toJSON())).toContain('fr');
  });

  test('renders Circle dots for fretted strings', () => {
    let tree: any;
    act(() => { tree = create(<ChordDiagram voicing={openCVoicing} root={0} />); });
    const circles = tree.root.findAllByType('Circle');
    // 4 fretted strings (f>0) → 4 dots
    expect(circles.length).toBeGreaterThanOrEqual(4);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npx jest src/components/__tests__/ChordDiagram.test.tsx --no-coverage
```

Expected: FAIL — `Cannot find module '../ChordDiagram'`

**Step 3: Create `src/components/ChordDiagram.tsx`**

```tsx
// src/components/ChordDiagram.tsx
import React, { ReactElement } from 'react';
import Svg, { Line, Circle, Text as SvgText } from 'react-native-svg';
import { ChordVoicing } from '../engine/chords';
import { useTheme } from '../theme/ThemeContext';
import { STANDARD_TUNING } from '../engine/notes';

interface ChordDiagramProps {
  voicing: ChordVoicing | null;
  root: number;
}

function ChordDiagramInner({ voicing, root }: ChordDiagramProps) {
  const { theme } = useTheme();

  if (!voicing) return null;

  const W = 90, H = 112;
  const padL = 10, padR = 10, padT = 26, padB = 6;
  const gridW = W - padL - padR; // 70
  const gridH = H - padT - padB; // 80
  const SS = gridW / 5;          // string spacing: 14
  const displayFrets = 5;
  const FW = gridH / displayFrets; // fret row height: 16

  const playedFrets = voicing.filter(v => v.f > 0).map(v => v.f);
  const hasOpenStrings = voicing.some(v => v.f === 0);
  const minFret = playedFrets.length > 0 ? Math.min(...playedFrets) : 0;
  const isOpenPosition = minFret <= 3 && hasOpenStrings;
  const fretOffset = isOpenPosition ? 0 : Math.max(0, minFret - 1);

  const renderStrings = (): ReactElement[] =>
    Array.from({ length: 6 }, (_, s) => (
      <Line
        key={`str-${s}`}
        x1={padL + s * SS} y1={padT}
        x2={padL + s * SS} y2={padT + gridH}
        stroke={theme.stringColor}
        strokeWidth={0.5 + s * 0.15}
        opacity={0.6}
      />
    ));

  const renderFretLines = (): ReactElement[] =>
    Array.from({ length: displayFrets + 1 }, (_, f) => {
      const isNut = f === 0 && fretOffset === 0;
      return (
        <Line
          key={`fret-${f}`}
          x1={padL} y1={padT + f * FW}
          x2={padL + gridW} y2={padT + f * FW}
          stroke={isNut ? theme.nutColor : theme.fretWire}
          strokeWidth={isNut ? 3 : 1}
          opacity={isNut ? 1 : 0.4}
        />
      );
    });

  const renderDots = (): ReactElement[] => {
    const dots: ReactElement[] = [];
    for (const v of voicing) {
      const x = padL + v.s * SS;
      if (v.f < 0) {
        dots.push(
          <SvgText key={`mute-${v.s}`} x={x} y={padT - 9}
            fill={theme.textMuted} fontSize={9}
            textAnchor="middle" alignmentBaseline="central">×</SvgText>
        );
        continue;
      }
      if (v.f === 0) {
        dots.push(
          <SvgText key={`open-${v.s}`} x={x} y={padT - 9}
            fill={theme.textMuted} fontSize={9}
            textAnchor="middle" alignmentBaseline="central">○</SvgText>
        );
        continue;
      }
      const displayFret = v.f - fretOffset;
      const y = padT + (displayFret - 0.5) * FW;
      const isRoot = (STANDARD_TUNING[v.s] + v.f) % 12 === root;
      dots.push(
        <Circle key={`dot-${v.s}-${v.f}`}
          cx={x} cy={y} r={isRoot ? 6 : 5}
          fill={isRoot ? theme.rootColor : theme.accent}
        />
      );
    }
    return dots;
  };

  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {fretOffset > 0 && (
        <SvgText
          x={padL + gridW} y={padT - 10}
          fill={theme.textSecondary} fontSize={8}
          textAnchor="end">
          {fretOffset + 1}fr
        </SvgText>
      )}
      {renderFretLines()}
      {renderStrings()}
      {renderDots()}
    </Svg>
  );
}

export const ChordDiagram = React.memo(ChordDiagramInner);
```

**Step 4: Run tests to verify they pass**

```bash
npx jest src/components/__tests__/ChordDiagram.test.tsx --no-coverage
```

Expected: All 7 tests PASS

**Step 5: Commit**

```bash
git add src/components/ChordDiagram.tsx src/components/__tests__/ChordDiagram.test.tsx
git commit -m "feat(components): add ChordDiagram portrait chord diagram"
```

---

### Task 2: Export `ChordDiagram` from the component barrel

**Files:**
- Modify: `src/components/index.ts`

**Step 1: Add the export**

In `src/components/index.ts`, add after the `ChordPreview` export:

```ts
export { ChordDiagram } from './ChordDiagram';
```

**Step 2: Verify the barrel compiles**

```bash
npx tsc --noEmit
```

Expected: No errors

**Step 3: Commit**

```bash
git add src/components/index.ts
git commit -m "feat(components): export ChordDiagram"
```

---

### Task 3: Rewrite `ProgressionsScreen` — state + compact buttons

**Files:**
- Modify: `src/screens/ProgressionsScreen.tsx`

**Context:** `activeChords` is currently `Set<number>`. Replace with `progression: number[]` (ordered). The 7 diatonic buttons currently use `width: '30%'` (wraps to 3 rows). Change to `flex: 1` (single row). Remove the `ChordPreview` preview inside the button — that moves to Task 4.

**Step 1: Update imports at the top of `ProgressionsScreen.tsx`**

Replace:
```tsx
import { NotePicker, ChordPreview } from '../components';
```
With:
```tsx
import { NotePicker, ChordDiagram } from '../components';
```

**Step 2: Replace state declaration**

Replace:
```tsx
const [activeChords, setActiveChords] = useState<Set<number>>(new Set());
```
With:
```tsx
const [progression, setProgression] = useState<number[]>([]);
```

**Step 3: Replace `toggleChord`**

Replace:
```tsx
const toggleChord = (index: number) => {
  setActiveChords(prev => {
    const next = new Set(prev);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    return next;
  });
};
```
With:
```tsx
const toggleChord = (index: number) => {
  setProgression(prev =>
    prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
  );
};
```

**Step 4: Update the Circle of Fifths `onPress` to clear `progression`**

Replace:
```tsx
onPress={() => { setRoot(note); setActiveChords(new Set()); }}
```
With:
```tsx
onPress={() => { setRoot(note); setProgression([]); }}
```

**Step 5: Also clear progression when root is set via NotePicker**

Replace:
```tsx
<NotePicker activeNote={root} onSelect={setRoot} />
```
With:
```tsx
<NotePicker activeNote={root} onSelect={(note) => { setRoot(note); setProgression([]); }} />
```

**Step 6: Replace the diatonic chord buttons section**

Replace the entire diatonic chord block (from `<Text style={[styles.label...}>Diatonic Chords</Text>` through the closing `</View>` of `chordsContainer`) with:

```tsx
<Text style={[styles.label, { color: theme.textSecondary }]}>Diatonic Chords</Text>
<View style={styles.numeralRow}>
  {diatonicChords.map((chord, index) => {
    const isActive = progression.includes(index);
    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.numeralButton,
          {
            backgroundColor: isActive ? theme.bgElevated : theme.bgSecondary,
            borderColor: isActive ? theme.accent : theme.border,
            borderBottomColor: getChordQualityColor(chord.quality, isDark),
          },
        ]}
        onPress={() => toggleChord(index)}
      >
        <Text style={[styles.numeralText, { color: isActive ? theme.accent : theme.textMuted }]}>
          {chord.numeral}
        </Text>
      </TouchableOpacity>
    );
  })}
</View>
```

**Step 7: Replace old styles with new ones**

Remove `chordsContainer`, `chordCard`, `numeral`, `chordName`, `previewContainer` from the StyleSheet.

Add in their place:

```tsx
numeralRow: {
  flexDirection: 'row',
  gap: 4,
},
numeralButton: {
  flex: 1,
  paddingVertical: 10,
  paddingHorizontal: 2,
  borderRadius: 6,
  borderWidth: 1,
  borderBottomWidth: 3,
  alignItems: 'center',
},
numeralText: {
  fontSize: 11,
  fontWeight: '700',
},
```

**Step 8: Run existing screen tests**

```bash
npx jest src/screens/__tests__/ProgressionsScreen.test.tsx --no-coverage
```

Expected: Several tests fail — that's OK (state shape changed, 'm' check broken). Fix those in Task 5.

---

### Task 4: Add the "Progression" display section

**Files:**
- Modify: `src/screens/ProgressionsScreen.tsx`

**Step 1: Add the progression display section below the numeral buttons**

After the closing `</View>` of `numeralRow` and before the `<Text ...>Circle of Fifths</Text>`, insert:

```tsx
{progression.length > 0 && (
  <>
    <Text style={[styles.label, { color: theme.textSecondary }]}>Progression</Text>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.progressionRow}
    >
      {progression.map((chordIndex, pos) => {
        const chord = diatonicChords[chordIndex];
        const voicing = getVoicing(chord.root, chord.quality);
        const noteName = (useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES)[chord.root];
        const qualitySuffix = chord.quality === 'Dim' ? '°' : chord.quality === 'Minor' ? 'm' : '';
        return (
          <View
            key={pos}
            style={[styles.progressionCard, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}
          >
            <Text style={[styles.progressionNumeral, { color: theme.textMuted }]}>
              {chord.numeral}
            </Text>
            <Text style={[styles.progressionChordName, { color: theme.textPrimary }]}>
              {noteName}{qualitySuffix}
            </Text>
            <ChordDiagram voicing={voicing} root={chord.root} />
          </View>
        );
      })}
    </ScrollView>
  </>
)}
```

**Step 2: Add the new styles to the StyleSheet**

```tsx
progressionRow: {
  gap: 8,
  paddingBottom: 4,
},
progressionCard: {
  alignItems: 'center',
  padding: 8,
  borderRadius: 8,
  borderWidth: 1,
},
progressionNumeral: {
  fontSize: 10,
  fontWeight: '600',
},
progressionChordName: {
  fontSize: 14,
  fontWeight: '700',
  marginBottom: 2,
},
```

**Step 3: Make sure `ScrollView` is imported**

`ScrollView` is already imported from `react-native` in this file — no change needed.

**Step 4: Run a quick sanity check**

```bash
npx tsc --noEmit
```

Expected: No errors

---

### Task 5: Update `ProgressionsScreen` tests

**Files:**
- Modify: `src/screens/__tests__/ProgressionsScreen.test.tsx`

**Context:** The test "renders chord names with quality indicators" checked for `'m'` suffix. With compact numeral buttons, there's no `'m'` — quality is shown by lowercase numerals and `°`. The clear-progression test references `setActiveChords` in comments only; the logic still works but comments need updating.

**Step 1: Update the quality indicator test**

Replace:
```tsx
test('renders chord names with quality indicators', () => {
  let tree: any;
  act(() => {
    tree = create(<ProgressionsScreen />);
  });
  const json = JSON.stringify(tree.toJSON());
  // Minor chords should have 'm' suffix in display
  expect(json).toContain('m');
  // Dim chord should have degree sign
  expect(json).toContain('°');
});
```
With:
```tsx
test('renders quality indicators via numerals', () => {
  let tree: any;
  act(() => {
    tree = create(<ProgressionsScreen />);
  });
  const json = JSON.stringify(tree.toJSON());
  // Minor chords shown as lowercase numerals (e.g. 'ii')
  expect(json).toContain('ii');
  // Dim chord numeral contains degree sign
  expect(json).toContain('°');
});
```

**Step 2: Update the clear-progression test comments**

In the test `'tapping a circle note clears active chord previews'`, update two comment lines so they reference `progression` instead of `activeChords`:

Replace:
```tsx
//   setActiveChords(new Set()) — clears all active chord previews
```
With:
```tsx
//   setProgression([]) — clears all active chord previews
```

And replace:
```tsx
// After the key change, activeChords is an empty Set so no chord card is active.
```
With:
```tsx
// After the key change, progression is empty so no chord card is active.
```

**Step 3: Run all tests**

```bash
npx jest --no-coverage
```

Expected: All tests PASS

**Step 4: Commit**

```bash
git add src/screens/ProgressionsScreen.tsx src/screens/__tests__/ProgressionsScreen.test.tsx
git commit -m "feat(screens): redesign Progressions tab with compact buttons and portrait chord diagrams"
```

---

### Task 6: Final verification

**Step 1: Run the full test suite**

```bash
npx jest --no-coverage
```

Expected: All tests PASS, 0 failures

**Step 2: TypeScript compile check**

```bash
npx tsc --noEmit
```

Expected: No errors

**Step 3: Commit any remaining changes**

If there are no uncommitted changes, the work is done. Otherwise:

```bash
git add -A
git commit -m "chore: finalize progressions screen redesign"
```
