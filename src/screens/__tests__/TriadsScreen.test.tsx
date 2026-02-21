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
});
