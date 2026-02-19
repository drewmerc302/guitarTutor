// src/theme/__tests__/colors.test.ts
import { lightTheme, darkTheme, getNoteColor, ThemeColors } from '../colors';

describe('theme colors', () => {
  test('darkTheme has all required color keys', () => {
    const keys: (keyof ThemeColors)[] = [
      'bgPrimary','bgSecondary','bgTertiary','bgElevated',
      'textPrimary','textSecondary','textMuted',
      'accent','accentDim','accentGlow',
      'fretWire','stringColor','dotText',
      'border','rootColor',
      'fretboardBg','fretboardGradientEnd','inlayColor','nutColor',
    ];
    for (const key of keys) {
      expect(darkTheme[key]).toBeDefined();
    }
  });

  test('lightTheme has all required color keys', () => {
    expect(lightTheme.bgPrimary).toBeDefined();
    expect(lightTheme.textPrimary).toBeDefined();
  });

  test('getNoteColor returns root color for root notes', () => {
    const color = getNoteColor(0, true); // interval=0, isRoot=true
    expect(color).toBe('#e8734a');
  });

  test('getNoteColor returns blue for thirds', () => {
    expect(getNoteColor(3, false)).toBe('#5ba3d9'); // minor third
    expect(getNoteColor(4, false)).toBe('#5ba3d9'); // major third
  });

  test('getNoteColor returns green for fifths', () => {
    expect(getNoteColor(7, false)).toBe('#6bc77a');
  });

  test('getNoteColor returns purple for sevenths', () => {
    expect(getNoteColor(10, false)).toBe('#c76bb8');
    expect(getNoteColor(11, false)).toBe('#c76bb8');
  });
});
