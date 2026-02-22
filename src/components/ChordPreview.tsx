// src/components/ChordPreview.tsx
import React, { useMemo, ReactElement } from 'react';
import Svg, { Rect, Line, Circle, Text as SvgText, G } from 'react-native-svg';
import { ChordVoicing } from '../engine/chords';
import { useTheme } from '../theme/ThemeContext';
import { STANDARD_TUNING } from '../engine/notes';
import { assignFingers } from '../engine/fingers';

interface ChordPreviewProps {
  voicing: ChordVoicing | null;
  root: number;
}

function ChordPreviewInner({ voicing, root }: ChordPreviewProps) {
  const { theme } = useTheme();

  const rendered = useMemo(() => {
    if (!voicing) {
      return { hasVoicing: false, fretOffset: 0, displayFrets: 5, fingerMap: {} };
    }

    const playedFrets = voicing.filter(v => v.f > 0).map(v => v.f);
    const hasOpenStrings = voicing.some(v => v.f === 0);
    const minFret = playedFrets.length > 0 ? Math.min(...playedFrets) : 0;

    const isOpenPosition = minFret <= 3 && hasOpenStrings;
    const fretOffset = isOpenPosition ? 0 : Math.max(0, minFret - 1);
    const displayFrets = 5;

    const fingerNotes = voicing.filter(v => v.f >= 0).map(v => ({
      string: v.s,
      fret: v.f,
      note: (STANDARD_TUNING[v.s] + v.f) % 12,
      interval: 0,
      intervalLabel: '',
      isRoot: false,
      noteName: '',
      finger: null as number | null,
    }));
    assignFingers(fingerNotes);
    const fingerMap: Record<string, number> = {};
    for (const fn of fingerNotes) {
      fingerMap[`${fn.string}-${fn.fret}`] = fn.finger ?? 0;
    }

    return {
      hasVoicing: true,
      fretOffset,
      displayFrets,
      fingerMap,
    };
  }, [voicing]);

  if (!rendered.hasVoicing) {
    return null;
  }

  const { fretOffset, displayFrets, fingerMap } = rendered;

  const w = 200, h = 150;
  const padL = 30, padT = 22, padR = 15, padB = 18;
  const fw = (w - padL - padR) / displayFrets;
  const ss = (h - padT - padB) / 5;

  const renderDots = (): ReactElement[] => {
    const dots: React.ReactElement[] = [];
    for (const v of voicing!) {
      if (v.f < 0) {
        dots.push(
          <SvgText
            key={`muted-${v.s}`}
            x={padL - 10}
            y={padT + v.s * ss}
            fill={theme.textMuted}
            fontSize={10}
            textAnchor="middle"
            alignmentBaseline="central"
          >
            ×
          </SvgText>
        );
        continue;
      }

      const displayFret = v.f - fretOffset;
      const x = displayFret === 0 ? padL + fw / 2 : padL + displayFret * fw + fw / 2;
      const y = padT + v.s * ss;
      const noteVal = (STANDARD_TUNING[v.s] + v.f) % 12;
      const isRoot = noteVal === root;
      const finger = fingerMap[`${v.s}-${v.f}`];
      const fingerLabel = finger === 0 ? 'O' : finger !== undefined ? String(finger) : '';

      dots.push(
        <G key={`dot-${v.s}-${v.f}`}>
          <Circle
            cx={x}
            cy={y}
            r={isRoot ? 8 : 6}
            fill={isRoot ? theme.rootColor : theme.accent}
          />
          {fingerLabel ? (
            <SvgText
              x={x}
              y={y}
              fill={theme.dotText}
              fontSize={7}
              fontWeight="700"
              textAnchor="middle"
              alignmentBaseline="central"
            >
              {fingerLabel}
            </SvgText>
          ) : null}
        </G>
      );
    }
    return dots;
  };

  const renderFretWires = (): ReactElement[] => {
    const wires: React.ReactElement[] = [];
    const startWire = fretOffset === 0 ? 2 : 1;
    for (let f = startWire; f <= displayFrets; f++) {
      wires.push(
        <Line
          key={`wire-${f}`}
          x1={padL + f * fw}
          y1={padT - 2}
          x2={padL + f * fw}
          y2={padT + 5 * ss + 2}
          stroke={theme.fretWire}
          strokeWidth={1}
          opacity={0.4}
        />
      );
    }
    return wires;
  };

  const renderStrings = (): ReactElement[] => {
    const strings: React.ReactElement[] = [];
    for (let s = 0; s < 6; s++) {
      strings.push(
        <Line
          key={`string-${s}`}
          x1={padL}
          y1={padT + s * ss}
          x2={padL + displayFrets * fw}
          y2={padT + s * ss}
          stroke={theme.stringColor}
          strokeWidth={0.5 + s * 0.15}
          opacity={0.4}
        />
      );
    }
    return strings;
  };

  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <Rect
        x={padL}
        y={padT - 4}
        width={displayFrets * fw}
        height={5 * ss + 8}
        rx={3}
        fill={theme.fretboardBg}
        opacity={0.5}
      />

      {fretOffset === 0 ? (
        <Line
          x1={padL + fw}
          y1={padT - 4}
          x2={padL + fw}
          y2={padT + 5 * ss + 4}
          stroke={theme.nutColor}
          strokeWidth={3}
        />
      ) : (
        <SvgText
          x={padL + fw + fw / 2}
          y={padT - 10}
          fill={theme.textSecondary}
          fontSize={9}
          textAnchor="middle"
        >
          {fretOffset + 1}fr
        </SvgText>
      )}

      {renderFretWires()}
      {renderStrings()}
      {renderDots()}
    </Svg>
  );
}

export const ChordPreview = React.memo(ChordPreviewInner);
