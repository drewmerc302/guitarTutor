# Responsive Layout Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add adaptive tablet/desktop layouts using a 768px breakpoint.

**Architecture:** Create a `useResponsive()` hook with `isTablet` boolean. Each screen uses a flex row layout on tablet (controls left ~40%, fretboard right ~60%) vs current column layout on phone.

**Tech Stack:** React Native, useWindowDimensions

---

## Task 1: Create useResponsive Hook

**Files:**
- Create: `src/hooks/useResponsive.ts`

**Step 1: Write the failing test**

```typescript
// src/hooks/__tests__/useResponsive.test.ts
import { renderHook } from '@testing-library/react-native';
import { useResponsive } from '../useResponsive';

jest.mock('react-native', () => ({
  useWindowDimensions: () => ({ width: 400, height: 800 }),
}));

describe('useResponsive', () => {
  it('returns isTablet false when width < 768', () => {
    const { result } = renderHook(() => useResponsive());
    expect(result.current.isTablet).toBe(false);
  });
});
```

**Step 2: Run test to verify it fails**
Run: `npm test -- --testPathPattern="useResponsive" -v`
Expected: FAIL (hook not defined)

**Step 3: Write minimal implementation**

```typescript
// src/hooks/useResponsive.ts
import { useWindowDimensions } from 'react-native';

const TABLET_BREAKPOINT = 768;

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= TABLET_BREAKPOINT;
  const isLandscape = width > height;
  
  return {
    isTablet,
    isLandscape,
    width,
    height,
  };
}
```

**Step 4: Run test to verify it passes**
Run: `npm test -- --testPathPattern="useResponsive" -v`
Expected: PASS

**Step 5: Commit**
```bash
git add src/hooks/useResponsive.ts src/hooks/__tests__/useResponsive.test.ts
git commit -m "feat: add useResponsive hook with tablet breakpoint"
```

---

## Task 2: Add Responsive Layout to ScalesScreen

**Files:**
- Modify: `src/screens/ScalesScreen.tsx`

**Step 1: Write the failing test**

```typescript
// Add to existing ScalesScreen tests
it('renders two-column layout on tablet', () => {
  (useWindowDimensions as jest.Mock).mockReturnValue({ width: 1024, height: 768 });
  render(<ScalesScreen />);
  const container = screen.getByTestId('scales-content');
  expect(container.props.style).toMatchObject({ flexDirection: 'row' });
});
```

**Step 2: Run test to verify it fails**
Run: `npm test -- --testPathPattern="ScalesScreen" -v`
Expected: FAIL (flexDirection not 'row')

**Step 3: Write minimal implementation**

Import hook at top:
```typescript
import { useResponsive } from '../hooks/useResponsive';
```

Update component to use responsive:
```typescript
export function ScalesScreen() {
  const { theme } = useTheme();
  const { isTablet } = useResponsive();
  // ... existing state ...

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgPrimary }]} edges={['top']}>
      <ScrollView contentContainerStyle={[
        styles.content,
        isTablet && styles.contentTablet
      ]}>
        <View style={[
          styles.mainRow,
          isTablet && styles.mainRowTablet
        ]}>
          <View style={[
            styles.controlsPanel,
            isTablet && styles.controlsPanelTablet
          ]}>
            {/* All existing controls go here */}
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: theme.textPrimary }]}>Scales</Text>
            </View>
            <RootPicker root={root} onRootChange={(r) => setRoot(r)} />
            <Text style={[styles.label, { color: theme.textSecondary }]}>Type</Text>
            <ChipPicker options={scaleTypes} activeOption={type} onSelect={setType} />
            <Text style={[styles.label, { color: theme.textSecondary }]}>Display</Text>
            <SegmentedControl options={['Interval', 'Note']} activeOption={display} onSelect={setDisplay} />
            <Text style={[styles.label, { color: theme.textSecondary }]}>Position</Text>
            <ChipPicker multiSelect options={positionOptions} activeOptions={activeChipOptions} onToggle={handlePositionChipToggle} />
            <Text style={[styles.hint, { color: theme.textMuted }]}>A box is a scale pattern...</Text>
            {/* Advanced toggle and mode picker */}
            {advancedOpen && is7Note && (
              <>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Mode</Text>
                <ChipPicker options={MODE_NAMES} activeOption={MODE_NAMES[mode]} onSelect={(m) => setMode(MODE_NAMES.indexOf(m))} />
              </>
            )}
          </View>
          <View style={[styles.neckContainer, isTablet && styles.neckContainerTablet]}>
            <FretboardViewer
              notes={isAllActive ? positions.flatMap(p => p.notes) : Array.from(activePositions).flatMap(key => positions[parseInt(key)]?.notes || [])}
              displayMode={display.toLowerCase() as 'finger' | 'interval' | 'note'}
              activeNoteSet={activeNoteSet}
              boxHighlights={boxHighlights}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

Add new styles:
```typescript
const styles = StyleSheet.create({
  // ... existing styles ...
  contentTablet: {
    paddingHorizontal: 24,
  },
  mainRow: {
    flexDirection: 'column',
  },
  mainRowTablet: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  controlsPanel: {
    width: '100%',
  },
  controlsPanelTablet: {
    width: '40%',
    paddingRight: 24,
  },
  neckContainerTablet: {
    flex: 1,
    marginTop: 0,
  },
});
```

**Step 4: Run test to verify it passes**
Run: `npm test -- --testPathPattern="ScalesScreen" -v`
Expected: PASS

**Step 5: Commit**
```bash
git add src/screens/ScalesScreen.tsx
git commit -m "feat: add responsive layout to ScalesScreen"
```

---

## Task 3: Add Responsive Layout to ChordsScreen

**Files:**
- Modify: `src/screens/ChordsScreen.tsx`

**Step 1: Write the failing test**

```typescript
// Add to existing ChordsScreen tests
it('renders two-column layout on tablet', () => {
  (useWindowDimensions as jest.Mock).mockReturnValue({ width: 1024, height: 768 });
  render(<ChordsScreen />);
  const container = screen.getByTestId('chords-content');
  expect(container.props.style).toMatchObject({ flexDirection: 'row' });
});
```

**Step 2: Run test to verify it fails**
Run: `npm test -- --testPathPattern="ChordsScreen" -v`
Expected: FAIL

**Step 3: Write implementation**

Add import:
```typescript
import { useResponsive } from '../hooks/useResponsive';
```

Update component:
```typescript
export function ChordsScreen() {
  const { theme } = useTheme();
  const { isTablet } = useResponsive();
  // ... existing state ...

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgPrimary }]} edges={['top']}>
      <ScrollView contentContainerStyle={[
        styles.content,
        isTablet && styles.contentTablet
      ]}>
        <View style={[
          styles.mainRow,
          isTablet && styles.mainRowTablet
        ]}>
          <View style={[
            styles.controlsPanel,
            isTablet && styles.controlsPanelTablet
          ]}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: theme.textPrimary }]}>Chords</Text>
            </View>
            <RootPicker root={root} onRootChange={(r) => setRoot(r)} />
            <Text style={[styles.label, { color: theme.textSecondary }]}>Type</Text>
            <ChipPicker options={chordTypes} activeOption={type} onSelect={setType} />
            <Text style={[styles.label, { color: theme.textSecondary }]}>Voicing</Text>
            <SegmentedControl options={voicingLabels} activeOption={String(activeVoicingIndex)} onSelect={(v) => setActiveVoicingIndex(Number(v))} />
            <ChordDiagram root={root} type={type} voicing={activeVoicing} />
          </View>
          <View style={[styles.neckContainer, isTablet && styles.neckContainerTablet]}>
            <FretboardViewer
              notes={allNotes}
              displayMode={display.toLowerCase() as 'finger' | 'interval' | 'note'}
              activeVoicing={activeVoicingSet}
              hasVoicings={voicings.length > 1}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

Add styles (similar to ScalesScreen):
```typescript
contentTablet: { paddingHorizontal: 24 },
mainRow: { flexDirection: 'column' },
mainRowTablet: { flexDirection: 'row', alignItems: 'flex-start' },
controlsPanel: { width: '100%' },
controlsPanelTablet: { width: '40%', paddingRight: 24 },
neckContainer: { alignItems: 'center', marginTop: 24 },
neckContainerTablet: { flex: 1, marginTop: 0 },
```

**Step 4: Run test to verify it passes**
Run: `npm test -- --testPathPattern="ChordsScreen" -v`
Expected: PASS

**Step 5: Commit**
```bash
git add src/screens/ChordsScreen.tsx
git commit -m "feat: add responsive layout to ChordsScreen"
```

---

## Task 4: Add Responsive Layout to TriadsScreen

**Files:**
- Modify: `src/screens/TriadsScreen.tsx`

**Step 1: Write the failing test**

```typescript
it('renders two-column layout on tablet', () => {
  (useWindowDimensions as jest.Mock).mockReturnValue({ width: 1024, height: 768 });
  render(<TriadsScreen />);
  const container = screen.getByTestId('triads-content');
  expect(container.props.style).toMatchObject({ flexDirection: 'row' });
});
```

**Step 2: Run test to verify it fails**
Run: `npm test -- --testPathPattern="TriadsScreen" -v`
Expected: FAIL

**Step 3: Write implementation**

Apply same pattern as ScalesScreen/ChordsScreen:
- Import `useResponsive`
- Add `isTablet` from hook
- Wrap controls in `controlsPanel` with responsive styles
- Apply `flex: 1` to fretboard container on tablet
- Add tablet styles

**Step 4: Run test to verify it passes**
Run: `npm test -- --testPathPattern="TriadsScreen" -v`
Expected: PASS

**Step 5: Commit**
```bash
git add src/screens/TriadsScreen.tsx
git commit -m "feat: add responsive layout to TriadsScreen"
```

---

## Task 5: Add Responsive Layout to ArpeggiosScreen

**Files:**
- Modify: `src/screens/ArpeggiosScreen.tsx`

**Step 1: Write the failing test**

```typescript
it('renders two-column layout on tablet', () => {
  (useWindowDimensions as jest.Mock).mockReturnValue({ width: 1024, height: 768 });
  render(<ArpeggiosScreen />);
  const container = screen.getByTestId('arpeggios-content');
  expect(container.props.style).toMatchObject({ flexDirection: 'row' });
});
```

**Step 2: Run test to verify it fails**
Run: `npm test -- --testPathPattern="ArpeggiosScreen" -v`
Expected: FAIL

**Step 3: Write implementation**

Apply same responsive pattern as other screens.

**Step 4: Run test to verify it passes**
Run: `npm test -- --testPathPattern="ArpeggiosScreen" -v`
Expected: PASS

**Step 5: Commit**
```bash
git add src/screens/ArpeggiosScreen.tsx
git commit -m "feat: add responsive layout to ArpeggiosScreen"
```

---

## Task 6: Add Responsive Layout to ProgressionsScreen

**Files:**
- Modify: `src/screens/ProgressionsScreen.tsx`

**Step 1: Write the failing test**

```typescript
it('scales Circle of Fifths on tablet', () => {
  (useWindowDimensions as jest.Mock).mockReturnValue({ width: 1024, height: 768 });
  render(<ProgressionsScreen />);
  const svg = screen.getByTestId('circle-of-fifths');
  expect(svg.props.width).toBeGreaterThan(400); // scales with screen
});
```

**Step 2: Run test to verify it fails**
Run: `npm test -- --testPathPattern="ProgressionsScreen" -v`
Expected: FAIL

**Step 3: Write implementation**

ProgressionsScreen already uses `useWindowDimensions`. Update to use `useResponsive` and apply responsive layout to controls vs Circle of Fifths:

```typescript
import { useResponsive } from '../hooks/useResponsive';

export function ProgressionsScreen() {
  const { theme, useFlats, isDark } = useTheme();
  const { isTablet } = useResponsive();
  // ... existing code ...

  // Update svgSize calculation
  const { width: screenWidth } = useWindowDimensions();
  const baseSize = isTablet ? Math.min(screenWidth * 0.5, 500) : screenWidth - 32;
  const svgSize = baseSize;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgPrimary }]} edges={['top']}>
      <ScrollView contentContainerStyle={[
        styles.content,
        isTablet && styles.contentTablet
      ]}>
        <View style={[
          styles.mainRow,
          isTablet && styles.mainRowTablet
        ]}>
          <View style={[
            styles.controlsPanel,
            isTablet && styles.controlsPanelTablet
          ]}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: theme.textPrimary }]}>Progressions</Text>
            </View>
            {/* Key selector hint */}
            <Text style={[styles.hint, { color: theme.textMuted }]}>Tap the circle to change key</Text>
            {/* Diatonic chords row */}
            {/* Progression builder */}
          </View>
          <View style={[styles.circleContainer, isTablet && styles.circleContainerTablet]}>
            <Svg data-testid="circle-of-fifths" width={svgSize} height={svgSize} viewBox="0 0 300 300">
              {/* ... existing circle rendering */}
            </Svg>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

Add tablet styles:
```typescript
circleContainer: { alignItems: 'center', marginTop: 24 },
circleContainerTablet: { flex: 1, marginTop: 0, alignItems: 'center' },
```

**Step 4: Run test to verify it passes**
Run: `npm test -- --testPathPattern="ProgressionsScreen" -v`
Expected: PASS

**Step 5: Commit**
```bash
git add src/screens/ProgressionsScreen.tsx
git commit -m "feat: add responsive layout to ProgressionsScreen"
```

---

## Task 7: Verify All Tests Pass

**Step 1: Run full test suite**
Run: `npm test`
Expected: All tests pass

**Step 2: Commit**
```bash
git commit -m "test: verify all responsive layout tests pass"
```

---

## Task 8: Update App Navigator for Tablet (Optional Enhancement)

**Files:**
- Modify: `App.tsx`

**Step 1: Write the failing test**

```typescript
it('adjusts header for tablet', () => {
  (useWindowDimensions as jest.Mock).mockReturnValue({ width: 1024, height: 768 });
  render(<App />);
  const title = screen.getByText('GUITAR TUTOR');
  expect(title).toBeTruthy();
});
```

**Step 2: Run test to verify it fails**
Run: `npm test -- --testPathPattern="App" -v`
Expected: FAIL

**Step 3: Write implementation**

App.tsx already has `useWindowDimensions` and `isCompact`. Extend to use responsive:

```typescript
import { useResponsive } from './src/hooks/useResponsive';

function AppNavigator() {
  const { theme, isDark } = useTheme();
  const { isTablet, width } = useResponsive();
  const isCompact = width < 380;
  // ... existing code ...

  // Use isTablet to adjust tab bar height if desired
  const tabBarStyle = {
    ...existingTabBarStyle,
    height: isTablet ? 60 : 80, // smaller on tablet
  };
}
```

**Step 4: Run test to verify it passes**
Run: `npm test -- --testPathPattern="App" -v`
Expected: PASS

**Step 5: Commit**
```bash
git add App.tsx
git commit -m "feat: adjust App navigator for tablet"
```
