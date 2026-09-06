"use client";

import { cn } from "@workspace/ui/lib/utils";
import * as React from "react";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type SliderOrientation = "horizontal" | "vertical";
export type SliderValue = number | number[];

export interface SliderProps {
  /** Value or values (one per thumb). */
  value?: SliderValue;
  /** Uncontrolled initial value. @default 50 */
  defaultValue?: SliderValue;
  /** Fires with the snapped value on every change. */
  onValueChange?: (value: SliderValue) => void;
  /** Minimum. @default 0 */
  min?: number;
  /** Maximum. @default 100 */
  max?: number;
  /** Step snapping. @default 1 */
  step?: number;
  /** Layout direction of the track. @default "horizontal" */
  orientation?: SliderOrientation;
  /** Disable all interaction. @default false */
  disabled?: boolean;
  /** Accessible label for a single thumb, or one per thumb. */
  ariaLabel?: string | string[];
  /** Text direction — mirrors horizontal fill and arrows. @default "ltr" */
  dir?: "ltr" | "rtl";
  /** Extra classes for the root. */
  className?: string;
}

function capturePointer(e: React.PointerEvent) {
  try {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  } catch {
    // Best-effort: dragging still works without capture.
  }
}

function asArray(value: SliderValue): number[] {
  return Array.isArray(value) ? value : [value];
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

function snap(v: number, min: number, step: number): number {
  if (step <= 0) return v;
  return min + Math.round((v - min) / step) * step;
}

// ─────────────────────────────────────────────────────────────
// Component — pointer + keyboard multi-thumb slider.
// ─────────────────────────────────────────────────────────────

export function Slider({
  value: controlledValue,
  defaultValue = 50,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  orientation = "horizontal",
  disabled = false,
  ariaLabel = "Value",
  dir = "ltr",
  className,
}: SliderProps) {
  const [internalValue, setInternalValue] = React.useState<SliderValue>(defaultValue);
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const values = asArray(value).map((v) => clamp(snap(v, min, step), min, max));

  const trackRef = React.useRef<HTMLDivElement>(null);
  const dragIndex = React.useRef<number | null>(null);
  const vertical = orientation === "vertical";
  const rtl = dir === "rtl" && !vertical;

  const emit = (next: number[]) => {
    const shaped: SliderValue = Array.isArray(value) || next.length > 1 ? next : (next[0] as number);
    if (controlledValue === undefined) setInternalValue(shaped);
    onValueChange?.(shaped);
  };

  const ratioToValue = (ratio: number): number => {
    // ratio 0..1 along the increasing direction
    return clamp(snap(min + ratio * (max - min), min, step), min, max);
  };

  const pointToRatio = (clientX: number, clientY: number): number => {
    const track = trackRef.current;
    if (!track) return 0;
    const r = track.getBoundingClientRect();
    if (vertical) {
      const ratio = 1 - (clientY - r.top) / r.height;
      return clamp(ratio, 0, 1);
    }
    const ratio = (clientX - r.left) / r.width;
    return clamp(rtl ? 1 - ratio : ratio, 0, 1);
  };

  const moveNearest = (clientX: number, clientY: number) => {
    const v = ratioToValue(pointToRatio(clientX, clientY));
    let best = 0;
    let bestDist = Infinity;
    values.forEach((cur, i) => {
      const d = Math.abs(cur - v);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    const next = [...values];
    next[best] = v;
    emit(next);
    dragIndex.current = best;
  };

  const onTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    capturePointer(e);
    moveNearest(e.clientX, e.clientY);
  };

  const onTrackPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || dragIndex.current === null) return;
    const v = ratioToValue(pointToRatio(e.clientX, e.clientY));
    const next = [...values];
    next[dragIndex.current] = v;
    emit(next);
  };

  const endDrag = () => {
    dragIndex.current = null;
  };

  const onThumbKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (disabled) return;
    const cur = values[index] ?? min;
    const big = step * 10;
    let next: number | null = null;
    const fwd = vertical ? "ArrowUp" : rtl ? "ArrowLeft" : "ArrowRight";
    const back = vertical ? "ArrowDown" : rtl ? "ArrowRight" : "ArrowLeft";
    if (e.key === fwd) next = cur + step;
    else if (e.key === back) next = cur - step;
    else if (e.key === "PageUp") next = cur + big;
    else if (e.key === "PageDown") next = cur - big;
    else if (e.key === "Home") next = min;
    else if (e.key === "End") next = max;
    if (next === null) return;
    e.preventDefault();
    const updated = [...values];
    updated[index] = clamp(snap(next, min, step), min, max);
    emit(updated);
  };

  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  const labels = Array.isArray(ariaLabel) ? ariaLabel : values.map(() => ariaLabel as string);

  const lo = values.length > 1 ? Math.min(...values) : min;
  const hi = Math.max(...values);

  return (
    <div
      data-slot="slider"
      data-orientation={orientation}
      dir={dir}
      className={cn(
        "relative flex touch-none select-none",
        vertical ? "h-48 w-6 flex-col items-center" : "h-6 w-full max-w-xs flex-row items-center",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <div
        ref={trackRef}
        onPointerDown={onTrackPointerDown}
        onPointerMove={onTrackPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className={cn(
          "relative rounded-full bg-secondary",
          vertical ? "h-full w-1.5" : "h-1.5 w-full",
        )}
      >
        {/* Fill */}
        <div
          aria-hidden
          className="absolute rounded-full bg-primary"
          style={
            vertical
              ? { bottom: `${pct(lo)}%`, top: `${100 - pct(hi)}%`, left: 0, right: 0 }
              : rtl
                ? { right: `${pct(lo)}%`, left: `${100 - pct(hi)}%`, top: 0, bottom: 0 }
                : { left: `${pct(lo)}%`, right: `${100 - pct(hi)}%`, top: 0, bottom: 0 }
          }
        />
        {values.map((v, i) => (
          <div
            key={i}
            role="slider"
            tabIndex={disabled ? undefined : 0}
            aria-label={labels[i] ?? `Value ${i + 1}`}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={Math.round(v * 100) / 100}
            aria-orientation={orientation}
            aria-disabled={disabled || undefined}
            onKeyDown={(e) => onThumbKeyDown(i, e)}
            onPointerDown={(e) => {
              if (disabled) return;
              e.stopPropagation();
              dragIndex.current = i;
              capturePointer(e);
            }}
            onPointerMove={onTrackPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            className={cn(
              "absolute block size-5 rounded-full border-2 border-primary bg-background shadow-sm transition-transform",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              !disabled && "cursor-grab active:cursor-grabbing active:scale-110",
              vertical
                ? "left-1/2 -translate-x-1/2 translate-y-1/2"
                : rtl
                  ? "translate-x-1/2 top-1/2 -translate-y-1/2"
                  : "-translate-x-1/2 top-1/2 -translate-y-1/2",
            )}
            style={
              vertical
                ? { bottom: `${pct(v)}%` }
                : rtl
                  ? { right: `${pct(v)}%` }
                  : { left: `${pct(v)}%` }
            }
          />
        ))}
      </div>
    </div>
  );
}

export default Slider;
