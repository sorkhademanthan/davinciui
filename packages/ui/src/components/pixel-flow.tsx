"use client";

import * as React from "react";
import { WebGLErrorBoundary } from "@workspace/ui/components/webgl-error-boundary";
import { cn } from "@workspace/ui/lib/utils";

const VERTEX_SHADER = `
attribute vec2 position;
varying vec2 vUv;

void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

varying vec2 vUv;

uniform vec2 uResolution;
uniform float uTime;
uniform float uNoiseScale;
uniform int uOctaves;
uniform float uFlowStrength;
uniform float uWarpStrength;
uniform float uContrast;
uniform float uSoftness;
uniform float uPixelSize;
uniform float uPixelDensity;
uniform float uDotSize;
uniform float uDotStrength;
uniform float uDitherStrength;
uniform float uBrightness;
uniform float uSaturation;
uniform vec3 uBackground;
uniform vec3 uShadow;
uniform vec3 uPrimary;
uniform vec3 uElectric;
uniform vec3 uSecondary;
uniform vec3 uHighlight;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);

  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  float total = 0.0;
  mat2 rotation = mat2(0.80, 0.60, -0.60, 0.80);

  for (int i = 0; i < 6; i++) {
    if (i >= octaves) break;
    value += amplitude * valueNoise(p);
    total += amplitude;
    p = rotation * p * 2.03 + vec2(17.3, 9.1);
    amplitude *= 0.5;
  }

  return total > 0.0 ? value / total : 0.0;
}

vec3 applyPalette(float v, float softness) {
  float edge = 0.025 + softness * 0.12;
  vec3 color = uBackground;
  color = mix(color, uShadow, smoothstep(0.20 - edge, 0.20 + edge, v));
  color = mix(color, uPrimary, smoothstep(0.35 - edge, 0.35 + edge, v));
  color = mix(color, uElectric, smoothstep(0.48 - edge, 0.48 + edge, v));
  color = mix(color, uSecondary, smoothstep(0.60 - edge, 0.60 + edge, v));
  color = mix(color, uHighlight, smoothstep(0.77 - edge, 0.77 + edge, v));
  return color;
}

vec3 adjustSaturation(vec3 color, float amount) {
  float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
  return mix(vec3(luminance), color, amount);
}

// Ordered coverage creates light pixels that disappear into the shadows,
// rather than a dark square stamped over every tile.
float bayer2(vec2 cell) {
  vec2 bit = mod(cell, 2.0);
  return 2.0 * bit.x + 3.0 * bit.y - 4.0 * bit.x * bit.y;
}

float bayer4(vec2 cell) {
  return (4.0 * bayer2(cell) + bayer2(floor(cell / 2.0)) + 0.5) / 16.0;
}

void main() {
  vec2 res = max(uResolution, vec2(1.0));
  float aspect = res.x / res.y;

  // Keep the lattice in CSS pixels, independent of canvas quality and DPR.
  float cellPixels = max(uPixelSize, 1.0) / max(uPixelDensity, 0.05);
  vec2 grid = vUv * res / cellPixels;
  vec2 cell = floor(grid);
  vec2 gridUv = (cell + 0.5) * cellPixels / res;
  vec2 cellFract = fract(grid);

  // Aspect-correct sample space, evaluated at the cell origin so every
  // virtual pixel renders one flat field value (no stretching).
  vec2 p = (gridUv - 0.5) * vec2(aspect, 1.0);
  vec2 base = p * max(uNoiseScale, 0.001);
  float t = uTime * 2.0;
  float flow = max(uFlowStrength, 0.0);
  float warp = max(uWarpStrength, 0.0);

  // Slow, broad fields bend the light into soft flowing masses. Keeping the
  // warp low-frequency avoids the sharp flame-like ribbons of turbulent noise.
  float warpEvolve = 0.88 + 0.12 * sin(t * 0.035 + 1.7);

  vec2 q = vec2(
    fbm(base * 0.42 + vec2(t * 0.035 * flow, -t * 0.027 * flow), uOctaves),
    fbm(base * 0.44 + vec2(5.2, 1.3) + vec2(-t * 0.025 * flow, t * 0.031 * flow), uOctaves)
  );

  vec2 r = vec2(
    fbm(base * 0.72 + (q - 0.5) * 2.2 * warp * warpEvolve + vec2(1.7, 9.2) + vec2(t * 0.023 * flow, -t * 0.019 * flow), uOctaves),
    fbm(base * 0.74 + (q - 0.5) * 2.0 * warp * warpEvolve + vec2(8.3, 2.8) + vec2(-t * 0.017 * flow, t * 0.021 * flow), uOctaves)
  );

  // The dominant field sets the slow, cloud-like light and shadow masses.
  float macro = fbm(
    base * 0.82 + (r - 0.5) * 2.0 * warp * warpEvolve + (q - 0.5) * 0.75 + vec2(t * 0.018 * flow, -t * 0.014 * flow),
    uOctaves
  );

  // Add only a little mid-frequency structure to keep the pixel field alive
  // without turning its broad forms into high-contrast streaks.
  float detail = fbm(
    base * 1.35 + (r - 0.5) * 0.8 + vec2(-t * 0.021 * flow, t * 0.017 * flow),
    uOctaves < 4 ? uOctaves : 4
  );
  float field = macro * 0.88 + (detail - 0.5) * 0.12;

  float v = clamp((field - 0.5) * max(uContrast, 0.01) + 0.5, 0.0, 1.0);

  vec3 color = applyPalette(v, clamp(uSoftness, 0.0, 1.0));

  float coverage = smoothstep(0.20, 0.80, v) * 0.92;
  float threshold = bayer4(cell);
  float feather = mix(0.025, 0.12, clamp(uSoftness, 0.0, 1.0));
  float lit = smoothstep(threshold - feather, threshold + feather, coverage);
  vec3 dark = mix(uBackground, uShadow, smoothstep(0.25, 0.8, v) * 0.55);
  vec3 light = mix(uPrimary, uSecondary, smoothstep(0.18, 0.5, v));
  light = mix(light, uHighlight, smoothstep(0.45, 0.75, v));
  float glow = exp(-dot(p * vec2(0.8, 1.2), p * vec2(0.8, 1.2)) * 3.0);
  light = mix(light, uElectric, glow * 0.38);
  vec3 dithered = mix(dark, light, lit);
  dithered += uElectric * glow * (1.0 - coverage) * 0.35;
  color = mix(color, dithered, clamp(uDitherStrength, 0.0, 1.0));

  // A crisp square mark in each cell gives the field its regular halftone grid.
  vec2 dotOffset = abs(cellFract - 0.5);
  float dotDist = max(dotOffset.x, dotOffset.y);
  float dotRadius = clamp(uDotSize, 0.0, 0.7);
  float dot = (1.0 - smoothstep(dotRadius * 0.45, dotRadius, dotDist)) * clamp(uDotStrength, 0.0, 1.0);
  color = mix(color, uBackground * 0.7, dot * 0.92);

  color *= max(uBrightness, 0.0);
  color = adjustSaturation(color, max(uSaturation, 0.0));

  gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`;

export type PixelFlowPresetName =
  | "reference-purple"
  | "monochrome"
  | "electric-blue"
  | "aurora"
  | "warm";

export interface PixelFlowPalette {
  backgroundColor: string;
  shadowColor: string;
  primaryColor: string;
  electricColor: string;
  secondaryColor: string;
  highlightColor: string;
}

export const PIXEL_FLOW_PRESETS: Record<
  PixelFlowPresetName,
  PixelFlowPalette & { noiseScale: number }
> = {
  "reference-purple": {
    backgroundColor: "#0d0820",
    shadowColor: "#1a1038",
    primaryColor: "#33266b",
    electricColor: "#6345b8",
    secondaryColor: "#796bac",
    highlightColor: "#9789c6",
    noiseScale: 1.7,
  },
  monochrome: {
    backgroundColor: "#050505",
    shadowColor: "#1a1a1a",
    primaryColor: "#4d4d4d",
    electricColor: "#808080",
    secondaryColor: "#a3a3a3",
    highlightColor: "#f5f5f5",
    noiseScale: 2.1,
  },
  "electric-blue": {
    backgroundColor: "#020617",
    shadowColor: "#0a1a3f",
    primaryColor: "#1d4ed8",
    electricColor: "#3b82f6",
    secondaryColor: "#60a5fa",
    highlightColor: "#dbeafe",
    noiseScale: 2.1,
  },
  aurora: {
    backgroundColor: "#030b12",
    shadowColor: "#0b2545",
    primaryColor: "#5b2ee5",
    electricColor: "#22d3ee",
    secondaryColor: "#38bdf8",
    highlightColor: "#cffafe",
    noiseScale: 2.4,
  },
  warm: {
    backgroundColor: "#0c0505",
    shadowColor: "#2b1007",
    primaryColor: "#c2410c",
    electricColor: "#f97316",
    secondaryColor: "#e7a35c",
    highlightColor: "#fef3c7",
    noiseScale: 2.1,
  },
};

export interface PixelFlowProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Color preset. Explicit color props override the preset. */
  preset?: PixelFlowPresetName;
  /** Virtual pixel size in screen pixels. Smaller values densify the grid. */
  pixelSize?: number;
  /** Grid density multiplier. Higher values pack more cells. */
  pixelDensity?: number;
  /** Square dot half-size within a cell (0–0.7 cell units). */
  dotSize?: number;
  /** Strength of the dark dot matrix overlay. */
  dotStrength?: number;
  /** Ordered pixel coverage. Set to 0 for a continuous color field. */
  ditherStrength?: number;
  /** Global animation rate. */
  speed?: number;
  /** Advection strength of the time flow. */
  flowStrength?: number;
  /** Domain-warp amplitude of the field. */
  warpStrength?: number;
  /** Base sampling frequency of the noise field. */
  noiseScale?: number;
  /** FBM octave count (1–6). */
  octaves?: number;
  /** Field contrast around mid-gray. */
  contrast?: number;
  /** Softness of palette transitions. */
  softness?: number;
  backgroundColor?: string;
  shadowColor?: string;
  primaryColor?: string;
  electricColor?: string;
  secondaryColor?: string;
  highlightColor?: string;
  /** Post brightness multiplier. */
  brightness?: number;
  /** Post saturation multiplier. */
  saturation?: number;
  /** Backing-store resolution multiplier (0.25–1). Lower values are faster. */
  quality?: number;
  /** Set to false to freeze the current composition. */
  animate?: boolean;
  /** Pause rendering while outside the viewport. */
  pauseWhenOffscreen?: boolean;
  /** Render one static frame when the user prefers reduced motion. */
  respectReducedMotion?: boolean;
  /** Maximum device pixel ratio for the backing buffer. */
  maxDpr?: number;
}

function parseColor(color: string): [number, number, number] {
  const hex = color.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{6}$/.test(hex)) {
    return [
      parseInt(hex.slice(0, 2), 16) / 255,
      parseInt(hex.slice(2, 4), 16) / 255,
      parseInt(hex.slice(4, 6), 16) / 255,
    ];
  }
  const short = /^([0-9a-fA-F]{3})$/.exec(hex);
  if (short?.[1]) {
    const s = short[1];
    return [
      parseInt(s[0]! + s[0], 16) / 255,
      parseInt(s[1]! + s[1], 16) / 255,
      parseInt(s[2]! + s[2], 16) / 255,
    ];
  }
  const rgb = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i.exec(color);
  if (rgb) {
    return [Number(rgb[1]) / 255, Number(rgb[2]) / 255, Number(rgb[3]) / 255];
  }
  return [1, 1, 1];
}

export function PixelFlow({
  preset = "reference-purple",
  pixelSize = 4,
  pixelDensity = 1,
  dotSize = 0.2,
  dotStrength = 0.12,
  ditherStrength = 1,
  speed = 0.75,
  flowStrength = 1,
  warpStrength = 1,
  noiseScale: noiseScaleProp,
  octaves = 4,
  contrast = 1.25,
  softness = 0.65,
  backgroundColor: backgroundColorProp,
  shadowColor: shadowColorProp,
  primaryColor: primaryColorProp,
  electricColor: electricColorProp,
  secondaryColor: secondaryColorProp,
  highlightColor: highlightColorProp,
  brightness = 1,
  saturation = 0.92,
  quality = 1,
  animate = true,
  pauseWhenOffscreen = true,
  respectReducedMotion = true,
  maxDpr = 2,
  className,
  style,
  ...props
}: PixelFlowProps) {
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const resizeRef = React.useRef<(() => void) | null>(null);
  const refreshRef = React.useRef<(() => void) | null>(null);
  const [contextVersion, restoreContext] = React.useReducer((value: number) => value + 1, 0);

  const presetPalette = PIXEL_FLOW_PRESETS[preset] ?? PIXEL_FLOW_PRESETS["reference-purple"];

  const settings = React.useMemo(
    () => ({
      pixelSize: Math.max(1, pixelSize),
      pixelDensity: Math.min(4, Math.max(0.1, pixelDensity)),
      dotSize: Math.min(0.7, Math.max(0, dotSize)),
      dotStrength: Math.min(1, Math.max(0, dotStrength)),
      ditherStrength: Math.min(1, Math.max(0, ditherStrength)),
      speed: Math.max(0, speed),
      flowStrength: Math.max(0, flowStrength),
      warpStrength: Math.max(0, warpStrength),
      noiseScale: Math.max(0.2, noiseScaleProp ?? presetPalette.noiseScale),
      octaves: Math.min(6, Math.max(1, Math.round(octaves))),
      contrast: Math.max(0.01, contrast),
      softness: Math.min(1, Math.max(0, softness)),
      background: parseColor(backgroundColorProp ?? presetPalette.backgroundColor),
      shadow: parseColor(shadowColorProp ?? presetPalette.shadowColor),
      primary: parseColor(primaryColorProp ?? presetPalette.primaryColor),
      electric: parseColor(electricColorProp ?? presetPalette.electricColor),
      secondary: parseColor(secondaryColorProp ?? presetPalette.secondaryColor),
      highlight: parseColor(highlightColorProp ?? presetPalette.highlightColor),
      brightness: Math.max(0, brightness),
      saturation: Math.max(0, saturation),
      quality: Math.min(1, Math.max(0.25, quality)),
      animate,
    }),
    [
      pixelSize,
      pixelDensity,
      dotSize,
      dotStrength,
      ditherStrength,
      speed,
      flowStrength,
      warpStrength,
      noiseScaleProp,
      presetPalette,
      octaves,
      contrast,
      softness,
      backgroundColorProp,
      shadowColorProp,
      primaryColorProp,
      electricColorProp,
      secondaryColorProp,
      highlightColorProp,
      brightness,
      saturation,
      quality,
      animate,
    ],
  );
  const settingsRef = React.useRef(settings);
  settingsRef.current = settings;
  const behaviorRef = React.useRef({
    pauseWhenOffscreen,
    respectReducedMotion,
    maxDpr,
  });
  behaviorRef.current = { pauseWhenOffscreen, respectReducedMotion, maxDpr };

  React.useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const colorToHex = (color: [number, number, number]) =>
      `#${color.map((channel) => Math.round(channel * 255).toString(16).padStart(2, "0")).join("")}`;
    const showCssFallback = () => {
      const s = settingsRef.current;
      host.dataset.webglUnavailable = "true";
      host.style.backgroundColor = colorToHex(s.background);
      host.style.backgroundImage = `radial-gradient(ellipse at 52% 45%, ${colorToHex(s.highlight)} 0%, ${colorToHex(s.secondary)} 20%, ${colorToHex(s.primary)} 42%, transparent 74%), radial-gradient(ellipse at 12% 82%, ${colorToHex(s.shadow)} 0%, transparent 58%), radial-gradient(circle at center, rgba(0,0,0,.55) 0 1px, transparent 1.25px)`;
      host.style.backgroundSize = `auto, auto, ${Math.max(2, s.pixelSize)}px ${Math.max(2, s.pixelSize)}px`;
      host.style.backgroundRepeat = "no-repeat, no-repeat, repeat";
    };

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
    });

    if (!gl) {
      showCssFallback();
      return;
    }

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragmentShader = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) {
      if (vertexShader) gl.deleteShader(vertexShader);
      if (fragmentShader) gl.deleteShader(fragmentShader);
      showCssFallback();
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      showCssFallback();
      return;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      showCssFallback();
      return;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    if (!buffer) {
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      showCssFallback();
      return;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uniform = (name: string) => gl.getUniformLocation(program, name);
    const uResolution = uniform("uResolution");
    const uTime = uniform("uTime");
    const uNoiseScale = uniform("uNoiseScale");
    const uOctaves = uniform("uOctaves");
    const uFlowStrength = uniform("uFlowStrength");
    const uWarpStrength = uniform("uWarpStrength");
    const uContrast = uniform("uContrast");
    const uSoftness = uniform("uSoftness");
    const uPixelSize = uniform("uPixelSize");
    const uPixelDensity = uniform("uPixelDensity");
    const uDotSize = uniform("uDotSize");
    const uDotStrength = uniform("uDotStrength");
    const uDitherStrength = uniform("uDitherStrength");
    const uBrightness = uniform("uBrightness");
    const uSaturation = uniform("uSaturation");
    const uBackground = uniform("uBackground");
    const uShadow = uniform("uShadow");
    const uPrimary = uniform("uPrimary");
    const uElectric = uniform("uElectric");
    const uSecondary = uniform("uSecondary");
    const uHighlight = uniform("uHighlight");

    delete host.dataset.webglUnavailable;
    host.style.backgroundImage = "";
    canvas.style.opacity = "1";

    let disposed = false;
    let contextLost = false;
    let frameId = 0;
    let running = false;
    let intersecting = true;
    const isVisible = () =>
      intersecting || !behaviorRef.current.pauseWhenOffscreen;
    let backingScale = 1;
    let pageVisible = document.visibilityState !== "hidden";
    const motionQuery =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;
    let reducedMotion = motionQuery?.matches ?? false;
    let simulationTime = 3.7;
    let lastFrame = performance.now();

    const draw = () => {
      if (disposed || contextLost) return;
      const s = settingsRef.current;
      gl.useProgram(program);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, simulationTime);
      gl.uniform1f(uNoiseScale, s.noiseScale);
      gl.uniform1i(uOctaves, s.octaves);
      gl.uniform1f(uFlowStrength, s.flowStrength);
      gl.uniform1f(uWarpStrength, s.warpStrength);
      gl.uniform1f(uContrast, s.contrast);
      gl.uniform1f(uSoftness, s.softness);
      gl.uniform1f(uPixelSize, s.pixelSize * backingScale);
      gl.uniform1f(uPixelDensity, s.pixelDensity);
      gl.uniform1f(uDotSize, s.dotSize);
      gl.uniform1f(uDotStrength, s.dotStrength);
      gl.uniform1f(uDitherStrength, s.ditherStrength);
      gl.uniform1f(uBrightness, s.brightness);
      gl.uniform1f(uSaturation, s.saturation);
      gl.uniform3f(uBackground, s.background[0], s.background[1], s.background[2]);
      gl.uniform3f(uShadow, s.shadow[0], s.shadow[1], s.shadow[2]);
      gl.uniform3f(uPrimary, s.primary[0], s.primary[1], s.primary[2]);
      gl.uniform3f(uElectric, s.electric[0], s.electric[1], s.electric[2]);
      gl.uniform3f(uSecondary, s.secondary[0], s.secondary[1], s.secondary[2]);
      gl.uniform3f(uHighlight, s.highlight[0], s.highlight[1], s.highlight[2]);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const shouldAnimate = () =>
      !contextLost &&
      settingsRef.current.animate &&
      settingsRef.current.speed > 0 &&
      !(reducedMotion && behaviorRef.current.respectReducedMotion);

    const renderFrame = (now: number) => {
      if (disposed) return;
      const delta = Math.min(0.25, Math.max(0, (now - lastFrame) / 1000));
      lastFrame = now;
      simulationTime += delta * settingsRef.current.speed;
      draw();

      if (isVisible() && pageVisible && shouldAnimate()) {
        frameId = requestAnimationFrame(renderFrame);
      } else {
        running = false;
        frameId = 0;
      }
    };

    const kick = () => {
      if (disposed || running || !isVisible() || !pageVisible || !shouldAnimate()) {
        return;
      }
      running = true;
      lastFrame = performance.now();
      frameId = requestAnimationFrame(renderFrame);
    };

    const stop = () => {
      running = false;
      if (frameId) cancelAnimationFrame(frameId);
      frameId = 0;
    };

    const refresh = () => {
      if (disposed) return;
      if (!shouldAnimate() || !isVisible() || !pageVisible) {
        stop();
        draw();
        return;
      }
      draw();
      kick();
    };
    refreshRef.current = refresh;

    const resize = () => {
      if (disposed) return;
      const rect = host.getBoundingClientRect();
      const dpr = Math.min(
        window.devicePixelRatio || 1,
        Math.max(0.5, behaviorRef.current.maxDpr),
      );
      const scale = settingsRef.current.quality;
      backingScale = dpr * scale;
      const width = Math.max(1, Math.round(rect.width * dpr * scale));
      const height = Math.max(1, Math.round(rect.height * dpr * scale));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
      refresh();
    };

    let resizeTimer = 0;
    const resizeObserver = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 120);
    });
    resizeObserver.observe(host);
    resizeRef.current = resize;

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      intersecting = entry?.isIntersecting ?? true;
      if (isVisible()) {
        refresh();
      } else if (behaviorRef.current.pauseWhenOffscreen) {
        stop();
      }
    });
    intersectionObserver.observe(host);

    const handleVisibility = () => {
      pageVisible = document.visibilityState !== "hidden";
      if (pageVisible) refresh();
      else stop();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const handleMotion = () => {
      reducedMotion = motionQuery?.matches ?? false;
      refresh();
    };
    motionQuery?.addEventListener?.("change", handleMotion);

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      contextLost = true;
      stop();
      showCssFallback();
      canvas.style.opacity = "0";
    };
    const handleContextRestored = () => restoreContext();
    canvas.addEventListener("webglcontextlost", handleContextLost);
    canvas.addEventListener("webglcontextrestored", handleContextRestored);

    resize();

    return () => {
      disposed = true;
      window.clearTimeout(resizeTimer);
      if (frameId) cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      motionQuery?.removeEventListener?.("change", handleMotion);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      canvas.removeEventListener("webglcontextrestored", handleContextRestored);
      resizeRef.current = null;
      refreshRef.current = null;
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, [contextVersion]);

  React.useEffect(() => {
    resizeRef.current?.();
  }, [maxDpr, quality]);

  React.useEffect(() => {
    refreshRef.current?.();
  }, [settings, pauseWhenOffscreen, respectReducedMotion]);

  const fallback = (
    <div
      aria-hidden="true"
      data-slot="pixel-flow"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      style={{
        backgroundColor: presetPalette.backgroundColor,
        backgroundImage: `radial-gradient(ellipse at 52% 48%, ${presetPalette.highlightColor} 0%, ${presetPalette.secondaryColor} 20%, ${presetPalette.primaryColor} 42%, transparent 76%), radial-gradient(ellipse at 18% 82%, ${presetPalette.shadowColor} 0%, transparent 58%), radial-gradient(circle at center, rgba(0,0,0,.55) 0 1px, transparent 1.25px)`,
        backgroundSize: `auto, auto, ${Math.max(2, pixelSize)}px ${Math.max(2, pixelSize)}px`,
        backgroundRepeat: "no-repeat, no-repeat, repeat",
        ...style,
      }}
      {...props}
    />
  );

  return (
    <WebGLErrorBoundary fallback={fallback}>
      <div
        ref={hostRef}
        aria-hidden="true"
        data-slot="pixel-flow"
        className={cn(
          "pointer-events-none absolute inset-0 overflow-hidden",
          className,
        )}
        style={{
          backgroundColor: presetPalette.backgroundColor,
          ...style,
        }}
        {...props}
      >
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 block h-full w-full"
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </WebGLErrorBoundary>
  );
}

export default PixelFlow;
