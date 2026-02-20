// src/components/__tests__/ScalePositionPicker.test.tsx
import React from 'react';
import { create, act } from 'react-test-renderer';
import { ScalePositionPicker } from '../ScalePositionPicker';
import { computeScalePositions } from '../../engine/scales';

describe('ScalePositionPicker', () => {
  const positions = computeScalePositions(0, [0, 2, 4, 5, 7, 9, 11]);

  test('renders without crashing', () => {
    let tree: any;
    act(() => {
      tree = create(
        <ScalePositionPicker positions={positions} activeSet={new Set(['all'])} onToggle={jest.fn()} />
      );
    });
    expect(tree.toJSON()).toBeTruthy();
  });

  test('renders All button plus position buttons', () => {
    let tree: any;
    act(() => {
      tree = create(
        <ScalePositionPicker positions={positions} activeSet={new Set(['all'])} onToggle={jest.fn()} />
      );
    });
    const root = tree.root;
    const buttons = root.findAllByType('TouchableOpacity');
    // All button + one button per box position (C major starts at fret 8, fits 4 boxes in TOTAL_FRETS=15)
    expect(buttons.length).toBe(positions.length + 1);
  });

  test('renders position labels with fret ranges', () => {
    let tree: any;
    act(() => {
      tree = create(
        <ScalePositionPicker positions={positions} activeSet={new Set(['all'])} onToggle={jest.fn()} />
      );
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('All');
    expect(json).toContain('Box 1');
    // C major starts at fret 8 with TOTAL_FRETS=15, so boxes fit up to position 4 (not 5)
    expect(json).toContain(`Box ${positions.length}`);
  });

  test('calls onToggle with "all" when All is pressed', () => {
    const onToggle = jest.fn();
    let tree: any;
    act(() => {
      tree = create(
        <ScalePositionPicker positions={positions} activeSet={new Set(['all'])} onToggle={onToggle} />
      );
    });
    const root = tree.root;
    const buttons = root.findAllByType('TouchableOpacity');
    act(() => {
      buttons[0].props.onPress(); // All button
    });
    expect(onToggle).toHaveBeenCalledWith('all');
  });

  test('calls onToggle with index when a box is pressed', () => {
    const onToggle = jest.fn();
    let tree: any;
    act(() => {
      tree = create(
        <ScalePositionPicker positions={positions} activeSet={new Set(['all'])} onToggle={onToggle} />
      );
    });
    const root = tree.root;
    const buttons = root.findAllByType('TouchableOpacity');
    act(() => {
      buttons[2].props.onPress(); // Box 2 (index 1)
    });
    expect(onToggle).toHaveBeenCalledWith('1');
  });

  test('highlights active positions', () => {
    let tree: any;
    act(() => {
      tree = create(
        <ScalePositionPicker positions={positions} activeSet={new Set(['0', '2'])} onToggle={jest.fn()} />
      );
    });
    const root = tree.root;
    const buttons = root.findAllByType('TouchableOpacity');
    // Box 1 (button index 1) should be active
    const activeStyle = buttons[1].props.style;
    const bgStyle = activeStyle.find((s: any) => s.backgroundColor);
    expect(bgStyle.backgroundColor).toBe('#d4a04a');
    // Box 2 (button index 2) should NOT be active
    const inactiveStyle = buttons[2].props.style;
    const bgInactive = inactiveStyle.find((s: any) => s.backgroundColor);
    expect(bgInactive.backgroundColor).toBe('#232328');
  });
});
