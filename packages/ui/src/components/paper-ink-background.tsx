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
uniform float uScale;
uniform float uSaturation;
uniform float uContrast;
uniform vec3 uPaperColor;
uniform vec3 uSoftInkColor;
uniform vec3 uDeepInkColor;
uniform vec3 uAccentColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.52;
  mat2 rotation = mat2(0.82, 0.57, -0.57, 0.82);

  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p = rotation * p * 2.02 + vec2(13.1, 7.7);
    amplitude *= 0.49;
  }

  return value;
}

vec3 adjustSaturation(vec3 color, float amount) {
  float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
  return mix(vec3(luminance), color, amount);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float horizontalBoost = max(1.0, 1.0 / max(aspect, 0.6));
  float portraitScale = max(1.0, 0.9 / max(aspect, 0.6));
  vec2 p = (vUv - 0.5) * vec2(aspect * horizontalBoost, 1.0);
  vec2 base = p * max(uScale, 0.001) * 1.15 * portraitScale;
  float t = uTime;

  // Rotate before stretching so the dominant direction is diagonal, then let
  // independent low-frequency fields continuously curl that direction. This
  // keeps the long paper-ink pull without locking the result into vertical
  // curtains.
  vec2 paper = mat2(0.84, -0.54, 0.54, 0.84) * base;
  paper *= vec2(0.72, 1.28);

  vec2 q = vec2(
    fbm(paper * 0.56 + vec2(t * 0.075, -t * 0.043)),
    fbm(paper * 0.58 + vec2(5.2, 1.3) + vec2(-t * 0.051, t * 0.066))
  );

  vec2 r = vec2(
    fbm(paper * 0.92 + 2.8 * (q - 0.5) + vec2(1.7, 9.2) + vec2(t * 0.046, -t * 0.071)),
    fbm(paper * 0.96 + 2.6 * (q - 0.5) + vec2(8.3, 2.8) + vec2(-t * 0.063, t * 0.039))
  );

  vec2 flow = paper + vec2(
    (q.x - 0.5) * 0.5 + (q.y - 0.5) * 0.46 + (r.x - 0.5) * 0.34,
    (q.y - 0.5) * 1.15 - (q.x - 0.5) * 0.58 + (r.y - 0.5) * 0.74
  );

  // MACRO: broad pigment placement comes from a warped scalar field. The
  // secondary field displaces its contour spacing rather than merely adding
  // more octaves, preserving large cream pockets and coherent blue masses.
  float primary = fbm(
    flow * 0.82 + vec2(11.4, -3.7) + vec2(t * 0.012, -t * 0.016)
  );
  float secondary = fbm(
    flow * 1.38
      + 2.35 * (r - 0.5)
      + vec2(7.1, -4.8)
      + vec2(-t * 0.054, t * 0.032)
  );

  float macroField = primary
    + (q.x - 0.5) * 0.14
    + sin(flow.x * 1.2 + r.y * 2.5 - t * 0.021) * 0.045;

  // MESO: repeated bands follow warped iso-contours of the macro field. This
  // makes folds wrap around, merge, and peel away from cream pockets like
  // dragged wet pigment instead of forming globally parallel sine stripes.
  float foldPhase = macroField * 50.0
    + (secondary - 0.5) * 17.5
    + (r.x - 0.5) * 5.1
    + flow.x * 4.2
    - flow.y * 1.8
    + sin(flow.y * 1.8 + q.y * 3.2 + t * 0.028) * 1.25;
  float foldWave = 0.5 + 0.5 * sin(foldPhase);
  float foldRidge = smoothstep(0.3, 0.79, foldWave);
  float foldCore = smoothstep(0.7, 0.96, foldWave);
  float foldChannel = smoothstep(0.58, 0.94, 1.0 - foldWave);

  float pigmentField = macroField
    + (foldWave - 0.5) * 0.22
    + (secondary - 0.5) * 0.06;
  float paleMask = smoothstep(0.14, 0.38, pigmentField);
  float mediumMask = smoothstep(0.3, 0.54, pigmentField);
  float bodyMask = smoothstep(0.46, 0.67, pigmentField);
  float boundaryFeather = 1.0 - smoothstep(
    0.035,
    0.17,
    abs(pigmentField - 0.42)
  );

  // MICRO: narrow irregular contours are derived from the meso phase and its
  // secondary warp, so detail stays attached to the physical-looking folds.
  float hairline = 1.0 - smoothstep(
    0.028,
    0.105,
    abs(foldWave - 0.48 + (secondary - 0.5) * 0.11)
  );
  float deepMask = smoothstep(0.59, 0.76, pigmentField)
    * (0.58 + secondary * 0.42);
  float paperCurrent = (1.0 - bodyMask)
    * foldRidge
    * smoothstep(0.2, 0.43, macroField);

  vec3 paleBlue = mix(uPaperColor, uSoftInkColor, 0.36);
  vec3 mediumBlue = mix(uSoftInkColor, uDeepInkColor, 0.24);
  vec3 royalBlue = mix(uSoftInkColor, uDeepInkColor, 0.82);

  vec3 color = uPaperColor;
  color = mix(color, paleBlue, paperCurrent * 0.24);
  color = mix(color, paleBlue, paleMask * 0.68);
  color = mix(color, uSoftInkColor, mediumMask * 0.62);
  color = mix(color, mediumBlue, mediumMask * foldRidge * 0.28);
  color = mix(color, royalBlue, bodyMask * 0.72);
  color = mix(color, uDeepInkColor, deepMask * 0.82);
  color = mix(color, paleBlue, foldChannel * bodyMask * 0.22);
  color = mix(color, mediumBlue, hairline * mediumMask * 0.2);
  color = mix(color, paleBlue, boundaryFeather * 0.16);

  // Accent pigment has its own carrier rather than tracing the blue boundary.
  // Its contours share the flow direction but select independently, producing
  // a few clustered streaks or diffusions instead of a continuous outline.
  float accentWarp = fbm(
    flow * 1.45
      + 1.35 * (q - 0.5)
      + vec2(-7.0, 13.0)
      + vec2(t * 0.057, -t * 0.044)
  );
  float accentPhase = accentWarp * 37.0
    + (secondary - 0.5) * 10.5
    + (r.y - 0.5) * 4.8;
  float accentWave = 0.5 + 0.5 * sin(accentPhase);
  float accentSelection = smoothstep(
    0.56,
    0.74,
    secondary + (q.y - 0.5) * 0.12
  );
  float accentDiffusion = smoothstep(0.72, 0.91, accentWave) * accentSelection;
  float accentStreak = smoothstep(0.9, 0.982, accentWave) * accentSelection;
  color = mix(color, mix(paleBlue, uAccentColor, 0.64), accentDiffusion * 0.42);
  color = mix(color, uAccentColor, accentStreak * 0.78);

  color = adjustSaturation(color, max(uSaturation, 0.0));
  color = (color - 0.5) * max(uContrast, 0.0) + 0.5;

  float paperGrain = hash(gl_FragCoord.xy * 0.19 + vec2(37.0, 11.0));
  color += (paperGrain - 0.5) * 0.012;

  gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`;

const HEX_COLOR = /^#?[0-9a-fA-F]{6}$/;
const DEFAULT_PAPER = "#F6EFD3";
const DEFAULT_SOFT_INK = "#9DA5B6";
const DEFAULT_DEEP_INK = "#3C2FAA";
const DEFAULT_ACCENT = "#F5AED9";

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

export interface PaperInkBackgroundProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Rate at which the ink field evolves. Set to 0 to freeze it. */
  speed?: number;
  /** Spatial scale of the ink structures. Lower values create broader forms. */
  scale?: number;
  /** Pigment saturation. Set to 0 for a neutral, desaturated rendering. */
  saturation?: number;
  /** Separation between paper and ink tones. */
  contrast?: number;
  /** Warm paper base color. */
  paperColor?: string;
  /** Desaturated color used for the broad ink washes. */
  softInkColor?: string;
  /** Concentrated color used in deeper pigment regions. */
  deepInkColor?: string;
  /** Rare vein accent color. */
  accentColor?: string;
  /** Maximum device pixel ratio used by the canvas backing buffer. */
  maxDpr?: number;
}

export function PaperInkBackground({
  speed = 0.22,
  scale = 1,
  saturation = 1,
  contrast = 1,
  paperColor = DEFAULT_PAPER,
  softInkColor = DEFAULT_SOFT_INK,
  deepInkColor = DEFAULT_DEEP_INK,
  accentColor = DEFAULT_ACCENT,
  maxDpr = 2,
  className,
  style,
  ...props
}: PaperInkBackgroundProps) {
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const controlsRef = React.useRef<{
    draw: () => void;
    kick: () => void;
  } | null>(null);
  const [webglFailed, setWebglFailed] = React.useState(false);

  const settings = React.useMemo(
    () => ({
      speed,
      scale,
      saturation,
      contrast,
      paperColor,
      softInkColor,
      deepInkColor,
      accentColor,
      maxDpr,
    }),
    [
      speed,
      scale,
      saturation,
      contrast,
      paperColor,
      softInkColor,
      deepInkColor,
      accentColor,
      maxDpr,
    ],
  );
  const settingsRef = React.useRef(settings);
  settingsRef.current = settings;

  React.useEffect(() => {
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
    const uScale = uniform("uScale");
    const uSaturation = uniform("uSaturation");
    const uContrast = uniform("uContrast");
    const uPaperColor = uniform("uPaperColor");
    const uSoftInkColor = uniform("uSoftInkColor");
    const uDeepInkColor = uniform("uDeepInkColor");
    const uAccentColor = uniform("uAccentColor");

    let disposed = false;
    let frameId = 0;
    let running = false;
    let visible = true;
    let pageVisible = document.visibilityState !== "hidden";
    let reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let simulationTime = 8.75;
    let lastFrame = performance.now();

    const draw = () => {
      if (disposed) return;
      const current = settingsRef.current;
      const paper = hexToRgb(current.paperColor, DEFAULT_PAPER);
      const soft = hexToRgb(current.softInkColor, DEFAULT_SOFT_INK);
      const deep = hexToRgb(current.deepInkColor, DEFAULT_DEEP_INK);
      const accent = hexToRgb(current.accentColor, DEFAULT_ACCENT);

      gl.useProgram(program);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, simulationTime);
      gl.uniform1f(uScale, Math.max(0.05, current.scale));
      gl.uniform1f(uSaturation, Math.max(0, current.saturation));
      gl.uniform1f(uContrast, Math.max(0, current.contrast));
      gl.uniform3f(uPaperColor, paper[0], paper[1], paper[2]);
      gl.uniform3f(uSoftInkColor, soft[0], soft[1], soft[2]);
      gl.uniform3f(uDeepInkColor, deep[0], deep[1], deep[2]);
      gl.uniform3f(uAccentColor, accent[0], accent[1], accent[2]);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const renderFrame = (now: number) => {
      if (disposed) return;
      const delta = Math.min(0.05, Math.max(0, (now - lastFrame) / 1000));
      lastFrame = now;
      simulationTime += delta * Math.max(0, settingsRef.current.speed);
      draw();

      if (
        visible &&
        pageVisible &&
        !reducedMotion &&
        settingsRef.current.speed > 0
      ) {
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
        settingsRef.current.speed <= 0
      ) {
        return;
      }
      running = true;
      lastFrame = performance.now();
      frameId = requestAnimationFrame(renderFrame);
    };

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const dpr = Math.min(
        window.devicePixelRatio || 1,
        Math.max(0.5, settingsRef.current.maxDpr),
      );
      const width = Math.max(1, Math.round(rect.width * dpr));
      const height = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
      draw();
    };

    controlsRef.current = { draw, kick };
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
      data-slot="paper-ink-background"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      style={{
        backgroundColor: normalizeHex(paperColor, DEFAULT_PAPER),
        backgroundImage: `radial-gradient(ellipse at 18% 76%, ${normalizeHex(deepInkColor, DEFAULT_DEEP_INK)} 0%, transparent 30%), radial-gradient(ellipse at 70% 32%, ${normalizeHex(softInkColor, DEFAULT_SOFT_INK)} 0%, transparent 38%), radial-gradient(ellipse at 53% 58%, ${normalizeHex(accentColor, DEFAULT_ACCENT)} 0%, transparent 12%)`,
        filter: `saturate(${Math.max(0, saturation)}) contrast(${Math.max(0, contrast)})`,
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
        data-slot="paper-ink-background"
        className={cn(
          "pointer-events-none absolute inset-0 overflow-hidden",
          className,
        )}
        style={{ backgroundColor: normalizeHex(paperColor, DEFAULT_PAPER), ...style }}
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

export default PaperInkBackground;
