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
uniform float uDensity;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float lowNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);

  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

vec3 palette(float value) {
  const vec3 dark = vec3(0.012, 0.016, 0.02);
  const vec3 deep = vec3(0.145, 0.22, 0.302);
  const vec3 ice = vec3(0.69, 0.79, 0.86);
  const vec3 white = vec3(0.969, 0.969, 0.953);
  const vec3 warm = vec3(0.91, 0.87, 0.816);

  // Field allocation: dark -> navy -> blue own most of the range, ice is a
  // wide atmospheric transition, white is a narrow luminous highlight
  // squeezed between ice and cream, warm resolves only at the far field.
  vec3 color = dark;
  color = mix(color, deep, smoothstep(0.22, 0.50, value));
  color = mix(color, ice, smoothstep(0.46, 0.72, value));
  color = mix(color, white, smoothstep(0.75, 0.88, value));
  color = mix(color, warm, smoothstep(0.94, 1.0, value));
  return color;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float density = clamp(uDensity, 0.35, 3.0);
  float t = uTime * 1.8;
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);

  // Field geometry: a directional signed flowing boundary, NOT a radial orb.
  // There is no center and no radius anywhere below. Colors resolve as
  // parallel zones of one giant deforming surface that extends beyond both
  // sides of the viewport, so dark/navy can sweep through the middle while
  // blue/ice forms a wide atmospheric transition and white stays a narrow
  // luminous highlight between ice and cream.

  // PRIMARY WARP — enormous sweeping curvature, extremely low frequency.
  vec2 flowA = p * 0.32 + vec2(t * 0.030, -t * 0.022);
  vec2 warpA = vec2(
    lowNoise(flowA + vec2(2.7, 8.1)),
    lowNoise(flowA.yx + vec2(9.4, 1.6))
  ) - 0.5;

  // SECONDARY WARP — breaks symmetry, subtle organic deformation.
  // Fed by the primary warp so the boundary never reads as a sine wave.
  vec2 flowB = p * 0.68 + warpA * 1.4 + vec2(-t * 0.021, t * 0.026);
  vec2 warpB = vec2(
    lowNoise(flowB + vec2(5.1, 3.3)),
    lowNoise(flowB.yx + vec2(1.2, 7.7))
  ) - 0.5;

  vec2 q = p + warpA * vec2(1.15, 0.90) + warpB * vec2(0.50, 0.40);

  // The surface itself turns — orientation drifts very slowly.
  float angle = 0.62 + sin(t * 0.075) * 0.50 + sin(t * 0.031 + 1.7) * 0.28;
  vec2 dir = vec2(cos(angle), sin(angle));

  // The boundary offset drifts through the viewport, alternating the
  // composition between dark-dominant and light-dominant states.
  float offset = sin(t * 0.18) * 0.40 + sin(t * 0.061 + 0.7) * 0.26;

  // Signed directional field: negative = dark side, positive = light side.
  float field = dot(q, dir) - offset;

  // Giant S-curve: a broad low-frequency bend of the boundary, itself
  // domain-warped by both warps so no clean sinusoid is visible. Amplitudes
  // are large relative to the viewport so the boundary sweeps and folds
  // like a flexible curtain instead of a straight diagonal.
  float bendPhase = q.y * 0.85 + t * 0.10 + warpA.x * 3.6 + warpB.x * 1.4;
  float foldPhase = q.x * 0.52 - t * 0.075 + warpB.y * 3.0 + warpA.y * 2.2;
  float curve =
      sin(bendPhase) * 0.52
    + sin(foldPhase) * 0.30
    + sin((q.x + q.y) * 0.38 + t * 0.05 + warpA.y * 2.8 - warpB.x * 1.6) * 0.16;
  field += curve;

  // Parallel color zones of the same boundary: black -> navy -> slate blue
  // -> icy blue -> soft white (narrow) -> warm cream (far field only).
  // No post-process blur is required.
  float densityScale = mix(0.72, 1.42, (density - 0.35) / 2.65);
  float value = smoothstep(-0.95, 0.95, field * densityScale);
  vec3 color = palette(value);

  gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`;

export interface SoftFluidGradientProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  /** Animation rate. Set to 0 to freeze the current composition. */
  speed?: number;
  /** Wave density. Lower values create broader loops; higher values tighten them. */
  density?: number;
  /** Maximum device pixel ratio used by the canvas backing buffer. */
  maxDpr?: number;
}

export function SoftFluidGradient({
  speed = 0.26,
  density = 1,
  maxDpr = 2,
  className,
  style,
  ...props
}: SoftFluidGradientProps) {
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
      density,
      maxDpr,
    }),
    [speed, density, maxDpr],
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
    const uDensity = uniform("uDensity");

    let disposed = false;
    let frameId = 0;
    let running = false;
    let visible = true;
    let pageVisible = document.visibilityState !== "hidden";
    let reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let simulationTime = 14.2;
    let lastFrame = performance.now();

    const draw = () => {
      if (disposed) return;
      const current = settingsRef.current;

      gl.useProgram(program);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, simulationTime);
      gl.uniform1f(uDensity, Math.max(0.35, current.density));
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
      data-slot="soft-fluid-gradient"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      style={{
        backgroundColor: "#f3f2ed",
        backgroundImage:
          "linear-gradient(128deg, #050608 0%, #25384d 30%, #c8d8e5 52%, #f7f7f3 68%, #e8ded0 100%)",
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
        data-slot="soft-fluid-gradient"
        className={cn(
          "pointer-events-none absolute inset-0 overflow-hidden",
          className,
        )}
        style={{
          backgroundColor: "#f3f2ed",
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

export default SoftFluidGradient;
