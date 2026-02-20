// src/screens/__tests__/ArpeggiosScreen.test.tsx
import React from 'react';
import { create, act } from 'react-test-renderer';
import { ArpeggiosScreen } from '../ArpeggiosScreen';

describe('ArpeggiosScreen', () => {
  test('renders without crashing', () => {
    let tree: any;
    act(() => {
      tree = create(<ArpeggiosScreen />);
    });
    expect(tree.toJSON()).toBeTruthy();
  });

  test('renders title', () => {
    let tree: any;
    act(() => {
      tree = create(<ArpeggiosScreen />);
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Arpeggios');
  });

  test('renders arpeggio type options', () => {
    let tree: any;
    act(() => {
      tree = create(<ArpeggiosScreen />);
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Major');
    expect(json).toContain('Minor');
    expect(json).toContain('Dom7');
    expect(json).toContain('Maj7');
  });

  test('renders DisplayToggle with Interval, Note, and Finger modes', () => {
    let tree: any;
    act(() => {
      tree = create(<ArpeggiosScreen />);
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Interval');
    expect(json).toContain('Note');
    expect(json).toContain('"Finger"');
  });

  test('renders root note picker', () => {
    let tree: any;
    act(() => {
      tree = create(<ArpeggiosScreen />);
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Root');
  });

  // --- Interaction tests ---

  test('selecting a note updates active note highlight', () => {
    let tree: any;
    act(() => { tree = create(<ArpeggiosScreen />); });
    const root = tree.root;

    // C (index 0) is active by default
    const initialButtons = root.findAllByType('TouchableOpacity');
    const initialStyle = [].concat(...initialButtons[0].props.style);
    expect(JSON.stringify(initialStyle)).toContain('#d4a04a');

    // Press D (index 2 in NotePicker)
    act(() => { initialButtons[2].props.onPress(); });

    const updatedButtons = root.findAllByType('TouchableOpacity');
    const updatedStyle = [].concat(...updatedButtons[2].props.style);
    expect(JSON.stringify(updatedStyle)).toContain('#d4a04a');

    const prevStyle = [].concat(...updatedButtons[0].props.style);
    expect(JSON.stringify(prevStyle)).not.toContain('#d4a04a');
  });

  test('selecting an arpeggio type updates active type highlight', () => {
    let tree: any;
    act(() => { tree = create(<ArpeggiosScreen />); });
    const root = tree.root;

    // 0-11 NotePicker, 12-19 TypePicker (Major=12, Minor=13, Dom7=14, ...)
    const initialButtons = root.findAllByType('TouchableOpacity');
    const majorStyle = [].concat(...initialButtons[12].props.style);
    expect(JSON.stringify(majorStyle)).toContain('#d4a04a');

    act(() => { initialButtons[14].props.onPress(); }); // press Dom7

    const updatedButtons = root.findAllByType('TouchableOpacity');
    const dom7Style = [].concat(...updatedButtons[14].props.style);
    expect(JSON.stringify(dom7Style)).toContain('#d4a04a');

    const prevMajorStyle = [].concat(...updatedButtons[12].props.style);
    expect(JSON.stringify(prevMajorStyle)).not.toContain('#d4a04a');
  });
});
