// src/components/__tests__/ChordPreview.test.tsx
import React from 'react';
import { create, act } from 'react-test-renderer';
import { ChordPreview } from '../ChordPreview';
import { ChordVoicing } from '../../engine/chords';

describe('ChordPreview', () => {
  const openCVoicing: ChordVoicing = [
    { s: 0, f: 0 }, { s: 1, f: 1 }, { s: 2, f: 0 },
    { s: 3, f: 2 }, { s: 4, f: 3 }, { s: 5, f: -1 },
  ];

  const barreVoicing: ChordVoicing = [
    { s: 0, f: 5 }, { s: 1, f: 5 }, { s: 2, f: 6 },
    { s: 3, f: 7 }, { s: 4, f: 7 }, { s: 5, f: 5 },
  ];

  test('renders without crashing', () => {
    let tree: any;
    act(() => {
      tree = create(<ChordPreview voicing={openCVoicing} root={0} />);
    });
    expect(tree.toJSON()).toBeTruthy();
  });

  test('renders null when voicing is null', () => {
    let tree: any;
    act(() => {
      tree = create(<ChordPreview voicing={null} root={0} />);
    });
    expect(tree.toJSON()).toBeNull();
  });

  test('renders muted string markers for muted strings', () => {
    let tree: any;
    act(() => {
      tree = create(<ChordPreview voicing={openCVoicing} root={0} />);
    });
    const json = JSON.stringify(tree.toJSON());
    // String 5 is muted (f=-1), should show × marker
    expect(json).toContain('×');
  });

  test('renders fret offset label for barre chords', () => {
    let tree: any;
    act(() => {
      tree = create(<ChordPreview voicing={barreVoicing} root={9} />);
    });
    const json = JSON.stringify(tree.toJSON());
    // Should show fret position indicator
    expect(json).toContain('fr');
  });

  test('renders nut line for open position chords', () => {
    let tree: any;
    act(() => {
      tree = create(<ChordPreview voicing={openCVoicing} root={0} />);
    });
    const json = JSON.stringify(tree.toJSON());
    // Nut rendered with strokeWidth 3
    expect(json).toContain('"strokeWidth":3');
  });

  test('renders note dots for all non-muted strings', () => {
    let tree: any;
    act(() => {
      tree = create(<ChordPreview voicing={openCVoicing} root={0} />);
    });
    const root = tree.root;
    // Should have Circle elements for note dots (5 played strings)
    const circles = root.findAllByType('Circle');
    expect(circles.length).toBeGreaterThanOrEqual(5);
  });
});
