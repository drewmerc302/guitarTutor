// src/components/__tests__/DisplayToggle.test.tsx
import React from 'react';
import { create, act } from 'react-test-renderer';
import { DisplayToggle } from '../DisplayToggle';

describe('DisplayToggle', () => {
  test('renders without crashing', () => {
    let tree: any;
    act(() => {
      tree = create(
        <DisplayToggle modes={['Finger', 'Interval', 'Note']} activeMode="interval" onSelect={jest.fn()} />
      );
    });
    expect(tree.toJSON()).toBeTruthy();
  });

  test('renders all provided modes', () => {
    const modes = ['Finger', 'Interval', 'Note'];
    let tree: any;
    act(() => {
      tree = create(<DisplayToggle modes={modes} activeMode="interval" onSelect={jest.fn()} />);
    });
    const json = JSON.stringify(tree.toJSON());
    for (const mode of modes) {
      expect(json).toContain(mode);
    }
  });

  test('renders subset of modes correctly', () => {
    const modes = ['Interval', 'Note'];
    let tree: any;
    act(() => {
      tree = create(<DisplayToggle modes={modes} activeMode="interval" onSelect={jest.fn()} />);
    });
    const root = tree.root;
    const buttons = root.findAllByType('TouchableOpacity');
    expect(buttons.length).toBe(2);
  });

  test('calls onSelect with lowercase mode when pressed', () => {
    const onSelect = jest.fn();
    let tree: any;
    act(() => {
      tree = create(
        <DisplayToggle modes={['Finger', 'Interval', 'Note']} activeMode="interval" onSelect={onSelect} />
      );
    });
    const root = tree.root;
    const buttons = root.findAllByType('TouchableOpacity');
    act(() => {
      buttons[2].props.onPress(); // Note
    });
    expect(onSelect).toHaveBeenCalledWith('note');
  });

  test('highlights the active mode', () => {
    let tree: any;
    act(() => {
      tree = create(
        <DisplayToggle modes={['Finger', 'Interval', 'Note']} activeMode="interval" onSelect={jest.fn()} />
      );
    });
    const root = tree.root;
    const buttons = root.findAllByType('TouchableOpacity');
    // Interval (index 1) should have accent background
    const activeStyle = buttons[1].props.style;
    const bgStyle = activeStyle.find((s: any) => s.backgroundColor);
    expect(bgStyle.backgroundColor).toBe('#d4a04a');
  });
});
