// Single source of truth for canvas geometry. Phases/streams store no coordinates;
// all positions are derived from these constants + array order. Everything lives in
// Vue Flow "graph space" so the whole diagram pans/zooms together.

/** Height of one swimlane row, in graph units. */
export const LANE_HEIGHT = 120

/** Width of one phase column, in graph units. */
export const PHASE_WIDTH = 320

/** Height of the top "Meilensteine" band (phase headers + L2 diamonds). */
export const TOP_BAND_H = 64

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

/** Left X of phase column `index`. */
export function phaseLeftX(index: number): number {
  return CONTENT_X0 + index * PHASE_WIDTH
}

/** Start/end graph X of phase column `index`. */
export function phaseBoundsX(index: number): { start: number; end: number } {
  const start = CONTENT_X0 + index * PHASE_WIDTH
  return { start, end: start + PHASE_WIDTH }
}

/** Which phase a given graph X falls in (clamped to a valid index). */
export function phaseIndexFromX(x: number, phaseCount: number): number {
  if (phaseCount <= 0) return 0
  return clamp(Math.floor((x - CONTENT_X0) / PHASE_WIDTH), 0, phaseCount - 1)
}

/** Total content width for `phaseCount` phases. */
export function totalWidth(phaseCount: number): number {
  return CONTENT_X0 + Math.max(phaseCount, 1) * PHASE_WIDTH + CANVAS_PAD
}

/** Total content height for `streamCount` streams. */
export function totalHeight(streamCount: number): number {
  return CONTENT_Y0 + Math.max(streamCount, 1) * LANE_HEIGHT + CANVAS_PAD
}
