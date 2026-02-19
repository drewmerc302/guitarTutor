// src/engine/__tests__/intervals.test.ts
import { INTERVAL_NAMES, intervalFromRoot } from '../intervals';

describe('intervals', () => {
  test('INTERVAL_NAMES maps semitones to labels', () => {
    expect(INTERVAL_NAMES[0]).toBe('R');
    expect(INTERVAL_NAMES[4]).toBe('3');
    expect(INTERVAL_NAMES[7]).toBe('5');
    expect(INTERVAL_NAMES[10]).toBe('b7');
    expect(INTERVAL_NAMES[11]).toBe('7');
    expect(INTERVAL_NAMES[3]).toBe('b3');
    expect(INTERVAL_NAMES[6]).toBe('b5');
    expect(INTERVAL_NAMES[14]).toBe('9');
  });

  test('intervalFromRoot computes semitones from root', () => {
    // C (0) to E (4) = major 3rd = 4
    expect(intervalFromRoot(0, 4)).toBe(4);
    // A (9) to C (0) = minor 3rd = 3
    expect(intervalFromRoot(9, 0)).toBe(3);
    // E (4) to E (4) = unison = 0
    expect(intervalFromRoot(4, 4)).toBe(0);
  });
});
