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

export type FillPreloaderPhase =
  | "idle"
  | "loading"
  | "complete"
  | "exiting"
  | "finished";

export type FillPreloaderTheme = "auto" | "light" | "dark";

export interface FillPreloaderProps {
  /** Fullscreen background color shown before the fill rises. */
  backgroundColor?: string;
  /** Solid color of the rising progress surface. */
  fillColor?: string;
  /** Color of the percentage counter. */
  textColor?: string;
  /**
   * Color scheme for the theme-aware defaults. `"auto"` follows the page
   * (`dark` class / `data-theme` / `prefers-color-scheme`, in that order)
   * and updates live when the page theme changes. Explicit
   * `backgroundColor` / `textColor` props always win. The fill stays the
   * same brand blue in both schemes.
   */
  theme?: FillPreloaderTheme;
  /** Time in milliseconds for the simulated 0 → 100 progression. */
  duration?: number;
  /** Time in milliseconds the completed 100% frame stays visible. */
  completionHold?: number;
  /** Time in milliseconds for the vertical exit reveal. */
  exitDuration?: number;
  /**
   * Manual progress override (0–100). When provided, the automatic
   * simulation is disabled and the fill follows this value instead.
   * Reaching 100 triggers the hold + exit sequence.
   */
  progress?: number;
  /** Show the percentage counter. */
  showCounter?: boolean;
  /** Counter font size. Defaults to a viewport-relative clamp. */
  fontSize?: string;
  /** Counter font weight. */
  fontWeight?: number;
  /** Counter font family. */
  fontFamily?: string;
  /** Counter distance from the right edge in pixels. */
  counterOffsetX?: number;
  /** Counter distance from the bottom edge in pixels. */
  counterOffsetY?: number;
  /** Stacking order of the overlay. */
  zIndex?: number;
  /** Additional classes applied to the overlay wrapper. */
  className?: string;
  /** Fires on every phase transition. */
  onPhaseChange?: (phase: FillPreloaderPhase) => void;
  /** Fires once the exit reveal finishes and the overlay unmounts. */
  onComplete?: () => void;
}

const EXIT_EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];

const THEME_DEFAULTS = {
  dark: { backgroundColor: "#111111", textColor: "#ffffff" },
  light: { backgroundColor: "#e8e6e3", textColor: "#09090b" },
} as const;

/** Read the page color scheme without requiring a theme provider. */
function resolveColorScheme(): "light" | "dark" {
  if (typeof document === "undefined") return "dark";
  const root = document.documentElement;
  if (root.classList.contains("dark")) return "dark";
  if (root.classList.contains("light")) return "light";
  const dataTheme = root.dataset.theme;
  if (dataTheme === "dark" || dataTheme === "light") return dataTheme;
  if (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: light)").matches
  ) {
    return "light";
  }
  return "dark";
}

/** Follow the page color scheme live when `theme` is `"auto"`. */
function useColorScheme(mode: FillPreloaderTheme): "light" | "dark" {
  const [scheme, setScheme] = React.useState<"light" | "dark">(() =>
    mode === "auto" ? resolveColorScheme() : mode,
  );
  React.useEffect(() => {
    if (mode !== "auto") {
      setScheme(mode);
      return;
    }
    setScheme(resolveColorScheme());
    const root = document.documentElement;
    const observer = new MutationObserver(() =>
      setScheme(resolveColorScheme()),
    );
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "style"],
    });
    const query = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => setScheme(resolveColorScheme());
    query.addEventListener("change", onChange);
    return () => {
      observer.disconnect();
      query.removeEventListener("change", onChange);
    };
  }, [mode]);
  return scheme;
}

/**
 * FillPreloader — a fullscreen loading transition.
 *
 * A theme-aware overlay is progressively covered, bottom-up, by a solid
 * electric-blue surface driven by loading progress. A large percentage
 * counter sits anchored at the bottom-right. At 100% the
 * whole overlay slides vertically upward, revealing the page beneath.
 *
 * Replay by remounting: `<FillPreloader key={replayCount} />`.
 */
export function FillPreloader({
  backgroundColor,
  fillColor = "#0b5ffb",
  textColor,
  theme = "auto",
  duration = 2800,
  completionHold = 300,
  exitDuration = 900,
  progress: controlledProgress,
  showCounter = true,
  fontSize = "clamp(64px, 9vw, 132px)",
  fontWeight = 600,
  fontFamily = "inherit",
  counterOffsetX = 32,
  counterOffsetY = 24,
  zIndex = 100,
  className,
  onPhaseChange,
  onComplete,
}: FillPreloaderProps) {
  const [phase, setPhase] = React.useState<FillPreloaderPhase>("idle");
  const [ariaValue, setAriaValue] = React.useState(0);
  const reduceMotion = useReducedMotion();
  const scheme = useColorScheme(theme);
  const resolvedBackground = backgroundColor ?? THEME_DEFAULTS[scheme].backgroundColor;
  const resolvedText = textColor ?? THEME_DEFAULTS[scheme].textColor;

  const progressValue = useMotionValue(0);
  const fillScale = useTransform(progressValue, [0, 100], [0, 1]);
  const counterRef = React.useRef<HTMLSpanElement>(null);
  const lastRenderedValue = React.useRef(-1);
  const phaseRef = React.useRef<FillPreloaderPhase>("idle");
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);
  const controls = React.useRef<ReturnType<typeof animate> | null>(null);
  const onPhaseChangeRef = React.useRef(onPhaseChange);
  const onCompleteRef = React.useRef(onComplete);

  onPhaseChangeRef.current = onPhaseChange;
  onCompleteRef.current = onComplete;

  const goToPhase = React.useCallback((next: FillPreloaderPhase) => {
    phaseRef.current = next;
    setPhase(next);
    onPhaseChangeRef.current?.(next);
  }, []);

  const clearTimers = React.useCallback(() => {
    timers.current.forEach((timer) => clearTimeout(timer));
    timers.current = [];
  }, []);

  const later = React.useCallback(
    (fn: () => void, ms: number) => {
      const timer = setTimeout(fn, ms);
      timers.current.push(timer);
    },
    [],
  );

  // Keep the visible counter and the accessible value in sync with the
  // same motion value that drives the blue fill — they can never drift.
  // The DOM node is updated imperatively so React never rerenders at 60fps.
  useMotionValueEvent(progressValue, "change", (value) => {
    const rounded = Math.min(100, Math.max(0, Math.round(value)));
    if (rounded !== lastRenderedValue.current) {
      lastRenderedValue.current = rounded;
      if (counterRef.current) {
        counterRef.current.textContent = `${rounded}%`;
      }
      setAriaValue(rounded);
    }
  });

  const beginExit = React.useCallback(() => {
    if (phaseRef.current === "exiting" || phaseRef.current === "finished") {
      return;
    }
    goToPhase("complete");
    later(() => {
      if (phaseRef.current !== "complete") return;
      goToPhase("exiting");
    }, Math.max(0, completionHold));
  }, [completionHold, goToPhase, later]);

  // Automatic staged simulation: slow start, fast middle, eased landing.
  React.useEffect(() => {
    if (controlledProgress !== undefined) return;
    goToPhase("loading");
    const total = reduceMotion ? Math.min(duration, 400) : Math.max(0, duration);
    controls.current = animate(
      progressValue,
      [0, 5, 80, 96, 99, 100],
      {
        duration: Math.max(0.01, total / 1000),
        times: [0, 0.12, 0.55, 0.8, 0.93, 1],
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

  // Manual mode: follow the provided progress with smoothing so the
  // surface interpolates instead of jumping between values.
  const hasReachedFull = React.useRef(false);
  React.useEffect(() => {
    if (controlledProgress === undefined) return;
    if (phaseRef.current === "idle") goToPhase("loading");
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
  const exitSeconds = Math.max(
    0.01,
    (reduceMotion ? Math.min(exitDuration, 250) : Math.max(0, exitDuration)) /
      1000,
  );

  return (
    <motion.div
      role="progressbar"
      aria-label="Page loading"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={ariaValue}
      data-slot="fill-preloader"
      data-phase={phase}
      className={cn("fixed inset-0 overflow-hidden", className)}
      style={{
        width: "100vw",
        height: "100dvh",
        backgroundColor: resolvedBackground,
        zIndex,
      }}
      initial={{ y: "0%" }}
      animate={{ y: exiting ? "-100%" : "0%" }}
      transition={{ duration: exitSeconds, ease: EXIT_EASE }}
      onAnimationComplete={() => {
        if (phaseRef.current !== "exiting") return;
        clearTimers();
        goToPhase("finished");
        onCompleteRef.current?.();
      }}
    >
      {/* Rising progress surface — GPU transform, flat sharp top edge. */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundColor: fillColor,
          scaleY: fillScale,
          transformOrigin: "bottom center",
        }}
      />
      {showCounter && (
        <span
          ref={counterRef}
          aria-hidden="true"
          className="absolute leading-none tracking-tight tabular-nums select-none"
          style={{
            right: `max(16px, calc(${counterOffsetX}px + env(safe-area-inset-right, 0px)))`,
            bottom: `max(12px, calc(${counterOffsetY}px + env(safe-area-inset-bottom, 0px)))`,
            color: resolvedText,
            fontSize,
            fontWeight,
            fontFamily,
          }}
        >
          0%
        </span>
      )}
    </motion.div>
  );
}

export default FillPreloader;
