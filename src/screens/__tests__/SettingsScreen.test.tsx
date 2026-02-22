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
    const closeBtn = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Close settings')[0];
    act(() => { closeBtn.props.onPress(); });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('calls onOpenGlossary when Glossary row pressed', () => {
    const onOpenGlossary = jest.fn();
    let tree: any;
    act(() => { tree = create(<SettingsScreen onClose={noop} onOpenGlossary={onOpenGlossary} />); });
    const glossaryBtn = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Glossary')[0];
    act(() => { glossaryBtn.props.onPress(); });
    expect(onOpenGlossary).toHaveBeenCalledTimes(1);
  });

  test('Bug 6 — pressing ♭ (inactive) calls toggleFlats; pressing ♯ (already active) does not', () => {
    const noop = () => {};
    let tree: any;
    act(() => { tree = create(<SettingsScreen onClose={noop} onOpenGlossary={noop} />); });

    const { toggleFlats } = (require('../../theme/ThemeContext').useTheme as jest.Mock)();
    (toggleFlats as jest.Mock).mockClear();

    // Press '♭' — not active (useFlats=false → '♯' is active), so toggleFlats SHOULD be called
    const flatBtn = tree.root.findAll((n: any) => n.props.accessibilityLabel === '♭')[0];
    act(() => { flatBtn.props.onPress(); });
    expect(toggleFlats).toHaveBeenCalledTimes(1);

    (toggleFlats as jest.Mock).mockClear();

    // Press '♯' — already active, so toggleFlats should NOT be called
    const sharpBtn = tree.root.findAll((n: any) => n.props.accessibilityLabel === '♯')[0];
    act(() => { sharpBtn.props.onPress(); });
    expect(toggleFlats).toHaveBeenCalledTimes(0);
  });

  test('Left-handed option calls toggleLeftHanded; Right-handed (already active) does not', () => {
    const noop = () => {};
    let tree: any;
    act(() => { tree = create(<SettingsScreen onClose={noop} onOpenGlossary={noop} />); });
    const { toggleLeftHanded } = (require('../../theme/ThemeContext').useTheme as jest.Mock)();
    (toggleLeftHanded as jest.Mock).mockClear();

    // isLeftHanded=false → 'Right-handed' is active → pressing it does NOT call toggle
    const rightBtn = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Right-handed')[0];
    act(() => { rightBtn.props.onPress(); });
    expect(toggleLeftHanded).toHaveBeenCalledTimes(0);

    // Pressing 'Left-handed' DOES call toggle
    const leftBtn = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Left-handed')[0];
    act(() => { leftBtn.props.onPress(); });
    expect(toggleLeftHanded).toHaveBeenCalledTimes(1);
  });

  test('Dark option does not call toggleTheme (already active); Light does', () => {
    const noop = () => {};
    let tree: any;
    act(() => { tree = create(<SettingsScreen onClose={noop} onOpenGlossary={noop} />); });
    const { toggleTheme } = (require('../../theme/ThemeContext').useTheme as jest.Mock)();
    (toggleTheme as jest.Mock).mockClear();

    // isDark=true → 'Dark' is active → pressing it does NOT call toggle
    const darkBtn = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Dark')[0];
    act(() => { darkBtn.props.onPress(); });
    expect(toggleTheme).toHaveBeenCalledTimes(0);

    // Pressing 'Light' DOES call toggle
    const lightBtn = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Light')[0];
    act(() => { lightBtn.props.onPress(); });
    expect(toggleTheme).toHaveBeenCalledTimes(1);
  });

  test('Capo + increases value; − decreases it', () => {
    const noop = () => {};
    let tree: any;
    act(() => { tree = create(<SettingsScreen onClose={noop} onOpenGlossary={noop} />); });
    const { setCapo } = (require('../../theme/ThemeContext').useTheme as jest.Mock)();
    (setCapo as jest.Mock).mockClear();

    const increaseBtn = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Increase capo')[0];
    act(() => { increaseBtn.props.onPress(); });
    expect(setCapo).toHaveBeenCalledWith(1); // Math.min(7, 0+1) = 1

    (setCapo as jest.Mock).mockClear();
    const decreaseBtn = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Decrease capo')[0];
    act(() => { decreaseBtn.props.onPress(); });
    expect(setCapo).toHaveBeenCalledWith(0); // Math.max(0, 0-1) = 0
  });

  test('Capo − at 0 does not go below 0', () => {
    const noop = () => {};
    let tree: any;
    act(() => { tree = create(<SettingsScreen onClose={noop} onOpenGlossary={noop} />); });
    const { setCapo } = (require('../../theme/ThemeContext').useTheme as jest.Mock)();
    (setCapo as jest.Mock).mockClear();

    const decreaseBtn = tree.root.findAll((n: any) => n.props.accessibilityLabel === 'Decrease capo')[0];
    act(() => { decreaseBtn.props.onPress(); });
    expect(setCapo).toHaveBeenCalledWith(0);
    expect(setCapo).not.toHaveBeenCalledWith(-1);
  });
});
