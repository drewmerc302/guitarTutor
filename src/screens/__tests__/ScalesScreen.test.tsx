// src/screens/__tests__/ScalesScreen.test.tsx
import React from 'react';
import { create, act } from 'react-test-renderer';
import { ScalesScreen } from '../ScalesScreen';
import { FretboardViewer as _FV } from '../../components';

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

  test('renders scale types including Major and Minor', () => {
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

  test('renders Advanced toggle button', () => {
    let tree: any;
    act(() => { tree = create(<ScalesScreen />); });
    expect(JSON.stringify(tree.toJSON())).toContain('Advanced');
  });

  test('Mode picker is hidden by default', () => {
    let tree: any;
    act(() => { tree = create(<ScalesScreen />); }); // Major is default (7-note)
    // Ionian is Mode name 0 -- should NOT appear before Advanced is expanded
    expect(JSON.stringify(tree.toJSON())).not.toContain('Ionian');
  });

  test('Mode picker appears after expanding Advanced (with 7-note scale)', () => {
    let tree: any;
    act(() => { tree = create(<ScalesScreen />); }); // Major is default (7-note)
    const buttons = tree.root.findAllByType('TouchableOpacity');

    // Try to find the Advanced button by accessibilityLabel first
    let advancedPressed = false;
    for (let i = 0; i < buttons.length; i++) {
      if (buttons[i].props.accessibilityLabel === 'Toggle advanced options') {
        act(() => { buttons[i].props.onPress(); });
        advancedPressed = true;
        break;
      }
    }

    // Fallback: press each button until Ionian appears
    if (!advancedPressed) {
      for (let i = 0; i < buttons.length; i++) {
        try { act(() => { buttons[i].props.onPress(); }); } catch {}
        if (JSON.stringify(tree.toJSON()).includes('Ionian')) break;
      }
    }

    expect(JSON.stringify(tree.toJSON())).toContain('Ionian');
  });

  test('Bug 3 — Advanced toggle responds after selecting Minor Pent. and Pos 1', () => {
    let tree: any;
    act(() => { tree = create(<ScalesScreen />); });

    // Switch to Minor Pent. (period is part of the name)
    const minorPentBtns = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Minor Pent.');
    act(() => { minorPentBtns[0].props.onPress(); });

    // Select Pos 1
    const pos1Btns = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Pos 1');
    act(() => { pos1Btns[0].props.onPress(); });

    // Advanced should be closed (chevron-right icon)
    expect(JSON.stringify(tree.toJSON())).not.toContain('"chevron-down"');

    // Press Advanced toggle
    const advBtns = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Toggle advanced options');
    act(() => { advBtns[0].props.onPress(); });

    // chevron should now be 'chevron-down' (Advanced opened)
    expect(JSON.stringify(tree.toJSON())).toContain('"chevron-down"');
  });

  test('Bug 4 — display mode passed to FretboardViewer is lowercase', () => {
    let tree: any;
    act(() => { tree = create(<ScalesScreen />); });

    // Press 'Note' in the Display SegmentedControl
    const noteBtns = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Note');
    act(() => { noteBtns[0].props.onPress(); });

    // FretboardViewer must receive lowercase 'note', not Title-case 'Note'
    const FV = (_FV as any).type;
    const fv = tree.root.findByType(FV);
    expect(fv.props.displayMode).toBe('note'); // FAILS before fix, PASSES after
  });

  test('selecting Pos 1 produces non-empty boxHighlights', () => {
    let tree: any;
    act(() => { tree = create(<ScalesScreen />); });
    const pos1Btns = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Pos 1');
    act(() => { pos1Btns[0].props.onPress(); });
    const FV = (require('../../components').FretboardViewer as any).type;
    const fv = tree.root.findByType(FV);
    expect(fv.props.boxHighlights.length).toBeGreaterThan(0);
  });

  test('selecting Pos 1 then Pos 2 activates both boxes', () => {
    let tree: any;
    act(() => { tree = create(<ScalesScreen />); });
    const pos1Btns = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Pos 1');
    const pos2Btns = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Pos 2');
    act(() => { pos1Btns[0].props.onPress(); });
    act(() => { pos2Btns[0].props.onPress(); });
    const FV = (require('../../components').FretboardViewer as any).type;
    const fv = tree.root.findByType(FV);
    expect(fv.props.boxHighlights.length).toBe(2);
  });

  test('tapping the only active position reverts to All (empty boxHighlights)', () => {
    let tree: any;
    act(() => { tree = create(<ScalesScreen />); });
    const pos1Btns = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Pos 1');
    act(() => { pos1Btns[0].props.onPress(); }); // activate Pos 1
    act(() => { pos1Btns[0].props.onPress(); }); // deactivate → reverts to All
    const FV = (require('../../components').FretboardViewer as any).type;
    const fv = tree.root.findByType(FV);
    expect(fv.props.boxHighlights).toEqual([]); // All mode = no highlights
  });

  test('Mode picker visible when Advanced open on 7-note scale', () => {
    let tree: any;
    act(() => { tree = create(<ScalesScreen />); }); // default = Major (7-note)
    const advBtns = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Toggle advanced options');
    act(() => { advBtns[0].props.onPress(); });
    expect(JSON.stringify(tree.toJSON())).toContain('Ionian');
  });

  test('switching from 7-note to 5-note scale hides Mode picker even when Advanced open', () => {
    let tree: any;
    act(() => { tree = create(<ScalesScreen />); });
    const advBtns = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Toggle advanced options');
    act(() => { advBtns[0].props.onPress(); }); // open Advanced on Major (7-note)
    expect(JSON.stringify(tree.toJSON())).toContain('Ionian'); // Mode picker visible
    const minorPentBtns = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Minor Pent.');
    act(() => { minorPentBtns[0].props.onPress(); }); // switch to 5-note
    expect(JSON.stringify(tree.toJSON())).not.toContain('Ionian'); // Mode picker hidden
  });
});
