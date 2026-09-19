"use client";

import * as React from "react";

export type GeometricPreloaderPhase =
  | "idle"
  | "loading"
  | "complete"
  | "exiting"
  | "finished";

export type GeometricPreloaderTheme = "auto" | "light" | "dark";

export interface GeometricPreloaderProps {
  /** Milliseconds for the simulated 0 → 100 progression. */
  duration?: number;
  /** Milliseconds the completed 100% frame stays visible. */
  holdDuration?: number;
  /** Milliseconds for the diamond reveal. */
  exitDuration?: number;
  /** Fullscreen overlay background. */
  backgroundColor?: string;
  /** Secondary square-line color. */
  foregroundColor?: string;
  /** Accent line + counter color. */
  accentColor?: string;
  /**
   * Color scheme for the theme-aware defaults. `"auto"` follows the page
   * (`dark` class / `data-theme` / `prefers-color-scheme`, in that order)
   * and updates live when the page theme changes. Explicit
   * `backgroundColor` / `foregroundColor` props always win. The accent
   * stays the same brand orange in both schemes.
   */
  theme?: GeometricPreloaderTheme;
  /** Show the center percentage. */
  showLabel?: boolean;
  /** Stacking order of the overlay. */
  zIndex?: number;
  /** Additional classes applied to the overlay. */
  className?: string;
  /** Fires on every phase transition. */
  onPhaseChange?: (phase: GeometricPreloaderPhase) => void;
  /** Fires once the reveal finishes and the overlay unmounts. */
  onComplete?: () => void;
}

const SQUARE_COUNT = 9;

const THEME_DEFAULTS = {
  dark: { backgroundColor: "#111111", foregroundColor: "#f5f1e8" },
  light: { backgroundColor: "#e8e6e3", foregroundColor: "#1b1b19" },
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
function useColorScheme(mode: GeometricPreloaderTheme): "light" | "dark" {
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

/** Staged simulation keys: quick open, steady middle, deliberate landing. */
const PROGRESS_KEYS = [0, 8, 55, 82, 94, 100];
const PROGRESS_TIMES = [0, 0.15, 0.5, 0.72, 0.88, 1];

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

function smoothstep(t: number): number {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
}

/** Piecewise-smooth interpolation through the staged progress keys. */
function stagedProgress(t: number): number {
  const c = clamp01(t);
  for (let i = 1; i < PROGRESS_TIMES.length; i += 1) {
    const t1 = PROGRESS_TIMES[i] ?? 1;
    if (c <= t1) {
      const t0 = PROGRESS_TIMES[i - 1] ?? 0;
      const v0 = PROGRESS_KEYS[i - 1] ?? 0;
      const v1 = PROGRESS_KEYS[i] ?? 100;
      const local = t1 <= t0 ? 1 : (c - t0) / (t1 - t0);
      return v0 + (v1 - v0) * smoothstep(local);
    }
  }
  return 100;
}

function easeInOutCubic(t: number): number {
  const c = clamp01(t);
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
}

/**
 * Diamond clip-path for the exit reveal, driven by a single eased value.
 *
 * Stage A (corners cut): the rect's corners slide along the edges toward
 * the edge midpoints — the page appears first in the four corners.
 * Stage B (diamond collapses): the four vertices converge on the center.
 * The overlay is never faded; the page underneath is genuinely uncovered.
 */
function diamondClipPath(t: number): string {
  const SPLIT = 0.45;
  const f = (n: number) => n.toFixed(3);
  if (t <= SPLIT) {
    const c = (easeInOutCubic(t / SPLIT) * 50).toFixed(3);
    const mc = (100 - Number(c)).toFixed(3);
    return (
      `polygon(${c}% 0%, ${mc}% 0%, 100% ${c}%, 100% ${mc}%, ` +
      `${mc}% 100%, ${c}% 100%, 0% ${mc}%, 0% ${c}%)`
    );
  }
  const v = easeInOutCubic((t - SPLIT) / (1 - SPLIT));
  const top = f(v * 50);
  const right = f(100 - v * 50);
  const bottom = f(100 - v * 50);
  const left = f(v * 50);
  return `polygon(50% ${top}%, ${right}% 50%, 50% ${bottom}%, ${left}% 50%)`;
}

/**
 * GeometricPreloader — a fullscreen geometric loading takeover.
 *
 * Nine nested squares counter-rotate (alternating direction, staggered
 * speed) while a staged 0 → 100 progression ticks in the center. Each
 * square ignites in the accent color as progress passes it, so the
 * geometry itself reads as the meter. At 100 the frame holds, then the
 * overlay exits as a true diamond clip-path reveal — corners cut first,
 * diamond collapses to center — exposing the page beneath.
 *
 * One RAF master clock drives progress, ignition, and exit. React never
 * renders at 60fps; the loop mutates refs directly.
 *
 * Replay by remounting: `<GeometricPreloader key={replayCount} />`.
 */
export function GeometricPreloader({
  duration = 2200,
  holdDuration = 180,
  exitDuration = 720,
  backgroundColor,
  foregroundColor,
  accentColor = "#ff4d23",
  theme = "auto",
  showLabel = true,
  zIndex = 9999,
  className,
  onPhaseChange,
  onComplete,
}: GeometricPreloaderProps) {
  const [phase, setPhase] = React.useState<GeometricPreloaderPhase>("idle");
  const [ariaValue, setAriaValue] = React.useState(0);
  const scheme = useColorScheme(theme);
  const resolvedBackground =
    backgroundColor ?? THEME_DEFAULTS[scheme].backgroundColor;
  const resolvedForeground =
    foregroundColor ?? THEME_DEFAULTS[scheme].foregroundColor;

  const overlayRef = React.useRef<HTMLDivElement>(null);
  const counterRef = React.useRef<HTMLSpanElement>(null);
  const squareRefs = React.useRef<Array<HTMLSpanElement | null>>([]);
  const phaseRef = React.useRef<GeometricPreloaderPhase>("idle");
  const doneRef = React.useRef(false);
  const rafRef = React.useRef(0);
  const lastRenderedValue = React.useRef(-1);
  const lastMilestone = React.useRef(-1);

  const onPhaseChangeRef = React.useRef(onPhaseChange);
  const onCompleteRef = React.useRef(onComplete);
  onPhaseChangeRef.current = onPhaseChange;
  onCompleteRef.current = onComplete;
  // Live colors for the RAF loop (follows theme changes mid-run).
  const colorsRef = React.useRef({
    background: resolvedBackground,
    foreground: resolvedForeground,
    accent: accentColor,
  });
  colorsRef.current = {
    background: resolvedBackground,
    foreground: resolvedForeground,
    accent: accentColor,
  };

  const goToPhase = React.useCallback((next: GeometricPreloaderPhase) => {
    if (phaseRef.current === next) return;
    phaseRef.current = next;
    setPhase(next);
    onPhaseChangeRef.current?.(next);
  }, []);

  // Lock page scroll while the overlay is alive; restore on exit/unmount.
  React.useEffect(() => {
    if (phase === "finished") return;
    const root = document.documentElement;
    const body = document.body;
    const prevRoot = root.style.overflow;
    const prevBody = body.style.overflow;
    const prevTouch = body.style.touchAction;
    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.touchAction = "none";
    return () => {
      root.style.overflow = prevRoot;
      body.style.overflow = prevBody;
      body.style.touchAction = prevTouch;
    };
  }, [phase]);

  const finish = React.useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    cancelAnimationFrame(rafRef.current);
    const overlay = overlayRef.current;
    if (overlay) {
      overlay.style.pointerEvents = "none";
      overlay.style.visibility = "hidden";
    }
    goToPhase("finished");
    onCompleteRef.current?.();
  }, [goToPhase]);

  // ONE RAF master timeline: loading → hold → diamond exit.
  React.useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const loadMs = rm ? Math.min(duration, 400) : Math.max(0, duration);
    const holdMs = rm ? 120 : Math.max(0, holdDuration);
    const exitMs = rm ? 260 : Math.max(0, exitDuration);
    const exitStart = loadMs + holdMs;
    const total = exitStart + exitMs + 60;
    const start = performance.now();

    const renderValue = (value: number) => {
      if (value === lastRenderedValue.current) return;
      lastRenderedValue.current = value;
      const { foreground, accent } = colorsRef.current;
      if (counterRef.current) {
        counterRef.current.textContent = `${value}%`;
      }
      // Ignite each square in the accent color as progress passes it.
      for (let i = 0; i < SQUARE_COUNT; i += 1) {
        const el = squareRefs.current[i];
        if (!el) continue;
        const lit = value >= ((i + 1) / SQUARE_COUNT) * 100;
        el.style.borderColor = lit ? accent : `${foreground}55`;
        el.style.opacity = lit ? "1" : "0.75";
      }
      const milestone =
        value >= 100 ? 100 : value >= 75 ? 75 : value >= 50 ? 50 : value >= 25 ? 25 : 0;
      if (milestone !== lastMilestone.current) {
        lastMilestone.current = milestone;
        setAriaValue(milestone);
      }
    };

    const frame = (now: number) => {
      const elapsed = now - start;

      if (elapsed < loadMs) {
        goToPhase("loading");
        renderValue(Math.round(stagedProgress(elapsed / Math.max(1, loadMs))));
      } else if (elapsed < exitStart) {
        goToPhase("complete");
        renderValue(100);
      } else {
        goToPhase("exiting");
        renderValue(100);
        const t = clamp01((elapsed - exitStart) / Math.max(1, exitMs));
        if (rm) {
          overlay.style.opacity = `${1 - t}`;
        } else {
          overlay.style.clipPath = diamondClipPath(t);
        }
        overlay.style.pointerEvents = "none";
      }

      if (elapsed >= total) {
        finish();
        return;
      }
      rafRef.current = requestAnimationFrame(frame);
    };

    // Seed the first painted frame (0%, dim squares) before the loop starts.
    renderValue(0);
    rafRef.current = requestAnimationFrame(frame);

    // Safety net: never trap the page if frames stop arriving.
    const guard = window.setTimeout(finish, total + 3000);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.clearTimeout(guard);
    };
    // One-shot timeline per mount (replay = remount via key).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === "finished") return null;

  return (
    <div
      ref={overlayRef}
      role="progressbar"
      aria-label="Page loading"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={ariaValue}
      data-slot="geometric-preloader"
      data-phase={phase}
      className={`fixed inset-0 flex items-center justify-center overflow-hidden ${className ?? ""}`}
      style={{
        width: "100vw",
        height: "100dvh",
        backgroundColor: resolvedBackground,
        color: resolvedForeground,
        zIndex,
        willChange: "clip-path",
      }}
    >
      <div className="relative flex size-[min(52vw,19rem)] items-center justify-center">
        {Array.from({ length: SQUARE_COUNT }, (_, index) => {
          const size = 100 - index * 9;
          const reverse = index % 2 === 1;
          return (
            <span
              key={index}
              ref={(el) => {
                squareRefs.current[index] = el;
              }}
              aria-hidden="true"
              className="absolute border"
              style={{
                width: `${size}%`,
                height: `${size}%`,
                borderColor: `${resolvedForeground}55`,
                borderWidth: index === 0 ? 1.5 : 1,
                opacity: 0.75,
                animation: `geometric-preloader-spin-${reverse ? "ccw" : "cw"} ${2.6 + index * 0.35}s linear infinite`,
                animationDelay: `${index * -0.3}s`,
                willChange: "transform",
              }}
            />
          );
        })}
        {showLabel && (
          <span
            ref={counterRef}
            aria-hidden="true"
            className="relative z-10 text-[clamp(1rem,2vw,1.35rem)] font-medium tabular-nums tracking-[0.18em]"
            style={{ color: accentColor }}
          >
            0%
          </span>
        )}
      </div>
      <style>{`@keyframes geometric-preloader-spin-cw { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes geometric-preloader-spin-ccw { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } } @media (prefers-reduced-motion: reduce) { [data-slot="geometric-preloader"] span { animation: none !important; } }`}</style>
    </div>
  );
}

export default GeometricPreloader;
