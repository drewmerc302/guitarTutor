# Responsive Layout Design

**Date:** 2026-02-22

## Overview

Add adaptive layouts that improve tablet/desktop experience while maintaining the phone layout as the default.

## Breakpoints

- `width < 768`: Current phone layout (single column controls above fretboard)
- `width >= 768`: Tablet/desktop layout (two-column)

## Tablet/Desktop Layout

- Screen splits: controls left (~40%), fretboard right (~60%)
- Controls remain in a single vertical column but with increased spacing
- Fretboard fills available space (no max width cap)
- Circle of Fifths scales proportionally with screen width
- Bottom tab bar stays the same

## Implementation Approach

1. Create a `useResponsive()` hook returning `isTablet` (≥768px)
2. Wrap screen content in a responsive container
3. Controls panel: flex row with wrap on tablet, column on phone
4. Fretboard panel: flex-grow to fill remaining space

## What Stays the Same

- Bottom tab navigation on all screen sizes
- Settings as modal overlay
- All existing components and interactions
