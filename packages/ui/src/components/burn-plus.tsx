"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";
import { WebGLErrorBoundary } from "@workspace/ui/components/webgl-error-boundary";

/* ------------------------------------------------------------------ */
/* types                                                               */
/* ------------------------------------------------------------------ */

export type BurnPlusMediaType = "image" | "video" | "auto";
export type BurnPlusFit = "cover" | "contain" | "fill";
export type BurnPlusTrigger =
  | "manual"
  | "load"
  | "hover"
  | "tap"
  | "inview"
  | "scroll";
export type BurnPlusDirection = "reveal" | "hide" | "alternate";
export type BurnPlusTransition =
  | "linear"
  | "easeIn"
  | "easeOut"
  | "easeInOut"
  | "custom";

export interface BurnPlusProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  media?: string;
  mediaType?: BurnPlusMediaType;
  fit?: BurnPlusFit;
  burn?: number;
  density?: number;
  distortion?: number;
  edgeSoftness?: number;
  noiseScale?: number;
  octaves?: number;
  seed?: number;
  edgeComplexity?: number;
  start?: number;
  end?: number;
  /** Progress at which a reveal settles into a fully visible, clean frame. */
  completeAt?: number;
  quality?: number;
  mobileQuality?: number;
  background?: string;
  invert?: boolean;
  trigger?: BurnPlusTrigger;
  direction?: BurnPlusDirection;
  autoplay?: boolean;
  loop?: boolean;
  /** Milliseconds to hold the completed reveal before restarting a loop. */
  loopDelay?: number;
  delay?: number;
  duration?: number;
  transition?: BurnPlusTransition;
  transitionBezier?: [number, number, number, number];
  scrollStart?: number;
  scrollEnd?: number;
  scrollSmoothing?: number;
  ariaLabel?: string;
}

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    let t = clamp(x, 0, 1);
    for (let i = 0; i < 5; i++) {
      const err = sx(t) - x;
      if (Math.abs(err) < 1e-6) break;
      const d = dx(t);
      if (Math.abs(d) < 1e-6) break;
      t = clamp(t - err / d, 0, 1);
    }
    return sy(t);
  };
}

const PRESET_EASINGS: Record<string, (t: number) => number> = {
  linear: (t) => t,
  easeIn: cubicBezier(0.42, 0, 1, 1),
  easeOut: cubicBezier(0, 0, 0.58, 1),
  easeInOut: cubicBezier(0.42, 0, 0.58, 1),
};

function hexToRgb(
  hex: string,
  fallback: [number, number, number],
): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return fallback;
  const v = m[1]!;
  return [
    parseInt(v.slice(0, 2), 16) / 255,
    parseInt(v.slice(2, 4), 16) / 255,
    parseInt(v.slice(4, 6), 16) / 255,
  ];
}

function isVideoSource(src: string, mediaType: BurnPlusMediaType) {
  if (mediaType === "video") return true;
  if (mediaType === "image") return false;
  return /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(src);
}

/** Nearest scrollable ancestor (or window) so scroll mode works embedded. */
function findScrollParent(el: HTMLElement): HTMLElement | Window {
  let p: HTMLElement | null = el.parentElement;
  while (p) {
    const s = getComputedStyle(p);
    if (/(auto|scroll)/.test(s.overflowY)) return p;
    p = p.parentElement;
  }
  return window;
}

/* ------------------------------------------------------------------ */
/* shaders — warped multi-octave FBM burn field, ES 1.00 compatible    */
/* ------------------------------------------------------------------ */

const VERT_SHADER = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG_SHADER = `
precision highp float;
varying vec2 vUv;

uniform sampler2D uMedia;
uniform vec4 uUv;          // uv scale.xy, offset.zw (object-fit)
uniform vec2 uResolution;
uniform float uBurn;       // threshold progress (start/end already applied)
uniform float uDensity;    // 0..1 spatial frequency
uniform float uDistortion; // 0..1 warp amplitude
uniform float uSoftness;   // edge half-width in field units
uniform float uSeed;
uniform float uTime;
uniform int uOctaves;
uniform float uDetail;     // fine edge-breakup weight
uniform float uNoiseScale;
uniform vec3 uBg;
uniform float uInvert;
uniform float uCompleteAt;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p, int oct) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    if (i >= oct) break;
    v += a * vnoise(p);
    p = p * 2.03 + vec2(17.3, 9.1);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 suv = vUv * uUv.xy + uUv.zw;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 seedOff = uSeed * vec2(13.7, 7.9);

  // Aspect-corrected domain so regions stay organic at any container shape.
  vec2 p = (suv - 0.5) * vec2(aspect, 1.0);
  float freq = mix(2.8, 7.2, uDensity) * max(uNoiseScale, 0.05);
  vec2 base = p * freq + seedOff;

  // Low-frequency domain warp: smooth contours at low distortion,
  // turbulent boundaries when pushed.
  vec2 warp = vec2(
    fbm(base * 0.45 + vec2(0.0, uTime * 0.014), 3),
    fbm(base * 0.45 + vec2(4.7, 1.9) - vec2(uTime * 0.011, 0.0), 3)
  ) - 0.5;
  vec2 q = base + warp * (uDistortion * 2.8);

  // Primary field: large organic regions + medium structure, zoned by a
  // very-low-frequency macro field so mid-burn states break into several
  // disconnected islands instead of one percolating mass.
  float macro = fbm(base * 0.38 + seedOff * 1.7, 3);
  float field = fbm(q + seedOff * 0.37, uOctaves);
  float combined = (field * 0.66 + macro * 0.44) * 0.91;

  // Fine breakup concentrated near the moving edge.
  float edgeBand = 1.0 - smoothstep(0.0, 0.42, abs(combined - (1.0 - uBurn)));
  float fine = vnoise(q * 3.3 + warp * 4.0 + seedOff) - 0.5;
  combined += fine * uDetail * 0.22 * edgeBand;

  float t = pow(clamp(1.0 - uBurn, 0.0, 1.0), 0.7);
  float soft = max(uSoftness, 0.004);
  float m = smoothstep(t - soft, t + soft, combined);
  if (uInvert > 0.5) m = 1.0 - m;

  // The noisy field intentionally leaves disconnected islands during the
  // transition. At its configured completion point, resolve those islands so
  // the held end-state is the unbroken media rather than residual dark spots.
  float completeAt = clamp(uCompleteAt, 0.001, 1.0);
  float settle = smoothstep(max(0.0, completeAt - 0.055), completeAt, uBurn);
  m = mix(m, uInvert > 0.5 ? 0.0 : 1.0, settle);

  vec2 cuv = clamp(suv, vec2(0.0), vec2(1.0));
  vec3 media = texture2D(uMedia, cuv).rgb;
  vec2 inR = step(vec2(0.0), suv) * step(suv, vec2(1.0));
  float inside = inR.x * inR.y;
  vec3 col = mix(uBg, media, m * inside);
  gl_FragColor = vec4(col, 1.0);
}
`;

const DEFAULT_MEDIA = "/images/spiral-3d-slider/prism-portrait.jpg";

interface BurnSettings {
  burn: number;
  fit: BurnPlusFit;
  density: number;
  distortion: number;
  edgeSoftness: number;
  noiseScale: number;
  octaves: number;
  seed: number;
  edgeComplexity: number;
  start: number;
  end: number;
  completeAt: number;
  quality: number;
  mobileQuality: number;
  background: string;
  invert: boolean;
  trigger: BurnPlusTrigger;
  direction: BurnPlusDirection;
  autoplay: boolean;
  loop: boolean;
  loopDelay: number;
  delay: number;
  duration: number;
  transition: BurnPlusTransition;
  transitionBezier: [number, number, number, number];
  scrollStart: number;
  scrollEnd: number;
  scrollSmoothing: number;
}

interface SharedMedia {
  bitmap: TexImageSource | null;
  mediaW: number;
  mediaH: number;
  mediaVersion: number;
  uploadedVersion: number;
  video: HTMLVideoElement | null;
  lastVideoTime: number;
}

/* ------------------------------------------------------------------ */
/* component                                                           */
/* ------------------------------------------------------------------ */

export function BurnPlus({
  media = DEFAULT_MEDIA,
  mediaType = "auto",
  fit = "cover",
  burn = 0.7,
  density = 0.5,
  distortion = 0.38,
  edgeSoftness = 0.05,
  noiseScale = 1,
  octaves = 4,
  seed = 1,
  edgeComplexity = 0.6,
  start = 0,
  end = 1,
  completeAt = 1,
  quality = 1.75,
  mobileQuality = 1.25,
  background = "#000000",
  invert = false,
  trigger = "manual",
  direction = "reveal",
  autoplay = true,
  loop = false,
  loopDelay = 1200,
  delay = 0,
  duration = 2000,
  transition = "easeInOut",
  transitionBezier = [0.42, 0, 0.58, 1],
  scrollStart = 0,
  scrollEnd = 1,
  scrollSmoothing = 0.25,
  ariaLabel = "Burn reveal effect",
  className,
  style,
  ...props
}: BurnPlusProps) {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const settingsRef = React.useRef<BurnSettings>({
    burn, fit, density, distortion, edgeSoftness, noiseScale, octaves, seed,
    edgeComplexity, start, end, completeAt, quality, mobileQuality, background, invert,
    trigger, direction, autoplay, loop, loopDelay, delay, duration, transition,
    transitionBezier, scrollStart, scrollEnd, scrollSmoothing,
  });
  settingsRef.current = {
    burn, fit, density, distortion, edgeSoftness, noiseScale, octaves, seed,
    edgeComplexity, start, end, completeAt, quality, mobileQuality, background, invert,
    trigger, direction, autoplay, loop, loopDelay, delay, duration, transition,
    transitionBezier, scrollStart, scrollEnd, scrollSmoothing,
  };
  const sharedRef = React.useRef<SharedMedia>({
    bitmap: null, mediaW: 1, mediaH: 1, mediaVersion: 0,
    uploadedVersion: -1, video: null, lastVideoTime: -1,
  });
  const controlsRef = React.useRef<{
    hover: (inside: boolean) => void;
    tap: () => void;
    retarget: (v: number) => void;
    redraw: () => void;
  } | null>(null);
  const [webglFailed, setWebglFailed] = React.useState(false);
  const [mediaFailed, setMediaFailed] = React.useState(false);

  /* Manual trigger: glide toward the burn prop with the configured easing. */
  React.useEffect(() => {
    if (trigger === "manual") controlsRef.current?.retarget(burn);
  }, [burn, trigger]);

  /* Uniform-only prop changes must repaint even while the loop is idle. */
  React.useEffect(() => {
    controlsRef.current?.redraw();
  }, [
    density, distortion, edgeSoftness, noiseScale, octaves, seed,
    edgeComplexity, start, end, completeAt, background, invert, fit, quality,
    mobileQuality,
  ]);

  /* Renderer: initialized ONCE. Props flow through settingsRef (uniforms),
     media flows through sharedRef (texture upload). */
  React.useEffect(() => {
    if (webglFailed) return;
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const gl = (canvas.getContext("webgl2", { antialias: false, alpha: false }) ||
      canvas.getContext("webgl", { antialias: false, alpha: false })) as WebGLRenderingContext | null;
    if (!gl) {
      setWebglFailed(true);
      return;
    }

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return sh;
    };
    const vertexShader = compile(gl.VERTEX_SHADER, VERT_SHADER);
    const fragmentShader = compile(gl.FRAGMENT_SHADER, FRAG_SHADER);
    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setWebglFailed(true);
      return;
    }

    const buffer = gl.createBuffer();
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
    const u = {
      media: uniform("uMedia"),
      uv: uniform("uUv"),
      resolution: uniform("uResolution"),
      burn: uniform("uBurn"),
      density: uniform("uDensity"),
      distortion: uniform("uDistortion"),
      softness: uniform("uSoftness"),
      seed: uniform("uSeed"),
      time: uniform("uTime"),
      octaves: uniform("uOctaves"),
      detail: uniform("uDetail"),
      noiseScale: uniform("uNoiseScale"),
      bg: uniform("uBg"),
      invert: uniform("uInvert"),
      completeAt: uniform("uCompleteAt"),
    };

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));

    const S = {
      disposed: false,
      frameId: 0,
      running: false,
      visible: true,
      pageVisible: document.visibilityState !== "hidden",
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      coarse: window.matchMedia("(pointer: coarse)").matches,
      time: 0,
      lastFrame: 0,
      current: 0,
      tween: null as null | { from: number; to: number; t0: number; dur: number },
      delayTimer: 0,
      lastProgressAttr: "",
      playedOnce: false,
      imgW: 1,
      imgH: 1,
      uv: { sx: 1, sy: 1, ox: 0, oy: 0 },
      scrollParent: null as HTMLElement | Window | null,
    };

    const easeFor = () => {
      const c = settingsRef.current;
      if (c.transition === "custom") {
        const b = c.transitionBezier;
        return cubicBezier(b[0], b[1], b[2], b[3]);
      }
      return PRESET_EASINGS[c.transition] ?? PRESET_EASINGS.easeInOut!;
    };

    const burnEndpoints = () => {
      const c = settingsRef.current;
      return { a: clamp(c.start, 0, 1), b: clamp(c.end, 0, 1) };
    };

    const writeProgressAttr = (v: number) => {
      const s = v.toFixed(3);
      if (s !== S.lastProgressAttr) {
        S.lastProgressAttr = s;
        host.setAttribute("data-progress", s);
      }
    };

    const updateUv = () => {
      const c = settingsRef.current;
      const cw = Math.max(1, canvas.width);
      const ch = Math.max(1, canvas.height);
      const mw = Math.max(1, S.imgW);
      const mh = Math.max(1, S.imgH);
      let sx = 1;
      let sy = 1;
      if (c.fit !== "fill") {
        const scale =
          c.fit === "cover"
            ? Math.max(cw / mw, ch / mh)
            : Math.min(cw / mw, ch / mh);
        sx = (mw * scale) / cw;
        sy = (mh * scale) / ch;
      }
      S.uv = { sx, sy, ox: 0.5 - 0.5 * sx, oy: 0.5 - 0.5 * sy };
    };

    const syncMedia = () => {
      const shared = sharedRef.current;
      let changed = false;
      if (shared.mediaVersion !== shared.uploadedVersion) {
        shared.uploadedVersion = shared.mediaVersion;
        const bmp = shared.bitmap;
        if (bmp) {
          try {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bmp);
          } catch {
            setMediaFailed(true);
            return false;
          }
        }
        S.imgW = Math.max(1, shared.mediaW);
        S.imgH = Math.max(1, shared.mediaH);
        updateUv();
        changed = true;
      }
      return changed;
    };

    const uploadVideoFrame = () => {
      const v = sharedRef.current.video;
      if (!v || v.readyState < 2 || v.paused || v.ended) return false;
      if (v.currentTime === sharedRef.current.lastVideoTime) return false;
      try {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, v);
      } catch {
        return false;
      }
      sharedRef.current.lastVideoTime = v.currentTime;
      if (v.videoWidth > 0 && (S.imgW !== v.videoWidth || S.imgH !== v.videoHeight)) {
        S.imgW = v.videoWidth;
        S.imgH = v.videoHeight;
        updateUv();
      }
      return true;
    };

    const draw = () => {
      if (S.disposed) return;
      const c = settingsRef.current;
      syncMedia();
      gl.useProgram(program);
      gl.uniform2f(u.resolution, canvas.width, canvas.height);
      gl.uniform4f(u.uv, S.uv.sx, S.uv.sy, S.uv.ox, S.uv.oy);
      gl.uniform1f(u.burn, clamp(S.current, 0, 1));
      gl.uniform1f(u.density, clamp(c.density, 0, 1));
      gl.uniform1f(u.distortion, clamp(c.distortion, 0, 1));
      gl.uniform1f(u.softness, clamp(c.edgeSoftness, 0, 1) * 0.22 + 0.004);
      gl.uniform1f(u.seed, c.seed);
      gl.uniform1f(u.time, S.time);
      gl.uniform1i(u.octaves, Math.round(clamp(c.octaves, 1, 5)));
      gl.uniform1f(u.detail, clamp(c.edgeComplexity, 0, 1));
      gl.uniform1f(u.noiseScale, Math.max(0.05, c.noiseScale));
      const bg = hexToRgb(c.background, [0, 0, 0]);
      gl.uniform3f(u.bg, bg[0], bg[1], bg[2]);
      gl.uniform1f(u.invert, c.invert ? 1 : 0);
      gl.uniform1f(u.completeAt, clamp(c.completeAt, 0, 1));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      writeProgressAttr(S.current);
    };

    const scrollTarget = () => {
      const c = settingsRef.current;
      if (!S.scrollParent) S.scrollParent = findScrollParent(host);
      const parent = S.scrollParent;
      let top: number;
      let view: number;
      const height = host.offsetHeight;
      if (parent instanceof HTMLElement) {
        const pr = parent.getBoundingClientRect();
        const hr = host.getBoundingClientRect();
        top = hr.top - pr.top;
        view = pr.height;
        // Progress of the element box through the container box.
        const raw = view + height <= 0 ? 0 : (view - top) / (view + height);
        const s0 = clamp(c.scrollStart, 0, 1);
        const span = Math.max(1e-6, clamp(c.scrollEnd, 0, 1) - s0);
        return clamp((clamp(raw, 0, 1) - s0) / span, 0, 1);
      }
      const hr = host.getBoundingClientRect();
      top = hr.top;
      view = window.innerHeight;
      const raw = view + height <= 0 ? 0 : (view - top) / (view + height);
      const s0 = clamp(c.scrollStart, 0, 1);
      const span = Math.max(1e-6, clamp(c.scrollEnd, 0, 1) - s0);
      return clamp((clamp(raw, 0, 1) - s0) / span, 0, 1);
    };

    const startTween = (to: number, delayMs: number) => {
      const c = settingsRef.current;
      window.clearTimeout(S.delayTimer);
      if (S.reducedMotion) {
        S.current = clamp(to, 0, 1);
        S.tween = null;
        draw();
        return;
      }
      const begin = () => {
        if (S.disposed) return;
        S.tween = {
          from: S.current,
          to: clamp(to, 0, 1),
          t0: performance.now(),
          dur: Math.max(1, c.duration),
        };
        kick();
      };
      if (delayMs > 0) S.delayTimer = window.setTimeout(begin, delayMs);
      else begin();
    };

    const finishTween = () => {
      const c = settingsRef.current;
      S.tween = null;
      if (S.disposed || !c.loop) return;
      if (c.trigger === "scroll" || c.trigger === "manual") return;
      const { a, b } = burnEndpoints();
      const restart = () => {
        if (S.disposed) return;
        if (c.direction === "alternate") {
          startTween(Math.abs(S.current - b) < 1e-4 ? a : b, 0);
        } else if (c.direction === "hide") {
          S.current = b;
          startTween(a, 0);
        } else {
          S.current = a;
          draw();
          startTween(b, 0);
        }
      };
      S.delayTimer = window.setTimeout(restart, Math.max(0, c.loopDelay));
    };

    const playFromTrigger = (withDelay: boolean) => {
      const c = settingsRef.current;
      const { a, b } = burnEndpoints();
      const d = withDelay ? Math.max(0, c.delay) : 0;
      if (!c.autoplay && withDelay) {
        S.current = c.direction === "hide" ? b : a;
        draw();
        return;
      }
      if (c.direction === "hide") {
        if (withDelay) S.current = b;
        startTween(a, d);
      } else if (c.direction === "alternate") {
        startTween(Math.abs(S.current - b) < 1e-4 ? a : b, d);
      } else {
        if (withDelay) S.current = a;
        startTween(b, d);
      }
    };

    const frame = (now: number) => {
      if (S.disposed) return;
      const c = settingsRef.current;
      const dt = Math.min(0.1, Math.max(0, (now - S.lastFrame) / 1000));
      S.lastFrame = now;
      let drew = false;

      if (c.trigger === "scroll" && !S.reducedMotion) {
        const { a, b } = burnEndpoints();
        const target = a + (b - a) * scrollTarget();
        const alpha = 1 - clamp(c.scrollSmoothing, 0, 0.99);
        const step = c.scrollSmoothing >= 0.99 ? alpha : Math.max(alpha, 0.02);
        const next = S.current + (target - S.current) * step;
        if (Math.abs(next - S.current) > 1e-5) {
          S.current = next;
          S.time += dt * 0.25;
          draw();
          drew = true;
        }
      } else if (S.tween) {
        const tw = S.tween;
        const ease = easeFor();
        const p = clamp((now - tw.t0) / tw.dur, 0, 1);
        S.current = tw.from + (tw.to - tw.from) * ease(p);
        S.time += dt * 0.25;
        draw();
        drew = true;
        if (p >= 1) finishTween();
      }

      if (uploadVideoFrame()) {
        if (!drew) draw();
        drew = true;
      }

      const v = sharedRef.current.video;
      const videoActive = !!v && !v.paused && !v.ended;
      const keepGoing =
        S.visible &&
        S.pageVisible &&
        !S.reducedMotion &&
        (S.tween !== null || c.trigger === "scroll" || videoActive);
      if (keepGoing) {
        S.frameId = requestAnimationFrame(frame);
      } else {
        S.running = false;
        S.frameId = 0;
      }
    };

    const kick = () => {
      if (S.disposed || S.running || !S.visible || !S.pageVisible || S.reducedMotion) return;
      const c = settingsRef.current;
      const v = sharedRef.current.video;
      const videoActive = !!v && !v.paused && !v.ended;
      if (S.tween === null && c.trigger !== "scroll" && !videoActive) return;
      S.running = true;
      S.lastFrame = performance.now();
      S.frameId = requestAnimationFrame(frame);
    };

    const resize = () => {
      const c = settingsRef.current;
      const rect = host.getBoundingClientRect();
      const cap = S.coarse ? Math.max(0.5, c.mobileQuality) : Math.max(0.5, c.quality);
      const dpr = Math.min(window.devicePixelRatio || 1, cap);
      const width = Math.max(1, Math.round(rect.width * dpr));
      const height = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
        updateUv();
      }
      draw();
    };

    controlsRef.current = {
      hover: (inside: boolean) => {
        const c = settingsRef.current;
        if (c.trigger !== "hover" || S.reducedMotion) return;
        const { a, b } = burnEndpoints();
        if (c.direction === "hide") startTween(inside ? a : b, 0);
        else if (c.direction === "alternate")
          startTween(inside ? (Math.abs(S.current - b) < 1e-4 ? a : b) : a, 0);
        else startTween(inside ? b : a, 0);
      },
      tap: () => {
        const c = settingsRef.current;
        if (c.trigger !== "tap" || S.reducedMotion) return;
        const { a, b } = burnEndpoints();
        startTween(S.current < (a + b) / 2 ? b : a, 0);
      },
      retarget: (val: number) => {
        if (S.reducedMotion) {
          S.current = clamp(val, 0, 1);
          draw();
          return;
        }
        S.tween = { from: S.current, to: clamp(val, 0, 1), t0: performance.now(), dur: 500 };
        kick();
      },
      redraw: () => {
        if (S.disposed) return;
        resize();
        kick();
      },
    };

    /* ---- initial state per trigger ---- */
    const c0 = settingsRef.current;
    if (c0.trigger === "manual") {
      S.current = clamp(c0.burn, 0, 1);
    } else {
      const { a, b } = burnEndpoints();
      S.current = c0.direction === "hide" ? b : a;
    }
    if (S.reducedMotion) {
      const { a, b } = burnEndpoints();
      S.current = Math.max(a, b);
    }
    writeProgressAttr(S.current);

    const io = new IntersectionObserver(([entry]) => {
      S.visible = entry?.isIntersecting ?? true;
      const c = settingsRef.current;
      if (S.visible) {
        if (c.trigger === "inview" && c.autoplay && !S.playedOnce) {
          S.playedOnce = true;
          playFromTrigger(true);
        }
        resize();
        kick();
      } else {
        if (S.frameId) {
          cancelAnimationFrame(S.frameId);
          S.frameId = 0;
          S.running = false;
        }
        if (c.trigger === "inview" && c.loop) S.playedOnce = false;
      }
    });
    io.observe(host);

    if (c0.trigger === "load" && c0.autoplay) {
      playFromTrigger(true);
    } else if (c0.trigger === "scroll") {
      const { a, b } = burnEndpoints();
      S.current = a + (b - a) * scrollTarget();
    }

    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const onVisibility = () => {
      S.pageVisible = document.visibilityState !== "hidden";
      if (S.pageVisible) {
        resize();
        kick();
      } else if (S.frameId) {
        cancelAnimationFrame(S.frameId);
        S.frameId = 0;
        S.running = false;
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => {
      S.reducedMotion = mq.matches;
      if (S.reducedMotion) {
        if (S.frameId) cancelAnimationFrame(S.frameId);
        S.frameId = 0;
        S.running = false;
        S.tween = null;
        const { a, b } = burnEndpoints();
        S.current = Math.max(a, b);
        draw();
      } else {
        kick();
      }
    };
    mq.addEventListener("change", onMotion);

    const onContextLost = (event: Event) => {
      event.preventDefault();
      if (S.frameId) cancelAnimationFrame(S.frameId);
      S.frameId = 0;
      S.running = false;
      setWebglFailed(true);
    };
    canvas.addEventListener("webglcontextlost", onContextLost);

    resize();
    if (!S.reducedMotion) kick();

    return () => {
      S.disposed = true;
      controlsRef.current = null;
      if (S.frameId) cancelAnimationFrame(S.frameId);
      window.clearTimeout(S.delayTimer);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      mq.removeEventListener("change", onMotion);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, [webglFailed]);

  /* ---- media loading: element → sharedRef → GL texture (renderer-owned) ---- */
  React.useEffect(() => {
    if (webglFailed) return;
    let cancelled = false;
    const shared = sharedRef.current;
    const isVideo = isVideoSource(media, mediaType);

    const publish = (bitmap: TexImageSource, w: number, h: number, video: HTMLVideoElement | null) => {
      if (cancelled) return;
      shared.bitmap = bitmap;
      shared.mediaW = Math.max(1, w);
      shared.mediaH = Math.max(1, h);
      shared.video = video;
      shared.lastVideoTime = -1;
      shared.mediaVersion += 1;
      // The loop may be parked (static rest state) — force one redraw so
      // freshly arrived media paints immediately instead of going stale.
      controlsRef.current?.redraw();
    };

    if (!isVideo) {
      const img = new Image();
      if (/^https?:/i.test(media)) img.crossOrigin = "anonymous";
      img.onload = () => {
        publish(img, img.naturalWidth || img.width, img.naturalHeight || img.height, null);
      };
      img.onerror = () => {
        if (!cancelled) setMediaFailed(true);
      };
      img.src = media;
      return () => {
        cancelled = true;
      };
    }

    const video = document.createElement("video");
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.autoplay = true;
    video.preload = "auto";
    if (/^https?:/i.test(media)) video.crossOrigin = "anonymous";
    const onCanPlay = () => {
      publish(video, video.videoWidth || 16, video.videoHeight || 9, video);
      video.play().catch(() => undefined);
    };
    const onError = () => {
      if (!cancelled) setMediaFailed(true);
    };
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("error", onError);
    video.src = media;
    video.load();
    return () => {
      cancelled = true;
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("error", onError);
      video.pause();
      video.removeAttribute("src");
      video.load();
      if (shared.video === video) shared.video = null;
    };
  }, [media, mediaType, webglFailed]);

  const fallback = (
    <div
      data-slot="burn-plus"
      role="img"
      aria-label={ariaLabel}
      className={cn("relative h-full w-full overflow-hidden bg-black", className)}
      style={{ backgroundColor: background, ...style }}
      {...props}
    >
      {isVideoSource(media, mediaType) ? (
        <video
          src={media}
          className="block h-full w-full"
          style={{ objectFit: fit === "fill" ? "fill" : fit }}
          autoPlay
          muted
          loop
          playsInline
        />
      ) : (
        <img
          src={media}
          alt=""
          aria-hidden="true"
          className="block h-full w-full"
          style={{ objectFit: fit === "fill" ? "fill" : fit }}
        />
      )}
    </div>
  );

  if (webglFailed || mediaFailed) return fallback;

  return (
    <WebGLErrorBoundary fallback={fallback}>
      <div
        ref={hostRef}
        data-slot="burn-plus"
        data-progress="0.000"
        role="img"
        aria-label={ariaLabel}
        onPointerEnter={() => {
          if (settingsRef.current.trigger === "hover") controlsRef.current?.hover(true);
        }}
        onPointerLeave={() => {
          if (settingsRef.current.trigger === "hover") controlsRef.current?.hover(false);
        }}
        onPointerUp={() => {
          if (settingsRef.current.trigger === "tap") controlsRef.current?.tap();
        }}
        className={cn("relative h-full w-full overflow-hidden bg-black", className)}
        style={{ backgroundColor: background, ...style }}
        {...props}
      >
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="block h-full w-full"
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </WebGLErrorBoundary>
  );
}

export default BurnPlus;

/** Preferred name for new compositions. */
export const AshReveal = BurnPlus;
