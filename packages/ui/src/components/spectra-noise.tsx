"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";
import { WebGLErrorBoundary } from "@workspace/ui/components/webgl-error-boundary";

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
uniform float uHueShift;
uniform float uNoise;
uniform float uScanDensity;
uniform float uScanIntensity;
uniform float uWarp;
uniform float uSeed;
uniform float uIntensity;
uniform vec3 uBackground;
uniform vec3 uGlow;
uniform vec3 uHighlight;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
}

// Grey-axis hue rotation: blacks and greys are fixed points, so the
// near-black background and luminance hierarchy survive any shift.
vec3 hueRotate(vec3 c, float a) {
  float cA = cos(a);
  float sA = sin(a);
  mat3 m = mat3(
    0.213 + cA * 0.787 - sA * 0.213, 0.715 - cA * 0.715 - sA * 0.715, 0.072 - cA * 0.072 + sA * 0.928,
    0.213 - cA * 0.213 + sA * 0.143, 0.715 + cA * 0.285 + sA * 0.140, 0.072 - cA * 0.072 - sA * 0.283,
    0.213 - cA * 0.213 - sA * 0.787, 0.715 - cA * 0.715 + sA * 0.715, 0.072 + cA * 0.928 + sA * 0.072
  );
  return c * m;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  // Keep the composition legible in both a narrow preview and a wide hero.
  vec2 p = (vUv - 0.5) * vec2(min(aspect, 1.8), 1.0);
  float t = uTime;
  float warp = clamp(uWarp, 0.0, 2.0);
  vec2 seedOff = vec2(uSeed * 0.173, uSeed * 0.217);
  vec2 drift = vec2(t * 0.055, -t * 0.035);
  float macro = snoise(p * 1.1 + seedOff + drift);
  float fold = snoise(p * 2.0 + vec2(3.8, 1.7) + seedOff - drift * 0.7);
  vec2 q = p;
  q += vec2(macro, fold) * warp * 0.12;

  // Two asymmetric translucent curtains with a thin illuminated lip.
  // A wide halo gives volume; the falloff behind each lip gives depth.
  float curve = q.y - q.x * 0.48 - 0.17
    - sin(q.x * 3.2 + t * 0.12) * 0.10 - macro * warp * 0.10;
  float second = q.y + q.x * 0.32 + 0.35
    + sin(q.x * 2.5 - t * 0.10) * 0.12 + fold * warp * 0.08;
  float veil = exp(-abs(curve) * 8.0);
  float lip = exp(-abs(curve + 0.014) * 55.0);
  float under = smoothstep(-0.18, 0.025, curve);
  float backVeil = exp(-abs(second) * 12.0);
  float backLip = exp(-abs(second - 0.016) * 70.0);
  float variation = 0.65 + 0.35 * snoise(q * 3.0 + seedOff + drift * 0.5);
  float mist = (snoise(q * 1.7 - drift * 0.4 + seedOff) * 0.5 + 0.5);

  vec3 light = uGlow * veil * (0.30 + under * 0.42);
  light += mix(uGlow, uHighlight, 0.72) * lip * variation * 0.50;
  light += uGlow * backVeil * 0.34;
  light += uHighlight * backLip * variation * 0.20;
  light += uGlow * pow(mist, 3.0) * 0.10;
  // Fine parallel folds are subordinate to the broad luminous silhouette.
  float pleat = sin(curve * 95.0 + fold * 3.0) * 0.5 + 0.5;
  light += uHighlight * pow(pleat, 5.0) * veil * under * 0.035;

  // In-shader hue control; black stays black by construction.
  light = hueRotate(light, uHueShift);

  vec3 col = uBackground + light * clamp(uIntensity, 0.0, 2.0);

  // Gentle cinematic vignette (internal constant, not a user control).
  float vig = (1.0 - smoothstep(0.35, 1.45, length(p)));
  col *= mix(0.82, 1.0, vig);

  // Fine animated grain, added after the macro field. Screen-space so its
  // scale does not swing with component size.
  float grain = hash(floor(gl_FragCoord.xy / 1.5) + fract(t) * 173.0) - 0.5;
  float luma = clamp(dot(col, vec3(0.3333)), 0.0, 1.0);
  col += grain * 0.19 * clamp(uNoise, 0.0, 1.0) * (0.40 + 0.60 * luma);

  // Subtle horizontal scanlines, horizontally stable while the field moves.
  float scanPhase = gl_FragCoord.y * clamp(uScanDensity, 0.2, 3.0) * 2.1 + t * 0.8;
  float scan = 0.5 + 0.5 * sin(scanPhase);
  col *= 1.0 - clamp(uScanIntensity, 0.0, 1.0) * (0.10 + 0.12 * scan);

  // Tiny dither against banding in the dark gradients.
  col += (hash(gl_FragCoord.xy * 0.71 + 17.0) - 0.5) * 0.004;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

const HEX_COLOR = /^#?[0-9a-fA-F]{6}$/;
const DEFAULT_BACKGROUND = "#03090b";
const DEFAULT_GLOW = "#127c74";
const DEFAULT_HIGHLIGHT = "#c5f58a";

function normalizeHex(value: string, fallback: string): string {
  const color = value.trim();
  if (!HEX_COLOR.test(color)) return fallback;
  return color.startsWith("#") ? color : `#${color}`;
}

function hexToRgb(value: string, fallback: string): [number, number, number] {
  const hex = normalizeHex(value, fallback).slice(1);
  return [
    Number.parseInt(hex.slice(0, 2), 16) / 255,
    Number.parseInt(hex.slice(2, 4), 16) / 255,
    Number.parseInt(hex.slice(4, 6), 16) / 255,
  ];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export interface SpectraNoiseProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  /** Base hue rotation in degrees. 0 preserves the selected colors. */
  hueShift?: number;
  /** Fine cinematic grain strength. 0 disables it. */
  noiseIntensity?: number;
  /** Horizontal scanline frequency. */
  scanlineDensity?: number;
  /** Horizontal scanline modulation strength. */
  scanlineIntensity?: number;
  /** Strength of domain distortion. 0 is almost smooth, 2 is surreal. */
  warpAmount?: number;
  /** Rate of internal time evolution. Set to 0 to freeze the field. */
  animationSpeed?: number;
  /** Canvas backing-store multiplier. Lower values trade quality for speed. */
  resolutionScale?: number;
  /** Freeze the animation loop and hold the current frame. */
  paused?: boolean;
  /** Noise field seed. Changing it recomposes the layout. */
  seed?: number;
  /** Near-black base color behind the luminous field. */
  backgroundColor?: string;
  /** Main color of the luminous field (six-digit hex). */
  glowColor?: string;
  /** Color of the brightest areas (six-digit hex). */
  highlightColor?: string;
  /** Overall strength of the luminous masses. */
  effectIntensity?: number;
  /** Maximum device pixel ratio used by the canvas backing buffer. */
  maxDpr?: number;
}

export function SpectraNoise({
  hueShift = 0,
  noiseIntensity = 0.35,
  scanlineDensity = 1.5,
  scanlineIntensity = 0.25,
  warpAmount = 1,
  animationSpeed = 0.35,
  resolutionScale = 1,
  paused = false,
  seed = 7,
  backgroundColor = DEFAULT_BACKGROUND,
  glowColor = DEFAULT_GLOW,
  highlightColor = DEFAULT_HIGHLIGHT,
  effectIntensity = 1,
  maxDpr = 2,
  className,
  style,
  ...props
}: SpectraNoiseProps) {
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const controlsRef = React.useRef<{
    draw: () => void;
    kick: () => void;
    resize: () => void;
  } | null>(null);
  const [webglFailed, setWebglFailed] = React.useState(false);

  const settings = React.useMemo(
    () => ({
      hueShift,
      noiseIntensity,
      scanlineDensity,
      scanlineIntensity,
      warpAmount,
      animationSpeed,
      resolutionScale,
      paused,
      seed,
      backgroundColor,
      glowColor,
      highlightColor,
      effectIntensity,
      maxDpr,
    }),
    [
      hueShift,
      noiseIntensity,
      scanlineDensity,
      scanlineIntensity,
      warpAmount,
      animationSpeed,
      resolutionScale,
      paused,
      seed,
      backgroundColor,
      glowColor,
      highlightColor,
      effectIntensity,
      maxDpr,
    ],
  );
  const settingsRef = React.useRef(settings);
  settingsRef.current = settings;

  React.useEffect(() => {
    controlsRef.current?.resize();
    controlsRef.current?.draw();
    controlsRef.current?.kick();
  }, [settings]);

  React.useEffect(() => {
    if (webglFailed) return;

    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
    });
    if (!gl) {
      setWebglFailed(true);
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
      setWebglFailed(true);
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      setWebglFailed(true);
      return;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      setWebglFailed(true);
      return;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    if (!buffer) {
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      setWebglFailed(true);
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
    const uHueShift = uniform("uHueShift");
    const uNoise = uniform("uNoise");
    const uScanDensity = uniform("uScanDensity");
    const uScanIntensity = uniform("uScanIntensity");
    const uWarp = uniform("uWarp");
    const uSeed = uniform("uSeed");
    const uIntensity = uniform("uIntensity");
    const uBackground = uniform("uBackground");
    const uGlow = uniform("uGlow");
    const uHighlight = uniform("uHighlight");

    let disposed = false;
    let frameId = 0;
    let running = false;
    let visible = true;
    let pageVisible = document.visibilityState !== "hidden";
    let reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let simulationTime = 9.4;
    let lastFrame = performance.now();

    const effectiveSpeed = () => {
      const current = settingsRef.current;
      if (current.paused) return 0;
      return Math.max(0, current.animationSpeed);
    };

    const draw = () => {
      if (disposed) return;
      const current = settingsRef.current;
      const background = hexToRgb(current.backgroundColor, DEFAULT_BACKGROUND);

      gl.useProgram(program);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, simulationTime);
      gl.uniform1f(
        uHueShift,
        ((Number.isFinite(current.hueShift) ? current.hueShift : 0) * Math.PI) /
          180,
      );
      gl.uniform1f(uNoise, clamp(current.noiseIntensity, 0, 1));
      gl.uniform1f(uScanDensity, clamp(current.scanlineDensity, 0.2, 3));
      gl.uniform1f(uScanIntensity, clamp(current.scanlineIntensity, 0, 1));
      gl.uniform1f(uWarp, clamp(current.warpAmount, 0, 2));
      gl.uniform1f(uSeed, Number.isFinite(current.seed) ? current.seed : 0);
      gl.uniform1f(uIntensity, clamp(current.effectIntensity, 0, 2));
      gl.uniform3f(uBackground, background[0], background[1], background[2]);
      gl.uniform3fv(uGlow, hexToRgb(current.glowColor, DEFAULT_GLOW));
      gl.uniform3fv(
        uHighlight,
        hexToRgb(current.highlightColor, DEFAULT_HIGHLIGHT),
      );
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const renderFrame = (now: number) => {
      if (disposed) return;
      const delta = Math.min(0.05, Math.max(0, (now - lastFrame) / 1000));
      lastFrame = now;
      simulationTime += delta * effectiveSpeed();
      draw();

      if (visible && pageVisible && !reducedMotion && effectiveSpeed() > 0) {
        frameId = requestAnimationFrame(renderFrame);
      } else {
        running = false;
        frameId = 0;
      }
    };

    const kick = () => {
      if (
        disposed ||
        running ||
        !visible ||
        !pageVisible ||
        reducedMotion ||
        effectiveSpeed() <= 0
      ) {
        return;
      }
      running = true;
      lastFrame = performance.now();
      frameId = requestAnimationFrame(renderFrame);
    };

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const cappedDpr = Math.min(
        window.devicePixelRatio || 1,
        Math.max(0.5, settingsRef.current.maxDpr),
      );
      const scale = clamp(settingsRef.current.resolutionScale, 0.5, 1.5);
      const effectiveDpr = Math.min(cappedDpr * scale, 2);
      const width = Math.max(1, Math.round(rect.width * effectiveDpr));
      const height = Math.max(1, Math.round(rect.height * effectiveDpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
      draw();
    };

    controlsRef.current = { draw, kick, resize };
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      if (visible) kick();
      else if (frameId) {
        cancelAnimationFrame(frameId);
        frameId = 0;
        running = false;
      }
    });
    intersectionObserver.observe(host);

    const handleVisibility = () => {
      pageVisible = document.visibilityState !== "hidden";
      if (pageVisible) kick();
      else if (frameId) {
        cancelAnimationFrame(frameId);
        frameId = 0;
        running = false;
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotion = () => {
      reducedMotion = motionQuery.matches;
      if (reducedMotion) {
        if (frameId) cancelAnimationFrame(frameId);
        frameId = 0;
        running = false;
        draw();
      } else {
        kick();
      }
    };
    motionQuery.addEventListener("change", handleMotion);

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      if (frameId) cancelAnimationFrame(frameId);
      frameId = 0;
      running = false;
      setWebglFailed(true);
    };
    canvas.addEventListener("webglcontextlost", handleContextLost);

    draw();
    kick();

    return () => {
      disposed = true;
      controlsRef.current = null;
      if (frameId) cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      motionQuery.removeEventListener("change", handleMotion);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, [webglFailed]);

  const fallback = (
    <div
      aria-hidden="true"
      data-slot="spectra-noise"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      style={{
        backgroundColor: normalizeHex(backgroundColor, DEFAULT_BACKGROUND),
        backgroundImage: `radial-gradient(ellipse at 28% 72%, ${normalizeHex(highlightColor, DEFAULT_HIGHLIGHT)}55 0%, transparent 45%), radial-gradient(ellipse at 70% 30%, ${normalizeHex(glowColor, DEFAULT_GLOW)}66 0%, transparent 50%)`,
        ...style,
      }}
      {...props}
    />
  );

  if (webglFailed) return fallback;

  return (
    <WebGLErrorBoundary fallback={fallback}>
      <div
        ref={hostRef}
        aria-hidden="true"
        data-slot="spectra-noise"
        className={cn(
          "pointer-events-none absolute inset-0 overflow-hidden",
          className,
        )}
        style={{
          backgroundColor: normalizeHex(backgroundColor, DEFAULT_BACKGROUND),
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

export default SpectraNoise;
