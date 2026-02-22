// src/components/ChordDiagram.tsx
import React, { ReactElement } from 'react';
import Svg, { G, Line, Circle, Text as SvgText } from 'react-native-svg';
import { ChordVoicing } from '../engine/chords';
import { useTheme } from '../theme/ThemeContext';
import { STANDARD_TUNING, NOTE_NAMES } from '../engine/notes';
import { INTERVAL_NAMES, intervalFromRoot } from '../engine/intervals';
import { assignFingers } from '../engine/fingers';

interface ChordDiagramProps {
  voicing: ChordVoicing | null;
  root: number;
  width?: number;
  height?: number;
  displayMode?: 'finger' | 'interval' | 'note';
}

function ChordDiagramInner({ voicing, root, width, height, displayMode }: ChordDiagramProps) {
  const { theme } = useTheme();

  if (!voicing) return null;

  const W = 90, H = 112;
  const renderW = width ?? W;
  const renderH = height ?? H;
  const padL = 10, padR = 10, padT = 26, padB = 6;
  const gridW = W - padL - padR; // 70
  const gridH = H - padT - padB; // 80
  const SS = gridW / 5;          // string spacing: 14
  const displayFrets = 5;
  const FW = gridH / displayFrets; // fret row height: 16

  const playedFrets = voicing.filter(v => v.f > 0).map(v => v.f);
  const hasOpenStrings = voicing.some(v => v.f === 0);
  const minFret = playedFrets.length > 0 ? Math.min(...playedFrets) : 0;
  const isOpenPosition = minFret <= 3 && hasOpenStrings;
  const fretOffset = isOpenPosition ? 0 : Math.max(0, minFret - 1);

  const fingerMap: Record<string, number> = {};
  if (displayMode === 'finger') {
    const fingerNotes = voicing.filter(v => v.f > 0).map(v => ({
      string: v.s, fret: v.f,
      note: (STANDARD_TUNING[v.s] + v.f) % 12,
      interval: 0, intervalLabel: '', isRoot: false, noteName: '', finger: null as number | null,
    }));
    assignFingers(fingerNotes);
    for (const fn of fingerNotes) {
      fingerMap[`${fn.string}-${fn.fret}`] = fn.finger ?? 0;
    }
  }

  const renderStrings = (): ReactElement[] =>
    Array.from({ length: 6 }, (_, s) => (
      <Line
        key={`str-${s}`}
        x1={padL + (5 - s) * SS} y1={padT}
        x2={padL + (5 - s) * SS} y2={padT + gridH}
        stroke={theme.stringColor}
        strokeWidth={0.5 + s * 0.15}
        opacity={0.6}
      />
    ));

  const renderFretLines = (): ReactElement[] =>
    Array.from({ length: displayFrets + 1 }, (_, f) => {
      const isNut = f === 0 && fretOffset === 0;
      return (
        <Line
          key={`fret-${f}`}
          x1={padL} y1={padT + f * FW}
          x2={padL + gridW} y2={padT + f * FW}
          stroke={isNut ? theme.nutColor : theme.fretWire}
          strokeWidth={isNut ? 3 : 1}
          opacity={isNut ? 1 : 0.4}
        />
      );
    });

  const renderDots = (): ReactElement[] => {
    const dots: ReactElement[] = [];
    for (const v of voicing) {
      const x = padL + (5 - v.s) * SS;
      if (v.f < 0) {
        dots.push(
          <SvgText key={`mute-${v.s}`} x={x} y={padT - 9}
            fill={theme.textMuted} fontSize={9}
            textAnchor="middle" alignmentBaseline="central">×</SvgText>
        );
        continue;
      }
      if (v.f === 0) {
        const noteVal = STANDARD_TUNING[v.s] % 12;
        const isRoot = noteVal === root;
        const r = isRoot ? 6 : 5;
        const y = padT - 9;
        let openLabel = '';
        if (displayMode === 'interval') {
          openLabel = INTERVAL_NAMES[intervalFromRoot(root, noteVal)] ?? '';
        } else if (displayMode === 'note') {
          openLabel = NOTE_NAMES[noteVal];
        }
        dots.push(
          <G key={`open-${v.s}`}>
            <Circle cx={x} cy={y} r={r}
              fill={isRoot ? theme.rootColor : theme.accent}
            />
            {openLabel ? (
              <SvgText x={x} y={y} fill={theme.dotText} fontSize={6} fontWeight="700"
                textAnchor="middle" alignmentBaseline="central">{openLabel}</SvgText>
            ) : (
              <SvgText x={x} y={y} fill={theme.dotText} fontSize={8}
                textAnchor="middle" alignmentBaseline="central">○</SvgText>
            )}
          </G>
        );
        continue;
      }
      const displayFret = v.f - fretOffset;
      const y = padT + (displayFret - 0.5) * FW;
      const isRoot = (STANDARD_TUNING[v.s] + v.f) % 12 === root;
      const r = isRoot ? 6 : 5;
      let label = '';
      if (displayMode === 'finger') {
        const finger = fingerMap[`${v.s}-${v.f}`];
        label = finger === 0 ? 'O' : finger !== undefined ? String(finger) : '';
      } else if (displayMode === 'interval') {
        const noteVal = (STANDARD_TUNING[v.s] + v.f) % 12;
        label = INTERVAL_NAMES[intervalFromRoot(root, noteVal)] ?? '';
      } else if (displayMode === 'note') {
        label = NOTE_NAMES[(STANDARD_TUNING[v.s] + v.f) % 12];
      }
      dots.push(
        <G key={`dot-${v.s}-${v.f}`}>
          <Circle cx={x} cy={y} r={r} fill={isRoot ? theme.rootColor : theme.accent} />
          {label ? (
            <SvgText x={x} y={y} fill={theme.dotText} fontSize={6} fontWeight="700"
              textAnchor="middle" alignmentBaseline="central">{label}</SvgText>
          ) : null}
        </G>
      );
    }
    return dots;
  };

  return (
    <Svg width={renderW} height={renderH} viewBox={`0 0 ${W} ${H}`}>
      {fretOffset > 0 && (
        <SvgText
          x={padL + gridW - 6} y={padT - 10}
          fill={theme.textSecondary} fontSize={9}
          fontWeight="700"
          textAnchor="end">
          {fretOffset + 1}fr
        </SvgText>
      )}
      {renderFretLines()}
      {renderStrings()}
      {renderDots()}
    </Svg>
  );
}

export const ChordDiagram = React.memo(ChordDiagramInner);
