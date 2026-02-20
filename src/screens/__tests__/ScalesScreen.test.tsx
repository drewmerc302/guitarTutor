// src/screens/__tests__/ScalesScreen.test.tsx
import React from 'react';
import { create, act } from 'react-test-renderer';
import { ScalesScreen } from '../ScalesScreen';

describe('ScalesScreen', () => {
  test('renders without crashing', () => {
    let tree: any;
    act(() => {
      tree = create(<ScalesScreen />);
    });
    expect(tree.toJSON()).toBeTruthy();
  });

  test('renders title', () => {
    let tree: any;
    act(() => {
      tree = create(<ScalesScreen />);
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Scales');
  });

  test('renders scale type options', () => {
    let tree: any;
    act(() => {
      tree = create(<ScalesScreen />);
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Major');
    expect(json).toContain('Blues');
  });

  test('renders mode picker for 7-note scales', () => {
    let tree: any;
    act(() => {
      tree = create(<ScalesScreen />);
    });
    const json = JSON.stringify(tree.toJSON());
    // Major is 7-note, so mode picker should show
    expect(json).toContain('Ionian');
    expect(json).toContain('Dorian');
  });

  test('renders DisplayToggle with only Interval and Note modes', () => {
    let tree: any;
    act(() => {
      tree = create(<ScalesScreen />);
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Interval');
    expect(json).toContain('Note');
    // Should NOT have Finger mode
    expect(json).not.toContain('"Finger"');
  });

  test('renders position picker', () => {
    let tree: any;
    act(() => {
      tree = create(<ScalesScreen />);
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('All');
    expect(json).toContain('Box 1');
  });

  // --- Interaction tests ---

  test('selecting a note updates active note highlight', () => {
    let tree: any;
    act(() => { tree = create(<ScalesScreen />); });
    const root = tree.root;

    // C (index 0) is active by default
    const initialButtons = root.findAllByType('TouchableOpacity');
    const initialStyle = [].concat(...initialButtons[0].props.style);
    expect(JSON.stringify(initialStyle)).toContain('#d4a04a');

    // Press G (index 7 in NotePicker)
    act(() => { initialButtons[7].props.onPress(); });

    const updatedButtons = root.findAllByType('TouchableOpacity');
    const updatedStyle = [].concat(...updatedButtons[7].props.style);
    expect(JSON.stringify(updatedStyle)).toContain('#d4a04a');

    const prevStyle = [].concat(...updatedButtons[0].props.style);
    expect(JSON.stringify(prevStyle)).not.toContain('#d4a04a');
  });

  test('selecting a scale type updates active type highlight', () => {
    let tree: any;
    act(() => { tree = create(<ScalesScreen />); });
    const root = tree.root;

    // 0-11 NotePicker, 12-18 scale TypePicker (Major=12, Nat.Minor=13, MajPent=14, MinPent=15, Blues=16, ...)
    const initialButtons = root.findAllByType('TouchableOpacity');
    const majorStyle = [].concat(...initialButtons[12].props.style);
    expect(JSON.stringify(majorStyle)).toContain('#d4a04a');

    act(() => { initialButtons[16].props.onPress(); }); // press Blues (index 4 in TypePicker)

    const updatedButtons = root.findAllByType('TouchableOpacity');
    const bluesStyle = [].concat(...updatedButtons[16].props.style);
    expect(JSON.stringify(bluesStyle)).toContain('#d4a04a');

    const prevMajorStyle = [].concat(...updatedButtons[12].props.style);
    expect(JSON.stringify(prevMajorStyle)).not.toContain('#d4a04a');
  });
});
