// src/components/__tests__/NotePicker.test.tsx
import React from 'react';
import { create, act } from 'react-test-renderer';
import { NotePicker } from '../NotePicker';

describe('NotePicker', () => {
  test('renders without crashing', () => {
    let tree: any;
    act(() => {
      tree = create(<NotePicker activeNote={0} onSelect={jest.fn()} />);
    });
    expect(tree.toJSON()).toBeTruthy();
  });

  test('renders all 12 chromatic notes', () => {
    let tree: any;
    act(() => {
      tree = create(<NotePicker activeNote={0} onSelect={jest.fn()} />);
    });
    const json = JSON.stringify(tree.toJSON());
    const noteNames = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    for (const name of noteNames) {
      expect(json).toContain(name);
    }
  });

  test('calls onSelect with note index when pressed', () => {
    const onSelect = jest.fn();
    let tree: any;
    act(() => {
      tree = create(<NotePicker activeNote={0} onSelect={onSelect} />);
    });
    const root = tree.root;
    const buttons = root.findAllByType('TouchableOpacity');
    expect(buttons.length).toBe(12);
    act(() => {
      buttons[4].props.onPress(); // E = index 4
    });
    expect(onSelect).toHaveBeenCalledWith(4);
  });

  test('highlights the active note with accent color', () => {
    let tree: any;
    act(() => {
      tree = create(<NotePicker activeNote={4} onSelect={jest.fn()} />);
    });
    const root = tree.root;
    const buttons = root.findAllByType('TouchableOpacity');
    // E (index 4) should have accent background
    const activeStyle = buttons[4].props.style;
    const bgStyle = activeStyle.find((s: any) => s.backgroundColor);
    expect(bgStyle.backgroundColor).toBe('#d4a04a');
    // C (index 0) should have tertiary background
    const inactiveStyle = buttons[0].props.style;
    const bgInactive = inactiveStyle.find((s: any) => s.backgroundColor);
    expect(bgInactive.backgroundColor).toBe('#232328');
  });
});
