// src/components/__tests__/TypePicker.test.tsx
import React from 'react';
import { create, act } from 'react-test-renderer';
import { TypePicker } from '../TypePicker';

describe('TypePicker', () => {
  const types = ['Major', 'Minor', '7th', 'Dim'];

  test('renders without crashing', () => {
    let tree: any;
    act(() => {
      tree = create(<TypePicker types={types} activeType="Major" onSelect={jest.fn()} />);
    });
    expect(tree.toJSON()).toBeTruthy();
  });

  test('renders all provided types', () => {
    let tree: any;
    act(() => {
      tree = create(<TypePicker types={types} activeType="Major" onSelect={jest.fn()} />);
    });
    const json = JSON.stringify(tree.toJSON());
    for (const type of types) {
      expect(json).toContain(type);
    }
  });

  test('calls onSelect with type name when pressed', () => {
    const onSelect = jest.fn();
    let tree: any;
    act(() => {
      tree = create(<TypePicker types={types} activeType="Major" onSelect={onSelect} />);
    });
    const root = tree.root;
    const buttons = root.findAllByType('TouchableOpacity');
    expect(buttons.length).toBe(types.length);
    act(() => {
      buttons[1].props.onPress(); // Minor
    });
    expect(onSelect).toHaveBeenCalledWith('Minor');
  });

  test('highlights the active type', () => {
    let tree: any;
    act(() => {
      tree = create(<TypePicker types={types} activeType="Minor" onSelect={jest.fn()} />);
    });
    const root = tree.root;
    const buttons = root.findAllByType('TouchableOpacity');
    // Minor (index 1) should have accent background
    const activeStyle = buttons[1].props.style;
    const bgStyle = activeStyle.find((s: any) => s.backgroundColor);
    expect(bgStyle.backgroundColor).toBe('#d4a04a');
    // Major (index 0) should have tertiary background
    const inactiveStyle = buttons[0].props.style;
    const bgInactive = inactiveStyle.find((s: any) => s.backgroundColor);
    expect(bgInactive.backgroundColor).toBe('#232328');
  });
});
