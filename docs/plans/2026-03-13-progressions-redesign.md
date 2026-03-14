# Progressions Screen Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Progressions screen with a piano-layout key picker at the top, a ✕ remove button on progression cards, and the Circle of Fifths collapsed into an expandable row at the bottom.

**Architecture:** All UI changes are confined to `src/screens/ProgressionsScreen.tsx`. The screen gains two new state variables (`circleExpanded`, `naturalRowWidth`) and a `toggleCircle()` helper. The Circle of Fifths SVG (`renderCircleOfFifths()`) is unchanged; only its container changes. `App.tsx` gets a one-line Android `LayoutAnimation` guard.

**Tech Stack:** React Native (ScrollView, TouchableOpacity, LayoutAnimation, StyleSheet), react-native-svg (unchanged), `usePersistentState` hook, `ThemeContext`.

**Spec:** `docs/specs/2026-03-13-progressions-redesign.md`

---

## Chunk 1: Test Housekeeping

Delete tests for removed interactions. Update 9 circle tests to expand the circle before querying SVG content (they will fail until Chunk 4 is done — that is expected and intentional in TDD).

### Task 1: Delete removed-interaction tests

**Files:**
- Modify: `src/screens/__tests__/ProgressionsScreen.test.tsx`

- [ ] **Step 1: Delete the two tests for removed interactions**

In `src/screens/__tests__/ProgressionsScreen.test.tsx`, delete these two complete `test(...)` blocks:

1. `'renders circle of fifths hint text'` (lines 61–68) — asserts `'Tap the circle to change key'` which is being removed.
2. `'tapping a progression card removes it'` (lines 325–351) — tests `onPress` on the card body, which is being removed.

- [ ] **Step 2: Run tests to verify baseline is still intact**

```bash
npx jest src/screens/__tests__/ProgressionsScreen.test.tsx --no-coverage
```

Expected: All remaining tests pass. If any fail, you deleted the wrong block — revert and try again.

- [ ] **Step 3: Commit**

Write to `/tmp/msg.txt` using the Write tool:
```
test(progressions): delete removed-interaction tests
```
Then commit:
```bash
git add src/screens/__tests__/ProgressionsScreen.test.tsx
git commit -F /tmp/msg.txt
```

---

### Task 2: Update circle tests to expand before querying SVG

**Files:**
- Modify: `src/screens/__tests__/ProgressionsScreen.test.tsx`

These 9 tests query the Circle of Fifths SVG on the initial render. After the redesign the SVG is hidden until the user expands the collapsible row. Update each test to tap `testID="circle-collapse-header"` before querying SVG content.

The helper to add at the top of each affected test (after `create(<ProgressionsScreen />)`):

```typescript
// Expand the Circle of Fifths collapsible row first
const circleHeader = tree.root.findAll(
  (el: any) => el.props.testID === 'circle-collapse-header'
)[0];
act(() => { circleHeader.props.onPress(); });
```

- [ ] **Step 1: Update `'tapping a circle note changes the active key'` (line 70)**

Add the expand helper immediately after `tree = create(<ProgressionsScreen />)` and before the `findAllByType('G')` call. The test already uses `findAllByType('G')` to find pressable circle nodes — this will only work after the SVG is in the tree.

After the expand helper is inserted, the test reads:
```typescript
test('tapping a circle note changes the active key', () => {
  let tree: any;
  act(() => { tree = create(<ProgressionsScreen />); });

  // Expand the Circle of Fifths collapsible row first
  const circleHeader = tree.root.findAll(
    (el: any) => el.props.testID === 'circle-collapse-header'
  )[0];
  act(() => { circleHeader.props.onPress(); });

  const gElements = tree.root.findAllByType('G');
  const circleNotes = gElements.filter((el: any) => el.props.onPress != null);
  expect(circleNotes.length).toBe(12);

  act(() => { circleNotes[1].props.onPress(); });

  expect(tree.toJSON()).toBeTruthy();
  const json = JSON.stringify(tree.toJSON());
  expect(json).toContain('D');
});
```

- [ ] **Step 2: Update `'circle of fifths fills diatonic notes with quality colors'` (line 117)**

Insert expand helper after `create(...)`:
```typescript
test('circle of fifths fills diatonic notes with quality colors', () => {
  let tree: any;
  act(() => { tree = create(<ProgressionsScreen />); });
  const circleHeader = tree.root.findAll(
    (el: any) => el.props.testID === 'circle-collapse-header'
  )[0];
  act(() => { circleHeader.props.onPress(); });
  const json = JSON.stringify(tree.toJSON());
  expect(json).toContain('"fill":"#c8962a"');
  expect(json).toContain('"fill":"#3a7bd5"');
  expect(json).toContain('"fill":"#c0392b"');
});
```

- [ ] **Step 3: Update `'circle of fifths shows roman numerals for diatonic notes'` (line 127)**

```typescript
test('circle of fifths shows roman numerals for diatonic notes', () => {
  let tree: any;
  act(() => { tree = create(<ProgressionsScreen />); });
  const circleHeader = tree.root.findAll(
    (el: any) => el.props.testID === 'circle-collapse-header'
  )[0];
  act(() => { circleHeader.props.onPress(); });
  const json = JSON.stringify(tree.toJSON());
  expect(json).toContain('vii°');
});
```

- [ ] **Step 4: Update `'selected key circle has white stroke ring'` (line 134)**

```typescript
test('selected key circle has white stroke ring', () => {
  let tree: any;
  act(() => { tree = create(<ProgressionsScreen />); });
  const circleHeader = tree.root.findAll(
    (el: any) => el.props.testID === 'circle-collapse-header'
  )[0];
  act(() => { circleHeader.props.onPress(); });
  const json = JSON.stringify(tree.toJSON());
  expect(json).toContain('"stroke":"#fff"');
});
```

- [ ] **Step 5: Update `'tapping a circle note clears active chord previews'` (line 142)**

In this test the circle notes are captured before any chord activation to avoid picking up G elements from chord previews. After the expand helper is inserted, those `G` elements from the SVG are now available. Insert the expand helper immediately after `tree = create(...)`:

```typescript
test('tapping a circle note clears active chord previews', () => {
  const ACCENT = '#d4a04a';
  const MUTED = '#5c5a55';

  let tree: any;
  act(() => { tree = create(<ProgressionsScreen />); });

  // Expand the Circle of Fifths collapsible row first
  const circleHeader = tree.root.findAll(
    (el: any) => el.props.testID === 'circle-collapse-header'
  )[0];
  act(() => { circleHeader.props.onPress(); });

  const getNumeralText = () => {
    const allTexts = tree.root.findAllByType('Text');
    return allTexts.find((el: any) => el.props.children === 'I');
  };
  const getColor = (el: any): string | undefined => {
    const style = el.props.style;
    if (Array.isArray(style)) {
      for (const s of style) {
        if (s && typeof s === 'object' && 'color' in s) return s.color;
      }
      return undefined;
    }
    return style?.color;
  };

  const initialGElements = tree.root.findAllByType('G');
  const circleNotes = initialGElements.filter((el: any) => el.props.onPress != null);
  expect(circleNotes.length).toBe(12);

  const initialNumeral = getNumeralText();
  expect(initialNumeral).toBeDefined();
  expect(getColor(initialNumeral)).toBe(MUTED);

  const chordCards = tree.root.findAllByType('TouchableOpacity').filter(
    (el: any) => el.props.testID === 'diatonic-btn'
  );
  expect(chordCards.length).toBe(7);

  act(() => { chordCards[0].props.onPress(); });

  const activeNumeral = getNumeralText();
  expect(activeNumeral).toBeDefined();
  expect(getColor(activeNumeral)).toBe(ACCENT);

  act(() => { circleNotes[1].props.onPress(); });

  const clearedNumeral = getNumeralText();
  expect(clearedNumeral).toBeDefined();
  expect(getColor(clearedNumeral)).toBe(MUTED);
});
```

- [ ] **Step 6: Update the four remaining circle ring tests (lines 270–301)**

Apply the same expand-first pattern to each:

```typescript
test('circle of fifths renders middle ring relative minor nodes', () => {
  let tree: any;
  act(() => { tree = create(<ProgressionsScreen />); });
  const circleHeader = tree.root.findAll(
    (el: any) => el.props.testID === 'circle-collapse-header'
  )[0];
  act(() => { circleHeader.props.onPress(); });
  const json = JSON.stringify(tree.toJSON());
  expect(json).toContain('Am');
});

test('circle of fifths renders inner ring diminished nodes', () => {
  let tree: any;
  act(() => { tree = create(<ProgressionsScreen />); });
  const circleHeader = tree.root.findAll(
    (el: any) => el.props.testID === 'circle-collapse-header'
  )[0];
  act(() => { circleHeader.props.onPress(); });
  const json = JSON.stringify(tree.toJSON());
  expect(json).toContain('B°');
});

test('circle of fifths middle ring uses minor quality fill', () => {
  let tree: any;
  act(() => { tree = create(<ProgressionsScreen />); });
  const circleHeader = tree.root.findAll(
    (el: any) => el.props.testID === 'circle-collapse-header'
  )[0];
  act(() => { circleHeader.props.onPress(); });
  const json = JSON.stringify(tree.toJSON());
  expect(json).toContain('"fill":"#3a7bd5"');
});

test('circle of fifths inner ring uses dim quality fill', () => {
  let tree: any;
  act(() => { tree = create(<ProgressionsScreen />); });
  const circleHeader = tree.root.findAll(
    (el: any) => el.props.testID === 'circle-collapse-header'
  )[0];
  act(() => { circleHeader.props.onPress(); });
  const json = JSON.stringify(tree.toJSON());
  expect(json).toContain('"fill":"#c0392b"');
});
```

- [ ] **Step 7: Run tests — expect failures on the updated circle tests only**

```bash
npx jest src/screens/__tests__/ProgressionsScreen.test.tsx --no-coverage
```

Expected output: The 9 updated circle tests **fail** (because `testID="circle-collapse-header"` doesn't exist yet — `findAll` returns an empty array, `[0]` is `undefined`, then `undefined.props.onPress()` throws `TypeError: Cannot read properties of undefined (reading 'props')`). All other tests pass. This confirms the tests are correctly wired and will pass once the implementation is in place.

- [ ] **Step 8: Commit**

Write to `/tmp/msg.txt` using the Write tool:
```
test(progressions): update circle tests to expand before querying SVG
```
Then commit:
```bash
git add src/screens/__tests__/ProgressionsScreen.test.tsx
git commit -F /tmp/msg.txt
```

---

## Chunk 2: Piano Key Picker + Diatonic Label

### Task 3: Write failing tests for piano key picker

**Files:**
- Modify: `src/screens/__tests__/ProgressionsScreen.test.tsx`

- [ ] **Step 1: Add 3 new failing tests at the end of the `describe` block**

```typescript
// ── Piano key picker ──────────────────────────────────────────────────────

test('tapping a natural key chip updates root', () => {
  let tree: any;
  act(() => { tree = create(<ProgressionsScreen />); });

  // Tap F (pitch class 5)
  const fChip = tree.root.findAll(
    (el: any) => el.props.testID === 'key-natural-5'
  )[0];
  act(() => { fChip.props.onPress(); });

  const json = JSON.stringify(tree.toJSON());
  // F major diatonic label should now read "Chords in key of F"
  expect(json).toContain('key of F');
});

test('tapping an accidental key chip updates root', () => {
  let tree: any;
  act(() => { tree = create(<ProgressionsScreen />); });

  // Tap F# (pitch class 6)
  const fSharpChip = tree.root.findAll(
    (el: any) => el.props.testID === 'key-accidental-6'
  )[0];
  act(() => { fSharpChip.props.onPress(); });

  const json = JSON.stringify(tree.toJSON());
  expect(json).toContain('key of F#');
});

test('tapping a key chip resets the progression', () => {
  let tree: any;
  act(() => { tree = create(<ProgressionsScreen />); });

  // Add two chords to progression
  const diatonicBtns = tree.root.findAllByType('TouchableOpacity').filter(
    (el: any) => el.props.testID === 'diatonic-btn'
  );
  act(() => { diatonicBtns[0].props.onPress(); }); // I
  act(() => { diatonicBtns[3].props.onPress(); }); // IV

  // Verify 2 cards exist
  const before = tree.root.findAllByType('TouchableOpacity').filter(
    (el: any) => el.props.testID === 'progression-card'
  );
  expect(before.length).toBe(2);

  // Tap G (pitch class 7) to change key
  const gChip = tree.root.findAll(
    (el: any) => el.props.testID === 'key-natural-7'
  )[0];
  act(() => { gChip.props.onPress(); });

  // Progression should be empty
  const after = tree.root.findAllByType('TouchableOpacity').filter(
    (el: any) => el.props.testID === 'progression-card'
  );
  expect(after.length).toBe(0);
});
```

- [ ] **Step 2: Run tests to verify new tests fail**

```bash
npx jest src/screens/__tests__/ProgressionsScreen.test.tsx --no-coverage
```

Expected: The 3 new tests fail with `Cannot read properties of undefined (reading 'props')` — the `testID="key-natural-5"` chips don't exist yet.

---

### Task 4: Implement piano key picker + diatonic label update

**Files:**
- Modify: `src/screens/ProgressionsScreen.tsx`

- [ ] **Step 1: Add imports and constants**

At the top of `src/screens/ProgressionsScreen.tsx`, add `LayoutAnimation` to the react-native import line:

```typescript
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions, LayoutAnimation } from 'react-native';
```

Add these two constants above the `ProgressionsScreen` function (after the existing imports):

```typescript
const NATURAL_KEYS: { label: string; pc: number }[] = [
  { label: 'C', pc: 0 }, { label: 'D', pc: 2 }, { label: 'E', pc: 4 },
  { label: 'F', pc: 5 }, { label: 'G', pc: 7 }, { label: 'A', pc: 9 },
  { label: 'B', pc: 11 },
];

const ACCIDENTAL_SLOTS: ({ pc: number } | null)[] = [
  { pc: 1 }, { pc: 3 }, null, { pc: 6 }, { pc: 8 }, { pc: 10 }, null,
];
```

- [ ] **Step 2: Add `naturalRowWidth` state and `slotWidth` derived value**

Inside `ProgressionsScreen()`, after the existing state declarations, add:

```typescript
const [naturalRowWidth, setNaturalRowWidth] = useState(0);
const slotWidth = naturalRowWidth > 0 ? naturalRowWidth / 7 : 0;
```

- [ ] **Step 3: Replace the diatonic section label and remove hint text**

Find this block in the JSX return:
```typescript
<Text style={[styles.label, { color: theme.textSecondary }]}>Diatonic Chords</Text>
<Text style={[styles.hint, { color: theme.textMuted }]}>These 7 chords all belong to the key of {(useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES)[root]}. Tap any to add it to your progression.</Text>
```

Replace with:
```typescript
<Text style={[styles.label, { color: theme.textSecondary }]}>
  {'Chords in key of ' + (useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES)[root]}
</Text>
```

- [ ] **Step 4: Add the piano key picker card in the JSX, above the diatonic label**

Insert this block immediately before the diatonic section label from Step 3:

```typescript
{/* Piano key picker */}
<View style={[styles.keyCard, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}>
  <View
    style={styles.naturalsRow}
    onLayout={(e) => setNaturalRowWidth(e.nativeEvent.layout.width)}
  >
    {NATURAL_KEYS.map(({ label, pc }) => (
      <TouchableOpacity
        key={pc}
        testID={`key-natural-${pc}`}
        style={[
          styles.keyChip,
          {
            backgroundColor: root === pc ? theme.accent : theme.bgTertiary,
            borderColor: root === pc ? theme.accent : theme.border,
          },
        ]}
        onPress={() => handleKeySelect(pc)}
      >
        <Text style={[styles.keyChipText, { color: root === pc ? '#fff' : theme.textPrimary }]}>
          {label}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
  <View
    style={[
      styles.accidentalsRow,
      { marginLeft: slotWidth / 2, opacity: naturalRowWidth > 0 ? 1 : 0 },
    ]}
  >
    {ACCIDENTAL_SLOTS.map((slot, i) =>
      !slot ? (
        <View key={i} style={styles.keySlot} />
      ) : (
        <TouchableOpacity
          key={slot.pc}
          testID={`key-accidental-${slot.pc}`}
          style={[
            styles.keyChip,
            {
              backgroundColor: root === slot.pc ? theme.accent : theme.bgTertiary,
              borderColor: root === slot.pc ? theme.accent : theme.border,
            },
          ]}
          onPress={() => handleKeySelect(slot.pc)}
        >
          <Text style={[styles.keyChipText, { color: root === slot.pc ? '#fff' : theme.textPrimary }]}>
            {(useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES)[slot.pc]}
          </Text>
        </TouchableOpacity>
      )
    )}
  </View>
</View>
```

- [ ] **Step 5: Add new styles to `StyleSheet.create`**

Add to the existing `styles` object:

```typescript
keyCard: {
  borderRadius: 12,
  borderWidth: 1,
  padding: 10,
  marginBottom: 12,
},
naturalsRow: {
  flexDirection: 'row',
  gap: 3,
  marginBottom: 3,
},
accidentalsRow: {
  flexDirection: 'row',
  gap: 3,
},
keySlot: {
  flex: 1,
},
keyChip: {
  flex: 1,
  alignItems: 'center',
  paddingVertical: 7,
  borderRadius: 6,
  borderWidth: 1,
},
keyChipText: {
  fontSize: 12,
  fontWeight: '700',
},
```

- [ ] **Step 6: Run the 3 new tests to verify they now pass**

```bash
npx jest src/screens/__tests__/ProgressionsScreen.test.tsx --no-coverage -t "natural key chip|accidental key chip|resets the progression"
```

Expected: All 3 pass.

- [ ] **Step 7: Run the full test file**

```bash
npx jest src/screens/__tests__/ProgressionsScreen.test.tsx --no-coverage
```

Expected: The 9 updated circle tests still fail (circle not yet collapsible). All other tests pass.

- [ ] **Step 8: Commit**

Write to `/tmp/msg.txt` using the Write tool:
```
feat(progressions): add piano key picker and dynamic diatonic label
```
Then commit:
```bash
git add src/screens/ProgressionsScreen.tsx src/screens/__tests__/ProgressionsScreen.test.tsx
git commit -F /tmp/msg.txt
```

---

## Chunk 3: Progression Builder

### Task 5: Write failing test for ✕ remove button

**Files:**
- Modify: `src/screens/__tests__/ProgressionsScreen.test.tsx`

- [ ] **Step 1: Add the ✕ remove test**

```typescript
test('✕ button removes chord at correct position', () => {
  let tree: any;
  act(() => { tree = create(<ProgressionsScreen />); });

  const diatonicBtns = tree.root.findAllByType('TouchableOpacity').filter(
    (el: any) => el.props.testID === 'diatonic-btn'
  );

  // Add I, IV, V (indices 0, 3, 4)
  act(() => { diatonicBtns[0].props.onPress(); }); // I
  act(() => { diatonicBtns[3].props.onPress(); }); // IV
  act(() => { diatonicBtns[4].props.onPress(); }); // V

  // Verify 3 cards
  const cardsBefore = tree.root.findAllByType('TouchableOpacity').filter(
    (el: any) => el.props.testID === 'progression-card'
  );
  expect(cardsBefore.length).toBe(3);

  // Tap the ✕ on position 1 (IV)
  const removeBtn = tree.root.findAll(
    (el: any) => el.props.testID === 'remove-chord-1'
  )[0];
  act(() => { removeBtn.props.onPress(); });

  // Should now have 2 cards
  const cardsAfter = tree.root.findAllByType('TouchableOpacity').filter(
    (el: any) => el.props.testID === 'progression-card'
  );
  expect(cardsAfter.length).toBe(2);
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest src/screens/__tests__/ProgressionsScreen.test.tsx --no-coverage -t "removes chord at correct position"
```

Expected: FAIL — `testID="remove-chord-1"` not found.

---

### Task 6: Implement progression builder changes

**Files:**
- Modify: `src/screens/ProgressionsScreen.tsx`

- [ ] **Step 1: Replace the progression `View` with a horizontal `ScrollView`**

Find the current progression row in the JSX:
```typescript
<View style={styles.progressionRow}>
  {progression.map((chordIndex, pos) => {
    ...
    return (
      <TouchableOpacity
        key={pos}
        testID="progression-card"
        onPress={() => removeChordAtPos(pos)}
        style={[styles.progressionCard, { ... }]}
      >
        ...
      </TouchableOpacity>
    );
  })}
  {/* Placeholder */}
  <View style={...}>
    ...
    <Text ...>{progression.length === 0 ? 'Tap a diatonic above' : 'Add more'}</Text>
  </View>
</View>
```

Replace the entire block with:

```typescript
<ScrollView
  horizontal={true}
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={styles.progressionRow}
>
  {progression.map((chordIndex, pos) => {
    const chord = diatonicChords[chordIndex];
    const voicing = getVoicing(chord.root, chord.quality);
    const noteName = (useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES)[chord.root];
    const qualitySuffix = chord.quality === 'Dim' ? '°' : chord.quality === 'Minor' ? 'm' : '';
    return (
      <TouchableOpacity
        key={pos}
        testID="progression-card"
        style={[
          styles.progressionCard,
          { backgroundColor: theme.bgSecondary, borderColor: theme.border },
        ]}
      >
        <TouchableOpacity
          testID={`remove-chord-${pos}`}
          style={styles.removeBtn}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          accessibilityLabel={`Remove ${noteName}${qualitySuffix}`}
          onPress={() => removeChordAtPos(pos)}
        >
          <Text style={[styles.removeBtnText, { color: theme.textMuted }]}>✕</Text>
        </TouchableOpacity>
        <Text style={[styles.progressionNumeral, { color: theme.textMuted }]}>
          {chord.numeral}
        </Text>
        <Text style={[styles.progressionChordName, { color: theme.textPrimary }]}>
          {noteName}{qualitySuffix}
        </Text>
        <ChordDiagram voicing={voicing} root={chord.root} />
      </TouchableOpacity>
    );
  })}
  <View style={[styles.progressionPlaceholder, { borderColor: theme.border }]}>
    <Text style={[styles.placeholderIcon, { color: theme.textMuted }]}>+</Text>
    <Text style={[styles.placeholderLabel, { color: theme.textMuted }]}>
      {progression.length === 0 ? 'Tap a chord above' : 'Add more'}
    </Text>
  </View>
</ScrollView>
```

- [ ] **Step 2: Add `removeBtn` and `removeBtnText` to `StyleSheet.create`**

```typescript
removeBtn: {
  position: 'absolute',
  top: 4,
  right: 4,
},
removeBtnText: {
  fontSize: 12,
  fontWeight: '300',
},
```

- [ ] **Step 3: Run the ✕ remove test**

```bash
npx jest src/screens/__tests__/ProgressionsScreen.test.tsx --no-coverage -t "removes chord at correct position"
```

Expected: PASS.

- [ ] **Step 4: Run the full test file**

```bash
npx jest src/screens/__tests__/ProgressionsScreen.test.tsx --no-coverage
```

Expected: The 9 updated circle tests still fail. All other tests pass (including the `'tapping a diatonic chord card multiple times appends duplicates'` test — the outer card is still a `TouchableOpacity`).

- [ ] **Step 5: Commit**

Write to `/tmp/msg.txt` using the Write tool:
```
feat(progressions): horizontal scroll + explicit ✕ remove button
```
Then commit:
```bash
git add src/screens/ProgressionsScreen.tsx src/screens/__tests__/ProgressionsScreen.test.tsx
git commit -F /tmp/msg.txt
```

---

## Chunk 4: Collapsible Circle + Android Guard

### Task 7: Write failing tests for collapsible circle

**Files:**
- Modify: `src/screens/__tests__/ProgressionsScreen.test.tsx`

- [ ] **Step 1: Add 3 new collapsible circle tests**

```typescript
// ── Collapsible Circle of Fifths ─────────────────────────────────────────

test('circle is collapsed by default — SVG not in tree', () => {
  let tree: any;
  act(() => { tree = create(<ProgressionsScreen />); });
  // The circle SVG renders as <Svg> which maps to 'Svg' in the mock.
  // When collapsed, no Svg elements from the circle should be present.
  // We check that the pressable G elements (circle nodes) are absent.
  const circleNodes = tree.root.findAllByType('G').filter(
    (el: any) => el.props.onPress != null
  );
  expect(circleNodes.length).toBe(0);
});

test('tapping circle header expands circle SVG', () => {
  let tree: any;
  act(() => { tree = create(<ProgressionsScreen />); });

  const header = tree.root.findAll(
    (el: any) => el.props.testID === 'circle-collapse-header'
  )[0];
  act(() => { header.props.onPress(); });

  // After expanding, the 12 pressable G nodes should be visible
  const circleNodes = tree.root.findAllByType('G').filter(
    (el: any) => el.props.onPress != null
  );
  expect(circleNodes.length).toBe(12);
});

test('tapping circle header a second time collapses circle', () => {
  let tree: any;
  act(() => { tree = create(<ProgressionsScreen />); });

  const header = tree.root.findAll(
    (el: any) => el.props.testID === 'circle-collapse-header'
  )[0];
  act(() => { header.props.onPress(); }); // expand

  // Verify expanded
  const nodesAfterExpand = tree.root.findAllByType('G').filter(
    (el: any) => el.props.onPress != null
  );
  expect(nodesAfterExpand.length).toBe(12);

  act(() => { header.props.onPress(); }); // collapse again

  const nodesAfterCollapse = tree.root.findAllByType('G').filter(
    (el: any) => el.props.onPress != null
  );
  expect(nodesAfterCollapse.length).toBe(0);
});

test('tapping a circle key node collapses circle and updates root', () => {
  let tree: any;
  act(() => { tree = create(<ProgressionsScreen />); });

  // Expand circle
  const header = tree.root.findAll(
    (el: any) => el.props.testID === 'circle-collapse-header'
  )[0];
  act(() => { header.props.onPress(); });

  // Tap G node (CIRCLE_OF_FIFTHS[1] = 7)
  const circleNodes = tree.root.findAllByType('G').filter(
    (el: any) => el.props.onPress != null
  );
  act(() => { circleNodes[1].props.onPress(); });

  // Circle should be collapsed again
  const circleNodesAfter = tree.root.findAllByType('G').filter(
    (el: any) => el.props.onPress != null
  );
  expect(circleNodesAfter.length).toBe(0);

  // Root should have updated — G major diatonic includes D as V
  const json = JSON.stringify(tree.toJSON());
  expect(json).toContain('D');
});
```

- [ ] **Step 2: Run new tests to verify they fail**

```bash
npx jest src/screens/__tests__/ProgressionsScreen.test.tsx --no-coverage -t "collapsed by default|tapping circle header|second time collapses|circle key node"
```

Expected: All 4 fail — `testID="circle-collapse-header"` not found yet.

---

### Task 8: Implement collapsible circle

**Files:**
- Modify: `src/screens/ProgressionsScreen.tsx`

- [ ] **Step 1: Add `circleExpanded` state**

Inside `ProgressionsScreen()`, add:
```typescript
const [circleExpanded, setCircleExpanded] = useState(false);
```

- [ ] **Step 2: Add `toggleCircle()` helper**

After the existing `removeChordAtPos` function:
```typescript
const toggleCircle = () => {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  setCircleExpanded(prev => !prev);
};
```

- [ ] **Step 3: Update `handleKeySelect` to collapse circle**

Find the current `handleKeySelect`:
```typescript
const handleKeySelect = (note: number) => {
  setRoot(note);
  setProgression([]);
};
```

Replace with:
```typescript
const handleKeySelect = (note: number) => {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  setRoot(note);
  setProgression([]);
  setCircleExpanded(false);
};
```

- [ ] **Step 4: Replace the always-visible circle section with the collapsible row**

Find and remove this block from the JSX (near the bottom of the ScrollView content):
```typescript
<Text style={[styles.label, { color: theme.textSecondary }]}>Circle of Fifths</Text>
<Text style={[styles.hint, { color: theme.textMuted }]}>Tap the circle to change key</Text>
<View style={styles.circleContainer}>
  {renderCircleOfFifths()}
</View>
```

Replace with:
```typescript
<TouchableOpacity
  testID="circle-collapse-header"
  style={[styles.circleHeader, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}
  onPress={toggleCircle}
>
  <View style={styles.circleHeaderLeft}>
    <Text style={[styles.circleHeaderIcon, { color: theme.accent }]}>●</Text>
    <View>
      <Text style={[styles.circleHeaderLabel, { color: theme.textPrimary }]}>
        Circle of Fifths
      </Text>
      <Text style={[styles.circleHeaderSub, { color: theme.textMuted }]}>
        Tap to explore key relationships
      </Text>
    </View>
  </View>
  <Text
    style={[
      styles.circleChevron,
      { color: theme.textMuted, transform: [{ rotate: circleExpanded ? '90deg' : '0deg' }] },
    ]}
  >
    ›
  </Text>
</TouchableOpacity>
{circleExpanded && (
  <View style={styles.circleContainer}>
    {renderCircleOfFifths()}
  </View>
)}
```

- [ ] **Step 5: Add new styles for the collapsible row**

```typescript
circleHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: 12,
  borderRadius: 10,
  borderWidth: 1,
  marginTop: 8,
},
circleHeaderLeft: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
},
circleHeaderIcon: { fontSize: 16 },
circleHeaderLabel: { fontSize: 14, fontWeight: '600' },
circleHeaderSub: { fontSize: 11, marginTop: 1 },
circleChevron: { fontSize: 20, fontWeight: '300' },
```

- [ ] **Step 6: Run the 4 new collapsible circle tests**

```bash
npx jest src/screens/__tests__/ProgressionsScreen.test.tsx --no-coverage -t "collapsed by default|tapping circle header|second time collapses|circle key node"
```

Expected: All 4 pass.

- [ ] **Step 7: Run the full test file — expect all tests to pass**

```bash
npx jest src/screens/__tests__/ProgressionsScreen.test.tsx --no-coverage
```

Expected: **All tests pass.** The 9 previously-failing circle tests now pass because `testID="circle-collapse-header"` exists.

- [ ] **Step 8: Commit**

Write to `/tmp/msg.txt` using the Write tool:
```
feat(progressions): collapsible Circle of Fifths row
```
Then commit:
```bash
git add src/screens/ProgressionsScreen.tsx src/screens/__tests__/ProgressionsScreen.test.tsx
git commit -F /tmp/msg.txt
```

---

### Task 9: Android LayoutAnimation guard in App.tsx

**Files:**
- Modify: `App.tsx`

- [ ] **Step 1: Add the guard to `App.tsx`**

Open `App.tsx`. Near the top, after the existing imports, add:

```typescript
import { UIManager, Platform } from 'react-native';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
```

If `react-native` is already imported in `App.tsx`, add `UIManager` and `Platform` to the existing import destructuring rather than adding a second import line.

- [ ] **Step 2: Run the full test suite to confirm nothing broke**

```bash
npm test -- --no-coverage
```

Expected: All tests pass (the `jest.setup.ts` mock already handles `UIManager` and `Platform`).

- [ ] **Step 3: Commit**

Write to `/tmp/msg.txt` using the Write tool:
```
chore: enable LayoutAnimation on Android
```
Then commit:
```bash
git add App.tsx
git commit -F /tmp/msg.txt
```

---

### Task 10: Final verification

- [ ] **Step 1: Run the complete test suite one last time**

```bash
npm test -- --no-coverage
```

Expected: All tests pass. Zero failures.

- [ ] **Step 2: Manual smoke test in the simulator**

```bash
npm run ios
```

Verify:
1. Progressions tab loads with the piano key picker at the top
2. Tapping C, G, F# updates the diatonic palette label
3. Tapping a diatonic chord button appends a card with a ✕ in the top-right corner
4. Tapping ✕ removes just that card
5. The "Circle of Fifths" collapsed row is visible at the bottom
6. Tapping it expands to show the full SVG; tapping again collapses it
7. Tapping a key in the circle updates the key picker and collapses the circle

- [ ] **Step 3: Final commit if any polish was applied during smoke test**

If changes were made during smoke test, stage the specific files that changed:
```bash
git add src/screens/ProgressionsScreen.tsx
```
Write to `/tmp/msg.txt` using the Write tool:
```
chore(progressions): post-smoke-test polish
```
Then commit:
```bash
git commit -F /tmp/msg.txt
```
If no changes were made during smoke test, skip this step.
