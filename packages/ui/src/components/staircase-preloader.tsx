"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@workspace/ui/lib/utils";

export type StaircasePreloaderPhase =
  | "idle"
  | "holding"
  | "exiting"
  | "finished";

export interface StaircasePreloaderProps {
  /** Solid color of the fullscreen curtain. Defaults to vivid red-orange. */
  color?: string;
  /** Number of vertical strips forming the staircase. Defaults to 8. */
  stepCount?: number;
  /** Milliseconds the fully-covered orange frame is held before exiting. */
  holdDuration?: number;
  /** Milliseconds for each column's upward travel. */
  exitDuration?: number;
  /** Stagger in milliseconds between successive columns (left → right). */
  stagger?: number;
  /** Stacking order of the overlay. */
  zIndex?: number;
  /** Additional classes applied to the overlay wrapper. */
  className?: string;
  /** Fires on every phase transition. */
  onPhaseChange?: (phase: StaircasePreloaderPhase) => void;
  /** Fires once the exit reveal finishes and the overlay unmounts. */
  onComplete?: () => void;
}

const EXIT_EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];

/**
 * StaircasePreloader — a fullscreen stepped-curtain reveal.
 *
 * A solid orange overlay covers the viewport, holds briefly, then leaves
 * upward as 8 (by default) vertical strips with a small left-to-right
 * stagger. Because the left strips lift first, the lower boundary forms a
 * rectangular staircase that sweeps up and exits near the top-right,
 * uncovering the stationary page beneath.
 *
 * Replay by remounting: `<StaircasePreloader key={replayCount} />`.
 */
export function StaircasePreloader({
  color = "#FF3D00",
  stepCount = 8,
  holdDuration = 200,
  exitDuration = 850,
  stagger = 55,
  zIndex = 9999,
  className,
  onPhaseChange,
  onComplete,
}: StaircasePreloaderProps) {
  const [phase, setPhase] = React.useState<StaircasePreloaderPhase>("idle");
  const reduceMotion = useReducedMotion();
  const phaseRef = React.useRef<StaircasePreloaderPhase>("idle");
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);
  const onPhaseChangeRef = React.useRef(onPhaseChange);
  const onCompleteRef = React.useRef(onComplete);

  onPhaseChangeRef.current = onPhaseChange;
  onCompleteRef.current = onComplete;

  const goToPhase = React.useCallback((next: StaircasePreloaderPhase) => {
    phaseRef.current = next;
    setPhase(next);
    onPhaseChangeRef.current?.(next);
  }, []);

  const clearTimers = React.useCallback(() => {
    timers.current.forEach((timer) => clearTimeout(timer));
    timers.current = [];
  }, []);

  const later = React.useCallback((fn: () => void, ms: number) => {
    const timer = setTimeout(fn, ms);
    timers.current.push(timer);
  }, []);

  const columns = React.useMemo(() => {
    const count = Math.min(12, Math.max(4, Math.round(stepCount)));
    return Array.from({ length: count }, (_, index) => index);
  }, [stepCount]);

  const columnCount = columns.length;

  // Hold fully covered, then lift the curtain with a left → right stagger.
  React.useEffect(() => {
    goToPhase("holding");
    const hold = reduceMotion ? Math.min(holdDuration, 120) : Math.max(0, holdDuration);

    later(() => {
      if (phaseRef.current !== "holding") return;
      goToPhase("exiting");

      if (reduceMotion) {
        later(() => {
          if (phaseRef.current !== "exiting") return;
          clearTimers();
          goToPhase("finished");
          onCompleteRef.current?.();
        }, 260);
        return;
      }

      const total =
        Math.max(0, exitDuration) + Math.max(0, stagger) * (columnCount - 1);
      later(() => {
        if (phaseRef.current !== "exiting") return;
        clearTimers();
        goToPhase("finished");
        onCompleteRef.current?.();
      }, total + 60);
    }, hold);

    return () => {
      clearTimers();
    };
    // Runs once per mount (replay = remount via key).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lock page scroll while the overlay is alive; restore on exit/unmount.
  React.useEffect(() => {
    if (phase === "finished") return;
    const root = document.documentElement;
    const body = document.body;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyTouchAction = body.style.touchAction;
    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.touchAction = "none";
    return () => {
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBodyOverflow;
      body.style.touchAction = previousBodyTouchAction;
    };
  }, [phase]);

  if (phase === "finished") return null;

  const exiting = phase === "exiting";
  const reduced = Boolean(reduceMotion);
  const exitSeconds = Math.max(
    0.01,
    (reduced ? 250 : Math.max(0, exitDuration)) / 1000,
  );
  const staggerSeconds = reduced ? 0 : Math.max(0, stagger) / 1000;

  return (
    <div
      role="status"
      aria-label="Page loading"
      data-slot="staircase-preloader"
      data-phase={phase}
      className={cn("fixed inset-0 overflow-hidden", className)}
      style={{
        width: "100vw",
        height: "100dvh",
        zIndex,
        pointerEvents: "auto",
      }}
    >
      {columns.map((index) => (
        <motion.div
          key={index}
          aria-hidden="true"
          className="absolute top-0 bottom-0"
          style={{
            left: `${(index * 100) / columnCount}%`,
            // +1.5px overlap kills sub-pixel seams so the strips read as
            // one continuous orange surface.
            width: `calc(${100 / columnCount}% + 1.5px)`,
            backgroundColor: color,
            willChange: exiting ? "transform" : undefined,
          }}
          initial={{ y: "0%" }}
          animate={{ y: exiting ? "-101%" : "0%" }}
          transition={{
            duration: exitSeconds,
            ease: EXIT_EASE,
            delay: reduced ? 0 : index * staggerSeconds,
          }}
        />
      ))}
    </div>
  );
}

export default StaircasePreloader;
