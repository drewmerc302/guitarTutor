import React from 'react';
import { create, act } from 'react-test-renderer';
import { ChipPicker } from '../ChipPicker';

describe('ChipPicker — single select', () => {
  const options = ['Major', 'Minor', 'Maj7', 'Min7', 'Dom7'];

  test('renders without crashing', () => {
    let tree: any;
    act(() => {
      tree = create(
        <ChipPicker options={options} activeOption="Major" onSelect={() => {}} />
      );
    });
    expect(tree.toJSON()).toBeTruthy();
  });

  test('renders all options', () => {
    let tree: any;
    act(() => {
      tree = create(
        <ChipPicker options={options} activeOption="Major" onSelect={() => {}} />
      );
    });
    const json = JSON.stringify(tree.toJSON());
    options.forEach(opt => expect(json).toContain(opt));
  });

  test('renders correct number of chips', () => {
    let tree: any;
    act(() => {
      tree = create(
        <ChipPicker options={options} activeOption="Major" onSelect={() => {}} />
      );
    });
    const buttons = tree.root.findAllByType('TouchableOpacity');
    expect(buttons).toHaveLength(options.length);
  });

  test('calls onSelect with tapped option', () => {
    const onSelect = jest.fn();
    let tree: any;
    act(() => {
      tree = create(
        <ChipPicker options={options} activeOption="Major" onSelect={onSelect} />
      );
    });
    const buttons = tree.root.findAllByType('TouchableOpacity');
    act(() => { buttons[1].props.onPress(); }); // tap "Minor"
    expect(onSelect).toHaveBeenCalledWith('Minor');
  });

  test('active chip has different style than inactive', () => {
    let tree: any;
    act(() => {
      tree = create(
        <ChipPicker options={options} activeOption="Major" onSelect={() => {}} />
      );
    });
    const buttons = tree.root.findAllByType('TouchableOpacity');
    const activeStyle = JSON.stringify([].concat(...buttons[0].props.style));
    const inactiveStyle = JSON.stringify([].concat(...buttons[1].props.style));
    expect(activeStyle).not.toEqual(inactiveStyle);
  });
});

describe('ChipPicker — multi select', () => {
  const options = ['All', 'Pos 1', 'Pos 2', 'Pos 3'];

  test('renders all options', () => {
    let tree: any;
    act(() => {
      tree = create(
        <ChipPicker
          options={options}
          multiSelect
          activeOptions={new Set(['All'])}
          onToggle={() => {}}
        />
      );
    });
    const json = JSON.stringify(tree.toJSON());
    options.forEach(opt => expect(json).toContain(opt));
  });

  test('calls onToggle with tapped option', () => {
    const onToggle = jest.fn();
    let tree: any;
    act(() => {
      tree = create(
        <ChipPicker
          options={options}
          multiSelect
          activeOptions={new Set(['All'])}
          onToggle={onToggle}
        />
      );
    });
    const buttons = tree.root.findAllByType('TouchableOpacity');
    act(() => { buttons[1].props.onPress(); }); // tap "Pos 1"
    expect(onToggle).toHaveBeenCalledWith('Pos 1');
  });

  test('active options have different style than inactive', () => {
    let tree: any;
    act(() => {
      tree = create(
        <ChipPicker
          options={options}
          multiSelect
          activeOptions={new Set(['Pos 1'])}
          onToggle={() => {}}
        />
      );
    });
    const buttons = tree.root.findAllByType('TouchableOpacity');
    const activeStyle = JSON.stringify([].concat(...buttons[1].props.style));   // Pos 1
    const inactiveStyle = JSON.stringify([].concat(...buttons[0].props.style)); // All
    expect(activeStyle).not.toEqual(inactiveStyle);
  });
});
