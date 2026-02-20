// src/components/__tests__/StringGroupPicker.test.tsx
import React from 'react';
import { create, act } from 'react-test-renderer';
import { StringGroupPicker } from '../StringGroupPicker';

describe('StringGroupPicker', () => {
  test('renders without crashing', () => {
    let tree: any;
    act(() => {
      tree = create(<StringGroupPicker active="all" onSelect={jest.fn()} />);
    });
    expect(tree.toJSON()).toBeTruthy();
  });

  test('renders 5 string group options', () => {
    let tree: any;
    act(() => {
      tree = create(<StringGroupPicker active="all" onSelect={jest.fn()} />);
    });
    const root = tree.root;
    const buttons = root.findAllByType('TouchableOpacity');
    expect(buttons.length).toBe(5);
  });

  test('renders correct labels', () => {
    let tree: any;
    act(() => {
      tree = create(<StringGroupPicker active="all" onSelect={jest.fn()} />);
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('All');
    expect(json).toContain('1-2-3');
    expect(json).toContain('2-3-4');
    expect(json).toContain('3-4-5');
    expect(json).toContain('4-5-6');
  });

  test('calls onSelect with correct value when pressed', () => {
    const onSelect = jest.fn();
    let tree: any;
    act(() => {
      tree = create(<StringGroupPicker active="all" onSelect={onSelect} />);
    });
    const root = tree.root;
    const buttons = root.findAllByType('TouchableOpacity');
    act(() => {
      buttons[1].props.onPress(); // 1-2-3 = "0,1,2"
    });
    expect(onSelect).toHaveBeenCalledWith('0,1,2');
  });

  test('highlights the active group', () => {
    let tree: any;
    act(() => {
      tree = create(<StringGroupPicker active="0,1,2" onSelect={jest.fn()} />);
    });
    const root = tree.root;
    const buttons = root.findAllByType('TouchableOpacity');
    // 1-2-3 (index 1) should have accent background
    const activeStyle = buttons[1].props.style;
    const bgStyle = activeStyle.find((s: any) => s.backgroundColor);
    expect(bgStyle.backgroundColor).toBe('#d4a04a');
    // All (index 0) should have tertiary background
    const inactiveStyle = buttons[0].props.style;
    const bgInactive = inactiveStyle.find((s: any) => s.backgroundColor);
    expect(bgInactive.backgroundColor).toBe('#232328');
  });
});
