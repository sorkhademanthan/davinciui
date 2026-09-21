"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";
import { WebGLErrorBoundary } from "@workspace/ui/components/webgl-error-boundary";

/* =====================================================================================
 * FluidCursor — a fullscreen, GPU-simulated colorful fluid field driven by the cursor.
 *
 * Stable-fluids solver (velocity + dye + pressure + curl + vorticity confinement),
 * all computed in GLSL. Pointer deltas inject velocity/dye; the fluid keeps moving
 * with inertia, curls, mixes colors and fades back into black.
 * =================================================================================== */

export type FluidCursorColorMode = "spectral" | "ocean" | "sunset" | "mono";

export type FluidCursorTheme = "auto" | "light" | "dark";

export interface FluidCursorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Canvas clear color. Defaults to the resolved theme (near-black / white). */
  backgroundColor?: string;
  /** Color scheme. `"auto"` follows the site theme live. */
  theme?: FluidCursorTheme;
  /** Global multiplier for splat force and dye amount. */
  intensity?: number;
  /** Splat radius scale. 0.2–0.25 produces the broad masses in the reference. */
  trailSize?: number;
  /** Velocity force injected per pointer delta. */
  force?: number;
  /** Vorticity confinement strength (curl). 20–35 matches the reference. */
  curl?: number;
  /** Per-frame velocity retention at 60fps (0–1). Higher = longer inertia. */
  velocityDissipation?: number;
  /** Per-frame dye retention at 60fps (0–1). Higher = longer visible trails. */
  dyeDissipation?: number;
  /** Alias for dyeDissipation. */
  densityDissipation?: number;
  /** How fast the injected hue drifts through the spectrum (cycles/sec). */
  colorSpeed?: number;
  /** Overall exposure multiplier. */
  brightness?: number;
  /** Subtle halo around dense fluid (0 = off). */
  glow?: number;
  /** Color saturation of injected dye (0–1). */
  saturation?: number;
  /** Palette behavior. `spectral` matches the reference. */
  colorMode?: FluidCursorColorMode;
  /** Simulation grid resolution (velocity/pressure). Dye uses a higher grid. */
  resolution?: number;
  /** Pressure solver iterations. */
  pressureIterations?: number;
  /** Pointer velocity smoothing (0–1). Lower = heavier smoothing. */
  pointerSmoothing?: number;
  /** Cap for devicePixelRatio. */
  maxDpr?: number;
  /** Stacking order of the overlay. */
  zIndex?: number;
  /** Disable the simulation (renders background only). */
  disabled?: boolean;
  /** Constrain tracking + rendering to a host element. Defaults to viewport. */
  containerRef?: React.RefObject<HTMLElement | null>;
  /** Extra class for the overlay wrapper. */
  className?: string;
  children?: React.ReactNode;
}

/* ---------------------------------- shaders ---------------------------------- */

const BASE_VERTEX = `
precision highp float;
attribute vec2 aPosition;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform vec2 texelSize;
void main () {
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(texelSize.x, 0.0);
  vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y);
  vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const COPY_SHADER = `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
uniform sampler2D uTexture;
void main () { gl_FragColor = texture2D(uTexture, vUv); }
`;

const CLEAR_SHADER = `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
uniform sampler2D uTexture;
uniform float value;
void main () { gl_FragColor = value * texture2D(uTexture, vUv); }
`;

const SPLAT_SHADER = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 point;
uniform float radius;
void main () {
  vec2 p = vUv - point.xy;
  p.x *= aspectRatio;
  vec3 splat = exp(-dot(p, p) / radius) * color;
  vec3 base = texture2D(uTarget, vUv).xyz;
  gl_FragColor = vec4(base + splat, 1.0);
}
`;

const ADVECTION_SHADER = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform vec2 dyeTexelSize;
uniform float dt;
uniform float dissipation;

vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
  vec2 st = uv / tsize - 0.5;
  vec2 iuv = floor(st);
  vec2 fuv = fract(st);
  vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
  vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
  vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
  vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
  return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
}

void main () {
#ifdef MANUAL_FILTERING
  vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
  vec4 result = bilerp(uSource, coord, dyeTexelSize);
#else
  vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
  vec4 result = texture2D(uSource, coord);
#endif
  float decay = 1.0 + dissipation * dt;
  gl_FragColor = result / decay;
}
`;

const DIVERGENCE_SHADER = `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D uVelocity;
void main () {
  float L = texture2D(uVelocity, vL).x;
  float R = texture2D(uVelocity, vR).x;
  float T = texture2D(uVelocity, vT).y;
  float B = texture2D(uVelocity, vB).y;
  vec2 C = texture2D(uVelocity, vUv).xy;
  if (vL.x < 0.0) { L = -C.x; }
  if (vR.x > 1.0) { R = -C.x; }
  if (vT.y > 1.0) { T = -C.y; }
  if (vB.y < 0.0) { B = -C.y; }
  float div = 0.5 * (R - L + T - B);
  gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
}
`;

const CURL_SHADER = `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D uVelocity;
void main () {
  float L = texture2D(uVelocity, vL).y;
  float R = texture2D(uVelocity, vR).y;
  float T = texture2D(uVelocity, vT).x;
  float B = texture2D(uVelocity, vB).x;
  float vorticity = R - L - T + B;
  gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
}
`;

const VORTICITY_SHADER = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float curl;
uniform float dt;
void main () {
  float L = texture2D(uCurl, vL).x;
  float R = texture2D(uCurl, vR).x;
  float T = texture2D(uCurl, vT).x;
  float B = texture2D(uCurl, vB).x;
  float C = texture2D(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= curl * C;
  force.y *= -1.0;
  vec2 velocity = texture2D(uVelocity, vUv).xy;
  velocity += force * dt;
  velocity = min(max(velocity, -1000.0), 1000.0);
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}
`;

const PRESSURE_SHADER = `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
void main () {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  float divergence = texture2D(uDivergence, vUv).x;
  float pressure = (L + R + B + T - divergence) * 0.25;
  gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
}
`;

const GRADIENT_SUBTRACT_SHADER = `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
void main () {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  vec2 velocity = texture2D(uVelocity, vUv).xy;
  velocity.xy -= vec2(R - L, T - B);
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}
`;

const DISPLAY_SHADER = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform vec2 texelSize;
uniform vec3 uBackground;
uniform float uBrightness;
uniform float uGlow;
void main () {
  vec3 dye = texture2D(uTexture, vUv).rgb;
  vec3 halo = vec3(0.0);
  halo += texture2D(uTexture, vUv + vec2( texelSize.x * 2.0, 0.0)).rgb;
  halo += texture2D(uTexture, vUv + vec2(-texelSize.x * 2.0, 0.0)).rgb;
  halo += texture2D(uTexture, vUv + vec2(0.0,  texelSize.y * 2.0)).rgb;
  halo += texture2D(uTexture, vUv + vec2(0.0, -texelSize.y * 2.0)).rgb;
  halo += texture2D(uTexture, vUv + vec2( texelSize.x * 2.0,  texelSize.y * 2.0)).rgb * 0.5;
  halo += texture2D(uTexture, vUv + vec2(-texelSize.x * 2.0,  texelSize.y * 2.0)).rgb * 0.5;
  halo += texture2D(uTexture, vUv + vec2( texelSize.x * 2.0, -texelSize.y * 2.0)).rgb * 0.5;
  halo += texture2D(uTexture, vUv + vec2(-texelSize.x * 2.0, -texelSize.y * 2.0)).rgb * 0.5;
  halo /= 6.0;
  vec3 col = dye + halo * uGlow;
  col *= uBrightness;
  // Gentle filmic-style lift: dark interiors stay translucent, dense cores
  // and edges glow without clipping to white.
  col = col / (1.0 + col * 0.45);
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  float peak = max(col.r, max(col.g, col.b));
  // Smooth density response — no threshold, so edges dissolve into black.
  float alpha = 1.0 - exp(-lum * 2.6 - peak * 1.2);
  col = mix(uBackground, col, clamp(alpha, 0.0, 1.0));
  gl_FragColor = vec4(col, 1.0);
}
`;

/* ---------------------------------- helpers ---------------------------------- */

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.trim().replace(/^#/, "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return [0, 0, 0];
  return [
    parseInt(full.slice(0, 2), 16) / 255,
    parseInt(full.slice(2, 4), 16) / 255,
    parseInt(full.slice(4, 6), 16) / 255,
  ];
}

/** HSV (h 0–1) → RGB, all channels 0–1. */
function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const hh = (((h % 1) + 1) % 1) * 6;
  const i = Math.floor(hh);
  const f = hh - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: return [v, t, p];
    case 1: return [q, v, p];
    case 2: return [p, v, t];
    case 3: return [p, q, v];
    case 4: return [t, p, v];
    default: return [v, p, q];
  }
}

type GL = WebGLRenderingContext | WebGL2RenderingContext;

interface FBO {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  attach: (id: number) => number;
}

interface DoubleFBO {
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  read: FBO;
  write: FBO;
  swap: () => void;
}

interface ContextResult {
  gl: GL;
  isWebGL2: boolean;
  halfFloatTexType: number;
  supportLinearFiltering: boolean;
  internalFormatRGBA: number;
  internalFormatR: number;
}

function getWebGLContext(canvas: HTMLCanvasElement): ContextResult | null {
  const params: WebGLContextAttributes = {
    alpha: false,
    depth: false,
    stencil: false,
    antialias: false,
    preserveDrawingBuffer: false,
    powerPreference: "high-performance",
  };

  const gl2 = canvas.getContext("webgl2", params) as WebGL2RenderingContext | null;
  if (gl2) {
    if (!gl2.getExtension("EXT_color_buffer_float")) return null;
    return buildContext(gl2, true);
  }
  const gl1 =
    (canvas.getContext("webgl", params) as WebGLRenderingContext | null) ??
    (canvas.getContext("experimental-webgl", params) as unknown as WebGLRenderingContext | null);
  if (!gl1) return null;
  return buildContext(gl1, false);
}

function buildContext(gl: GL, isWebGL2: boolean): ContextResult | null {
  const glc = gl;

  let halfFloatTexType = (glc as WebGL2RenderingContext).HALF_FLOAT as number;
  let supportLinearFiltering = true;
  if (isWebGL2) {
    (glc as WebGL2RenderingContext).getExtension("OES_texture_float_linear");
  } else {
    const halfFloatExt = (glc as WebGLRenderingContext).getExtension("OES_texture_half_float");
    if (!halfFloatExt) return null;
    supportLinearFiltering = !!(glc as WebGLRenderingContext).getExtension(
      "OES_texture_half_float_linear",
    );
    halfFloatTexType = halfFloatExt.HALF_FLOAT_OES;
  }

  glc.clearColor(0, 0, 0, 1);

  return {
    gl: glc,
    isWebGL2,
    halfFloatTexType,
    supportLinearFiltering,
    internalFormatRGBA: isWebGL2 ? (glc as WebGL2RenderingContext).RGBA16F : glc.RGBA,
    internalFormatR: isWebGL2 ? (glc as WebGL2RenderingContext).R16F : glc.RGBA,
  };
}

function compileShader(gl: GL, type: number, source: string): WebGLShader | null {
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

function linkProgram(gl: GL, vs: WebGLShader, fs: WebGLShader): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

class ShaderProgram {
  program: WebGLProgram;
  uniforms: Record<string, WebGLUniformLocation | null> = {};
  private gl: GL;

  constructor(gl: GL, vertexShader: WebGLShader, fragmentSource: string, keywords?: string[]) {
    this.gl = gl;
    let source = "";
    if (keywords) {
      for (const kw of keywords) source += `#define ${kw}\n`;
    }
    source += fragmentSource;
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, source);
    if (!fs) throw new Error("fluid-cursor: fragment shader failed to compile");
    const program = linkProgram(gl, vertexShader, fs);
    gl.deleteShader(fs);
    if (!program) throw new Error("fluid-cursor: program failed to link");
    this.program = program;
    const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number;
    for (let i = 0; i < count; i++) {
      const info = gl.getActiveUniform(program, i);
      if (!info) continue;
      this.uniforms[info.name] = gl.getUniformLocation(program, info.name);
    }
  }

  bind() {
    this.gl.useProgram(this.program);
  }

  loc(name: string): WebGLUniformLocation | null {
    return this.uniforms[name] ?? null;
  }
}

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

/** Resolve the effective scheme, following the site theme live when `"auto"`. */
function useThemeScheme(theme: FluidCursorTheme): "light" | "dark" {
  const [scheme, setScheme] = React.useState<"light" | "dark">(() =>
    typeof document === "undefined" ? "dark" : theme === "auto" ? resolveColorScheme() : theme,
  );
  React.useEffect(() => {
    if (theme !== "auto") {
      setScheme(theme);
      return;
    }
    setScheme(resolveColorScheme());
    const observer = new MutationObserver(() => setScheme(resolveColorScheme()));
    observer.observe(document.documentElement, {
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
  }, [theme]);
  return scheme;
}

/* --------------------------------- component --------------------------------- */

export function FluidCursor({
  backgroundColor,
  theme = "auto",
  intensity = 1,
  trailSize = 0.22,
  force = 1,
  curl = 28,
  velocityDissipation = 0.992,
  dyeDissipation = 0.975,
  densityDissipation,
  colorSpeed = 0.12,
  brightness = 1,
  glow = 0.15,
  saturation = 0.85,
  colorMode = "spectral",
  resolution = 128,
  pressureIterations = 20,
  pointerSmoothing = 0.18,
  maxDpr = 2,
  zIndex = 10,
  disabled = false,
  containerRef,
  className,
  style,
  children,
  ...props
}: FluidCursorProps) {
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [failed, setFailed] = React.useState(false);
  const scheme = useThemeScheme(theme);
  // Explicit backgroundColor always wins; otherwise follow the scheme so the
  // effect works on both dark and light stages. Read live every frame, so
  // theme toggles crossfade without rebuilding the simulation.
  const resolvedBackground = backgroundColor ?? (scheme === "light" ? "#ffffff" : "#000000");

  const settingsRef = React.useRef({
    backgroundColor: resolvedBackground,
    intensity,
    trailSize,
    force,
    curl,
    velocityDissipation,
    dyeDissipation: densityDissipation ?? dyeDissipation,
    colorSpeed,
    brightness,
    glow,
    saturation,
    colorMode,
    resolution,
    pressureIterations,
    pointerSmoothing,
    maxDpr,
  });
  settingsRef.current = {
    backgroundColor: resolvedBackground,
    intensity,
    trailSize,
    force,
    curl,
    velocityDissipation,
    dyeDissipation: densityDissipation ?? dyeDissipation,
    colorSpeed,
    brightness,
    glow,
    saturation,
    colorMode,
    resolution,
    pressureIterations,
    pointerSmoothing,
    maxDpr,
  };
  const containerRefRef = React.useRef(containerRef);
  containerRefRef.current = containerRef;

  React.useEffect(() => {
    if (disabled || failed) return;
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const canvas: HTMLCanvasElement = canvasEl;

    let ctx: ContextResult | null = null;
    try {
      ctx = getWebGLContext(canvas);
    } catch {
      ctx = null;
    }
    if (!ctx) {
      setFailed(true);
      return;
    }
    const { gl, halfFloatTexType, supportLinearFiltering, internalFormatRGBA, internalFormatR } = ctx;

    let baseVertex: WebGLShader | null = null;
    let raf = 0;
    let disposed = false;
    const disposables: Array<() => void> = [];
    const on = (
      target: Window | Document | HTMLCanvasElement,
      type: string,
      listener: (e: never) => void,
      options?: AddEventListenerOptions,
    ) => {
      target.addEventListener(type, listener as EventListener, options);
      disposables.push(() => target.removeEventListener(type, listener as EventListener, options));
    };

    try {
      baseVertex = compileShader(gl, gl.VERTEX_SHADER, BASE_VERTEX);
      if (!baseVertex) throw new Error("vertex compile failed");
      const vs = baseVertex;

      // Fullscreen quad (aPosition location 0).
      const quadBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
      const quadElements = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quadElements);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(0);

      const keywords = supportLinearFiltering ? [] : ["MANUAL_FILTERING"];
      const copyProgram = new ShaderProgram(gl, vs, COPY_SHADER);
      const clearProgram = new ShaderProgram(gl, vs, CLEAR_SHADER);
      const splatProgram = new ShaderProgram(gl, vs, SPLAT_SHADER);
      const advectionProgram = new ShaderProgram(gl, vs, ADVECTION_SHADER, keywords);
      const divergenceProgram = new ShaderProgram(gl, vs, DIVERGENCE_SHADER);
      const curlProgram = new ShaderProgram(gl, vs, CURL_SHADER);
      const vorticityProgram = new ShaderProgram(gl, vs, VORTICITY_SHADER);
      const pressureProgram = new ShaderProgram(gl, vs, PRESSURE_SHADER);
      const gradientSubtractProgram = new ShaderProgram(gl, vs, GRADIENT_SUBTRACT_SHADER);
      const displayProgram = new ShaderProgram(gl, vs, DISPLAY_SHADER);
      const allPrograms = [
        copyProgram, clearProgram, splatProgram, advectionProgram, divergenceProgram,
        curlProgram, vorticityProgram, pressureProgram, gradientSubtractProgram, displayProgram,
      ];

      /* ------------------------------ framebuffers ----------------------------- */
      let dye: DoubleFBO | null = null;
      let velocity: DoubleFBO | null = null;
      let divergence: FBO | null = null;
      let curlFBO: FBO | null = null;
      let pressure: DoubleFBO | null = null;

      function createFBO(w: number, h: number, internalFormat: number, param: number): FBO {
        gl.activeTexture(gl.TEXTURE0);
        const texture = gl.createTexture();
        if (!texture) throw new Error("fluid-cursor: texture creation failed");
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, gl.RGBA, halfFloatTexType, null);
        const fbo = gl.createFramebuffer();
        if (!fbo) {
          gl.deleteTexture(texture);
          throw new Error("fluid-cursor: framebuffer creation failed");
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        gl.viewport(0, 0, w, h);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        return {
          texture, fbo, width: w, height: h,
          texelSizeX: 1 / w, texelSizeY: 1 / h,
          attach(id: number) {
            gl.activeTexture(gl.TEXTURE0 + id);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            return id;
          },
        };
      }

      function createDoubleFBO(w: number, h: number, internalFormat: number, param: number): DoubleFBO {
        let fbo1 = createFBO(w, h, internalFormat, param);
        let fbo2 = createFBO(w, h, internalFormat, param);
        return {
          width: w, height: h,
          texelSizeX: fbo1.texelSizeX, texelSizeY: fbo1.texelSizeY,
          get read() { return fbo1; },
          set read(v: FBO) { fbo1 = v; },
          get write() { return fbo2; },
          set write(v: FBO) { fbo2 = v; },
          swap() { const t = fbo1; fbo1 = fbo2; fbo2 = t; },
        };
      }

      function blitTo(target: FBO | null) {
        if (target == null) {
          gl.viewport(0, 0, canvas.width, canvas.height);
          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        } else {
          gl.viewport(0, 0, target.width, target.height);
          gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
        }
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      }

      function copyInto(source: FBO, target: FBO) {
        copyProgram.bind();
        gl.uniform2f(copyProgram.loc("texelSize"), source.texelSizeX, source.texelSizeY);
        gl.uniform1i(copyProgram.loc("uTexture"), source.attach(0));
        gl.viewport(0, 0, target.width, target.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      }

      function resizeDoubleFBO(
        target: DoubleFBO, w: number, h: number, internalFormat: number, param: number,
      ): DoubleFBO {
        if (target.width === w && target.height === h) return target;
        const newRead = createFBO(w, h, internalFormat, param);
        copyInto(target.read, newRead);
        const newWrite = createFBO(w, h, internalFormat, param);
        gl.deleteTexture(target.read.texture);
        gl.deleteFramebuffer(target.read.fbo);
        gl.deleteTexture(target.write.texture);
        gl.deleteFramebuffer(target.write.fbo);
        target.read = newRead;
        target.write = newWrite;
        target.width = w;
        target.height = h;
        target.texelSizeX = 1 / w;
        target.texelSizeY = 1 / h;
        return target;
      }

      function getResolution(res: number) {
        const aspect = canvas.width / Math.max(1, canvas.height);
        const a = aspect < 1 ? 1 / aspect : aspect;
        const min = Math.max(32, Math.round(res));
        const max = Math.max(32, Math.round(res * a));
        if (canvas.width > canvas.height) return { width: max, height: min };
        return { width: min, height: max };
      }

      function initFramebuffers() {
        const s = settingsRef.current;
        const coarse =
          typeof window !== "undefined" &&
          (window.matchMedia?.("(pointer: coarse)").matches ||
            Math.min(window.innerWidth, window.innerHeight) < 640);
        const simRes = Math.round(coarse ? Math.min(s.resolution, 96) : s.resolution);
        const dyeRes = coarse ? 512 : 1024;
        const filtering = supportLinearFiltering ? gl.LINEAR : gl.NEAREST;
        gl.disable(gl.BLEND);

        const sim = getResolution(simRes);
        const dyeR = getResolution(dyeRes);
        if (!dye || !velocity) {
          dye = createDoubleFBO(dyeR.width, dyeR.height, internalFormatRGBA, filtering);
          velocity = createDoubleFBO(sim.width, sim.height, internalFormatRGBA, filtering);
          divergence = createFBO(sim.width, sim.height, internalFormatR, gl.NEAREST);
          curlFBO = createFBO(sim.width, sim.height, internalFormatR, gl.NEAREST);
          pressure = createDoubleFBO(sim.width, sim.height, internalFormatR, gl.NEAREST);
        } else {
          const simSizeChanged = sim.width !== velocity.width || sim.height !== velocity.height;
          dye = resizeDoubleFBO(dye, dyeR.width, dyeR.height, internalFormatRGBA, filtering);
          velocity = resizeDoubleFBO(velocity, sim.width, sim.height, internalFormatRGBA, filtering);
          if (simSizeChanged) {
            if (divergence) { gl.deleteTexture(divergence.texture); gl.deleteFramebuffer(divergence.fbo); }
            if (curlFBO) { gl.deleteTexture(curlFBO.texture); gl.deleteFramebuffer(curlFBO.fbo); }
            if (pressure) {
              gl.deleteTexture(pressure.read.texture); gl.deleteFramebuffer(pressure.read.fbo);
              gl.deleteTexture(pressure.write.texture); gl.deleteFramebuffer(pressure.write.fbo);
            }
            divergence = createFBO(sim.width, sim.height, internalFormatR, gl.NEAREST);
            curlFBO = createFBO(sim.width, sim.height, internalFormatR, gl.NEAREST);
            pressure = createDoubleFBO(sim.width, sim.height, internalFormatR, gl.NEAREST);
          }
        }
      }

      /* --------------------------------- splats -------------------------------- */
      function splatTarget(
        target: FBO, x: number, y: number, r: number, g: number, b: number, radius: number,
        swap: () => void, read: () => FBO,
      ) {
        splatProgram.bind();
        gl.uniform2f(splatProgram.loc("texelSize"), target.texelSizeX, target.texelSizeY);
        gl.uniform1i(splatProgram.loc("uTarget"), read().attach(0));
        gl.uniform1f(splatProgram.loc("aspectRatio"), canvas.width / Math.max(1, canvas.height));
        gl.uniform2f(splatProgram.loc("point"), x, y);
        gl.uniform3f(splatProgram.loc("color"), r, g, b);
        gl.uniform1f(splatProgram.loc("radius"), radius);
        gl.viewport(0, 0, target.width, target.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        swap();
      }

      function splatVelocity(x: number, y: number, dx: number, dy: number, radius: number) {
        if (!velocity) return;
        splatTarget(velocity.write, x, y, dx, dy, 0, radius, () => velocity!.swap(), () => velocity!.read);
      }

      function splatDye(x: number, y: number, r: number, g: number, b: number, radius: number) {
        if (!dye) return;
        splatTarget(dye.write, x, y, r, g, b, radius, () => dye!.swap(), () => dye!.read);
      }

      function splatRadiusUV(): number {
        // trailSize ≈ 0.22 → radius ≈ 0.0022, aspect-compensated like classic demos.
        const s = settingsRef.current;
        const t = Math.min(1.5, Math.max(0.02, s.trailSize));
        let radius = t / 100;
        const aspect = canvas.width / Math.max(1, canvas.height);
        if (aspect > 1) radius *= aspect;
        return Math.max(0.0002, radius);
      }

      /* --------------------------------- pointer -------------------------------- */
      const pointer = { x: 0.5, y: 0.5 };
      // Injection point eased toward the raw pointer each frame. Coalesces
      // high-frequency pointer events and filters jitter.
      const smoothPos = { x: 0.5, y: 0.5 };
      const lastSplat = { x: 0.5, y: 0.5 };
      let hasPointer = false;
      let hue = 0.58;
      let dyeRGB: [number, number, number] = [0, 0.6, 1];

      function snapPointer(x: number, y: number) {
        pointer.x = x;
        pointer.y = y;
        smoothPos.x = x;
        smoothPos.y = y;
        lastSplat.x = x;
        lastSplat.y = y;
        hasPointer = true;
      }

      function paletteFor(h: number, sat: number, mode: FluidCursorColorMode): [number, number, number] {
        if (mode === "ocean") return hsvToRgb(0.52 + 0.1 * Math.sin(h * 12.566), 0.6 * sat + 0.25, 1);
        if (mode === "sunset") return hsvToRgb(0.02 + 0.13 * ((((h * 3) % 1) + 1) % 1), 0.7 * sat + 0.25, 1);
        if (mode === "mono") {
          const s2 = Math.sin(h * 6.283);
          const v = 0.55 + 0.45 * s2 * s2;
          return [v * 0.72, v * 0.88, v];
        }
        return hsvToRgb(h, sat, 1);
      }

      function updateColor(dt: number, speedBoost: number) {
        const s = settingsRef.current;
        hue = (hue + dt * Math.max(0, s.colorSpeed)) % 1;
        const [r, g, b] = paletteFor(hue, clamp01(s.saturation), s.colorMode);
        const lift = Math.min(1.5, 0.7 + speedBoost * 1.1);
        dyeRGB = [r * lift, g * lift, b * lift];
      }

      function doSplat(x: number, y: number, dx: number, dy: number, dyeScale: number) {
        const s = settingsRef.current;
        const rad = splatRadiusUV();
        const forceScale = 6000 * s.force * s.intensity;
        splatVelocity(x, y, dx * forceScale, dy * forceScale, rad);
        splatDye(
          x, y,
          dyeRGB[0] * dyeScale, dyeRGB[1] * dyeScale, dyeRGB[2] * dyeScale,
          rad * 1.2,
        );
      }

      function toTexCoord(clientX: number, clientY: number) {
        const host = containerRefRef.current?.current ?? null;
        if (host) {
          const rect = host.getBoundingClientRect();
          if (rect.width < 1 || rect.height < 1) return null;
          return { x: (clientX - rect.left) / rect.width, y: 1 - (clientY - rect.top) / rect.height };
        }
        if (window.innerWidth < 1 || window.innerHeight < 1) return null;
        return { x: clientX / window.innerWidth, y: 1 - clientY / window.innerHeight };
      }

      function trackPoint(clientX: number, clientY: number) {
        const host = containerRefRef.current?.current ?? null;
        if (host) {
          // Container mode: ignore movement outside the host so the
          // simulation stays still unless the pointer is actually over it.
          // (Without this, out-of-bounds points clamp to the edges and the
          // fluid keeps reacting to the rest of the page.)
          const rect = host.getBoundingClientRect();
          if (
            clientX < rect.left || clientX > rect.right ||
            clientY < rect.top || clientY > rect.bottom
          ) {
            return;
          }
        }
        const t = toTexCoord(clientX, clientY);
        if (!t) return;
        const x = clamp01(t.x);
        const y = clamp01(t.y);
        if (!hasPointer) {
          snapPointer(x, y);
          return;
        }
        pointer.x = x;
        pointer.y = y;
      }

      const onPointerMove = (e: PointerEvent) => {
        if (e.pointerType === "touch") return;
        trackPoint(e.clientX, e.clientY);
      };
      const onPointerDown = (e: PointerEvent) => {
        const host = containerRefRef.current?.current ?? null;
        if (host) {
          const rect = host.getBoundingClientRect();
          if (
            e.clientX < rect.left || e.clientX > rect.right ||
            e.clientY < rect.top || e.clientY > rect.bottom
          ) {
            return;
          }
        }
        const t = toTexCoord(e.clientX, e.clientY);
        if (!t) return;
        // A press starts a new stroke — snap to avoid a sweep from the old spot.
        snapPointer(clamp01(t.x), clamp01(t.y));
      };
      const onTouchMove = (e: TouchEvent) => {
        const touch = e.touches[0];
        if (!touch) return;
        trackPoint(touch.clientX, touch.clientY);
      };

      on(window, "pointermove", onPointerMove as (e: never) => void, { passive: true });
      on(window, "pointerdown", onPointerDown as (e: never) => void, { passive: true });
      on(window, "touchmove", onTouchMove as (e: never) => void, { passive: true });

      /* ---------------------------------- sizing -------------------------------- */
      function resizeCanvas() {
        const s = settingsRef.current;
        const host = containerRefRef.current?.current ?? null;
        let cssW: number;
        let cssH: number;
        if (host) {
          const rect = host.getBoundingClientRect();
          cssW = Math.max(1, rect.width);
          cssH = Math.max(1, rect.height);
        } else {
          cssW = Math.max(1, window.innerWidth);
          cssH = Math.max(1, window.innerHeight);
        }
        const dpr = Math.min(window.devicePixelRatio || 1, Math.max(1, s.maxDpr));
        const w = Math.max(1, Math.floor(cssW * dpr));
        const h = Math.max(1, Math.floor(cssH * dpr));
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
          initFramebuffers();
        }
      }

      initFramebuffers();
      resizeCanvas();
      on(window, "resize", resizeCanvas as (e: never) => void);
      let resizeObserver: ResizeObserver | null = null;
      const observedHost = containerRefRef.current?.current ?? null;
      if (typeof ResizeObserver !== "undefined" && observedHost) {
        resizeObserver = new ResizeObserver(resizeCanvas);
        resizeObserver.observe(observedHost);
      }

      /* ----------------------------------- loop ---------------------------------- */
      const reducedMotion =
        typeof window !== "undefined" &&
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      let lastTime = performance.now();
      let visible = true;
      let firstFrame = true;

      function step(dt: number) {
        const s = settingsRef.current;
        if (!dye || !velocity || !divergence || !curlFBO || !pressure) return;
        // Per-frame retention (spec API) → exponential decay for the shader.
        const velRet = clamp01(s.velocityDissipation);
        const dyeRet = clamp01(s.dyeDissipation);
        const velDecay = velRet >= 1 ? 0 : (1 / Math.max(1e-3, velRet) - 1) / Math.max(1e-4, dt);
        const dyeDecay = dyeRet >= 1 ? 0 : (1 / Math.max(1e-3, dyeRet) - 1) / Math.max(1e-4, dt);

        gl.disable(gl.BLEND);

        // curl
        curlProgram.bind();
        gl.uniform2f(curlProgram.loc("texelSize"), velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(curlProgram.loc("uVelocity"), velocity.read.attach(0));
        blitTo(curlFBO);

        // vorticity confinement
        vorticityProgram.bind();
        gl.uniform2f(vorticityProgram.loc("texelSize"), velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(vorticityProgram.loc("uVelocity"), velocity.read.attach(0));
        gl.uniform1i(vorticityProgram.loc("uCurl"), curlFBO.attach(1));
        gl.uniform1f(vorticityProgram.loc("curl"), s.curl);
        gl.uniform1f(vorticityProgram.loc("dt"), dt);
        blitTo(velocity.write);
        velocity.swap();

        // divergence
        divergenceProgram.bind();
        gl.uniform2f(divergenceProgram.loc("texelSize"), velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(divergenceProgram.loc("uVelocity"), velocity.read.attach(0));
        blitTo(divergence);

        // pressure: decay then Jacobi iterations
        clearProgram.bind();
        gl.uniform2f(clearProgram.loc("texelSize"), velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(clearProgram.loc("uTexture"), pressure.read.attach(0));
        gl.uniform1f(clearProgram.loc("value"), 0.8);
        blitTo(pressure.write);
        pressure.swap();

        pressureProgram.bind();
        gl.uniform2f(pressureProgram.loc("texelSize"), velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(pressureProgram.loc("uDivergence"), divergence.attach(0));
        const iterations = Math.max(4, Math.min(40, Math.round(s.pressureIterations)));
        for (let i = 0; i < iterations; i++) {
          gl.uniform1i(pressureProgram.loc("uPressure"), pressure.read.attach(1));
          blitTo(pressure.write);
          pressure.swap();
        }

        // subtract pressure gradient
        gradientSubtractProgram.bind();
        gl.uniform2f(
          gradientSubtractProgram.loc("texelSize"), velocity.texelSizeX, velocity.texelSizeY,
        );
        gl.uniform1i(gradientSubtractProgram.loc("uPressure"), pressure.read.attach(0));
        gl.uniform1i(gradientSubtractProgram.loc("uVelocity"), velocity.read.attach(1));
        blitTo(velocity.write);
        velocity.swap();

        // advect velocity
        advectionProgram.bind();
        gl.uniform2f(advectionProgram.loc("texelSize"), velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform2f(advectionProgram.loc("dyeTexelSize"), velocity.texelSizeX, velocity.texelSizeY);
        const velocityId = velocity.read.attach(0);
        gl.uniform1i(advectionProgram.loc("uVelocity"), velocityId);
        gl.uniform1i(advectionProgram.loc("uSource"), velocityId);
        gl.uniform1f(advectionProgram.loc("dt"), dt);
        gl.uniform1f(advectionProgram.loc("dissipation"), velDecay);
        blitTo(velocity.write);
        velocity.swap();

        // advect dye
        gl.uniform2f(advectionProgram.loc("dyeTexelSize"), dye.texelSizeX, dye.texelSizeY);
        gl.uniform1i(advectionProgram.loc("uVelocity"), velocity.read.attach(0));
        gl.uniform1i(advectionProgram.loc("uSource"), dye.read.attach(1));
        gl.uniform1f(advectionProgram.loc("dissipation"), dyeDecay);
        blitTo(dye.write);
        dye.swap();
      }

      function render() {
        if (!dye) return;
        const s = settingsRef.current;
        displayProgram.bind();
        gl.uniform2f(displayProgram.loc("texelSize"), dye.texelSizeX, dye.texelSizeY);
        gl.uniform1i(displayProgram.loc("uTexture"), dye.read.attach(0));
        const [br, bgg, bb] = hexToRgb(s.backgroundColor);
        gl.uniform3f(displayProgram.loc("uBackground"), br, bgg, bb);
        gl.uniform1f(displayProgram.loc("uBrightness"), Math.max(0.05, s.brightness));
        gl.uniform1f(displayProgram.loc("uGlow"), Math.max(0, s.glow));
        blitTo(null);
      }

      function frame(now: number) {
        if (disposed) return;
        raf = requestAnimationFrame(frame);
        if (!visible) {
          lastTime = now;
          return;
        }
        const dt = Math.min(1 / 30, Math.max(1e-4, (now - lastTime) / 1000));
        lastTime = now;

        if (reducedMotion) {
          if (firstFrame) {
            render();
            firstFrame = false;
          }
          return;
        }

        const s = settingsRef.current;

        if (hasPointer) {
          // Ease toward the raw pointer; pointerSmoothing=0.18 → alpha≈0.85,
          // responsive with light filtering.
          const alpha = Math.min(1, Math.max(0.05, 1 - clamp01(s.pointerSmoothing) * 0.82));
          smoothPos.x += (pointer.x - smoothPos.x) * alpha;
          smoothPos.y += (pointer.y - smoothPos.y) * alpha;
          const dx = smoothPos.x - lastSplat.x;
          const dy = smoothPos.y - lastSplat.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 0.000001) {
            // Hue advances only while injecting, so color changes stay tied
            // to interaction and adjacent regions keep distinct hues.
            updateColor(dt, Math.min(1, dist * 40));
            // Interpolate along the frame's travel so fast motion forms a
            // continuous ribbon instead of disconnected blobs. Dye is budgeted
            // per frame and split across substeps; velocity sums to the true
            // travel so momentum stays physical.
            const steps = Math.min(32, Math.max(1, Math.ceil(dist / 0.0016)));
            const dyeTotal = Math.min(1.2, 0.2 + dist * 30) * 0.55 * s.intensity;
            let px = lastSplat.x;
            let py = lastSplat.y;
            for (let i = 1; i <= steps; i++) {
              const t = i / steps;
              const ix = lastSplat.x + dx * t;
              const iy = lastSplat.y + dy * t;
              let sdx = ix - px;
              let sdy = iy - py;
              const m = Math.hypot(sdx, sdy);
              const maxV = 0.006;
              if (m > maxV) {
                const cl = maxV / m;
                sdx *= cl;
                sdy *= cl;
              }
              doSplat(ix, iy, sdx, sdy, dyeTotal / steps);
              px = ix;
              py = iy;
            }
            lastSplat.x = smoothPos.x;
            lastSplat.y = smoothPos.y;
          }
        }

        step(dt);
        render();
        firstFrame = false;
      }

      const onVisibility = () => {
        visible = document.visibilityState !== "hidden";
        lastTime = performance.now();
      };
      const onContextLost = (e: Event) => {
        e.preventDefault();
        setFailed(true);
      };
      on(document, "visibilitychange", onVisibility as (e: never) => void);
      canvas.addEventListener("webglcontextlost", onContextLost);
      disposables.push(() => canvas.removeEventListener("webglcontextlost", onContextLost));

      raf = requestAnimationFrame((t) => {
        lastTime = t;
        raf = requestAnimationFrame(frame);
      });

      return () => {
        disposed = true;
        cancelAnimationFrame(raf);
        for (const dispose of disposables) {
          try { dispose(); } catch { /* noop */ }
        }
        resizeObserver?.disconnect();
        try {
          if (dye) {
            gl.deleteTexture(dye.read.texture); gl.deleteFramebuffer(dye.read.fbo);
            gl.deleteTexture(dye.write.texture); gl.deleteFramebuffer(dye.write.fbo);
          }
          if (velocity) {
            gl.deleteTexture(velocity.read.texture); gl.deleteFramebuffer(velocity.read.fbo);
            gl.deleteTexture(velocity.write.texture); gl.deleteFramebuffer(velocity.write.fbo);
          }
          if (divergence) { gl.deleteTexture(divergence.texture); gl.deleteFramebuffer(divergence.fbo); }
          if (curlFBO) { gl.deleteTexture(curlFBO.texture); gl.deleteFramebuffer(curlFBO.fbo); }
          if (pressure) {
            gl.deleteTexture(pressure.read.texture); gl.deleteFramebuffer(pressure.read.fbo);
            gl.deleteTexture(pressure.write.texture); gl.deleteFramebuffer(pressure.write.fbo);
          }
          for (const p of allPrograms) gl.deleteProgram(p.program);
          if (quadBuffer) gl.deleteBuffer(quadBuffer);
          if (quadElements) gl.deleteBuffer(quadElements);
          if (baseVertex) gl.deleteShader(vs);
        } catch { /* noop */ }
        // NOTE: intentionally no WEBGL_lose_context here. Losing the context
        // would poison this canvas element for a subsequent effect run on the
        // same node (e.g. StrictMode remounts or prop-driven re-init), leaving
        // the component permanently failed. Releasing GL resources above plus
        // canvas GC on unmount is sufficient.
      };
    } catch {
      try {
        if (baseVertex) {
          const { gl: glc } = ctx;
          glc.deleteShader(baseVertex);
        }
      } catch { /* noop */ }
      cancelAnimationFrame(raf);
      for (const dispose of disposables) {
        try { dispose(); } catch { /* noop */ }
      }
      setFailed(true);
      return;
    }
  }, [disabled, failed, containerRef]);

  if (failed) {
    return (
      <div
        ref={hostRef}
        aria-hidden="true"
        data-slot="fluid-cursor"
        className={cn("pointer-events-none fixed inset-0 overflow-hidden", className)}
        style={{ zIndex, backgroundColor: resolvedBackground, ...style }}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <WebGLErrorBoundary
      fallback={
        <div
          aria-hidden="true"
          data-slot="fluid-cursor"
          className={cn("pointer-events-none fixed inset-0 overflow-hidden", className)}
          style={{ zIndex, backgroundColor: resolvedBackground, ...style }}
        />
      }
    >
      <div
        ref={hostRef}
        aria-hidden="true"
        data-slot="fluid-cursor"
        className={cn(
          containerRef
            ? "pointer-events-none absolute inset-0 overflow-hidden"
            : "pointer-events-none fixed inset-0 overflow-hidden",
          className,
        )}
        style={{ zIndex, backgroundColor: resolvedBackground, ...style }}
        {...props}
      >
        <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 block h-full w-full" />
        {children ? <div className="pointer-events-none absolute inset-0">{children}</div> : null}
      </div>
    </WebGLErrorBoundary>
  );
}

export default FluidCursor;
