"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Public types                                                              */
/* -------------------------------------------------------------------------- */

export type PreloaderProV1Mode = "timed" | "pageLoad";
export type PreloaderProV1Theme = "auto" | "light" | "dark";

export type PreloaderProV1ReducedMotion = "skip" | "fade";

export interface PreloaderProV1Image {
  src: string;
  title?: string;
  caption?: string;
}

export interface PreloaderProV1Glitch {
  enabled: boolean;
  intensity: number;
  chromatic: boolean;
  blocks: boolean;
  smear: boolean;
  lines: boolean;
}

export interface PreloaderProV1Props {
  /** Card images, rendered in order and looped seamlessly. */
  images: PreloaderProV1Image[];
  /** Corner label. */
  label?: string;
  /** `"timed"` runs the measured curve; `"pageLoad"` follows real loading. */
  mode?: PreloaderProV1Mode;
  /** Palette mode. `"auto"` follows the site light/dark class. */
  theme?: PreloaderProV1Theme;
  /** Seconds for the 0 → 100 progression (measured 2.7). */
  duration?: number;
  /** Seconds the completed 100% frame holds (measured 1.2). */
  holdTime?: number;
  /** Seconds for the sliced-shred exit (measured 1.0). */
  exitDuration?: number;
  /** Horizontal strip drift in px/s (measured 60). */
  driftSpeed?: number;
  /** Overlay background. Defaults to the active light/dark palette. */
  background?: string;
  /** Foreground ink. Defaults to the active light/dark palette. */
  foreground?: string;
  /** Card width in px. */
  cardWidth?: number;
  /** Card height in px. */
  cardHeight?: number;
  /** Gap between cards in px. */
  gap?: number;
  /** Card corner radius in px. */
  radius?: number;
  /** Counter / UI font stack. */
  fontFamily?: string;
  /** Counter font size in px. Defaults to `clamp(72px, 8.6vw, 160px)`. */
  counterSize?: number;
  /** Glitch tuning. Partial overrides merge with the defaults. */
  glitch?: Partial<PreloaderProV1Glitch>;
  /** Render the grey trail blocks during the exit. */
  exitTrails?: boolean;
  /** Lock page scroll while active. */
  lockScroll?: boolean;
  /** Persist a session flag and skip if the loader already ran. */
  oncePerSession?: boolean;
  /** Behaviour when `prefers-reduced-motion` is set. */
  reducedMotion?: PreloaderProV1ReducedMotion;
  /** Render one frozen frame (counter 066, bar 66%) with no timers. */
  preview?: boolean;
  /** Deterministic seed for glitch + exit randomness. */
  seed?: number;
  /** Additional class names for the root overlay. */
  className?: string;
  /** Fires when the shred exit starts, while the page is being revealed. */
  onExitStart?: () => void;
  /** Fires after the overlay is removed. */
  onComplete?: () => void;
}

export interface PreloaderProV1Handle {
  replay: () => void;
}

/* -------------------------------------------------------------------------- */
/*  Defaults + helpers                                                        */
/* -------------------------------------------------------------------------- */

const SESSION_KEY = "preloader-pro-v1-shown";

const DEFAULT_GLITCH: PreloaderProV1Glitch = {
  enabled: true,
  intensity: 0.7,
  chromatic: true,
  blocks: true,
  smear: true,
  lines: true,
};

const SR_ONLY: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

const SMASH_COLORS = ["#ffff00", "#00ff00", "#ff0000", "#00ffff", "#ff6a00"];

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));
const clamp01 = (v: number) => clamp(v, 0, 1);

const easeOutCubic = (t: number) => {
  const c = clamp01(t);
  return 1 - Math.pow(1 - c, 3);
};
const easeInOutQuad = (t: number) => {
  const c = clamp01(t);
  return c < 0.5 ? 2 * c * c : 1 - Math.pow(-2 * c + 2, 2) / 2;
};

/** The measured progress curve — one power ease-out over `duration`. */
const progressCurve = (t: number, duration = 2.7, power = 3.2) =>
  100 * (1 - Math.pow(1 - Math.min(1, t / Math.max(0.0001, duration)), power));

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function readSessionFlag(): boolean {
  try {
    return (
      typeof window !== "undefined" &&
      window.sessionStorage.getItem(SESSION_KEY) === "1"
    );
  } catch {
    return false;
  }
}

function writeSessionFlag() {
  try {
    window.sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    /* storage blocked — ignore */
  }
}

const noopSubscribe = () => () => {};

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

/* -------------------------------------------------------------------------- */
/*  Card + strip pieces                                                       */
/* -------------------------------------------------------------------------- */

interface CardProps {
  item: PreloaderProV1Image;
  width: number;
  height: number;
  radius: number;
  foreground: string;
}

function CardImage({ item, width, height, radius, foreground }: CardProps) {
  return (
    <div style={{ position: "relative", width, flex: "0 0 auto" }}>
      <div
        style={{
          width,
          height,
          borderRadius: radius,
          overflow: "hidden",
          background: "rgba(255,255,255,0.04)",
        }}
      >
        <img
          src={item.src}
          alt=""
          draggable={false}
          decoding="async"
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            userSelect: "none",
          }}
        />
      </div>
      {(item.title || item.caption) && (
        <div
          style={{
            position: "absolute",
            top: height + 8,
            left: 0,
            display: "flex",
            flexDirection: "column",
            gap: 3,
            fontFamily:
              '"JetBrains Mono", "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: 11,
            lineHeight: 1.25,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: foreground,
            whiteSpace: "nowrap",
          }}
        >
          {item.title && <span style={{ opacity: 0.6 }}>{item.title}</span>}
          {item.caption && <span style={{ opacity: 0.45 }}>{item.caption}</span>}
        </div>
      )}
    </div>
  );
}

function buildVisibleCards(
  images: PreloaderProV1Image[],
  offset: number,
  pitch: number,
  loop: number,
  cardWidth: number,
  viewportWidth: number,
) {
  const result: { key: string; item: PreloaderProV1Image; x: number }[] = [];
  const total = images.length;
  if (!total) return result;
  for (let i = 0; i < total; i += 1) {
    let x = offset + i * pitch;
    x = ((x % loop) + loop) % loop;
    if (x >= viewportWidth) x -= loop;
    if (x > -cardWidth && x < viewportWidth + cardWidth) {
      result.push({
        key: `${i}-${Math.round(x)}`,
        item: images[i]!,
        x,
      });
    }
  }
  return result;
}

/* -------------------------------------------------------------------------- */
/*  Static scene (used by every exit band)                                    */
/* -------------------------------------------------------------------------- */

interface StaticSceneProps {
  images: PreloaderProV1Image[];
  label: string;
  offset: number;
  progress: number;
  background: string;
  foreground: string;
  barTrack: string;
  fontFamily: string;
  counterFont: string;
  cardWidth: number;
  cardHeight: number;
  gap: number;
  radius: number;
  viewportWidth: number;
}

function StaticScene({
  images,
  label,
  offset,
  progress,
  background,
  foreground,
  barTrack,
  fontFamily,
  counterFont,
  cardWidth,
  cardHeight,
  gap,
  radius,
  viewportWidth,
}: StaticSceneProps) {
  const pitch = cardWidth + gap;
  const loop = Math.max(1, images.length * pitch);
  const cards = React.useMemo(
    () =>
      buildVisibleCards(
        images,
        offset,
        pitch,
        loop,
        cardWidth,
        viewportWidth,
      ),
    [images, offset, pitch, loop, cardWidth, viewportWidth],
  );
  const padded = String(Math.round(progress)).padStart(3, "0");

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background,
        overflow: "hidden",
        color: foreground,
        fontFamily,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 34,
          top: 34,
          fontSize: 12,
          lineHeight: 1,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          fontFamily:
            '"JetBrains Mono", "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
          color: foreground,
        }}
      >
        {label}
      </div>

      <div
        style={{
          position: "absolute",
          top: "45.4%",
          left: 0,
          right: 0,
          height: cardHeight,
          transform: "translateY(-50%)",
        }}
      >
        {cards.map((card) => (
          <div
            key={card.key}
            style={{ position: "absolute", top: 0, left: card.x }}
          >
            <CardImage
              item={card.item}
              width={cardWidth}
              height={cardHeight}
              radius={radius}
              foreground={foreground}
            />
          </div>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          left: 34,
          bottom: 29,
          lineHeight: 1,
          paddingBottom: "0.14em",
          marginBottom: "-0.14em",
          overflow: "visible",
          whiteSpace: "nowrap",
        }}
      >
        <span
          style={{
            display: "block",
            fontFamily,
            fontWeight: 400,
            fontSize: counterFont,
            lineHeight: 1,
            letterSpacing: "-0.01em",
            color: foreground,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {padded}
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          left: 35,
          right: 35,
          bottom: 34,
          height: 1,
          background: barTrack,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${clamp(progress, 0, 100)}%`,
            background: foreground,
          }}
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Exit band model                                                           */
/* -------------------------------------------------------------------------- */

interface BandBlock {
  left: number;
  top: number;
  size: number;
  color: string;
}

interface BandSpec {
  top: number;
  height: number;
  center: number;
  central: boolean;
  /** Fraction of the stage height covered by this band. */
  area: number;
  /** Cumulative outer-band area that sits nearer an edge than this band. */
  outerCumBefore: number;
  direction: -1 | 1;
  smearScale: number;
  originX: number;
  jitter: number;
  /** Seconds (within the exit) for the short Phase B colour-block flash. */
  blockStart: number;
  blockDur: number;
  blocks: BandBlock[];
}

const COVERAGE_STOPS: readonly [number, number][] = [
  [0, 0],
  [0.15, 0.12],
  [0.25, 0.21],
  [0.35, 0.33],
  [0.45, 0.45],
  [0.55, 0.59],
  [0.65, 0.72],
  [0.75, 0.82],
  [0.85, 0.9],
  [0.95, 0.98],
  [1, 1],
];

/** Revealed-page coverage at a normalised exit time (0–1). */
function exitCoverage(t: number) {
  const u = clamp01(t);
  for (let i = 1; i < COVERAGE_STOPS.length; i += 1) {
    const [t1, c1] = COVERAGE_STOPS[i]!;
    const [t0, c0] = COVERAGE_STOPS[i - 1]!;
    if (u <= t1) {
      const k = (u - t0) / Math.max(0.0001, t1 - t0);
      return c0 + (c1 - c0) * k;
    }
  }
  return 1;
}

interface TrailSpec {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface ShredGlitchSpec {
  top: number;
  height: number;
  color: string;
  start: number;
  duration: number;
  shift: number;
  opacity: number;
}

interface ExitState {
  bands: BandSpec[];
  trails: TrailSpec[];
  glitches: ShredGlitchSpec[];
  offset: number;
  width: number;
  height: number;
}

interface BandOptions {
  seed: number;
  width: number;
  height: number;
  exitDuration: number;
  exitTrails: boolean;
  cardHeight: number;
}

function createBands({
  seed,
  width,
  height,
  exitTrails,
}: BandOptions) {
  const rng = mulberry32(seed);
  const count = 28;
  const raw = Array.from({ length: count }, () => 16 + rng() * 44);
  const rawSum = raw.reduce((sum, h) => sum + h, 0) || 1;
  const scale = height / rawSum;

  const bands: Omit<BandSpec, "outerCumBefore">[] = [];
  let top = 0;

  for (let i = 0; i < count; i += 1) {
    const bandHeight = i === count - 1 ? height - top : raw[i]! * scale;
    const center = top + bandHeight / 2;
    const central = center > height * 0.25 && center < height * 0.65;
    const direction: -1 | 1 = rng() < 0.5 ? -1 : 1;
    const smearScale = 1.4 + rng() * 1.6;
    const originX = rng() * 100;
    const jitter = (rng() * 2 - 1) * width * 0.025;

    const blocks: BandBlock[] = [];
    if (central) {
      const blockCount = 3 + Math.floor(rng() * 4);
      for (let b = 0; b < blockCount; b += 1) {
        blocks.push({
          left: rng() * width,
          top: rng() * Math.max(0, bandHeight - 12),
          size: 16 + rng() * 32,
          color: SMASH_COLORS[Math.floor(rng() * SMASH_COLORS.length)]!,
        });
      }
    }

    bands.push({
      top,
      height: bandHeight,
      center,
      central,
      area: bandHeight / height,
      direction,
      smearScale,
      originX,
      jitter,
      blockStart: rng() * 0.045,
      blockDur: (2 + Math.floor(rng() * 3)) / 60,
      blocks,
    });

    top += bandHeight;
  }

  // Outer bands shred from the nearest edge inward. Their cumulative area is
  // what the master coverage curve spends before the central collapse begins.
  const outer = bands
    .map((band, index) => ({ band, index }))
    .filter(({ band }) => !band.central)
    .sort((a, b) => {
      const da = Math.min(a.band.center, height - a.band.center);
      const db = Math.min(b.band.center, height - b.band.center);
      return da - db;
    });
  let cum = 0;
  const cumBefore = new Map<number, number>();
  outer.forEach(({ band, index }) => {
    cumBefore.set(index, cum);
    cum += band.area;
  });

  const resolved: BandSpec[] = bands.map((band, index) => ({
    ...band,
    outerCumBefore: cumBefore.get(index) ?? 0,
  }));

  const trails: TrailSpec[] = [];
  if (exitTrails) {
    resolved.forEach((band) => {
      const trailWidth = (0.1 + rng() * 0.25) * width;
      trails.push({
        top: band.top,
        height: band.height,
        width: trailWidth,
        left: band.direction > 0 ? 0 : width - trailWidth,
      });
    });
  }

  const glitchColors = [
    "#EFE9E1",
    "#FFFFFF",
    "#000000",
    "#FF2A00",
    "#00E5FF",
    "#FFE600",
    "#00FF66",
    "#FF4FD8",
  ];
  const glitches: ShredGlitchSpec[] = [];
  for (let i = 0; i < 28; i += 1) {
    glitches.push({
      top: rng() * height,
      height: 2 + rng() * 34,
      color: glitchColors[Math.floor(rng() * glitchColors.length)]!,
      start: rng() * 0.62,
      duration: 0.06 + rng() * 0.22,
      shift: (rng() * 2 - 1) * width * 0.34,
      opacity: 0.35 + rng() * 0.55,
    });
  }
  // Two edge flashes anchor the first beat to the reference: the shred opens
  // with hard white bars at the top and bottom before the page appears.
  glitches.push({
    top: 0,
    height: 8,
    color: "#FFFFFF",
    start: 0,
    duration: 0.18,
    shift: width * 0.08,
    opacity: 0.95,
  });
  glitches.push({
    top: height - 9,
    height: 8,
    color: "#FFFFFF",
    start: 0.04,
    duration: 0.2,
    shift: -width * 0.1,
    opacity: 0.9,
  });

  return { bands: resolved, trails, glitches };
}

/* -------------------------------------------------------------------------- */
/*  Glitch burst schedule                                                      */
/* -------------------------------------------------------------------------- */

interface BurstLine {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface BurstBlock {
  top: number;
  left: number;
  w: number;
  h: number;
}

interface BurstSlice {
  top: number;
  height: number;
  shift: number;
}

interface BurstSpec {
  start: number;
  end: number;
  counterOnly: boolean;
  chromatic: boolean;
  lines: boolean;
  blocks: boolean;
  slicer: boolean;
  smear: boolean;
  scramble: boolean;
  linesData: BurstLine[];
  blocksData: BurstBlock[];
  slicesData: BurstSlice[];
  smearData: { top: number; height: number; scale: number; origin: number };
  scrambleDigit: number;
  shift: number;
}

interface BurstScheduleOptions {
  rng: () => number;
  width: number;
  height: number;
  cardHeight: number;
  duration: number;
  preExitAt: number;
  glitch: PreloaderProV1Glitch;
}

function createBurstSchedule({
  rng,
  width,
  height,
  cardHeight,
  duration,
  preExitAt,
  glitch,
}: BurstScheduleOptions): BurstSpec[] {
  if (!glitch.enabled) return [];

  const intensity = clamp(glitch.intensity, 0, 1);
  const stripTop = height * 0.454 - cardHeight / 2;
  const stripBottom = height * 0.454 + cardHeight / 2;

  const makeBurst = (
    start: number,
    durationSeconds: number,
    counterOnly: boolean,
  ): BurstSpec => {
    const pool: Array<"chromatic" | "lines" | "blocks" | "smear"> = [];
    if (glitch.chromatic) pool.push("chromatic");
    if (glitch.lines) pool.push("lines");
    if (glitch.blocks) pool.push("blocks");
    if (glitch.smear) pool.push("smear");

    const chosen = new Set<string>();
    if (counterOnly) {
      chosen.add("chromatic");
    } else {
      const count = 1 + Math.floor(rng() * 3);
      for (let i = 0; i < count && pool.length; i += 1) {
        chosen.add(pool[Math.floor(rng() * pool.length)]!);
      }
    }

    const linesData = Array.from(
      { length: 1 + Math.floor(rng() * 3) },
      () => ({
        top: stripTop + rng() * Math.max(1, stripBottom - stripTop),
        left: rng() * width * 0.6,
        width: (0.1 + rng() * 0.5) * width,
        height: 1 + Math.floor(rng() * 3),
      }),
    );

    const blocksData = Array.from(
      { length: 1 + Math.floor(rng() * 3) },
      () => ({
        top:
          stripTop + cardHeight * 0.5 + rng() * Math.max(1, cardHeight * 0.5),
        left: rng() * width * 0.88,
        w: 40 + rng() * 80,
        h: 10 + rng() * 30,
      }),
    );

    const slicesData = Array.from(
      { length: 1 + Math.floor(rng() * 2) },
      () => ({
        top: stripTop + rng() * Math.max(1, cardHeight - 40),
        height: 10 + rng() * 30,
        shift:
          (10 + rng() * 70 * (0.6 + intensity * 0.5)) *
          (rng() < 0.5 ? -1 : 1),
      }),
    );

    return {
      start,
      end: start + durationSeconds,
      counterOnly,
      chromatic: chosen.has("chromatic"),
      lines: chosen.has("lines"),
      blocks: chosen.has("blocks"),
      slicer: chosen.has("blocks"),
      smear: chosen.has("smear"),
      scramble:
        chosen.has("chromatic") && !counterOnly && rng() < 0.24,
      linesData,
      blocksData,
      slicesData,
      smearData: {
        top: stripTop + rng() * Math.max(1, cardHeight - 30),
        height: 8 + rng() * 22,
        scale: 1.3 + rng() * 1.2,
        origin: rng() * 100,
      },
      scrambleDigit: Math.floor(rng() * 3),
      shift: counterOnly
        ? rng() < 0.5
          ? -3
          : 3
        : (rng() < 0.5 ? -1 : 1) * (6 + rng() * 8),
    };
  };

  const bursts: BurstSpec[] = [];
  let cursor = 1.2;
  let guard = 0;

  // No burst before 1.2s. Gaps shrink as the counter approaches 100, which
  // clusters the bursts in the second half of the run.
  while (cursor < preExitAt - 0.1 && guard < 24) {
    guard += 1;
    const progress = progressCurve(cursor, duration) / 100;
    const gap = Math.max(
      0.25,
      (0.7 - 0.35 * progress) * (0.85 + rng() * 0.3),
    );
    const start = cursor + gap;
    if (start >= preExitAt - 0.1) break;
    const burstDuration = (3 + Math.floor(rng() * 6)) / 60;
    bursts.push(makeBurst(start, burstDuration, false));
    cursor = start + burstDuration;
  }

  // Mandatory pre-exit burst: counter/label chromatic split + horizontal
  // shift only. The strip itself must not smear here.
  bursts.push(makeBurst(Math.max(1.2, preExitAt), 0.15, true));

  return bursts;
}

/** Resolve the site theme from the html class, data-theme, or system. */
function resolvePreloaderScheme(): "light" | "dark" {
  if (typeof document === "undefined") return "dark";
  const root = document.documentElement;
  const explicit = root.dataset.theme;
  if (explicit === "light" || explicit === "dark") return explicit;
  if (root.classList.contains("light")) return "light";
  if (root.classList.contains("dark")) return "dark";
  if (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }
  return "light";
}

/** Follow the site theme live unless an explicit mode is supplied. */
function usePreloaderScheme(theme: PreloaderProV1Theme): "light" | "dark" {
  const [scheme, setScheme] = React.useState<"light" | "dark">(() => {
    if (theme !== "auto") return theme;
    // Match the server snapshot; the effect corrects light theme after mount.
    return "dark";
  });

  React.useEffect(() => {
    if (theme !== "auto") {
      setScheme(theme);
      return;
    }
    const update = () => setScheme(resolvePreloaderScheme());
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "style"],
    });
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    query.addEventListener("change", update);
    return () => {
      observer.disconnect();
      query.removeEventListener("change", update);
    };
  }, [theme]);

  return scheme;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * PreloaderProV1 — a cinematic strip preloader measured from
 * preloaderprov1.framer.website.
 *
 * A near-black overlay holds a drifting row of portrait cards, a
 * zero-padded percentage counter and a hairline progress bar. Random
 * glitch bursts fire over the whole run. The exit shreds the screen into
 * horizontal bands, smears the central cards into colour ribbons, and
 * collapses to a line before revealing the page underneath.
 */
export const PreloaderProV1 = React.forwardRef<
  PreloaderProV1Handle,
  PreloaderProV1Props
>(function PreloaderProV1(
  {
    images,
    label = "LOADING",
    mode = "timed",
    theme = "auto",
    duration = 2.7,
    holdTime = 1.2,
    exitDuration = 1.0,
    driftSpeed = 60,
    background: backgroundProp,
    foreground: foregroundProp,
    cardWidth = 200,
    cardHeight = 280,
    gap = 24,
    radius = 4,
    fontFamily = '"Inter Tight", "Inter", "Helvetica Neue", Helvetica, Arial, sans-serif',
    counterSize,
    glitch,
    exitTrails = true,
    lockScroll = true,
    oncePerSession = false,
    reducedMotion = "fade",
    preview = false,
    seed,
    className,
    onExitStart,
    onComplete,
  },
  ref,
) {
  const scheme = usePreloaderScheme(theme);
  const background =
    backgroundProp ?? (scheme === "light" ? "#F3EFE7" : "#0C0C09");
  const foreground =
    foregroundProp ?? (scheme === "light" ? "#141410" : "#EFE9E1");
  const barTrack =
    scheme === "light" ? "rgba(20,20,16,0.16)" : "rgba(255,255,255,0.12)";
  const trailColor = scheme === "light" ? "#A8A196" : "#c6c6c6";

  const glitchConfig = React.useMemo<PreloaderProV1Glitch>(
    () => ({ ...DEFAULT_GLITCH, ...glitch }),
    [glitch],
  );

  const imageKey = React.useMemo(
    () => images.map((item) => item.src).join("|"),
    [images],
  );

  const [runKey, setRunKey] = React.useState(0);
  const [forceShow, setForceShow] = React.useState(false);
  const [booted, setBooted] = React.useState(preview);
  const [done, setDone] = React.useState(false);
  const [exitState, setExitState] = React.useState<ExitState | null>(null);
  const [stageDims, setStageDims] = React.useState({ width: 0, height: 0 });
  const liveRegionRef = React.useRef<HTMLSpanElement>(null);
  const stageDimsRef = React.useRef({ width: 0, height: 0 });

  const prefersReduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const fadeOnly = !preview && prefersReduced && reducedMotion === "fade";
  const skipReduced = !preview && prefersReduced && reducedMotion === "skip";

  const sessionShown = React.useSyncExternalStore(
    noopSubscribe,
    () => oncePerSession && !forceShow && readSessionFlag(),
    () => false,
  );
  const skip = !preview && (skipReduced || sessionShown);

  // The size comes from the stage, never the browser window, so the fixed
  // 1280 × 720 preview frame and the fullscreen story scale identically.
  const resolvedCounterSize =
    counterSize ??
    clamp((stageDims.width > 0 ? stageDims.width : 1465) * 0.086, 72, 160);
  const counterFont = `${resolvedCounterSize}px`;

  /* ------------------------------- refs -------------------------------- */

  const rootRef = React.useRef<HTMLDivElement>(null);
  const sceneRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const sliceWrapRefs = React.useRef<(HTMLDivElement | null)[]>([null, null]);
  const sliceTrackRefs = React.useRef<(HTMLDivElement | null)[]>([null, null]);
  const smearWrapRef = React.useRef<HTMLDivElement>(null);
  const smearTrackRef = React.useRef<HTMLDivElement>(null);
  const lineRefs = React.useRef<(HTMLDivElement | null)[]>([
    null,
    null,
    null,
  ]);
  const blockRefs = React.useRef<(HTMLDivElement | null)[]>([
    null,
    null,
    null,
    null,
  ]);
  const smearBlockRefs = React.useRef<(HTMLDivElement | null)[]>([
    null,
    null,
    null,
  ]);
  const labelRef = React.useRef<HTMLDivElement>(null);
  const counterWrapRef = React.useRef<HTMLDivElement>(null);
  const counterRiseRef = React.useRef<HTMLDivElement>(null);
  const counterInnerRef = React.useRef<HTMLSpanElement>(null);
  const counterRedRef = React.useRef<HTMLSpanElement>(null);
  const counterCyanRef = React.useRef<HTMLSpanElement>(null);
  const barWrapRef = React.useRef<HTMLDivElement>(null);
  const barFillRef = React.useRef<HTMLDivElement>(null);

  const bandElsRef = React.useRef<(HTMLDivElement | null)[]>([]);
  const trailElsRef = React.useRef<(HTMLDivElement | null)[]>([]);
  const glitchElsRef = React.useRef<(HTMLDivElement | null)[]>([]);
  const bandBlockElsRef = React.useRef<(HTMLDivElement | null)[][]>([]);
  const exitBandsRef = React.useRef<BandSpec[] | null>(null);
  const exitDimsRef = React.useRef({ width: 0, height: 0 });

  const onExitStartRef = React.useRef(onExitStart);
  onExitStartRef.current = onExitStart;
  const onCompleteRef = React.useRef(onComplete);
  onCompleteRef.current = onComplete;

  const currentOffsetRef = React.useRef(0);
  const prevProgressRef = React.useRef(0);
  const reached100Ref = React.useRef<number | null>(null);
  const targetLoadRef = React.useRef(mode === "timed" ? 1 : 0.45);
  const exitStartedRef = React.useRef(false);
  const completedRef = React.useRef(false);
  const milestoneRef = React.useRef(0);
  const frozenOffsetRef = React.useRef(0);

  /* ----------------------------- replay -------------------------------- */

  React.useImperativeHandle(
    ref,
    () => ({
      replay: () => {
        setForceShow(true);
        setDone(false);
        setExitState(null);
        setBooted(false);
        prevProgressRef.current = 0;
        reached100Ref.current = null;
        setRunKey((key) => key + 1);
      },
    }),
    [],
  );

  /* ------------------------- stage measurement ------------------------- */

  React.useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const next = { width: rect.width, height: rect.height };
      stageDimsRef.current = next;
      setStageDims((prev) =>
        prev.width === next.width && prev.height === next.height ? prev : next,
      );
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [preview, skip, done]);

  /* --------------------------- preloading ------------------------------ */

  React.useEffect(() => {
    if (preview || skip) return;
    let cancelled = false;
    setBooted(false);

    const list = imageKey ? imageKey.split("|") : [];
    const decoded: Promise<unknown>[] = list.map((src) => {
      const img = new Image();
      img.src = src;
      return typeof img.decode === "function"
        ? img.decode().catch(() => undefined)
        : Promise.resolve();
    });

    let loaded = 0;
    decoded.forEach((promise) => {
      void promise.then(() => {
        loaded += 1;
        if (mode === "pageLoad") {
          targetLoadRef.current = Math.max(
            targetLoadRef.current,
            0.45 + 0.45 * (loaded / Math.max(1, decoded.length)),
          );
        }
      });
    });

    const timeout = new Promise<void>((resolve) => {
      window.setTimeout(resolve, 1500);
    });

    void Promise.race([Promise.allSettled(decoded), timeout]).then(() => {
      if (cancelled) return;
      if (mode === "pageLoad") {
        targetLoadRef.current = Math.max(
          targetLoadRef.current,
          document.readyState === "complete" ? 1 : 0.94,
        );
      }
      setBooted(true);
    });

    return () => {
      cancelled = true;
    };
  }, [preview, skip, runKey, imageKey, mode]);

  /* ------------------- pageLoad event tracking ------------------------- */

  React.useEffect(() => {
    if (mode !== "pageLoad" || preview || skip) return;
    const bump = (value: number) => {
      targetLoadRef.current = Math.max(targetLoadRef.current, value);
    };
    if (document.readyState === "complete") bump(1);
    else if (document.readyState === "interactive") bump(0.75);
    else bump(0.45);

    const onReady = () => bump(0.75);
    const onLoad = () => bump(1);
    document.addEventListener("DOMContentLoaded", onReady);
    window.addEventListener("load", onLoad);
    return () => {
      document.removeEventListener("DOMContentLoaded", onReady);
      window.removeEventListener("load", onLoad);
    };
  }, [mode, preview, skip, runKey]);

  /* --------------------------- scroll lock ----------------------------- */

  React.useEffect(() => {
    if (!lockScroll || preview || skip || done) return;
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    const previousOverscroll = html.style.overscrollBehavior;
    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";

    const app = document.querySelector("main");
    const overlay = sceneRef.current;
    const inertTarget =
      app && overlay && !app.contains(overlay) ? app : null;
    inertTarget?.setAttribute("inert", "");

    return () => {
      html.style.overflow = previousOverflow;
      html.style.overscrollBehavior = previousOverscroll;
      inertTarget?.removeAttribute("inert");
    };
  }, [lockScroll, preview, skip, done, runKey]);

  /* ------------------- reduced-motion skip completion ------------------ */

  React.useEffect(() => {
    if (preview || !skipReduced || done) return;
    setDone(true);
    onCompleteRef.current?.();
  }, [preview, skipReduced, done]);

  /* -------------------------- master timeline -------------------------- */

  React.useEffect(() => {
    if (preview || skip || !booted || done) return;

    const rect = rootRef.current?.getBoundingClientRect();
    const W = Math.max(
      1,
      Math.round(rect?.width || stageDimsRef.current.width || 1465),
    );
    const H = Math.max(
      1,
      Math.round(rect?.height || stageDimsRef.current.height || 750),
    );
    const pitch = cardWidth + gap;
    const loop = Math.max(1, images.length * pitch);
    const initialOffset = 183 - pitch;
    let exitAt = Math.round((duration + holdTime) * 1000) / 1000;
    const preExitAt = Math.round(Math.max(1.2, exitAt - 0.15) * 1000) / 1000;

    exitStartedRef.current = false;
    exitBandsRef.current = null;
    completedRef.current = false;
    prevProgressRef.current = 0;
    reached100Ref.current = null;
    milestoneRef.current = 0;
    currentOffsetRef.current = initialOffset;
    frozenOffsetRef.current = initialOffset;
    if (rootRef.current) rootRef.current.style.opacity = "1";
    if (sceneRef.current) sceneRef.current.style.visibility = "visible";

    const rng = mulberry32(seed ?? Math.floor(Math.random() * 0x7fffffff));

    const start = performance.now();
    let pauseTotal = 0;
    let pausedAt: number | null = null;
    let raf = 0;
    let seekPaused = false;
    let seekTime = 0;

    const bursts = createBurstSchedule({
      rng,
      width: W,
      height: H,
      cardHeight,
      duration,
      preExitAt,
      glitch: glitchConfig,
    });

    let exitCentralAreaH = 0;
    let exitOuterAreaH = 0;
    let exitBands: BandSpec[] | null = null;
    let exitGlitches: ShredGlitchSpec[] = [];
    let exitWidth = W;
    let exitHeight = H;
    let exitOffset = initialOffset;

    const resetGlitch = () => {
      if (labelRef.current) {
        labelRef.current.style.filter = "";
        labelRef.current.style.transform = "";
      }
      if (counterRiseRef.current) counterRiseRef.current.style.filter = "";
      if (counterRedRef.current) counterRedRef.current.style.opacity = "0";
      if (counterCyanRef.current) counterCyanRef.current.style.opacity = "0";
      if (trackRef.current) trackRef.current.style.filter = "";
      lineRefs.current.forEach((el) => {
        if (el) el.style.opacity = "0";
      });
      blockRefs.current.forEach((el) => {
        if (el) el.style.opacity = "0";
      });
      smearBlockRefs.current.forEach((el) => {
        if (el) el.style.opacity = "0";
      });
      sliceWrapRefs.current.forEach((el) => {
        if (el) {
          el.style.opacity = "0";
          el.style.clipPath = "none";
        }
      });
      if (smearWrapRef.current) {
        smearWrapRef.current.style.opacity = "0";
        smearWrapRef.current.style.clipPath = "none";
      }
    };

    const setCounter = (
      progress: number,
      revealEase: number,
      scrambleDigit: number | null,
      shift = 0,
    ) => {
      const p = clamp(Math.round(progress), 0, 100);
      let text = String(p).padStart(3, "0");
      if (scrambleDigit != null) {
        const chars = text.split("");
        chars[clamp(scrambleDigit, 0, 2)] = "%";
        text = chars.join("");
      }
      const refs = [
        counterInnerRef.current,
        counterRedRef.current,
        counterCyanRef.current,
      ];
      refs.forEach((el) => {
        if (el && el.textContent !== text) el.textContent = text;
      });

      if (counterRiseRef.current) {
        const y = (1 - revealEase) * 100;
        counterRiseRef.current.style.transform = `translate3d(${shift.toFixed(
          2,
        )}px, ${y.toFixed(2)}%, 0)`;
      }
      if (counterWrapRef.current) {
        // Keep the clip only during the 0.2s rise. Afterwards the box must
        // never crop glyphs, descenders, or the chromatic copies.
        counterWrapRef.current.style.overflow =
          revealEase >= 1 ? "visible" : "hidden";
      }
    };

    const applyGlitch = (
      spec: BurstSpec,
      t: number,
      progress: number,
      revealEase: number,
    ) => {
      resetGlitch();
      const flicker = Math.floor(t * 60) % 2 === 0;
      const stripTop = H * 0.454 - cardHeight / 2;
      const stripBottom = H * 0.454 + cardHeight / 2;
      const scrambleActive = spec.scramble && t - spec.start < 2 / 60;
      const shift = spec.counterOnly ? spec.shift : 0;

      setCounter(
        progress,
        revealEase,
        scrambleActive ? spec.scrambleDigit : null,
        shift,
      );

      if (spec.chromatic) {
        const filter =
          "drop-shadow(-3px 0 rgba(255,0,0,0.9)) drop-shadow(3px 0 rgba(0,255,255,0.9))";
        if (labelRef.current) {
          labelRef.current.style.filter = filter;
          if (spec.counterOnly) {
            labelRef.current.style.transform = `translate3d(${spec.shift}px,0,0)`;
          }
        }
        if (counterRedRef.current) {
          counterRedRef.current.style.opacity = flicker ? "1" : "0.55";
          counterRedRef.current.style.transform = "translateX(-3px)";
        }
        if (counterCyanRef.current) {
          counterCyanRef.current.style.opacity = flicker ? "1" : "0.55";
          counterCyanRef.current.style.transform = "translateX(3px)";
        }
        // The pre-exit burst is deliberately counter/label-only. The strip
        // stays clean, so card edges never double up.
        if (!spec.counterOnly && trackRef.current) {
          trackRef.current.style.filter = filter;
        }
      }

      if (spec.lines) {
        lineRefs.current.forEach((el, i) => {
          const data = spec.linesData[i];
          if (!el || !data) {
            if (el) el.style.opacity = "0";
            return;
          }
          el.style.top = `${clamp(data.top, stripTop, stripBottom)}px`;
          el.style.left = `${data.left}px`;
          el.style.width = `${data.width}px`;
          el.style.height = `${data.height}px`;
          el.style.background = i % 2 === 0 ? "#ffffff" : "#000000";
          el.style.opacity = flicker ? "0.85" : "0.35";
        });
      }

      if (spec.blocks) {
        blockRefs.current.forEach((el, i) => {
          const data = spec.blocksData[i];
          if (!el || !data) {
            if (el) el.style.opacity = "0";
            return;
          }
          el.style.top = `${data.top}px`;
          el.style.left = `${data.left}px`;
          el.style.width = `${data.w}px`;
          el.style.height = `${data.h}px`;
          el.style.opacity = flicker ? "1" : "0.6";
        });
      }

      if (spec.slicer) {
        const off = currentOffsetRef.current;
        sliceWrapRefs.current.forEach((wrap, i) => {
          const data = spec.slicesData[i];
          const track = sliceTrackRefs.current[i];
          if (!wrap || !track || !data) {
            if (wrap) wrap.style.opacity = "0";
            return;
          }
          wrap.style.clipPath = `inset(${data.top}px 0 ${Math.max(
            0,
            H - data.top - data.height,
          )}px 0)`;
          wrap.style.opacity = flicker ? "1" : "0.75";
          track.style.transform = `translate3d(${off + data.shift}px,0,0)`;
        });
      }

      if (spec.smear) {
        const off = currentOffsetRef.current;
        if (smearWrapRef.current && smearTrackRef.current) {
          const data = spec.smearData;
          smearWrapRef.current.style.clipPath = `inset(${data.top}px 0 ${Math.max(
            0,
            H - data.top - data.height,
          )}px 0)`;
          smearWrapRef.current.style.opacity = "1";
          smearTrackRef.current.style.transformOrigin = `${data.origin}% 50%`;
          smearTrackRef.current.style.transform = `translate3d(${off}px,0,0) scaleX(${data.scale})`;
        }
      }
    };

    const wrapOffset = (value: number) => {
      const wrapped = ((value % loop) + loop) % loop - loop;
      return Object.is(wrapped, -0) ? 0 : wrapped;
    };

    const beginExit = () => {
      if (exitStartedRef.current) return;
      exitStartedRef.current = true;
      resetGlitch();
      onExitStartRef.current?.();
      if (oncePerSession) writeSessionFlag();

      exitWidth = W;
      exitHeight = H;
      const exitSeed = seed != null ? seed + 9973 : Math.floor(rng() * 1e9);
      const { bands, trails, glitches } = createBands({
        seed: exitSeed,
        width: exitWidth,
        height: exitHeight,
        exitDuration,
        exitTrails,
        cardHeight,
      });

      exitBands = bands;
      exitGlitches = glitches;
      exitOffset = wrapOffset(initialOffset - driftSpeed * exitAt);
      exitCentralAreaH = bands.reduce(
        (sum, band) => sum + (band.central ? band.area * exitHeight : 0),
        0,
      );
      exitOuterAreaH = bands.reduce(
        (sum, band) => sum + (!band.central ? band.area * exitHeight : 0),
        0,
      );

      frozenOffsetRef.current = exitOffset;
      currentOffsetRef.current = exitOffset;
      exitDimsRef.current = { width: exitWidth, height: exitHeight };
      exitBandsRef.current = bands;
      bandElsRef.current = new Array(bands.length).fill(null);
      trailElsRef.current = new Array(trails.length).fill(null);
      glitchElsRef.current = new Array(glitches.length).fill(null);
      bandBlockElsRef.current = bands.map((band) =>
        new Array(band.blocks.length).fill(null),
      );
      setExitState({
        bands,
        trails,
        glitches,
        offset: exitOffset,
        width: exitWidth,
        height: exitHeight,
      });
    };

    const finish = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      resetGlitch();
      setDone(true);
      onCompleteRef.current?.();
    };

    const updateExit = (elapsedExit: number) => {
      const bands = exitBands;
      if (!bands) return;
      if (!bandElsRef.current.some(Boolean)) return;
      if (sceneRef.current) sceneRef.current.style.visibility = "hidden";

      const u = clamp01(elapsedExit / Math.max(0.0001, exitDuration));
      const collapseProgress = clamp01((u - 0.45) / 0.5);
      const collapseEase = easeInOutQuad(collapseProgress);
      const centralScaleY = 1 - 0.95 * collapseEase;
      const centralOpacity =
        collapseProgress > 0.8
          ? clamp01(1 - (collapseProgress - 0.8) / 0.2)
          : 1;
      const coverage = exitCoverage(u);
      if (rootRef.current) {
        rootRef.current.dataset.exitCoverage = coverage.toFixed(4);
        rootRef.current.dataset.exitProgress = u.toFixed(4);
      }
      const targetRemaining = (1 - coverage) * exitHeight;
      const centralCoverage =
        exitCentralAreaH * centralScaleY * centralOpacity;
      const outerRemaining = clamp(
        targetRemaining - centralCoverage,
        0,
        exitOuterAreaH,
      );
      const outerRemovedTarget = exitOuterAreaH - outerRemaining;

      bands.forEach((band, index) => {
        const el = bandElsRef.current[index];
        if (!el) return;

        if (band.central) {
          const smearT = clamp01(u / 0.2);
          const scaleX = 1 + (band.smearScale - 1) * easeOutCubic(smearT);
          const x = band.jitter * collapseEase;
          const y = (exitHeight / 2 - band.center) * collapseEase;
          el.style.transformOrigin = `${band.originX}% 50%`;
          el.style.transform = `translate3d(${x.toFixed(
            2,
          )}px, ${y.toFixed(2)}px, 0) scale(${scaleX.toFixed(
            3,
          )}, ${centralScaleY.toFixed(3)})`;
          el.style.opacity = centralOpacity.toFixed(3);
          el.style.filter =
            u < 0.2
              ? "drop-shadow(-6px 0 rgba(255,0,0,0.85)) drop-shadow(6px 0 rgba(0,255,255,0.85)) blur(1px)"
              : "none";

          const blockActive =
            elapsedExit >= band.blockStart &&
            elapsedExit < band.blockStart + band.blockDur;
          const blockEls = bandBlockElsRef.current[index];
          if (blockEls) {
            const flicker = Math.floor(elapsedExit * 60) % 2 === 0;
            blockEls.forEach((blockEl) => {
              if (!blockEl) return;
              blockEl.style.opacity = blockActive
                ? flicker
                  ? "1"
                  : "0.45"
                : "0";
            });
          }
        } else {
          const bandAreaH = band.area * exitHeight;
          const before = band.outerCumBefore * exitHeight;
          const after = before + bandAreaH;
          let remainingFraction = 1;
          if (outerRemovedTarget >= after) remainingFraction = 0;
          else if (outerRemovedTarget > before) {
            remainingFraction = (after - outerRemovedTarget) / bandAreaH;
          }
          const removed = 1 - remainingFraction;
          const x = band.direction * exitWidth * removed;
          el.style.transformOrigin = "50% 50%";
          el.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
          el.style.opacity = "1";
          el.style.filter = "none";
        }

        const trailEl = trailElsRef.current[index];
        if (trailEl) {
          if (band.central) {
            trailEl.style.opacity = "0";
          } else {
            const bandAreaH = band.area * exitHeight;
            const before = band.outerCumBefore * exitHeight;
            const after = before + bandAreaH;
            let remainingFraction = 1;
            if (outerRemovedTarget >= after) remainingFraction = 0;
            else if (outerRemovedTarget > before) {
              remainingFraction = (after - outerRemovedTarget) / bandAreaH;
            }
            const removed = 1 - remainingFraction;
            const flicker = Math.floor(elapsedExit * 60) % 3 === 0 ? 0.35 : 1;
            const trailOpacity =
              removed > 0 && removed < 1
                ? (1 - Math.abs(removed - 0.5) * 1.4) * 0.75 * flicker
                : 0;
            trailEl.style.opacity = Math.max(0, trailOpacity).toFixed(3);
          }
        }
      });

      exitGlitches.forEach((glitch, index) => {
        const el = glitchElsRef.current[index];
        if (!el) return;
        const p = (u - glitch.start) / glitch.duration;
        if (p <= 0 || p >= 1) {
          el.style.opacity = "0";
          return;
        }
        const flicker = Math.floor(elapsedExit * 72 + index * 2) % 3;
        const beat = Math.sin(p * Math.PI);
        const opacity =
          glitch.opacity * beat * (flicker === 0 ? 0.45 : 1);
        const x = glitch.shift * easeOutCubic(p);
        el.style.opacity = opacity.toFixed(3);
        el.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
      });
    };

    let hadActiveBurst = false;

    const computeProgress = (t: number) => {
      if (mode === "timed") return progressCurve(t, duration);
      const target = targetLoadRef.current;
      let progress = Math.min(progressCurve(t, duration), target * 100);
      if (t > duration + 6) progress = 100;
      return progress;
    };

    const renderAt = (t: number) => {
      if (completedRef.current) return;

      if (fadeOnly) {
        /* --------- reduced motion: static frame + opacity fade -------- */
        setCounter(100, 1, null);
        if (barWrapRef.current) barWrapRef.current.style.opacity = "1";
        if (barFillRef.current) barFillRef.current.style.width = "100%";

        const fadeStart = 0.8;
        const fadeDuration = 0.4;
        if (t >= fadeStart && rootRef.current) {
          rootRef.current.style.opacity = clamp01(
            1 - (t - fadeStart) / fadeDuration,
          ).toFixed(3);
        }
        if (t >= fadeStart + fadeDuration && !seekPaused) finish();
        return;
      }

      if (
        t >= exitAt &&
        (mode !== "pageLoad" || reached100Ref.current != null)
      ) {
        /* ------------------------- exit phase ------------------------ */
        if (!exitStartedRef.current) beginExit();
        if (exitStartedRef.current) {
          updateExit(t - exitAt);
          if (t - exitAt >= exitDuration && !seekPaused) finish();
        }
        return;
      }

      /* ----------------------- loading phase ----------------------- */
      let progress = computeProgress(t);
      if (!seekPaused) {
        progress = Math.max(prevProgressRef.current, progress);
      }
      if (progress >= 99.999 && reached100Ref.current == null) {
        reached100Ref.current = t;
        if (mode === "pageLoad") {
          exitAt = Math.round((t + holdTime) * 1000) / 1000;
        }
      }
      prevProgressRef.current = progress;

      const reveal = clamp01((t - 0.18) / 0.2);
      const revealEase = easeOutCubic(reveal);

      const offset = wrapOffset(initialOffset - driftSpeed * t);
      currentOffsetRef.current = offset;
      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${offset}px,0,0)`;
      }

      const active = glitchConfig.enabled
        ? (bursts.find((burst) => t >= burst.start && t < burst.end) ?? null)
        : null;

      if (active) {
        applyGlitch(active, t, progress, revealEase);
        if (rootRef.current) {
          rootRef.current.dataset.burstStart = String(active.start);
          rootRef.current.dataset.burstEnd = String(active.end);
        }
        hadActiveBurst = true;
      } else {
        if (hadActiveBurst) {
          resetGlitch();
          hadActiveBurst = false;
        }
        if (rootRef.current) {
          delete rootRef.current.dataset.burstStart;
          delete rootRef.current.dataset.burstEnd;
        }
        setCounter(progress, revealEase, null);
      }

      if (barWrapRef.current) {
        barWrapRef.current.style.opacity = revealEase.toFixed(3);
      }
      if (barFillRef.current) {
        barFillRef.current.style.width = `${clamp(progress, 0, 100)}%`;
      }

      const p = clamp(Math.round(progress), 0, 100);
      const milestone =
        p >= 100 ? 100 : p >= 75 ? 75 : p >= 50 ? 50 : p >= 25 ? 25 : 0;
      if (milestone !== milestoneRef.current) {
        milestoneRef.current = milestone;
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = `${milestone}% loaded`;
        }
      }
    };

    const frame = (now: number) => {
      if (seekPaused || pausedAt != null || completedRef.current) return;
      const elapsed = Math.max(0, (now - start - pauseTotal) / 1000);
      renderAt(elapsed);
      if (!completedRef.current) {
        raf = window.requestAnimationFrame(frame);
      }
    };

    const resetExitView = () => {
      if (!exitStartedRef.current) return;
      exitStartedRef.current = false;
      exitBands = null;
      exitBandsRef.current = null;
      bandElsRef.current = [];
      trailElsRef.current = [];
      glitchElsRef.current = [];
      bandBlockElsRef.current = [];
      setExitState(null);
      setDone(false);
      completedRef.current = false;
      if (sceneRef.current) sceneRef.current.style.visibility = "visible";
      if (rootRef.current) {
        rootRef.current.style.opacity = "1";
        delete rootRef.current.dataset.exitCoverage;
        delete rootRef.current.dataset.exitProgress;
      }
    };

    // Deterministic test clock. It jumps the single master timeline to an
    // absolute second, freezes it, and resolves after React has committed the
    // exit band DOM so pixel assertions run against the real frame.
    const seekTo = (time: number) => {
      const t = Math.max(0, time);
      if (t < exitAt) resetExitView();
      seekPaused = true;
      seekTime = t;
      renderAt(t);
      return new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => {
          renderAt(seekTime);
          window.requestAnimationFrame(() => {
            renderAt(seekTime);
            resolve();
          });
        });
      });
    };

    type TimelineWindow = Window & {
      __preloaderSeek?: (time: number) => Promise<void>;
      __preloaderTimeline?: {
        duration: number;
        holdTime: number;
        exitAt: number;
        exitDuration: number;
        burstCount: number;
        burstStarts: number[];
        counterAt: (time: number) => number;
      };
    };
    const timelineWindow = window as TimelineWindow;
    timelineWindow.__preloaderSeek = seekTo;
    timelineWindow.__preloaderTimeline = {
      duration,
      holdTime,
      exitAt,
      exitDuration,
      burstCount: bursts.length,
      burstStarts: bursts.map((burst) => burst.start),
      counterAt: (time: number) => progressCurve(time, duration),
    };

    const onVisibility = () => {
      if (document.hidden) {
        pausedAt = performance.now();
      } else if (pausedAt != null) {
        pauseTotal += performance.now() - pausedAt;
        pausedAt = null;
        if (!seekPaused) raf = window.requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    raf = window.requestAnimationFrame(frame);

    return () => {
      window.cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      if (timelineWindow.__preloaderSeek === seekTo) {
        delete timelineWindow.__preloaderSeek;
      }
      if (timelineWindow.__preloaderTimeline) {
        delete timelineWindow.__preloaderTimeline;
      }
      resetGlitch();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preview, skip, booted, done, runKey, fadeOnly, imageKey]);

  /* ----------------------------- rendering ----------------------------- */

  if (skip || (done && !preview)) {
    return null;
  }

  const pitch = cardWidth + gap;
  const loop = Math.max(1, images.length * pitch);
  const initialOffset = 183 - pitch;
  const repeats = Math.max(2, Math.ceil(2600 / loop) + 1);

  const trackCards: React.ReactNode[] = [];
  for (let r = 0; r < repeats; r += 1) {
    images.forEach((item, i) => {
      trackCards.push(
        <CardImage
          key={`${r}-${i}`}
          item={item}
          width={cardWidth}
          height={cardHeight}
          radius={radius}
          foreground={foreground}
        />,
      );
    });
  }

  const labelStyle: React.CSSProperties = {
    position: "absolute",
    left: 34,
    top: 34,
    fontSize: 12,
    lineHeight: 1,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    fontFamily:
      '"JetBrains Mono", "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
    color: foreground,
    zIndex: 6,
  };

  const stripBoxStyle: React.CSSProperties = {
    position: "absolute",
    top: "45.4%",
    left: 0,
    right: 0,
    height: cardHeight,
    transform: "translateY(-50%)",
  };

  const trackStyle: React.CSSProperties = {
    position: "absolute",
    left: 0,
    top: 0,
    display: "flex",
    gap,
    width: "max-content",
    willChange: "transform",
  };

  return (
    <div
      ref={rootRef}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-slot="preloader-pro-v1"
      data-phase={
        done ? "done" : exitState ? "exiting" : booted ? "loading" : "booting"
      }
      className={cn(className)}
      style={{
        position: preview ? "absolute" : "fixed",
        inset: 0,
        zIndex: preview ? 1 : 99999,
        background: exitState ? "transparent" : background,
        color: foreground,
        fontFamily,
        overflow: "hidden",
        isolation: "isolate",
      }}
    >
      <span ref={liveRegionRef} style={SR_ONLY}>
        0% loaded
      </span>

      <div
        ref={sceneRef}
        aria-hidden="true"
        style={{ position: "absolute", inset: 0 }}
      >
        {/* Main drifting strip */}
        <div style={stripBoxStyle}>
          <div
            ref={trackRef}
            style={{
              ...trackStyle,
              transform: `translate3d(${initialOffset}px,0,0)`,
            }}
          >
            {trackCards}
          </div>
        </div>

        {/* Horizontal glitch slices (clones of the strip) */}
        {[0, 1].map((i) => (
          <div
            key={`slice-${i}`}
            ref={(el) => {
              sliceWrapRefs.current[i] = el;
            }}
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0,
              zIndex: 2,
              pointerEvents: "none",
            }}
          >
            <div style={stripBoxStyle}>
              <div
                ref={(el) => {
                  sliceTrackRefs.current[i] = el;
                }}
                style={trackStyle}
              >
                {trackCards}
              </div>
            </div>
          </div>
        ))}

        {/* Pixel smear band */}
        <div
          ref={smearWrapRef}
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0,
            zIndex: 3,
            pointerEvents: "none",
            filter: "blur(0.6px)",
          }}
        >
          <div style={stripBoxStyle}>
            <div ref={smearTrackRef} style={trackStyle}>
              {trackCards}
            </div>
          </div>
        </div>

        {/* Corner label */}
        <div ref={labelRef} style={labelStyle}>
          {label}
        </div>

        {/* Counter */}
        <div
          ref={counterWrapRef}
          style={{
            position: "absolute",
            left: 34,
            bottom: 29,
            lineHeight: 1,
            paddingBottom: "0.14em",
            marginBottom: "-0.14em",
            overflow: preview ? "visible" : "hidden",
            whiteSpace: "nowrap",
            zIndex: 6,
          }}
        >
          <div
            ref={counterRiseRef}
            style={{
              position: "relative",
              transform: preview ? "translateY(0)" : "translateY(100%)",
              willChange: "transform",
            }}
          >
            <span
              ref={counterInnerRef}
              style={{
                display: "block",
                fontFamily,
                fontWeight: 400,
                fontSize: counterFont,
                lineHeight: 1,
                letterSpacing: "-0.01em",
                color: foreground,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {preview ? "066" : "000"}
            </span>
            <span
              ref={counterRedRef}
              aria-hidden="true"
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                display: "block",
                fontFamily,
                fontWeight: 400,
                fontSize: counterFont,
                lineHeight: 1,
                letterSpacing: "-0.01em",
                color: "#ff0000",
                fontVariantNumeric: "tabular-nums",
                mixBlendMode: "screen",
                opacity: 0,
                pointerEvents: "none",
              }}
            >
              {preview ? "066" : "000"}
            </span>
            <span
              ref={counterCyanRef}
              aria-hidden="true"
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                display: "block",
                fontFamily,
                fontWeight: 400,
                fontSize: counterFont,
                lineHeight: 1,
                letterSpacing: "-0.01em",
                color: "#00ffff",
                fontVariantNumeric: "tabular-nums",
                mixBlendMode: "screen",
                opacity: 0,
                pointerEvents: "none",
              }}
            >
              {preview ? "066" : "000"}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div
          ref={barWrapRef}
          style={{
            position: "absolute",
            left: 35,
            right: 35,
            bottom: 34,
            height: 1,
            background: barTrack,
            zIndex: 6,
            opacity: preview ? 1 : 0,
          }}
        >
          <div
            ref={barFillRef}
            style={{
              height: "100%",
              width: preview ? "66%" : "0%",
              background: foreground,
              willChange: "width",
            }}
          />
        </div>

        {/* Interference lines */}
        {[0, 1, 2].map((i) => (
          <div
            key={`line-${i}`}
            ref={(el) => {
              lineRefs.current[i] = el;
            }}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 0,
              height: 1,
              background: "#ffffff",
              opacity: 0,
              zIndex: 9,
              pointerEvents: "none",
            }}
          />
        ))}

        {/* Distortion / dark blocks */}
        {[0, 1, 2, 3].map((i) => (
          <div
            key={`block-${i}`}
            ref={(el) => {
              blockRefs.current[i] = el;
            }}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 0,
              height: 0,
              background,
              opacity: 0,
              zIndex: 9,
              pointerEvents: "none",
            }}
          />
        ))}

        {/* Flat colour blocks for the smear burst */}
        {[0, 1, 2].map((i) => (
          <div
            key={`smear-color-${i}`}
            ref={(el) => {
              smearBlockRefs.current[i] = el;
            }}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 0,
              height: 0,
              opacity: 0,
              zIndex: 9,
              pointerEvents: "none",
            }}
          />
        ))}
      </div>

      {/* ------------------------- shred exit ------------------------- */}
      {exitState && (
        <div
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, zIndex: 20 }}
        >
          {exitState.bands.map((band, index) => (
            <div
              key={`band-${index}`}
              ref={(el) => {
                bandElsRef.current[index] = el;
              }}
              style={{
                position: "absolute",
                left: 0,
                top: band.top,
                width: "100%",
                height: band.height,
                overflow: "hidden",
                background,
                willChange: "transform, opacity, filter",
                backfaceVisibility: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: -band.top,
                  width: "100%",
                  height: exitState.height,
                }}
              >
                <StaticScene
                  images={images}
                  label={label}
                  offset={exitState.offset}
                  progress={100}
                  background={background}
                  foreground={foreground}
                  barTrack={barTrack}
                  fontFamily={fontFamily}
                  counterFont={counterFont}
                  cardWidth={cardWidth}
                  cardHeight={cardHeight}
                  gap={gap}
                  radius={radius}
                  viewportWidth={exitState.width}
                />
              </div>

              {band.blocks.map((block, blockIndex) => (
                <div
                  key={`band-block-${blockIndex}`}
                  ref={(el) => {
                    const list = bandBlockElsRef.current;
                    if (!list[index]) list[index] = [];
                    list[index]![blockIndex] = el;
                  }}
                  style={{
                    position: "absolute",
                    left: block.left,
                    top: block.top,
                    width: block.size,
                    height: block.size,
                    background: block.color,
                    opacity: 0,
                    pointerEvents: "none",
                  }}
                />
              ))}
            </div>
          ))}

          {exitState.trails.map((trail, index) => (
            <div
              key={`trail-${index}`}
              ref={(el) => {
                trailElsRef.current[index] = el;
              }}
              style={{
                position: "absolute",
                top: trail.top,
                left: trail.left,
                width: trail.width,
                height: trail.height,
                background: trailColor,
                opacity: 0,
                pointerEvents: "none",
                willChange: "opacity",
              }}
            />
          ))}

          {exitState.glitches.map((glitch, index) => (
            <div
              key={`shred-glitch-${index}`}
              ref={(el) => {
                glitchElsRef.current[index] = el;
              }}
              style={{
                position: "absolute",
                top: glitch.top,
                left: 0,
                width: "100%",
                height: glitch.height,
                background: glitch.color,
                opacity: 0,
                pointerEvents: "none",
                willChange: "transform, opacity",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default PreloaderProV1;
