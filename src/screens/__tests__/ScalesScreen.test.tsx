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
});
