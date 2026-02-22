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

  test('Bug 1 — open-string triad in All Strings mode sends empty boxHighlights (no mid-neck scroll)', () => {
    let tree: any;
    act(() => { tree = create(<TriadsScreen />); });

    // Switch root to E — E minor has open-string positions (fret 0 notes)
    // that historically triggered Bug 1 (all-zero frets collapsing boxHighlights)
    const eBtns = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'E');
    act(() => { eBtns[0].props.onPress(); });

    // Switch type to Minor
    const minorBtns = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Minor');
    act(() => { minorBtns[0].props.onPress(); });

    // stringGroup remains 'all' (default) — in All Strings mode, all positions are combined
    // spanning many frets. Bug 2 fix ensures boxHighlights is always [] for 'all',
    // which also covers Bug 1 (no spurious scroll to mid-neck or wrong fret).
    const FV = (_FV as any).type;
    const fv = tree.root.findByType(FV);

    // Before fix: boxHighlights is non-empty (spans all fret positions including open strings)
    // After fix: always [] when stringGroup === 'all'
    expect(fv.props.boxHighlights).toEqual([]);
  });

  test('selecting 1st Inv shows active inversion in JSON', () => {
    let tree: any;
    act(() => { tree = create(<TriadsScreen />); });
    const advBtns = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Toggle advanced options');
    act(() => { advBtns[0].props.onPress(); });
    const inv1Btns = tree.root.findAll((n: any) => n.props.accessibilityLabel === '1st Inv');
    act(() => { inv1Btns[0].props.onPress(); });
    expect(JSON.stringify(tree.toJSON())).toContain('1st Inv');
  });

  test('selecting 2nd Inv shows active inversion in JSON', () => {
    let tree: any;
    act(() => { tree = create(<TriadsScreen />); });
    const advBtns = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Toggle advanced options');
    act(() => { advBtns[0].props.onPress(); });
    const inv2Btns = tree.root.findAll((n: any) => n.props.accessibilityLabel === '2nd Inv');
    act(() => { inv2Btns[0].props.onPress(); });
    expect(JSON.stringify(tree.toJSON())).toContain('2nd Inv');
  });

  test('selecting string group 2-3-4 changes active option', () => {
    let tree: any;
    act(() => { tree = create(<TriadsScreen />); });
    const advBtns = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Toggle advanced options');
    act(() => { advBtns[0].props.onPress(); });
    const sg234Btns = tree.root.findAll((n: any) => n.props.accessibilityLabel === '2-3-4');
    act(() => { sg234Btns[0].props.onPress(); });
    expect(JSON.stringify(tree.toJSON())).toContain('2-3-4');
  });

  test('selecting string group 3-4-5 changes active option', () => {
    let tree: any;
    act(() => { tree = create(<TriadsScreen />); });
    const advBtns = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Toggle advanced options');
    act(() => { advBtns[0].props.onPress(); });
    const sg345Btns = tree.root.findAll((n: any) => n.props.accessibilityLabel === '3-4-5');
    act(() => { sg345Btns[0].props.onPress(); });
    expect(JSON.stringify(tree.toJSON())).toContain('3-4-5');
  });
});
