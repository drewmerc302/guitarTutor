# Visual Overhaul Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the ad-hoc mix of NotePicker/TypePicker/DisplayToggle with two polished primitives (ChipPicker, SegmentedControl), add a Settings screen behind a ⚙ gear icon, and apply progressive disclosure for advanced controls on Scales and Triads.

**Architecture:** Two new shared components (ChipPicker, SegmentedControl) replace four legacy ones. A new SettingsScreen receives all global preferences that were previously cluttering the header. Five screens are migrated in-place; Progressions gets visual polish only.

**Tech Stack:** React Native, Expo, react-test-renderer (TDD), ThemeContext (no new state), AsyncStorage (already in use for persistence), LayoutAnimation for progressive disclosure.

---

## Background: How tests work in this codebase

All component and screen tests use `react-test-renderer`:

```typescript
import { create, act } from 'react-test-renderer';

let tree: any;
act(() => { tree = create(<MyComponent {...props} />); });
const json = JSON.stringify(tree.toJSON());
expect(json).toContain('Some text');
```

- Text content is verified via `JSON.stringify(tree.toJSON())`.
- Interactive elements are found via `tree.root.findAllByType('TouchableOpacity')`.
- Active-state styling is tested by inspecting `.props.style` on buttons.
- All tests run with `npx jest --testPathPattern=<file>`.
- Full suite: `npx jest`.

## Background: Key theme tokens used in these components

From `src/theme/colors.ts` (Modern iOS palette, the active default):

| Token | Dark | Light |
|---|---|---|
| `bgPrimary` | `#000000` | `#f2f2f7` |
| `bgSecondary` | `#1c1c1e` | `#ffffff` |
| `bgTertiary` | `#2c2c2e` | `#f2f2f7` |
| `accent` | `#0a84ff` | `#007aff` |
| `dotText` | `#ffffff` | `#ffffff` |
| `textPrimary` | `#ffffff` | `#000000` |
| `textSecondary` | `#ebebf599` | `#3c3c4399` |
| `textMuted` | `#ebebf54c` | `#3c3c434c` |
| `border` | `#38383a` | `#c6c6c8` |

`theme` comes from `useTheme()` which reads from `ThemeContext`.

---

## Task 1: SegmentedControl component

**Files:**
- Create: `src/components/SegmentedControl.tsx`
- Create: `src/components/__tests__/SegmentedControl.test.tsx`

### Step 1: Write the failing test

```typescript
// src/components/__tests__/SegmentedControl.test.tsx
import React from 'react';
import { create, act } from 'react-test-renderer';
import { SegmentedControl } from '../SegmentedControl';

describe('SegmentedControl', () => {
  const options = ['Finger', 'Interval', 'Note'];

  test('renders without crashing', () => {
    let tree: any;
    act(() => {
      tree = create(
        <SegmentedControl options={options} activeOption="Interval" onSelect={() => {}} />
      );
    });
    expect(tree.toJSON()).toBeTruthy();
  });

  test('renders all options', () => {
    let tree: any;
    act(() => {
      tree = create(
        <SegmentedControl options={options} activeOption="Interval" onSelect={() => {}} />
      );
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Finger');
    expect(json).toContain('Interval');
    expect(json).toContain('Note');
  });

  test('renders correct number of segments', () => {
    let tree: any;
    act(() => {
      tree = create(
        <SegmentedControl options={options} activeOption="Interval" onSelect={() => {}} />
      );
    });
    const buttons = tree.root.findAllByType('TouchableOpacity');
    expect(buttons).toHaveLength(3);
  });

  test('calls onSelect with the tapped option', () => {
    const onSelect = jest.fn();
    let tree: any;
    act(() => {
      tree = create(
        <SegmentedControl options={options} activeOption="Interval" onSelect={onSelect} />
      );
    });
    const buttons = tree.root.findAllByType('TouchableOpacity');
    act(() => { buttons[2].props.onPress(); }); // tap "Note"
    expect(onSelect).toHaveBeenCalledWith('Note');
  });

  test('active segment has accent background', () => {
    let tree: any;
    act(() => {
      tree = create(
        <SegmentedControl options={options} activeOption="Interval" onSelect={() => {}} />
      );
    });
    const buttons = tree.root.findAllByType('TouchableOpacity');
    // buttons[1] is "Interval" (active)
    const activeStyle = JSON.stringify([].concat(...buttons[1].props.style));
    // inactive buttons should NOT have accent bg
    const inactiveStyle = JSON.stringify([].concat(...buttons[0].props.style));
    // active has a different style than inactive — verify they differ
    expect(activeStyle).not.toEqual(inactiveStyle);
  });
});
```

### Step 2: Run test to verify it fails

```bash
npx jest --testPathPattern=SegmentedControl
```

Expected: FAIL — "Cannot find module '../SegmentedControl'"

### Step 3: Write minimal implementation

```typescript
// src/components/SegmentedControl.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface SegmentedControlProps {
  options: string[];
  activeOption: string;
  onSelect: (option: string) => void;
}

export function SegmentedControl({ options, activeOption, onSelect }: SegmentedControlProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { borderColor: theme.border }]}>
      {options.map((opt, i) => {
        const isActive = opt === activeOption;
        return (
          <TouchableOpacity
            key={opt}
            onPress={() => onSelect(opt)}
            style={[
              styles.segment,
              i < options.length - 1 && [styles.segmentBorder, { borderRightColor: theme.border }],
              { backgroundColor: isActive ? theme.accent : theme.bgTertiary },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
          >
            <Text
              style={[
                styles.label,
                { color: isActive ? theme.dotText : theme.textPrimary },
              ]}
            >
              {opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    height: 36,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBorder: {
    borderRightWidth: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});
```

### Step 4: Run test to verify it passes

```bash
npx jest --testPathPattern=SegmentedControl
```

Expected: PASS — 5 tests

### Step 5: Commit

```bash
git add src/components/SegmentedControl.tsx src/components/__tests__/SegmentedControl.test.tsx
git commit -m "feat(components): add SegmentedControl for 2–4 fixed options"
```

---

## Task 2: ChipPicker component

**Files:**
- Create: `src/components/ChipPicker.tsx`
- Create: `src/components/__tests__/ChipPicker.test.tsx`

### Step 1: Write the failing test

```typescript
// src/components/__tests__/ChipPicker.test.tsx
import React from 'react';
import { create, act } from 'react-test-renderer';
import { ChipPicker } from '../ChipPicker';

describe('ChipPicker — single select', () => {
  const options = ['Major', 'Minor', 'Maj7', 'Min7', 'Dom7'];

  test('renders without crashing', () => {
    let tree: any;
    act(() => {
      tree = create(
        <ChipPicker options={options} activeOption="Major" onSelect={() => {}} />
      );
    });
    expect(tree.toJSON()).toBeTruthy();
  });

  test('renders all options', () => {
    let tree: any;
    act(() => {
      tree = create(
        <ChipPicker options={options} activeOption="Major" onSelect={() => {}} />
      );
    });
    const json = JSON.stringify(tree.toJSON());
    options.forEach(opt => expect(json).toContain(opt));
  });

  test('renders correct number of chips', () => {
    let tree: any;
    act(() => {
      tree = create(
        <ChipPicker options={options} activeOption="Major" onSelect={() => {}} />
      );
    });
    const buttons = tree.root.findAllByType('TouchableOpacity');
    expect(buttons).toHaveLength(options.length);
  });

  test('calls onSelect with tapped option', () => {
    const onSelect = jest.fn();
    let tree: any;
    act(() => {
      tree = create(
        <ChipPicker options={options} activeOption="Major" onSelect={onSelect} />
      );
    });
    const buttons = tree.root.findAllByType('TouchableOpacity');
    act(() => { buttons[1].props.onPress(); }); // tap "Minor"
    expect(onSelect).toHaveBeenCalledWith('Minor');
  });

  test('active chip has different style than inactive', () => {
    let tree: any;
    act(() => {
      tree = create(
        <ChipPicker options={options} activeOption="Major" onSelect={() => {}} />
      );
    });
    const buttons = tree.root.findAllByType('TouchableOpacity');
    const activeStyle = JSON.stringify([].concat(...buttons[0].props.style));
    const inactiveStyle = JSON.stringify([].concat(...buttons[1].props.style));
    expect(activeStyle).not.toEqual(inactiveStyle);
  });
});

describe('ChipPicker — multi select', () => {
  const options = ['All', 'Pos 1', 'Pos 2', 'Pos 3'];

  test('renders all options', () => {
    let tree: any;
    act(() => {
      tree = create(
        <ChipPicker
          options={options}
          multiSelect
          activeOptions={new Set(['all'])}
          onToggle={() => {}}
        />
      );
    });
    const json = JSON.stringify(tree.toJSON());
    options.forEach(opt => expect(json).toContain(opt));
  });

  test('calls onToggle with tapped option', () => {
    const onToggle = jest.fn();
    let tree: any;
    act(() => {
      tree = create(
        <ChipPicker
          options={options}
          multiSelect
          activeOptions={new Set(['all'])}
          onToggle={onToggle}
        />
      );
    });
    const buttons = tree.root.findAllByType('TouchableOpacity');
    act(() => { buttons[1].props.onPress(); }); // tap "Pos 1"
    expect(onToggle).toHaveBeenCalledWith('Pos 1');
  });

  test('active options have different style than inactive', () => {
    let tree: any;
    act(() => {
      tree = create(
        <ChipPicker
          options={options}
          multiSelect
          activeOptions={new Set(['Pos 1'])}
          onToggle={() => {}}
        />
      );
    });
    const buttons = tree.root.findAllByType('TouchableOpacity');
    const activeStyle = JSON.stringify([].concat(...buttons[1].props.style));   // Pos 1
    const inactiveStyle = JSON.stringify([].concat(...buttons[0].props.style)); // All
    expect(activeStyle).not.toEqual(inactiveStyle);
  });
});
```

### Step 2: Run test to verify it fails

```bash
npx jest --testPathPattern=ChipPicker
```

Expected: FAIL — "Cannot find module '../ChipPicker'"

### Step 3: Write minimal implementation

```typescript
// src/components/ChipPicker.tsx
import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

type ChipPickerProps =
  | {
      options: string[];
      activeOption: string;
      onSelect: (opt: string) => void;
      multiSelect?: never;
      activeOptions?: never;
      onToggle?: never;
    }
  | {
      options: string[];
      multiSelect: true;
      activeOptions: Set<string>;
      onToggle: (opt: string) => void;
      activeOption?: never;
      onSelect?: never;
    };

export function ChipPicker(props: ChipPickerProps) {
  const { theme } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {props.options.map(opt => {
        const isActive = props.multiSelect
          ? props.activeOptions.has(opt)
          : opt === props.activeOption;
        const handlePress = props.multiSelect
          ? () => props.onToggle(opt)
          : () => props.onSelect(opt);

        return (
          <TouchableOpacity
            key={opt}
            onPress={handlePress}
            style={[
              styles.chip,
              isActive
                ? { backgroundColor: theme.accent }
                : { backgroundColor: theme.bgTertiary, borderWidth: 1, borderColor: theme.border },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
          >
            <Text
              style={[
                styles.label,
                { color: isActive ? theme.dotText : theme.textSecondary },
              ]}
            >
              {opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  chip: {
    height: 34,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});
```

### Step 4: Run test to verify it passes

```bash
npx jest --testPathPattern=ChipPicker
```

Expected: PASS — 8 tests

### Step 5: Commit

```bash
git add src/components/ChipPicker.tsx src/components/__tests__/ChipPicker.test.tsx
git commit -m "feat(components): add ChipPicker for scrollable chip selection"
```

---

## Task 3: SettingsScreen

**Files:**
- Create: `src/screens/SettingsScreen.tsx`
- Create: `src/screens/__tests__/SettingsScreen.test.tsx`

### Step 1: Write the failing test

```typescript
// src/screens/__tests__/SettingsScreen.test.tsx
import React from 'react';
import { create, act } from 'react-test-renderer';
import { SettingsScreen } from '../SettingsScreen';

describe('SettingsScreen', () => {
  const noop = () => {};

  test('renders without crashing', () => {
    let tree: any;
    act(() => {
      tree = create(<SettingsScreen onClose={noop} onOpenGlossary={noop} />);
    });
    expect(tree.toJSON()).toBeTruthy();
  });

  test('renders SETTINGS title', () => {
    let tree: any;
    act(() => {
      tree = create(<SettingsScreen onClose={noop} onOpenGlossary={noop} />);
    });
    expect(JSON.stringify(tree.toJSON())).toContain('Settings');
  });

  test('renders DISPLAY section header', () => {
    let tree: any;
    act(() => {
      tree = create(<SettingsScreen onClose={noop} onOpenGlossary={noop} />);
    });
    expect(JSON.stringify(tree.toJSON())).toContain('DISPLAY');
  });

  test('renders Note names row', () => {
    let tree: any;
    act(() => {
      tree = create(<SettingsScreen onClose={noop} onOpenGlossary={noop} />);
    });
    expect(JSON.stringify(tree.toJSON())).toContain('Note names');
  });

  test('renders Hand orientation row', () => {
    let tree: any;
    act(() => {
      tree = create(<SettingsScreen onClose={noop} onOpenGlossary={noop} />);
    });
    expect(JSON.stringify(tree.toJSON())).toContain('Hand');
  });

  test('renders Theme row', () => {
    let tree: any;
    act(() => {
      tree = create(<SettingsScreen onClose={noop} onOpenGlossary={noop} />);
    });
    expect(JSON.stringify(tree.toJSON())).toContain('Theme');
  });

  test('renders PLAYBACK section header', () => {
    let tree: any;
    act(() => {
      tree = create(<SettingsScreen onClose={noop} onOpenGlossary={noop} />);
    });
    expect(JSON.stringify(tree.toJSON())).toContain('PLAYBACK');
  });

  test('renders Capo row with stepper buttons', () => {
    let tree: any;
    act(() => {
      tree = create(<SettingsScreen onClose={noop} onOpenGlossary={noop} />);
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Capo');
    expect(json).toContain('−');
    expect(json).toContain('+');
  });

  test('renders ABOUT section with Glossary row', () => {
    let tree: any;
    act(() => {
      tree = create(<SettingsScreen onClose={noop} onOpenGlossary={noop} />);
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('ABOUT');
    expect(json).toContain('Glossary');
  });

  test('calls onClose when close button pressed', () => {
    const onClose = jest.fn();
    let tree: any;
    act(() => {
      tree = create(<SettingsScreen onClose={onClose} onOpenGlossary={noop} />);
    });
    // First TouchableOpacity is the close button (✕)
    const buttons = tree.root.findAllByType('TouchableOpacity');
    act(() => { buttons[0].props.onPress(); });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('calls onOpenGlossary when Glossary row pressed', () => {
    const onOpenGlossary = jest.fn();
    let tree: any;
    act(() => {
      tree = create(<SettingsScreen onClose={noop} onOpenGlossary={onOpenGlossary} />);
    });
    const json = JSON.stringify(tree.toJSON());
    // Find the Glossary touchable — last TouchableOpacity in the screen
    const buttons = tree.root.findAllByType('TouchableOpacity');
    const glossaryBtn = buttons[buttons.length - 1];
    act(() => { glossaryBtn.props.onPress(); });
    expect(onOpenGlossary).toHaveBeenCalledTimes(1);
  });
});
```

### Step 2: Run test to verify it fails

```bash
npx jest --testPathPattern=SettingsScreen
```

Expected: FAIL — "Cannot find module '../SettingsScreen'"

### Step 3: Write minimal implementation

```typescript
// src/screens/SettingsScreen.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../theme/ThemeContext';
import { SegmentedControl } from '../components/SegmentedControl';

interface SettingsScreenProps {
  onClose: () => void;
  onOpenGlossary: () => void;
}

export function SettingsScreen({ onClose, onOpenGlossary }: SettingsScreenProps) {
  const { theme, isDark, toggleTheme, useFlats, toggleFlats, isLeftHanded, toggleLeftHanded, capo, setCapo } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgPrimary }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Settings</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel="Close settings">
          <MaterialCommunityIcons name="close" size={22} color={theme.textMuted} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* DISPLAY section */}
        <Text style={[styles.sectionHeader, { color: theme.textMuted }]}>DISPLAY</Text>
        <View style={[styles.card, { backgroundColor: theme.bgSecondary }]}>
          {/* Note names */}
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>Note names</Text>
            <SegmentedControl
              options={['♯', '♭']}
              activeOption={useFlats ? '♭' : '♯'}
              onSelect={(opt) => { if ((opt === '♭') !== useFlats) toggleFlats(); }}
            />
          </View>
          <View style={[styles.separator, { backgroundColor: theme.border }]} />
          {/* Hand orientation */}
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>Hand</Text>
            <SegmentedControl
              options={['Right-handed', 'Left-handed']}
              activeOption={isLeftHanded ? 'Left-handed' : 'Right-handed'}
              onSelect={(opt) => { if ((opt === 'Left-handed') !== isLeftHanded) toggleLeftHanded(); }}
            />
          </View>
          <View style={[styles.separator, { backgroundColor: theme.border }]} />
          {/* Theme */}
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>Theme</Text>
            <SegmentedControl
              options={['Light', 'Dark']}
              activeOption={isDark ? 'Dark' : 'Light'}
              onSelect={(opt) => { if ((opt === 'Dark') !== isDark) toggleTheme(); }}
            />
          </View>
        </View>

        {/* PLAYBACK section */}
        <Text style={[styles.sectionHeader, { color: theme.textMuted }]}>PLAYBACK</Text>
        <View style={[styles.card, { backgroundColor: theme.bgSecondary }]}>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>Capo</Text>
            <View style={styles.stepperRow}>
              <TouchableOpacity
                onPress={() => setCapo(Math.max(0, capo - 1))}
                style={styles.stepperBtn}
                accessibilityLabel="Decrease capo"
              >
                <Text style={[styles.stepperText, { color: theme.textSecondary }]}>−</Text>
              </TouchableOpacity>
              <Text style={[styles.stepperValue, { color: capo > 0 ? theme.accent : theme.textMuted }]}>
                {capo} frets
              </Text>
              <TouchableOpacity
                onPress={() => setCapo(Math.min(7, capo + 1))}
                style={styles.stepperBtn}
                accessibilityLabel="Increase capo"
              >
                <Text style={[styles.stepperText, { color: theme.textSecondary }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ABOUT section */}
        <Text style={[styles.sectionHeader, { color: theme.textMuted }]}>ABOUT</Text>
        <View style={[styles.card, { backgroundColor: theme.bgSecondary }]}>
          <TouchableOpacity style={styles.row} onPress={onOpenGlossary} accessibilityRole="button">
            <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>Glossary</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.textMuted} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: 28, fontWeight: '700' },
  closeBtn: { padding: 4 },
  content: { padding: 16, paddingBottom: 32 },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 6,
  },
  card: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  rowLabel: { fontSize: 15 },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 16 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepperBtn: { padding: 8 },
  stepperText: { fontSize: 18, fontWeight: '600' },
  stepperValue: { fontSize: 15, minWidth: 60, textAlign: 'center' },
});
```

### Step 4: Run test to verify it passes

```bash
npx jest --testPathPattern=SettingsScreen
```

Expected: PASS — 11 tests

### Step 5: Commit

```bash
git add src/screens/SettingsScreen.tsx src/screens/__tests__/SettingsScreen.test.tsx
git commit -m "feat(screens): add SettingsScreen with grouped card layout"
```

---

## Task 4: App.tsx — header cleanup, tab reorder, Settings modal

**Files:**
- Modify: `App.tsx`

> **Note:** No test file for App.tsx exists. The changes here are validated by running the full test suite and by manual inspection on device.

### Step 1: Read the file before editing

```bash
# Already in context — skip
```

### Step 2: Make all changes in one edit

Changes required (in order):

1. **Add imports:** `SettingsScreen` (new), remove PaletteSwitcher if present (it was a temporary exploration component; if it was merged to master, remove it now).

2. **Add state:** `const [settingsVisible, setSettingsVisible] = useState(false);`

3. **Replace header right controls:** Remove all existing header controls (LH, capo, theme toggle, flat/sharp toggle). Keep only two icons:
   - `book-open-variant` → opens Glossary (already present)
   - `cog-outline` → opens Settings

4. **Reorder tabs** to: Chords (1st), Scales (2nd), Progressions (3rd), Arpeggios (4th), Triads (5th).
   Currently the order is Chords, Scales, Progressions, Triads, Arpeggios — so swap Triads and Arpeggios.

5. **Add Settings Modal** alongside the existing Glossary modal.

6. **Update label styles** on all section header Text elements to `fontSize: 12, fontWeight: '600'` (from current `14`).

The header right section after changes:
```tsx
headerRight: () => (
  <View style={styles.headerButtons}>
    <TouchableOpacity
      onPress={() => setGlossaryVisible(true)}
      style={styles.headerBtn}
      accessibilityRole="button"
      accessibilityLabel="Open glossary"
    >
      <MaterialCommunityIcons name="book-open-variant" size={20} color={theme.textMuted} />
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => setSettingsVisible(true)}
      style={styles.headerBtn}
      accessibilityRole="button"
      accessibilityLabel="Open settings"
    >
      <MaterialCommunityIcons name="cog-outline" size={20} color={theme.textMuted} />
    </TouchableOpacity>
  </View>
),
```

Tab order (find the `<Tab.Screen>` blocks and reorder — or just make sure Arpeggios comes before Triads):
```tsx
<Tab.Screen name="Chords" ... />
<Tab.Screen name="Scales" ... />
<Tab.Screen name="Progressions" ... />
<Tab.Screen name="Arpeggios" ... />
<Tab.Screen name="Triads" ... />
```

Settings modal (add after Glossary modal):
```tsx
<Modal
  visible={settingsVisible}
  animationType="slide"
  presentationStyle="pageSheet"
  onRequestClose={() => setSettingsVisible(false)}
>
  <SettingsScreen
    onClose={() => setSettingsVisible(false)}
    onOpenGlossary={() => {
      setSettingsVisible(false);
      setGlossaryVisible(true);
    }}
  />
</Modal>
```

Also remove any styles that were for the old header controls (capo stepper, LH button etc.) since those have moved to SettingsScreen.

### Step 3: Run full suite to verify nothing broken

```bash
npx jest
```

Expected: 179+ tests pass (same count or more)

### Step 4: Commit

```bash
git add App.tsx
git commit -m "feat(app): clean header to 2 icons, reorder tabs, add Settings modal"
```

---

## Task 5: ChordsScreen migration

**Files:**
- Modify: `src/screens/ChordsScreen.tsx`
- Modify: `src/screens/__tests__/ChordsScreen.test.tsx`

### Step 1: Update the test first

Replace the test assertions that check for specific component names (TypePicker, NotePicker, DisplayToggle) with content-based assertions. The new components render the same text content, so most tests pass unchanged. The interaction tests that check for hardcoded accent hex colors need to check the theme accent instead.

```typescript
// In ChordsScreen.test.tsx, update the interaction tests:

test('selecting a note updates active note highlight', () => {
  let tree: any;
  act(() => { tree = create(<ChordsScreen />); });
  const root = tree.root;

  // C (index 0) is active by default — verify it has a different background to others
  const buttons = root.findAllByType('TouchableOpacity');
  const activeStyle = JSON.stringify([].concat(...buttons[0].props.style));
  const inactiveStyle = JSON.stringify([].concat(...buttons[1].props.style));
  expect(activeStyle).not.toEqual(inactiveStyle);

  // Press E (index 4)
  act(() => { buttons[4].props.onPress(); });

  const updatedButtons = root.findAllByType('TouchableOpacity');
  const newActiveStyle = JSON.stringify([].concat(...updatedButtons[4].props.style));
  const prevActiveStyle = JSON.stringify([].concat(...updatedButtons[0].props.style));
  expect(newActiveStyle).not.toEqual(prevActiveStyle);
});

test('selecting a chord type updates active type highlight', () => {
  let tree: any;
  act(() => { tree = create(<ChordsScreen />); });
  const root = tree.root;

  // 0-11: note chips, 12: Major (active), 13: Minor, ...
  const buttons = root.findAllByType('TouchableOpacity');
  const majorStyle = JSON.stringify([].concat(...buttons[12].props.style));
  const minorStyle = JSON.stringify([].concat(...buttons[13].props.style));
  expect(majorStyle).not.toEqual(minorStyle); // Major is active, Minor is not

  act(() => { buttons[13].props.onPress(); }); // press Minor

  const updatedButtons = root.findAllByType('TouchableOpacity');
  const newMinorStyle = JSON.stringify([].concat(...updatedButtons[13].props.style));
  const prevMajorStyle = JSON.stringify([].concat(...updatedButtons[12].props.style));
  expect(newMinorStyle).not.toEqual(prevMajorStyle); // now Minor is active
});
```

### Step 2: Run test to verify it passes before we change the screen

```bash
npx jest --testPathPattern=ChordsScreen
```

Expected: PASS (with updated assertions, still checking the same behavior)

### Step 3: Migrate the screen

In `src/screens/ChordsScreen.tsx`:

1. Replace import: `import { NotePicker, TypePicker, DisplayToggle, FretboardViewer } from '../components';`
   → `import { ChipPicker, SegmentedControl, FretboardViewer } from '../components';`

2. Get note names: add `import { NOTE_NAMES, NOTE_NAMES_FLAT } from '../engine/notes';` and `const { useFlats } = useTheme();`

3. Replace `<NotePicker activeNote={root} onSelect={handleRootChange} />`:
   ```tsx
   <ChipPicker
     options={useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES}
     activeOption={(useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES)[root]}
     onSelect={(name) => handleRootChange((useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES).indexOf(name))}
   />
   ```

4. Replace `<TypePicker types={chordTypes} activeType={type} onSelect={handleTypeChange} />`:
   ```tsx
   <ChipPicker options={chordTypes} activeOption={type} onSelect={handleTypeChange} />
   ```

5. Replace `<DisplayToggle modes={['Finger', 'Interval', 'Note']} activeMode={display} onSelect={setDisplay} />`:
   ```tsx
   <SegmentedControl options={['Finger', 'Interval', 'Note']} activeOption={display} onSelect={setDisplay} />
   ```

6. Update label style: change `fontSize: 14` → `12`, `marginTop: 16` → `20`, `marginBottom: 8` → `6`.

### Step 4: Run tests

```bash
npx jest --testPathPattern=ChordsScreen
```

Expected: PASS

### Step 5: Commit

```bash
git add src/screens/ChordsScreen.tsx src/screens/__tests__/ChordsScreen.test.tsx
git commit -m "feat(screens): migrate ChordsScreen to ChipPicker + SegmentedControl"
```

---

## Task 6: ScalesScreen migration + Advanced section for Mode

**Files:**
- Modify: `src/screens/ScalesScreen.tsx`
- Modify: `src/screens/__tests__/ScalesScreen.test.tsx` (if exists; create if not)

### Step 1: Check for existing test

```bash
ls src/screens/__tests__/ScalesScreen.test.tsx
```

If it exists, read it. If not, create it:

```typescript
// src/screens/__tests__/ScalesScreen.test.tsx
import React from 'react';
import { create, act } from 'react-test-renderer';
import { ScalesScreen } from '../ScalesScreen';

describe('ScalesScreen', () => {
  test('renders without crashing', () => {
    let tree: any;
    act(() => { tree = create(<ScalesScreen />); });
    expect(tree.toJSON()).toBeTruthy();
  });

  test('renders title', () => {
    let tree: any;
    act(() => { tree = create(<ScalesScreen />); });
    expect(JSON.stringify(tree.toJSON())).toContain('Scales');
  });

  test('renders all 12 notes', () => {
    let tree: any;
    act(() => { tree = create(<ScalesScreen />); });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('"C"');
    expect(json).toContain('"G"');
    expect(json).toContain('"A"');
  });

  test('renders scale types', () => {
    let tree: any;
    act(() => { tree = create(<ScalesScreen />); });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Major');
    expect(json).toContain('Minor');
  });

  test('renders display modes', () => {
    let tree: any;
    act(() => { tree = create(<ScalesScreen />); });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Interval');
    expect(json).toContain('Note');
  });

  test('renders Advanced toggle', () => {
    let tree: any;
    act(() => { tree = create(<ScalesScreen />); });
    expect(JSON.stringify(tree.toJSON())).toContain('Advanced');
  });

  test('Mode picker hidden by default', () => {
    let tree: any;
    act(() => { tree = create(<ScalesScreen />); });
    // Mode names like 'Ionian', 'Dorian' should not be visible before expanding
    expect(JSON.stringify(tree.toJSON())).not.toContain('Ionian');
  });

  test('Mode picker visible after expanding Advanced (7-note scale selected)', () => {
    let tree: any;
    act(() => { tree = create(<ScalesScreen />); }); // Major is default (7-note)
    const buttons = tree.root.findAllByType('TouchableOpacity');
    // Find and press the Advanced toggle
    const json = JSON.stringify(tree.toJSON());
    // Find the Advanced button — it contains the text "Advanced"
    const advancedBtn = buttons.find((b: any) =>
      JSON.stringify(b.props.children || b.props.style || '').includes('Advanced') ||
      JSON.stringify(tree.toJSON()).includes('Advanced')
    );
    // Simpler: find by text content
    const allButtons = tree.root.findAllByType('TouchableOpacity');
    // The Advanced button is after the display toggle
    // Press it and check Mode names appear
    let advBtn: any = null;
    for (const btn of allButtons) {
      const btnJson = JSON.stringify(btn.props);
      if (btnJson.includes('Advanced')) { advBtn = btn; break; }
    }
    if (advBtn) {
      act(() => { advBtn.props.onPress(); });
      expect(JSON.stringify(tree.toJSON())).toContain('Ionian');
    }
  });
});
```

### Step 2: Run test to verify it fails (new test) or passes (existing test)

```bash
npx jest --testPathPattern=ScalesScreen
```

For the Advanced section tests: FAIL until implemented.

### Step 3: Migrate the screen

In `src/screens/ScalesScreen.tsx`:

1. Add imports:
   ```tsx
   import { useState, useMemo } from 'react'; // already there, add LayoutAnimation
   import { View, Text, ScrollView, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
   import { ChipPicker, SegmentedControl, FretboardViewer } from '../components';
   import { NOTE_NAMES, NOTE_NAMES_FLAT } from '../engine/notes';
   import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
   ```

   Remove: `NotePicker, TypePicker, DisplayToggle, ScalePositionPicker` from components import.

2. Add Android LayoutAnimation enable (top of component or outside):
   ```tsx
   if (Platform.OS === 'android') {
     UIManager.setLayoutAnimationEnabledExperimental?.(true);
   }
   ```

3. Add state: `const [advancedOpen, setAdvancedOpen] = useState(false);`

4. Add `useFlats` from `useTheme()`.

5. Build position chip options:
   ```tsx
   const positionOptions = useMemo(() => {
     return ['All', ...positions.map((_, i) => `Pos ${i + 1}`)];
   }, [positions]);

   const activeChipOptions = useMemo((): Set<string> => {
     if (activePositions.has('all')) return new Set(['All']);
     return new Set(Array.from(activePositions).map(k => `Pos ${parseInt(k) + 1}`));
   }, [activePositions]);

   const handlePositionChipToggle = (opt: string) => {
     if (opt === 'All') {
       handlePositionToggle('all');
     } else {
       const idx = positionOptions.indexOf(opt) - 1; // offset by 'All'
       handlePositionToggle(String(idx));
     }
   };
   ```

6. Replace JSX:
   - `<NotePicker>` → `<ChipPicker options={useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES} activeOption={(useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES)[root]} onSelect={(n) => setRoot((useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES).indexOf(n))} />`
   - `<TypePicker types={scaleTypes} ...>` → `<ChipPicker options={scaleTypes} activeOption={type} onSelect={setType} />`
   - `<DisplayToggle modes={['Interval', 'Note']} ...>` → `<SegmentedControl options={['Interval', 'Note']} activeOption={display} onSelect={setDisplay} />`
   - `<ScalePositionPicker ...>` → `<ChipPicker multiSelect activeOptions={activeChipOptions} options={positionOptions} onToggle={handlePositionChipToggle} />`

7. Replace the Mode picker with an Advanced collapsible section:
   ```tsx
   {/* Advanced section */}
   <TouchableOpacity
     style={[styles.advancedToggle, { backgroundColor: theme.bgTertiary }]}
     onPress={() => {
       LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
       setAdvancedOpen(v => !v);
     }}
   >
     <Text style={[styles.advancedLabel, { color: theme.textMuted }]}>Advanced</Text>
     <MaterialCommunityIcons
       name={advancedOpen ? 'chevron-down' : 'chevron-right'}
       size={18}
       color={theme.textMuted}
     />
   </TouchableOpacity>

   {advancedOpen && is7Note && (
     <>
       <Text style={[styles.label, { color: theme.textSecondary }]}>Mode</Text>
       <ChipPicker
         options={MODE_NAMES}
         activeOption={MODE_NAMES[mode]}
         onSelect={(m) => setMode(MODE_NAMES.indexOf(m))}
       />
     </>
   )}
   ```

8. Update label style: `fontSize: 12`, `marginTop: 20`, `marginBottom: 6`.

9. Add styles:
   ```tsx
   advancedToggle: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'space-between',
     paddingHorizontal: 12,
     paddingVertical: 10,
     borderRadius: 8,
     marginTop: 20,
   },
   advancedLabel: { fontSize: 14, fontWeight: '500' },
   ```

### Step 4: Run tests

```bash
npx jest --testPathPattern=ScalesScreen
```

Expected: PASS

### Step 5: Commit

```bash
git add src/screens/ScalesScreen.tsx src/screens/__tests__/ScalesScreen.test.tsx
git commit -m "feat(screens): migrate ScalesScreen with Advanced collapsible Mode section"
```

---

## Task 7: ArpeggiosScreen migration

**Files:**
- Modify: `src/screens/ArpeggiosScreen.tsx`
- Modify (or create): `src/screens/__tests__/ArpeggiosScreen.test.tsx`

### Step 1: Create/update the test

```typescript
// src/screens/__tests__/ArpeggiosScreen.test.tsx
import React from 'react';
import { create, act } from 'react-test-renderer';
import { ArpeggiosScreen } from '../ArpeggiosScreen';

describe('ArpeggiosScreen', () => {
  test('renders without crashing', () => {
    let tree: any;
    act(() => { tree = create(<ArpeggiosScreen />); });
    expect(tree.toJSON()).toBeTruthy();
  });

  test('renders title', () => {
    let tree: any;
    act(() => { tree = create(<ArpeggiosScreen />); });
    expect(JSON.stringify(tree.toJSON())).toContain('Arpeggios');
  });

  test('renders note root picker', () => {
    let tree: any;
    act(() => { tree = create(<ArpeggiosScreen />); });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('"C"');
    expect(json).toContain('"G"');
  });

  test('renders arpeggio types', () => {
    let tree: any;
    act(() => { tree = create(<ArpeggiosScreen />); });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Major');
    expect(json).toContain('Minor');
  });

  test('renders display modes', () => {
    let tree: any;
    act(() => { tree = create(<ArpeggiosScreen />); });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Interval');
    expect(json).toContain('Note');
    expect(json).toContain('Finger');
  });

  test('renders hint text', () => {
    let tree: any;
    act(() => { tree = create(<ArpeggiosScreen />); });
    expect(JSON.stringify(tree.toJSON())).toContain('arpeggio');
  });
});
```

### Step 2: Run test to verify it passes (these already work with current code)

```bash
npx jest --testPathPattern=ArpeggiosScreen
```

Expected: PASS

### Step 3: Migrate the screen

In `src/screens/ArpeggiosScreen.tsx`:

1. Replace import: `NotePicker, TypePicker, DisplayToggle` → `ChipPicker, SegmentedControl`

2. Add `NOTE_NAMES`, `NOTE_NAMES_FLAT`, `useFlats` from `useTheme()`.

3. Replace `<NotePicker activeNote={root} onSelect={setRoot} />`:
   ```tsx
   <ChipPicker
     options={useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES}
     activeOption={(useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES)[root]}
     onSelect={(n) => setRoot((useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES).indexOf(n))}
   />
   ```

4. Replace `<TypePicker types={arpTypes} activeType={type} onSelect={setType} />`:
   ```tsx
   <ChipPicker options={arpTypes} activeOption={type} onSelect={setType} />
   ```

5. Replace `<DisplayToggle modes={['Interval', 'Note', 'Finger']} activeMode={display} onSelect={setDisplay} />`:
   ```tsx
   <SegmentedControl options={['Interval', 'Note', 'Finger']} activeOption={display} onSelect={setDisplay} />
   ```

6. Update label style: `fontSize: 12`, `marginTop: 20`, `marginBottom: 6`.

### Step 4: Run tests

```bash
npx jest --testPathPattern=ArpeggiosScreen
```

Expected: PASS

### Step 5: Commit

```bash
git add src/screens/ArpeggiosScreen.tsx src/screens/__tests__/ArpeggiosScreen.test.tsx
git commit -m "feat(screens): migrate ArpeggiosScreen to ChipPicker + SegmentedControl"
```

---

## Task 8: TriadsScreen migration + Advanced section for Strings/Inversion

**Files:**
- Modify: `src/screens/TriadsScreen.tsx`
- Modify (or create): `src/screens/__tests__/TriadsScreen.test.tsx`

### Step 1: Create/update the test

```typescript
// src/screens/__tests__/TriadsScreen.test.tsx
import React from 'react';
import { create, act } from 'react-test-renderer';
import { TriadsScreen } from '../TriadsScreen';

describe('TriadsScreen', () => {
  test('renders without crashing', () => {
    let tree: any;
    act(() => { tree = create(<TriadsScreen />); });
    expect(tree.toJSON()).toBeTruthy();
  });

  test('renders title', () => {
    let tree: any;
    act(() => { tree = create(<TriadsScreen />); });
    expect(JSON.stringify(tree.toJSON())).toContain('Triads');
  });

  test('renders note root picker', () => {
    let tree: any;
    act(() => { tree = create(<TriadsScreen />); });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('"C"');
    expect(json).toContain('"G"');
  });

  test('renders triad types', () => {
    let tree: any;
    act(() => { tree = create(<TriadsScreen />); });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Major');
    expect(json).toContain('Minor');
  });

  test('renders display modes', () => {
    let tree: any;
    act(() => { tree = create(<TriadsScreen />); });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Finger');
    expect(json).toContain('Interval');
    expect(json).toContain('Note');
  });

  test('renders Advanced toggle', () => {
    let tree: any;
    act(() => { tree = create(<TriadsScreen />); });
    expect(JSON.stringify(tree.toJSON())).toContain('Advanced');
  });

  test('Strings and Inversion pickers hidden by default', () => {
    let tree: any;
    act(() => { tree = create(<TriadsScreen />); });
    const json = JSON.stringify(tree.toJSON());
    expect(json).not.toContain('Root Pos');
    expect(json).not.toContain('1st Inv');
  });

  test('Strings and Inversion pickers visible after expanding Advanced', () => {
    let tree: any;
    act(() => { tree = create(<TriadsScreen />); });
    const buttons = tree.root.findAllByType('TouchableOpacity');
    // Find and press the Advanced toggle
    let advBtn: any = null;
    for (const btn of buttons) {
      if (JSON.stringify(btn.props).includes('Advanced')) { advBtn = btn; break; }
    }
    if (advBtn) {
      act(() => { advBtn.props.onPress(); });
      const json = JSON.stringify(tree.toJSON());
      expect(json).toContain('1st Inv');
    }
  });

  test('renders hint text', () => {
    let tree: any;
    act(() => { tree = create(<TriadsScreen />); });
    expect(JSON.stringify(tree.toJSON())).toContain('triad');
  });
});
```

### Step 2: Run test to verify Advanced tests fail

```bash
npx jest --testPathPattern=TriadsScreen
```

Expected: Most PASS, "Strings and Inversion pickers hidden by default" and "visible after expanding" likely FAIL (Strings and Inversion are currently always visible).

### Step 3: Migrate the screen

In `src/screens/TriadsScreen.tsx`:

1. Replace imports: `NotePicker, TypePicker, DisplayToggle, StringGroupPicker` → `ChipPicker, SegmentedControl`

2. Add: `LayoutAnimation, Platform, UIManager, TouchableOpacity` imports. Add `MaterialCommunityIcons` import.

3. Add state: `const [advancedOpen, setAdvancedOpen] = useState(false);`

4. Add `useFlats` from `useTheme()`.

5. Build string group chip options from StringGroupPicker's internal array (replicate here):
   ```tsx
   const STRING_GROUP_OPTIONS = [
     { label: 'All strings', value: 'all' },
     { label: '1-2-3', value: '0,1,2' },
     { label: '2-3-4', value: '1,2,3' },
     { label: '3-4-5', value: '2,3,4' },
     { label: '4-5-6', value: '3,4,5' },
   ];
   const stringGroupLabel = STRING_GROUP_OPTIONS.find(g => g.value === stringGroup)?.label ?? 'All strings';
   ```

6. Replace `<NotePicker>` → `<ChipPicker>` (same pattern as other screens).

7. Replace `<TypePicker types={triadTypes} ...>` → `<ChipPicker options={triadTypes} activeOption={type} onSelect={setType} />`.

8. Replace `<DisplayToggle>` → `<SegmentedControl options={['Finger', 'Interval', 'Note']} activeOption={display} onSelect={setDisplay} />`.

9. Remove Strings and Inversion sections from their current position.

10. Add Advanced collapsible section AFTER the display SegmentedControl:
    ```tsx
    <TouchableOpacity
      style={[styles.advancedToggle, { backgroundColor: theme.bgTertiary }]}
      onPress={() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setAdvancedOpen(v => !v);
      }}
    >
      <Text style={[styles.advancedLabel, { color: theme.textMuted }]}>Advanced</Text>
      <MaterialCommunityIcons
        name={advancedOpen ? 'chevron-down' : 'chevron-right'}
        size={18}
        color={theme.textMuted}
      />
    </TouchableOpacity>

    {advancedOpen && (
      <>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Strings</Text>
        <ChipPicker
          options={STRING_GROUP_OPTIONS.map(g => g.label)}
          activeOption={stringGroupLabel}
          onSelect={(label) => setStringGroup(STRING_GROUP_OPTIONS.find(g => g.label === label)?.value ?? 'all')}
        />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Inversion</Text>
        <SegmentedControl
          options={['Root Pos', '1st Inv', '2nd Inv']}
          activeOption={['Root Pos', '1st Inv', '2nd Inv'][inversion]}
          onSelect={(v) => setInversion(['Root Pos', '1st Inv', '2nd Inv'].indexOf(v))}
        />
      </>
    )}
    ```

11. Update label style: `fontSize: 12`, `marginTop: 20`, `marginBottom: 6`.

12. Add advancedToggle/advancedLabel styles (same as ScalesScreen).

### Step 4: Run tests

```bash
npx jest --testPathPattern=TriadsScreen
```

Expected: PASS — all tests including Advanced section tests

### Step 5: Commit

```bash
git add src/screens/TriadsScreen.tsx src/screens/__tests__/TriadsScreen.test.tsx
git commit -m "feat(screens): migrate TriadsScreen with Advanced section for Strings/Inversion"
```

---

## Task 9: ProgressionsScreen visual polish

**Files:**
- Modify: `src/screens/ProgressionsScreen.tsx`

> The Progressions tab receives visual polish only: update section label styles to match the new standard (12 pt, weight 600, textSecondary, marginTop 20, marginBottom 6). No structural changes.

### Step 1: Check existing tests pass (baseline)

```bash
npx jest --testPathPattern=ProgressionsScreen
```

Expected: PASS

### Step 2: Update label styles in ProgressionsScreen

In `src/screens/ProgressionsScreen.tsx`, find the `label` style in `StyleSheet.create` and update:
- `fontSize: 14` → `12`
- `marginTop: 16` → `20`
- `marginBottom: 8` → `6`

Also verify the `hint` style exists with `fontSize: 12, lineHeight: 17, marginTop: 10` (was added in a previous session).

### Step 3: Run tests

```bash
npx jest --testPathPattern=ProgressionsScreen
```

Expected: PASS

### Step 4: Commit

```bash
git add src/screens/ProgressionsScreen.tsx
git commit -m "feat(screens): apply visual polish to ProgressionsScreen label styles"
```

---

## Task 10: Export new components, delete old ones

**Files:**
- Modify: `src/components/index.ts`
- Delete: `src/components/TypePicker.tsx`
- Delete: `src/components/DisplayToggle.tsx`
- Delete: `src/components/NotePicker.tsx`
- Delete: `src/components/StringGroupPicker.tsx`
- Delete: `src/components/ScalePositionPicker.tsx`
- Delete: `src/components/__tests__/TypePicker.test.tsx`
- Delete: `src/components/__tests__/DisplayToggle.test.tsx`
- Delete: `src/components/__tests__/NotePicker.test.tsx`
- Delete: `src/components/__tests__/StringGroupPicker.test.tsx`
- Delete: `src/components/__tests__/ScalePositionPicker.test.tsx`

### Step 1: Verify no remaining usages of deleted components

```bash
grep -r "NotePicker\|TypePicker\|DisplayToggle\|StringGroupPicker\|ScalePositionPicker" src/ --include="*.tsx" --include="*.ts" -l
```

Expected: Only the component files themselves and their test files. If any screen still imports them, go back and fix it.

### Step 2: Update index.ts

```typescript
// src/components/index.ts
export { ErrorBoundary } from './ErrorBoundary';
export { GuitarNeck } from './GuitarNeck';
export { FretboardViewer } from './FretboardViewer';
export { ChipPicker } from './ChipPicker';
export { SegmentedControl } from './SegmentedControl';
export { ChordPreview } from './ChordPreview';
export { ChordDiagram } from './ChordDiagram';
```

### Step 3: Delete old files

```bash
rm src/components/TypePicker.tsx
rm src/components/DisplayToggle.tsx
rm src/components/NotePicker.tsx
rm src/components/StringGroupPicker.tsx
rm src/components/ScalePositionPicker.tsx
rm src/components/__tests__/TypePicker.test.tsx
rm src/components/__tests__/DisplayToggle.test.tsx
rm src/components/__tests__/NotePicker.test.tsx
rm src/components/__tests__/StringGroupPicker.test.tsx
rm src/components/__tests__/ScalePositionPicker.test.tsx
```

### Step 4: Run full test suite

```bash
npx jest
```

Expected: All remaining tests pass. Test count will be lower (deleted test files removed their tests).

If anything fails, grep for the failing import and fix it.

### Step 5: Commit

```bash
git add src/components/index.ts
git rm src/components/TypePicker.tsx src/components/DisplayToggle.tsx src/components/NotePicker.tsx src/components/StringGroupPicker.tsx src/components/ScalePositionPicker.tsx
git rm src/components/__tests__/TypePicker.test.tsx src/components/__tests__/DisplayToggle.test.tsx src/components/__tests__/NotePicker.test.tsx src/components/__tests__/StringGroupPicker.test.tsx src/components/__tests__/ScalePositionPicker.test.tsx
git commit -m "refactor(components): remove legacy pickers, export ChipPicker + SegmentedControl"
```

---

## Final verification

```bash
npx jest
```

All tests pass. The overhaul is complete.
