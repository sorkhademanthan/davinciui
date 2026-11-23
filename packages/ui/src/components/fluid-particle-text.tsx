"use client";

import { useEffect, useRef } from "react";
import { cn } from "@workspace/ui/lib/utils";

/* ------------------------------------------------------------------ */
/* Public types                                                        */
/* ------------------------------------------------------------------ */

export type FluidParticleFitMode = "off" | "fit" | "fill";
export type FluidParticleQuality = "low" | "medium" | "high" | "ultra";
export type FluidParticleShape = "circle" | "square";
export type FluidParticlePresetName = "default" | "showcase" | "reference404";

export interface FluidParticleTextProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  text: string;

  fontFamily?: string;
  fontWeight?: number | string;
  fontStyle?: string;
  /** Base font size in CSS px. Used directly in fitMode="off", and as the measurement basis otherwise. */
  fontSize?: number;
  letterSpacing?: number;
  lineHeight?: number;

  color?: string;
  background?: string;

  fitMode?: FluidParticleFitMode;
  /**
   * Padding in CSS px. Values in (0, 1) are treated as a fraction of the
   * viewport axis (0.08 ≈ 8% margin per side).
   */
  padding?: number;
  minScale?: number;
  maxScale?: number;

  align?: "left" | "center" | "right";
  verticalAlign?: "top" | "center" | "bottom";
  maxLines?: number;

  outline?: boolean;
  strokeWidth?: number;
  fillOpacity?: number;
  strokeOpacity?: number;

  particleSize?: number;
  particleShape?: FluidParticleShape;
  sampleQuality?: FluidParticleQuality;
  /** Particle spacing in CSS px. Overrides sampleQuality when set. */
  particleSpacing?: number;
  alphaThreshold?: number;

  interactionRadius?: number;
  /** Alias for interactionRadius (CSS px). */
  influenceRadius?: number;
  /** Local velocity coherence near the interaction (spatial-grid viscosity). */
  viscosity?: number;
  forceStrength?: number;
  curlStrength?: number;
  returnSpeed?: number;
  damping?: number;
  maxDisplacement?: number;
  velocityInfluence?: number;

  /* --- Trajectory-advection model (preferred tuning surface) --- */
  /** Smoothed-pointer follow rate in 1/s. Responsive input ≈ 10–14. */
  pointerFollow?: number;
  /** Pointer-velocity low-pass rate in 1/s. Start ≈ 8–12. */
  velocityFollow?: number;
  /** Dominant force: how strongly particles inherit cursor velocity. */
  advectionStrength?: number;
  /** Broad, soft separation normal to the pointer trajectory. */
  pressureStrength?: number;
  /** Narrow pressure concentrated at the trajectory core for visible cuts. */
  corePressureStrength?: number;
  /** Directional velocity variation across the path for tapered filaments. */
  shearStrength?: number;
  /** Raster-topology velocity cohesion (≈0.2) that prevents separated strands. */
  topologyCohesion?: number;
  /** Home spring in 1/s^2 (≈4–14). */
  homeStrength?: number;
  /** Pointer-trail memory in seconds (≈0.2–0.8). */
  trailLifetime?: number;
  /** Trail samples retained (10–24). */
  trailLength?: number;

  /** Named preset. Explicit props always win over the preset. */
  preset?: FluidParticlePresetName;

  interactive?: boolean;
  maxParticles?: number;
  maxDpr?: number;
}

/* ------------------------------------------------------------------ */
/* Tuned constants                                                     */
/* ------------------------------------------------------------------ */

/**
 * Base sampling step (CSS px) per quality preset. The sampler measures in
 * device pixels (gap * rasterScale) so density is consistent across DPR,
 * and escalates the gap automatically to respect maxParticles.
 */
export const FLUID_PARTICLE_GAPS: Record<FluidParticleQuality, number> = {
  low: 6,
  medium: 4,
  high: 2,
  ultra: 1.5,
};

export const FLUID_PARTICLE_DEFAULTS = {
  fontFamily: `"Archivo Narrow", "Arial Narrow", sans-serif`,
  fontWeight: 700,
  fontStyle: "normal",
  fontSize: 160,
  letterSpacing: 0,
  lineHeight: 1.0,
  color: "#000000",
  background: "#ffffff",
  fitMode: "fit",
  padding: 32,
  minScale: 0.1,
  maxScale: 8,
  align: "center",
  verticalAlign: "center",
  maxLines: 4,
  outline: false,
  strokeWidth: 2,
  fillOpacity: 1,
  strokeOpacity: 1,
  particleSize: 2,
  particleShape: "square",
  sampleQuality: "high",
  alphaThreshold: 100,
  interactionRadius: 110,
  viscosity: 3,
  forceStrength: 1,
  curlStrength: 0.25,
  returnSpeed: 0.08,
  damping: 0.9,
  maxDisplacement: 150,
  velocityInfluence: 0.15,
  interactive: true,
  maxParticles: 220000,
  maxDpr: 2,
} as const;

/**
 * Showcase fixture: a dense, viewport-filling word with the most expressive
 * trajectory-advection settings and a bounded particle budget.
 */
export const FLUID_PARTICLE_SHOWCASE = {
  text: "FLOW",
  fontFamily: `"Archivo Narrow", "Arial Narrow", sans-serif`,
  fontWeight: 700,
  fontStyle: "normal",
  fitMode: "fit",
  padding: 0.055,
  maxScale: 12,
  particleSpacing: 1,
  particleSize: 1.35,
  particleShape: "square",
  alphaThreshold: 100,
  maxParticles: 80000,
  maxDpr: 2,
  pointerFollow: 12,
  velocityFollow: 10,
  influenceRadius: 110,
  interactionRadius: 110,
  viscosity: 8,
  advectionStrength: 2.5,
  pressureStrength: 0.3,
  corePressureStrength: 0.5,
  shearStrength: 0.3,
  curlStrength: 0.02,
  topologyCohesion: 0.1,
  homeStrength: 9.5,
  damping: 4.6,
  trailLifetime: 0.6,
  trailLength: 20,
  maxDisplacement: 280,
  color: "#000000",
  background: "#ffffff",
} as const;

/** Backwards-compatible fixture for existing reference404 consumers. */
export const FLUID_PARTICLE_REFERENCE_404 = {
  ...FLUID_PARTICLE_SHOWCASE,
  text: "404",
  maxParticles: 120000,
} as const;

/** Back-compat alias for the original reference fixture. */
export const REFERENCE_404 = FLUID_PARTICLE_REFERENCE_404;

/** Good general-purpose settings for library users. */
export const FLUID_PARTICLE_PRESET_DEFAULT = {
  ...FLUID_PARTICLE_DEFAULTS,
  particleSpacing: 2,
  pointerFollow: 8,
  velocityFollow: 8,
  advectionStrength: 0.55,
  pressureStrength: 0.05,
  shearStrength: 0.06,
  topologyCohesion: 0.18,
  homeStrength: 11,
  damping: 6.5,
  trailLifetime: 0.24,
  trailLength: 14,
} as const;

export const FLUID_PARTICLE_PRESETS: Record<
  FluidParticlePresetName,
  Record<string, number | string>
> = {
  default: FLUID_PARTICLE_PRESET_DEFAULT as unknown as Record<
    string,
    number | string
  >,
  showcase: FLUID_PARTICLE_SHOWCASE as unknown as Record<
    string,
    number | string
  >,
  reference404: FLUID_PARTICLE_REFERENCE_404 as unknown as Record<
    string,
    number | string
  >,
};

/**
 * Internal physics tuning (not exposed as props).
 *
 * Trajectory-advection model in physical units (px, seconds):
 * - Influence is GAUSSIAN: exp(-d2 / (2*sigma^2)), sigma = 0.5 * radius,
 *   evaluated out to 3 sigma. The radius defines influence only — never a
 *   destination, shell, or visible boundary. No ring attractor anywhere.
 * - ADVECTION is primary: cursor velocity injected as acceleration, so
 *   material stretches along the gesture. Stationary cursor => advection
 *   decays to zero while pressure maintains the elastic hold.
 * - POINTER HISTORY is a CONTINUOUS PATH: each particle measures distance
 *   to recent pointer SEGMENTS (sample[i] → sample[i+1]) and finds the
 *   nearest point Q on the segment. This yields brush strokes, tapered
 *   channels and thin cuts — never a chain of circular stamps.
 * - PRESSURE separates particles from the path and holds open a paused pull.
 * - SHEAR varies advection across the perpendicular offset from the
 *   trajectory, producing tapered sheet/thread streams.
 * - TOPOLOGY COHERENCE blends velocity with original raster neighbors so
 *   rows survive as fine parallel filaments (soft, never cloth springs).
 * - POINTER_SMOOTHING / VELOCITY_SMOOTHING: exponential follow rates
 *   (1/s) decoupling the sim from irregular browser pointer events.
 * - Frame-rate-aware integration advances once per paint. The delta is
 *   capped after stalls so input stays responsive without unstable catch-up.
 */
const PRESSURE_GAIN = 1600;
const CORE_PRESSURE_GAIN = 1600;
const CURL_BASE = 320;
const ADVECTION_GAIN = 2.4;
/* Advection velocity saturates: fast flicks stretch longer, never explode. */
const ADVECTION_SAT = 620;
const SHEAR_GAIN = 1.5;
const COHESION_GAIN = 20;
const POSITION_COHESION_RATIO = 0;
const DEFAULT_POINTER_FOLLOW = 9;
const DEFAULT_VELOCITY_FOLLOW = 10;
const MAX_POINTER_SPEED = 1400; // radial CSS px/s clamp, converted to device space
const TRAIL_MAX = 24;
const TRAIL_MIN_SPEED = 40; // px/s below which no new trail samples are pushed
const TRAIL_MIN_DIST = 2; // device px between trail samples
const VISCOSITY_CELL = 0.18;
const MAX_FRAME_DT = 1 / 30;
const GAUSSIAN_SIGMA = 0.5;
const CORE_GAUSSIAN_SIGMA = 0.22;
const GAUSSIAN_CUTOFF = 3;
const POINTER_REFERENCE_SPEED = 900; // CSS px/s
const SLEEP_EPS_V = 1.5; // px/s
const SLEEP_EPS_D = 0.06; // device px

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function hexToRgba(hex: string): [number, number, number, number] {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  if (h.length === 6) h += "ff";
  if (!/^[0-9a-fA-F]{8}$/.test(h)) return [0, 0, 0, 1];
  const n = parseInt(h, 16);
  return [
    ((n >>> 24) & 255) / 255,
    ((n >>> 16) & 255) / 255,
    ((n >>> 8) & 255) / 255,
    (n & 255) / 255,
  ];
}

const VERT_SRC = `
attribute vec2 a_pos;
attribute float a_intensity;
uniform vec2 u_res;
uniform float u_px;
varying float v_intensity;
void main() {
  vec2 c = vec2(a_pos.x / u_res.x * 2.0 - 1.0, 1.0 - a_pos.y / u_res.y * 2.0);
  gl_Position = vec4(c, 0.0, 1.0);
  gl_PointSize = u_px;
  v_intensity = a_intensity;
}`;

const FRAG_SQUARE_SRC = `
precision mediump float;
uniform vec4 u_color;
uniform vec4 u_highlight;
varying float v_intensity;
void main() {
  vec4 col = mix(u_color, u_highlight, v_intensity);
  gl_FragColor = col;
}`;

const FRAG_CIRCLE_SRC = `
precision mediump float;
uniform vec4 u_color;
uniform vec4 u_highlight;
varying float v_intensity;
void main() {
  float d = length(gl_PointCoord - vec2(0.5));
  float a = 1.0 - smoothstep(0.32, 0.5, d);
  if (a < 0.02) discard;
  vec4 col = mix(u_color, u_highlight, v_intensity);
  gl_FragColor = vec4(col.rgb, col.a * a);
}`;

function compileShader(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

function createProgram(
  gl: WebGLRenderingContext,
  vsSrc: string,
  fsSrc: string,
) {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vsSrc);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSrc);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  if (!prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    gl.deleteProgram(prog);
    return null;
  }
  return prog;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function FluidParticleText(props: FluidParticleTextProps) {
  const {
    text,
    fontFamily: fontFamilyProp,
    fontWeight: fontWeightProp,
    fontStyle = FLUID_PARTICLE_DEFAULTS.fontStyle,
    fontSize = FLUID_PARTICLE_DEFAULTS.fontSize,
    letterSpacing = FLUID_PARTICLE_DEFAULTS.letterSpacing,
    lineHeight = FLUID_PARTICLE_DEFAULTS.lineHeight,
    color: colorProp,
    background: backgroundProp,
    fitMode = FLUID_PARTICLE_DEFAULTS.fitMode,
    padding: paddingProp,
    minScale = FLUID_PARTICLE_DEFAULTS.minScale,
    maxScale: maxScaleProp,
    align = FLUID_PARTICLE_DEFAULTS.align,
    verticalAlign = FLUID_PARTICLE_DEFAULTS.verticalAlign,
    maxLines = FLUID_PARTICLE_DEFAULTS.maxLines,
    outline = FLUID_PARTICLE_DEFAULTS.outline,
    strokeWidth = FLUID_PARTICLE_DEFAULTS.strokeWidth,
    fillOpacity = FLUID_PARTICLE_DEFAULTS.fillOpacity,
    strokeOpacity = FLUID_PARTICLE_DEFAULTS.strokeOpacity,
    particleSize: particleSizeProp,
    particleShape: particleShapeProp,
    sampleQuality = FLUID_PARTICLE_DEFAULTS.sampleQuality,
    particleSpacing: particleSpacingProp,
    alphaThreshold = FLUID_PARTICLE_DEFAULTS.alphaThreshold,
    interactionRadius: interactionRadiusProp,
    influenceRadius: influenceRadiusProp,
    viscosity: viscosityProp,
    forceStrength = FLUID_PARTICLE_DEFAULTS.forceStrength,
    curlStrength: curlStrengthProp,
    returnSpeed = FLUID_PARTICLE_DEFAULTS.returnSpeed,
    damping: dampingProp,
    maxDisplacement: maxDisplacementProp,
    velocityInfluence = FLUID_PARTICLE_DEFAULTS.velocityInfluence,
    pointerFollow: pointerFollowProp,
    velocityFollow: velocityFollowProp,
    advectionStrength: advectionStrengthProp,
    pressureStrength: pressureStrengthProp,
    corePressureStrength: corePressureStrengthProp,
    shearStrength: shearStrengthProp,
    topologyCohesion: topologyCohesionProp,
    homeStrength: homeStrengthProp,
    trailLifetime: trailLifetimeProp,
    trailLength: trailLengthProp,
    preset,
    interactive = FLUID_PARTICLE_DEFAULTS.interactive,
    maxParticles: maxParticlesProp,
    maxDpr: maxDprProp,
    className,
    style,
    ...rest
  } = props;
  /* Named preset fills any prop left undefined. Explicit props always win. */
  const pv = preset ? FLUID_PARTICLE_PRESETS[preset] : undefined;
  const pvNum = (key: string): number | undefined =>
    pv && typeof pv[key] === "number" ? (pv[key] as number) : undefined;
  const pvStr = (key: string): string | undefined =>
    pv && typeof pv[key] === "string" ? (pv[key] as string) : undefined;

  const resolved = {
    text,
    fontFamily:
      fontFamilyProp ??
      pvStr("fontFamily") ??
      FLUID_PARTICLE_DEFAULTS.fontFamily,
    fontWeight:
      fontWeightProp ??
      (pv?.fontWeight as number | string | undefined) ??
      FLUID_PARTICLE_DEFAULTS.fontWeight,
    fontStyle,
    fontSize,
    letterSpacing,
    lineHeight,
    color: colorProp ?? pvStr("color") ?? FLUID_PARTICLE_DEFAULTS.color,
    background:
      backgroundProp ??
      pvStr("background") ??
      FLUID_PARTICLE_DEFAULTS.background,
    fitMode,
    padding: paddingProp ?? pvNum("padding") ?? FLUID_PARTICLE_DEFAULTS.padding,
    minScale,
    maxScale:
      maxScaleProp ?? pvNum("maxScale") ?? FLUID_PARTICLE_DEFAULTS.maxScale,
    align,
    verticalAlign,
    maxLines,
    outline,
    strokeWidth,
    fillOpacity,
    strokeOpacity,
    particleSize:
      particleSizeProp ??
      pvNum("particleSize") ??
      FLUID_PARTICLE_DEFAULTS.particleSize,
    particleShape:
      particleShapeProp ??
      (pvStr("particleShape") as typeof particleShapeProp) ??
      FLUID_PARTICLE_DEFAULTS.particleShape,
    sampleQuality,
    particleSpacing: particleSpacingProp ?? pvNum("particleSpacing"),
    alphaThreshold,
    interactionRadius:
      influenceRadiusProp ??
      interactionRadiusProp ??
      pvNum("interactionRadius") ??
      FLUID_PARTICLE_DEFAULTS.interactionRadius,
    viscosity:
      viscosityProp ?? pvNum("viscosity") ?? FLUID_PARTICLE_DEFAULTS.viscosity,
    forceStrength,
    curlStrength:
      curlStrengthProp ??
      pvNum("curlStrength") ??
      FLUID_PARTICLE_DEFAULTS.curlStrength,
    returnSpeed,
    damping: dampingProp ?? pvNum("damping") ?? FLUID_PARTICLE_DEFAULTS.damping,
    maxDisplacement:
      maxDisplacementProp ??
      pvNum("maxDisplacement") ??
      FLUID_PARTICLE_DEFAULTS.maxDisplacement,
    velocityInfluence,
    pointerFollow:
      pointerFollowProp ?? pvNum("pointerFollow") ?? DEFAULT_POINTER_FOLLOW,
    velocityFollow:
      velocityFollowProp ?? pvNum("velocityFollow") ?? DEFAULT_VELOCITY_FOLLOW,
    advectionStrength: advectionStrengthProp ?? pvNum("advectionStrength"),
    pressureStrength: pressureStrengthProp ?? pvNum("pressureStrength"),
    corePressureStrength:
      corePressureStrengthProp ?? pvNum("corePressureStrength") ?? 0,
    shearStrength: shearStrengthProp ?? pvNum("shearStrength") ?? 0.2,
    topologyCohesion: topologyCohesionProp ?? pvNum("topologyCohesion") ?? 0.1,
    homeStrength: homeStrengthProp ?? pvNum("homeStrength"),
    trailLifetime: trailLifetimeProp ?? pvNum("trailLifetime") ?? 0.32,
    trailLength: trailLengthProp ?? pvNum("trailLength") ?? 16,
    interactive,
    maxParticles:
      maxParticlesProp ??
      pvNum("maxParticles") ??
      FLUID_PARTICLE_DEFAULTS.maxParticles,
    maxDpr: maxDprProp ?? pvNum("maxDpr") ?? FLUID_PARTICLE_DEFAULTS.maxDpr,
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rebuildRef = useRef<(() => void) | null>(null);
  const propsRef = useRef(resolved);
  propsRef.current = resolved;

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    /* Non-null aliases: TS narrowing does not persist into nested closures. */
    const host: HTMLDivElement = container;
    const view: HTMLCanvasElement = canvas;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    let destroyed = false;
    let rafId = 0;
    let lastTime = -1;
    let running = false; // RAF active
    let sleeping = true; // physics settled, no loop needed
    let visible = true;
    let rebuildQueued = false;
    let rebuildTimer = 0;

    /* Device-space geometry */
    let cssW = 0;
    let cssH = 0;
    let devW = 0;
    let devH = 0;
    let dpr = 1;

    /* Particle state (allocated once at maxParticles, reused on rebuild).
       rpos is the packed position buffer uploaded to WebGL.
       row/col retain raster topology; nbr* holds neighbor particle indices
       (-1 when the neighbor cell is empty) for soft coherence. */
    const cap = Math.max(1024, propsRef.current.maxParticles);
    const home = new Float32Array(cap * 2);
    const pos = new Float32Array(cap * 2);
    const rpos = new Float32Array(cap * 2);
    const intensity = new Float32Array(cap);
    const renderScratch = new Float32Array(cap * 3);
    const vel = new Float32Array(cap * 2);
    const velSnap = new Float32Array(cap * 2);
    const nbrL = new Int32Array(cap).fill(-1);
    const nbrR = new Int32Array(cap).fill(-1);
    const nbrU = new Int32Array(cap).fill(-1);
    const nbrD = new Int32Array(cap).fill(-1);
    let count = 0;
    let acceptedGap = 1;

    /* Perf probes (EMA, written to dataset ~1/s for measurement). */
    let emaSim = 0;
    let emaUpload = 0;
    let emaFps = 60;
    let lastProbeWrite = 0;

    /* Pointer: raw events write targets only; the RAF loop consumes
       exponentially smoothed position + low-passed velocity (device px). */
    const pointer = {
      tx: 0,
      ty: 0,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      active: false,
      snap: true,
    };

    /* Cursor-history path (flow memory). Ring buffer of samples. */
    const trX = new Float32Array(TRAIL_MAX);
    const trY = new Float32Array(TRAIL_MAX);
    const trVX = new Float32Array(TRAIL_MAX);
    const trVY = new Float32Array(TRAIL_MAX);
    const trAge = new Float32Array(TRAIL_MAX).fill(999);
    let trHead = 0;
    let trCount = 0;

    /* Viscosity grid (rebuilt per frame while interacting). */
    let gridW = 0;
    let gridH = 0;
    let gridCell = 1;
    let gridSX = new Float32Array(0);
    let gridSY = new Float32Array(0);
    let gridN = new Uint32Array(0);

    /* WebGL state */
    let gl: WebGLRenderingContext | null = null;
    let prog: WebGLProgram | null = null;
    let posBuf: WebGLBuffer | null = null;
    let locPos = -1;
    let locRes: WebGLUniformLocation | null = null;
    let locPx: WebGLUniformLocation | null = null;
    let locColor: WebGLUniformLocation | null = null;
    let locHighlight: WebGLUniformLocation | null = null;
    let locIntensity: number | null = null;
    let programShape: FluidParticleShape | null = null;
    let contextLost = false;
    let useFallback2d = false;
    let fallbackImg: HTMLCanvasElement | null = null;

    const offscreen = document.createElement("canvas");
    const octx = offscreen.getContext("2d", { willReadFrequently: true });

    function primaryFontFamily(family: string) {
      const first =
        family
          .split(",")[0]
          ?.trim()
          .replace(/^['"]|['"]$/g, "") ?? "sans-serif";
      return first || "sans-serif";
    }

    function fontString(px: number) {
      const p = propsRef.current;
      return `${p.fontStyle} ${p.fontWeight} ${px}px ${p.fontFamily}`;
    }

    function applyLetterSpacing(ctx: CanvasRenderingContext2D, px: number) {
      const p = propsRef.current;
      if (!p.letterSpacing) return;
      try {
        (
          ctx as CanvasRenderingContext2D & { letterSpacing?: string }
        ).letterSpacing = `${p.letterSpacing * (px / 100)}px`;
      } catch {
        /* letterSpacing unsupported — ignore */
      }
    }

    function resolvePadding() {
      const p = propsRef.current;
      if (p.padding > 0 && p.padding < 1) {
        return { x: p.padding * cssW, y: p.padding * cssH };
      }
      return { x: p.padding, y: p.padding };
    }

    function alphaBounds(image: ImageData) {
      const data = image.data;
      let minX = image.width;
      let minY = image.height;
      let maxX = -1;
      let maxY = -1;
      for (let y = 0; y < image.height; y++) {
        const row = y * image.width;
        for (let x = 0; x < image.width; x++) {
          if (data[(row + x) * 4 + 3]! < propsRef.current.alphaThreshold)
            continue;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
      return maxX >= minX && maxY >= minY
        ? { width: maxX - minX + 1, height: maxY - minY + 1 }
        : null;
    }

    /* Rasterize text -> alpha mask canvas. Fit mode is corrected from the
       scanned alpha bounds, so visible ink—not advance width—occupies the
       requested reference stage. */
    function rasterize(): ImageData | null {
      const p = propsRef.current;
      if (!octx || devW === 0 || devH === 0) return null;
      if (offscreen.width !== devW || offscreen.height !== devH) {
        offscreen.width = devW;
        offscreen.height = devH;
      }
      octx.setTransform(dpr, 0, 0, dpr, 0, 0);
      octx.clearRect(0, 0, cssW, cssH);

      const lines = p.text.split("\n").slice(0, Math.max(1, p.maxLines));
      if (lines.length === 0 || (lines.length === 1 && lines[0] === ""))
        return null;

      /* Measure at 100px to derive the fit scale. */
      const meas = document.createElement("canvas").getContext("2d");
      if (!meas) return null;
      meas.font = fontString(100);
      applyLetterSpacing(meas, 100);
      let maxW = 1;
      for (const ln of lines)
        maxW = Math.max(maxW, meas.measureText(ln || " ").width);
      const blockH100 = lines.length * 100 * p.lineHeight;

      const pad = resolvePadding();
      let scale: number;
      if (p.fitMode === "off") {
        scale = p.fontSize / 100;
      } else {
        const availW = Math.max(1, cssW - pad.x * 2);
        const availH = Math.max(1, cssH - pad.y * 2);
        const sFit = Math.min(availW / maxW, availH / blockH100);
        scale =
          p.fitMode === "fill"
            ? Math.max(availW / maxW, availH / blockH100)
            : sFit;
        scale = clamp(scale, p.minScale, p.maxScale);
      }
      const px = 100 * scale;
      if (px < 2) return null;

      const draw = (drawPx: number) => {
        octx.clearRect(0, 0, cssW, cssH);
        octx.font = fontString(drawPx);
        applyLetterSpacing(octx, drawPx);
        octx.textAlign = p.align;
        octx.textBaseline = "middle";
        const anchorX =
          p.align === "left"
            ? pad.x
            : p.align === "right"
              ? cssW - pad.x
              : cssW / 2;
        const blockH = lines.length * drawPx * p.lineHeight;
        const top =
          p.verticalAlign === "top"
            ? pad.y
            : p.verticalAlign === "bottom"
              ? cssH - pad.y - blockH
              : (cssH - blockH) / 2;
        if (!p.outline || p.fillOpacity > 0) {
          octx.globalAlpha = clamp(p.fillOpacity, 0, 1);
          octx.fillStyle = "#fff";
          lines.forEach((ln, i) =>
            octx.fillText(ln, anchorX, top + (i + 0.5) * drawPx * p.lineHeight),
          );
        }
        if (p.outline && p.strokeOpacity > 0) {
          octx.globalAlpha = clamp(p.strokeOpacity, 0, 1);
          octx.strokeStyle = "#fff";
          octx.lineWidth = Math.max(0.5, p.strokeWidth * (drawPx / 100));
          lines.forEach((ln, i) =>
            octx.strokeText(
              ln,
              anchorX,
              top + (i + 0.5) * drawPx * p.lineHeight,
            ),
          );
        }
        octx.globalAlpha = 1;
        return octx.getImageData(0, 0, devW, devH);
      };

      try {
        let image = draw(px);
        if (p.fitMode !== "off") {
          const bounds = alphaBounds(image);
          if (bounds) {
            const targetW = Math.max(1, (cssW - pad.x * 2) * dpr);
            const targetH = Math.max(1, (cssH - pad.y * 2) * dpr);
            const correction = Math.min(
              targetW / bounds.width,
              targetH / bounds.height,
            );
            if (
              Number.isFinite(correction) &&
              Math.abs(correction - 1) > 0.005
            ) {
              image = draw(
                clamp(px * correction, p.minScale * 100, p.maxScale * 100),
              );
            }
          }
        }
        return image;
      } catch {
        return null;
      }
    }

    /* Sample the alpha mask into home/pos/vel. Adapts gap to maxParticles.
       Retains raster topology: grid cell -> neighbor indices. */
    function sampleInto(mask: ImageData): number {
      const p = propsRef.current;
      const data = mask.data;
      const baseGap =
        p.particleSpacing && p.particleSpacing > 0
          ? p.particleSpacing * dpr
          : Math.max(1, FLUID_PARTICLE_GAPS[p.sampleQuality] * dpr);
      let gap = Math.max(1, baseGap);
      let n = 0;
      let cellCols = 0;
      const cellOf = (gx: number, gy: number) => gy * (cellCols + 2) + gx;
      let cellMap = new Map<number, number>();
      for (let pass = 0; pass < 6; pass++) {
        n = 0;
        cellMap = new Map();
        const step = Math.max(1, Math.round(gap));
        cellCols = Math.ceil(devW / gap) + 2;
        for (let gy = 0, y = step / 2; y < devH && n < cap; y += gap, gy++) {
          const yi = Math.min(devH - 1, y | 0);
          for (let gx = 0, x = step / 2; x < devW && n < cap; x += gap, gx++) {
            const xi = Math.min(devW - 1, x | 0);
            if (data[(yi * devW + xi) * 4 + 3]! >= p.alphaThreshold) {
              home[n * 2] = xi;
              home[n * 2 + 1] = yi;
              cellMap.set(cellOf(gx, gy), n);
              n++;
            }
          }
        }
        /* Full pass without hitting the cap, or gap already huge — accept. */
        if (n < cap) break;
        gap *= 1.3;
      }
      /* Rebuild neighbor links from the accepted sampling grid. */
      nbrL.fill(-1, 0, n);
      nbrR.fill(-1, 0, n);
      nbrU.fill(-1, 0, n);
      nbrD.fill(-1, 0, n);
      if (n > 0) {
        /* Invert cellMap: index -> cell coords would need a second pass.
           Instead re-derive cells from home positions at the final gap. */
        const inv = new Map<number, number>();
        for (const [cell, idx] of cellMap) inv.set(idx, cell);
        for (let i = 0; i < n; i++) {
          const cell = inv.get(i);
          if (cell === undefined) continue;
          const gx = cell % (cellCols + 2);
          const gy = (cell - gx) / (cellCols + 2);
          const l = cellMap.get(cellOf(gx - 1, gy));
          const r = cellMap.get(cellOf(gx + 1, gy));
          const u = cellMap.get(cellOf(gx, gy - 1));
          const dn = cellMap.get(cellOf(gx, gy + 1));
          nbrL[i] = l ?? -1;
          nbrR[i] = r ?? -1;
          nbrU[i] = u ?? -1;
          nbrD[i] = dn ?? -1;
        }
      }
      for (let i = 0; i < n; i++) {
        pos[i * 2] = home[i * 2]!;
        pos[i * 2 + 1] = home[i * 2 + 1]!;
        rpos[i * 2] = home[i * 2]!;
        rpos[i * 2 + 1] = home[i * 2 + 1]!;
        vel[i * 2] = 0;
        vel[i * 2 + 1] = 0;
        velSnap[i * 2] = 0;
        velSnap[i * 2 + 1] = 0;
      }
      acceptedGap = gap;
      return n;
    }

    /* Center the ACTUAL visible glyph bounds (not font metrics) in the view. */
    function centerGlyphBounds(n: number) {
      if (n === 0) return;
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;
      for (let i = 0; i < n; i++) {
        const x = home[i * 2]!;
        const y = home[i * 2 + 1]!;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
      const ox = devW / 2 - (minX + maxX) / 2;
      const oy = devH / 2 - (minY + maxY) / 2;
      host.dataset.glyphWidthRatio = (
        (maxX - minX + acceptedGap) /
        devW
      ).toFixed(3);
      host.dataset.glyphHeightRatio = (
        (maxY - minY + acceptedGap) /
        devH
      ).toFixed(3);
      host.dataset.dpr = dpr.toFixed(2);
      if (Math.abs(ox) < 0.5 && Math.abs(oy) < 0.5) return;
      for (let i = 0; i < n; i++) {
        home[i * 2]! += ox;
        home[i * 2 + 1]! += oy;
        pos[i * 2]! += ox;
        pos[i * 2 + 1]! += oy;
        rpos[i * 2]! += ox;
        rpos[i * 2 + 1]! += oy;
      }
    }

    function initGL(): boolean {
      const opts = {
        antialias: false,
        alpha: false,
        depth: false,
        stencil: false,
        premultipliedAlpha: false,
      };
      gl =
        (view.getContext("webgl", opts) as WebGLRenderingContext | null) ??
        (view.getContext(
          "experimental-webgl",
          opts,
        ) as unknown as WebGLRenderingContext | null);
      if (!gl) return false;
      prog = createProgram(
        gl,
        VERT_SRC,
        propsRef.current.particleShape === "circle"
          ? FRAG_CIRCLE_SRC
          : FRAG_SQUARE_SRC,
      );
      if (!prog) return false;
      posBuf = gl.createBuffer();
      if (!posBuf) return false;
      locPos = gl.getAttribLocation(prog, "a_pos");
      locRes = gl.getUniformLocation(prog, "u_res");
      locPx = gl.getUniformLocation(prog, "u_px");
      locColor = gl.getUniformLocation(prog, "u_color");
      locHighlight = gl.getUniformLocation(prog, "u_highlight");
      locIntensity = gl.getAttribLocation(prog, "a_intensity");
      programShape = propsRef.current.particleShape;
      if (locHighlight) gl.uniform4f(locHighlight, 1, 1, 1, 1);
      gl.disable(gl.BLEND);
      return true;
    }

    function uploadAndDraw() {
      if (!gl || !prog || !posBuf || count === 0) return;
      const p = propsRef.current;
      gl.viewport(0, 0, devW, devH);
      const bg = hexToRgba(p.background);
      gl.clearColor(bg[0], bg[1], bg[2], 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
      for (let i = 0; i < count; i++) {
        renderScratch[i * 3] = rpos[i * 2]!;
        renderScratch[i * 3 + 1] = rpos[i * 2 + 1]!;
        renderScratch[i * 3 + 2] = intensity[i]!;
      }
      gl.bufferData(
        gl.ARRAY_BUFFER,
        renderScratch.subarray(0, count * 3),
        gl.DYNAMIC_DRAW,
      );
      gl.enableVertexAttribArray(locPos);
      gl.vertexAttribPointer(locPos, 2, gl.FLOAT, false, 12, 0);
      gl.enableVertexAttribArray(locIntensity!);
      gl.vertexAttribPointer(locIntensity!, 1, gl.FLOAT, false, 12, 8);
      gl.uniform2f(locRes, devW, devH);
      const solidPointSize =
        acceptedGap * (p.particleShape === "square" ? 1.7 : 1.5);
      gl.uniform1f(locPx, Math.max(1, p.particleSize * dpr, solidPointSize));
      const fg = hexToRgba(p.color);
      if (p.particleShape === "circle") {
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      } else {
        gl.disable(gl.BLEND);
      }
      gl.uniform4f(locColor, fg[0], fg[1], fg[2], fg[3]);
      if (locHighlight) gl.uniform4f(locHighlight, 1, 1, 1, 1);
      gl.drawArrays(gl.POINTS, 0, count);
    }

    function renderFallback2d() {
      const ctx2d = view.getContext("2d");
      if (!ctx2d || !fallbackImg) return;
      ctx2d.setTransform(1, 0, 0, 1, 0, 0);
      ctx2d.clearRect(0, 0, view.width, view.height);
      ctx2d.drawImage(fallbackImg, 0, 0, view.width, view.height);
    }

    interface SimParams {
      h: number;
      twoSigmaSq: number;
      coreTwoSigmaSq: number;
      cut2: number;
      cut: number;
      spring: number;
      dampF: number;
      pressure: number;
      corePressure: number;
      curl: number;
      advection: number;
      vFactor: number;
      maxD: number;
      visc: number;
      useVisc: boolean;
      cohesion: number;
      posCohesion: number;
      shearDepth: number;
      segs: number;
      segX0: Float32Array;
      segY0: Float32Array;
      segX1: Float32Array;
      segY1: Float32Array;
      segVX: Float32Array;
      segVY: Float32Array;
      segW: Float32Array;
      segAdvMul: Float32Array;
      segPressureMul: Float32Array;
      segShearMul: Float32Array;
      segDX: Float32Array;
      segDY: Float32Array;
      segInvLen2: Float32Array;
      segTanX: Float32Array;
      segTanY: Float32Array;
      segMinX: Float32Array;
      segMinY: Float32Array;
      segMaxX: Float32Array;
      segMaxY: Float32Array;
      segPenalty: Float32Array;
      pathMinX: number;
      pathMinY: number;
      pathMaxX: number;
      pathMaxY: number;
    }

    /* One fixed-size physics step (dt in seconds). Trajectory advection owns
       the motion: the strongest nearby pointer-path segment supplies a
       Gaussian brush stroke (advection + normal pressure + shear). No ring
       attractor or desired-radius destination exists anywhere. */
    function simulate(sp: SimParams) {
      const p = propsRef.current;
      const interact = p.interactive && (pointer.active || sp.segs > 0);
      let maxV = 0;
      let maxDsp = 0;

      for (let i = 0; i < count; i++) {
        const ix = i * 2;
        const hx = home[ix]!;
        const hy = home[ix + 1]!;
        let x = pos[ix]!;
        let y = pos[ix + 1]!;
        let vx = vel[ix]!;
        let vy = vel[ix + 1]!;

        const inPathBox =
          interact &&
          sp.segs > 0 &&
          x >= sp.pathMinX &&
          x <= sp.pathMaxX &&
          y >= sp.pathMinY &&
          y <= sp.pathMaxY;
        const inPointerBox =
          pointer.active &&
          Math.abs(x - pointer.x) < sp.cut &&
          Math.abs(y - pointer.y) < sp.cut;
        const locallyActive = inPathBox || inPointerBox;
        const homeDx = x - hx;
        const homeDy = y - hy;
        const moving =
          Math.abs(vx) + Math.abs(vy) > 0.05 ||
          Math.abs(homeDx) + Math.abs(homeDy) > 0.01;
        if (!locallyActive && !moving) continue;

        if (interact) {
          if (inPathBox) {
            /* Use the strongest nearby segment as the continuous field at
               this particle. Segment age participates in the score, so old
               path sections hand off smoothly without stacking circular
               forces or doing an expensive Gaussian for every candidate. */
            let best = -1;
            let bestMetric = Infinity;
            let bestOx = 0;
            let bestOy = 0;
            let bestD2 = 0;
            for (let s = sp.segs - 1; s >= 0; s--) {
              const ax = sp.segX0[s]!;
              const ay = sp.segY0[s]!;
              if (
                x < sp.segMinX[s]! - sp.cut ||
                x > sp.segMaxX[s]! + sp.cut ||
                y < sp.segMinY[s]! - sp.cut ||
                y > sp.segMaxY[s]! + sp.cut
              )
                continue;

              let qx: number;
              let qy: number;
              if (sp.segInvLen2[s]! === 0) {
                qx = ax;
                qy = ay;
              } else {
                let t =
                  ((x - ax) * sp.segDX[s]! + (y - ay) * sp.segDY[s]!) *
                  sp.segInvLen2[s]!;
                t = t < 0 ? 0 : t > 1 ? 1 : t;
                qx = ax + sp.segDX[s]! * t;
                qy = ay + sp.segDY[s]! * t;
              }
              const ox = x - qx;
              const oy = y - qy;
              const d2 = ox * ox + oy * oy;
              if (d2 >= sp.cut2) continue;
              const metric = d2 + sp.segPenalty[s]! * sp.twoSigmaSq;
              if (metric >= bestMetric) continue;
              best = s;
              bestMetric = metric;
              bestOx = ox;
              bestOy = oy;
              bestD2 = d2;
            }

            if (best >= 0) {
              const gaussian = Math.exp(-bestD2 / sp.twoSigmaSq);
              const infl = gaussian * sp.segW[best]!;
              if (infl > 0.002) {
                const dxn = sp.segTanX[best]!;
                const dyn = sp.segTanY[best]!;

                /* A. Advection (primary): inherit segment velocity, sheared
                   across the perpendicular for tapered sheets. */
                const perpx = -dyn;
                const perpy = dxn;
                const shearScale = Math.max(1, sp.cut * 0.25);
                const side = bestOx * perpx + bestOy * perpy;
                const svx = sp.segVX[best]!;
                const svy = sp.segVY[best]!;
                const shearMod =
                  1 +
                  sp.shearDepth *
                    sp.segShearMul[best]! *
                    clamp(side / shearScale, -1, 1);
                const adv =
                  sp.advection * sp.segAdvMul[best]! * infl * shearMod;
                vx += svx * adv * sp.h;
                vy += svy * adv * sp.h;

                /* B. Normal pressure: a broad soft field plus a narrower
                   path core. Neither uses a radius target or radial shell. */
                const dist = Math.sqrt(bestD2);
                if (dist > 0.5) {
                  const gaussian2 = gaussian * gaussian;
                  const coreInfl =
                    gaussian2 * gaussian2 * gaussian * sp.segW[best]!;
                  const pa =
                    sp.pressure * sp.segPressureMul[best]! * infl +
                    sp.corePressure * coreInfl;
                  vx += (bestOx / dist) * pa * sp.h;
                  vy += (bestOy / dist) * pa * sp.h;

                  /* C. Subtle velocity-signed curl; never a standing vortex. */
                  if (sp.vFactor > 0.01) {
                    const cross = svx * bestOy - svy * bestOx;
                    const dir = cross >= 0 ? 1 : -1;
                    const ca = sp.curl * sp.vFactor * infl;
                    vx += (-bestOy / dist) * dir * ca * sp.h;
                    vy += (bestOx / dist) * dir * ca * sp.h;
                  }
                }
              }
            }
          }

          /* Stationary elastic hold: while the cursor rests on the glyph,
             pressure keeps a rounded pull open. There is no advection or
             spin because both remain velocity-gated. */
          if (pointer.active && sp.vFactor < 0.15) {
            const pdx = x - pointer.x;
            const pdy = y - pointer.y;
            if (Math.abs(pdx) < sp.cut && Math.abs(pdy) < sp.cut) {
              const d2 = pdx * pdx + pdy * pdy;
              if (d2 < sp.cut2) {
                const dist = Math.sqrt(d2);
                if (dist > 0.5) {
                  const infl = Math.exp(-d2 / sp.twoSigmaSq);
                  const core = Math.exp(-d2 / sp.coreTwoSigmaSq);
                  const pa =
                    sp.pressure * 0.55 * infl + sp.corePressure * 0.85 * core;
                  vx += (pdx / dist) * pa * sp.h;
                  vy += (pdy / dist) * pa * sp.h;
                }
              }
            }
          }

          /* Neighborhood viscosity, gated to the path neighborhood
             (far-field velocities are ~0, so blending there is a no-op). */
          if (sp.useVisc && sp.visc > 0 && locallyActive) {
            const gx = clamp((x / gridCell) | 0, 0, gridW - 1);
            const gy = clamp((y / gridCell) | 0, 0, gridH - 1);
            let ax = 0;
            let ay = 0;
            let an = 0;
            for (let cy = gy - 1; cy <= gy + 1; cy++) {
              if (cy < 0 || cy >= gridH) continue;
              for (let cx = gx - 1; cx <= gx + 1; cx++) {
                if (cx < 0 || cx >= gridW) continue;
                const ci = cy * gridW + cx;
                ax += gridSX[ci]!;
                ay += gridSY[ci]!;
                an += gridN[ci]!;
              }
            }
            if (an > 1) {
              const vblend = 1 - Math.exp(-sp.visc * sp.h);
              vx += (ax / an - vx) * vblend;
              vy += (ay / an - vy) * vblend;
            }
          }
        }

        /* Soft raster-topology coherence: blend velocity toward the average
           of valid original neighbors (from the frame snapshot, so the pass
           is order-independent), plus a very weak relative-spacing pull.
           This keeps deformed rows readable as fine parallel filaments. */
        if (sp.cohesion > 0 && (locallyActive || moving)) {
          const l = nbrL[i]!;
          const r = nbrR[i]!;
          const u = nbrU[i]!;
          const dn = nbrD[i]!;
          let sx = 0;
          let sy = 0;
          let sn = 0;
          if (l >= 0) {
            sx += velSnap[l * 2]!;
            sy += velSnap[l * 2 + 1]!;
            sn++;
          }
          if (r >= 0) {
            sx += velSnap[r * 2]!;
            sy += velSnap[r * 2 + 1]!;
            sn++;
          }
          if (u >= 0) {
            sx += velSnap[u * 2]!;
            sy += velSnap[u * 2 + 1]!;
            sn++;
          }
          if (dn >= 0) {
            sx += velSnap[dn * 2]!;
            sy += velSnap[dn * 2 + 1]!;
            sn++;
          }
          if (sn > 0) {
            const cblend = 1 - Math.exp(-sp.cohesion * sp.h);
            vx += (sx / sn - vx) * cblend;
            vy += (sy / sn - vy) * cblend;
            if (sp.posCohesion > 0) {
              /* Weak relative-spacing restoration toward home offsets. */
              let ex = 0;
              let ey = 0;
              let en = 0;
              if (l >= 0) {
                ex += pos[l * 2]! - x - (home[l * 2]! - hx);
                ey += pos[l * 2 + 1]! - y - (home[l * 2 + 1]! - hy);
                en++;
              }
              if (r >= 0) {
                ex += pos[r * 2]! - x - (home[r * 2]! - hx);
                ey += pos[r * 2 + 1]! - y - (home[r * 2 + 1]! - hy);
                en++;
              }
              if (u >= 0) {
                ex += pos[u * 2]! - x - (home[u * 2]! - hx);
                ey += pos[u * 2 + 1]! - y - (home[u * 2 + 1]! - hy);
                en++;
              }
              if (dn >= 0) {
                ex += pos[dn * 2]! - x - (home[dn * 2]! - hx);
                ey += pos[dn * 2 + 1]! - y - (home[dn * 2 + 1]! - hy);
                en++;
              }
              if (en > 0) {
                vx += (ex / en) * sp.posCohesion * sp.h;
                vy += (ey / en) * sp.posCohesion * sp.h;
              }
            }
          }
        }

        /* Soft home spring + exponential damping + integrate. */
        vx += (hx - x) * sp.spring * sp.h;
        vy += (hy - y) * sp.spring * sp.h;
        vx *= sp.dampF;
        vy *= sp.dampF;
        x += vx * sp.h;
        y += vy * sp.h;

        /* Clamp excursion from home. */
        const ox = x - hx;
        const oy = y - hy;
        const od = Math.sqrt(ox * ox + oy * oy);
        intensity[i] = sp.maxD > 0 ? Math.min(1, od / sp.maxD) : 0;
        if (od > sp.maxD) {
          const f = sp.maxD / od;
          x = hx + ox * f;
          y = hy + oy * f;
          vx *= 0.6;
          vy *= 0.6;
        }

        pos[ix] = x;
        pos[ix + 1] = y;
        vel[ix] = vx;
        vel[ix + 1] = vy;
        const av = Math.abs(vx) + Math.abs(vy);
        if (av > maxV) maxV = av;
        if (od > maxDsp) maxDsp = od;
      }
      return { maxV, maxDsp };
    }

    function rebuildViscosityGrid(
      minX: number,
      minY: number,
      maxX: number,
      maxY: number,
    ) {
      for (let i = 0; i < gridSX.length; i++) {
        gridSX[i] = 0;
        gridSY[i] = 0;
        gridN[i] = 0;
      }
      for (let i = 0; i < count; i++) {
        if (
          pos[i * 2]! < minX ||
          pos[i * 2]! > maxX ||
          pos[i * 2 + 1]! < minY ||
          pos[i * 2 + 1]! > maxY
        )
          continue;
        const gx = clamp((pos[i * 2]! / gridCell) | 0, 0, gridW - 1);
        const gy = clamp((pos[i * 2 + 1]! / gridCell) | 0, 0, gridH - 1);
        const ci = gy * gridW + gx;
        gridSX[ci]! += vel[i * 2]!;
        gridSY[ci]! += vel[i * 2 + 1]!;
        gridN[ci]! += 1;
      }
    }

    /* Segment scratch (chronological pointer path, rebuilt per frame). */
    const segX0 = new Float32Array(TRAIL_MAX);
    const segY0 = new Float32Array(TRAIL_MAX);
    const segX1 = new Float32Array(TRAIL_MAX);
    const segY1 = new Float32Array(TRAIL_MAX);
    const segVX = new Float32Array(TRAIL_MAX);
    const segVY = new Float32Array(TRAIL_MAX);
    const segW = new Float32Array(TRAIL_MAX);
    const segAdvMul = new Float32Array(TRAIL_MAX);
    const segPressureMul = new Float32Array(TRAIL_MAX);
    const segShearMul = new Float32Array(TRAIL_MAX);
    const segDX = new Float32Array(TRAIL_MAX);
    const segDY = new Float32Array(TRAIL_MAX);
    const segInvLen2 = new Float32Array(TRAIL_MAX);
    const segTanX = new Float32Array(TRAIL_MAX);
    const segTanY = new Float32Array(TRAIL_MAX);
    const segMinX = new Float32Array(TRAIL_MAX);
    const segMinY = new Float32Array(TRAIL_MAX);
    const segMaxX = new Float32Array(TRAIL_MAX);
    const segMaxY = new Float32Array(TRAIL_MAX);
    const segPenalty = new Float32Array(TRAIL_MAX);
    const trailOrder = new Uint8Array(TRAIL_MAX);

    function prepareSegmentMotion(index: number, vx: number, vy: number) {
      const speed = Math.sqrt(vx * vx + vy * vy);
      const speed01 = clamp(speed / (POINTER_REFERENCE_SPEED * dpr), 0, 1);
      segAdvMul[index] =
        (0.7 + 1.1 * speed01) * (ADVECTION_SAT / (ADVECTION_SAT + speed));
      segPressureMul[index] = 0.8 + 0.2 * speed01;
      segShearMul[index] = 0.7 + 0.8 * speed01;
      const dx = segX1[index]! - segX0[index]!;
      const dy = segY1[index]! - segY0[index]!;
      const len2 = dx * dx + dy * dy;
      segDX[index] = dx;
      segDY[index] = dy;
      segInvLen2[index] = len2 > 1e-6 ? 1 / len2 : 0;
      const invLen = len2 > 1e-6 ? 1 / Math.sqrt(len2) : 0;
      segTanX[index] = len2 > 1e-6 ? dx * invLen : 1;
      segTanY[index] = len2 > 1e-6 ? dy * invLen : 0;
      segMinX[index] = Math.min(segX0[index]!, segX1[index]!);
      segMinY[index] = Math.min(segY0[index]!, segY1[index]!);
      segMaxX[index] = Math.max(segX0[index]!, segX1[index]!);
      segMaxY[index] = Math.max(segY0[index]!, segY1[index]!);
      segPenalty[index] = -Math.log(Math.max(0.000001, segW[index]!));
    }

    function snapToHomes() {
      const n2 = count * 2;
      pos.set(home.subarray(0, n2), 0);
      rpos.set(home.subarray(0, n2), 0);
      vel.fill(0, 0, n2);
      velSnap.fill(0, 0, n2);
      intensity.fill(0, 0, count);
      uploadAndDraw();
    }

    function frame(now: number) {
      if (destroyed || !running) return;
      rafId = requestAnimationFrame(frame);
      if (lastTime < 0) lastTime = now;
      const dt = Math.min(Math.max((now - lastTime) / 1000, 0), 0.05);
      lastTime = now;
      if (dt <= 0) return;
      emaFps += (1 / dt - emaFps) * 0.08;

      const p = propsRef.current;

      /* Smooth the pointer inside the loop (events only set targets). */
      if (pointer.snap) {
        pointer.x = pointer.tx;
        pointer.y = pointer.ty;
        pointer.vx = 0;
        pointer.vy = 0;
        pointer.snap = false;
      } else {
        const follow = 1 - Math.exp(-p.pointerFollow * dt);
        const nx = pointer.x + (pointer.tx - pointer.x) * follow;
        const ny = pointer.y + (pointer.ty - pointer.y) * follow;
        let rawVX = (nx - pointer.x) / dt;
        let rawVY = (ny - pointer.y) / dt;
        const rawSpeed = Math.sqrt(rawVX * rawVX + rawVY * rawVY);
        const maxPointerSpeed = MAX_POINTER_SPEED * dpr;
        if (rawSpeed > maxPointerSpeed) {
          const velocityScale = maxPointerSpeed / rawSpeed;
          rawVX *= velocityScale;
          rawVY *= velocityScale;
        }
        const vfollow = 1 - Math.exp(-p.velocityFollow * dt);
        pointer.vx += (rawVX - pointer.vx) * vfollow;
        pointer.vy += (rawVY - pointer.vy) * vfollow;
        pointer.x = nx;
        pointer.y = ny;
      }
      const speed = Math.sqrt(
        pointer.vx * pointer.vx + pointer.vy * pointer.vy,
      );

      /* Push a trail sample only while genuinely moving (flow memory).
         A stationary cursor creates no new samples: advection and shear
         decay to zero and existing deformation dissipates. */
      if (pointer.active && speed > TRAIL_MIN_SPEED) {
        const last = (trHead + TRAIL_MAX - 1) % TRAIL_MAX;
        const hasLast = trCount > 0 && trAge[last]! < 999;
        const ldx = hasLast ? pointer.x - trX[last]! : 999;
        const ldy = hasLast ? pointer.y - trY[last]! : 999;
        if (
          !hasLast ||
          ldx * ldx + ldy * ldy >= TRAIL_MIN_DIST * TRAIL_MIN_DIST
        ) {
          trX[trHead] = pointer.x;
          trY[trHead] = pointer.y;
          trVX[trHead] = pointer.vx;
          trVY[trHead] = pointer.vy;
          trAge[trHead] = 0;
          trHead = (trHead + 1) % TRAIL_MAX;
          if (trCount < TRAIL_MAX) trCount++;
        }
      }
      for (let s = 0; s < trCount; s++) trAge[s]! += dt;

      const R = Math.max(1, p.interactionRadius * dpr);
      const sigma = R * GAUSSIAN_SIGMA;
      const twoSigmaSq = 2 * sigma * sigma;
      const coreSigma = R * CORE_GAUSSIAN_SIGMA;
      const coreTwoSigmaSq = 2 * coreSigma * coreSigma;
      const cut = GAUSSIAN_CUTOFF * sigma;
      const cut2 = cut * cut;
      /* New direct physical props win; otherwise map legacy friendly props:
         spring = returnSpeed * 225 (0.08 -> ~18/s^2),
         damp   = (1 - damping) * 60 (0.90 -> ~6/s),
         advection = gain * strength, defaulting to the legacy velocity curve. */
      const spring = p.homeStrength ?? p.returnSpeed * 225;
      /* Damping disambiguation: values > 2 are physical rates (1/s, e.g.
         reference 5.5); legacy retention values (≤ 1) map to rates. */
      const damp =
        p.damping > 2 ? p.damping : (1 - clamp(p.damping, 0.5, 0.999)) * 60;
      const pressure =
        p.pressureStrength !== undefined
          ? PRESSURE_GAIN * p.pressureStrength
          : 250 * p.forceStrength;
      const corePressure = CORE_PRESSURE_GAIN * p.corePressureStrength;
      const curl = CURL_BASE * p.curlStrength;
      const advection =
        p.advectionStrength !== undefined
          ? ADVECTION_GAIN * p.advectionStrength
          : ADVECTION_GAIN / 3 +
            (10 * p.velocityInfluence * ADVECTION_GAIN) / 3;
      const vFactor = clamp(speed / 600, 0, 1);
      const maxD = Math.max(1, p.maxDisplacement * dpr);
      const cohesion = COHESION_GAIN * (p.topologyCohesion ?? 0.1);
      const posCohesion = cohesion * POSITION_COHESION_RATIO;
      const shearDepth = SHEAR_GAIN * (p.shearStrength ?? 0.2);

      /* Build chronological path segments from the fading trail. Weights
         decay smoothly so the stroke persists briefly, then releases. */
      const trailLen = clamp(Math.round(p.trailLength ?? 16), 2, TRAIL_MAX);
      const trailWeight = (idx: number) => {
        const sampleSpeed = Math.sqrt(
          trVX[idx]! * trVX[idx]! + trVY[idx]! * trVY[idx]!,
        );
        const sampleSpeed01 = clamp(
          sampleSpeed / (POINTER_REFERENCE_SPEED * dpr),
          0,
          1,
        );
        const lifetimeScale = 0.8 + 0.6 * sampleSpeed01;
        const decayK =
          3 / Math.max(0.05, (p.trailLifetime ?? 0.32) * lifetimeScale);
        return Math.exp(-decayK * trAge[idx]!);
      };
      let segs = 0;
      let pathMinX = Infinity;
      let pathMinY = Infinity;
      let pathMaxX = -Infinity;
      let pathMaxY = -Infinity;
      {
        /* Collect valid samples oldest -> newest. */
        let orderCount = 0;
        for (let k = 0; k < Math.min(trCount, trailLen); k++) {
          const idx = (trHead - 1 - k + TRAIL_MAX * 2) % TRAIL_MAX;
          const w = trailWeight(idx);
          if (w < 0.02) continue;
          trailOrder[orderCount++] = idx;
        }
        for (let k = 0; k < orderCount / 2; k++) {
          const opposite = orderCount - 1 - k;
          const tmp = trailOrder[k]!;
          trailOrder[k] = trailOrder[opposite]!;
          trailOrder[opposite] = tmp;
        }
        /* Pair every other history sample into a longer continuous segment.
           The full temporal span remains represented while redundant,
           nearly-collinear evaluations are removed from the hot loop. */
        for (let k = 0; k + 1 < orderCount && segs < TRAIL_MAX; k += 2) {
          const a = trailOrder[k]!;
          const b = trailOrder[Math.min(k + 2, orderCount - 1)]!;
          const wb = trailWeight(b);
          segX0[segs] = trX[a]!;
          segY0[segs] = trY[a]!;
          segX1[segs] = trX[b]!;
          segY1[segs] = trY[b]!;
          segVX[segs] = (trVX[a]! + trVX[b]!) / 2;
          segVY[segs] = (trVY[a]! + trVY[b]!) / 2;
          segW[segs] = wb;
          prepareSegmentMotion(segs, segVX[segs]!, segVY[segs]!);
          segs++;
          pathMinX = Math.min(pathMinX, trX[a]!, trX[b]!);
          pathMinY = Math.min(pathMinY, trY[a]!, trY[b]!);
          pathMaxX = Math.max(pathMaxX, trX[a]!, trX[b]!);
          pathMaxY = Math.max(pathMaxY, trY[a]!, trY[b]!);
        }
        /* Live tip segment: newest sample -> current smoothed pointer,
           so the brush reaches the cursor instead of lagging one sample. */
        if (
          orderCount > 0 &&
          pointer.active &&
          speed > TRAIL_MIN_SPEED &&
          segs < TRAIL_MAX
        ) {
          const a = trailOrder[orderCount - 1]!;
          segX0[segs] = trX[a]!;
          segY0[segs] = trY[a]!;
          segX1[segs] = pointer.x;
          segY1[segs] = pointer.y;
          segVX[segs] = pointer.vx;
          segVY[segs] = pointer.vy;
          segW[segs] = 1;
          prepareSegmentMotion(segs, pointer.vx, pointer.vy);
          segs++;
          pathMinX = Math.min(pathMinX, pointer.x);
          pathMinY = Math.min(pathMinY, pointer.y);
          pathMaxX = Math.max(pathMaxX, pointer.x);
          pathMaxY = Math.max(pathMaxY, pointer.y);
        }
      }
      if (segs > 0) {
        pathMinX -= cut;
        pathMinY -= cut;
        pathMaxX += cut;
        pathMaxY += cut;
      }

      const useVisc = count > 0 && (pointer.active || segs > 0);
      if (useVisc) {
        const gridMinX = Math.min(pathMinX, pointer.x - cut);
        const gridMinY = Math.min(pathMinY, pointer.y - cut);
        const gridMaxX = Math.max(pathMaxX, pointer.x + cut);
        const gridMaxY = Math.max(pathMaxY, pointer.y + cut);
        rebuildViscosityGrid(gridMinX, gridMinY, gridMaxX, gridMaxY);
      }

      /* Snapshot neighbor velocities once per frame (order independence). */
      velSnap.set(vel.subarray(0, count * 2));

      /* Advance once per paint. The old 120 Hz accumulator ran two full
         particle passes on a typical 60 Hz display, delaying pointer input
         in dense previews. All forces use seconds, so a capped frame delta
         preserves the motion while avoiding redundant main-thread work. */
      const t0 = performance.now();
      const stepDt = Math.min(dt, MAX_FRAME_DT);
      const sp: SimParams = {
        h: stepDt,
        twoSigmaSq,
        coreTwoSigmaSq,
        cut2,
        cut,
        spring,
        dampF: 1,
        pressure,
        corePressure,
        curl,
        advection,
        vFactor,
        maxD,
        visc: p.viscosity,
        useVisc,
        cohesion,
        posCohesion,
        shearDepth,
        segs,
        segX0,
        segY0,
        segX1,
        segY1,
        segVX,
        segVY,
        segW,
        segAdvMul,
        segPressureMul,
        segShearMul,
        segDX,
        segDY,
        segInvLen2,
        segTanX,
        segTanY,
        segMinX,
        segMinY,
        segMaxX,
        segMaxY,
        segPenalty,
        pathMinX,
        pathMinY,
        pathMaxX,
        pathMaxY,
      };
      sp.dampF = Math.exp(-damp * stepDt);
      const { maxV, maxDsp } = simulate(sp);
      const t1 = performance.now();

      /* Draw the current simulation state rather than one fixed step behind. */
      rpos.set(pos.subarray(0, count * 2), 0);
      uploadAndDraw();
      const t2 = performance.now();

      /* Perf probes (EMA) for measurement. */
      const kProbe = 0.05;
      emaSim += (t1 - t0 - emaSim) * kProbe;
      emaUpload += (t2 - t1 - emaUpload) * kProbe;
      if (now - lastProbeWrite > 1000) {
        lastProbeWrite = now;
        const host = containerRef.current;
        if (host) {
          host.dataset.simMs = emaSim.toFixed(2);
          host.dataset.uploadMs = emaUpload.toFixed(2);
          host.dataset.fps = emaFps.toFixed(1);
        }
      }

      if (
        !pointer.active &&
        segs === 0 &&
        maxV < SLEEP_EPS_V &&
        maxDsp < SLEEP_EPS_D
      ) {
        /* Snap the final subpixel residue to exact homes before parking. */
        snapToHomes();
        running = false;
        sleeping = true;
        return;
      }
    }

    function wake() {
      if (destroyed || contextLost || useFallback2d || reduced.matches) return;
      if (!visible || document.hidden) return;
      if (running) return;
      running = true;
      sleeping = false;
      lastTime = -1;
      rafId = requestAnimationFrame(frame);
    }

    function rebuild() {
      if (destroyed) return;
      const p = propsRef.current;
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (w === 0 || h === 0) return;
      cssW = w;
      cssH = h;
      dpr = Math.min(window.devicePixelRatio || 1, Math.max(1, p.maxDpr));
      devW = Math.max(1, Math.round(w * dpr));
      devH = Math.max(1, Math.round(h * dpr));
      view.width = devW;
      view.height = devH;
      view.style.width = `${w}px`;
      view.style.height = `${h}px`;

      if (gl && prog && programShape !== p.particleShape) {
        const nextProgram = createProgram(
          gl,
          VERT_SRC,
          p.particleShape === "circle" ? FRAG_CIRCLE_SRC : FRAG_SQUARE_SRC,
        );
        if (nextProgram) {
          gl.deleteProgram(prog);
          prog = nextProgram;
          locPos = gl.getAttribLocation(prog, "a_pos");
          locRes = gl.getUniformLocation(prog, "u_res");
          locPx = gl.getUniformLocation(prog, "u_px");
          locColor = gl.getUniformLocation(prog, "u_color");
          programShape = p.particleShape;
        }
      }

      /* Size the viscosity grid (cell ~30% of the interaction radius). */
      gridCell = Math.max(4, p.interactionRadius * dpr * VISCOSITY_CELL);
      gridW = Math.min(256, Math.max(1, Math.ceil(devW / gridCell)));
      gridH = Math.min(256, Math.max(1, Math.ceil(devH / gridCell)));
      gridCell = Math.max(devW / gridW, devH / gridH);
      gridSX = new Float32Array(gridW * gridH);
      gridSY = new Float32Array(gridW * gridH);
      gridN = new Uint32Array(gridW * gridH);

      /* Reset flow state so a new glyph never inherits old momentum. */
      trCount = 0;
      trHead = 0;
      for (let s = 0; s < TRAIL_MAX; s++) trAge[s] = 999;
      pointer.snap = true;

      const mask = rasterize();
      if (mask) {
        count = Math.min(sampleInto(mask), cap);
        centerGlyphBounds(count);
        host.dataset.particles = String(count);
        host.dataset.renderer = useFallback2d ? "fallback2d" : "webgl";
        fallbackImg = null;
        if (useFallback2d) {
          /* rebuild the 2D fallback image (tinted via temp canvas) */
          const tint = document.createElement("canvas");
          tint.width = devW;
          tint.height = devH;
          const tctx = tint.getContext("2d");
          if (tctx) {
            tctx.drawImage(offscreen, 0, 0);
            tctx.globalCompositeOperation = "source-in";
            tctx.fillStyle = p.color;
            tctx.fillRect(0, 0, devW, devH);
            const bg = document.createElement("canvas");
            bg.width = devW;
            bg.height = devH;
            const bctx = bg.getContext("2d");
            if (bctx) {
              bctx.fillStyle = p.background;
              bctx.fillRect(0, 0, devW, devH);
              bctx.drawImage(tint, 0, 0);
              fallbackImg = bg;
            }
          }
          renderFallback2d();
        } else if (gl && prog && posBuf) {
          uploadAndDraw();
        }
      } else {
        count = 0;
      }

      pointer.active = false;
      pointer.vx = 0;
      pointer.vy = 0;
      if (!reduced.matches && !useFallback2d && !contextLost) {
        /* show the resting glyph immediately, then park until interaction */
        if (gl) uploadAndDraw();
        running = false;
        sleeping = true;
      } else if (gl && !useFallback2d) {
        uploadAndDraw();
      }
    }
    rebuildRef.current = rebuild;

    function queueRebuild() {
      if (rebuildQueued) return;
      rebuildQueued = true;
      rebuildTimer = window.setTimeout(() => {
        rebuildQueued = false;
        rebuildTimer = 0;
        rebuild();
      }, 120);
    }

    /* ------------------------------ events ------------------------------ */
    /* Handlers write TARGETS only — smoothing/velocity happen in the loop. */
    const toDevice = (clientX: number, clientY: number) => {
      const rect = view.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return null;
      return {
        x: ((clientX - rect.left) / rect.width) * devW,
        y: ((clientY - rect.top) / rect.height) * devH,
      };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const pt = toDevice(e.clientX, e.clientY);
      if (!pt) return;
      pointer.tx = pt.x;
      pointer.ty = pt.y;
      if (!pointer.active) {
        pointer.active = true;
        pointer.snap = true;
      }
      wake();
    };
    const onPointerEnter = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const pt = toDevice(e.clientX, e.clientY);
      if (pt) {
        pointer.tx = pt.x;
        pointer.ty = pt.y;
      }
      pointer.active = true;
      pointer.snap = true;
      wake();
    };
    const onPointerLeave = () => {
      /* Targets freeze; smoothed velocity decays in the loop, giving the
         two-stage return: momentum dissipates, then homes reform.
         Trail segments persist briefly via age decay, then release. */
      pointer.active = false;
      wake(); /* keep integrating so displaced particles glide home */
    };
    const onReducedChange = () => {
      if (reduced.matches) {
        cancelAnimationFrame(rafId);
        running = false;
        pointer.active = false;
        rebuild();
      } else {
        rebuild();
      }
    };
    const onContextLost = (e: Event) => {
      e.preventDefault();
      contextLost = true;
      cancelAnimationFrame(rafId);
      running = false;
    };
    const onContextRestored = () => {
      gl = null;
      programShape = null;
      prog = null;
      posBuf = null;
      contextLost = false;
      if (initGL()) {
        rebuild();
      } else {
        useFallback2d = true;
        rebuild();
      }
    };
    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
        running = false;
        lastTime = -1;
      } else if (
        visible &&
        !sleeping &&
        !reduced.matches &&
        !useFallback2d &&
        !contextLost
      ) {
        wake();
      }
    };

    /* ------------------------------ boot ------------------------------ */
    if (!initGL()) {
      useFallback2d = true;
    }
    rebuild();

    host.addEventListener("pointermove", onPointerMove, { passive: true });
    host.addEventListener("pointerenter", onPointerEnter, { passive: true });
    host.addEventListener("pointerleave", onPointerLeave, { passive: true });
    view.addEventListener("webglcontextlost", onContextLost);
    view.addEventListener("webglcontextrestored", onContextRestored);
    reduced.addEventListener?.("change", onReducedChange);
    document.addEventListener("visibilitychange", onVisibilityChange);

    const ro = new ResizeObserver(() => queueRebuild());
    ro.observe(host);

    const io = new IntersectionObserver(
      (entries) => {
        visible = !!entries[0]?.isIntersecting;
        if (!visible) {
          cancelAnimationFrame(rafId);
          running = false;
          lastTime = -1;
        } else if (
          !sleeping &&
          !reduced.matches &&
          !useFallback2d &&
          !contextLost
        ) {
          wake();
        }
      },
      { threshold: 0 },
    );
    io.observe(host);

    /* Rebuild once web fonts arrive so homes match the real glyphs. */
    let fontToken = 0;
    const currentToken = () => fontToken;
    try {
      const fam = primaryFontFamily(propsRef.current.fontFamily);
      const tok = ++fontToken;
      document.fonts
        .load(
          `${propsRef.current.fontStyle} ${propsRef.current.fontWeight} 100px "${fam}"`,
        )
        .then(() => {
          if (!destroyed && tok === currentToken()) rebuild();
        })
        .catch(() => undefined);
      document.fonts.ready
        .then(() => {
          if (!destroyed && tok === currentToken()) rebuild();
        })
        .catch(() => undefined);
    } catch {
      /* document.fonts unavailable — keep fallback rasterization */
    }

    return () => {
      destroyed = true;
      rebuildRef.current = null;
      cancelAnimationFrame(rafId);
      if (rebuildTimer) window.clearTimeout(rebuildTimer);
      ro.disconnect();
      io.disconnect();
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerenter", onPointerEnter);
      host.removeEventListener("pointerleave", onPointerLeave);
      view.removeEventListener("webglcontextlost", onContextLost);
      view.removeEventListener("webglcontextrestored", onContextRestored);
      reduced.removeEventListener?.("change", onReducedChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      /* NOTE: deliberately no loseContext() here. Forcing a context loss on
         unmount poisons remounts (StrictMode / HMR receive the same lost
         context back from getContext), which breaks re-init and also blocks
         the 2D fallback. The browser reclaims the context with the canvas. */
      if (gl && !gl.isContextLost()) {
        try {
          if (posBuf) gl.deleteBuffer(posBuf);
          if (prog) gl.deleteProgram(prog);
        } catch {
          /* ignore teardown errors */
        }
      }
      gl = null;
    };
    // Mount-once engine: live values flow via propsRef/rebuildRef.
  }, []);

  /* Rebuild resting particle homes when text/layout-defining props change. */
  useEffect(() => {
    rebuildRef.current?.();
  }, [
    text,
    fontFamilyProp,
    fontWeightProp,
    fontStyle,
    fontSize,
    letterSpacing,
    lineHeight,
    fitMode,
    paddingProp,
    minScale,
    maxScaleProp,
    align,
    verticalAlign,
    maxLines,
    outline,
    strokeWidth,
    fillOpacity,
    strokeOpacity,
    sampleQuality,
    particleSpacingProp,
    particleSizeProp,
    particleShapeProp,
    colorProp,
    backgroundProp,
    interactionRadiusProp,
    influenceRadiusProp,
    alphaThreshold,
    maxParticlesProp,
    maxDprProp,
    preset,
  ]);

  const { "aria-label": ariaLabel, ...divProps } = rest;

  return (
    <div
      ref={containerRef}
      {...divProps}
      role="img"
      aria-label={ariaLabel ?? text}
      className={cn(
        "relative h-[420px] w-full overflow-hidden select-none",
        className,
      )}
      style={{
        background: resolved.background,
        touchAction: "pan-y",
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 block h-full w-full"
        style={
          outline
            ? { filter: "drop-shadow(0 0 1px rgba(0, 0, 0, 0.65))" }
            : undefined
        }
      />
    </div>
  );
}

export default FluidParticleText;
