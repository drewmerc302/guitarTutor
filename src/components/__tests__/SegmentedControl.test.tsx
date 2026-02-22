import React from 'react';
import { create, act } from 'react-test-renderer';
import { SegmentedControl } from '../SegmentedControl';

describe('SegmentedControl', () => {
  const options = ['Finger', 'Interval', 'Note'];

  test('renders without crashing', () => {
    let tree: any;
    act(() => {
      tree = create(
        <SegmentedControl options={options} activeOption="Interval" onSelect={() => {}} />
      );
    });
    expect(tree.toJSON()).toBeTruthy();
  });

  test('renders all options', () => {
    let tree: any;
    act(() => {
      tree = create(
        <SegmentedControl options={options} activeOption="Interval" onSelect={() => {}} />
      );
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Finger');
    expect(json).toContain('Interval');
    expect(json).toContain('Note');
  });

  test('renders correct number of segments', () => {
    let tree: any;
    act(() => {
      tree = create(
        <SegmentedControl options={options} activeOption="Interval" onSelect={() => {}} />
      );
    });
    const buttons = tree.root.findAllByType('TouchableOpacity');
    expect(buttons).toHaveLength(3);
  });

  test('calls onSelect with the tapped option', () => {
    const onSelect = jest.fn();
    let tree: any;
    act(() => {
      tree = create(
        <SegmentedControl options={options} activeOption="Interval" onSelect={onSelect} />
      );
    });
    const buttons = tree.root.findAllByType('TouchableOpacity');
    act(() => { buttons[2].props.onPress(); }); // tap "Note"
    expect(onSelect).toHaveBeenCalledWith('Note');
  });

  test('applies custom style to container', () => {
    let tree: any;
    act(() => {
      tree = create(
        <SegmentedControl
          options={['A', 'B']}
          activeOption="A"
          onSelect={() => {}}
          style={{ flex: 1 }}
        />
      );
    });
    const root = tree.toJSON();
    expect(JSON.stringify(root.props.style)).toContain('"flex":1');
  });

  test('active segment has different style than inactive', () => {
    let tree: any;
    act(() => {
      tree = create(
        <SegmentedControl options={options} activeOption="Interval" onSelect={() => {}} />
      );
    });
    const buttons = tree.root.findAllByType('TouchableOpacity');
    const activeStyle = JSON.stringify([].concat(...buttons[1].props.style));
    const inactiveStyle = JSON.stringify([].concat(...buttons[0].props.style));
    expect(activeStyle).not.toEqual(inactiveStyle);
  });
});
