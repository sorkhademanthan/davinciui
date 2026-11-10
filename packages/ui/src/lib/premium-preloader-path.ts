/**
 * Card flight path for the Premium Preloader.
 *
 * Coordinates are normalized to the overlay: x is a fraction of width,
 * y is a fraction of height, with (0, 0) at the top-left. The quadratic
 * Bézier runs from below the bottom-left corner to above the top-left
 * corner; the mirrored stream reflects through the viewport center.
 */

export interface PremiumPreloaderPoint {
  x: number;
  y: number;
}

export const PREMIUM_PRELOADER_PATH = {
  start: { x: -9, y: 70 },
  control: { x: 33.2, y: 30.8 },
  end: { x: 28, y: -15 },
} as const;

/** Seconds for one card to travel the whole path. */
export const PREMIUM_PRELOADER_CARD_DURATION = 0.88;

/**
 * Measured card centers from the reference, in vw/vh from the top-left,
 * paired with the card-time they occur at. Used by the path regression
 * test so tuning the control point cannot silently drift.
 */
export const PREMIUM_PRELOADER_MEASURED_POINTS = [
  { time: 0, x: 11, y: 50.7 },
  { time: 0.1, x: 16.7, y: 40 },
  { time: 0.2, x: 21.1, y: 28.8 },
  { time: 0.3, x: 23.3, y: 21.6 },
  { time: 0.4, x: 26, y: 9.6 },
  { time: 0.45, x: 26.7, y: 4.8 },
] as const;

/** Map card-time to the timeline progress that best fits the reference. */
export const PREMIUM_PRELOADER_PATH_OFFSET = 0.258;
export const PREMIUM_PRELOADER_PATH_SCALE = 1.15;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Point on the quadratic path at normalized progress `t` (0 → 1). */
export function premiumPreloaderPathPoint(t: number): PremiumPreloaderPoint {
  const progress = clamp01(t);
  const inverse = 1 - progress;
  const { start, control, end } = PREMIUM_PRELOADER_PATH;
  return {
    x:
      inverse * inverse * start.x +
      2 * inverse * progress * control.x +
      progress * progress * end.x,
    y:
      inverse * inverse * start.y +
      2 * inverse * progress * control.y +
      progress * progress * end.y,
  };
}

/** Path point converted to pixels inside an overlay of the given size. */
export function premiumPreloaderPathPosition(
  t: number,
  width: number,
  height: number,
): PremiumPreloaderPoint {
  const point = premiumPreloaderPathPoint(t);
  return { x: (point.x / 100) * width, y: (point.y / 100) * height };
}

/** Reflect a point through the center of the overlay (180° rotation). */
export function premiumPreloaderMirrorPoint(
  point: PremiumPreloaderPoint,
  width: number,
  height: number,
): PremiumPreloaderPoint {
  return { x: width - point.x, y: height - point.y };
}
