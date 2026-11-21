"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import {
  WebGLErrorBoundary,
  WebGLFallback,
} from "@workspace/ui/components/webgl-error-boundary";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type GlitchLiquidTextFit = "responsive" | "contain" | "cover" | "fixed";
export type GlitchLiquidTextAs = "h1" | "h2" | "h3" | "p" | "div" | "span";

export interface GlitchLiquidTextProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number | string;
  lineHeight?: number;
  letterSpacing?: number;

  textColor?: string;
  backgroundColor?: string;

  distortionStrength?: number;
  distortionRadius?: number;
  distortionDecay?: number;

  noiseStrength?: number;
  noiseScale?: number;
  noiseSpeed?: number;

  chromaticAberration?: number;
  glitchStrength?: number;

  liquidStrength?: number;
  velocityInfluence?: number;

  starburstStrength?: number;
  waveStrength?: number;
  pinchStrength?: number;

  lightIntensity?: number;
  grainStrength?: number;

  cursorEnabled?: boolean;
  cursorSize?: number;
  cursorColor?: string;

  interactive?: boolean;
  autoAnimate?: boolean;
  fit?: GlitchLiquidTextFit;

  /** Semantic element used for the screen-reader text node. */
  as?: GlitchLiquidTextAs;
  ariaLabel?: string;
}

/* ------------------------------------------------------------------ */
/* Shaders                                                             */
/*                                                                     */
/* Pipeline overview (all in the fragment shader):                     */
/*  1. POINTER FIELD — aspect-corrected, velocity-stretched soft field */
/*     centered slightly behind the cursor so the type feels dragged.  */
/*  2. LIQUID DISPLACEMENT — radial push + tangential swirl driven by  */
/*     domain-warped FBM noise, plus a velocity smear along motion.    */
/*  3. GLITCH SLICES — sparse quantized Y bands offset horizontally,   */
/*     gated by influence/speed so they only tear disturbed areas.     */
/*  4. CHROMATIC ABERRATION — per-channel glyph sampling; offset grows */
/*     with local distortion + speed, ~zero at rest.                   */
/*  5. LIGHT RAYS — a few taps along a fixed cinematic direction,      */
/*     masked to glyph edges and scaled by disturbance.                */
/*  6. GRAIN + VIGNETTE — fine monochromatic grain, faint vignette.    */
/* ------------------------------------------------------------------ */

const VERTEX_SHADER = `
attribute vec2 aPosition;
varying vec2 vUv;

void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

varying vec2 vUv;

uniform sampler2D uText;
uniform vec2 uResolution;
uniform vec4 uRect; // offset.xy, scale.xy : quad UV -> texture UV

uniform vec2 uMouse;      // smoothed pointer, UV space (y-up)
uniform vec2 uVel;        // smoothed pointer velocity, UV/sec
uniform float uPresence;  // 0..1 smoothed hover energy (viscous decay)
uniform float uTime;

uniform float uDistortionStrength;
uniform float uDistortionRadius;
uniform float uNoiseStrength;
uniform float uNoiseScale;
uniform float uNoiseSpeed;
uniform float uChromaticAberration;
uniform float uGlitchStrength;
uniform float uLiquidStrength;
uniform float uVelocityInfluence;
uniform float uStarburstStrength;
uniform float uWaveStrength;
uniform float uPinchStrength;
uniform float uLightIntensity;
uniform float uGrain;
uniform float uIdleLevel;

uniform vec3 uTextColor;
uniform vec3 uBackground;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.80, 0.60, -0.60, 0.80);
  for (int i = 0; i < 3; i++) {
    v += a * vnoise(p);
    p = rot * p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

float glyphAlpha(vec2 tUV) {
  if (tUV.x < 0.0 || tUV.x > 1.0 || tUV.y < 0.0 || tUV.y > 1.0) return 0.0;
  return texture2D(uText, tUV).a;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float speed = length(uVel);

  /* ---- 1. pointer field (stretched along motion, trailing behind) -- */
  vec2 trailCenter = uMouse - uVel * 0.055;
  vec2 rel = vUv - trailCenter;
  rel.x *= aspect;

  vec2 vdir = speed > 0.0001 ? uVel / speed : vec2(1.0, 0.0);
  vec2 vd = vdir;
  vd.x *= aspect;
  vd /= max(length(vd), 0.0001);
  float along = dot(rel, vd);
  vec2 perpV = rel - along * vd;
  float stretch = 1.0 + min(speed * 1.4, 1.6);
  vec2 fieldP = vec2(along / stretch, length(perpV));
  float dist = length(fieldP);

  float r = max(uDistortionRadius, 0.0001);
  float influence =
    (1.0 - smoothstep(r * 0.05, r, dist)) * uPresence;

  /* ---- 2. organic noise (domain-warped, evolves with time) ---------- */
  float n1 = fbm(vUv * uNoiseScale + vec2(uTime * 0.03, -uTime * uNoiseSpeed * 0.35));
  float n2 = fbm(vUv * uNoiseScale * 2.13 + n1 * 1.6 + vec2(-uTime * 0.05, uTime * uNoiseSpeed * 0.5));

  vec2 dirN = fieldP / max(dist, r * 0.25);
  vec2 tang = vec2(-dirN.y, dirN.x);
  float swirl = (n2 - 0.5) * 2.0;

  float angle = atan(rel.y, rel.x);
  float swirlAngle = angle + dist * (1.2 + n1 * 0.7);
  float rays = sin(swirlAngle * 15.0 - uTime * 1.5 + n2 * 0.7);
  float wave = sin(dist * 32.0 - uTime * 2.1 + n2 * 6.2831853);

  vec2 burstDir = normalize(rel + (vec2(n1, n2) - 0.5) * 0.06 + vec2(0.0001));
  vec2 twistDir = vec2(-burstDir.y, burstDir.x);
  burstDir = normalize(mix(burstDir, twistDir, 0.25 + n1 * 0.1));

  vec2 liquid = dirN * (0.60 + 0.55 * n1) + tang * swirl * uLiquidStrength;
  vec2 starburst = burstDir * (rays * uStarburstStrength * r * 0.42 * influence);
  vec2 waveDisp = dirN * (wave * uWaveStrength * r * 0.22 * influence);
  vec2 pinch = -dirN * (uPinchStrength * r * 0.35 * influence);

  vec2 smearDir = speed > 0.0001 ? uVel / speed : vec2(0.0);
  float smearMag = min(speed * uVelocityInfluence, 0.016);
  vec2 smear = smearDir * smearMag;

  // Gains are staged against the interaction radius so that
  // distortionStrength reads as "fraction of the field radius" and the
  // effect stays tasteful across container sizes.
  vec2 dispAspect =
    liquid * (uDistortionStrength * r * 0.6 * influence) +
    starburst +
    waveDisp +
    pinch +
    smear * influence +
    (vec2(n1 - 0.5, n2 - 0.5)) * (uNoiseStrength * r * 0.8 * influence);

  float localDistort = min(length(dispAspect) * 30.0, 2.0);

  // Clamp peak displacement so fast flicks smear instead of tearing holes.
  float dLen = length(dispAspect);
  float dMax = r * 0.65;
  if (dLen > dMax) dispAspect *= dMax / max(dLen, 0.0001);

  // Idle drift: a whisper (~a pixel) of the hover intensity so untouched
  // type stays crisp. Deliberately excluded from localDistort, and faded
  // out while touching so hover motion is pure pointer flow.
  dispAspect += (vec2(n1 - 0.5, n2 - 0.5)) * (uIdleLevel * uDistortionStrength * r * 0.05 * (1.0 - uPresence * 0.7));

  vec2 disp = vec2(dispAspect.x / aspect, dispAspect.y);

  vec2 displacedUV = vUv - disp;

  /* ---- quad UV -> text texture UV ----------------------------------- */
  vec2 tUV = (displacedUV - uRect.xy) / uRect.zw;

  /* ---- 3. glitch slices (sparse, disturbance-gated) ----------------- */
  if (uGlitchStrength > 0.0001 && influence > 0.01) {
    float band = floor(tUV.y * 90.0 + n1 * 6.0);
    float g = hash(vec2(band, floor(uTime * 13.0)));
    float thresh = 0.995 - min(speed * 0.15, 0.05) - influence * 0.02;
    float slice = step(thresh, g) * uGlitchStrength * smoothstep(0.15, 0.6, influence);
    tUV.x += (g - 0.5) * 0.014 * slice;
    tUV.y += (hash(vec2(band + 7.0, floor(uTime * 13.0))) - 0.5) * 0.003 * slice;
  }

  /* ---- 4. chromatic aberration (edge-localized) --------------------- */
  vec2 chromaDir = length(disp) > 0.00001 ? disp / length(disp) : vec2(1.0 / aspect, 0.0);
  float chromaEnergy = clamp(localDistort * 0.65 + speed * 0.45, 0.0, 1.0);
  float chromaMag = uChromaticAberration * influence * (0.25 + chromaEnergy * 0.75);
  chromaMag += 0.00012 * uIdleLevel * (0.5 + 0.5 * sin(uTime * 1.7 + vUv.y * 40.0));
  vec2 chromaOff = chromaDir * chromaMag;

  float cr = glyphAlpha(tUV + chromaOff);
  float cg = glyphAlpha(tUV);
  float cb = glyphAlpha(tUV - chromaOff);
  vec3 mask = vec3(cr, cg, cb);

  vec3 col = mix(uBackground, uTextColor, mask);

  /* ---- 5. light rays (few taps, edge-masked, disturbance-scaled) --- */
  if (uLightIntensity > 0.0001) {
    vec2 rayDir = normalize(vec2(0.85 / aspect, -0.42));
    float acc = 0.0;
    for (int i = 1; i <= 4; i++) {
      acc += glyphAlpha(tUV - rayDir * (float(i) * 0.0075));
    }
    acc *= 0.25;
    float edge = clamp(cg * (1.0 - cg) * 4.0, 0.0, 1.0);
    float rayGate = edge * (0.2 + 0.8 * influence) + acc * influence * 0.2;
    col += uTextColor * acc * rayGate * uLightIntensity;
    float glow = exp(-dist * 5.5) * influence * uLightIntensity * 0.10;
    col += uTextColor * glow * (0.25 + 0.75 * cg);
  }

  /* ---- 6. grain + faint vignette ------------------------------------ */
  float grain = (hash(gl_FragCoord.xy + fract(uTime) * 371.0) - 0.5) * uGrain;
  col += grain;

  vec2 vigP = (vUv - 0.5) * vec2(aspect, 1.0);
  col *= 1.0 - 0.14 * smoothstep(0.45, 1.25, length(vigP));

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const HEX_REGEX = /^#?[0-9a-fA-F]{6}$/;

function sanitizeHex(value: string, fallback: string): string {
  const t = value.trim();
  if (!HEX_REGEX.test(t)) return fallback;
  return t.startsWith("#") ? t : `#${t}`;
}

function hexToRgb01(hex: string): [number, number, number] {
  const n = sanitizeHex(hex, "#000000").replace("#", "");
  return [
    parseInt(n.slice(0, 2), 16) / 255,
    parseInt(n.slice(2, 4), 16) / 255,
    parseInt(n.slice(4, 6), 16) / 255,
  ];
}

function dampFactor(rate: number, dt: number): number {
  return 1 - Math.exp(-rate * dt);
}

interface TextTextureResult {
  canvas: HTMLCanvasElement;
  /** Natural text size in CSS px (before DPR scaling). */
  w: number;
  h: number;
}

/**
 * Render text into an offscreen 2D canvas (texture source ONLY — the
 * visible effect is 100% GPU). Manual per-character advances keep
 * letter-spacing deterministic across browsers.
 */
function renderTextCanvas(opts: {
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number | string;
  lineHeight: number;
  letterSpacing: number;
  scale: number;
}): TextTextureResult | null {
  const {
    text,
    fontFamily,
    fontSize,
    fontWeight,
    lineHeight,
    letterSpacing,
    scale,
  } = opts;
  const lines = text.split("\n");
  const stack = `${fontFamily}, Impact, "Arial Black", sans-serif`;
  const font = `${fontWeight} ${fontSize}px ${stack}`;

  const measure = document.createElement("canvas").getContext("2d");
  if (!measure) return null;
  measure.font = font;

  let contentW = 0;
  const lineWidths: number[] = [];
  const charWidths: number[][] = [];
  lines.forEach((line) => {
    const chars = Array.from(line);
    const widths = chars.map((ch) => measure.measureText(ch).width);
    charWidths.push(widths);
    const w =
      widths.reduce((a, b) => a + b, 0) +
      Math.max(0, chars.length - 1) * letterSpacing;
    lineWidths.push(w);
    contentW = Math.max(contentW, w);
  });
  const contentH = lines.length * fontSize * lineHeight;
  if (contentW < 1 || contentH < 1) return null;

  const padX = fontSize * 0.25;
  const padY = fontSize * 0.3;
  const w = Math.ceil(contentW + padX * 2);
  const h = Math.ceil(contentH + padY * 2);
  // Clamp the raster scale so giant hero type never exceeds GPU limits.
  const clampedScale = Math.max(0.5, Math.min(scale, 4096 / Math.max(w, h)));

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(2, Math.round(w * clampedScale));
  canvas.height = Math.max(2, Math.round(h * clampedScale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.scale(clampedScale, clampedScale);
  ctx.font = font;
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";

  lines.forEach((line, li) => {
    const chars = Array.from(line);
    const widths = charWidths[li] ?? [];
    const y = padY + li * fontSize * lineHeight + (fontSize * lineHeight) / 2;
    let x = padX + (contentW - (lineWidths[li] ?? 0)) / 2;
    chars.forEach((ch, ci) => {
      ctx.fillText(ch, x, y);
      x += (widths[ci] ?? 0) + letterSpacing;
    });
  });

  return { canvas, w, h };
}

interface EngineSettings {
  distortionStrength: number;
  distortionRadius: number;
  distortionDecay: number;
  noiseStrength: number;
  noiseScale: number;
  noiseSpeed: number;
  chromaticAberration: number;
  glitchStrength: number;
  liquidStrength: number;
  velocityInfluence: number;
  starburstStrength: number;
  waveStrength: number;
  pinchStrength: number;
  lightIntensity: number;
  grainStrength: number;
  textColor: string;
  backgroundColor: string;
  interactive: boolean;
  autoAnimate: boolean;
  fit: GlitchLiquidTextFit;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function GlitchLiquidText({
  text = "DAVINCIUI",
  fontFamily = "Anton",
  fontSize = 250,
  fontWeight = 400,
  lineHeight = 1.2,
  letterSpacing = 0,

  textColor = "#ffffff",
  backgroundColor = "#080808",

  distortionStrength = 0.42,
  distortionRadius = 0.2,
  distortionDecay = 3,

  noiseStrength = 0.03,
  noiseScale = 2.4,
  noiseSpeed = 0.35,

  chromaticAberration = 0.014,
  glitchStrength = 0.08,

  liquidStrength = 1,
  velocityInfluence = 0.05,

  starburstStrength = 0.28,
  waveStrength = 0.22,
  pinchStrength = 0.22,

  lightIntensity = 0.14,
  grainStrength = 0.016,

  cursorEnabled = true,
  cursorSize = 48,
  cursorColor = "#ffffff",

  interactive = true,
  autoAnimate = false,
  fit = "responsive",

  as = "div",
  ariaLabel,
  className,
  style,
  ...props
}: GlitchLiquidTextProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const [hasWebGLError, setHasWebGLError] = useState(false);
  const [contextLost, setContextLost] = useState(false);

  const settingsRef = useRef<EngineSettings>({
    distortionStrength,
    distortionRadius,
    distortionDecay,
    noiseStrength,
    noiseScale,
    noiseSpeed,
    chromaticAberration,
    glitchStrength,
    liquidStrength,
    velocityInfluence,
    starburstStrength,
    waveStrength,
    pinchStrength,
    lightIntensity,
    grainStrength,
    textColor,
    backgroundColor,
    interactive,
    autoAnimate,
    fit,
  });
  settingsRef.current = {
    distortionStrength,
    distortionRadius,
    distortionDecay,
    noiseStrength,
    noiseScale,
    noiseSpeed,
    chromaticAberration,
    glitchStrength,
    liquidStrength,
    velocityInfluence,
    starburstStrength,
    waveStrength,
    pinchStrength,
    lightIntensity,
    grainStrength,
    textColor,
    backgroundColor,
    interactive,
    autoAnimate,
    fit,
  };

  const typeRef = useRef({
    text,
    fontFamily,
    fontSize,
    fontWeight,
    lineHeight,
    letterSpacing,
  });
  typeRef.current = {
    text,
    fontFamily,
    fontSize,
    fontWeight,
    lineHeight,
    letterSpacing,
  };

  const cursorStyleRef = useRef({ cursorEnabled, cursorSize, cursorColor });
  cursorStyleRef.current = { cursorEnabled, cursorSize, cursorColor };

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    let disposed = false;
    let rafId = 0;
    let gl: WebGLRenderingContext | null = null;
    let program: WebGLProgram | null = null;
    let quadBuffer: WebGLBuffer | null = null;
    let texture: WebGLTexture | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let intersectionObserver: IntersectionObserver | null = null;
    let regenTimer = 0;
    let onContextLost: ((e: Event) => void) | null = null;
    let onContextRestored: (() => void) | null = null;
    let reduceMotionQuery: MediaQueryList | null = null;
    let onReduceMotionChange: (() => void) | null = null;

    // Realtime mutable state — refs only, never React state.
    const S = {
      // pointer (UV, y-up)
      targetX: 0.5,
      targetY: 0.5,
      mouseX: 0.5,
      mouseY: 0.5,
      // slow "liquid" layer — trails the tracked pointer so the type
      // follows luxuriously while the cursor itself stays responsive
      flowX: 0.5,
      flowY: 0.5,
      velX: 0,
      velY: 0,
      // timestamped raw-pointer history for windowed velocity
      hist: [] as Array<{ x: number; y: number; t: number }>,
      presence: 0,
      presenceTarget: 0,
      hovering: false,
      isMouse: false,
      hasPointer: false,
      lastPointerT: 0,
      // custom cursor (CSS px, relative to host)
      cursorTX: 0,
      cursorTY: 0,
      dotX: 0,
      dotY: 0,
      ringX: 0,
      ringY: 0,
      cursorVisible: false,
      // loop control
      running: false,
      visible: true,
      pageVisible: true,
      time: 0,
      lastT: 0,
      // texture bookkeeping
      texW: 1,
      texH: 1,
      rectX: 0,
      rectY: 0,
      rectW: 1,
      rectH: 1,
      canvasW: 1,
      canvasH: 1,
      dpr: 1,
      isCoarse: false,
      reducedMotion: false,
      contextValid: false,
    };

    const uniforms: Record<string, WebGLUniformLocation | null | undefined> =
      {};

    function compileShader(type: number, source: string): WebGLShader | null {
      if (!gl) return null;
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    function updateRect() {
      const s = settingsRef.current;
      const hostW = Math.max(1, host!.clientWidth);
      const hostH = Math.max(1, host!.clientHeight);
      const tw = Math.max(1, S.texW);
      const th = Math.max(1, S.texH);
      let dw: number;
      let dh: number;
      if (s.fit === "cover") {
        const k = Math.max(hostW / tw, hostH / th);
        dw = (tw * k) / hostW;
        dh = (th * k) / hostH;
      } else if (s.fit === "fixed") {
        dw = tw / hostW;
        dh = th / hostH;
      } else if (s.fit === "responsive") {
        const targetW = hostW < 640 ? 0.86 : 0.66;
        const targetH = hostH < 420 ? 0.72 : 0.82;
        const k = Math.min((hostW * targetW) / tw, (hostH * targetH) / th);
        dw = (tw * k) / hostW;
        dh = (th * k) / hostH;
      } else {
        const k = Math.min((hostW * 0.88) / tw, (hostH * 0.88) / th);
        dw = (tw * k) / hostW;
        dh = (th * k) / hostH;
      }
      S.rectW = Math.max(dw, 1e-5);
      S.rectH = Math.max(dh, 1e-5);
      S.rectX = (1 - S.rectW) / 2;
      S.rectY = (1 - S.rectH) / 2;
    }

    function regenerateTexture() {
      if (!gl || !texture || !S.contextValid) return;
      const t = typeRef.current;
      const hostW = Math.max(1, host!.clientWidth);
      const hostH = Math.max(1, host!.clientHeight);

      // Estimate the contain-fit upscale so huge heroes stay sharp.
      // Texture is regenerated (debounced) on significant resizes only.
      const isCoarse = S.isCoarse;
      const dpr = Math.min(window.devicePixelRatio || 1, isCoarse ? 1.5 : 2);
      S.dpr = dpr;

      const result = renderTextCanvas({
        text: t.text,
        fontFamily: t.fontFamily,
        fontSize: t.fontSize,
        fontWeight: t.fontWeight,
        lineHeight: t.lineHeight,
        letterSpacing: t.letterSpacing,
        scale: dpr,
      });
      if (!result) return;

      const s = settingsRef.current;
      if (s.fit === "contain" || s.fit === "responsive") {
        const targetW =
          s.fit === "responsive" ? (hostW < 640 ? 0.86 : 0.66) : 0.88;
        const targetH =
          s.fit === "responsive" ? (hostH < 420 ? 0.72 : 0.82) : 0.88;
        const need = Math.min(
          (hostW * targetW) / result.w,
          (hostH * targetH) / result.h,
        );
        if (need > 1.05 && dpr < 2) {
          const boost = Math.min(need, 2 / dpr);
          const retry = renderTextCanvas({
            text: t.text,
            fontFamily: t.fontFamily,
            fontSize: t.fontSize,
            fontWeight: t.fontWeight,
            lineHeight: t.lineHeight,
            letterSpacing: t.letterSpacing,
            scale: Math.min(dpr * boost, 3),
          });
          if (retry) {
            uploadTexture(retry);
            return;
          }
        }
      }
      uploadTexture(result);
    }

    function uploadTexture(result: TextTextureResult) {
      if (!gl || !texture) return;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      // No mipmaps: text textures are rarely power-of-two and WebGL1
      // disallows NPOT mipmapping. LINEAR keeps edges smooth.
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        result.canvas,
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.bindTexture(gl.TEXTURE_2D, null);
      S.texW = result.w;
      S.texH = result.h;
      updateRect();
    }

    function scheduleRegen(immediate = false) {
      window.clearTimeout(regenTimer);
      if (immediate) {
        regenerateTexture();
        return;
      }
      regenTimer = window.setTimeout(() => {
        if (!disposed) regenerateTexture();
      }, 200);
    }

    function resize() {
      if (!gl) return;
      const hostW = Math.max(1, host!.clientWidth);
      const hostH = Math.max(1, host!.clientHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, S.isCoarse ? 1.5 : 2);
      S.dpr = dpr;
      S.canvasW = Math.max(1, Math.floor(hostW * dpr));
      S.canvasH = Math.max(1, Math.floor(hostH * dpr));
      canvas!.width = S.canvasW;
      canvas!.height = S.canvasH;
      gl.viewport(0, 0, S.canvasW, S.canvasH);
      updateRect();
    }

    function frame(now: number) {
      rafId = 0;
      if (disposed || !gl || !texture || !program || !S.contextValid) return;
      if (!S.visible || !S.pageVisible) {
        S.running = false;
        return;
      }
      S.running = true;

      const dt = Math.min(Math.max((now - S.lastT) / 1000, 0.0001), 0.1);
      S.lastT = now;

      const s = settingsRef.current;
      const reduced = S.reducedMotion;

      /* ---- pointer dynamics (frame-rate independent, viscous) ------- */
      if (s.autoAnimate && !S.hasPointer && !reduced && s.interactive) {
        const t = now / 1000;
        S.targetX = 0.5 + 0.16 * Math.sin(t * 0.22);
        S.targetY = 0.5 + 0.11 * Math.sin(t * 0.17 + 1.7);
        S.presenceTarget = 0.22;
      } else if (!S.hovering) {
        S.presenceTarget = 0;
      }

      // Stage 1 — responsive track of the raw pointer target.
      const mk = dampFactor(5, dt);
      S.mouseX += (S.targetX - S.mouseX) * mk;
      S.mouseY += (S.targetY - S.mouseY) * mk;

      // Stage 2 — slow liquid layer. The shader field follows this, so
      // the cursor leads and the typography pours after it.
      const fk = dampFactor(1.8, dt);
      S.flowX += (S.mouseX - S.flowX) * fk;
      S.flowY += (S.mouseY - S.flowY) * fk;

      // Windowed velocity over ~140ms of raw pointer history: stable and
      // smooth where per-frame deltas are jittery, and decays naturally
      // to zero as entries age out once the pointer stops.
      while (S.hist.length > 2 && now - S.hist[0]!.t > 140) S.hist.shift();
      let wvx = 0;
      let wvy = 0;
      if (S.hist.length >= 2) {
        const a = S.hist[0]!;
        const b = S.hist[S.hist.length - 1]!;
        const wdt = Math.max((b.t - a.t) / 1000, 0.016);
        wvx = (b.x - a.x) / wdt;
        wvy = (b.y - a.y) / wdt;
      }
      const vk = dampFactor(4.5, dt);
      S.velX += (wvx - S.velX) * vk;
      S.velY += (wvy - S.velY) * vk;
      const vDecay = Math.exp(-dt * 3);
      S.velX *= vDecay;
      S.velY *= vDecay;
      // Soft saturation (tanh) instead of a hard clamp — fast flicks
      // smear without popping.
      const vLen = Math.hypot(S.velX, S.velY);
      const vMax = 2.5;
      if (vLen > 0.0001) {
        const capped = (vMax * Math.tanh(vLen / vMax)) / vLen;
        S.velX *= capped;
        S.velY *= capped;
      }

      const decayRate = 2.2 + settingsRef.current.distortionDecay;
      // Presence rises softly and relaxes slowly (viscous membrane feel).
      const target = s.interactive ? S.presenceTarget : 0;
      const rate = target > S.presence ? 3.5 : Math.max(0.4, decayRate);
      S.presence += (target - S.presence) * dampFactor(rate, dt);

      // Ambient clock: frozen-ish under reduced motion unless interacting.
      const timeRate = reduced ? (S.hovering ? 0.25 : 0.02) : 1;
      S.time += dt * timeRate;

      /* ---- custom cursor (dot responsive, ring delayed) ------------- */
      const cs = cursorStyleRef.current;
      if (cs.cursorEnabled && S.cursorVisible) {
        S.dotX += (S.cursorTX - S.dotX) * dampFactor(20, dt);
        S.dotY += (S.cursorTY - S.dotY) * dampFactor(20, dt);
        S.ringX += (S.cursorTX - S.ringX) * dampFactor(8, dt);
        S.ringY += (S.cursorTY - S.ringY) * dampFactor(8, dt);
        if (dotRef.current) {
          dotRef.current.style.transform = `translate3d(${S.dotX.toFixed(2)}px, ${S.dotY.toFixed(2)}px, 0) translate(-50%, -50%)`;
        }
        if (ringRef.current) {
          ringRef.current.style.transform = `translate3d(${S.ringX.toFixed(2)}px, ${S.ringY.toFixed(2)}px, 0) translate(-50%, -50%)`;
        }
      }

      /* ---- push uniforms -------------------------------------------- */
      const motionScale = reduced ? 0.15 : 1;
      const coarseScale = S.isCoarse ? 0.75 : 1;
      const bg = hexToRgb01(s.backgroundColor);
      const fg = hexToRgb01(s.textColor);
      const U = (name: string): WebGLUniformLocation | null =>
        uniforms[name] ?? null;

      gl.useProgram(program);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform2f(U("uResolution"), S.canvasW, S.canvasH);
      gl.uniform4f(U("uRect"), S.rectX, S.rectY, S.rectW, S.rectH);
      gl.uniform2f(U("uMouse"), S.flowX, S.flowY);
      gl.uniform2f(U("uVel"), S.velX, S.velY);
      gl.uniform1f(U("uPresence"), S.presence);
      gl.uniform1f(U("uTime"), S.time);
      gl.uniform1f(
        U("uDistortionStrength"),
        s.distortionStrength * motionScale,
      );
      gl.uniform1f(U("uDistortionRadius"), s.distortionRadius);
      gl.uniform1f(
        U("uNoiseStrength"),
        s.noiseStrength * motionScale * coarseScale,
      );
      gl.uniform1f(U("uNoiseScale"), s.noiseScale);
      // Calm the noise evolution while touching: hover motion should be
      // pure pointer flow, not crawling interference.
      gl.uniform1f(
        U("uNoiseSpeed"),
        s.noiseSpeed * (reduced ? 0.1 : 1) * (1 - 0.45 * S.presence),
      );
      gl.uniform1f(
        U("uChromaticAberration"),
        s.chromaticAberration * (reduced ? 0.3 : 1) * (S.isCoarse ? 0.6 : 1),
      );
      gl.uniform1f(U("uGlitchStrength"), reduced ? 0 : s.glitchStrength);
      gl.uniform1f(U("uLiquidStrength"), s.liquidStrength);
      gl.uniform1f(U("uVelocityInfluence"), s.velocityInfluence);
      gl.uniform1f(U("uStarburstStrength"), s.starburstStrength * motionScale);
      gl.uniform1f(U("uWaveStrength"), s.waveStrength * motionScale);
      gl.uniform1f(U("uPinchStrength"), s.pinchStrength * motionScale);
      gl.uniform1f(
        U("uLightIntensity"),
        s.lightIntensity * (reduced ? 0.4 : 1),
      );
      gl.uniform1f(U("uGrain"), s.grainStrength);
      gl.uniform1f(U("uIdleLevel"), reduced || !s.autoAnimate ? 0 : 1);
      gl.uniform3f(U("uTextColor"), fg[0], fg[1], fg[2]);
      gl.uniform3f(U("uBackground"), bg[0], bg[1], bg[2]);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
      rafId = requestAnimationFrame(frame);
    }

    function kick() {
      if (disposed || !S.contextValid || S.running) return;
      if (!S.visible || !S.pageVisible) return;
      S.lastT = performance.now();
      rafId = requestAnimationFrame(frame);
    }

    function stop() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      S.running = false;
    }

    /* ---- pointer handlers ------------------------------------------- */
    function setPointerFromEvent(e: PointerEvent) {
      const rect = host!.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1 - (e.clientY - rect.top) / rect.height;
      S.targetX = Math.min(Math.max(x, -0.2), 1.2);
      S.targetY = Math.min(Math.max(y, -0.2), 1.2);
      S.cursorTX = e.clientX - rect.left;
      S.cursorTY = e.clientY - rect.top;
      S.hist.push({ x: S.targetX, y: S.targetY, t: performance.now() });
      if (S.hist.length > 24) S.hist.shift();
    }

    function onPointerEnter(e: PointerEvent) {
      const s = settingsRef.current;
      if (!s.interactive) return;
      S.hovering = true;
      S.hasPointer = true;
      S.presenceTarget = 1;
      S.isMouse = e.pointerType === "mouse";
      setPointerFromEvent(e);
      // Snap every layer on entry so nothing flies in from a corner.
      S.mouseX = S.flowX = S.targetX;
      S.mouseY = S.flowY = S.targetY;
      S.hist.length = 0;
      S.hist.push({ x: S.targetX, y: S.targetY, t: performance.now() });
      S.dotX = S.ringX = S.cursorTX;
      S.dotY = S.ringY = S.cursorTY;
      const cs = cursorStyleRef.current;
      if (cs.cursorEnabled && S.isMouse) {
        S.cursorVisible = true;
        if (cursorRef.current) cursorRef.current.style.opacity = "1";
        host!.style.cursor = "none";
      }
      kick();
    }

    function onPointerMove(e: PointerEvent) {
      const s = settingsRef.current;
      if (!s.interactive || !S.hovering) return;
      if (e.pointerType === "mouse") S.isMouse = true;
      S.hasPointer = true;
      S.presenceTarget = 1;
      setPointerFromEvent(e);
      kick();
    }

    function onPointerDown(e: PointerEvent) {
      const s = settingsRef.current;
      if (!s.interactive) return;
      S.hovering = true;
      S.hasPointer = true;
      S.presenceTarget = 1;
      S.isMouse = e.pointerType === "mouse";
      setPointerFromEvent(e);
      if (!S.isMouse) {
        S.mouseX = S.flowX = S.targetX;
        S.mouseY = S.flowY = S.targetY;
        S.hist.length = 0;
        S.hist.push({ x: S.targetX, y: S.targetY, t: performance.now() });
      }
      kick();
    }

    function releasePointer() {
      S.hovering = false;
      // Release the pointer so the membrane relaxes; autoAnimate may
      // take over with its low-energy wander if enabled.
      S.hasPointer = false;
      S.presenceTarget =
        settingsRef.current.autoAnimate && !S.reducedMotion ? 0.22 : 0;
      S.cursorVisible = false;
      if (cursorRef.current) cursorRef.current.style.opacity = "0";
      host!.style.cursor = "";
    }

    function onPointerLeave() {
      releasePointer();
    }

    function onPointerUp(e: PointerEvent) {
      if (e.pointerType !== "mouse") releasePointer();
    }

    function onPointerCancel(e: PointerEvent) {
      if (e.pointerType !== "mouse") releasePointer();
    }

    /* ---- init -------------------------------------------------------- */
    function init(): boolean {
      try {
        const context = canvas!.getContext("webgl", {
          antialias: false,
          alpha: false,
          depth: false,
          stencil: false,
          powerPreference: "high-performance",
        }) as WebGLRenderingContext | null;
        if (!context) return false;
        gl = context;

        const vs = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER);
        const fs = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
        if (!vs || !fs) {
          if (vs) gl.deleteShader(vs);
          if (fs) gl.deleteShader(fs);
          return false;
        }
        const prog = gl.createProgram();
        if (!prog) {
          gl.deleteShader(vs);
          gl.deleteShader(fs);
          return false;
        }
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
          gl.deleteProgram(prog);
          gl.deleteShader(vs);
          gl.deleteShader(fs);
          return false;
        }
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        program = prog;
        gl.useProgram(program);

        const posLoc = gl.getAttribLocation(program, "aPosition");
        quadBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array([-1, -1, 3, -1, -1, 3]),
          gl.STATIC_DRAW,
        );
        if (posLoc >= 0) {
          gl.enableVertexAttribArray(posLoc);
          gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
        }

        const names = [
          "uText",
          "uResolution",
          "uRect",
          "uMouse",
          "uVel",
          "uPresence",
          "uTime",
          "uDistortionStrength",
          "uDistortionRadius",
          "uNoiseStrength",
          "uNoiseScale",
          "uNoiseSpeed",
          "uChromaticAberration",
          "uGlitchStrength",
          "uLiquidStrength",
          "uVelocityInfluence",
          "uStarburstStrength",
          "uWaveStrength",
          "uPinchStrength",
          "uLightIntensity",
          "uGrain",
          "uIdleLevel",
          "uTextColor",
          "uBackground",
        ];
        names.forEach((n) => {
          uniforms[n] = gl!.getUniformLocation(program!, n);
        });

        texture = gl.createTexture();
        if (!texture) return false;
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        // 1px placeholder so first frames render before fonts resolve.
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          1,
          1,
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          new Uint8Array([0, 0, 0, 0]),
        );
        gl.uniform1i(uniforms.uText ?? null, 0);
        gl.bindTexture(gl.TEXTURE_2D, null);

        gl.disable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);
        S.contextValid = true;
        return true;
      } catch {
        return false;
      }
    }

    function destroyGL() {
      stop();
      if (gl) {
        if (texture) gl.deleteTexture(texture);
        if (quadBuffer) gl.deleteBuffer(quadBuffer);
        if (program) gl.deleteProgram(program);
      }
      gl = null;
      program = null;
      quadBuffer = null;
      texture = null;
      S.contextValid = false;
    }

    /* ---- boot -------------------------------------------------------- */
    S.isCoarse =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(pointer: coarse)").matches;
    reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    S.reducedMotion = reduceMotionQuery.matches;
    onReduceMotionChange = () => {
      if (reduceMotionQuery) S.reducedMotion = reduceMotionQuery.matches;
    };
    if (typeof reduceMotionQuery.addEventListener === "function") {
      reduceMotionQuery.addEventListener("change", onReduceMotionChange);
    }

    if (!init()) {
      setHasWebGLError(true);
      return;
    }

    resize();
    regenerateTexture();

    // Regenerate once webfonts resolve (final crisp texture).
    let fontsCancelled = false;
    if (document.fonts) {
      const t = typeRef.current;
      const loadSpec: Array<Promise<unknown>> = [];
      try {
        loadSpec.push(
          document.fonts.load(
            `${t.fontWeight} ${t.fontSize}px "${t.fontFamily}"`,
          ),
        );
      } catch {
        /* font load API may reject for unknown families — fonts.ready covers it */
      }
      Promise.allSettled([
        ...loadSpec,
        document.fonts.ready.then(() => undefined),
      ]).then(() => {
        if (!fontsCancelled && !disposed) scheduleRegen(true);
      });
    }

    resizeObserver = new ResizeObserver(() => {
      resize();
      scheduleRegen(false);
      kick();
    });
    resizeObserver.observe(host);

    intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        S.visible = entry ? entry.isIntersecting : true;
        if (S.visible) {
          S.lastT = performance.now();
          kick();
        } else {
          stop();
        }
      },
      { threshold: 0 },
    );
    intersectionObserver.observe(host);

    const onVisibilityChange = () => {
      S.pageVisible = document.visibilityState !== "hidden";
      if (S.pageVisible) {
        S.lastT = performance.now();
        kick();
      } else {
        stop();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    onContextLost = (e: Event) => {
      e.preventDefault();
      destroyGL();
      setContextLost(true);
    };
    onContextRestored = () => {
      setContextLost(false);
      if (init()) {
        resize();
        regenerateTexture();
        kick();
      } else {
        setHasWebGLError(true);
      }
    };
    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);

    host.addEventListener("pointerenter", onPointerEnter);
    host.addEventListener("pointermove", onPointerMove);
    host.addEventListener("pointerdown", onPointerDown);
    host.addEventListener("pointerup", onPointerUp);
    host.addEventListener("pointercancel", onPointerCancel);
    host.addEventListener("pointerleave", onPointerLeave);

    S.lastT = performance.now();
    kick();

    return () => {
      disposed = true;
      fontsCancelled = true;
      window.clearTimeout(regenTimer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (reduceMotionQuery && onReduceMotionChange) {
        if (typeof reduceMotionQuery.removeEventListener === "function") {
          reduceMotionQuery.removeEventListener("change", onReduceMotionChange);
        }
      }
      if (onContextLost)
        canvas.removeEventListener("webglcontextlost", onContextLost);
      if (onContextRestored)
        canvas.removeEventListener("webglcontextrestored", onContextRestored);
      host.removeEventListener("pointerenter", onPointerEnter);
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerdown", onPointerDown);
      host.removeEventListener("pointerup", onPointerUp);
      host.removeEventListener("pointercancel", onPointerCancel);
      host.removeEventListener("pointerleave", onPointerLeave);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      destroyGL();
      host.style.cursor = "";
    };
    // Intentionally mount-once: all live values flow through refs.
  }, []);

  const SemanticTag = (as ?? "div") as "div";
  const cursor = cursorStyleRef.current;
  const ringSize = cursor.cursorSize;
  const showFallbackText = hasWebGLError || contextLost;

  const fallback = (
    <div
      className={cn(
        "relative flex h-[560px] w-full items-center justify-center overflow-hidden",
        className,
      )}
      style={{ backgroundColor, ...style }}
      {...props}
    >
      <WebGLFallback className="absolute inset-0 h-full w-full" />
      <SemanticTag
        aria-label={ariaLabel ?? text}
        className="relative z-10 px-6 text-center font-bold"
        style={{
          color: textColor,
          fontFamily: `${fontFamily}, Impact, "Arial Black", sans-serif`,
          fontSize: `min(${fontSize}px, 72vw)`,
          fontWeight,
          lineHeight,
          letterSpacing,
        }}
      >
        {text}
      </SemanticTag>
    </div>
  );

  if (showFallbackText) return fallback;

  return (
    <WebGLErrorBoundary fallback={fallback}>
      <div
        ref={hostRef}
        className={cn(
          "glitch-liquid-text relative h-[560px] w-full overflow-hidden",
          className,
        )}
        style={{
          position: "relative",
          overflow: "hidden",
          width: "100%",
          background: backgroundColor,
          touchAction: interactive ? "none" : "auto",
          ...style,
        }}
        {...props}
      >
        {/* Measurement / accessibility node only — never the visual text. */}
        <SemanticTag
          className="sr-only"
          aria-label={ariaLabel ?? text}
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: "hidden",
            clip: "rect(0, 0, 0, 0)",
            whiteSpace: "nowrap",
            border: 0,
          }}
        >
          {text}
        </SemanticTag>

        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 block h-full w-full"
          style={{ width: "100%", height: "100%", display: "block" }}
        />

        {cursor.cursorEnabled && (
          <div
            ref={cursorRef}
            className="custom-cursor pointer-events-none absolute inset-0 z-10"
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              zIndex: 10,
              mixBlendMode: "difference",
              opacity: 0,
              transition: "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <div
              ref={ringRef}
              className="cursor-ring absolute left-0 top-0"
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: ringSize,
                height: ringSize,
                border: `1px solid ${cursor.cursorColor}`,
                borderRadius: 999,
                opacity: 0.4,
                willChange: "transform",
              }}
            />
            <div
              ref={dotRef}
              className="cursor-dot absolute left-0 top-0"
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: 4,
                height: 4,
                background: cursor.cursorColor,
                borderRadius: 999,
                opacity: 0.9,
                willChange: "transform",
              }}
            />
          </div>
        )}
      </div>
    </WebGLErrorBoundary>
  );
}

export default GlitchLiquidText;
