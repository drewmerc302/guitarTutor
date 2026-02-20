// src/components/ChordDiagram.tsx
import React, { ReactElement } from 'react';
import Svg, { Line, Circle, Text as SvgText } from 'react-native-svg';
import { ChordVoicing } from '../engine/chords';
import { useTheme } from '../theme/ThemeContext';
import { STANDARD_TUNING } from '../engine/notes';

interface ChordDiagramProps {
  voicing: ChordVoicing | null;
  root: number;
}

function ChordDiagramInner({ voicing, root }: ChordDiagramProps) {
  const { theme } = useTheme();

  if (!voicing) return null;

  const W = 90, H = 112;
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

  const renderStrings = (): ReactElement[] =>
    Array.from({ length: 6 }, (_, s) => (
      <Line
        key={`str-${s}`}
        x1={padL + s * SS} y1={padT}
        x2={padL + s * SS} y2={padT + gridH}
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
      const x = padL + v.s * SS;
      if (v.f < 0) {
        dots.push(
          <SvgText key={`mute-${v.s}`} x={x} y={padT - 9}
            fill={theme.textMuted} fontSize={9}
            textAnchor="middle" alignmentBaseline="central">×</SvgText>
        );
        continue;
      }
      if (v.f === 0) {
        dots.push(
          <SvgText key={`open-text-${v.s}`} x={x} y={padT - 9}
            fill={theme.textMuted} fontSize={9}
            textAnchor="middle" alignmentBaseline="central">○</SvgText>
        );
        continue;
      }
      const displayFret = v.f - fretOffset;
      const y = padT + (displayFret - 0.5) * FW;
      const isRoot = (STANDARD_TUNING[v.s] + v.f) % 12 === root;
      dots.push(
        <Circle key={`dot-${v.s}-${v.f}`}
          cx={x} cy={y} r={isRoot ? 6 : 5}
          fill={isRoot ? theme.rootColor : theme.accent}
        />
      );
    }
    return dots;
  };

  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {fretOffset > 0 && (
        <SvgText
          x={padL + gridW} y={padT - 10}
          fill={theme.textSecondary} fontSize={8}
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
