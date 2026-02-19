// src/engine/__tests__/arpeggios.test.ts
import { ARP_TYPES } from '../arpeggios';

describe('ARP_TYPES', () => {
  test('Major arpeggio is [0,4,7]', () => {
    expect(ARP_TYPES['Major']).toEqual([0,4,7]);
  });
  test('Dom7 is [0,4,7,10]', () => {
    expect(ARP_TYPES['Dom7']).toEqual([0,4,7,10]);
  });
  test('has all expected types', () => {
    const expected = ['Major','Minor','Dom7','Maj7','Min7','Dim7','Min7b5','Aug'];
    for (const name of expected) {
      expect(ARP_TYPES[name]).toBeDefined();
    }
  });
});
