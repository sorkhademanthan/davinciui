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
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
  vec2 base = p * max(uScale, 0.001) * vec2(0.88, 1.08);
  float t = uTime;

  // Two broad counter-moving fields bend the paper coordinates. Y receives
  // more displacement, stretching the result into vertical and diagonal
  // pigment structures instead of round procedural blobs.
  vec2 q = vec2(
    fbm(base * 0.62 + vec2(t * 0.032, -t * 0.019)),
    fbm(base * 0.62 + vec2(5.2, 1.3) + vec2(-t * 0.018, t * 0.028))
  );

  vec2 r = vec2(
    fbm(base * 0.78 + 3.1 * (q - 0.5) + vec2(1.7, 9.2) + vec2(t * 0.014, -t * 0.011)),
    fbm(base * 0.78 + 3.1 * (q - 0.5) + vec2(8.3, 2.8) + vec2(-t * 0.01, t * 0.017))
  );

  vec2 warped = base;
  warped += vec2(
    (q.x - 0.5) * 0.62 + (r.x - 0.5) * 0.3,
    (q.y - 0.5) * 1.38 + (r.y - 0.5) * 0.72
  );
  warped.x += 0.14 * sin(warped.y * 1.65 + r.y * 3.2 + t * 0.023);

  // Signed warped bands form the large marbled territories. Unlike a direct
  // fBM color lookup, this preserves long coherent channels at every ratio.
  float crossWarp = fbm(
    vec2(warped.y * 0.7, warped.x * 0.3)
      + vec2(3.4, 12.7)
      + vec2(-t * 0.013, t * 0.009)
  );
  float phase = warped.x * 7.6
    + (q.y - 0.5) * 8.6
    + (r.x - 0.5) * 5.2
    + (crossWarp - 0.5) * 3.6
    + sin(warped.y * 1.5 + t * 0.018) * 0.72;
  float signedBand = sin(phase);
  float blueMask = smoothstep(0.18, 0.68, signedBand);

  // Secondary folds stay inside the larger pigment masses and create the
  // pale parallel striations visible where ink is pulled through wet paper.
  float foldSignal = 0.5 + 0.5 * sin(
    phase * 2.25
      + fbm(warped * 1.18 + vec2(7.1, -4.8) - t * 0.008) * 4.2
  );
  float fold = smoothstep(0.32, 0.88, foldSignal) * blueMask;

  float concentration = fbm(
    warped * 0.72 + 1.7 * (r - 0.5) + vec2(18.2, -5.6)
  );
  float deepMask = blueMask
    * smoothstep(0.56, 0.78, concentration + foldSignal * 0.12);

  // Magenta follows a blue/paper contour. A central window and a separate
  // low-frequency selection field keep the vein rare and fragmented.
  float boundaryDistance = abs(signedBand - 0.16);
  float veinCore = 1.0 - smoothstep(0.018, 0.095, boundaryDistance);
  float veinHalo = 1.0 - smoothstep(0.045, 0.22, boundaryDistance);
  float accentWindow = 1.0 - smoothstep(
    0.2,
    0.62,
    abs(p.x + (q.x - 0.5) * 0.3)
  );
  float accentSelection = smoothstep(
    0.49,
    0.67,
    fbm(
      vec2(warped.y * 0.82, warped.x * 0.24)
        + vec2(-7.0, 13.0)
        + vec2(t * 0.009, -t * 0.007)
    )
  );
  float vein = veinCore * accentWindow * accentSelection;
  float halo = veinHalo * accentWindow * accentSelection;

  vec3 color = uPaperColor;
  color = mix(color, uSoftInkColor, blueMask * 0.78);
  color = mix(color, uDeepInkColor, deepMask * 0.72);
  color = mix(color, uPaperColor, fold * (1.0 - deepMask) * 0.24);
  color = mix(color, mix(uPaperColor, uAccentColor, 0.55), halo * 0.48);
  color = mix(color, uAccentColor, vein * 0.95);

  color = adjustSaturation(color, max(uSaturation, 0.0));
  color = (color - 0.5) * max(uContrast, 0.0) + 0.5;

  float paperGrain = hash(gl_FragCoord.xy * 0.19 + vec2(37.0, 11.0));
  color += (paperGrain - 0.5) * 0.012;

  gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`;

const HEX_COLOR = /^#?[0-9a-fA-F]{6}$/;
const DEFAULT_PAPER = "#E9E1C8";
const DEFAULT_SOFT_INK = "#8B9BBE";
const DEFAULT_DEEP_INK = "#2D2A93";
const DEFAULT_ACCENT = "#DC4FA7";

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
