# Chords Tab — ChordPreview Below Fretboard

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Render a `ChordPreview` (large horizontal chord diagram with finger numbers) below the fretboard on the Chords tab, reactive to root-tap voicing changes.

**Architecture:** `ChordsScreen` already has `activeVoicing: ChordVoicing | null` and `activeRootName: string` that update whenever the user taps a root dot on the fretboard or changes the root/type. We simply render `ChordPreview` below the fretboard consuming those two values plus `root`. No new state, no engine changes.

**Tech Stack:** React Native, react-native-svg (via existing `ChordPreview` component), Jest/react-test-renderer.

---

## Context: what already exists

- `src/components/ChordPreview.tsx` — 200×150 SVG with horizontal strings, fret wires, finger-numbered dots, nut/fret-offset logic. Props: `voicing: ChordVoicing | null`, `root: number`, `chordName: string` (accepted but not internally rendered; label is shown by the parent).
- `src/screens/ChordsScreen.tsx` — already imports `FretboardViewer` and `RootPicker` from `../components`. Has `activeVoicing`, `activeRootName`, `root`, `type` all in scope.
- `src/components/index.ts` — already exports `ChordPreview`.

---

### Task 1: Add ChordPreview below the fretboard in ChordsScreen

**Files:**
- Modify: `src/screens/ChordsScreen.tsx`

**Step 1: Add `ChordPreview` to the import**

In `src/screens/ChordsScreen.tsx`, find:
```typescript
import { FretboardViewer, RootPicker } from '../components';
```
Change to:
```typescript
import { FretboardViewer, RootPicker, ChordPreview } from '../components';
```

**Step 2: Insert the diagram block after the neckContainer View**

Find this block (just before the voicing label):
```tsx
        <Text style={[styles.voicingLabel, { color: theme.textSecondary }]}>
          Voicing: {activeRootName} {type} ({activeVoicingIndex + 1}/{voicings.length})
        </Text>
```

Replace with:
```tsx
        {activeVoicing && (
          <View style={styles.diagramContainer}>
            <Text style={[styles.diagramChordName, { color: theme.textSecondary }]}>
              {activeRootName} {type}
            </Text>
            <ChordPreview
              voicing={activeVoicing}
              root={root}
              chordName={`${activeRootName} ${type}`}
            />
          </View>
        )}

        <Text style={[styles.voicingLabel, { color: theme.textMuted }]}>
          Voicing {activeVoicingIndex + 1}/{voicings.length}
        </Text>
```

**Step 3: Add the two new styles**

In the `StyleSheet.create({...})` block, add after `voicingHint`:
```typescript
  diagramContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  diagramChordName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
```

Also simplify the existing `voicingLabel` style — it no longer needs to spell out the full chord name so it can be a smaller muted hint:
```typescript
  voicingLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
```

---

### Task 2: Write and run a failing test, implement, verify

**Files:**
- Modify: `src/screens/__tests__/ChordsScreen.test.tsx`

**Step 1: Write a failing test**

Add this test to `src/screens/__tests__/ChordsScreen.test.tsx`, inside the `describe('ChordsScreen', ...)` block, before the closing `});`:

```typescript
test('renders ChordPreview below the fretboard', () => {
  let tree: any;
  act(() => { tree = create(<ChordsScreen />); });
  // ChordPreview renders an SVG — verify its voicing label appears
  const json = JSON.stringify(tree.toJSON());
  // Default: C Major — diagram chord name label should appear
  expect(json).toContain('C Major');
});

test('chord diagram name updates when type changes to Minor', () => {
  let tree: any;
  act(() => { tree = create(<ChordsScreen />); });

  const minorBtn = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Minor')[0];
  act(() => { minorBtn.props.onPress(); });

  const json = JSON.stringify(tree.toJSON());
  expect(json).toContain('C Minor');
});
```

**Step 2: Run test to verify it fails**

```bash
npx jest src/screens/__tests__/ChordsScreen.test.tsx --no-coverage
```

Expected: the `'renders ChordPreview below the fretboard'` test fails because "C Major" label is not yet rendered.

**Step 3: Implement** — complete Task 1 steps above.

**Step 4: Run test to verify it passes**

```bash
npx jest src/screens/__tests__/ChordsScreen.test.tsx --no-coverage
```

Expected: all tests pass.

**Step 5: Run the full suite**

```bash
npx jest --no-coverage
```

Expected: all tests pass, no regressions.

**Step 6: Commit**

```
feat(chords): add ChordPreview diagram below fretboard

Renders the active voicing as a large horizontal chord diagram
(with finger numbers) directly below the fretboard view. The
diagram updates live when the user taps a root note or changes
chord type, driven by the existing activeVoicing state.
```
