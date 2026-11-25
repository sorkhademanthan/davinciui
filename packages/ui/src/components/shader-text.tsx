"use client";

import { cn } from "@workspace/ui/lib/utils";
import * as React from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type ShaderTextPresetName =
  | "noise"
  | "plasma"
  | "aurora"
  | "cyber"
  | "lava"
  | "ocean"
  | "sunset"
  | "nebula"
  | "prism"
  | "glitch"
  | "bloom"
  | "void";

export type ShaderTextAlign = "left" | "center" | "right";

export interface ShaderTextProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Text to render. `\n` creates line breaks. @default "Shader" */
  text?: string;
  /** CSS font-family stack. @default "Inter, sans-serif" */
  fontFamily?: string;
  /** Font size in CSS px. @default 120 */
  fontSize?: number;
  /** Font weight. @default 800 */
  fontWeight?: number | string;
  /** Font style. @default "normal" */
  fontStyle?: string;
  /** Letter spacing in CSS px. @default 0 */
  letterSpacing?: number;
  /** Unitless line-height multiplier. @default 1 */
  lineHeight?: number;
  /** Horizontal alignment. @default "center" */
  textAlign?: ShaderTextAlign;
  /** Animation speed multiplier. @default 1 */
  speed?: number;
  /** Shader pattern zoom. @default 1.6 */
  scale?: number;
  /** Canvas backing-store multiplier (× devicePixelRatio). @default 1 */
  resolution?: number;
  /** Pattern softness 0..1. @default 0.5 */
  softness?: number;
  /** Fragment-shader preset (case-insensitive). @default "aurora" */
  preset?: ShaderTextPresetName | string;
  /** Accessible label for the shader text. Defaults to `text`. */
  ariaLabel?: string;
}

export const SHADER_TEXT_PRESETS: ShaderTextPresetName[] = [
  "noise",
  "plasma",
  "aurora",
  "cyber",
  "lava",
  "ocean",
  "sunset",
  "nebula",
  "prism",
  "glitch",
  "bloom",
  "void",
];

export const SHADER_TEXT_DEFAULTS = {
  text: "Shader",
  fontFamily: 'Inter, "Helvetica Neue", Arial, sans-serif',
  fontSize: 120,
  fontWeight: 800,
  fontStyle: "normal",
  letterSpacing: -2,
  lineHeight: 1,
  textAlign: "center",
  speed: 1,
  scale: 1.6,
  resolution: 1,
  softness: 0.5,
  preset: "aurora",
} as const;

/* ------------------------------------------------------------------ */
/* WebGL shaders                                                       */
/*                                                                     */
/* Architecture: a fullscreen-triangle vertex shader plus one fragment */
/* shader per preset. Every preset shares the noise prelude below but  */
/* implements its own `shade()` body, so switching presets genuinely   */
/* recompiles a different fragment program — never just CSS colors.    */
/* ------------------------------------------------------------------ */

const VERTEX_SHADER = `
attribute vec2 aPosition;
varying vec2 vUv;

void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const NOISE_PRELUDE = `
precision highp float;

varying vec2 vUv;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_scale;
uniform float u_softness;

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
  for (int i = 0; i < 4; i++) {
    v += a * vnoise(p);
    p = rot * p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

vec3 pal(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(6.2831853 * (c * t + d));
}

float softWidth() {
  return 0.06 + clamp(u_softness, 0.0, 1.0) * 0.42;
}
`;

const FRAGMENT_MAIN = `
void main() {
  vec2 uv = vUv;
  float aspect = u_resolution.x / max(u_resolution.y, 1.0);
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0) * max(u_scale, 0.05);
  float t = u_time;
  vec3 col = shade(uv, p, t);
  float dith = (hash(gl_FragCoord.xy * 0.71 + fract(t) * 17.0) - 0.5) * 0.028;
  col += dith;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

/**
 * One GLSL `shade()` body per preset. Each body flows continuously
 * (fbm domain-warping + time-drifted sinusoids) and reads u_softness
 * through softWidth() so the softness control reshapes the shader.
 */
const PRESET_BODIES: Record<ShaderTextPresetName, string> = {
  noise: `
vec3 shade(vec2 uv, vec2 p, float t) {
  float w = softWidth();
  float n = fbm(p * 1.5 + vec2(t * 0.14, -t * 0.11));
  float m = fbm(p * 2.7 - n * 1.4 + vec2(-t * 0.09, t * 0.13));
  float v = m * 0.62 + n * 0.38;
  v = smoothstep(0.5 - w * 1.4, 0.5 + w * 1.4, v);
  vec3 col = pal(v + n * 0.25, vec3(0.52), vec3(0.46), vec3(1.0), vec3(0.0, 0.33, 0.67));
  col = mix(col, pal(v, vec3(0.5), vec3(0.5), vec3(1.0), vec3(0.9, 0.4, 0.1)), 0.35);
  return col;
}`,
  plasma: `
vec3 shade(vec2 uv, vec2 p, float t) {
  float w = softWidth();
  float v = sin(p.x * 2.3 + t * 0.9)
          + sin(p.y * 2.7 - t * 0.7)
          + sin((p.x + p.y) * 1.9 + t * 0.5)
          + sin(length(p) * 3.2 - t * 0.8);
  v *= 0.25;
  float bands = smoothstep(-0.6 - w, 0.6 + w, v);
  vec3 col = pal(bands + t * 0.03, vec3(0.5), vec3(0.5), vec3(1.0), vec3(0.0, 0.15, 0.2));
  col += vec3(0.1, 0.3, 0.9) * pow(0.5 + 0.5 * sin(v * 6.2831), 3.0) * 0.35;
  return col;
}`,
  aurora: `
vec3 shade(vec2 uv, vec2 p, float t) {
  float w = softWidth();
  float warp = fbm(vec2(p.x * 1.2 + t * 0.16, p.y * 2.1 - t * 0.05));
  float curtains = fbm(vec2(p.x * 2.2 - t * 0.12 + warp * 1.6, p.y * 3.1 + warp));
  float glow = smoothstep(0.5 - w * 1.6, 0.5 + w * 1.6, curtains * 0.65 + warp * 0.35);
  vec3 deep = vec3(0.015, 0.05, 0.10);
  vec3 teal = vec3(0.05, 0.75, 0.55);
  vec3 violet = vec3(0.45, 0.25, 0.95);
  vec3 col = mix(deep, teal, glow);
  col = mix(col, violet, smoothstep(0.55, 0.95, curtains) * 0.7);
  col += teal * pow(glow, 3.0) * 0.6;
  float rays = pow(0.5 + 0.5 * sin(p.x * 22.0 + warp * 9.0 + t * 0.4), 4.0);
  col += vec3(0.2, 0.9, 0.7) * rays * glow * 0.25;
  return col;
}`,
  cyber: `
vec3 shade(vec2 uv, vec2 p, float t) {
  float w = softWidth();
  vec2 g = abs(fract(p * 3.0 + vec2(t * 0.05, -t * 0.04)) - 0.5);
  float grid = 1.0 - smoothstep(0.0, 0.045 + w * 0.08, min(g.x, g.y));
  float pulse = pow(0.5 + 0.5 * sin(p.x * 4.0 - t * 2.0) * sin(p.y * 4.0 + t * 1.6), 3.0);
  float scan = 1.0 - smoothstep(0.0, 0.02, abs(fract(uv.y * 3.0 - t * 0.35) - 0.5) - 0.42);
  float n = fbm(p * 2.0 + t * 0.2);
  vec3 base = vec3(0.01, 0.03, 0.07) + vec3(0.02, 0.05, 0.12) * n;
  vec3 cyan = vec3(0.0, 0.95, 1.0);
  vec3 mag = vec3(1.0, 0.15, 0.65);
  vec3 col = base + cyan * grid * (0.35 + pulse * 0.65);
  col += mag * smoothstep(0.6, 0.95, n) * 0.55;
  col += (cyan * 0.7 + mag * 0.3) * scan * 0.35;
  return col;
}`,
  lava: `
vec3 shade(vec2 uv, vec2 p, float t) {
  float w = softWidth();
  float n = fbm(p * 1.8 + vec2(0.0, -t * 0.28));
  float m = fbm(p * 3.3 + n * 1.6 + vec2(t * 0.12, t * 0.05));
  float heat = m * 0.62 + n * 0.38;
  heat = smoothstep(0.32 - w, 0.78 + w, heat);
  vec3 col = mix(vec3(0.05, 0.005, 0.0), vec3(0.75, 0.08, 0.0), smoothstep(0.0, 0.45, heat));
  col = mix(col, vec3(1.0, 0.45, 0.02), smoothstep(0.4, 0.72, heat));
  col = mix(col, vec3(1.0, 0.92, 0.55), smoothstep(0.68, 0.95, heat));
  col += vec3(1.0, 0.35, 0.0) * pow(heat, 4.0) * 0.5;
  return col;
}`,
  ocean: `
vec3 shade(vec2 uv, vec2 p, float t) {
  float w = softWidth();
  vec2 q = p * 2.1;
  q += vec2(fbm(q + t * 0.22), fbm(q + vec2(5.2, 1.3) - t * 0.17)) * 0.9;
  float c = fbm(q * 1.4 - t * 0.1);
  c = smoothstep(0.5 - w * 1.5, 0.5 + w * 1.5, c);
  vec3 deep = vec3(0.0, 0.10, 0.22);
  vec3 mid = vec3(0.0, 0.38, 0.55);
  vec3 foam = vec3(0.65, 0.95, 0.95);
  vec3 col = mix(deep, mid, c);
  float caustic = pow(0.5 + 0.5 * sin((q.x + q.y) * 6.0 + t * 0.8), 6.0);
  col += vec3(0.3, 0.9, 0.9) * caustic * 0.35;
  col = mix(col, foam, smoothstep(0.75, 0.98, c + caustic * 0.2) * 0.6);
  return col;
}`,
  sunset: `
vec3 shade(vec2 uv, vec2 p, float t) {
  float w = softWidth();
  float s = fbm(p * 1.6 + vec2(t * 0.20, t * 0.06));
  float drift = (p.x * 0.6 - p.y * 0.8) * 0.5 + s * 1.2 + t * 0.05;
  float v = fract(drift * 0.55);
  float band = smoothstep(0.0, w + 0.12, v) * (1.0 - smoothstep(1.0 - w - 0.12, 1.0, v));
  vec3 col = mix(vec3(0.16, 0.05, 0.30), vec3(0.85, 0.15, 0.45), smoothstep(0.1, 0.5, v));
  col = mix(col, vec3(1.0, 0.45, 0.10), smoothstep(0.45, 0.75, v));
  col = mix(col, vec3(1.0, 0.85, 0.45), smoothstep(0.7, 0.95, v));
  col *= 0.75 + band * 0.35;
  return col;
}`,
  nebula: `
vec3 shade(vec2 uv, vec2 p, float t) {
  float w = softWidth();
  float n1 = fbm(p * 1.5 + t * 0.05);
  float n2 = fbm(p * 3.1 - n1 * 1.3 - t * 0.07);
  float v = n1 * 0.6 + n2 * 0.4;
  v = smoothstep(0.5 - w * 1.5, 0.5 + w * 1.5, v);
  vec3 col = mix(vec3(0.015, 0.01, 0.05), vec3(0.25, 0.08, 0.45), v);
  col = mix(col, vec3(0.9, 0.25, 0.55), smoothstep(0.55, 0.9, v) * 0.7);
  col = mix(col, vec3(0.2, 0.5, 1.0), (1.0 - smoothstep(0.2, 0.4, v)) * 0.45);
  vec2 cell = floor(p * 34.0);
  float tw = hash(cell + floor(t * 2.0) * 0.37);
  float star = step(0.992, hash(cell)) * (0.4 + 0.6 * tw);
  col += vec3(1.0) * star;
  return col;
}`,
  prism: `
vec3 shade(vec2 uv, vec2 p, float t) {
  float w = softWidth();
  float warp = fbm(p * 2.0 + t * 0.18);
  float h = fract(p.x * 0.7 + p.y * 0.55 + warp * 0.9 + t * 0.07);
  vec3 col = pal(h, vec3(0.55), vec3(0.45), vec3(1.0), vec3(0.0, 0.33, 0.67));
  float sheen = pow(0.5 + 0.5 * sin((p.x - p.y) * 9.0 + warp * 7.0 - t * 0.6), 3.0);
  col += vec3(1.0) * sheen * (0.12 + w * 0.25);
  col = mix(vec3(dot(col, vec3(0.333))), col, 0.65 + w * 0.5);
  return col;
}`,
  glitch: `
vec3 shade(vec2 uv, vec2 p, float t) {
  float w = softWidth();
  float row = floor(p.y * 12.0 + t * 2.0);
  float r = hash(vec2(row, floor(t * 8.0)));
  float slice = step(0.82 - w * 0.25, r);
  vec2 guv = p + vec2((r - 0.5) * 0.35 * slice, 0.0);
  float n = fbm(guv * 2.4 + vec2(t * 0.3, 0.0));
  float blocks = step(0.5 - w * 0.4, fract(n * 3.0 + r));
  vec3 base = mix(vec3(0.02, 0.03, 0.05), vec3(0.05, 0.9, 0.75), blocks * (0.4 + slice * 0.6));
  base = mix(base, vec3(1.0, 0.2, 0.5), slice * smoothstep(0.4, 0.9, n) * 0.7);
  float scan = 0.85 + 0.15 * sin(uv.y * u_resolution.y * 1.5);
  return base * scan;
}`,
  bloom: `
vec3 shade(vec2 uv, vec2 p, float t) {
  float w = softWidth();
  vec2 q = p * 1.4 + vec2(t * 0.08, -t * 0.06);
  float b1 = fbm(q * 1.3 + vec2(1.7, 9.2));
  float b2 = fbm(q * 2.2 - b1 * 1.1 + vec2(0.0, t * 0.1));
  float v = smoothstep(0.5 - w * 1.5, 0.5 + w * 1.5, b1 * 0.6 + b2 * 0.4);
  vec3 col = mix(vec3(1.0, 0.85, 0.80), vec3(1.0, 0.55, 0.70), v);
  col = mix(col, vec3(0.65, 0.55, 0.95), smoothstep(0.55, 0.9, b2) * 0.6);
  col = mix(col, vec3(1.0, 0.98, 0.92), (1.0 - smoothstep(0.1, 0.35, v)) * 0.5);
  return col;
}`,
  void: `
vec3 shade(vec2 uv, vec2 p, float t) {
  float w = softWidth();
  float warp = fbm(p * 2.3 + vec2(t * 0.10, -t * 0.08));
  float n = fbm(p * 1.7 + warp * 1.2 + vec2(-t * 0.06, t * 0.09));
  float v = smoothstep(0.5 - w * 1.6, 0.5 + w * 1.6, n);
  vec3 col = mix(vec3(0.005), vec3(0.42), v);
  col = mix(col, vec3(0.95), smoothstep(0.72, 0.96, v));
  float veil = smoothstep(0.4, 0.9, fbm(p * 0.9 - t * 0.05));
  col *= 0.7 + veil * 0.45;
  return col;
}`,
};

function normalizePreset(value: unknown): ShaderTextPresetName {
  const key = String(value ?? "").trim().toLowerCase();
  if ((SHADER_TEXT_PRESETS as string[]).includes(key)) {
    return key as ShaderTextPresetName;
  }
  return SHADER_TEXT_DEFAULTS.preset;
}

function buildFragmentSource(preset: ShaderTextPresetName): string {
  return `${NOISE_PRELUDE}\n${PRESET_BODIES[preset]}\n${FRAGMENT_MAIN}`;
}

/* ------------------------------------------------------------------ */
/* SVG mask                                                            */
/*                                                                     */
/* The mask is generated from the same text + typography props that    */
/* drive the invisible sizing node, then applied as CSS mask-image so  */
/* the WebGL canvas shows through ONLY inside the glyphs. Vector text  */
/* at 2x keeps edges razor sharp at any size.                          */
/* ------------------------------------------------------------------ */

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildMaskUrl(opts: {
  lines: string[];
  width: number;
  height: number;
  fontFamily: string;
  fontSize: number;
  fontWeight: number | string;
  fontStyle: string;
  letterSpacing: number;
  lineHeight: number;
  textAlign: ShaderTextAlign;
  paddingX: number;
  paddingY: number;
}): string | undefined {
  const {
    lines,
    width,
    height,
    fontFamily,
    fontSize,
    fontWeight,
    fontStyle,
    letterSpacing,
    lineHeight,
    textAlign,
    paddingX,
    paddingY,
  } = opts;
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  if (!Number.isFinite(w) || !Number.isFinite(h) || w < 2 || h < 2) {
    return undefined;
  }
  const safePaddingX = Math.max(0, Math.min(paddingX, w / 2 - 1));
  const safePaddingY = Math.max(0, Math.min(paddingY, h / 2 - 1));
  const contentW = Math.max(1, w - safePaddingX * 2);
  const maskScale = 2;
  const lineH = Math.max(1, fontSize * lineHeight);
  const anchor: Record<ShaderTextAlign, { x: string; anchor: string }> = {
    left: { x: safePaddingX.toFixed(2), anchor: "start" },
    center: {
      x: (safePaddingX + contentW / 2).toFixed(2),
      anchor: "middle",
    },
    right: { x: (w - safePaddingX).toFixed(2), anchor: "end" },
  };
  const pos = anchor[textAlign] ?? anchor.center;
  const family = escapeXml(fontFamily);
  const style = escapeXml(fontStyle || "normal");

  const texts = lines
    .map((line, i) => {
      const safe = escapeXml(line === "" ? " " : line);
      const y = (safePaddingY + lineH * (i + 0.5)).toFixed(2);
      return `<text x="${pos.x}" y="${y}" text-anchor="${pos.anchor}" dominant-baseline="central" font-family="${family}" font-size="${fontSize}" font-weight="${fontWeight}" font-style="${style}" letter-spacing="${letterSpacing}">${safe}</text>`;
    })
    .join("");

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" ` +
    `width="${w * maskScale}" height="${h * maskScale}" viewBox="0 0 ${w} ${h}">` +
    `<g fill="#ffffff">${texts}</g></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/* ------------------------------------------------------------------ */
/* Environment helpers                                                 */
/* ------------------------------------------------------------------ */

function isFramerCanvas(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }
  try {
    const w = window as unknown as Record<string, unknown>;
    if (w.__framer_canvas === true) return true;
    const framer = w.framer as Record<string, unknown> | undefined;
    if (framer && framer.inCanvas === true) return true;
    if (document.documentElement.hasAttribute("data-framer-canvas")) return true;
    const params = new URLSearchParams(window.location.search);
    if (params.has("framerCanvas") || params.get("env") === "canvas") return true;
  } catch {
    /* URL access can throw in sandboxed iframes — fall through to live mode */
  }
  return false;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export function ShaderText({
  text = SHADER_TEXT_DEFAULTS.text,
  fontFamily = SHADER_TEXT_DEFAULTS.fontFamily,
  fontSize = SHADER_TEXT_DEFAULTS.fontSize,
  fontWeight = SHADER_TEXT_DEFAULTS.fontWeight,
  fontStyle = SHADER_TEXT_DEFAULTS.fontStyle,
  letterSpacing = SHADER_TEXT_DEFAULTS.letterSpacing,
  lineHeight = SHADER_TEXT_DEFAULTS.lineHeight,
  textAlign = SHADER_TEXT_DEFAULTS.textAlign,
  speed = SHADER_TEXT_DEFAULTS.speed,
  scale = SHADER_TEXT_DEFAULTS.scale,
  resolution = SHADER_TEXT_DEFAULTS.resolution,
  softness = SHADER_TEXT_DEFAULTS.softness,
  preset = SHADER_TEXT_DEFAULTS.preset,
  ariaLabel,
  className,
  style,
  ...props
}: ShaderTextProps) {
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [box, setBox] = React.useState({ w: 0, h: 0 });
  const [failed, setFailed] = React.useState(false);
  const [fontNonce, setFontNonce] = React.useState(0);

  const safeFontSize = Number.isFinite(fontSize) && fontSize > 0 ? fontSize : 120;
  const safeLineHeight =
    Number.isFinite(lineHeight) && lineHeight > 0 ? lineHeight : 1;
  const safeLetterSpacing = Number.isFinite(letterSpacing) ? letterSpacing : 0;
  const lineHeightPx = safeFontSize * safeLineHeight;
  const paddingX = Math.ceil(safeFontSize * 0.08);
  const paddingY = Math.ceil(lineHeightPx * 0.14);
  const safeSpeed = Number.isFinite(speed) ? speed : 1;
  const safeScale = Number.isFinite(scale) && scale > 0 ? scale : 1.6;
  const safeResolution =
    Number.isFinite(resolution) && resolution > 0
      ? Math.min(Math.max(resolution, 0.25), 2)
      : 1;
  const safeSoftness = Number.isFinite(softness)
    ? Math.min(Math.max(softness, 0), 1)
    : 0.5;
  const presetName = normalizePreset(preset);
  const align: ShaderTextAlign =
    textAlign === "left" || textAlign === "right" ? textAlign : "center";

  const lines = React.useMemo(() => String(text ?? "").split("\n"), [text]);

  /* Live values flow through a ref so animation never re-renders React. */
  const liveRef = React.useRef({
    speed: safeSpeed,
    scale: safeScale,
    resolution: safeResolution,
    softness: safeSoftness,
    preset: presetName,
  });
  liveRef.current = {
    speed: safeSpeed,
    scale: safeScale,
    resolution: safeResolution,
    softness: safeSoftness,
    preset: presetName,
  };

  /* Re-resolve the SVG mask once webfonts arrive so glyphs match exactly. */
  React.useEffect(() => {
    if (typeof document === "undefined" || !("fonts" in document)) return;
    let cancelled = false;
    const spec = `${fontStyle} ${fontWeight} ${safeFontSize}px "${fontFamily.split(",")[0]?.trim().replace(/^['"]|['"]$/g, "")}"`;
    const load = async () => {
      try {
        await (document.fonts as FontFaceSet).load(spec);
      } catch {
        /* Unknown families reject — fonts.ready below still re-resolves. */
      }
      try {
        await (document.fonts as FontFaceSet).ready;
      } catch {
        /* ignore */
      }
      if (!cancelled) setFontNonce((n) => n + 1);
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [fontFamily, fontStyle, fontWeight, safeFontSize]);

  const maskUrl = React.useMemo(() => {
    /* fontNonce re-resolves the mask once webfonts finish loading. */
    void fontNonce;
    return buildMaskUrl({
      lines,
      width: box.w,
      height: box.h,
      fontFamily,
      fontSize: safeFontSize,
      fontWeight,
      fontStyle: fontStyle || "normal",
      letterSpacing: safeLetterSpacing,
      lineHeight: safeLineHeight,
      textAlign: align,
      paddingX,
      paddingY,
    });
  }, [
      lines,
      box,
      fontFamily,
      safeFontSize,
      fontWeight,
      fontStyle,
      safeLetterSpacing,
      safeLineHeight,
      align,
      paddingX,
      paddingY,
      fontNonce,
    ],
  );

  /*
   * Keep the mask's viewBox pinned to the host's current layout box in the
   * same commit that changes typography. `fontSize` can change asynchronously
   * of the engine's ResizeObserver (the docs fit-preview recomputes it), so
   * without this the mask could render for one frame using the previous
   * normal-preview width while the glyphs already use the larger fullscreen
   * size — clipping the leading/trailing letters until Replay remounts.
   * Reading `clientWidth`/`clientHeight` after the DOM mutation is
   * transform-independent, so the fullscreen scale animation cannot poison it.
   */
  useIsomorphicLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const w = Math.max(0, Math.round(host.clientWidth));
    const h = Math.max(0, Math.round(host.clientHeight));
    if (w <= 0 || h <= 0) return;
    setBox((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
  }, [
    lines,
    fontFamily,
    safeFontSize,
    fontWeight,
    fontStyle,
    safeLetterSpacing,
    safeLineHeight,
    align,
  ]);

  React.useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    let disposed = false;
    let rafId = 0;
    let gl: WebGLRenderingContext | null = null;
    let program: WebGLProgram | null = null;
    let quad: WebGLBuffer | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let intersectionObserver: IntersectionObserver | null = null;
    let reduceQuery: MediaQueryList | null = null;
    let onReduceChange: (() => void) | null = null;
    let onVisibility: (() => void) | null = null;
    let onLost: ((e: Event) => void) | null = null;
    let onRestored: (() => void) | null = null;
    let syncRaf = 0;
    let syncRaf2 = 0;

    const U: Record<string, WebGLUniformLocation | null> = {};

    const S = {
      time: 2.0,
      last: 0,
      running: false,
      visible: true,
      pageVisible: true,
      reduced: false,
      staticPreview: false,
      compiledPreset: "" as string,
      canvasW: 1,
      canvasH: 1,
    };

    function compile(type: number, source: string): WebGLShader | null {
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

    function compileProgram(presetKey: ShaderTextPresetName): boolean {
      if (!gl) return false;
      const vs = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
      const fs = compile(gl.FRAGMENT_SHADER, buildFragmentSource(presetKey));
      if (!vs || !fs) {
        if (vs && gl) gl.deleteShader(vs);
        if (fs && gl) gl.deleteShader(fs);
        return false;
      }
      const next = gl.createProgram();
      if (!next) {
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        return false;
      }
      gl.attachShader(next, vs);
      gl.attachShader(next, fs);
      gl.linkProgram(next);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!gl.getProgramParameter(next, gl.LINK_STATUS)) {
        gl.deleteProgram(next);
        return false;
      }
      if (program) gl.deleteProgram(program);
      program = next;
      gl.useProgram(program);

      const posLoc = gl.getAttribLocation(program, "aPosition");
      if (!quad) quad = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 3, -1, -1, 3]),
        gl.STATIC_DRAW,
      );
      if (posLoc >= 0) {
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
      }
      for (const name of ["u_time", "u_resolution", "u_scale", "u_softness"]) {
        U[name] = gl.getUniformLocation(program, name);
      }
      S.compiledPreset = presetKey;
      return true;
    }

    /**
     * Read the host's layout box, not its visual bounding rect.
     *
     * A parent can animate a CSS transform while this component's layout size
     * has already settled (the docs fullscreen preview scales its pane from the
     * card origin up to the viewport). `getBoundingClientRect()` would then
     * report the mid-transition, scaled size and poison the SVG mask + WebGL
     * backing store; the mask would be laid out for the smaller box while the
     * element is stretched to 100% of the final box, clipping the glyphs.
     * `clientWidth`/`clientHeight` are layout metrics and ignore transforms, so
     * they always describe the final box the mask must cover. The host has no
     * border and `overflow-hidden`, so the client box equals the padding box the
     * absolutely-positioned canvas is inset into.
     */
    function readLayoutBox(): { width: number; height: number } {
      if (!host) return { width: 0, height: 0 };
      return {
        width: Math.max(0, Math.round(host.clientWidth)),
        height: Math.max(0, Math.round(host.clientHeight)),
      };
    }

    function resize() {
      if (!gl || !canvas) return;
      const { width: cssW, height: cssH } = readLayoutBox();
      const safeW = Math.max(1, cssW);
      const safeH = Math.max(1, cssH);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      let eff = dpr * liveRef.current.resolution;
      eff = Math.min(Math.max(eff, 0.25), 2);
      while (safeW * eff * (safeH * eff) > 3_500_000 && eff > 0.4) eff *= 0.9;
      S.canvasW = Math.max(1, Math.floor(safeW * eff));
      S.canvasH = Math.max(1, Math.floor(safeH * eff));
      if (canvas.width !== S.canvasW) canvas.width = S.canvasW;
      if (canvas.height !== S.canvasH) canvas.height = S.canvasH;
      gl.viewport(0, 0, S.canvasW, S.canvasH);
    }

    function draw() {
      if (!gl || !program) return;
      const live = liveRef.current;
      if (S.compiledPreset !== live.preset) {
        if (!compileProgram(live.preset)) return;
        resize();
      }
      gl.useProgram(program);
      gl.uniform1f(U.u_time ?? null, S.time);
      gl.uniform2f(U.u_resolution ?? null, S.canvasW, S.canvasH);
      gl.uniform1f(U.u_scale ?? null, live.scale);
      gl.uniform1f(U.u_softness ?? null, live.softness);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function stop() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      S.running = false;
    }

    function frame(now: number) {
      rafId = 0;
      if (disposed || !gl || !program) return;
      if (!S.visible || !S.pageVisible || S.reduced || S.staticPreview) {
        S.running = false;
        return;
      }
      S.running = true;
      const dt = Math.min(Math.max((now - S.last) / 1000, 0.0001), 0.1);
      S.last = now;
      S.time += dt * liveRef.current.speed;
      draw();
      rafId = requestAnimationFrame(frame);
    }

    function kick() {
      if (disposed || !gl || !program || S.running) return;
      if (!S.visible || !S.pageVisible || S.reduced || S.staticPreview) return;
      S.last = performance.now();
      rafId = requestAnimationFrame(frame);
    }

    function renderStatic() {
      stop();
      draw();
    }

    function syncLoopMode() {
      if (S.reduced || S.staticPreview) {
        renderStatic();
      } else {
        kick();
      }
    }

    /* ---- boot ------------------------------------------------------ */
    S.staticPreview = isFramerCanvas();

    function initGL(): boolean {
      try {
        const ctx = canvas!.getContext("webgl", {
          antialias: false,
          alpha: false,
          depth: false,
          stencil: false,
          powerPreference: "high-performance",
        }) as WebGLRenderingContext | null;
        if (!ctx) return false;
        // A previous mount may have lost this canvas's context (e.g. React
        // StrictMode remount). getContext() then returns the lost context,
        // so attempt a restore before compiling anything.
        if (typeof ctx.isContextLost === "function" && ctx.isContextLost()) {
          const ext = ctx.getExtension("WEBGL_lose_context");
          try {
            ext?.restoreContext();
          } catch {
            /* restore is best-effort — the check below decides */
          }
          if (ctx.isContextLost()) return false;
        }
        gl = ctx;
        if (!compileProgram(liveRef.current.preset)) return false;
        gl.disable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);
        return true;
      } catch {
        return false;
      }
    }

    function destroyGL() {
      stop();
      if (gl) {
        if (quad) gl.deleteBuffer(quad);
        if (program) gl.deleteProgram(program);
      }
      // NOTE: intentionally no loseContext() here. Destroying the context
      // on unmount breaks remounts (StrictMode / Fast Refresh / tab
      // switches): getContext() would return the lost context and the
      // component would permanently fall back to static text.
      gl = null;
      program = null;
      quad = null;
    }

    if (!initGL()) {
      setFailed(true);
      return;
    }

    if (typeof window.matchMedia === "function") {
      reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      S.reduced = reduceQuery.matches;
      onReduceChange = () => {
        if (reduceQuery) S.reduced = reduceQuery.matches;
        syncLoopMode();
      };
      if (typeof reduceQuery.addEventListener === "function") {
        reduceQuery.addEventListener("change", onReduceChange);
      }
    }

    const measure = () => {
      const { width: w, height: h } = readLayoutBox();
      // Ignore a collapsed/hidden box (e.g. mid-mount) so we never build a
      // degenerate mask that would reveal the unmasked canvas.
      if (w <= 0 || h <= 0) return;
      setBox((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
    };

    /**
     * Single reinitialization pass: recalculate the host box, resize the WebGL
     * backing store, refresh `u_resolution` and repaint. Every dependent value
     * (mask viewBox, canvas size, DPR-aware resolution) is derived from the same
     * `readLayoutBox()` snapshot, so they can never disagree.
     */
    function syncLayout(redraw = true) {
      if (disposed) return;
      resize();
      measure();
      if (!redraw) {
        draw();
      } else if (S.reduced || S.staticPreview) {
        renderStatic();
      } else {
        kick();
      }
    }

    /**
     * Coalesce layout work onto animation frames. Waiting two frames lets an
     * in-flight ancestor transition (e.g. the docs fullscreen scale animation)
     * finish committing its layout without sampling a transient size; the
     * layout-box measurement itself is already transform-independent.
     */
    function scheduleSync(redraw = true) {
      if (disposed) return;
      if (syncRaf) cancelAnimationFrame(syncRaf);
      if (syncRaf2) {
        cancelAnimationFrame(syncRaf2);
        syncRaf2 = 0;
      }
      syncRaf = requestAnimationFrame(() => {
        syncRaf = 0;
        syncRaf2 = requestAnimationFrame(() => {
          syncRaf2 = 0;
          syncLayout(redraw);
        });
      });
    }

    syncLayout(false);
    scheduleSync(false);

    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        if (disposed) return;
        // The layout box is already final inside a resize notification and is
        // transform-invariant, so sync immediately (keeps the canvas/mask in
        // lockstep with flex/pane changes) and re-check once the entry/exit
        // transition has settled.
        syncLayout();
        scheduleSync();
      });
      resizeObserver.observe(host);
    }

    if (typeof IntersectionObserver !== "undefined") {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          S.visible = entry ? entry.isIntersecting : true;
          if (S.visible) syncLoopMode();
          else stop();
        },
        { threshold: 0 },
      );
      intersectionObserver.observe(host);
    }

    onVisibility = () => {
      S.pageVisible = document.visibilityState !== "hidden";
      if (S.pageVisible) syncLoopMode();
      else stop();
    };
    document.addEventListener("visibilitychange", onVisibility);

    onLost = (e: Event) => {
      e.preventDefault();
      destroyGL();
      setFailed(true);
    };
    onRestored = () => {
      // Rebuild all GL state on the restored context, then resume.
      destroyGL();
      if (initGL()) {
        setFailed(false);
        syncLayout(false);
        syncLoopMode();
      } else {
        setFailed(true);
      }
    };
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    syncLoopMode();

    return () => {
      disposed = true;
      stop();
      if (syncRaf) cancelAnimationFrame(syncRaf);
      if (syncRaf2) cancelAnimationFrame(syncRaf2);
      document.removeEventListener("visibilitychange", onVisibility as () => void);
      if (reduceQuery && onReduceChange) {
        if (typeof reduceQuery.removeEventListener === "function") {
          reduceQuery.removeEventListener("change", onReduceChange);
        }
      }
      if (onLost) canvas.removeEventListener("webglcontextlost", onLost);
      if (onRestored) canvas.removeEventListener("webglcontextrestored", onRestored);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      destroyGL();
    };
    // Mount-once engine: live values flow through refs; preset swaps
    // recompile lazily inside the frame loop. Size/mask via observers.
  }, []);

  const justify =
    align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center";

  const typeStyle: React.CSSProperties = {
    fontFamily,
    fontSize: safeFontSize,
    fontWeight,
    fontStyle: fontStyle || "normal",
    letterSpacing: safeLetterSpacing,
    lineHeight: safeLineHeight,
  };

  if (failed) {
    return (
      <div
        role="img"
        aria-label={ariaLabel ?? String(text ?? "")}
        className={cn("inline-block max-w-full", className)}
        style={style}
        {...props}
      >
        <div style={{ ...typeStyle, textAlign: align, whiteSpace: "pre-line" }}>
          {String(text ?? "")}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={hostRef}
      role="img"
      aria-label={ariaLabel ?? String(text ?? "")}
      data-slot="shader-text"
      data-preset={presetName}
      className={cn("relative inline-block max-w-full overflow-hidden", className)}
      style={{ ...style, padding: `${paddingY}px ${paddingX}px` }}
      {...props}
    >
      {/* Invisible sizing node — defines intrinsic layout exactly. */}
      <div
        aria-hidden="true"
        style={{
          visibility: "hidden",
          pointerEvents: "none",
          userSelect: "none",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              height: lineHeightPx,
              display: "flex",
              alignItems: "center",
              justifyContent: justify,
            }}
          >
            <span style={{ ...typeStyle, whiteSpace: "pre" }}>
              {line === "" ? "\u00A0" : line}
            </span>
          </div>
        ))}
      </div>

      {/* WebGL canvas clipped to the glyphs via the dynamic SVG mask. */}
      <div
        aria-hidden="true"
        style={
          (maskUrl
            ? {
                position: "absolute",
                inset: 0,
                WebkitMaskImage: `url("${maskUrl}")`,
                maskImage: `url("${maskUrl}")`,
                WebkitMaskSize: "100% 100%",
                maskSize: "100% 100%",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                maskMode: "alpha",
              }
            : { position: "absolute", inset: 0 }) as React.CSSProperties
        }
      >
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: "100%", display: "block" }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Framer compatibility — code-component property controls.            */
/* In Framer Canvas/editor mode the component renders one static frame */
/* (see isFramerCanvas) instead of running a continuous RAF loop.      */
/* ------------------------------------------------------------------ */

const FRAMER_PRESET_OPTIONS = [...SHADER_TEXT_PRESETS];
const FRAMER_PRESET_TITLES = FRAMER_PRESET_OPTIONS.map(
  (p) => p.charAt(0).toUpperCase() + p.slice(1),
);

(ShaderText as unknown as Record<string, unknown>).propertyControls = {
  text: { type: "String", title: "Text", defaultValue: SHADER_TEXT_DEFAULTS.text },
  fontFamily: {
    type: "String",
    title: "Font Family",
    defaultValue: SHADER_TEXT_DEFAULTS.fontFamily,
  },
  fontSize: {
    type: "Number",
    title: "Font Size",
    min: 8,
    max: 480,
    step: 1,
    defaultValue: SHADER_TEXT_DEFAULTS.fontSize,
  },
  fontWeight: {
    type: "Enum",
    title: "Font Weight",
    options: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    defaultValue: SHADER_TEXT_DEFAULTS.fontWeight,
  },
  fontStyle: {
    type: "Enum",
    title: "Font Style",
    options: ["normal", "italic"],
    defaultValue: SHADER_TEXT_DEFAULTS.fontStyle,
  },
  letterSpacing: {
    type: "Number",
    title: "Letter Spacing",
    min: -20,
    max: 80,
    step: 0.5,
    defaultValue: SHADER_TEXT_DEFAULTS.letterSpacing,
  },
  lineHeight: {
    type: "Number",
    title: "Line Height",
    min: 0.5,
    max: 3,
    step: 0.05,
    defaultValue: SHADER_TEXT_DEFAULTS.lineHeight,
  },
  textAlign: {
    type: "Enum",
    title: "Text Align",
    options: ["left", "center", "right"],
    defaultValue: SHADER_TEXT_DEFAULTS.textAlign,
  },
  preset: {
    type: "Enum",
    title: "Preset",
    options: FRAMER_PRESET_OPTIONS,
    optionTitles: FRAMER_PRESET_TITLES,
    defaultValue: SHADER_TEXT_DEFAULTS.preset,
  },
  speed: {
    type: "Number",
    title: "Speed",
    min: 0,
    max: 5,
    step: 0.05,
    defaultValue: SHADER_TEXT_DEFAULTS.speed,
  },
  scale: {
    type: "Number",
    title: "Scale",
    min: 0.2,
    max: 6,
    step: 0.05,
    defaultValue: SHADER_TEXT_DEFAULTS.scale,
  },
  resolution: {
    type: "Number",
    title: "Resolution",
    min: 0.25,
    max: 2,
    step: 0.05,
    defaultValue: SHADER_TEXT_DEFAULTS.resolution,
  },
  softness: {
    type: "Number",
    title: "Softness",
    min: 0,
    max: 1,
    step: 0.01,
    defaultValue: SHADER_TEXT_DEFAULTS.softness,
  },
};

(ShaderText as unknown as Record<string, unknown>).addPropertyControls =
  (ShaderText as unknown as Record<string, unknown>).propertyControls;

export default ShaderText;
