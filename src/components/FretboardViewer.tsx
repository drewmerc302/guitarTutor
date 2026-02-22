import React, { useRef, useEffect } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { GuitarNeck } from './GuitarNeck';
import { TOTAL_FRETS } from '../engine/tuning';

interface FretboardViewerProps {
  notes: Parameters<typeof GuitarNeck>[0]['notes'];
  displayMode: Parameters<typeof GuitarNeck>[0]['displayMode'];
  activeVoicing?: Parameters<typeof GuitarNeck>[0]['activeVoicing'];
  hasVoicings?: Parameters<typeof GuitarNeck>[0]['hasVoicings'];
  activeNoteSet?: Parameters<typeof GuitarNeck>[0]['activeNoteSet'];
  boxHighlights?: Parameters<typeof GuitarNeck>[0]['boxHighlights'];
  onNotePress?: Parameters<typeof GuitarNeck>[0]['onNotePress'];
  fretRange?: Parameters<typeof GuitarNeck>[0]['fretRange'];
  noteColorOverrides?: Parameters<typeof GuitarNeck>[0]['noteColorOverrides'];
  barreFret?: Parameters<typeof GuitarNeck>[0]['barreFret'];
}

const FB = {
  padLeft: 40,
  padRight: 20,
  fretWidth: 60,
};

const FRETBOARD_WIDTH = FB.padLeft + (TOTAL_FRETS + 1) * FB.fretWidth + FB.padRight;

function getMinFretFromVoicing(activeVoicing?: Set<string>): number {
  if (!activeVoicing || activeVoicing.size === 0) return 0;
  let minFret = Infinity;
  for (const key of activeVoicing) {
    const [, fret] = key.split('-');
    const fretNum = parseInt(fret, 10);
    if (!isNaN(fretNum) && fretNum < minFret) {
      minFret = fretNum;
    }
  }
  return minFret === Infinity ? 0 : minFret;
}

function FretboardViewerInner(props: FretboardViewerProps) {
  const { width: screenWidth } = useWindowDimensions();
  const scrollViewRef = useRef<ScrollView>(null);

  const canScroll = screenWidth < FRETBOARD_WIDTH;

  useEffect(() => {
    if (canScroll && scrollViewRef.current && props.activeVoicing && props.hasVoicings) {
      const minFret = getMinFretFromVoicing(props.activeVoicing);
      const scrollX = Math.max(0, FB.padLeft + minFret * FB.fretWidth - screenWidth / 2 + FB.fretWidth / 2);
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ x: scrollX, animated: false });
      }, 0);
    }
  }, [canScroll, screenWidth, props.activeVoicing, props.hasVoicings]);

  useEffect(() => {
    if (canScroll && scrollViewRef.current && props.boxHighlights && props.boxHighlights.length > 0) {
      // Scroll to the LOWEST (closest to nut) box position
      const minFret = Math.min(...props.boxHighlights.map(b => b.fretStart));
      const scrollX = Math.max(0, FB.padLeft + minFret * FB.fretWidth - 20);
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ x: scrollX, animated: true });
      }, 0);
    } else if (canScroll && scrollViewRef.current && props.notes && props.notes.length > 0) {
      // When no specific box highlights (e.g., "All" selected), scroll to nut (fret 0)
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ x: 0, animated: true });
      }, 0);
    }
  }, [canScroll, screenWidth, props.boxHighlights, props.notes]);

  if (!canScroll) {
    return <GuitarNeck {...props} />;
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      bounces={false}
    >
      <GuitarNeck {...props} />
    </ScrollView>
  );
}

export const FretboardViewer = React.memo(FretboardViewerInner);

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
});
