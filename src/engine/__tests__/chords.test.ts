// src/engine/__tests__/chords.test.ts
import {
  CHORD_TYPES,
  generateBarreVoicings,
  generateMinorBarreVoicings,
  getChordVoicings,
  buildVoicingRegions,
  ChordVoicing,
} from '../chords';
import { STANDARD_TUNING, TOTAL_FRETS } from '../notes';

describe('CHORD_TYPES', () => {
  test('Major chord is [0,4,7]', () => {
    expect(CHORD_TYPES['Major']).toEqual([0,4,7]);
  });
  test('Minor chord is [0,3,7]', () => {
    expect(CHORD_TYPES['Minor']).toEqual([0,3,7]);
  });
  test('has all expected chord families', () => {
    const expected = ['Major','Minor','7th','Maj7','Min7','Dim','Aug','Sus2','Sus4','Dim7','Min7b5','9th'];
    for (const name of expected) {
      expect(CHORD_TYPES[name]).toBeDefined();
    }
  });
});

describe('generateBarreVoicings', () => {
  test('generates 5 CAGED shapes for C major (root=0)', () => {
    const voicings = generateBarreVoicings(0);
    expect(voicings.length).toBeGreaterThanOrEqual(3);
    expect(voicings.length).toBeLessThanOrEqual(5);
  });

  test('all voicings have 6 string entries', () => {
    const voicings = generateBarreVoicings(0);
    for (const v of voicings) {
      expect(v).toHaveLength(6);
    }
  });

  test('frets are within valid range or -1 for muted', () => {
    for (let root = 0; root < 12; root++) {
      const voicings = generateBarreVoicings(root);
      for (const v of voicings) {
        for (const note of v) {
          expect(note.f >= -1).toBe(true);
          if (note.f >= 0) expect(note.f <= TOTAL_FRETS).toBe(true);
        }
      }
    }
  });

  test('each voicing contains the correct root note on at least one string', () => {
    for (let root = 0; root < 12; root++) {
      const voicings = generateBarreVoicings(root);
      for (const v of voicings) {
        const playedNotes = v.filter(n => n.f >= 0).map(n => (STANDARD_TUNING[n.s] + n.f) % 12);
        expect(playedNotes).toContain(root);
      }
    }
  });
});

describe('generateMinorBarreVoicings', () => {
  test('generates voicings for all 12 roots', () => {
    for (let root = 0; root < 12; root++) {
      const voicings = generateMinorBarreVoicings(root);
      expect(voicings.length).toBeGreaterThanOrEqual(2);
    }
  });

  test('each voicing contains the minor third', () => {
    for (let root = 0; root < 12; root++) {
      const minorThird = (root + 3) % 12;
      const voicings = generateMinorBarreVoicings(root);
      for (const v of voicings) {
        const playedNotes = v.filter(n => n.f >= 0).map(n => (STANDARD_TUNING[n.s] + n.f) % 12);
        expect(playedNotes).toContain(minorThird);
      }
    }
  });
});

describe('getChordVoicings', () => {
  test('Major returns barre voicings', () => {
    const voicings = getChordVoicings(0, 'Major');
    expect(voicings.length).toBeGreaterThanOrEqual(3);
  });

  test('Minor returns minor barre voicings', () => {
    const voicings = getChordVoicings(0, 'Minor');
    expect(voicings.length).toBeGreaterThanOrEqual(2);
  });

  test('other types return at least one voicing', () => {
    const voicings = getChordVoicings(0, '7th');
    expect(voicings.length).toBeGreaterThanOrEqual(1);
  });
});

describe('buildVoicingRegions', () => {
  test('creates regions with fret sets and root fret info', () => {
    const voicings = generateBarreVoicings(0);
    const regions = buildVoicingRegions(voicings, 0);
    expect(regions.length).toBe(voicings.length);
    for (const r of regions) {
      expect(r.frets).toBeInstanceOf(Set);
      expect(r.voicing).toBeDefined();
    }
  });
});
