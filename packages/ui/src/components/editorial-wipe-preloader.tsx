"use client";

import * as React from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { cn } from "@workspace/ui/lib/utils";

export type EditorialWipePreloaderPhase =
  | "idle"
  | "loading"
  | "complete"
  | "exiting"
  | "finished";

export type EditorialWipePreloaderMode = "viewport" | "container";

export interface EditorialWipePreloaderProps {
  /** Time in milliseconds for the simulated 0 → 100 progression. */
  duration?: number;
  /** Time in milliseconds the completed 100 frame stays visible. */
  completionHold?: number;
  /** Time in milliseconds for the vertical exit reveal. */
  exitDuration?: number;
  /** Base loader field — deep forest green. */
  darkColor?: string;
  /** Dominant reveal surface — warm off-white / cream. */
  lightColor?: string;
  /** Leading edge strip attached to the reveal boundary — muted beige. */
  accentColor?: string;
  /** Giant counter color over the dark field. */
  counterDarkColor?: string;
  /** Giant counter color over the cream surface. */
  counterLightColor?: string;
  /** Show the tiny uppercase label above the counter. */
  showLoadingLabel?: boolean;
  /** Label copy rendered above the counter. */
  loadingLabel?: string;
  /** Counter value at progress 0. */
  startValue?: number;
  /** Counter value at progress 100. */
  endValue?: number;
  /**
   * Counter font size, relative to the loader's own width. Defaults to an
   * oversized container-relative clamp so viewport and container modes
   * share identical proportions.
   */
  counterFontSize?: string;
  /** Counter font weight — keep light, never bold. */
  counterFontWeight?: number;
  /** Counter font family. */
  counterFontFamily?: string;
  /**
   * `"viewport"` covers the screen (`position: fixed`). `"container"`
   * fills a `position: relative; overflow: hidden;` parent
   * (`position: absolute`). Both modes run identical animation logic.
   */
  mode?: EditorialWipePreloaderMode;
  /**
   * Manual progress override (0–100). When provided, the automatic
   * simulation is disabled and the wipe follows this value with smoothing
   * instead. Reaching 100 triggers the hold + exit sequence.
   */
  progress?: number;
  /**
   * Development-only freeze frame (0–1). When provided, autoplay is
   * disabled and the loader renders the exact visual state for that
   * normalized progress. Never ships a visible debug UI.
   */
  debugProgress?: number;
  /** Start the simulation automatically on mount. */
  autoPlay?: boolean;
  /**
   * Lock document scrolling while the overlay is alive. Only applies in
   * `"viewport"` mode — container previews never touch page scroll.
   */
  disableScroll?: boolean;
  /** Shorten the sequence when the user prefers reduced motion. */
  respectReducedMotion?: boolean;
  /** Stacking order of the overlay. */
  zIndex?: number;
  /** Additional classes applied to the overlay wrapper. */
  className?: string;
  /** Fires once when the loading sequence starts. */
  onStart?: () => void;
  /** Fires when the displayed integer value changes. */
  onProgress?: (value: number) => void;
  /** Fires on every phase transition. */
  onPhaseChange?: (phase: EditorialWipePreloaderPhase) => void;
  /** Fires once the exit reveal finishes and the overlay unmounts. */
  onComplete?: () => void;
}

const EXIT_EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];

/**
 * EditorialWipePreloader — one continuous editorial loading wipe.
 *
 * A single master progress value (0 → 100) drives everything: the giant
 * tabular counter, one horizontal reveal train (cream surface with a beige
 * leading edge attached to the same boundary), the counter's split-tone
 * mask, and the tiny label. The reveal is one GPU transform sweeping
 * left → right — cream grows from the left, the beige strip rides its
 * leading edge, the deep forest field shrinks to the right, and the wipe
 * lands on full cream. The counter renders twice (grey ink + muted taupe)
 * with the taupe
 * render clipped to the cream region, so the moving boundary can pass
 * through the middle of a glyph. At 100 the cream frame holds briefly,
 * then the entire surface lifts vertically as one piece, revealing the
 * page already mounted beneath it.
 *
 * All sizing is container-relative (`cqw`), so `"viewport"` and
 * `"container"` modes share identical proportions and logic.
 *
 * Replay by remounting: `<EditorialWipePreloader key={replayCount} />`.
 */
export function EditorialWipePreloader({
  duration = 3800,
  completionHold = 450,
  exitDuration = 900,
  darkColor = "#1A241E",
  lightColor = "#E4E0D7",
  accentColor = "#C7B39E",
  counterDarkColor = "#8A8A8A",
  counterLightColor = "#AAA0A1",
  showLoadingLabel = true,
  loadingLabel = "LOADING",
  startValue = 0,
  endValue = 100,
  counterFontSize = "clamp(2.5rem, 24cqw, 26.25rem)",
  counterFontWeight = 300,
  counterFontFamily = "inherit",
  mode = "viewport",
  progress: controlledProgress,
  debugProgress,
  autoPlay = true,
  disableScroll = true,
  respectReducedMotion = true,
  zIndex = 9999,
  className,
  onStart,
  onProgress,
  onPhaseChange,
  onComplete,
}: EditorialWipePreloaderProps) {
  const [phase, setPhase] = React.useState<EditorialWipePreloaderPhase>(
    debugProgress !== undefined ? "loading" : "idle",
  );
  const [ariaValue, setAriaValue] = React.useState(startValue);
  const systemReduceMotion = useReducedMotion();
  const reduceMotion = respectReducedMotion && Boolean(systemReduceMotion);
  const isViewport = mode === "viewport";

  // THE master timeline: loading progress, 0 → 100. The counter value, the
  // reveal position, the counter mask and the label all derive from this
  // one value — they can never drift apart.
  const progressValue = useMotionValue(
    debugProgress !== undefined
      ? Math.min(1, Math.max(0, debugProgress)) * 100
      : 0,
  );

  // ONE reveal train: a full-width cream surface with a beige strip
  // attached to its leading (right) edge. A single horizontal transform
  // moves both together, so the viewer perceives one continuous sweep:
  // cream grows from the left, green shrinks to the right, beige rides
  // the boundary between them. Sharp opaque edges — no fades, no springs.
  // At p the cream covers 0..p and the beige strip covers p..p+22.
  const revealX = useTransform(
    progressValue,
    [0, 100],
    ["-101cqw", "0cqw"],
  );

  // The taupe counter render is clipped to the cream region, so the cream
  // boundary can pass through the middle of a glyph (dark | taupe split).
  const lightMask = useTransform(
    progressValue,
    (p) => `inset(0px ${Math.max(0, 100 - p)}cqw 0px 0px)`,
  );

  // The tiny label earns its place as the loader turns light.
  const labelOpacity = useTransform(progressValue, [38, 68], [0, 1]);

  const darkNumberRef = React.useRef<HTMLSpanElement>(null);
  const lightNumberRef = React.useRef<HTMLSpanElement>(null);
  const lastRenderedValue = React.useRef<number | null>(null);
  const lastMilestone = React.useRef<number | null>(null);
  const phaseRef = React.useRef<EditorialWipePreloaderPhase>(
    debugProgress !== undefined ? "loading" : "idle",
  );
  const completedRef = React.useRef(false);
  const startedRef = React.useRef(false);
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);
  const controls = React.useRef<ReturnType<typeof animate> | null>(null);
  const onStartRef = React.useRef(onStart);
  const onProgressRef = React.useRef(onProgress);
  const onPhaseChangeRef = React.useRef(onPhaseChange);
  const onCompleteRef = React.useRef(onComplete);
  const rangeRef = React.useRef({ startValue, endValue });
  rangeRef.current = { startValue, endValue };
  onStartRef.current = onStart;
  onProgressRef.current = onProgress;
  onPhaseChangeRef.current = onPhaseChange;
  onCompleteRef.current = onComplete;

  const goToPhase = React.useCallback(
    (next: EditorialWipePreloaderPhase) => {
      phaseRef.current = next;
      setPhase(next);
      onPhaseChangeRef.current?.(next);
    },
    [],
  );

  const clearTimers = React.useCallback(() => {
    timers.current.forEach((timer) => clearTimeout(timer));
    timers.current = [];
  }, []);

  const later = React.useCallback((fn: () => void, ms: number) => {
    const timer = setTimeout(fn, ms);
    timers.current.push(timer);
  }, []);

  const fireStart = React.useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    onStartRef.current?.();
  }, []);

  const displayValueFor = React.useCallback((p: number) => {
    const { startValue: from, endValue: to } = rangeRef.current;
    const clamped = Math.min(100, Math.max(0, p));
    return Math.round(from + (to - from) * (clamped / 100));
  }, []);

  // Both counter renders and the accessible milestone follow the same
  // motion value that positions the reveal — counter and wipe stay
  // synchronized by construction. DOM nodes update imperatively so React
  // never rerenders at 60fps.
  useMotionValueEvent(progressValue, "change", (p) => {
    const value = displayValueFor(p);
    if (value !== lastRenderedValue.current) {
      lastRenderedValue.current = value;
      if (darkNumberRef.current) {
        darkNumberRef.current.textContent = `${value}`;
      }
      if (lightNumberRef.current) {
        lightNumberRef.current.textContent = `${value}`;
      }
      onProgressRef.current?.(value);
      const milestone =
        value >= 100
          ? 100
          : value >= 75
            ? 75
            : value >= 50
              ? 50
              : value >= 25
                ? 25
                : 0;
      if (milestone !== lastMilestone.current) {
        lastMilestone.current = milestone;
        setAriaValue(milestone);
      }
    }
  });

  const beginExit = React.useCallback(() => {
    if (
      phaseRef.current === "complete" ||
      phaseRef.current === "exiting" ||
      phaseRef.current === "finished" ||
      completedRef.current
    ) {
      return;
    }
    goToPhase("complete");
    later(() => {
      if (phaseRef.current !== "complete") return;
      goToPhase("exiting");
    }, Math.max(0, completionHold));
  }, [completionHold, goToPhase, later]);

  // Deterministic staged simulation — continuous, never pausing: quick
  // open, steady middle, deliberate crawl into 100. The reveal inherits
  // this pacing for free because it derives from the same progress value.
  React.useEffect(() => {
    if (controlledProgress !== undefined) return;
    if (debugProgress !== undefined) return;
    if (!autoPlay) return;
    goToPhase("loading");
    fireStart();
    const total = reduceMotion
      ? Math.min(duration, 450)
      : Math.max(0, duration);
    controls.current = animate(
      progressValue,
      [0, 20, 55, 80, 95, 100],
      {
        duration: Math.max(0.01, total / 1000),
        times: [0, 0.16, 0.45, 0.68, 0.86, 1],
        ease: "easeInOut",
        onComplete: () => beginExit(),
      },
    );
    return () => {
      controls.current?.stop();
      clearTimers();
    };
    // Runs once per mount (replay = remount via key).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debug freeze-frame: render the exact state for a normalized progress.
  React.useEffect(() => {
    if (debugProgress === undefined) return;
    controls.current?.stop();
    clearTimers();
    progressValue.set(Math.min(1, Math.max(0, debugProgress)) * 100);
    goToPhase("loading");
    return () => {
      controls.current?.stop();
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debugProgress]);

  // Manual mode: follow the provided progress with smoothing so the wipe
  // interpolates instead of jumping between values.
  const hasReachedFull = React.useRef(false);
  React.useEffect(() => {
    if (controlledProgress === undefined) return;
    if (debugProgress !== undefined) return;
    if (phaseRef.current === "idle") goToPhase("loading");
    fireStart();
    const target = Math.min(100, Math.max(0, controlledProgress));
    controls.current?.stop();
    controls.current = animate(progressValue, target, {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
      onComplete: () => {
        if (target >= 100 && !hasReachedFull.current) {
          hasReachedFull.current = true;
          beginExit();
        }
      },
    });
    return () => {
      controls.current?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlledProgress]);

  // Safety net: never trap the page if an exit animation callback is lost.
  React.useEffect(() => {
    if (phase !== "exiting") return;
    const ms =
      (reduceMotion ? Math.min(exitDuration, 250) : Math.max(0, exitDuration)) +
      500;
    const timer = setTimeout(() => {
      if (phaseRef.current !== "exiting" || completedRef.current) return;
      completedRef.current = true;
      clearTimers();
      goToPhase("finished");
      onCompleteRef.current?.();
    }, ms);
    timers.current.push(timer);
    return () => clearTimeout(timer);
  }, [phase, exitDuration, reduceMotion, clearTimers, goToPhase]);

  // Viewport mode locks page scroll while the overlay is alive and restores
  // it on exit/unmount. Container mode never touches page scroll.
  React.useEffect(() => {
    if (phase === "finished") return;
    if (!disableScroll) return;
    if (!isViewport) return;
    if (debugProgress !== undefined) return;
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
  }, [phase, disableScroll, isViewport, debugProgress]);

  if (phase === "finished") return null;

  const exiting = phase === "exiting";
  const exitSeconds = Math.max(
    0.01,
    (reduceMotion ? Math.min(exitDuration, 250) : Math.max(0, exitDuration)) /
      1000,
  );

  // One typography composition: tiny label directly above the giant
  // number, left-aligned, bottom-left anchored. The anchor never moves —
  // only the value changes.
  const clusterClassName =
    "absolute leading-[0.72] tracking-[-0.05em] tabular-nums whitespace-nowrap select-none";
  const clusterStyle: React.CSSProperties = {
    left: "max(16px, 5cqw)",
    // Oversized glyphs overshoot their 0.72 line box downward, so the
    // anchor sits higher than the visible ink gap it produces.
    bottom: "max(40px, 11%)",
  };
  const numberStyle: React.CSSProperties = {
    display: "block",
    fontSize: counterFontSize,
    fontWeight: counterFontWeight,
    fontFamily: counterFontFamily,
    lineHeight: 0.72,
  };

  const makeLabel = (color: string) =>
    showLoadingLabel ? (
      <motion.span
        aria-hidden="true"
        className="mb-2 block text-[11px] font-normal uppercase"
        style={{
          opacity: labelOpacity,
          letterSpacing: "0.02em",
          color,
        }}
      >
        {loadingLabel}
      </motion.span>
    ) : null;
  const darkLabel = makeLabel(counterDarkColor);
  const lightLabel = makeLabel(counterLightColor);

  const initialValue = displayValueFor(
    debugProgress !== undefined
      ? Math.min(1, Math.max(0, debugProgress)) * 100
      : 0,
  );

  return (
    <motion.div
      role="status"
      aria-label={loadingLabel ? `Page loading, ${loadingLabel}` : "Page loading"}
      data-slot="editorial-wipe-preloader"
      data-phase={phase}
      data-mode={mode}
      className={cn(
        isViewport ? "fixed inset-0" : "absolute inset-0",
        "overflow-hidden",
        className,
      )}
      style={{
        ...(isViewport
          ? { width: "100vw", height: "100dvh" }
          : { width: "100%", height: "100%" }),
        backgroundColor: darkColor,
        color: counterDarkColor,
        zIndex: isViewport ? zIndex : undefined,
        containerType: "inline-size",
      }}
      initial={{ y: "0%" }}
      animate={{ y: exiting ? "-100%" : "0%" }}
      transition={{ duration: exitSeconds, ease: EXIT_EASE }}
      onAnimationComplete={() => {
        if (phaseRef.current !== "exiting" || completedRef.current) return;
        completedRef.current = true;
        clearTimers();
        goToPhase("finished");
        onCompleteRef.current?.();
      }}
    >
      {/* Screen-reader progress, announced at milestones only. */}
      <span className="sr-only" aria-live="polite">
        {ariaValue}% loaded
      </span>

      {/* The reveal train — ONE transform moves cream + beige leading edge
          together as a single continuous sweep. */}
      <motion.div
        aria-hidden="true"
        className="absolute top-0 bottom-0 left-0"
        style={{
          width: "122cqw",
          x: revealX,
          willChange: "transform",
        }}
      >
        <div
          aria-hidden="true"
          className="absolute top-0 bottom-0 left-0"
          style={{ width: "100cqw", backgroundColor: lightColor }}
        />
        <div
          aria-hidden="true"
          className="absolute top-0 bottom-0"
          style={{
            left: "100cqw",
            width: "22cqw",
            backgroundColor: accentColor,
          }}
        />
      </motion.div>

      {/* Counter — dark ink render, full bleed. */}
      <div aria-hidden="true" className={clusterClassName} style={clusterStyle}>
        {darkLabel}
        <span ref={darkNumberRef} style={{ ...numberStyle, color: counterDarkColor }}>
          {initialValue}
        </span>
      </div>

      {/* Counter — taupe render, clipped to the cream region. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ clipPath: lightMask }}
      >
        <div className={clusterClassName} style={clusterStyle}>
          {lightLabel}
          <span
            ref={lightNumberRef}
            style={{ ...numberStyle, color: counterLightColor }}
          >
            {initialValue}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default EditorialWipePreloader;
