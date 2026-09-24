"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

export interface WaveBarsLoaderProps {
  /** Total height of the loader in px (tallest bar). Bar width, gap, radius and glow scale from this. @default 60 */
  size?: number;
  /** Solid fill color of the bars. @default "#42E6C6" */
  color?: string;
  /** Speed multiplier: 1 = reference speed, 0.5 = slower, 2 = faster. @default 1 */
  speed?: number;
  /** Horizontal gap between bars in px. Defaults to size * 0.11. */
  gap?: number;
  /** Width of each bar in px. Defaults to size * 0.32. */
  barWidth?: number;
  /** Corner radius of each bar in px. Defaults to barWidth * 0.3. */
  borderRadius?: number;
  /** Enables a very subtle soft aura around the bars. @default true */
  glow?: boolean;
  /** Glow strength multiplier. 1 = reference subtlety. @default 1 */
  glowIntensity?: number;
  /** Freezes the animation mid-state. */
  paused?: boolean;
  /** Accessible label announced while loading. @default "Loading" */
  ariaLabel?: string;
  /** Additional classes applied to the loader wrapper. */
  className?: string;
  /** Inline style overrides for the loader wrapper. */
  style?: React.CSSProperties;
}

const BASE_DURATION = 1.8;
// Linear easing: the keyframe stops below are dense (every 5%) samples of a
// smooth curve, so linear interpolation between them yields continuous
// velocity. An ease-in-out here would dip the velocity at every stop and
// read as hesitation/pulsing instead of one flowing wave.
const EASING = "linear";

/**
 * Coordinated per-bar keyframes (height as % of `size`).
 *
 * The four bars travel through: descending staircase → flat short row →
 * ascending staircase → flat-ish transition → descending staircase.
 * Stops are 5%-spaced samples of a smooth cyclic curve through those
 * shapes; 0% and 100% are identical so the loop restarts seamlessly.
 */
const BAR_KEYFRAMES: Array<Array<[number, number]>> = [
  // Bar 1 — holds tall, collapses, regrows last.
  [
    [0, 100],
    [5, 96.7],
    [10, 87.6],
    [15, 74.9],
    [20, 56.9],
    [25, 42],
    [30, 35.4],
    [35, 32.9],
    [40, 31.4],
    [45, 31.5],
    [50, 32],
    [55, 31.9],
    [60, 31.8],
    [65, 31.8],
    [70, 30.8],
    [75, 35],
    [80, 50.3],
    [85, 70.1],
    [90, 84.4],
    [95, 95.1],
    [100, 100],
  ],
  // Bar 2
  [
    [0, 80],
    [5, 77.8],
    [10, 71.9],
    [15, 62.8],
    [20, 49.1],
    [25, 38],
    [30, 33.6],
    [35, 32.4],
    [40, 31.6],
    [45, 31.4],
    [50, 32],
    [55, 33.2],
    [60, 35],
    [65, 36.8],
    [70, 38.1],
    [75, 42],
    [80, 51.6],
    [85, 63.4],
    [90, 71.7],
    [95, 77.6],
    [100, 80],
  ],
  // Bar 3
  [
    [0, 60],
    [5, 56.8],
    [10, 52.4],
    [15, 47.3],
    [20, 40.9],
    [25, 36],
    [30, 34],
    [35, 33.7],
    [40, 34.5],
    [45, 36.4],
    [50, 40],
    [55, 46.8],
    [60, 54.8],
    [65, 60.4],
    [70, 64.1],
    [75, 66],
    [80, 65.2],
    [85, 62.9],
    [90, 61.6],
    [95, 61.3],
    [100, 60],
  ],
  // Bar 4 — stays low while the left collapses, peaks, then releases.
  [
    [0, 35],
    [5, 34.1],
    [10, 34],
    [15, 33.8],
    [20, 33.4],
    [25, 34],
    [30, 36],
    [35, 39.5],
    [40, 44.9],
    [45, 52.1],
    [50, 62],
    [55, 79.1],
    [60, 96.3],
    [65, 98.7],
    [70, 86.5],
    [75, 72],
    [80, 59],
    [85, 46.6],
    [90, 39],
    [95, 36.3],
    [100, 35],
  ],
];

function buildKeyframes(name: string, stops: Array<[number, number]>): string {
  const frames = stops
    .map(([at, height]) => `  ${at}% { height: ${height}%; }`)
    .join("\n");
  return `@keyframes ${name} {\n${frames}\n}`;
}

const WAVE_BARS_LOADER_CSS = `
${BAR_KEYFRAMES.map((stops, index) => buildKeyframes(`wbl-bar-${index + 1}`, stops)).join("\n")}
@media (prefers-reduced-motion: reduce) {
  [data-slot="wave-bars-loader"] > [data-bar] {
    animation: none !important;
  }
}
`;

function hexToRgba(color: string, alpha: number): string {
  const hex = color.trim();
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex);
  if (!match) return color;
  let full: string = match[1] as string;
  if (full.length === 3) {
    full = full
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const value = parseInt(full as string, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * WaveBarsLoader — a deterministic 4-bar traveling-wave loader.
 *
 * Four rounded bars share a bottom baseline and morph through coordinated
 * height states (descending staircase → flat → ascending staircase) to
 * create one continuous wave motion. Pure CSS keyframes, no re-renders.
 */
export function WaveBarsLoader({
  size = 60,
  color = "#42E6C6",
  speed = 1,
  gap,
  barWidth,
  borderRadius,
  glow = true,
  glowIntensity = 1,
  paused = false,
  ariaLabel = "Loading",
  className,
  style,
}: WaveBarsLoaderProps) {
  const safeSize = Number.isFinite(size) && size > 0 ? size : 60;
  const safeSpeed =
    Number.isFinite(speed) && (speed as number) > 0 ? (speed as number) : 1;

  const resolvedBarWidth =
    Number.isFinite(barWidth) && (barWidth as number) > 0
      ? (barWidth as number)
      : safeSize * 0.32;
  const resolvedGap =
    Number.isFinite(gap) && (gap as number) >= 0
      ? (gap as number)
      : safeSize * 0.11;
  const resolvedRadius =
    Number.isFinite(borderRadius) && (borderRadius as number) >= 0
      ? (borderRadius as number)
      : resolvedBarWidth * 0.3;

  const duration = BASE_DURATION / safeSpeed;
  const intensity = Number.isFinite(glowIntensity)
    ? Math.min(2.5, Math.max(0, glowIntensity as number))
    : 1;
  const glowBlur = Math.max(2, safeSize * 0.1 * intensity);
  const glowStyle = glow
    ? {
        filter: `drop-shadow(0 0 ${glowBlur.toFixed(2)}px ${hexToRgba(color, 0.28 * intensity)})`,
      }
    : undefined;

  // Static fallback heights (0% keyframe values) so the loader still renders
  // a clean descending staircase if animations are disabled or paused before start.
  const staticHeights = BAR_KEYFRAMES.map((stops) => stops[0]?.[1] ?? 35);

  return (
    <div
      role="status"
      aria-label={ariaLabel}
      data-slot="wave-bars-loader"
      className={cn("wbl-root", className)}
      style={{
        display: "inline-flex",
        alignItems: "flex-end",
        gap: `${resolvedGap}px`,
        height: `${safeSize}px`,
        ...glowStyle,
        ...style,
      }}
    >
      <style>{WAVE_BARS_LOADER_CSS}</style>
      {staticHeights.map((fallbackHeight, index) => (
        <span
          key={`wbl-bar-${index}`}
          data-bar={index + 1}
          aria-hidden="true"
          style={{
            display: "block",
            width: `${resolvedBarWidth}px`,
            height: `${fallbackHeight}%`,
            backgroundColor: color,
            borderRadius: `${resolvedRadius}px`,
            animationName: `wbl-bar-${index + 1}`,
            animationDuration: `${duration}s`,
            animationTimingFunction: EASING,
            animationIterationCount: "infinite",
            animationPlayState: paused ? "paused" : "running",
            willChange: "height",
          }}
        />
      ))}
    </div>
  );
}

export default WaveBarsLoader;
