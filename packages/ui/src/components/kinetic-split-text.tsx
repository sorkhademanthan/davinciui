"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/*                                                                     */
/* Kinetic Split Text — premium staggered typography. Text is split    */
/* into characters, words, or lines. Every unit lives inside an        */
/* overflow-hidden clip wrapper and animates with the Web Animations   */
/* API (transform / opacity / filter only — GPU friendly, zero React   */
/* re-renders per frame).                                              */
/* ------------------------------------------------------------------ */

export type KineticSplitMode = "characters" | "words" | "lines";
export type KineticDirection = "up" | "down" | "left" | "right";
export type KineticStaggerPattern =
  | "forward"
  | "reverse"
  | "center"
  | "edges"
  | "random";
export type KineticPreset =
  | "reveal"
  | "blur-rise"
  | "flip"
  | "elastic"
  | "scatter"
  | "cinematic"
  | "custom";
export type KineticTrigger =
  | "inView"
  | "hover"
  | "click"
  | "load"
  | "manual"
  | "scroll";
export type KineticHoverBehavior = "stay" | "reverse" | "reset";

import {
  KINETIC_VARIANT_META,
  type KineticVariant,
} from "./kinetic-split-text-variants";

export {
  KINETIC_VARIANT_META,
  KINETIC_VARIANTS,
  type KineticVariant,
} from "./kinetic-split-text-variants";

export interface KineticSplitTextHandle {
  /** Play (or replay) the entrance sequence. Cancels in-flight work first. */
  play: () => void;
  /** Cancel animation and snap to the final resting state. */
  reset: () => void;
  /**
   * Scrub the timeline directly. `progress` is 0 (initial) → 1 (final).
   * Used by scroll mode internally; also available for manual control.
   */
  setProgress: (progress: number) => void;
}

export interface KineticSplitTextProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Full text. Use \n for explicit line breaks in lines mode. */
  text?: string;
  /** Granularity of the split. @default "words" */
  split?: KineticSplitMode;
  /** Motion preset. "custom" uses the explicit motion props below. @default "flip" */
  preset?: KineticPreset;
  /** Reveal direction (works with the clipping architecture). @default "up" */
  direction?: KineticDirection;
  /** Order in which units enter. @default "forward" */
  staggerPattern?: KineticStaggerPattern;
  /** Seed for the deterministic "random" pattern. @default 7 */
  randomSeed?: number;
  /** Per-unit stagger in seconds. @default 0.07 */
  stagger?: number;
  /** Per-unit duration in seconds. @default 0.75 */
  duration?: number;
  /** Base delay before the sequence starts, in seconds. @default 0 */
  delay?: number;
  /** How the animation is triggered. @default "inView" */
  trigger?: KineticTrigger;
  /**
   * Motion choreography. The default selects the polished editorial reveal.
   * Note: passing a legacy `preset` other than "flip" takes precedence and
   * reproduces the exact legacy behavior (deprecated — prefer `variant`).
   * @default "editorial-rise"
   */
  variant?: KineticVariant;
  /** For inView: animate only the first entry. @default true */
  once?: boolean;
  /** Fraction visible before inView fires (0–1). @default 0.2 */
  threshold?: number;
  /** IntersectionObserver root margin. @default "0px" */
  rootMargin?: string;
  /** Pointer-leave behavior for hover mode. @default "stay" */
  hoverBehavior?: KineticHoverBehavior;
  /** Extra initial X offset (px). Added to the preset/direction offset. */
  translateX?: number;
  /** Extra initial Y offset (px). Added to the preset/direction offset. */
  translateY?: number;
  /** Initial scale. @default preset-defined */
  initialScale?: number;
  /** Final scale. @default 1 */
  finalScale?: number;
  /** Initial flat (Z-axis) rotation in degrees. @default preset-defined */
  initialRotation?: number;
  /** Final flat rotation in degrees. @default 0 */
  finalRotation?: number;
  /** Initial X-axis rotation in degrees (needs perspective). @default preset-defined */
  rotationX?: number;
  /** Initial Y-axis rotation in degrees (needs perspective). @default preset-defined */
  rotationY?: number;
  /** Initial blur in px (0 disables the blur track). @default preset-defined */
  blur?: number;
  /** Initial opacity (0–1). @default preset-defined */
  opacity?: number;
  /** Perspective distance in px for 3D rotation. @default 800 */
  perspective?: number;
  /** Scroll-mode: viewport band where progress hits 0. @default "top 85%" */
  scrollStart?: string;
  /** Scroll-mode: viewport band where progress hits 1. @default "top 40%" */
  scrollEnd?: string;
  /** Scroll-mode smoothing (0 = direct, higher = smoother). @default 0.12 */
  scrollSmoothing?: number;
  fontFamily?: string;
  fontSize?: number | string;
  fontWeight?: number | string;
  fontStyle?: "normal" | "italic";
  lineHeight?: number | string;
  letterSpacing?: number | string;
  textAlign?: "left" | "center" | "right";
  textTransform?: React.CSSProperties["textTransform"];
  color?: string;
  ariaLabel?: string;
}

export const KINETIC_SPLIT_TEXT_DEFAULTS = {
  text: "Motion makes it memorable.",
  split: "words",
  preset: "flip",
  direction: "up",
  staggerPattern: "forward",
  randomSeed: 7,
  stagger: 0.07,
  duration: 0.75,
  delay: 0,
  trigger: "inView",
  variant: "editorial-rise",
  once: true,
  threshold: 0.2,
  rootMargin: "0px",
  hoverBehavior: "stay",
  perspective: 800,
  scrollStart: "top 85%",
  scrollEnd: "top 40%",
  scrollSmoothing: 0.12,
  fontFamily: "Inter, sans-serif",
  fontWeight: 800,
  lineHeight: 1.04,
  letterSpacing: "-0.02em",
  textAlign: "center",
} as const;

const EASE_OUT_EXPO = "cubic-bezier(0.22, 1, 0.36, 1)";
const EASE_ELASTIC = "cubic-bezier(0.22, 1.25, 0.36, 1)";
const EASE_CINEMATIC = "cubic-bezier(0.25, 1, 0.4, 1)";
/* Layered variant easing — translation runs on the main expo curve while
   overshoot/settle phases use a subtle spring that never gets cartoonish. */
const EASE_VARIANT = "cubic-bezier(0.16, 1, 0.3, 1)";
const EASE_SETTLE = "cubic-bezier(0.34, 1.25, 0.64, 1)";

const SHUTTER_SLICES = 4;
const SHUTTER_SLICE_STAGGER = 0.04;

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

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

/** Deterministic per-unit jitter for the scatter preset. */
function scatterFor(index: number, seed: number) {
  const rand = mulberry32((seed * 2654435761 + index * 40503) >>> 0);
  return {
    x: Math.round((rand() - 0.5) * 96),
    y: Math.round((rand() - 0.5) * 110),
    r: Math.round((rand() - 0.5) * 30),
  };
}

function splitGraphemes(value: string): string[] {
  if (typeof Intl.Segmenter === "function") {
    try {
      const segmenter = new Intl.Segmenter(undefined, {
        granularity: "grapheme",
      });
      return Array.from(segmenter.segment(value), (part) => part.segment);
    } catch {
      /* fall through */
    }
  }
  return Array.from(value);
}

interface KineticUnit {
  key: string;
  /** Visible content for words/characters; full line text for lines mode. */
  content: string;
  /** True for word units (kept on one line). */
  isWord: boolean;
}

/** Split raw text into animatable units, preserving spaces and newlines. */
function buildUnits(text: string, split: KineticSplitMode): KineticUnit[] {
  const safe = text ?? "";
  if (split === "lines") {
    const lines = safe.split("\n");
    return lines.map((content, i) => ({
      key: `line-${i}`,
      content,
      isWord: false,
    }));
  }
  if (split === "characters") {
    const units: KineticUnit[] = [];
    // Group by word so wrapping never breaks a word apart.
    const words = safe.split(/(\s+)/u).filter((p) => p.length > 0);
    words.forEach((word, wi) => {
      if (/^\s+$/u.test(word)) {
        units.push({ key: `space-${wi}`, content: word, isWord: false });
      } else {
        splitGraphemes(word).forEach((g, gi) => {
          units.push({ key: `char-${wi}-${gi}`, content: g, isWord: true });
        });
      }
    });
    return units;
  }
  // words
  const parts = safe.split(/(\s+)/u).filter((p) => p.length > 0);
  return parts.map((content, i) => ({
    key: /^\s+$/u.test(content) ? `space-${i}` : `word-${i}`,
    content,
    isWord: !/^\s+$/u.test(content),
  }));
}

/** Stagger order rank (0 = first) for each unit index. */
function orderRanks(
  count: number,
  pattern: KineticStaggerPattern,
  seed: number,
): number[] {
  if (count <= 1) return count === 0 ? [] : [0];
  const rank = new Array<number>(count);
  const order: number[] = Array.from({ length: count }, (_, i) => i);
  if (pattern === "reverse") order.reverse();
  else if (pattern === "center") {
    const mid = (count - 1) / 2;
    order.sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid));
  } else if (pattern === "edges") {
    const mid = (count - 1) / 2;
    order.sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid));
    order.reverse();
  } else if (pattern === "random") {
    const rand = mulberry32(seed >>> 0 || 1);
    for (let i = count - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [order[i], order[j]] = [order[j]!, order[i]!];
    }
  }
  order.forEach((unitIndex, position) => {
    rank[unitIndex] = position;
  });
  return rank;
}

/* ------------------------------------------------------------------ */
/* Variant engine                                                    */
/*                                                                     */
/* Every choreography — the five variants plus the legacy presets —  */
/* is expressed as per-unit keyframe phases. WAAPI playback and the   */
/* progress sampler (scroll / hover / setProgress) both derive from   */
/* the same phases, so scrubbing, hovering, and playing always agree. */
/* ------------------------------------------------------------------ */

interface VLength {
  v: number;
  u: "%" | "px";
  /** Extra px folded in via calc() (legacy translateX/translateY offsets). */
  add?: number;
}

function lenStr(l: VLength): string {
  if (l.add) return `calc(${l.v}${l.u} + ${l.add}px)`;
  return `${l.v}${l.u}`;
}

interface VState {
  x: VLength;
  y: VLength;
  sx: number;
  sy: number;
  rx: number;
  ry: number;
  rz: number;
  sk: number;
  o: number;
  b: number;
  /** letter-spacing delta in em (blur-rush tracking). */
  ls: number;
}

interface VPhase {
  at: number;
  s: VState;
}

interface UnitDef {
  phases: VPhase[];
  /** Easing per segment (WAAPI per-keyframe easing). */
  segEasing: string[];
  /** Legacy presets use one uniform easing, exactly as before. */
  uniformEasing?: string;
  /** Override perspective when the choreography needs depth. */
  perspective?: number;
  /** Transform origin for the units. */
  origin: string;
}

function pct(v: number): VLength {
  return { v, u: "%" };
}
function px(v: number): VLength {
  return { v, u: "px" };
}
function state(partial: Partial<VState>): VState {
  return {
    x: pct(0),
    y: pct(0),
    sx: 1,
    sy: 1,
    rx: 0,
    ry: 0,
    rz: 0,
    sk: 0,
    o: 1,
    b: 0,
    ls: 0,
    ...partial,
  };
}
/** Depth stages for depth-cascade, cycled deterministically by rank. */
const DEPTH_STAGES = [
  { s: 0.55, y: 50, b: 18 },
  { s: 1.35, y: 70, b: 15 },
  { s: 0.72, y: 90, b: 20 },
];

function transformOfState(s: VState): string {
  const parts = [`translate3d(${lenStr(s.x)}, ${lenStr(s.y)}, 0)`];
  if (s.rx) parts.push(`rotateX(${s.rx}deg)`);
  if (s.ry) parts.push(`rotateY(${s.ry}deg)`);
  if (s.rz) parts.push(`rotate(${s.rz}deg)`);
  if (s.sk) parts.push(`skewX(${s.sk}deg)`);
  if (s.sx !== 1 || s.sy !== 1) {
    parts.push(s.sx === s.sy ? `scale(${s.sx})` : `scale(${s.sx}, ${s.sy})`);
  }
  return parts.join(" ");
}

function filterOfState(s: VState, isFinal: boolean): string {
  if (s.b > 0) return `blur(${s.b}px)`;
  return isFinal ? "none" : "blur(0px)";
}

/** Piecewise-linear sample of a unit definition at eased progress e. */
function sampleDef(def: UnitDef, e: number): {
  transform: string;
  opacity: number;
  filter: string;
  letterSpacing: string;
} {
  const phases = def.phases;
  const t = Math.min(1, Math.max(0, e));
  let i = 0;
  while (i < phases.length - 2 && t > phases[i + 1]!.at) i += 1;
  const a = phases[i]!;
  const b = phases[i + 1]!;
  const span = Math.max(1e-6, b.at - a.at);
  const k = Math.min(1, Math.max(0, (t - a.at) / span));
  const lerp = (x: number, y: number) => x + (y - x) * k;
  const s: VState = {
    x: { v: lerp(a.s.x.v, b.s.x.v), u: a.s.x.u, add: lerp(a.s.x.add ?? 0, b.s.x.add ?? 0) || undefined },
    y: { v: lerp(a.s.y.v, b.s.y.v), u: a.s.y.u, add: lerp(a.s.y.add ?? 0, b.s.y.add ?? 0) || undefined },
    sx: lerp(a.s.sx, b.s.sx),
    sy: lerp(a.s.sy, b.s.sy),
    rx: lerp(a.s.rx, b.s.rx),
    ry: lerp(a.s.ry, b.s.ry),
    rz: lerp(a.s.rz, b.s.rz),
    sk: lerp(a.s.sk, b.s.sk),
    o: lerp(a.s.o, b.s.o),
    b: lerp(a.s.b, b.s.b),
    ls: lerp(a.s.ls, b.s.ls),
  };
  const done = t >= 1;
  return {
    transform: transformOfState(s),
    opacity: s.o,
    filter: filterOfState(s, done),
    letterSpacing: s.ls ? `${s.ls.toFixed(4)}em` : "0em",
  };
}

/** WAAPI keyframes built from the same phases the sampler reads. */
function keyframesOf(def: UnitDef): Keyframe[] {
  const last = def.phases.length - 1;
  return def.phases.map((p, i) => {
    const kf: Keyframe = {
      transform: transformOfState(p.s),
      opacity: p.s.o,
      filter: filterOfState(p.s, i === last),
      offset: p.at,
    };
    if (p.s.ls) kf.letterSpacing = `${p.s.ls}em`;
    if (i < last) kf.easing = def.uniformEasing ?? def.segEasing[i] ?? EASE_VARIANT;
    return kf;
  });
}

interface ResolvedMotion {
  translateX: string;
  translateY: string;
  scale: number;
  rotation: number;
  rotationX: number;
  rotationY: number;
  blur: number;
  opacity: number;
  easing: string;
  elastic: boolean;
}

function resolveMotion(props: {
  preset: KineticPreset;
  direction: KineticDirection;
  translateX?: number;
  translateY?: number;
  initialScale?: number;
  initialRotation?: number;
  rotationX?: number;
  rotationY?: number;
  blur?: number;
  opacity?: number;
}): ResolvedMotion {
  const {
    preset,
    direction,
    translateX,
    translateY,
    initialScale,
    initialRotation,
    rotationX,
    rotationY,
    blur,
    opacity,
  } = props;

  // Directional clip offsets (percentages of the unit's own box).
  let dirX = "0%";
  let dirY = "0%";
  if (direction === "up") dirY = "110%";
  else if (direction === "down") dirY = "-110%";
  else if (direction === "left") dirX = "110%";
  else if (direction === "right") dirX = "-110%";

  const px = (v: number | undefined) => (v ? `${v}px` : null);
  const join = (a: string, b: string | null) =>
    b ? (a === "0%" ? b : `calc(${a} + ${b})`) : a;

  switch (preset) {
    case "reveal":
      return {
        translateX: join(dirX, px(translateX)),
        translateY: join(dirY, px(translateY)),
        scale: initialScale ?? 1,
        rotation: initialRotation ?? 0,
        rotationX: rotationX ?? 0,
        rotationY: rotationY ?? 0,
        blur: blur ?? 0,
        opacity: opacity ?? 0,
        easing: EASE_OUT_EXPO,
        elastic: false,
      };
    case "blur-rise":
      return {
        translateX: join("0%", px(translateX)),
        translateY: join("40px", px(translateY)),
        scale: initialScale ?? 1,
        rotation: initialRotation ?? 0,
        rotationX: rotationX ?? 0,
        rotationY: rotationY ?? 0,
        blur: blur ?? 12,
        opacity: opacity ?? 0,
        easing: EASE_OUT_EXPO,
        elastic: false,
      };
    case "elastic":
      return {
        translateX: join(direction === "left" || direction === "right" ? dirX : "0%", px(translateX)),
        translateY: join(direction === "left" || direction === "right" ? "0%" : "120%", px(translateY)),
        scale: initialScale ?? 0.85,
        rotation: initialRotation ?? 0,
        rotationX: rotationX ?? 0,
        rotationY: rotationY ?? 0,
        blur: blur ?? 0,
        opacity: opacity ?? 0,
        easing: EASE_ELASTIC,
        elastic: true,
      };
    case "scatter":
      // Base is convergence-agnostic; per-unit jitter is applied at build.
      return {
        translateX: join("0%", px(translateX)),
        translateY: join("0%", px(translateY)),
        scale: initialScale ?? 0.8,
        rotation: initialRotation ?? 0,
        rotationX: rotationX ?? 0,
        rotationY: rotationY ?? 0,
        blur: blur ?? 6,
        opacity: opacity ?? 0,
        easing: EASE_OUT_EXPO,
        elastic: false,
      };
    case "cinematic":
      return {
        translateX: join("0%", px(translateX)),
        translateY: join("25px", px(translateY)),
        scale: initialScale ?? 1.08,
        rotation: initialRotation ?? 0,
        rotationX: rotationX ?? 0,
        rotationY: rotationY ?? 0,
        blur: blur ?? 16,
        opacity: opacity ?? 0,
        easing: EASE_CINEMATIC,
        elastic: false,
      };
    case "custom":
      return {
        translateX: join(dirX, px(translateX)),
        translateY: join(dirY, px(translateY)),
        scale: initialScale ?? 1,
        rotation: initialRotation ?? 0,
        rotationX: rotationX ?? 0,
        rotationY: rotationY ?? 0,
        blur: blur ?? 0,
        opacity: opacity ?? 0,
        easing: EASE_OUT_EXPO,
        elastic: false,
      };
    case "flip":
    default:
      return {
        translateX: join(direction === "left" || direction === "right" ? dirX : "0%", px(translateX)),
        translateY: join(direction === "left" || direction === "right" ? "0%" : dirY, px(translateY)),
        scale: initialScale ?? 0.92,
        rotation: initialRotation ?? 0,
        rotationX: rotationX ?? -35,
        rotationY: rotationY ?? 0,
        blur: blur ?? 10,
        opacity: opacity ?? 0,
        easing: EASE_OUT_EXPO,
        elastic: false,
      };
  }
}

/** Parse a legacy length string ("110%", "40px", "calc(110% + 5px)") into parts. */
function parseLen(s: string): VLength {
  const t = s.trim();
  let m = /^([-\d.]+)%$/.exec(t);
  if (m) return { v: parseFloat(m[1]!), u: "%" };
  m = /^([-\d.]+)px$/.exec(t);
  if (m) return { v: parseFloat(m[1]!), u: "px" };
  m = /^calc\((.+)\s\+\s([-\d.]+)px\)$/.exec(t);
  if (m) {
    const base = parseLen(m[1]!);
    return { v: base.v, u: base.u, add: (base.add ?? 0) + parseFloat(m[2]!) };
  }
  return { v: 0, u: "%" };
}

/**
 * Legacy presets (any explicit `preset` other than "flip") reproduce the
 * exact previous behavior, expressed as phase definitions so WAAPI
 * playback and progress scrubbing share one code path.
 */
function legacyDefFromResolved(
  m: ResolvedMotion,
  opts: {
    preset: KineticPreset;
    seed: number;
    rank: number;
    finalScale: number;
    finalRotation: number;
  },
): UnitDef {
  const origin = m.rotationX || m.rotationY ? "center bottom" : "center center";
  const fin: VState = state({
    sx: opts.finalScale,
    sy: opts.finalScale,
    rz: opts.finalRotation,
  });
  if (opts.preset === "scatter") {
    const j = scatterFor(opts.rank, opts.seed);
    const init: VState = state({
      x: px(j.x),
      y: px(j.y),
      sx: m.scale,
      sy: m.scale,
      rz: m.rotation + j.r,
      rx: m.rotationX,
      ry: m.rotationY,
      o: m.opacity,
      b: m.blur,
    });
    return { phases: [{ at: 0, s: init }, { at: 1, s: fin }], segEasing: [], uniformEasing: m.easing, origin };
  }
  const init: VState = state({
    x: parseLen(m.translateX),
    y: parseLen(m.translateY),
    sx: m.scale,
    sy: m.scale,
    rz: m.rotation,
    rx: m.rotationX,
    ry: m.rotationY,
    o: m.opacity,
    b: m.blur,
  });
  if (opts.preset === "elastic") {
    // Previous 3-stop elastic shape: full travel, early settle, exact final.
    return {
      phases: [
        { at: 0, s: init },
        { at: 0.72, s: state({ o: 1 }) },
        { at: 1, s: fin },
      ],
      segEasing: [],
      uniformEasing: m.easing,
      origin,
    };
  }
  return {
    phases: [
      { at: 0, s: init },
      { at: 1, s: fin },
    ],
    segEasing: [],
    uniformEasing: m.easing,
    origin,
  };
}

/** Explicit line number per animatable slot (for blur-rush alternation). */
function slotLineNumbers(units: KineticUnit[], split: KineticSplitMode): number[] {
  const out: number[] = [];
  if (split === "lines") {
    units.forEach((_, i) => out.push(i));
    return out;
  }
  let line = 0;
  units.forEach((u) => {
    if (!u.isWord) {
      const breaks = u.content.match(/\n/g);
      if (breaks) line += breaks.length;
      return;
    }
    out.push(line);
  });
  return out;
}

function resolveVariantDef(
  variant: KineticVariant,
  ctx: {
    rank: number;
    index: number;
    line: number;
    direction: KineticDirection;
    finalScale: number;
    finalRotation: number;
  },
): UnitDef {
  const fin = (extra?: Partial<VState>): VState =>
    state({ sx: ctx.finalScale, sy: ctx.finalScale, rz: ctx.finalRotation, ...extra });
  switch (variant) {
    case "depth-cascade": {
      const d = DEPTH_STAGES[((ctx.rank % 3) + 3) % 3]!;
      return {
        phases: [
          { at: 0, s: state({ y: px(d.y), sx: d.s, sy: d.s, rx: -10, o: 0, b: d.b }) },
          { at: 0.7, s: state({ sx: 1.015, sy: 1.015, o: 1 }) },
          { at: 1, s: fin() },
        ],
        segEasing: [EASE_VARIANT, EASE_SETTLE],
        perspective: 900,
        origin: "center center",
      };
    }
    case "elastic-slam": {
      const rz = ctx.index % 2 === 0 ? -2 : 2;
      return {
        phases: [
          { at: 0, s: state({ y: pct(-120), sx: 0.92, sy: 1.35, rz, o: 0 }) },
          { at: 0.55, s: state({ y: pct(6), sx: 1.04, sy: 0.92, rz: rz * 0.4, o: 1 }) },
          { at: 0.78, s: state({ y: pct(-2), sx: 0.98, sy: 1.04, o: 1 }) },
          { at: 1, s: fin() },
        ],
        segEasing: [EASE_VARIANT, EASE_SETTLE, EASE_SETTLE],
        origin: "center center",
      };
    }
    case "blur-rush": {
      const dir = ctx.line % 2 === 0 ? -1 : 1;
      return {
        phases: [
          { at: 0, s: state({ x: px(dir * 80), o: 0, b: 18, sx: 1.06, sy: 1.06, ls: 0.02 }) },
          { at: 0.6, s: state({ x: px(dir * 5), o: 1, b: 3, sx: 1.02, sy: 1.02, ls: 0.008 }) },
          { at: 1, s: fin() },
        ],
        segEasing: [EASE_VARIANT, EASE_VARIANT],
        origin: "center center",
      };
    }
    case "split-shutter": {
      // The clean final copy fades in; slices are driven separately.
      return {
        phases: [
          { at: 0, s: state({ o: 0 }) },
          { at: 1, s: fin() },
        ],
        segEasing: [EASE_VARIANT],
        origin: "center center",
      };
    }
    case "editorial-rise":
    default: {
      const horizontal = ctx.direction === "left" || ctx.direction === "right";
      const sgn = ctx.direction === "down" || ctx.direction === "right" ? -1 : 1;
      const init: VState = horizontal
        ? state({ x: pct(115 * sgn), o: 0, b: 6, sx: 0.97, sy: 0.97 })
        : state({ y: pct(115 * sgn), rx: -25, o: 0, b: 6, sx: 0.97, sy: 0.97 });
      const over: VState = horizontal
        ? state({ x: pct(-2 * sgn), o: 1, sx: 1.01, sy: 1.01 })
        : state({ y: pct(-2 * sgn), o: 1, sx: 1.01, sy: 1.01 });
      return {
        phases: [
          { at: 0, s: init },
          { at: 0.62, s: over },
          { at: 1, s: fin() },
        ],
        segEasing: [EASE_VARIANT, EASE_SETTLE],
        origin: horizontal ? "center center" : "50% 100%",
      };
    }
  }
}

/** Shutter slice transform helper (translate % + skew). */
function sliceTransform(xPct: number, skew: number): string {
  const parts = [`translate3d(${xPct.toFixed(2)}%, 0, 0)`];
  if (skew) parts.push(`skewX(${skew.toFixed(2)}deg)`);
  return parts.join(" ");
}

const SCREEN_READER_ONLY: React.CSSProperties = {
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

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export const KineticSplitText = React.forwardRef<
  KineticSplitTextHandle,
  KineticSplitTextProps
>(function KineticSplitText(
  {
    text = KINETIC_SPLIT_TEXT_DEFAULTS.text,
    split = KINETIC_SPLIT_TEXT_DEFAULTS.split,
    preset = KINETIC_SPLIT_TEXT_DEFAULTS.preset,
    direction = KINETIC_SPLIT_TEXT_DEFAULTS.direction,
    staggerPattern = KINETIC_SPLIT_TEXT_DEFAULTS.staggerPattern,
    randomSeed = KINETIC_SPLIT_TEXT_DEFAULTS.randomSeed,
    stagger,
    duration,
    delay = KINETIC_SPLIT_TEXT_DEFAULTS.delay,
    trigger = KINETIC_SPLIT_TEXT_DEFAULTS.trigger,
    variant = KINETIC_SPLIT_TEXT_DEFAULTS.variant,
    once = KINETIC_SPLIT_TEXT_DEFAULTS.once,
    threshold = KINETIC_SPLIT_TEXT_DEFAULTS.threshold,
    rootMargin = KINETIC_SPLIT_TEXT_DEFAULTS.rootMargin,
    hoverBehavior = KINETIC_SPLIT_TEXT_DEFAULTS.hoverBehavior,
    translateX,
    translateY,
    initialScale,
    finalScale = 1,
    initialRotation,
    finalRotation = 0,
    rotationX,
    rotationY,
    blur,
    opacity,
    perspective,
    scrollStart = KINETIC_SPLIT_TEXT_DEFAULTS.scrollStart,
    scrollEnd = KINETIC_SPLIT_TEXT_DEFAULTS.scrollEnd,
    scrollSmoothing = KINETIC_SPLIT_TEXT_DEFAULTS.scrollSmoothing,
    fontFamily = KINETIC_SPLIT_TEXT_DEFAULTS.fontFamily,
    fontSize,
    fontWeight = KINETIC_SPLIT_TEXT_DEFAULTS.fontWeight,
    fontStyle = "normal",
    lineHeight = KINETIC_SPLIT_TEXT_DEFAULTS.lineHeight,
    letterSpacing = KINETIC_SPLIT_TEXT_DEFAULTS.letterSpacing,
    textAlign = KINETIC_SPLIT_TEXT_DEFAULTS.textAlign,
    textTransform,
    color,
    ariaLabel,
    className,
    style,
    onClick,
    onMouseEnter,
    onMouseLeave,
    ...divProps
  }: KineticSplitTextProps,
  ref,
) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const innerRefs = React.useRef<Map<number, HTMLSpanElement>>(new Map());
  const finalRefs = React.useRef<Map<number, HTMLSpanElement>>(new Map());
  const stackRefs = React.useRef<Map<number, HTMLSpanElement>>(new Map());
  const sliceRefs = React.useRef<Map<number, HTMLSpanElement[]>>(new Map());
  const animationsRef = React.useRef<Animation[]>([]);
  const progressRef = React.useRef(0);
  const hoverRaf = React.useRef(0);
  const stateRef = React.useRef({
    played: false,
    hovering: false,
    scrollRaf: 0,
    scrollCurrent: 0,
    scrollTarget: 0,
    scrollActive: false,
    playToken: 0,
    io: null as IntersectionObserver | null,
  });
  const [reducedMotion, setReducedMotion] = React.useState(false);

  // Legacy `preset` values (anything but the "flip" default) reproduce the
  // exact previous behavior; otherwise the `variant` choreography drives.
  const useLegacy = preset !== "flip";
  const seed = randomSeed ?? 7;
  const variantMeta =
    KINETIC_VARIANT_META[variant] ?? KINETIC_VARIANT_META["editorial-rise"];
  const safeStagger =
    Number.isFinite(stagger) && (stagger as number) >= 0
      ? (stagger as number)
      : useLegacy
        ? 0.07
        : variantMeta.stagger;
  const safeDuration =
    Number.isFinite(duration) && (duration as number) > 0
      ? (duration as number)
      : useLegacy
        ? 0.75
        : variantMeta.duration;
  const safeDelay = Number.isFinite(delay) && delay >= 0 ? delay : 0;
  const safeFinalScale = Number.isFinite(finalScale) ? (finalScale as number) : 1;
  const safeFinalRotation = Number.isFinite(finalRotation) ? (finalRotation as number) : 0;
  const safePerspective =
    Number.isFinite(perspective) && (perspective as number) > 0
      ? (perspective as number)
      : !useLegacy && variant === "depth-cascade"
        ? 900
        : 800;
  const isShutter = !useLegacy && variant === "split-shutter";

  React.useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    setReducedMotion(mq.matches);
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }
    mq.addListener(onChange);
    return () => mq.removeListener(onChange);
  }, []);

  const units = React.useMemo(() => buildUnits(text ?? "", split), [text, split]);
  const animatableCount = React.useMemo(
    () => units.filter((u) => (split === "lines" ? true : u.isWord)).length,
    [units, split],
  );
  const ranks = React.useMemo(
    () => orderRanks(animatableCount, staggerPattern, randomSeed ?? 7),
    [animatableCount, staggerPattern, randomSeed],
  );
  const motion = React.useMemo(
    () =>
      resolveMotion({
        preset,
        direction,
        translateX,
        translateY,
        initialScale,
        initialRotation,
        rotationX,
        rotationY,
        blur,
        opacity,
      }),
    [
      preset,
      direction,
      translateX,
      translateY,
      initialScale,
      initialRotation,
      rotationX,
      rotationY,
      blur,
      opacity,
    ],
  );

  /** Explicit line number per animatable slot (blur-rush alternation). */
  const slotLines = React.useMemo(
    () => slotLineNumbers(units, split),
    [units, split],
  );

  /** Per-slot choreography definitions (variant or legacy preset). */
  const defs = React.useMemo(() => {
    const arr: UnitDef[] = [];
    for (let slot = 0; slot < animatableCount; slot += 1) {
      const rank = ranks[slot] ?? slot;
      if (useLegacy) {
        arr[slot] = legacyDefFromResolved(motion, {
          preset,
          seed,
          rank,
          finalScale: safeFinalScale,
          finalRotation: safeFinalRotation,
        });
      } else {
        arr[slot] = resolveVariantDef(variant, {
          rank,
          index: slot,
          line: slotLines[slot] ?? 0,
          direction,
          finalScale: safeFinalScale,
          finalRotation: safeFinalRotation,
        });
      }
    }
    return arr;
  }, [
    animatableCount,
    ranks,
    useLegacy,
    motion,
    preset,
    seed,
    safeFinalScale,
    safeFinalRotation,
    variant,
    direction,
    slotLines,
  ]);

  const needsPerspective = useLegacy
    ? !!motion.rotationX || !!motion.rotationY
    : variant === "editorial-rise" || variant === "depth-cascade";
  const unitOrigin = useLegacy
    ? motion.rotationX || motion.rotationY
      ? "center bottom"
      : "center center"
    : (defs[0]?.origin ?? "center center");

  const cancelAnimations = React.useCallback(() => {
    stateRef.current.playToken += 1;
    cancelAnimationFrame(hoverRaf.current);
    for (const a of animationsRef.current) {
      try {
        a.cancel();
      } catch {
        /* already finished */
      }
    }
    animationsRef.current = [];
  }, []);

  /** Write the resting (final) state straight to the DOM — no re-render. */
  const writeFinalState = React.useCallback(() => {
    progressRef.current = 1;
    for (let slot = 0; slot < animatableCount; slot += 1) {
      const def = defs[slot];
      if (!def) continue;
      const fin = def.phases[def.phases.length - 1]!.s;
      if (isShutter) {
        const f = finalRefs.current.get(slot);
        if (f) {
          f.style.opacity = "1";
          f.style.transform = transformOfState(fin);
          f.style.filter = "none";
          f.style.letterSpacing = "";
        }
        const st = stackRefs.current.get(slot);
        if (st) st.style.display = "none";
      } else {
        const el = innerRefs.current.get(slot);
        if (el) {
          el.style.transform = transformOfState(fin);
          el.style.opacity = String(fin.o);
          el.style.filter = "none";
          el.style.letterSpacing = "";
        }
      }
    }
  }, [animatableCount, defs, isShutter]);

  /** Sample one shutter unit's slices + final copy at eased progress. */
  const sampleShutterSlot = React.useCallback((slot: number, e: number) => {
    const k = 0.12;
    const slices = sliceRefs.current.get(slot);
    if (slices) {
      slices.forEach((sl, i) => {
        const dir = i % 2 === 0 ? -1 : 1;
        const si = clamp(e * (1 + (SHUTTER_SLICES - 1) * k) - i * k, 0, 1);
        const sie = 1 - Math.pow(1 - si, 3);
        sl.style.transform = sliceTransform(dir * 110 * (1 - sie), dir * 5 * (1 - sie));
        sl.style.opacity = String(Math.min(1, si * 1.6));
      });
    }
    const fin = finalRefs.current.get(slot);
    if (fin) {
      fin.style.opacity = String(clamp((e - 0.7) / 0.3, 0, 1));
      fin.style.transform = "translate3d(0, 0, 0)";
      fin.style.filter = "none";
    }
    const st = stackRefs.current.get(slot);
    if (st) st.style.display = e >= 1 ? "none" : "";
  }, []);

  /**
   * Render the full choreography at normalized progress (0→1). Each unit
   * occupies an offset window so stagger survives scrubbing; intermediate
   * variant phases (elastic impact/bounce, blur midpoint, shutter slices)
   * all map onto the same 0→1 range and reverse naturally.
   */
  const writeScrollState = React.useCallback(
    (progress: number) => {
      const p = clamp(progress, 0, 1);
      progressRef.current = p;
      const n = animatableCount;
      const span = n <= 1 ? 1 : 0.55;
      const step = n <= 1 ? 0 : (1 - span) / (n - 1);
      for (let slot = 0; slot < n; slot += 1) {
        const rank = ranks[slot] ?? slot;
        const start = rank * step;
        const local = clamp((p - start) / span, 0, 1);
        // Ease the local value so mid-scroll motion settles softly.
        const eased = 1 - Math.pow(1 - local, 3);
        if (isShutter) {
          sampleShutterSlot(slot, eased);
          continue;
        }
        const def = defs[slot];
        if (!def) continue;
        const el = innerRefs.current.get(slot);
        if (!el) continue;
        const s = sampleDef(def, eased);
        el.style.transform = s.transform;
        el.style.opacity = String(s.opacity);
        el.style.filter = s.filter;
        el.style.letterSpacing = s.letterSpacing === "0em" ? "" : s.letterSpacing;
      }
    },
    [animatableCount, ranks, defs, isShutter, sampleShutterSlot],
  );

  /**
   * Progress driver — animates the shared progress value with rAF so hover
   * enter/leave (and interruptions) never jump: leaving at 0.63 animates
   * 0.63 → 0 instead of restarting from an endpoint.
   */
  const animateProgressTo = React.useCallback(
    (target: number, durationMs: number) => {
      cancelAnimationFrame(hoverRaf.current);
      const goal = clamp(target, 0, 1);
      if (reducedMotion) {
        writeFinalState();
        return;
      }
      if (durationMs <= 0) {
        writeScrollState(goal);
        return;
      }
      const from = progressRef.current;
      if (from === goal) return;
      const t0 = performance.now();
      const tick = (now: number) => {
        const t = clamp((now - t0) / Math.max(1, durationMs), 0, 1);
        const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        writeScrollState(from + (goal - from) * eased);
        if (t < 1) hoverRaf.current = requestAnimationFrame(tick);
      };
      hoverRaf.current = requestAnimationFrame(tick);
    },
    [reducedMotion, writeFinalState, writeScrollState],
  );

  const totalMs = React.useCallback(() => {
    const lastRank = animatableCount <= 0 ? 0 : animatableCount - 1;
    return (
      (safeDelay + lastRank * safeStagger + safeDuration + (isShutter ? SHUTTER_SLICES * SHUTTER_SLICE_STAGGER : 0)) *
      1000
    );
  }, [animatableCount, safeDelay, safeStagger, safeDuration, isShutter]);

  /** Play one shutter unit: slices converge, final fades in, stack hides. */
  const playShutterSlot = React.useCallback(
    (slot: number, rank: number, animations: Animation[], token: number) => {
      const fin = finalRefs.current.get(slot);
      const stack = stackRefs.current.get(slot);
      const slices = sliceRefs.current.get(slot);
      if (!fin || !stack || !slices) return;
      stack.style.display = "";
      fin.style.opacity = "0";
      const base = safeDelay + rank * safeStagger;
      slices.forEach((sl, i) => {
        const dir = i % 2 === 0 ? -1 : 1;
        try {
          animations.push(
            sl.animate(
              [
                {
                  transform: sliceTransform(dir * 110, dir * 5),
                  opacity: 0,
                },
                { transform: sliceTransform(0, 0), opacity: 1 },
              ],
              {
                duration: safeDuration * 750,
                delay: (base + i * SHUTTER_SLICE_STAGGER) * 1000,
                easing: EASE_VARIANT,
                fill: "both",
              },
            ),
          );
        } catch {
          /* WAAPI unavailable */
        }
      });
      try {
        const finAnim = fin.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 300,
          delay: (base + safeDuration * 0.55) * 1000,
          easing: EASE_OUT_EXPO,
          fill: "both",
        });
        animations.push(finAnim);
        // Hand off to the clean copy and hide slices to shed overhead —
        // the settled word is one normal text node, so no seams remain.
        void Promise.all(animations.map((a) => a.finished)).then(
          () => {
            if (stateRef.current.playToken !== token) return;
            fin.style.opacity = "1";
            fin.style.transform = "translate3d(0, 0, 0)";
            fin.style.filter = "none";
            stack.style.display = "none";
            if (slot === animatableCount - 1) progressRef.current = 1;
          },
          () => {
            if (stateRef.current.playToken !== token) return;
            fin.style.opacity = "1";
            stack.style.display = "none";
          },
        );
      } catch {
        fin.style.opacity = "1";
        stack.style.display = "none";
      }
    },
    [safeDelay, safeDuration, safeStagger, animatableCount],
  );

  const play = React.useCallback(() => {
    if (reducedMotion) {
      writeFinalState();
      return;
    }
    // Hover trigger runs on the progress driver so enter/leave (and any
    // interruption) continue from the exact current progress — no jumps.
    if (trigger === "hover") {
      animateProgressTo(1, totalMs());
      stateRef.current.played = true;
      return;
    }
    cancelAnimations();
    const token = stateRef.current.playToken;
    const animations: Animation[] = [];
    for (let slot = 0; slot < animatableCount; slot += 1) {
      const rank = ranks[slot] ?? slot;
      const def = defs[slot];
      if (!def) continue;
      if (isShutter) {
        playShutterSlot(slot, rank, animations, token);
        continue;
      }
      const el = innerRefs.current.get(slot);
      if (!el) continue;
      try {
        const animation = el.animate(keyframesOf(def), {
          duration: safeDuration * 1000,
          delay: (safeDelay + rank * safeStagger) * 1000,
          ...(def.uniformEasing ? { easing: def.uniformEasing } : {}),
          fill: "both",
        });
        // Drop the blur filter once settled so large hero type stays cheap.
        animation.onfinish = () => {
          if (stateRef.current.playToken !== token) return;
          try {
            animation.commitStyles();
          } catch {
            /* noop */
          }
          try {
            animation.cancel();
          } catch {
            /* noop */
          }
          const fin = def.phases[def.phases.length - 1]!.s;
          el.style.transform = transformOfState(fin);
          el.style.opacity = String(fin.o);
          el.style.filter = "none";
          el.style.letterSpacing = "";
          if (slot === animatableCount - 1) progressRef.current = 1;
        };
        animations.push(animation);
      } catch {
        /* WAAPI unavailable — fall back to resting state */
        const fin = def.phases[def.phases.length - 1]!.s;
        el.style.transform = transformOfState(fin);
        el.style.opacity = String(fin.o);
        el.style.filter = "none";
        el.style.letterSpacing = "";
      }
    }
    animationsRef.current = animations;
    stateRef.current.played = true;
  }, [
    reducedMotion,
    writeFinalState,
    trigger,
    animateProgressTo,
    totalMs,
    cancelAnimations,
    animatableCount,
    ranks,
    defs,
    isShutter,
    playShutterSlot,
    safeDuration,
    safeDelay,
    safeStagger,
  ]);

  const reset = React.useCallback(() => {
    cancelAnimations();
    stateRef.current.played = false;
    if (reducedMotion) {
      writeFinalState();
      return;
    }
    // Park units in the initial state without animating.
    writeScrollState(0);
  }, [cancelAnimations, reducedMotion, writeFinalState, writeScrollState]);

  const setProgress = React.useCallback(
    (progress: number) => {
      cancelAnimations();
      writeScrollState(progress);
    },
    [cancelAnimations, writeScrollState],
  );

  const apiRef = React.useRef({ play, reset, setProgress });
  apiRef.current = { play, reset, setProgress };
  React.useImperativeHandle(
    ref,
    () => ({
      play: () => apiRef.current.play(),
      reset: () => apiRef.current.reset(),
      setProgress: (p: number) => apiRef.current.setProgress(p),
    }),
    [],
  );

  /* ---------------- scroll-linked mode ---------------- */
  const scrollConfigRef = React.useRef({ scrollStart, scrollEnd, scrollSmoothing });
  scrollConfigRef.current = { scrollStart, scrollEnd, scrollSmoothing };

  useIsomorphicLayoutEffect(() => {
    if (trigger !== "scroll") return;
    const root = rootRef.current;
    if (!root) return;
    const st = stateRef.current;
    if (reducedMotion) {
      writeFinalState();
      return;
    }

    const parseBand = (band: string, fallback: number): number => {
      // Accepts "top 85%" / "center 50%" / "bottom 20%" — resolves to a
      // viewport Y in px.
      const m = /^(top|center|bottom)\s+([\d.]+)%\s*$/.exec(band.trim());
      const vh = window.innerHeight || 1;
      if (!m) return (fallback / 100) * vh;
      const edge = m[1];
      const pct = clamp(parseFloat(m[2]!), 0, 100);
      if (edge === "top") return (pct / 100) * vh;
      if (edge === "bottom") return vh - (pct / 100) * vh;
      return vh / 2 + ((pct - 50) / 100) * vh;
    };

    const measure = () => {
      const rect = root.getBoundingClientRect();
      const startY = parseBand(scrollConfigRef.current.scrollStart, 85);
      const endY = parseBand(scrollConfigRef.current.scrollEnd, 40);
      const top = rect.top + rect.height / 2;
      const span = startY - endY;
      const raw = span === 0 ? 1 : (startY - top) / span;
      st.scrollTarget = clamp(raw, 0, 1);
    };

    const tick = () => {
      st.scrollActive = false;
      const smoothing = clamp(scrollConfigRef.current.scrollSmoothing, 0, 0.9);
      const next = st.scrollCurrent + (st.scrollTarget - st.scrollCurrent) * (1 - smoothing);
      const settled = Math.abs(st.scrollTarget - next) < 0.0005;
      st.scrollCurrent = settled ? st.scrollTarget : next;
      writeScrollState(st.scrollCurrent);
      if (!settled) {
        st.scrollActive = true;
        st.scrollRaf = requestAnimationFrame(tick);
      }
    };
    const schedule = () => {
      measure();
      if (!st.scrollActive) {
        st.scrollActive = true;
        st.scrollRaf = requestAnimationFrame(tick);
      }
    };

    // Initialize at the measured position (no animation from 0 on load).
    measure();
    st.scrollCurrent = st.scrollTarget;
    writeScrollState(st.scrollCurrent);

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(schedule);
    };
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("resize", onScroll, { passive: true });
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(onScroll) : null;
    ro?.observe(root);
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(st.scrollRaf);
      st.scrollActive = false;
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
      ro?.disconnect();
    };
  }, [trigger, reducedMotion, writeFinalState, writeScrollState]);

  /* ---------------- discrete triggers ---------------- */
  useIsomorphicLayoutEffect(() => {
    if (trigger === "scroll" || trigger === "manual") return;
    const root = rootRef.current;
    if (!root) return;
    const st = stateRef.current;
    if (reducedMotion) {
      writeFinalState();
      return;
    }

    if (trigger === "load") {
      play();
      return;
    }

    if (trigger === "hover") {
      // Progress-driven: rest at 0, pointer enter animates 0 → 1.
      writeScrollState(0);
      return;
    }

    if (trigger === "click") {
      // Rest settled; clicks replay the WAAPI timeline.
      writeFinalState();
      return;
    }

    // inView — begin parked at the initial state, play on entry.
    reset();
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          play();
          if (once) io.disconnect();
        } else {
          // Offscreen: cancel in-flight work so nothing runs needlessly.
          cancelAnimations();
          if (!once) reset();
        }
      },
      {
        threshold: clamp(threshold, 0, 1),
        rootMargin,
      },
    );
    st.io = io;
    io.observe(root);
    return () => {
      io.disconnect();
      st.io = null;
      cancelAnimations();
    };
  }, [trigger, once, threshold, rootMargin, reducedMotion]);

  /* Re-play when the motion definition changes (controls panel live-update). */
  const configKey = [
    text,
    split,
    preset,
    variant,
    direction,
    staggerPattern,
    randomSeed,
    safeStagger,
    safeDuration,
    safeDelay,
    translateX,
    translateY,
    initialScale,
    finalScale,
    initialRotation,
    finalRotation,
    rotationX,
    rotationY,
    blur,
    opacity,
    safePerspective,
  ].join("|");
  const firstConfig = React.useRef(true);
  useIsomorphicLayoutEffect(() => {
    if (firstConfig.current) {
      firstConfig.current = false;
      return;
    }
    if (trigger === "manual") return;
    if (trigger === "scroll") {
      // Re-sample at the current scroll position — no timeline restart.
      writeScrollState(stateRef.current.scrollCurrent);
      return;
    }
    if (trigger === "hover" || trigger === "click" || trigger === "load") {
      // Immediately preview the new configuration (hover runs progress-based).
      play();
      return;
    }
    if (trigger === "inView") {
      // Replay immediately while visible so control changes preview live.
      const root = rootRef.current;
      if (!root) return;
      const rect = root.getBoundingClientRect();
      const visible = rect.top < window.innerHeight && rect.bottom > 0;
      if (visible) play();
      else reset();
    }
  }, [configKey]);

  // Unmount safety net.
  React.useEffect(() => cancelAnimations, [cancelAnimations]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || trigger !== "click" || reducedMotion) return;
    play();
  };
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    onMouseEnter?.(e);
    if (trigger !== "hover" || reducedMotion) return;
    stateRef.current.hovering = true;
    // Progress driver: animate 0 → 1 from rest (or resume an interruption).
    animateProgressTo(1, totalMs());
  };
  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    onMouseLeave?.(e);
    if (trigger !== "hover" || reducedMotion) return;
    stateRef.current.hovering = false;
    // Animate currentProgress → 0 — never restart from an endpoint.
    // hoverBehavior only tunes the leave duration now.
    if (hoverBehavior === "reset") animateProgressTo(0, 0);
    else if (hoverBehavior === "reverse") animateProgressTo(0, 400);
    else animateProgressTo(0, 500);
  };

  const resolvedFontSize = typeof fontSize === "number" ? `${fontSize}px` : fontSize;

  const rootStyle: React.CSSProperties = {
    fontFamily,
    fontSize: resolvedFontSize,
    fontWeight,
    fontStyle,
    lineHeight,
    letterSpacing,
    textAlign,
    textTransform,
    color,
    ...style,
  };

  // Clip wrapper: hides the unit until it rises into place. The small
  // bottom padding preserves descenders (g, y, p) while overflow clips.
  const clipStyle: React.CSSProperties = {
    display: "inline-block",
    overflow: "hidden",
    verticalAlign: "top",
    paddingBottom: "0.12em",
    marginBottom: "-0.12em",
    position: isShutter ? "relative" : undefined,
    perspective: needsPerspective ? `${safePerspective}px` : undefined,
  };
  // Character clip needs no vertical slack hack beyond the shared one, but
  // must not introduce letter-spacing drift — spacing stays on the parent.
  const innerBaseStyle: React.CSSProperties = {
    display: "inline-block",
    willChange: "transform, opacity, filter",
    transformOrigin: unitOrigin,
    backfaceVisibility: "hidden",
  };

  const setInnerRef = (slot: number) => (node: HTMLSpanElement | null) => {
    if (node) innerRefs.current.set(slot, node);
    else innerRefs.current.delete(slot);
  };
  const setFinalRef = (slot: number) => (node: HTMLSpanElement | null) => {
    if (node) finalRefs.current.set(slot, node);
    else finalRefs.current.delete(slot);
  };
  const setStackRef = (slot: number) => (node: HTMLSpanElement | null) => {
    if (node) stackRefs.current.set(slot, node);
    else stackRefs.current.delete(slot);
  };
  const setSliceRef =
    (slot: number, index: number) => (node: HTMLSpanElement | null) => {
      if (!node) return;
      const list = sliceRefs.current.get(slot) ?? [];
      list[index] = node;
      sliceRefs.current.set(slot, list);
    };

  /**
   * One animatable unit. Split-shutter renders the clean final copy plus
   * visual-only slice duplicates (aria-hidden tree, never announced).
   */
  const renderUnit = (
    slot: number,
    kind: "character" | "word" | "line",
    content: string,
    block: boolean,
  ) => {
    const finalStyle = block
      ? { ...innerBaseStyle, display: "block", width: "100%" }
      : innerBaseStyle;
    if (!isShutter) {
      return (
        <span ref={setInnerRef(slot)} data-kinetic-unit={kind} style={finalStyle}>
          {content}
        </span>
      );
    }
    return (
      <>
        <span
          ref={setFinalRef(slot)}
          data-kinetic-unit={kind}
          data-shutter-final="true"
          style={finalStyle}
        >
          {content}
        </span>
        <span
          ref={setStackRef(slot)}
          data-shutter-stack="true"
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, display: "block" }}
        >
          {Array.from({ length: SHUTTER_SLICES }).map((_, i) => {
            const dir = i % 2 === 0 ? -1 : 1;
            const top = (i * 100) / SHUTTER_SLICES;
            const bottom = 100 - ((i + 1) * 100) / SHUTTER_SLICES;
            return (
              <span
                key={i}
                ref={setSliceRef(slot, i)}
                data-shutter-slice={i}
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "block",
                  width: "100%",
                  clipPath: `inset(calc(${top}% - 0.5px) 0 calc(${bottom}% - 0.5px) 0)`,
                  transform: sliceTransform(dir * 110, dir * 5),
                  opacity: 0,
                  transformOrigin: i % 2 === 0 ? "left center" : "right center",
                  willChange: "transform, opacity",
                }}
              >
                {content}
              </span>
            );
          })}
        </span>
      </>
    );
  };

  let slotCounter = -1;
  const nextSlot = () => {
    slotCounter += 1;
    return slotCounter;
  };

  const renderWordUnits = (wordUnits: KineticUnit[], wordKey: string) => {
    // One nowrap word group containing clipped characters.
    return (
      <span key={wordKey} style={{ display: "inline-block", whiteSpace: "nowrap" }}>
        {wordUnits.map((u) => {
          const slot = nextSlot();
          return (
            <span key={u.key} style={clipStyle}>
              {renderUnit(slot, "character", u.content, false)}
            </span>
          );
        })}
      </span>
    );
  };

  return (
    <div
      {...divProps}
      ref={rootRef}
      data-slot="kinetic-split-text"
      data-split={split}
      data-preset={preset}
      data-variant={useLegacy ? `preset:${preset}` : variant}
      data-trigger={trigger}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn("w-full", className)}
      style={rootStyle}
    >
      {/* Screen-reader text — the only announced node. */}
      <span style={SCREEN_READER_ONLY}>{ariaLabel ?? text}</span>

      <span aria-hidden="true" style={{ display: "block", width: "100%" }}>
        {split === "lines" ? (
          <span style={{ display: "block", width: "100%", whiteSpace: "pre-wrap" }}>
            {units.map((u, i) => {
              const slot = nextSlot();
              const empty = u.content.length === 0;
              return (
                <span key={u.key} style={{ display: "block", width: "100%" }}>
                  <span style={{ ...clipStyle, display: "block", width: "100%" }}>
                    {renderUnit(slot, "line", empty ? "\u00A0" : u.content, true)}
                  </span>
                  {i < units.length - 1 ? null : null}
                </span>
              );
            })}
          </span>
        ) : split === "characters" ? (
          <span style={{ display: "block", width: "100%", whiteSpace: "pre-wrap", overflowWrap: "break-word" }}>
            {(() => {
              const groups: React.ReactNode[] = [];
              let wordBuffer: KineticUnit[] = [];
              const flush = (k: string) => {
                if (wordBuffer.length > 0) {
                  groups.push(renderWordUnits(wordBuffer, k));
                  wordBuffer = [];
                }
              };
              units.forEach((u, i) => {
                if (!u.isWord) {
                  flush(`w-${i}`);
                  groups.push(
                    <span key={u.key} style={{ whiteSpace: "pre-wrap" }}>
                      {u.content}
                    </span>,
                  );
                } else {
                  wordBuffer.push(u);
                }
              });
              flush("w-end");
              return groups;
            })()}
          </span>
        ) : (
          <span style={{ display: "block", width: "100%", whiteSpace: "pre-wrap", overflowWrap: "break-word" }}>
            {units.map((u) => {
              if (!u.isWord) {
                return (
                  <span key={u.key} style={{ whiteSpace: "pre-wrap" }}>
                    {u.content}
                  </span>
                );
              }
              const slot = nextSlot();
              return (
                <span
                  key={u.key}
                  style={{ display: "inline-block", whiteSpace: "nowrap" }}
                >
              <span style={clipStyle}>
                {renderUnit(slot, "word", u.content, false)}
              </span>
                </span>
              );
            })}
          </span>
        )}
      </span>
    </div>
  );
});

const SPLIT_OPTIONS: KineticSplitMode[] = ["characters", "words", "lines"];
const PRESET_OPTIONS: KineticPreset[] = [
  "reveal",
  "blur-rise",
  "flip",
  "elastic",
  "scatter",
  "cinematic",
  "custom",
];
const DIRECTION_OPTIONS: KineticDirection[] = ["up", "down", "left", "right"];
const PATTERN_OPTIONS: KineticStaggerPattern[] = [
  "forward",
  "reverse",
  "center",
  "edges",
  "random",
];
const TRIGGER_OPTIONS: KineticTrigger[] = [
  "inView",
  "hover",
  "click",
  "load",
  "manual",
  "scroll",
];

(KineticSplitText as unknown as Record<string, unknown>).propertyControls = {
  text: {
    type: "String",
    title: "Text",
    defaultValue: KINETIC_SPLIT_TEXT_DEFAULTS.text,
    displayTextArea: true,
    group: "Content",
  },
  split: {
    type: "Enum",
    title: "Split",
    options: SPLIT_OPTIONS,
    optionTitles: ["Characters", "Words", "Lines"],
    defaultValue: KINETIC_SPLIT_TEXT_DEFAULTS.split,
    displaySegmentedControl: true,
    group: "Content",
  },
  preset: {
    type: "Enum",
    title: "Preset",
    options: PRESET_OPTIONS,
    optionTitles: ["Reveal", "Blur Rise", "Flip", "Elastic", "Scatter", "Cinematic", "Custom"],
    defaultValue: KINETIC_SPLIT_TEXT_DEFAULTS.preset,
    group: "Motion",
  },
  variant: {
    type: "Enum",
    title: "Motion Style",
    options: [
      "editorial-rise",
      "depth-cascade",
      "split-shutter",
      "elastic-slam",
      "blur-rush",
    ],
    optionTitles: [
      "Editorial Rise",
      "Depth Cascade",
      "Split Shutter",
      "Elastic Slam",
      "Blur Rush",
    ],
    defaultValue: KINETIC_SPLIT_TEXT_DEFAULTS.variant,
    displaySegmentedControl: true,
    group: "Motion",
  },
  direction: {
    type: "Enum",
    title: "Direction",
    options: DIRECTION_OPTIONS,
    optionTitles: ["Up", "Down", "Left", "Right"],
    defaultValue: KINETIC_SPLIT_TEXT_DEFAULTS.direction,
    displaySegmentedControl: true,
    group: "Motion",
  },
  staggerPattern: {
    type: "Enum",
    title: "Stagger Pattern",
    options: PATTERN_OPTIONS,
    optionTitles: ["Forward", "Reverse", "Center", "Edges", "Random"],
    defaultValue: KINETIC_SPLIT_TEXT_DEFAULTS.staggerPattern,
    group: "Motion",
  },
  stagger: {
    type: "Number",
    title: "Stagger",
    min: 0,
    max: 0.5,
    step: 0.005,
    defaultValue: KINETIC_SPLIT_TEXT_DEFAULTS.stagger,
    group: "Motion",
  },
  duration: {
    type: "Number",
    title: "Duration",
    min: 0.1,
    max: 2.5,
    step: 0.05,
    defaultValue: KINETIC_SPLIT_TEXT_DEFAULTS.duration,
    group: "Motion",
  },
  trigger: {
    type: "Enum",
    title: "Trigger",
    options: TRIGGER_OPTIONS,
    optionTitles: ["In View", "Hover", "Click", "Load", "Manual", "Scroll"],
    defaultValue: KINETIC_SPLIT_TEXT_DEFAULTS.trigger,
    group: "Trigger",
  },
  fontSize: {
    type: "Number",
    title: "Font Size",
    min: 12,
    max: 220,
    step: 1,
    group: "Typography",
  },
  color: { type: "Color", title: "Color", group: "Typography" },
};

(KineticSplitText as unknown as Record<string, unknown>).addPropertyControls = (
  KineticSplitText as unknown as Record<string, unknown>
).propertyControls;

export default KineticSplitText;
