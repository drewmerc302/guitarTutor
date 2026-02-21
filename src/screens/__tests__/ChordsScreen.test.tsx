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

    const initialButtons = root.findAllByType('TouchableOpacity');
    const activeStyle = JSON.stringify([].concat(...initialButtons[0].props.style));
    const inactiveStyle = JSON.stringify([].concat(...initialButtons[1].props.style));
    expect(activeStyle).not.toEqual(inactiveStyle); // C is active, C# is not

    act(() => { initialButtons[4].props.onPress(); }); // press E (index 4)

    const updatedButtons = root.findAllByType('TouchableOpacity');
    const newActiveStyle = JSON.stringify([].concat(...updatedButtons[4].props.style));
    const prevActiveStyle = JSON.stringify([].concat(...updatedButtons[0].props.style));
    expect(newActiveStyle).not.toEqual(prevActiveStyle);
  });

  test('selecting a chord type updates active type highlight', () => {
    let tree: any;
    act(() => { tree = create(<ChordsScreen />); });
    const root = tree.root;

    // 0-11: note chips, 12: Major (first type, active by default)
    const initialButtons = root.findAllByType('TouchableOpacity');
    const majorStyle = JSON.stringify([].concat(...initialButtons[12].props.style));
    const minorStyle = JSON.stringify([].concat(...initialButtons[13].props.style));
    expect(majorStyle).not.toEqual(minorStyle);

    act(() => { initialButtons[13].props.onPress(); }); // press Minor

    const updatedButtons = root.findAllByType('TouchableOpacity');
    const newMinorStyle = JSON.stringify([].concat(...updatedButtons[13].props.style));
    const prevMajorStyle = JSON.stringify([].concat(...updatedButtons[12].props.style));
    expect(newMinorStyle).not.toEqual(prevMajorStyle);
  });
});
