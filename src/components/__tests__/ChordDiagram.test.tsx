// src/components/__tests__/ChordDiagram.test.tsx
import React from 'react';
import { create, act } from 'react-test-renderer';
import { ChordDiagram } from '../ChordDiagram';
import { ChordVoicing } from '../../engine/chords';

describe('ChordDiagram', () => {
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
    act(() => { tree = create(<ChordDiagram voicing={openCVoicing} root={0} />); });
    expect(tree.toJSON()).toBeTruthy();
  });

  test('renders null when voicing is null', () => {
    let tree: any;
    act(() => { tree = create(<ChordDiagram voicing={null} root={0} />); });
    expect(tree.toJSON()).toBeNull();
  });

  test('renders × for muted strings', () => {
    let tree: any;
    act(() => { tree = create(<ChordDiagram voicing={openCVoicing} root={0} />); });
    expect(JSON.stringify(tree.toJSON())).toContain('×');
  });

  test('renders ○ for open strings', () => {
    let tree: any;
    act(() => { tree = create(<ChordDiagram voicing={openCVoicing} root={0} />); });
    expect(JSON.stringify(tree.toJSON())).toContain('○');
  });

  test('renders nut line (strokeWidth 3) for open position chords', () => {
    let tree: any;
    act(() => { tree = create(<ChordDiagram voicing={openCVoicing} root={0} />); });
    expect(JSON.stringify(tree.toJSON())).toContain('"strokeWidth":3');
  });

  test('renders fret label for barre chords', () => {
    let tree: any;
    act(() => { tree = create(<ChordDiagram voicing={barreVoicing} root={9} />); });
    expect(JSON.stringify(tree.toJSON())).toContain('fr');
  });

  test('renders Circle dots for fretted strings', () => {
    let tree: any;
    act(() => { tree = create(<ChordDiagram voicing={openCVoicing} root={0} />); });
    const circles = tree.root.findAllByType('Circle');
    // 4 fretted strings (f>0) → 4 dots
    expect(circles.length).toBeGreaterThanOrEqual(4);
  });
});
