// src/screens/__tests__/SettingsScreen.test.tsx
import React from 'react';
import { create, act } from 'react-test-renderer';
import { SettingsScreen } from '../SettingsScreen';

describe('SettingsScreen', () => {
  const noop = () => {};

  test('renders without crashing', () => {
    let tree: any;
    act(() => { tree = create(<SettingsScreen onClose={noop} onOpenGlossary={noop} />); });
    expect(tree.toJSON()).toBeTruthy();
  });

  test('renders Settings title', () => {
    let tree: any;
    act(() => { tree = create(<SettingsScreen onClose={noop} onOpenGlossary={noop} />); });
    expect(JSON.stringify(tree.toJSON())).toContain('Settings');
  });

  test('renders DISPLAY section header', () => {
    let tree: any;
    act(() => { tree = create(<SettingsScreen onClose={noop} onOpenGlossary={noop} />); });
    expect(JSON.stringify(tree.toJSON())).toContain('DISPLAY');
  });

  test('renders Note names row', () => {
    let tree: any;
    act(() => { tree = create(<SettingsScreen onClose={noop} onOpenGlossary={noop} />); });
    expect(JSON.stringify(tree.toJSON())).toContain('Note names');
  });

  test('renders Hand row', () => {
    let tree: any;
    act(() => { tree = create(<SettingsScreen onClose={noop} onOpenGlossary={noop} />); });
    expect(JSON.stringify(tree.toJSON())).toContain('Hand');
  });

  test('renders Theme row', () => {
    let tree: any;
    act(() => { tree = create(<SettingsScreen onClose={noop} onOpenGlossary={noop} />); });
    expect(JSON.stringify(tree.toJSON())).toContain('Theme');
  });

  test('renders PLAYBACK section header', () => {
    let tree: any;
    act(() => { tree = create(<SettingsScreen onClose={noop} onOpenGlossary={noop} />); });
    expect(JSON.stringify(tree.toJSON())).toContain('PLAYBACK');
  });

  test('renders Capo row with stepper', () => {
    let tree: any;
    act(() => { tree = create(<SettingsScreen onClose={noop} onOpenGlossary={noop} />); });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Capo');
    expect(json).toContain('−'); // minus sign
    expect(json).toContain('+');
  });

  test('renders ABOUT section with Glossary row', () => {
    let tree: any;
    act(() => { tree = create(<SettingsScreen onClose={noop} onOpenGlossary={noop} />); });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('ABOUT');
    expect(json).toContain('Glossary');
  });

  test('calls onClose when close button pressed', () => {
    const onClose = jest.fn();
    let tree: any;
    act(() => { tree = create(<SettingsScreen onClose={onClose} onOpenGlossary={noop} />); });
    const buttons = tree.root.findAllByType('TouchableOpacity');
    act(() => { buttons[0].props.onPress(); }); // first button = close
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('calls onOpenGlossary when Glossary row pressed', () => {
    const onOpenGlossary = jest.fn();
    let tree: any;
    act(() => { tree = create(<SettingsScreen onClose={noop} onOpenGlossary={onOpenGlossary} />); });
    const buttons = tree.root.findAllByType('TouchableOpacity');
    act(() => { buttons[buttons.length - 1].props.onPress(); }); // last button = Glossary row
    expect(onOpenGlossary).toHaveBeenCalledTimes(1);
  });
});
