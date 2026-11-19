"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@workspace/ui/lib/utils";

export type StaircasePreloaderPhase =
  | "idle"
  | "holding"
  | "exiting"
  | "finished";

export type StaircasePreloaderTheme = "auto" | "light" | "dark";

export interface StaircasePreloaderProps {
  /** Solid color of the fullscreen curtain. Defaults to vivid red-orange. */
  color?: string;
  /** Wordmark revealed as the curtain lifts. */
  text?: string;
  /** Wordmark color. Defaults to a theme-aware high-contrast value. */
  textColor?: string;
  /** Color scheme for the default wordmark color. */
  theme?: StaircasePreloaderTheme;
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

const THEME_DEFAULTS = {
  dark: { textColor: "#FFFFFF" },
  light: { textColor: "#111111" },
} as const;

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

function useColorScheme(mode: StaircasePreloaderTheme): "light" | "dark" {
  const [scheme, setScheme] = React.useState<"light" | "dark">("dark");
  React.useEffect(() => {
    if (mode !== "auto") {
      setScheme(mode);
      return;
    }
    setScheme(resolveColorScheme());
    const root = document.documentElement;
    const observer = new MutationObserver(() => setScheme(resolveColorScheme()));
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

let scrollLockCount = 0;
let restorePageScroll: (() => void) | null = null;

function lockPageScroll() {
  if (scrollLockCount === 0) {
    const root = document.documentElement;
    const body = document.body;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyTouchAction = body.style.touchAction;
    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.touchAction = "none";
    restorePageScroll = () => {
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBodyOverflow;
      body.style.touchAction = previousBodyTouchAction;
    };
  }
  scrollLockCount += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    scrollLockCount = Math.max(0, scrollLockCount - 1);
    if (scrollLockCount === 0) {
      restorePageScroll?.();
      restorePageScroll = null;
    }
  };
}

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
  text = "DAVINCIUI",
  textColor,
  theme = "auto",
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
  const scheme = useColorScheme(theme);
  const resolvedTextColor = textColor ?? THEME_DEFAULTS[scheme].textColor;
  const releaseScrollLock = React.useRef<(() => void) | null>(null);
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

  const locked = phase !== "finished";
  React.useEffect(() => {
    if (!locked) {
      releaseScrollLock.current?.();
      releaseScrollLock.current = null;
      return;
    }
    if (!releaseScrollLock.current) {
      releaseScrollLock.current = lockPageScroll();
    }
  }, [locked]);

  React.useEffect(
    () => () => {
      releaseScrollLock.current?.();
      releaseScrollLock.current = null;
    },
    [],
  );

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
        width: "100%",
        height: "100%",
        zIndex,
        pointerEvents: "auto",
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center px-6"
        style={{ zIndex: 0, color: resolvedTextColor }}
      >
        <span
          style={{
            fontFamily: "inherit",
            fontSize: "clamp(2.5rem, 8vw, 8rem)",
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "-0.05em",
            whiteSpace: "nowrap",
          }}
        >
          {text}
        </span>
      </div>
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
            zIndex: 1,
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
