// src/screens/__tests__/ChordsScreen.test.tsx
import React from 'react';
import { create, act } from 'react-test-renderer';
import { ChordsScreen } from '../ChordsScreen';

describe('ChordsScreen', () => {
  test('renders without crashing', () => {
    let tree: any;
    act(() => {
      tree = create(<ChordsScreen />);
    });
    expect(tree.toJSON()).toBeTruthy();
  });

  test('renders title', () => {
    let tree: any;
    act(() => {
      tree = create(<ChordsScreen />);
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Chords');
  });

  test('renders NotePicker for root selection', () => {
    let tree: any;
    act(() => {
      tree = create(<ChordsScreen />);
    });
    const json = JSON.stringify(tree.toJSON());
    // Should have all 12 notes for root selection
    expect(json).toContain('"C"');
    expect(json).toContain('"G"');
    expect(json).toContain('"A"');
  });

  test('renders TypePicker with chord types', () => {
    let tree: any;
    act(() => {
      tree = create(<ChordsScreen />);
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Major');
    expect(json).toContain('Minor');
    expect(json).toContain('7th');
  });

  test('renders DisplayToggle with all 3 modes', () => {
    let tree: any;
    act(() => {
      tree = create(<ChordsScreen />);
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Finger');
    expect(json).toContain('Interval');
    expect(json).toContain('Note');
  });

  test('renders voicing label', () => {
    let tree: any;
    act(() => {
      tree = create(<ChordsScreen />);
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Voicing:');
  });

  // --- Interaction tests ---

  test('selecting a note updates active note highlight', () => {
    let tree: any;
    act(() => { tree = create(<ChordsScreen />); });
    const root = tree.root;

    // C (index 0) is active by default
    const initialButtons = root.findAllByType('TouchableOpacity');
    const initialStyle = [].concat(...initialButtons[0].props.style);
    expect(JSON.stringify(initialStyle)).toContain('#d4a04a');

    // Press E (index 4 in NotePicker)
    act(() => { initialButtons[4].props.onPress(); });

    const updatedButtons = root.findAllByType('TouchableOpacity');
    const updatedStyle = [].concat(...updatedButtons[4].props.style);
    expect(JSON.stringify(updatedStyle)).toContain('#d4a04a');

    // C button should no longer be active
    const prevStyle = [].concat(...updatedButtons[0].props.style);
    expect(JSON.stringify(prevStyle)).not.toContain('#d4a04a');
  });

  test('selecting a chord type updates active type highlight', () => {
    let tree: any;
    act(() => { tree = create(<ChordsScreen />); });
    const root = tree.root;

    // 0-11 NotePicker, 12+ TypePicker. Major (index 12) is active by default.
    const initialButtons = root.findAllByType('TouchableOpacity');
    const majorStyle = [].concat(...initialButtons[12].props.style);
    expect(JSON.stringify(majorStyle)).toContain('#d4a04a');

    act(() => { initialButtons[13].props.onPress(); }); // press Minor

    const updatedButtons = root.findAllByType('TouchableOpacity');
    const minorStyle = [].concat(...updatedButtons[13].props.style);
    expect(JSON.stringify(minorStyle)).toContain('#d4a04a');

    const prevMajorStyle = [].concat(...updatedButtons[12].props.style);
    expect(JSON.stringify(prevMajorStyle)).not.toContain('#d4a04a');
  });
});
