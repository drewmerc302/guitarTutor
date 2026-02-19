// src/components/GuitarNeck.tsx
import React, { useMemo, ReactElement } from 'react';
import Svg, { Rect, Line, Circle, Text as SvgText, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { FretboardNote } from '../engine/fretboard';
import { useTheme } from '../theme/ThemeContext';
import { TOTAL_FRETS, STRING_NAMES } from '../engine/notes';
import { getNoteColor } from '../theme/colors';

interface GuitarNeckProps {
  notes: FretboardNote[];
  displayMode: 'finger' | 'interval' | 'note';
  activeVoicing?: Set<string>;
  hasVoicings?: boolean;
  activeNoteSet?: Set<string> | null;
  boxHighlights?: { fretStart: number; fretEnd: number }[];
  onNotePress?: (string: number, fret: number, isRoot: boolean) => void;
}

const FB = {
  padLeft: 40,
  padRight: 20,
  padTop: 30,
  padBottom: 30,
  fretWidth: 60,
  stringSpacing: 28,
  dotRadius: 11,
};

export function GuitarNeck({
  notes,
  displayMode,
  activeVoicing = new Set(),
  hasVoicings = false,
  activeNoteSet = null,
  boxHighlights = [],
  onNotePress,
}: GuitarNeckProps) {
  const { theme } = useTheme();

  const width = FB.padLeft + (TOTAL_FRETS + 1) * FB.fretWidth + FB.padRight;
  const height = FB.padTop + 5 * FB.stringSpacing + FB.padBottom;

  const noteMap = useMemo(() => {
    const map: Record<string, FretboardNote> = {};
    for (const note of notes) {
      map[`${note.string}-${note.fret}`] = note;
    }
    return map;
  }, [notes]);

  const renderNoteDots = (): ReactElement[] => {
    const dots: JSX.Element[] = [];
    
    for (let s = 0; s < 6; s++) {
      for (let f = 0; f <= TOTAL_FRETS; f++) {
        const note = noteMap[`${s}-${f}`];
        if (!note) continue;

        const x = f === 0
          ? FB.padLeft + FB.fretWidth / 2
          : FB.padLeft + f * FB.fretWidth + FB.fretWidth / 2;
        const y = FB.padTop + s * FB.stringSpacing;

        let isPrimary: boolean;
        if (activeNoteSet) {
          isPrimary = activeNoteSet.has(`${note.string}-${note.fret}`);
        } else {
          isPrimary = !hasVoicings || activeVoicing.has(`${note.string}-${note.fret}`);
        }

        const r = note.isRoot ? FB.dotRadius + 2 : FB.dotRadius;
        const color = getNoteColor(note.interval, note.isRoot);

        let label = '';
        if (displayMode === 'note') label = note.noteName;
        else if (displayMode === 'interval') label = note.intervalLabel;
        else if (displayMode === 'finger') {
          if (note.finger !== null && note.finger !== undefined) {
            label = note.finger === 0 ? 'O' : String(note.finger);
          } else {
            label = note.isRoot ? 'R' : note.intervalLabel;
          }
        }

        const opacity = isPrimary ? 1 : 0.2;
        const textOpacity = isPrimary ? 1 : 0.6;
        const fontSize = r > 11 ? 10 : 9;

        const handlePress = () => {
          if (onNotePress) {
            onNotePress(note.string, note.fret, note.isRoot);
          }
        };

        dots.push(
          <G
            key={`${s}-${f}`}
            opacity={opacity}
            onPress={handlePress}
          >
            <Circle
              cx={x}
              cy={y}
              r={r}
              fill={color}
            />
            {label ? (
              <SvgText
                x={x}
                y={y}
                fill={theme.dotText}
                fontSize={fontSize}
                textAnchor="middle"
                alignmentBaseline="central"
                opacity={textOpacity}
              >
                {label}
              </SvgText>
            ) : null}
          </G>
        );
      }
    }
    return dots;
  };

  const renderBoxHighlights = () => {
    const highlights: JSX.Element[] = [];
    for (const box of boxHighlights) {
      const x1 = FB.padLeft + box.fretStart * FB.fretWidth + (box.fretStart === 0 ? 0 : FB.fretWidth);
      const x2 = FB.padLeft + (box.fretEnd + 1) * FB.fretWidth;
      highlights.push(
        <Rect
          key={`box-${box.fretStart}`}
          x={x1}
          y={FB.padTop - 10}
          width={x2 - x1}
          height={5 * FB.stringSpacing + 20}
          rx={6}
          fill={theme.accent}
          opacity={0.08}
          stroke={theme.accent}
          strokeWidth={1}
          strokeOpacity={0.3}
        />
      );
    }
    return highlights;
  };

  const renderInlays = () => {
    const inlays: JSX.Element[] = [];
    const singleInlays = [3, 5, 7, 9, 15];
    const doubleInlays = [12];
    const midY = FB.padTop + 2.5 * FB.stringSpacing;

    for (const f of singleInlays) {
      if (f <= TOTAL_FRETS) {
        const x = FB.padLeft + f * FB.fretWidth + FB.fretWidth / 2;
        inlays.push(
          <Circle key={`inlay-${f}`} cx={x} cy={midY} r={5} fill={theme.inlayColor} />
        );
      }
    }
    for (const f of doubleInlays) {
      if (f <= TOTAL_FRETS) {
        const x = FB.padLeft + f * FB.fretWidth + FB.fretWidth / 2;
        inlays.push(
          <Circle key={`inlay-double-${f}-1`} cx={x} cy={midY - FB.stringSpacing * 1.2} r={5} fill={theme.inlayColor} />,
          <Circle key={`inlay-double-${f}-2`} cx={x} cy={midY + FB.stringSpacing * 1.2} r={5} fill={theme.inlayColor} />
        );
      }
    }
    return inlays;
  };

  const renderStrings = () => {
    const strings: JSX.Element[] = [];
    for (let s = 0; s < 6; s++) {
      const y = FB.padTop + s * FB.stringSpacing;
      const thickness = 0.6 + s * 0.22;
      strings.push(
        <Line
          key={`string-${s}`}
          x1={FB.padLeft}
          y1={y}
          x2={FB.padLeft + (TOTAL_FRETS + 1) * FB.fretWidth}
          y2={y}
          stroke={theme.stringColor}
          strokeWidth={thickness}
          opacity={0.5}
        />
      );
    }
    return strings;
  };

  const renderFretWires = () => {
    const wires: JSX.Element[] = [];
    for (let f = 2; f <= TOTAL_FRETS + 1; f++) {
      const x = FB.padLeft + f * FB.fretWidth;
      wires.push(
        <Line
          key={`fret-${f}`}
          x1={x}
          y1={FB.padTop - 4}
          x2={x}
          y2={FB.padTop + 5 * FB.stringSpacing + 4}
          stroke={theme.fretWire}
          strokeWidth={1.5}
          opacity={0.5}
        />
      );
    }
    return wires;
  };

  const renderFretNumbers = () => {
    const numbers: JSX.Element[] = [];
    for (let f = 1; f <= TOTAL_FRETS; f++) {
      const x = FB.padLeft + f * FB.fretWidth + FB.fretWidth / 2;
      numbers.push(
        <SvgText
          key={`fret-num-${f}`}
          x={x}
          y={FB.padTop + 5 * FB.stringSpacing + 22}
          fill={theme.textSecondary}
          fontSize={10}
          textAnchor="middle"
        >
          {f}
        </SvgText>
      );
    }
    return numbers;
  };

  const renderOpenStringLabels = () => {
    const labels: JSX.Element[] = [];
    for (let s = 0; s < 6; s++) {
      const y = FB.padTop + s * FB.stringSpacing;
      labels.push(
        <SvgText
          key={`open-str-${s}`}
          x={FB.padLeft - 16}
          y={y}
          fill={theme.textMuted}
          fontSize={12}
          textAnchor="middle"
          alignmentBaseline="central"
        >
          {STRING_NAMES[s]}
        </SvgText>
      );
    }
    return labels;
  };

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Defs>
        <LinearGradient id="fretboardGrad" x1="0" y1="0" x2="1" y2="0.3">
          <Stop offset="0%" stopColor={theme.fretboardBg} />
          <Stop offset="100%" stopColor={theme.fretboardGradientEnd} />
        </LinearGradient>
      </Defs>

      <Rect
        x={FB.padLeft - 8}
        y={FB.padTop - 8}
        width={TOTAL_FRETS * FB.fretWidth + FB.fretWidth + 16}
        height={5 * FB.stringSpacing + 16}
        rx={4}
        fill="url(#fretboardGrad)"
      />

      {renderBoxHighlights()}

      <Line
        x1={FB.padLeft + FB.fretWidth}
        y1={FB.padTop - 6}
        x2={FB.padLeft + FB.fretWidth}
        y2={FB.padTop + 5 * FB.stringSpacing + 6}
        stroke={theme.nutColor}
        strokeWidth={4}
      />

      {renderFretWires()}
      {renderInlays()}
      {renderStrings()}
      {renderOpenStringLabels()}
      {renderFretNumbers()}
      {renderNoteDots()}
    </Svg>
  );
}
