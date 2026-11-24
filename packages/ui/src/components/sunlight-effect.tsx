"use client";

import * as React from "react";
import { WebGLErrorBoundary } from "@workspace/ui/components/webgl-error-boundary";
import { cn } from "@workspace/ui/lib/utils";

const VERTEX_SHADER = `
attribute vec2 position;

void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uBackground;
uniform vec3 uBloomColor;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uColor4;
uniform vec3 uColor5;
uniform float uColorCount;
uniform float uBloom;
uniform float uIntensity;
uniform float uDensity;
uniform float uSpotty;
uniform float uMidSize;
uniform float uMidIntensity;
uniform float uScale;
uniform float uRotation;
uniform vec2 uOffset;

const float TAU = 6.28318530718;

float hash11(float value) {
  return fract(sin(value * 127.1) * 43758.5453123);
}

float noise1(float value) {
  float cell = floor(value);
  float local = fract(value);
  float curve = local * local * (3.0 - 2.0 * local);
  return mix(hash11(cell), hash11(cell + 1.0), curve);
}

float angularNoise(float angle, float frequency) {
  float value = 0.0;
  value += noise1(angle * frequency) * 0.56;
  value += noise1(angle * frequency * 2.07 + 19.4) * 0.29;
  value += noise1(angle * frequency * 4.13 + 47.2) * 0.15;
  return value;
}

float rayLayer(
  float angle,
  float radius,
  float count,
  float drift,
  float sharpness,
  float seed
) {
  float rayPosition = angle / TAU * count + drift;
  float cell = floor(rayPosition);
  float local = fract(rayPosition) - 0.5;
  float center = (hash11(cell * 2.17 + seed) - 0.5) * 0.38;
  float width = mix(
    0.12,
    0.56,
    hash11(cell * 4.61 + seed * 1.7)
  );
  float beam = 1.0 - smoothstep(width * 0.16, width, abs(local - center));
  beam = pow(max(beam, 0.0), sharpness);

  float reach = mix(
    0.82,
    2.35,
    hash11(cell * 7.31 + seed * 3.1)
  );
  reach *= mix(1.45, 0.62, clamp(uSpotty, 0.0, 1.0));
  float lengthFade = 1.0 - smoothstep(reach * 0.5, reach, radius);
  float pulse = 0.82 + 0.18 * sin(
    uTime * mix(0.42, 1.05, hash11(cell + seed)) +
    hash11(cell * 9.9 + seed) * TAU
  );
  float inwardPhase = fract(
    radius * mix(2.1, 3.8, hash11(cell * 5.27 + seed * 2.4)) +
    uTime * mix(0.34, 0.58, hash11(cell * 8.13 + seed)) +
    hash11(cell * 12.7 + seed * 4.2)
  );
  float inwardFlow = smoothstep(0.04, 0.24, inwardPhase) *
    (1.0 - smoothstep(0.58, 0.94, inwardPhase));
  inwardFlow = mix(0.64, 1.24, inwardFlow);

  return beam * lengthFade * pulse * inwardFlow;
}

vec3 palette(float amount) {
  float count = clamp(uColorCount, 1.0, 5.0);
  if (count < 1.5) return uColor1;
  if (count < 2.5) return mix(uColor1, uColor2, amount);
  if (count < 3.5) {
    return amount < 0.5
      ? mix(uColor1, uColor2, amount * 2.0)
      : mix(uColor2, uColor3, (amount - 0.5) * 2.0);
  }
  if (count < 4.5) {
    float position = amount * 3.0;
    if (position < 1.0) return mix(uColor1, uColor2, position);
    if (position < 2.0) return mix(uColor2, uColor3, position - 1.0);
    return mix(uColor3, uColor4, position - 2.0);
  }
  float position = amount * 4.0;
  if (position < 1.0) return mix(uColor1, uColor2, position);
  if (position < 2.0) return mix(uColor2, uColor3, position - 1.0);
  if (position < 3.0) return mix(uColor3, uColor4, position - 2.0);
  return mix(uColor4, uColor5, position - 3.0);
}

void main() {
  float shortestSide = max(1.0, min(uResolution.x, uResolution.y));
  vec2 center = uResolution * 0.5 + uOffset * shortestSide * 0.42;
  vec2 point = (gl_FragCoord.xy - center) / shortestSide;
  point /= max(0.18, uScale);

  float radius = length(point);
  float angle = atan(point.y, point.x) + uRotation;
  float density = clamp(uDensity, 0.2, 3.0);

  float broad = pow(
    angularNoise(angle + uTime * 0.016, 5.2 * density),
    1.65
  );
  float medium = rayLayer(
    angle,
    radius,
    17.0 * density,
    uTime * 0.065,
    0.82,
    3.7
  );
  float fine = rayLayer(
    angle,
    radius,
    37.0 * density,
    -uTime * 0.042,
    1.25,
    11.3
  );
  float needles = rayLayer(
    angle,
    radius,
    68.0 * density,
    uTime * 0.024,
    1.8,
    29.8
  );

  float edgeReach = exp(-radius * mix(0.52, 1.45, uSpotty));
  float rays = (broad * 0.45 + medium * 0.66 + fine * 0.3 + needles * 0.1);
  rays *= edgeReach * clamp(uIntensity, 0.0, 3.0);

  float colorCoordinate = fract(
    angularNoise(angle - uTime * 0.011, 2.8) * 0.78 +
    angularNoise(angle + 2.4, 10.0) * 0.34
  );
  vec3 rayColor = palette(colorCoordinate);

  float middleSize = mix(0.075, 0.68, clamp(uMidSize, 0.0, 1.5) / 1.5);
  float core = exp(-pow(radius / max(0.012, middleSize), 2.0) * 1.45);
  float halo = exp(-radius * mix(4.8, 1.25, clamp(uBloom, 0.0, 2.5) / 2.5));

  vec3 color = uBackground;
  color += rayColor * rays;
  color += uBloomColor * halo * clamp(uBloom, 0.0, 2.5) * 0.72;
  color += mix(vec3(1.0, 1.0, 0.93), uBloomColor, 0.24) * core * clamp(uMidIntensity, 0.0, 3.0) * 1.18;

  float vignette = 1.0 - smoothstep(0.34, 1.08, radius);
  color *= mix(0.24, 1.0, vignette);
  color = 1.0 - exp(-max(color, vec3(0.0)));

  gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`;

const DEFAULT_COLORS = ["#55ffad", "#27ffc6", "#d4ff58", "#f4ffd2", "#00df9d"];
const DEFAULT_BACKGROUND = "#020b07";
const DEFAULT_BLOOM = "#6dff94";
const HEX_COLOR = /^#?[0-9a-fA-F]{6}$/;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeHex(value: string, fallback: string) {
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

export type SunlightEffectPresetName =
  | "default"
  | "sunset"
  | "ocean"
  | "violet"
  | "mono";

export const SUNLIGHT_EFFECT_PRESETS: Record<
  SunlightEffectPresetName,
  { colors: string[]; backgroundColor: string; bloomColor: string }
> = {
  default: { colors: ["#55ffad", "#27ffc6", "#d4ff58", "#f4ffd2", "#00df9d"], backgroundColor: "#020b07", bloomColor: "#6dff94" },
  sunset: { colors: ["#ff7a59", "#ffb347", "#ffd166", "#ffe8a3", "#ff5e5b"], backgroundColor: "#12060a", bloomColor: "#ff9f68" },
  ocean: { colors: ["#5eead4", "#38bdf8", "#93c5fd", "#e0f2fe", "#22d3ee"], backgroundColor: "#020b14", bloomColor: "#7dd3fc" },
  violet: { colors: ["#c4b5fd", "#a78bfa", "#8b5cf6", "#ddd6fe", "#7c3aed"], backgroundColor: "#0a0512", bloomColor: "#a78bfa" },
  mono: { colors: ["#e5e5e5", "#d4d4d4", "#a3a3a3", "#737373", "#525252"], backgroundColor: "#050505", bloomColor: "#d4d4d4" },
};

export interface SunlightEffectProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "color"
> {
  /** Color preset. Explicit color props override the preset. */
  preset?: SunlightEffectPresetName;
  /** One to five colors distributed across the light rays. */
  colors?: string[];
  /** Color behind the burst. */
  backgroundColor?: string;
  /** Color of the atmospheric glow around the center. */
  bloomColor?: string;
  /** Strength and reach of the soft atmospheric glow. */
  bloom?: number;
  /** Overall visibility of the rays. */
  intensity?: number;
  /** Number of broad and fine rays. */
  density?: number;
  /** Shortens and separates rays as it increases. */
  spotty?: number;
  /** Radius of the central glow. */
  midSize?: number;
  /** Brightness of the central glow. */
  midIntensity?: number;
  /** Animation speed. Set to 0 to freeze the field. */
  speed?: number;
  /** Scale of the full burst. */
  scale?: number;
  /** Rotation of the rays in degrees. */
  rotation?: number;
  /** Horizontal origin offset from -1 to 1. */
  offsetX?: number;
  /** Vertical origin offset from -1 to 1. */
  offsetY?: number;
  /** Maximum device pixel ratio used by the canvas. */
  maxDpr?: number;
}

export function SunlightEffect({
  preset = "default",
  colors: colorsProp,
  backgroundColor: backgroundColorProp,
  bloomColor: bloomColorProp,
  bloom = 1.12,
  intensity = 1.35,
  density = 1,
  spotty = 0.18,
  midSize = 0.82,
  midIntensity = 1.72,
  speed = 1.2,
  scale = 1,
  rotation = 0,
  offsetX = 0,
  offsetY = 0,
  maxDpr = 2,
  className,
  style,
  ...props
}: SunlightEffectProps) {
  const presetPalette =
    SUNLIGHT_EFFECT_PRESETS[preset as SunlightEffectPresetName] ??
    SUNLIGHT_EFFECT_PRESETS.default;
  const colors = colorsProp ?? presetPalette.colors;
  const backgroundColor = backgroundColorProp ?? presetPalette.backgroundColor;
  const bloomColor = bloomColorProp ?? presetPalette.bloomColor;

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
      colors,
      backgroundColor,
      bloomColor,
      bloom,
      intensity,
      density,
      spotty,
      midSize,
      midIntensity,
      speed,
      scale,
      rotation,
      offsetX,
      offsetY,
      maxDpr,
    }),
    [
      colors,
      backgroundColor,
      bloomColor,
      bloom,
      intensity,
      density,
      spotty,
      midSize,
      midIntensity,
      speed,
      scale,
      rotation,
      offsetX,
      offsetY,
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

    gl.useProgram(program);
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uniform = (name: string) => gl.getUniformLocation(program, name);
    const uniforms = {
      resolution: uniform("uResolution"),
      time: uniform("uTime"),
      background: uniform("uBackground"),
      bloomColor: uniform("uBloomColor"),
      colors: [1, 2, 3, 4, 5].map((index) => uniform(`uColor${index}`)),
      colorCount: uniform("uColorCount"),
      bloom: uniform("uBloom"),
      intensity: uniform("uIntensity"),
      density: uniform("uDensity"),
      spotty: uniform("uSpotty"),
      midSize: uniform("uMidSize"),
      midIntensity: uniform("uMidIntensity"),
      scale: uniform("uScale"),
      rotation: uniform("uRotation"),
      offset: uniform("uOffset"),
    };

    let disposed = false;
    let frameId = 0;
    let running = false;
    let visible = true;
    let pageVisible = document.visibilityState !== "hidden";
    let reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let simulationTime = 3.7;
    let lastFrame = performance.now();

    const draw = () => {
      if (disposed) return;
      const current = settingsRef.current;
      const activeColors = current.colors
        .filter((color) => HEX_COLOR.test(color.trim()))
        .slice(0, 5);
      if (activeColors.length === 0) activeColors.push(DEFAULT_COLORS[0]!);
      while (activeColors.length < 5) {
        activeColors.push(activeColors[activeColors.length - 1]!);
      }

      const background = hexToRgb(current.backgroundColor, DEFAULT_BACKGROUND);
      const glow = hexToRgb(current.bloomColor, DEFAULT_BLOOM);
      const validColorCount = clamp(
        current.colors.filter((color) => HEX_COLOR.test(color.trim())).length,
        1,
        5,
      );

      gl.useProgram(program);
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
      gl.uniform1f(uniforms.time, simulationTime);
      gl.uniform3fv(uniforms.background, background);
      gl.uniform3fv(uniforms.bloomColor, glow);
      activeColors.forEach((color, index) => {
        gl.uniform3fv(
          uniforms.colors[index]!,
          hexToRgb(color, DEFAULT_COLORS[index]!),
        );
      });
      gl.uniform1f(uniforms.colorCount, validColorCount);
      gl.uniform1f(uniforms.bloom, clamp(current.bloom, 0, 2.5));
      gl.uniform1f(uniforms.intensity, clamp(current.intensity, 0, 3));
      gl.uniform1f(uniforms.density, clamp(current.density, 0.2, 3));
      gl.uniform1f(uniforms.spotty, clamp(current.spotty, 0, 1));
      gl.uniform1f(uniforms.midSize, clamp(current.midSize, 0, 1.5));
      gl.uniform1f(uniforms.midIntensity, clamp(current.midIntensity, 0, 3));
      gl.uniform1f(uniforms.scale, clamp(current.scale, 0.25, 3));
      gl.uniform1f(uniforms.rotation, (current.rotation * Math.PI) / 180);
      gl.uniform2f(
        uniforms.offset,
        clamp(current.offsetX, -1, 1),
        clamp(current.offsetY, -1, 1),
      );
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
        clamp(settingsRef.current.maxDpr, 0.5, 3),
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
      data-slot="sunlight-effect"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      style={{
        backgroundColor,
        backgroundImage: `radial-gradient(circle at ${50 + offsetX * 35}% ${50 - offsetY * 35}%, ${bloomColor} 0%, ${colors[0] ?? DEFAULT_COLORS[0]} 18%, ${backgroundColor} 70%)`,
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
        data-slot="sunlight-effect"
        className={cn(
          "pointer-events-none absolute inset-0 overflow-hidden",
          className,
        )}
        style={{ backgroundColor, ...style }}
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

const propertyControls = {
  colors: {
    type: "Array",
    title: "Colors",
    maxCount: 5,
    defaultValue: DEFAULT_COLORS,
    propertyControl: { type: "Color" },
    group: "Colors",
  },
  backgroundColor: {
    type: "Color",
    title: "Background",
    defaultValue: DEFAULT_BACKGROUND,
    group: "Colors",
  },
  bloomColor: {
    type: "Color",
    title: "Bloom Color",
    defaultValue: DEFAULT_BLOOM,
    group: "Colors",
  },
  bloom: {
    type: "Number",
    title: "Bloom",
    min: 0,
    max: 2.5,
    step: 0.01,
    defaultValue: 1.12,
    group: "Light",
  },
  intensity: {
    type: "Number",
    title: "Intensity",
    min: 0,
    max: 3,
    step: 0.01,
    defaultValue: 1.35,
    group: "Light",
  },
  density: {
    type: "Number",
    title: "Density",
    min: 0.2,
    max: 3,
    step: 0.01,
    defaultValue: 1.2,
    group: "Rays",
  },
  spotty: {
    type: "Number",
    title: "Spotty",
    min: 0,
    max: 1,
    step: 0.01,
    defaultValue: 0.18,
    group: "Rays",
  },
  midSize: {
    type: "Number",
    title: "Mid Size",
    min: 0,
    max: 1.5,
    step: 0.01,
    defaultValue: 0.82,
    group: "Center",
  },
  midIntensity: {
    type: "Number",
    title: "Mid Intensity",
    min: 0,
    max: 3,
    step: 0.01,
    defaultValue: 1.72,
    group: "Center",
  },
  speed: {
    type: "Number",
    title: "Speed",
    min: 0,
    max: 2,
    step: 0.01,
    defaultValue: 1,
    group: "Motion",
  },
  scale: {
    type: "Number",
    title: "Scale",
    min: 0.25,
    max: 3,
    step: 0.01,
    defaultValue: 1,
    group: "Transform",
  },
  rotation: {
    type: "Number",
    title: "Rotation",
    min: -180,
    max: 180,
    step: 1,
    defaultValue: 0,
    unit: "deg",
    group: "Transform",
  },
  offsetX: {
    type: "Number",
    title: "Offset X",
    min: -1,
    max: 1,
    step: 0.01,
    defaultValue: 0,
    group: "Transform",
  },
  offsetY: {
    type: "Number",
    title: "Offset Y",
    min: -1,
    max: 1,
    step: 0.01,
    defaultValue: 0,
    group: "Transform",
  },
};

(SunlightEffect as unknown as Record<string, unknown>).propertyControls =
  propertyControls;
(SunlightEffect as unknown as Record<string, unknown>).addPropertyControls =
  propertyControls;

export default SunlightEffect;
