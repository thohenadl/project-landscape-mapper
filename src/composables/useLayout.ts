// Single source of truth for canvas geometry. Streams store no coordinates and phases
// store only a duration (in months); all positions are derived from these constants +
// array order + phase durations. Everything lives in Vue Flow "graph space" so the whole
// diagram pans/zooms together. The X axis is a real timeline: 1 month = PX_PER_MONTH units.

import type { Phase } from '@/types/landscape'

/** Height of one swimlane row, in graph units. */
export const LANE_HEIGHT = 120

/** Graph units per calendar month — the scale of the time axis. */
export const PX_PER_MONTH = 90

/** Default duration (months) for a newly created phase. */
export const DEFAULT_PHASE_MONTHS = 3

/** Height of the top band (phase headers + month ruler + L2 diamonds). */
export const TOP_BAND_H = 92

/** Width of the left gutter that holds stream (swimlane) name labels. */
export const GUTTER_W = 180

/** Padding added to the right/bottom of the content so nodes near the edge aren't clipped. */
export const CANVAS_PAD = 80

/** Rendered size of an L3 milestone point node (square). */
export const L3_SIZE = 40

/** Left edge (graph X) where phase columns begin. */
export const CONTENT_X0 = GUTTER_W

/** Top edge (graph Y) where swimlanes begin. */
export const CONTENT_Y0 = TOP_BAND_H

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(Math.max(v, lo), hi)
}

/** Top Y of swimlane `index`. */
export function laneTopY(index: number): number {
  return CONTENT_Y0 + index * LANE_HEIGHT
}

/** Vertical center Y of swimlane `index` (the snap target for L3 nodes). */
export function laneCenterY(index: number): number {
  return CONTENT_Y0 + index * LANE_HEIGHT + LANE_HEIGHT / 2
}

/** Which swimlane a given graph Y falls in (clamped to a valid index). */
export function streamIndexFromY(y: number, streamCount: number): number {
  if (streamCount <= 0) return 0
  return clamp(Math.floor((y - CONTENT_Y0) / LANE_HEIGHT), 0, streamCount - 1)
}

/** Graph X for a month offset from the timeline start. */
export function xFromMonth(month: number): number {
  return CONTENT_X0 + month * PX_PER_MONTH
}

/** Month offset (from timeline start) for a graph X. */
export function monthFromX(x: number): number {
  return (x - CONTENT_X0) / PX_PER_MONTH
}

/** Month offset where phase `index` begins (sum of earlier phases' durations). */
export function phaseStartMonth(phases: Phase[], index: number): number {
  let m = 0
  for (let i = 0; i < index && i < phases.length; i++) m += phases[i].durationMonths
  return m
}

/** Pixel width of a phase column (its duration in months). */
export function phaseWidthPx(phase: Phase): number {
  return phase.durationMonths * PX_PER_MONTH
}

/** Left X of phase column `index`. */
export function phaseLeftX(phases: Phase[], index: number): number {
  return xFromMonth(phaseStartMonth(phases, index))
}

/** Start/end graph X of phase column `index`. */
export function phaseBoundsX(phases: Phase[], index: number): { start: number; end: number } {
  const start = phaseLeftX(phases, index)
  const width = index < phases.length ? phaseWidthPx(phases[index]) : 0
  return { start, end: start + width }
}

/** Which phase a given graph X falls in (clamped to a valid index). */
export function phaseIndexFromX(x: number, phases: Phase[]): number {
  if (phases.length === 0) return 0
  let acc = CONTENT_X0
  for (let i = 0; i < phases.length; i++) {
    acc += phaseWidthPx(phases[i])
    if (x < acc) return i
  }
  return phases.length - 1
}

/** Total timeline length, in months (sum of all phase durations). */
export function totalMonths(phases: Phase[]): number {
  return phases.reduce((sum, p) => sum + p.durationMonths, 0)
}

/** Total content width for the given phases. */
export function totalWidth(phases: Phase[]): number {
  return CONTENT_X0 + Math.max(totalMonths(phases), 1) * PX_PER_MONTH + CANVAS_PAD
}

/** Total content height for `streamCount` streams. */
export function totalHeight(streamCount: number): number {
  return CONTENT_Y0 + Math.max(streamCount, 1) * LANE_HEIGHT + CANVAS_PAD
}
