# Progressions: Voicing Selection + Circle Annotations Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix chord voicing selection to prefer open/closest-to-nut shapes, and annotate the Circle of Fifths with diatonic chord numerals and quality colors.

**Architecture:** Both changes are confined to `src/screens/ProgressionsScreen.tsx`. The voicing fix is a one-function change to `getVoicing`. The circle fix rewrites `renderCircleOfFifths` to build a diatonic lookup map from the already-computed `diatonicChords` and uses `getChordQualityColor` (already imported) for fill colors.

**Tech Stack:** React Native, react-native-svg, TypeScript, Jest + react-test-renderer

---

### Task 1: Fix voicing selection — prefer open/closest-to-nut

**Files:**
- Modify: `src/screens/ProgressionsScreen.tsx`
- Test: `src/screens/__tests__/ProgressionsScreen.test.tsx`

**Background:** `getVoicing` currently returns `voicings[0]`, which is always the E-shape barre chord. The fix: for each voicing compute `min(v.f for all v where v.f >= 0)` — this scores open strings as 0, beating any barre. Pick the voicing with the smallest score.

**Step 1: Write the failing test**

In `src/screens/__tests__/ProgressionsScreen.test.tsx`, add this test inside the `describe('ProgressionsScreen')` block:

```tsx
test('progression display uses open-position voicing for C major I chord', () => {
  let tree: any;
  act(() => { tree = create(<ProgressionsScreen />); });

  // Tap the I chord button — C major in key of C (default root=0)
  const allTouchables = tree.root.findAllByType('TouchableOpacity');
  const chordCards = allTouchables.filter((el: any) => el.props.accessibilityLabel == null);
  act(() => { chordCards[0].props.onPress(); });

  const json = JSON.stringify(tree.toJSON());
  // Open C shape has open strings → ChordDiagram renders ○ for them
  expect(json).toContain('○');
});
```

**Step 2: Run test to verify it fails**

```bash
npx jest src/screens/__tests__/ProgressionsScreen.test.tsx --no-coverage -t "open-position"
```

Expected: FAIL — the current E-shape barre at fret 8 has no open strings so `○` is never rendered.

**Step 3: Fix `getVoicing` in `src/screens/ProgressionsScreen.tsx`**

Find this function (currently around line 29):

```tsx
const getVoicing = (chordRoot: number, quality: string): ChordVoicing | null => {
  const voicings = getChordVoicings(chordRoot, quality);
  return voicings.length > 0 ? voicings[0] : null;
};
```

Replace with:

```tsx
const getVoicing = (chordRoot: number, quality: string): ChordVoicing | null => {
  const voicings = getChordVoicings(chordRoot, quality);
  if (voicings.length === 0) return null;
  const minFret = (v: ChordVoicing) =>
    Math.min(...v.filter(n => n.f >= 0).map(n => n.f));
  return voicings.reduce((best, v) => minFret(v) < minFret(best) ? v : best);
};
```

**Step 4: Run test to verify it passes**

```bash
npx jest src/screens/__tests__/ProgressionsScreen.test.tsx --no-coverage -t "open-position"
```

Expected: PASS

**Step 5: Run full test suite to check for regressions**

```bash
npx jest --no-coverage
```

Expected: All 152 tests pass (151 existing + 1 new).

**Step 6: Commit**

Write to `/tmp/msg.txt` using the Write tool (content below), then:
```bash
git add src/screens/ProgressionsScreen.tsx src/screens/__tests__/ProgressionsScreen.test.tsx
git commit -F /tmp/msg.txt
```

Commit message:
```
fix(screens): prefer open/closest-to-nut voicing in Progressions chord display
```

---

### Task 2: Annotate Circle of Fifths with diatonic numerals and quality colors

**Files:**
- Modify: `src/screens/ProgressionsScreen.tsx`
- Test: `src/screens/__tests__/ProgressionsScreen.test.tsx`

**Background:** `renderCircleOfFifths` currently renders all 12 notes identically except the selected key (which uses `theme.accent`). The new behaviour: build a lookup map from each diatonic chord's root note to its `{ numeral, quality }`, then color each diatonic circle with `getChordQualityColor` and show a roman numeral subscript. The selected key circle additionally gets a white stroke ring.

**Step 1: Write the failing tests**

Add these three tests inside the `describe('ProgressionsScreen')` block:

```tsx
test('circle of fifths fills diatonic notes with quality colors', () => {
  let tree: any;
  act(() => { tree = create(<ProgressionsScreen />); });
  const json = JSON.stringify(tree.toJSON());
  // In C major: I/IV/V are Major (#c8962a), ii/iii/vi Minor (#3a7bd5), vii° Dim (#c0392b)
  expect(json).toContain('"fill":"#c8962a"');
  expect(json).toContain('"fill":"#3a7bd5"');
  expect(json).toContain('"fill":"#c0392b"');
});

test('circle of fifths shows roman numerals for diatonic notes', () => {
  let tree: any;
  act(() => { tree = create(<ProgressionsScreen />); });
  const json = JSON.stringify(tree.toJSON());
  // vii° is unique to the circle annotations (also appears in buttons, but this confirms it's there)
  expect(json).toContain('vii°');
});

test('selected key circle has white stroke ring', () => {
  let tree: any;
  act(() => { tree = create(<ProgressionsScreen />); });
  const json = JSON.stringify(tree.toJSON());
  // The selected root note (C by default) gets stroke="#fff" strokeWidth=2
  expect(json).toContain('"stroke":"#fff"');
});
```

**Step 2: Run tests to verify they fail**

```bash
npx jest src/screens/__tests__/ProgressionsScreen.test.tsx --no-coverage -t "circle of fifths (fills|numerals|white stroke)"
```

Expected: All 3 FAIL — current implementation uses only `theme.accent`/`theme.bgTertiary` fills and `theme.border` strokes, none of which are `#c8962a`, `#3a7bd5`, `#c0392b`, or `#fff`.

**Step 3: Rewrite `renderCircleOfFifths` in `src/screens/ProgressionsScreen.tsx`**

Find the entire `renderCircleOfFifths` function (currently around lines 40–83) and replace it wholesale:

```tsx
const renderCircleOfFifths = () => {
  const cx = 150, cy = 150, r = 100;
  const notes = CIRCLE_OF_FIFTHS;

  const diatonicMap: Record<number, { numeral: string; quality: string }> = {};
  for (const chord of diatonicChords) {
    diatonicMap[chord.root] = { numeral: chord.numeral, quality: chord.quality };
  }

  return (
    <Svg width={300} height={300} viewBox="0 0 300 300">
      <Circle cx={cx} cy={cy} r={r} fill="none" stroke={theme.border} strokeWidth={1} />
      {notes.map((note, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        const isSelectedKey = note === root;
        const diatonic = diatonicMap[note];
        const fillColor = diatonic
          ? getChordQualityColor(diatonic.quality, isDark)
          : theme.bgTertiary;
        const textColor = diatonic ? '#fff' : theme.textPrimary;

        return (
          <G
            key={i}
            onPress={() => { setRoot(note); setProgression([]); }}
            accessibilityRole="button"
            accessibilityLabel={`Select ${(useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES)[note]} as key`}
          >
            <Circle
              cx={x}
              cy={y}
              r={15}
              fill={fillColor}
              stroke={isSelectedKey ? '#fff' : theme.border}
              strokeWidth={isSelectedKey ? 2 : 1}
            />
            <SvgText
              x={x}
              y={diatonic ? y - 4 : y}
              fill={textColor}
              fontSize={diatonic ? 9 : 11}
              fontWeight="600"
              textAnchor="middle"
              alignmentBaseline="central"
            >
              {(useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES)[note]}
            </SvgText>
            {diatonic && (
              <SvgText
                x={x}
                y={y + 5}
                fill={textColor}
                fontSize={7}
                fontWeight="600"
                textAnchor="middle"
                alignmentBaseline="central"
              >
                {diatonic.numeral}
              </SvgText>
            )}
          </G>
        );
      })}
    </Svg>
  );
};
```

**Step 4: Run new tests to verify they pass**

```bash
npx jest src/screens/__tests__/ProgressionsScreen.test.tsx --no-coverage -t "circle of fifths (fills|numerals|white stroke)"
```

Expected: All 3 PASS

**Step 5: Run full test suite to check for regressions**

```bash
npx jest --no-coverage
```

Expected: All 155 tests pass (152 from Task 1 + 3 new).

**Step 6: Commit**

Write to `/tmp/msg.txt` using the Write tool, then:
```bash
git add src/screens/ProgressionsScreen.tsx src/screens/__tests__/ProgressionsScreen.test.tsx
git commit -F /tmp/msg.txt
```

Commit message:
```
feat(screens): annotate Circle of Fifths with diatonic numerals and quality colors
```

---

### Task 3: Final verification

**Step 1: Run full test suite**

```bash
npx jest --no-coverage
```

Expected: All 155 tests pass, 0 failures.

**Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: Only the pre-existing `@expo/vector-icons/MaterialCommunityIcons` error in `App.tsx`. No new errors.
