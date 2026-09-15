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
uniform float uScale;
uniform int uComplexity;
uniform float uWarp;
uniform float uContrast;
uniform float uBrightness;
uniform float uGridSize;
uniform float uGridStrength;
uniform float uGlowStrength;
uniform float uGlowSpread;
uniform vec3 uBackground;
uniform vec3 uPrimary;
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

  for (int i = 0; i < 5; i++) {
    if (i >= octaves) break;
    value += amplitude * valueNoise(p);
    total += amplitude;
    p = rotation * p * 2.03 + vec2(17.3, 9.1);
    amplitude *= 0.5;
  }

  return total > 0.0 ? value / total : 0.0;
}

void main() {
  vec2 res = max(uResolution, vec2(1.0));
  float aspect = res.x / res.y;
  // Compose in a 2:1 reference frame; portrait containers show its centre.
  vec2 p = (vUv - 0.5) * vec2(min(aspect, 2.0), 1.0);

  // The reference is a single, broad ribbon that slowly bends and travels
  // through darkness. Keep its silhouette coherent instead of using a noisy
  // cloud field so every point in the pixel mesh belongs to one smooth shape.
  float t = (uTime - 7.3);
  float density = max(uScale, 0.2);
  float bend = -0.23 * p.x + 0.15 * sin(p.x * density * 1.55 + t + 2.6);
  bend += 0.055 * sin(p.x * 4.0 - t * 0.62 + 0.7) * uWarp;
  bend += (fbm(vec2(p.x * 0.7 + 3.0, t * 0.15), uComplexity) - 0.5) * 0.045 * uWarp;

  float centre = bend - 0.035;
  float bodyWidth = mix(0.09, 0.18, clamp(uGlowSpread, 0.0, 1.0));
  bodyWidth *= 0.82 + 0.25 * sin(p.x * 4.0 + t * 1.1);
  float distanceToWave = (p.y - centre) / bodyWidth;
  float ribbon = exp(-0.5 * distanceToWave * distanceToWave);

  // The mesh appears as a finite, softly tapered strip, never a full-width
  // wallpaper. Its ends drift independently to make the motion organic.
  float ends = exp(-pow(abs(p.x / 0.72), 6.0));
  ribbon *= ends;

  float centreLine = 0.68 + 0.32 * cos(p.x * 4.3 + t * 0.8);
  float contrast = max(uContrast, 0.01);
  float intensity = pow(clamp(ribbon, 0.0, 1.0), contrast / 1.6);
  float hot = pow(centreLine * intensity, 3.0);

  // Atmospheric color and bloom live below the visible square pixels.
  vec3 col = uBackground;
  vec3 light = mix(uPrimary, uSecondary, intensity);
  light = mix(light, uHighlight, hot * 0.8);
  float bloom = exp(-0.18 * distanceToWave * distanceToWave) * ends;

  // Deliberately square LED cells match the recording's visible pixel mesh.
  float cellPx = max(uGridSize, 1.5);
  vec2 cell = fract(gl_FragCoord.xy / cellPx) - 0.5;
  float square = 1.0 - smoothstep(0.36, 0.46, max(abs(cell.x), abs(cell.y)));
  float mesh = mix(1.0, square, clamp(uGridStrength, 0.0, 1.0));
  col += light * intensity * mesh;
  col += uPrimary * bloom * 0.09 * clamp(uGlowStrength, 0.0, 2.0);

  // Fade the whole field into a nearly-black frame at the edges.
  float vignette = 1.0 - smoothstep(0.32, 1.42, length(p * vec2(0.82, 1.0)));
  col *= mix(0.76, 1.0, vignette);
  col *= max(uBrightness, 0.0);

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

export interface NeonMeshBGProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Deepest background color. */
  backgroundColor?: string;
  /** Dark violet midtone. */
  primaryColor?: string;
  /** Electric purple / magenta glow. */
  secondaryColor?: string;
  /** Pale lavender / pink-white core highlight. */
  highlightColor?: string;
  /** Base sampling frequency of the mesh field. */
  scale?: number;
  /** FBM octave count, 1 to 5. */
  complexity?: number;
  /** Domain-warp amplitude. Higher values fold the mesh harder. */
  warp?: number;
  /** Field contrast around mid-gray. Higher values keep more of the frame dark. */
  contrast?: number;
  /** Post brightness multiplier. */
  brightness?: number;
  /** Pixel cell size in screen pixels. Smaller values densify the LED matrix. */
  gridSize?: number;
  /** Visibility of the pixel / dot matrix, 0 to 1. */
  gridStrength?: number;
  /** Atmospheric bloom strength, 0 to 2. */
  glowStrength?: number;
  /** Softness of the glow falloff, 0 to 1. */
  glowSpread?: number;
  /** Global animation rate. */
  speed?: number;
  /** Set to false to freeze the current composition. */
  animate?: boolean;
  /** Backing-store resolution multiplier, 0.25 to 1. Lower values are faster. */
  quality?: number;
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

export function NeonMeshBG({
  backgroundColor = "#050505",
  primaryColor = "#40134e",
  secondaryColor = "#873491",
  highlightColor = "#eed5f2",
  scale = 1.6,
  complexity = 4,
  warp = 1.15,
  contrast = 1.6,
  brightness = 0.85,
  gridSize = 6.5,
  gridStrength = 0.92,
  glowStrength = 1,
  glowSpread = 0.65,
  speed = 0.35,
  animate = true,
  quality = 1,
  pauseWhenOffscreen = true,
  respectReducedMotion = true,
  maxDpr = 2,
  className,
  style,
  ...props
}: NeonMeshBGProps) {
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const resizeRef = React.useRef<(() => void) | null>(null);
  const refreshRef = React.useRef<(() => void) | null>(null);
  const [contextVersion, restoreContext] = React.useReducer(
    (value: number) => value + 1,
    0,
  );

  const settings = React.useMemo(
    () => ({
      background: parseColor(backgroundColor),
      primary: parseColor(primaryColor),
      secondary: parseColor(secondaryColor),
      highlight: parseColor(highlightColor),
      scale: Math.max(0.2, scale),
      complexity: Math.min(5, Math.max(1, Math.round(complexity))),
      warp: Math.max(0, warp),
      contrast: Math.max(0.01, contrast),
      brightness: Math.max(0, brightness),
      gridSize: Math.max(1.5, gridSize),
      gridStrength: Math.min(1, Math.max(0, gridStrength)),
      glowStrength: Math.min(2, Math.max(0, glowStrength)),
      glowSpread: Math.min(1, Math.max(0, glowSpread)),
      speed: Math.max(0, speed),
      quality: Math.min(1, Math.max(0.25, quality)),
      animate,
    }),
    [
      backgroundColor,
      primaryColor,
      secondaryColor,
      highlightColor,
      scale,
      complexity,
      warp,
      contrast,
      brightness,
      gridSize,
      gridStrength,
      glowStrength,
      glowSpread,
      speed,
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
      host.style.backgroundImage = `radial-gradient(ellipse at 50% 45%, ${colorToHex(s.highlight)} 0%, ${colorToHex(s.secondary)} 22%, ${colorToHex(s.primary)} 45%, transparent 75%), radial-gradient(circle at center, rgba(0,0,0,.55) 0 1px, transparent 1.25px)`;
      host.style.backgroundSize = `auto, ${Math.max(2, s.gridSize)}px ${Math.max(2, s.gridSize)}px`;
      host.style.backgroundRepeat = "no-repeat, repeat";
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
    const uScale = uniform("uScale");
    const uComplexity = uniform("uComplexity");
    const uWarp = uniform("uWarp");
    const uContrast = uniform("uContrast");
    const uBrightness = uniform("uBrightness");
    const uGridSize = uniform("uGridSize");
    const uGridStrength = uniform("uGridStrength");
    const uGlowStrength = uniform("uGlowStrength");
    const uGlowSpread = uniform("uGlowSpread");
    const uBackground = uniform("uBackground");
    const uPrimary = uniform("uPrimary");
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
    let simulationTime = 7.3;
    let lastFrame = performance.now();

    const draw = () => {
      if (disposed || contextLost) return;
      const s = settingsRef.current;
      gl.useProgram(program);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, simulationTime);
      gl.uniform1f(uScale, s.scale);
      gl.uniform1i(uComplexity, s.complexity);
      gl.uniform1f(uWarp, s.warp);
      gl.uniform1f(uContrast, s.contrast);
      gl.uniform1f(uBrightness, s.brightness);
      gl.uniform1f(uGridSize, s.gridSize * backingScale);
      gl.uniform1f(uGridStrength, s.gridStrength);
      gl.uniform1f(uGlowStrength, s.glowStrength);
      gl.uniform1f(uGlowSpread, s.glowSpread);
      gl.uniform3f(
        uBackground,
        s.background[0],
        s.background[1],
        s.background[2],
      );
      gl.uniform3f(uPrimary, s.primary[0], s.primary[1], s.primary[2]);
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
      if (
        disposed ||
        running ||
        !isVisible() ||
        !pageVisible ||
        !shouldAnimate()
      ) {
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
      const scaleFactor = settingsRef.current.quality;
      backingScale = dpr * scaleFactor;
      const width = Math.max(1, Math.round(rect.width * dpr * scaleFactor));
      const height = Math.max(1, Math.round(rect.height * dpr * scaleFactor));
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
      data-slot="neon-mesh-bg"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      style={{
        backgroundColor,
        backgroundImage: `radial-gradient(ellipse at 50% 45%, ${highlightColor} 0%, ${secondaryColor} 22%, ${primaryColor} 45%, transparent 75%), radial-gradient(circle at center, rgba(0,0,0,.55) 0 1px, transparent 1.25px)`,
        backgroundSize: `auto, ${Math.max(2, gridSize)}px ${Math.max(2, gridSize)}px`,
        backgroundRepeat: "no-repeat, repeat",
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
        data-slot="neon-mesh-bg"
        className={cn(
          "pointer-events-none absolute inset-0 overflow-hidden",
          className,
        )}
        style={{
          backgroundColor,
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

export default NeonMeshBG;
