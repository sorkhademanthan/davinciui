"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

export type PixelPreloaderPhase =
  | "idle"
  | "loading"
  | "complete"
  | "exiting"
  | "finished";

export type PixelPreloaderTheme = "auto" | "light" | "dark";

export interface PixelPreloaderProps {
  /**
   * Manual progress override (0–100). When provided, the automatic
   * simulation is disabled and the frontier follows this value with
   * smoothing instead. Reaching 100 triggers the hold + exit sequence.
   */
  progress?: number;
  /** Time in milliseconds for the simulated 0 → 100 progression. */
  duration?: number;
  /** Seed for deterministic noise — same seed replays the same pattern. */
  seed?: number;
  /** Target cell size in CSS pixels (responsive density is derived). */
  cellSize?: number;
  /** Unloaded-region color. Defaults adapt to the page color scheme. */
  backgroundColor?: string;
  /** Loaded-region color. Defaults adapt to the page color scheme. */
  foregroundColor?: string;
  /** Transition-frontier color. Defaults to red-orange in both schemes. */
  accentColor?: string;
  /**
   * Color scheme for the theme-aware defaults. `"auto"` follows the page
   * (`dark` class / `data-theme` / `prefers-color-scheme`, in that order)
   * and updates live when the page theme changes. Explicit
   * `backgroundColor` / `foregroundColor` props always win. The orange
   * accent stays constant in both schemes.
   */
  theme?: PixelPreloaderTheme;
  /** Show the top-left percentage HUD. */
  showPercentage?: boolean;
  /** Time in milliseconds the completed 100% frame stays visible. */
  completionHold?: number;
  /** Time in milliseconds for the fade-out reveal. */
  exitDuration?: number;
  /** Stacking order of the overlay. */
  zIndex?: number;
  /** Additional classes applied to the overlay wrapper. */
  className?: string;
  /** Fires on every phase transition. */
  onPhaseChange?: (phase: PixelPreloaderPhase) => void;
  /** Fires once the reveal finishes and the overlay unmounts. */
  onComplete?: () => void;
}

/**
 * Reference-calibrated tuning constants. Keep them together so the effect
 * can be calibrated against the recording without hunting magic numbers.
 */
const DEFAULT_CONFIG = {
  /** Keyframed staging of the simulated 0→1 progression. */
  progressKeys: [0, 0.04, 0.35, 0.75, 0.93, 1],
  progressTimes: [0, 0.1, 0.35, 0.72, 0.9, 1],
  /** How fast the frontier chases controlled progress updates. */
  progressSmoothing: 0.12,
  /** How fast column heights chase their targets (inertia). */
  columnSmoothing: 0.12,
  /** How fast spikes chase their targets. */
  spikeSmoothing: 0.18,
  /** Per-frame decay of spike targets back toward zero. */
  spikeDecay: 0.975,
  /** Independent retarget cadence per column, in milliseconds. */
  retargetMinMs: 80,
  retargetMaxMs: 250,
  /** Static per-column frontier offset amplitude, in cells. */
  jitterCells: 1,
  /** Solid white begins this far below the column base, in cells. */
  solidToleranceCells: 2,
  /** Neighbor correlation weight (rest is the column's own height). */
  neighborMix: 0.3,
  /** Progress fraction over which columns emerge from zero height. */
  emergenceSpan: 0.1,
  /** Base probability a retarget fires a new spike (scaled by progress). */
  spikeChance: 0.07,
  /** Shortest spike, in cells. */
  minSpikeHeight: 5,
  /** Tallest spike, in cells. */
  maxSpikeHeight: 30,
  /** Fraction of band cells re-rolled for flicker (rest stay stable). */
  flickerRate: 0.1,
  /** Flicker re-roll cadence — hash epoch advances every N frames. */
  flickerEpoch: 10,
} as const;

/**
 * Theme-aware default palettes. The effect keeps its identity in both
 * schemes: dark unloads near-black into warm white, light unloads warm
 * gray into warm white. The orange frontier is identical either way.
 */
const THEME_DEFAULTS = {
  dark: {
    background: "#0d0d0d",
    foreground: "#f3efe7",
    hud: "#f3efe7",
    gridUnloaded: "rgba(255,255,255,0.035)",
    gridLoaded: "rgba(0,0,0,0.05)",
  },
  light: {
    background: "#d9d6d0",
    foreground: "#faf8f3",
    hud: "#18181b",
    gridUnloaded: "rgba(0,0,0,0.06)",
    gridLoaded: "rgba(0,0,0,0.035)",
  },
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
function useColorScheme(mode: PixelPreloaderTheme): "light" | "dark" {
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

/** Deterministic PRNG so a seed replays the exact same pattern. */
function mulberry32(seed: number) {
  let state = seed >>> 0;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Cheap deterministic 2D hash → [0, 1). Stable across frames. */
function hash2(x: number, y: number, seed: number) {
  let h = (x * 374761393 + y * 668265263 + seed * 974634211) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

interface ColumnSim {
  count: number;
  /** Persistent body height per column, in cells. */
  height: Float32Array;
  targetHeight: Float32Array;
  /** Persistent spike extension above the body, in cells. */
  spike: Float32Array;
  spikeTarget: Float32Array;
  /** Elapsed-ms timestamp of the next independent retarget. */
  nextChange: Float32Array;
  /** Static per-column frontier offset, in cells. */
  jitter: Float32Array;
}

/**
 * Weighted body-height distribution: most columns stay near the frontier,
 * few grow medium, rare ones grow tall. u1 selects the band, u2 the offset.
 */
function pickBodyHeight(u1: number, u2: number) {
  if (u1 < 0.6) return u2 * 2;
  if (u1 < 0.85) return 2 + u2 * 4;
  if (u1 < 0.95) return 6 + u2 * 6;
  if (u1 < 0.99) return 12 + u2 * 10;
  return 22 + u2 * 12;
}

function createColumnSim(count: number, rand: () => number): ColumnSim {
  const height = new Float32Array(count);
  const targetHeight = new Float32Array(count);
  const spike = new Float32Array(count);
  const spikeTarget = new Float32Array(count);
  const nextChange = new Float32Array(count);
  const jitter = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const h = pickBodyHeight(rand(), rand());
    height[i] = h;
    targetHeight[i] = h;
    nextChange[i] = rand() * 250;
    jitter[i] = (rand() * 2 - 1) * DEFAULT_CONFIG.jitterCells;
  }
  return {
    count,
    height,
    targetHeight,
    spike,
    spikeTarget,
    nextChange,
    jitter,
  };
}

/** Resample column state when the grid width changes (resize-safe). */
function resampleColumnSim(prev: ColumnSim, count: number): ColumnSim {
  const height = new Float32Array(count);
  const targetHeight = new Float32Array(count);
  const spike = new Float32Array(count);
  const spikeTarget = new Float32Array(count);
  const nextChange = new Float32Array(count);
  const jitter = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const src = Math.min(
      prev.count - 1,
      Math.floor((i * prev.count) / count),
    );
    height[i] = prev.height[src] ?? 0;
    targetHeight[i] = prev.targetHeight[src] ?? 0;
    spike[i] = prev.spike[src] ?? 0;
    spikeTarget[i] = prev.spikeTarget[src] ?? 0;
    nextChange[i] = prev.nextChange[src] ?? 0;
    jitter[i] = prev.jitter[src] ?? 0;
  }
  return {
    count,
    height,
    targetHeight,
    spike,
    spikeTarget,
    nextChange,
    jitter,
  };
}

function parseRgb(color: string): [number, number, number] {
  const m = color
    .replace("#", "")
    .match(/^([0-9a-f]{6}|[0-9a-f]{3})$/i);
  if (!m) return [255, 77, 35];
  let hex = m[1] ?? "";
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const n = parseInt(hex, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * PixelPreloader — a fullscreen pixel-cell loading takeover.
 *
 * The viewport is subdivided into a fine canvas-rendered cell grid. Loading
 * progress drives a noisy bottom-to-top frontier: narrow vertical columns
 * with independent heights, an orange corrupted transition band, occasional
 * tall spikes, and a warm-white filled field below. A small percentage HUD
 * with a histogram icon sits at the top-left. At 100% the overlay fades,
 * revealing the page already mounted beneath it.
 *
 * Replay by remounting: `<PixelPreloader key={replayCount} />`.
 */
export function PixelPreloader({
  progress: controlledProgress,
  duration = 4500,
  seed = 1337,
  cellSize = 6,
  backgroundColor,
  foregroundColor,
  accentColor = "#ff4d23",
  theme = "auto",
  showPercentage = true,
  completionHold = 450,
  exitDuration = 700,
  zIndex = 9999,
  className,
  onPhaseChange,
  onComplete,
}: PixelPreloaderProps) {
  const [phase, setPhase] = React.useState<PixelPreloaderPhase>("idle");
  const [ariaValue, setAriaValue] = React.useState(0);
  const scheme = useColorScheme(theme);
  const paletteDefaults = THEME_DEFAULTS[scheme];
  const resolvedBackground = backgroundColor ?? paletteDefaults.background;
  const resolvedForeground = foregroundColor ?? paletteDefaults.foreground;
  const paletteRef = React.useRef({
    background: resolvedBackground,
    foreground: resolvedForeground,
    hud: paletteDefaults.hud,
    gridUnloaded: paletteDefaults.gridUnloaded,
    gridLoaded: paletteDefaults.gridLoaded,
    accent: parseRgb(accentColor),
  });
  paletteRef.current = {
    background: resolvedBackground,
    foreground: resolvedForeground,
    hud: paletteDefaults.hud,
    gridUnloaded: paletteDefaults.gridUnloaded,
    gridLoaded: paletteDefaults.gridLoaded,
    accent: parseRgb(accentColor),
  };
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const counterRef = React.useRef<HTMLSpanElement>(null);
  const phaseRef = React.useRef<PixelPreloaderPhase>("idle");
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);
  const onPhaseChangeRef = React.useRef(onPhaseChange);
  const onCompleteRef = React.useRef(onComplete);
  const controlledRef = React.useRef(controlledProgress);
  const completedRef = React.useRef(false);
  const reduceMotionRef = React.useRef(false);

  onPhaseChangeRef.current = onPhaseChange;
  onCompleteRef.current = onComplete;
  controlledRef.current = controlledProgress;

  const goToPhase = React.useCallback((next: PixelPreloaderPhase) => {
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

  const beginExit = React.useCallback(() => {
    if (
      phaseRef.current === "complete" ||
      phaseRef.current === "exiting" ||
      phaseRef.current === "finished"
    ) {
      return;
    }
    goToPhase("complete");
    later(() => {
      if (phaseRef.current !== "complete") return;
      goToPhase("exiting");
    }, Math.max(0, completionHold));
  }, [completionHold, goToPhase, later]);

  // Core simulation + render loop. Runs once per mount; canvas state is
  // mutated directly so React never rerenders at 60fps.
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    reduceMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const reduced = reduceMotionRef.current;

    const rand = mulberry32(seed);

    let raf = 0;
    let sim: ColumnSim | null = null;
    let cols = 0;
    let rows = 0;
    let cssW = 0;
    let cssH = 0;
    let effCell = cellSize;
    let visual = 0;
    let lastInteger = -1;
    let frame = 0;
    const startTime = performance.now();
    let disposed = false;
    const totalMs = Math.max(
      1,
      reduced ? Math.min(duration, 500) : Math.max(0, duration),
    );

    const stagedTarget = (elapsed: number) => {
      const t = Math.min(1, elapsed / totalMs);
      const { progressKeys, progressTimes } = DEFAULT_CONFIG;
      for (let i = 1; i < progressTimes.length; i++) {
        const t1 = progressTimes[i] ?? 1;
        if (t <= t1) {
          const t0 = progressTimes[i - 1] ?? 0;
          const v0 = progressKeys[i - 1] ?? 0;
          const v1 = progressKeys[i] ?? 1;
          const local = t1 === t0 ? 1 : (t - t0) / (t1 - t0);
          const eased = local * local * (3 - 2 * local);
          return v0 + (v1 - v0) * eased;
        }
      }
      return 1;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      cssW = w;
      cssH = h;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Responsive density: keep the column count in a detailed band so
      // the jagged frontier survives on mobile and ultrawide alike.
      const target = Math.min(
        300,
        Math.max(70, Math.round(w / Math.max(2, cellSize))),
      );
      effCell = w / target;
      const nextCols = target;
      rows = Math.max(1, Math.ceil(h / effCell));
      if (!sim) {
        sim = createColumnSim(nextCols, rand);
      } else if (nextCols !== cols) {
        sim = resampleColumnSim(sim, nextCols);
      }
      cols = nextCols;
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);
    goToPhase("loading");

    const reportInteger = (value: number) => {
      const rounded = Math.min(100, Math.max(0, Math.round(value * 100)));
      if (rounded !== lastInteger) {
        lastInteger = rounded;
        if (counterRef.current) {
          counterRef.current.textContent = `${rounded}%`;
        }
        setAriaValue(rounded);
      }
    };

    const tick = (now: number) => {
      if (disposed) return;
      raf = requestAnimationFrame(tick);
      if (!sim || cols === 0) return;
      frame += 1;
      const elapsed = now - startTime;
      const pal = paletteRef.current;
      const accent = pal.accent;

      // --- progress controller ---
      const controlled = controlledRef.current;
      const target =
        controlled === undefined
          ? stagedTarget(elapsed)
          : Math.min(100, Math.max(0, controlled)) / 100;
      const rate =
        controlled === undefined ? 1 : DEFAULT_CONFIG.progressSmoothing;
      visual += (target - visual) * rate;
      if (Math.abs(target - visual) < 0.0005) visual = target;
      reportInteger(controlled === undefined ? target : visual);

      if (target >= 1 && visual > 0.999) {
        beginExit();
      }

      // --- column simulation: independent heights with inertia ---
      // Each column retargets on its own 80–250ms cadence and lerps toward
      // the target, so columns visibly grow / hold / shrink instead of
      // flickering, and the terrain never regenerates all at once.
      const C = DEFAULT_CONFIG;
      if (!reduced) {
        for (let x = 0; x < cols; x++) {
          if (elapsed >= sim.nextChange[x]!) {
            sim.targetHeight[x] = pickBodyHeight(rand(), rand());
            // Rare transient spikes, gated by progress so huge towers do
            // not appear before the frontier has emerged.
            const spikeChance =
              C.spikeChance * Math.min(1, visual / 0.15);
            if (
              rand() < spikeChance &&
              sim.spikeTarget[x]! <= 0.5
            ) {
              sim.spikeTarget[x] =
                C.minSpikeHeight +
                Math.pow(rand(), 2) *
                  (C.maxSpikeHeight - C.minSpikeHeight);
            }
            sim.nextChange[x] =
              elapsed +
              C.retargetMinMs +
              rand() * (C.retargetMaxMs - C.retargetMinMs);
          }
          sim.height[x]! +=
            (sim.targetHeight[x]! - sim.height[x]!) * C.columnSmoothing;
          sim.spike[x]! +=
            (sim.spikeTarget[x]! - sim.spike[x]!) * C.spikeSmoothing;
          sim.spikeTarget[x]! *= C.spikeDecay;
          if (sim.spikeTarget[x]! < 0.4) sim.spikeTarget[x] = 0;
          if (sim.spike[x]! < 0.25 && sim.spikeTarget[x] === 0) {
            sim.spike[x] = 0;
          }
        }
      }

      // --- render: solid mass + structured column frontier ---
      // ZONE C (completed): solid field below each column base.
      // ZONE B (active): narrow band around each column top with a
      //   distance gradient — orange tip, corrupted body, white lower.
      // ZONE A (unloaded): everything above stays dark.
      const baseY = cssH * (1 - visual);
      const epoch = Math.floor(frame / C.flickerEpoch);
      const emRaw = Math.min(1, visual / C.emergenceSpan);
      const emergence = emRaw * emRaw * (3 - 2 * emRaw);
      const solidPad = C.solidToleranceCells * effCell;

      ctx.fillStyle = pal.background;
      ctx.fillRect(0, 0, cssW, cssH);

      for (let x = 0; x < cols; x++) {
        // Neighbor correlation (quantized): clusters emerge naturally but
        // the terrain stays stepped and digital, never wavy.
        const left = sim.height[x > 0 ? x - 1 : x]!;
        const right = sim.height[x < cols - 1 ? x + 1 : x]!;
        const body =
          Math.max(
            0,
            Math.round(
              sim.height[x]! * (1 - C.neighborMix) +
                ((left + right) / 2) * C.neighborMix,
            ),
          ) * emergence;
        const tower = sim.spike[x]! * emergence;
        const colBase = baseY + sim.jitter[x]! * effCell;
        const bodyTop = colBase - body * effCell;
        const tip = bodyTop - tower * effCell;

        // ZONE C — dense white base, one rect per column.
        const top = Math.min(cssH, colBase + solidPad);
        if (top < cssH) {
          ctx.fillStyle = pal.foreground;
          ctx.fillRect(x * effCell, top, effCell + 0.5, cssH - top);
        }

        if (visual <= 0.0005 || visual >= 0.9995) continue;

        // ZONE B — active band for this column only.
        const rowTop = Math.max(0, Math.floor((tip - effCell) / effCell));
        const rowBottom = Math.min(
          rows - 1,
          Math.ceil((colBase + solidPad) / effCell),
        );
        for (let r = rowTop; r <= rowBottom; r++) {
          const cellY = r * effCell;
          if (cellY < tip - effCell * 0.5) continue; // ZONE A — dark
          const d = (cellY - bodyTop) / effCell;

          let orangeP: number;
          let whiteP: number;
          let gapP: number;
          if (cellY < bodyTop) {
            // Spike tower: hot tip, mostly white shaft with orange speckle.
            const isTip = cellY >= tip - effCell;
            orangeP = isTip ? 0.8 : 0.2;
            whiteP = isTip ? 0.15 : 0.75;
            gapP = 0;
          } else if (d < 1) {
            orangeP = 0.45;
            whiteP = 0.4;
            gapP = 0.1;
          } else if (d < 2) {
            orangeP = 0.3;
            whiteP = 0.55;
            gapP = 0.08;
          } else if (d < 4) {
            orangeP = 0.15;
            whiteP = 0.78;
            gapP = 0.03;
          } else if (d < 6) {
            orangeP = 0.08;
            whiteP = 0.9;
            gapP = 0;
          } else {
            // Lower transition: already solid white.
            ctx.fillStyle = pal.foreground;
            ctx.fillRect(x * effCell, cellY, effCell + 0.5, effCell + 0.5);
            continue;
          }

          // Stable seeded pick per cell; only a small subset flickers.
          const flickers = hash2(x, r, seed + epoch) < C.flickerRate;
          const pick = flickers
            ? hash2(x, r, seed + epoch * 7919 + 13)
            : hash2(x, r, seed);
          if (pick < orangeP) {
            const shade = hash2(r, x, seed + 7);
            const vr = Math.round(accent[0]! * (0.92 + shade * 0.12));
            const vg = Math.round(accent[1]! * (0.9 + shade * 0.14));
            const vb = Math.round(accent[2]! * (0.9 + shade * 0.1));
            ctx.fillStyle = `rgb(${vr},${vg},${vb})`;
            ctx.fillRect(x * effCell, cellY, effCell + 0.5, effCell + 0.5);
          } else if (pick < orangeP + whiteP) {
            ctx.fillStyle = pal.foreground;
            ctx.fillRect(x * effCell, cellY, effCell + 0.5, effCell + 0.5);
          } else if (gapP > 0 && pick < orangeP + whiteP + gapP) {
            // Sparse dark gaps only near the top of the band.
            ctx.fillStyle = pal.background;
            ctx.fillRect(x * effCell, cellY, effCell + 0.5, effCell + 0.5);
          }
        }
      }

      if (visual >= 0.9995) {
        ctx.fillStyle = pal.foreground;
        ctx.fillRect(0, 0, cssW, cssH);
      }

      // Fine grid texture — subtle enough to read as texture, not lines.
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= cols; x++) {
        const px = Math.round(x * effCell) + 0.5;
        ctx.moveTo(px, 0);
        ctx.lineTo(px, cssH);
      }
      for (let r = 0; r <= rows; r++) {
        const py = Math.round(r * effCell) + 0.5;
        ctx.moveTo(0, py);
        ctx.lineTo(cssW, py);
      }
      // Grid contrast differs per zone; approximate with two passes:
      // unloaded-zone lines first across the whole viewport, then the
      // filled field below the average frontier gets its own hairline pass.
      ctx.strokeStyle = pal.gridUnloaded;
      ctx.stroke();
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, baseY, cssW, cssH - baseY);
      ctx.clip();
      ctx.strokeStyle = pal.gridLoaded;
      ctx.stroke();
      ctx.restore();
    };

    raf = requestAnimationFrame(tick);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
    };
    // Runs once per mount (replay = remount via key).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Completion → hold → fade → unmount. Guarded so StrictMode double
  // effects and rerenders can only fire onComplete once.
  React.useEffect(() => {
    if (phase !== "exiting") return;
    const ms = reduceMotionRef.current
      ? Math.min(exitDuration, 250)
      : Math.max(0, exitDuration);
    const timer = setTimeout(() => {
      if (completedRef.current) return;
      completedRef.current = true;
      clearTimers();
      goToPhase("finished");
      onCompleteRef.current?.();
    }, ms + 60);
    timers.current.push(timer);
    return () => clearTimeout(timer);
  }, [phase, exitDuration, clearTimers, goToPhase]);

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
  const exitSeconds = Math.max(0.01, exitDuration / 1000);

  return (
    <div
      role="progressbar"
      aria-label="Page loading"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={ariaValue}
      data-slot="pixel-preloader"
      data-phase={phase}
      className={cn("fixed inset-0 overflow-hidden", className)}
      style={{
        width: "100vw",
        height: "100dvh",
        backgroundColor: resolvedBackground,
        zIndex,
        opacity: exiting ? 0 : 1,
        transition: `opacity ${exitSeconds}s ease`,
        pointerEvents: exiting ? "none" : "auto",
      }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
      />
      {showPercentage && (
        <div
          aria-hidden="true"
          className="absolute flex items-center gap-2 select-none"
          style={{
            top: "max(16px, env(safe-area-inset-top, 0px) + 12px)",
            left: "max(16px, env(safe-area-inset-left, 0px) + 12px)",
          }}
        >
          {/* Miniature histogram mark — echoes the frontier columns. */}
          <span className="flex items-end gap-[2px]" aria-hidden="true">
            {[5, 9, 13, 8, 15].map((height, index) => (
              <span
                key={index}
                className="pixel-preloader-bar w-[3px]"
                style={{
                  height: `${height}px`,
                  backgroundColor: accentColor,
                  animationDelay: `${index * 0.12}s`,
                  transformOrigin: "bottom center",
                }}
              />
            ))}
          </span>
          <span
            ref={counterRef}
            className="text-sm font-medium tabular-nums"
            style={{ color: paletteDefaults.hud, fontFamily: "inherit" }}
          >
            0%
          </span>
        </div>
      )}
      <style>{`@keyframes pixel-preloader-bar { 0%,100% { transform: scaleY(1); } 50% { transform: scaleY(0.7); } } .pixel-preloader-bar { animation: pixel-preloader-bar 1.4s ease-in-out infinite; }`}</style>
    </div>
  );
}

export default PixelPreloader;
