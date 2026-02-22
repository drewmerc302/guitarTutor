// src/screens/__tests__/TriadsScreen.test.tsx
import React from 'react';
import { create, act } from 'react-test-renderer';
import { TriadsScreen } from '../TriadsScreen';
import { FretboardViewer as _FV } from '../../components';

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

  test('Strings and Inversion visible after expanding Advanced', () => {
    let tree: any;
    act(() => { tree = create(<TriadsScreen />); });
    const buttons = tree.root.findAllByType('TouchableOpacity');
    let advancedPressed = false;
    for (let i = 0; i < buttons.length; i++) {
      if (buttons[i].props.accessibilityLabel === 'Toggle advanced options') {
        act(() => { buttons[i].props.onPress(); });
        advancedPressed = true;
        break;
      }
    }
    expect(advancedPressed).toBe(true);
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('1st Inv');
    expect(json).toContain('All strings');
  });

  test('renders hint text', () => {
    let tree: any;
    act(() => { tree = create(<TriadsScreen />); });
    expect(JSON.stringify(tree.toJSON())).toContain('triad');
  });

  test('Bug 2 — All Strings default sends empty boxHighlights (no mid-neck scroll)', () => {
    let tree: any;
    act(() => { tree = create(<TriadsScreen />); });
    // Default state: stringGroup='all'
    const FV = (_FV as any).type;
    const fv = tree.root.findByType(FV);
    // Before fix: boxHighlights may be non-empty (spans all fret positions)
    // After fix: always [] when stringGroup === 'all'
    expect(fv.props.boxHighlights).toEqual([]);
  });

  test('Bug 1/2 — switching from All Strings to a specific group produces scroll region', () => {
    let tree: any;
    act(() => { tree = create(<TriadsScreen />); });

    // Default: All Strings → boxHighlights = []
    const FV = (_FV as any).type;
    let fv = tree.root.findByType(FV);
    expect(fv.props.boxHighlights).toEqual([]);

    // Open Advanced and select strings 2-3-4
    const advBtns = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Toggle advanced options');
    act(() => { advBtns[0].props.onPress(); });
    const sg234Btns = tree.root.findAll((n: any) => n.props.accessibilityLabel === '2-3-4');
    act(() => { sg234Btns[0].props.onPress(); });

    // Now boxHighlights should be non-empty (specific string group has a scroll region)
    fv = tree.root.findByType(FV);
    expect(fv.props.boxHighlights.length).toBeGreaterThan(0);
  });

  test('selecting 1st Inv marks it as selected', () => {
    let tree: any;
    act(() => { tree = create(<TriadsScreen />); });
    const advBtns = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Toggle advanced options');
    act(() => { advBtns[0].props.onPress(); });

    // Before: 1st Inv is not selected (Root Pos is default)
    const inv1BtnBefore = tree.root.findAll((n: any) => n.props.accessibilityLabel === '1st Inv')[0];
    expect(inv1BtnBefore.props.accessibilityState?.selected).toBe(false);

    act(() => { inv1BtnBefore.props.onPress(); });

    // After: 1st Inv is now selected
    const inv1BtnAfter = tree.root.findAll((n: any) => n.props.accessibilityLabel === '1st Inv')[0];
    expect(inv1BtnAfter.props.accessibilityState?.selected).toBe(true);
  });

  test('selecting 2nd Inv marks it as selected', () => {
    let tree: any;
    act(() => { tree = create(<TriadsScreen />); });
    const advBtns = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Toggle advanced options');
    act(() => { advBtns[0].props.onPress(); });

    // Before: 2nd Inv is not selected (Root Pos is default)
    const inv2BtnBefore = tree.root.findAll((n: any) => n.props.accessibilityLabel === '2nd Inv')[0];
    expect(inv2BtnBefore.props.accessibilityState?.selected).toBe(false);

    act(() => { inv2BtnBefore.props.onPress(); });

    // After: 2nd Inv is now selected
    const inv2BtnAfter = tree.root.findAll((n: any) => n.props.accessibilityLabel === '2nd Inv')[0];
    expect(inv2BtnAfter.props.accessibilityState?.selected).toBe(true);
  });

  test('selecting string group 2-3-4 marks it as selected', () => {
    let tree: any;
    act(() => { tree = create(<TriadsScreen />); });
    const advBtns = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Toggle advanced options');
    act(() => { advBtns[0].props.onPress(); });

    // Before: 2-3-4 is not selected (All strings is default)
    const sg234BtnBefore = tree.root.findAll((n: any) => n.props.accessibilityLabel === '2-3-4')[0];
    expect(sg234BtnBefore.props.accessibilityState?.selected).toBe(false);

    act(() => { sg234BtnBefore.props.onPress(); });

    // After: 2-3-4 is now selected
    const sg234BtnAfter = tree.root.findAll((n: any) => n.props.accessibilityLabel === '2-3-4')[0];
    expect(sg234BtnAfter.props.accessibilityState?.selected).toBe(true);
  });

  test('Bug — A Major strings 1-2-3 Root Pos: all shapes rendered but boxHighlights defaults to closest-to-nut', () => {
    // A Major on strings 1-2-3 produces two valid shapes: frets [2,2,2] and [14,14,14].
    // Before fix: boxHighlights = [{fretStart:2, fretEnd:14}] → viewport centers on empty neck.
    // After fix: all 6 notes rendered (both shapes visible on scroll), but boxHighlights
    //            targets only the closest shape so the view opens near the nut.
    let tree: any;
    act(() => { tree = create(<TriadsScreen />); });

    // Select A (root=9) via RootPicker
    const aBtn = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'A')[0];
    act(() => { aBtn.props.onPress(); });

    // Open Advanced, select strings 1-2-3
    const advBtn = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Toggle advanced options')[0];
    act(() => { advBtn.props.onPress(); });
    const sg123Btn = tree.root.findAll((n: any) => n.props.accessibilityLabel === '1-2-3')[0];
    act(() => { sg123Btn.props.onPress(); });

    const FV = (_FV as any).type;
    const fv = tree.root.findByType(FV);

    // All notes (both shapes) should be rendered
    expect(fv.props.notes.length).toBeGreaterThan(3);

    // boxHighlights must anchor to the nut-closest shape, not span the full range
    const highlights = fv.props.boxHighlights as { fretStart: number; fretEnd: number }[];
    expect(highlights.length).toBe(1);
    expect(highlights[0].fretEnd).toBeLessThan(10);
  });

  test('selecting string group 3-4-5 marks it as selected', () => {
    let tree: any;
    act(() => { tree = create(<TriadsScreen />); });
    const advBtns = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Toggle advanced options');
    act(() => { advBtns[0].props.onPress(); });

    // Before: 3-4-5 is not selected (All strings is default)
    const sg345BtnBefore = tree.root.findAll((n: any) => n.props.accessibilityLabel === '3-4-5')[0];
    expect(sg345BtnBefore.props.accessibilityState?.selected).toBe(false);

    act(() => { sg345BtnBefore.props.onPress(); });

    // After: 3-4-5 is now selected
    const sg345BtnAfter = tree.root.findAll((n: any) => n.props.accessibilityLabel === '3-4-5')[0];
    expect(sg345BtnAfter.props.accessibilityState?.selected).toBe(true);
  });
});
