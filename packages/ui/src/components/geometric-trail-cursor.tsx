"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

/* =====================================================================================
 * GeometricTrailCursor — a procedural wireframe cursor-history renderer.
 *
 * Pointer movement extrudes twisting chains of outlined polygons (triangles →
 * hexagons) along the exact cursor path. The newest geometry renders in a bright
 * active color; older geometry settles into a dark ghost wireframe that persists
 * long enough to build a dense geometric skeleton of where the cursor has been.
 *
 * Single canvas, single rAF loop, zero React state in the hot path.
 * =================================================================================== */

export type GeometricTrailCursorPalette =
  | "cyan"
  | "lime"
  | "yellow"
  | "purple"
  | "red"
  | "white";

export const GEOMETRIC_TRAIL_CURSOR_PRESETS: Record<
  GeometricTrailCursorPalette,
  string
> = {
  cyan: "#22D3EE",
  lime: "#A3E635",
  yellow: "#FACC15",
  purple: "#C084FC",
  red: "#F87171",
  white: "#F4F4F5",
};

export interface GeometricTrailCursorProps {
  /** Stroke color for the newest geometry around the pointer. */
  activeColor?: string;
  /** Cycle newly emitted shapes through hues derived from `activeColor`. */
  colorCycle?: boolean;
  /** Hue rotation rate in degrees per second when `colorCycle` is enabled. */
  colorCycleSpeed?: number;
  /** Wireframe color the trail settles into after the active phase. */
  ghostColor?: string;
  /** Canvas clear color. */
  backgroundColor?: string;
  /** Minimum polygon diameter in CSS pixels. */
  minSize?: number;
  /** Maximum polygon diameter in CSS pixels (fast flicks reach this). */
  maxSize?: number;
  /** Distance in CSS pixels between emitted shapes along the path. */
  spacing?: number;
  /** Multiplier on the number of shapes emitted per distance travelled. */
  density?: number;
  /** How strongly pointer speed inflates polygon size. */
  velocityScale?: number;
  /** Per-shape rotation step along a chain (radians) — the tunnel twist. */
  rotationAmount?: number;
  /** How long newborn geometry stays bright, in milliseconds. */
  activeDuration?: number;
  /** How quickly vivid shapes settle into the dark wireframe, in milliseconds. */
  colorFadeDuration?: number;
  /** How long aged geometry persists as a ghost, in milliseconds. */
  ghostDuration?: number;
  /**
   * 0–1 shortcut for trail longevity. Maps to
   * `4000 + persistence * 20000` ms of ghost life unless `ghostDuration`
   * is set explicitly.
   */
  persistence?: number;
  /** Base stroke width in CSS pixels (active shapes render slightly thicker). */
  strokeWidth?: number;
  /** Subtle shadowBlur applied only to the bright active head (0 = off). */
  glow?: number;
  /** Minimum polygon side count. */
  minSides?: number;
  /** Maximum polygon side count. */
  maxSides?: number;
  /** Oldest shapes are dropped first once the buffer is full. */
  maxShapes?: number;
  /** Master switch — when false nothing is tracked or drawn. */
  enabled?: boolean;
  /** Honor `prefers-reduced-motion` by freezing trail generation. */
  respectReducedMotion?: boolean;
  /** Generate trails from touch movement (default off; desktop is priority). */
  enableTouch?: boolean;
  /** Stacking order of the pointer-transparent overlay. */
  zIndex?: number;
  /** Constrain tracking + rendering to a positioned host. Defaults to viewport. */
  containerRef?: React.RefObject<HTMLElement | null>;
  /** Extra class applied to the overlay wrapper. */
  className?: string;
  /** Optional canvas style overrides. */
  style?: React.CSSProperties;
  /** Content layered above the effect. */
  children?: React.ReactNode;
}

interface TrailShape {
  x: number;
  y: number;
  /** Current animated diameter. */
  size: number;
  targetSize: number;
  rotation: number;
  rotationVelocity: number;
  /** Direction of travel when spawned (for anisotropic stretch). */
  direction: number;
  stretch: number;
  sides: number;
  /** Per-vertex radius multiplier (0.8–1.2) for slightly distorted forms. */
  jitter: number[];
  color: [number, number, number];
  vx: number;
  vy: number;
  scale: number;
  birth: number;
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

const rand = (min: number, max: number) => min + Math.random() * (max - min);

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const colorCache = new Map<string, [number, number, number]>();

function hexToRgb(color: string): [number, number, number] {
  const c = color.trim();
  const cached = colorCache.get(c);
  if (cached) return cached;

  let result: [number, number, number] | null = null;
  // #rgb / #rrggbb fast path.
  const hex = c.replace(/^#/, "");
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((ch) => ch + ch)
          .join("")
      : hex;
  if (/^[0-9a-fA-F]{6}$/.test(full)) {
    result = [
      parseInt(full.slice(0, 2), 16),
      parseInt(full.slice(2, 4), 16),
      parseInt(full.slice(4, 6), 16),
    ];
  } else {
    // rgb()/rgba() fallback.
    const m = c.match(
      /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i,
    );
    if (m) {
      result = [
      clamp(parseInt(m[1] ?? "0", 10), 0, 255),
      clamp(parseInt(m[2] ?? "0", 10), 0, 255),
      clamp(parseInt(m[3] ?? "0", 10), 0, 255),
      ];
    } else if (typeof document !== "undefined") {
      // Resolve named colors / hsl() once per value, outside the animation hot path.
      const el = document.createElement("span");
      el.style.color = c;
      if (el.style.color) result = hexToRgbProbe(el.style.color);
    }
  }

  const parsed = result ?? [34, 211, 238];
  // Keep user-supplied dynamic colors from growing the cache without bound.
  if (colorCache.size >= 64) colorCache.clear();
  colorCache.set(c, parsed);
  return parsed;
}

function rotateHue([r, g, b]: [number, number, number], degrees: number) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  let hue = 0;
  const lightness = (max + min) / 2;
  let saturation = 0;

  if (delta > 0) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1));
    if (max === red) hue = ((green - blue) / delta) % 6;
    else if (max === green) hue = (blue - red) / delta + 2;
    else hue = (red - green) / delta + 4;
    hue *= 60;
  }

  hue = ((hue + degrees) % 360 + 360) % 360;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const section = hue / 60;
  const x = chroma * (1 - Math.abs((section % 2) - 1));
  let rgb: [number, number, number];
  if (section < 1) rgb = [chroma, x, 0];
  else if (section < 2) rgb = [x, chroma, 0];
  else if (section < 3) rgb = [0, chroma, x];
  else if (section < 4) rgb = [0, x, chroma];
  else if (section < 5) rgb = [x, 0, chroma];
  else rgb = [chroma, 0, x];
  const match = lightness - chroma / 2;
  return rgb.map((channel) => Math.round((channel + match) * 255)) as [
    number,
    number,
    number,
  ];
}

let probeCanvas: HTMLCanvasElement | null = null;

function hexToRgbProbe(cssColor: string): [number, number, number] | null {
  try {
    if (!probeCanvas) probeCanvas = document.createElement("canvas");
    const ctx = probeCanvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#000000";
    ctx.fillStyle = cssColor;
    const out = ctx.fillStyle as string;
    const m = out.match(
      /^#([0-9a-f]{6})$/i,
    );
    if (m?.[1]) {
      const h = m[1];
      return [
        parseInt(h.slice(0, 2), 16),
        parseInt(h.slice(2, 4), 16),
        parseInt(h.slice(4, 6), 16),
      ];
    }
    const rgb = out.match(
      /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i,
    );
    if (rgb) {
      return [
        clamp(parseInt(rgb[1] ?? "0", 10), 0, 255),
        clamp(parseInt(rgb[2] ?? "0", 10), 0, 255),
        clamp(parseInt(rgb[3] ?? "0", 10), 0, 255),
      ];
    }
  } catch {
    return null;
  }
  return null;
}

/** Weighted 3–6 side pick so chains mix triangles, quads, pentagons, hexagons. */
function pickSides(min: number, max: number): number {
  const lo = clamp(Math.round(min), 3, 8);
  const hi = clamp(Math.round(max), lo, 8);
  if (hi <= lo) return lo;
  const span = hi - lo + 1;
  // Bias toward 3/4 when the range covers the classic 3–6 window.
  const weights = [0.3, 0.3, 0.2, 0.2, 0.12, 0.12];
  let total = 0;
  for (let i = 0; i < span; i++) total += weights[i] ?? 0.12;
  let r = Math.random() * total;
  for (let i = 0; i < span; i++) {
    r -= weights[i] ?? 0.12;
    if (r <= 0) return lo + i;
  }
  return hi;
}

export function GeometricTrailCursor({
  activeColor = GEOMETRIC_TRAIL_CURSOR_PRESETS.cyan,
  colorCycle = true,
  colorCycleSpeed = 40,
  ghostColor = "#181818",
  backgroundColor = "#000000",
  minSize = 16,
  maxSize = 150,
  spacing = 16,
  density = 1,
  velocityScale = 1.4,
  rotationAmount = 0.15,
  activeDuration = 180,
  colorFadeDuration = 520,
  ghostDuration,
  persistence = 0.9,
  strokeWidth = 1.5,
  glow = 6,
  minSides = 3,
  maxSides = 6,
  maxShapes = 1200,
  enabled = true,
  respectReducedMotion = true,
  enableTouch = false,
  zIndex = 50,
  containerRef,
  className,
  style,
  children,
}: GeometricTrailCursorProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const hostRef = React.useRef<HTMLDivElement | null>(null);

  const settingsRef = React.useRef({
    activeColor,
    colorCycle,
    colorCycleSpeed,
    ghostColor,
    backgroundColor,
    minSize,
    maxSize,
    spacing,
    density,
    velocityScale,
    rotationAmount,
    activeDuration,
    colorFadeDuration,
    ghostDuration: ghostDuration ?? 4000 + clamp(persistence, 0, 1) * 20000,
    strokeWidth,
    glow,
    minSides,
    maxSides,
    maxShapes,
    enabled,
    enableTouch,
  });
  settingsRef.current = {
    activeColor,
    colorCycle,
    colorCycleSpeed,
    ghostColor,
    backgroundColor,
    minSize,
    maxSize,
    spacing,
    density,
    velocityScale,
    rotationAmount,
    activeDuration,
    colorFadeDuration,
    ghostDuration: ghostDuration ?? 4000 + clamp(persistence, 0, 1) * 20000,
    strokeWidth,
    glow,
    minSides,
    maxSides,
    maxShapes,
    enabled,
    enableTouch,
  };
  const containerRefRef = React.useRef(containerRef);
  containerRefRef.current = containerRef;

  React.useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const canvas: HTMLCanvasElement = canvasEl;
    const context = canvas.getContext("2d");
    if (!context) return;
    const ctx: CanvasRenderingContext2D = context;

    const reducedQuery =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;
    if (respectReducedMotion && reducedQuery?.matches) {
      // Reduced motion: paint a clean background once and stay still.
      const paint = () => {
        const s = settingsRef.current;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const host = containerRefRef.current?.current ?? null;
        const w = host ? host.clientWidth : window.innerWidth;
        const h = host ? host.clientHeight : window.innerHeight;
        canvas.width = Math.max(1, Math.floor(w * dpr));
        canvas.height = Math.max(1, Math.floor(h * dpr));
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.fillStyle = s.backgroundColor;
        ctx.fillRect(0, 0, w, h);
      };
      paint();
      return;
    }

    const shapes: TrailShape[] = [];
    const animationStart = performance.now();
    const pointer = {
      x: 0,
      y: 0,
      has: false,
      lastEventTime: 0,
    };
    let sequence = 0;
    let prevSize = 0;
    let distanceSinceShape = 0;
    let hasPrevEmission = false;
    let raf = 0;
    let disposed = false;
    let cssW = 1;
    let cssH = 1;
    const disposables: Array<() => void> = [];

    const on = (
      target: Window | Document | HTMLElement,
      type: string,
      listener: EventListener,
      options?: AddEventListenerOptions,
    ) => {
      target.addEventListener(type, listener, options);
      disposables.push(() =>
        target.removeEventListener(type, listener, options),
      );
    };

    const activeRgb = { current: hexToRgb(settingsRef.current.activeColor) };
    const ghostRgb = { current: hexToRgb(settingsRef.current.ghostColor) };

    function resize() {
      const host = containerRefRef.current?.current ?? null;
      if (host) {
        const rect = host.getBoundingClientRect();
        cssW = Math.max(1, rect.width);
        cssH = Math.max(1, rect.height);
      } else {
        cssW = Math.max(1, window.innerWidth);
        cssH = Math.max(1, window.innerHeight);
      }
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.floor(cssW * dpr));
      const h = Math.max(1, Math.floor(cssH * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function toLocal(clientX: number, clientY: number) {
      const host = containerRefRef.current?.current ?? null;
      if (host) {
        const rect = host.getBoundingClientRect();
        if (
          clientX < rect.left ||
          clientX > rect.right ||
          clientY < rect.top ||
          clientY > rect.bottom
        ) {
          return null;
        }
        return { x: clientX - rect.left, y: clientY - rect.top };
      }
      return { x: clientX, y: clientY };
    }

    function spawnPolygon(
      x: number,
      y: number,
      speed: number,
      direction: number,
      now: number,
    ) {
      const s = settingsRef.current;
      const lo = Math.min(s.minSize, s.maxSize);
      const hi = Math.max(s.minSize, s.maxSize);
      const base = clamp(22, lo, hi);
      let target = base + speed * s.velocityScale;
      target = clamp(target, lo, hi) * rand(0.75, 1.25);
      target = clamp(target, lo, hi);

      // Interpolate against the previously emitted shape so chains feel
      // continuous instead of like unrelated stamps.
      if (hasPrevEmission) {
        target = lerp(prevSize, target, 0.65);
      }

      const sides = pickSides(s.minSides, s.maxSides);
      const jitter: number[] = [];
      for (let i = 0; i < sides; i++) jitter.push(rand(0.9, 1.1));

      const color = s.colorCycle
        ? rotateHue(
            activeRgb.current,
            s.colorCycleSpeed * ((now - animationStart) / 1000),
          )
        : activeRgb.current;

      const step = s.rotationAmount * (1 + Math.min(1, speed / 60) * 0.6);
      const rotation =
        direction + sequence * step + rand(-0.22, 0.22) + (hasPrevEmission ? 0 : rand(0, Math.PI * 2));
      const stretch = 1 + Math.min(0.85, speed * 0.011);

      shapes.push({
        x,
        y,
        size: target * 0.55,
        targetSize: target,
        rotation,
        rotationVelocity: rand(-0.004, 0.004),
        direction,
        stretch,
        sides,
        jitter,
        color,
        // Anchored to the exact cursor path — no positional drift so the
        // ghost skeleton matches where the pointer actually travelled.
        vx: 0,
        vy: 0,
        scale: 0.55,
        birth: now,
      });

      prevSize = target;
      hasPrevEmission = true;
      sequence += 1;

      const cap = Math.max(50, Math.round(s.maxShapes));
      if (shapes.length > cap) {
        shapes.splice(0, shapes.length - cap);
      }
    }

    function handleMove(clientX: number, clientY: number, time: number) {
      const s = settingsRef.current;
      if (!s.enabled || disposed) return;
      const local = toLocal(clientX, clientY);
      if (!local) {
        pointer.has = false;
        hasPrevEmission = false;
        distanceSinceShape = 0;
        return;
      }
      const now = time;

      if (!pointer.has) {
        pointer.x = local.x;
        pointer.y = local.y;
        pointer.has = true;
        pointer.lastEventTime = now;
        hasPrevEmission = false;
        distanceSinceShape = 0;
        // Anchor one shape immediately under the cursor so the trail starts
        // exactly where the pointer is, not one event late.
        spawnPolygon(local.x, local.y, 0, 0, now);
        return;
      }

      const dx = local.x - pointer.x;
      const dy = local.y - pointer.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 0.5) {
        // Micro-move: keep the head exactly on the cursor and keep the
        // clock fresh so the next speed sample doesn't spike.
        pointer.x = local.x;
        pointer.y = local.y;
        pointer.lastEventTime = now;
        return;
      }

      const dt = Math.max(1, now - pointer.lastEventTime);
      // Normalize to ~per-frame pixels so size response is refresh-rate stable.
      const speed = (distance / dt) * 16.667;
      const direction = Math.atan2(dy, dx);
      const gap = Math.max(2, s.spacing) / Math.max(0.1, s.density);
      const effectiveGap = Math.max(gap, distance / 40);
      let travelled = effectiveGap - distanceSinceShape;
      let count = 0;
      while (travelled <= distance && count < 40) {
        spawnPolygon(
          pointer.x + dx * (travelled / distance),
          pointer.y + dy * (travelled / distance),
          speed,
          direction,
          now,
        );
        travelled += effectiveGap;
        count += 1;
      }
      distanceSinceShape = (distanceSinceShape + distance) % effectiveGap;

      pointer.x = local.x;
      pointer.y = local.y;
      pointer.lastEventTime = now;
    }

    const onPointerMove = (e: PointerEvent) => {
      const s = settingsRef.current;
      if (e.pointerType === "touch" && !s.enableTouch) return;
      // Use a single clock (performance.now) for events + aging so the
      // head and the trail never disagree about "now".
      handleMove(e.clientX, e.clientY, performance.now());
    };
    const onPointerDown = (e: PointerEvent) => {
      const s = settingsRef.current;
      if (e.pointerType === "touch" && !s.enableTouch) return;
      // A press starts a new stroke — snap so no sweep is drawn from the old spot.
      const local = toLocal(e.clientX, e.clientY);
      if (!local) return;
      pointer.x = local.x;
      pointer.y = local.y;
      pointer.has = true;
      pointer.lastEventTime = performance.now();
      hasPrevEmission = false;
      distanceSinceShape = 0;
      spawnPolygon(local.x, local.y, 0, 0, performance.now());
    };
    const onPointerLeave = () => {
      pointer.has = false;
      hasPrevEmission = false;
      distanceSinceShape = 0;
    };
    const onBlur = () => {
      pointer.has = false;
      hasPrevEmission = false;
      distanceSinceShape = 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      const s = settingsRef.current;
      if (!s.enableTouch) return;
      const touch = e.touches[0];
      if (!touch) return;
      handleMove(touch.clientX, touch.clientY, performance.now());
    };

    const observedHost = containerRefRef.current?.current ?? null;

    // Container previews track their own host directly. Viewport mode keeps
    // the window listener, avoiding duplicate handling as host events bubble.
    if (observedHost) {
      on(observedHost, "pointermove", onPointerMove as EventListener, {
        passive: true,
      });
      on(observedHost, "pointerdown", onPointerDown as EventListener, {
        passive: true,
      });
      on(observedHost, "pointerleave", onPointerLeave as EventListener);
    } else {
      on(window, "pointermove", onPointerMove as EventListener, {
        passive: true,
      });
      on(window, "pointerdown", onPointerDown as EventListener, {
        passive: true,
      });
    }
    on(document.documentElement, "pointerleave", onPointerLeave as EventListener);
    on(window, "blur", onBlur as EventListener);
    on(window, "touchmove", onTouchMove as EventListener, { passive: true });
    on(window, "resize", resize as EventListener);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && observedHost) {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(observedHost);
    }

    resize();
    activeRgb.current = hexToRgb(settingsRef.current.activeColor);
    ghostRgb.current = hexToRgb(settingsRef.current.ghostColor);

    const TAU = Math.PI * 2;
    let lastFrame = performance.now();

    function frame(now: number) {
      if (disposed) return;
      raf = requestAnimationFrame(frame);
      const s = settingsRef.current;
      const dtMs = clamp(now - lastFrame, 0, 50);
      lastFrame = now;
      const dtScale = dtMs / 16.667;

      activeRgb.current = hexToRgb(s.activeColor);
      ghostRgb.current = hexToRgb(s.ghostColor);
      const [gr, gg, gb] = ghostRgb.current;

      const totalGhost = Math.max(500, s.ghostDuration);
      const activeMs = Math.max(120, s.activeDuration);
      const colorFadeMs = Math.max(120, s.colorFadeDuration);
      const fadeMs = Math.min(5000, totalGhost * 0.28);

      // Cull fully expired shapes (oldest first).
      while (shapes.length > 0) {
        const oldest = shapes[0];
        if (!oldest) break;
        if (now - oldest.birth > activeMs + totalGhost + fadeMs) {
          shapes.shift();
        } else break;
      }

      ctx.fillStyle = s.backgroundColor;
      ctx.fillRect(0, 0, cssW, cssH);
      ctx.lineJoin = "miter";
      ctx.miterLimit = 4;

      const baseWidth = Math.max(0.5, s.strokeWidth);
      const glowRadius = Math.max(0, s.glow);

      for (let idx = 0; idx < shapes.length; idx++) {
        const sh = shapes[idx];
        if (!sh) continue;
        const age = now - sh.birth;

        // Subtle evolution — shapes stay anchored to the exact emission
        // point (no x/y drift) so the trail matches the cursor path 1:1.
        // Only rotation/scale settle; position never leaves the path.
        sh.rotation += sh.rotationVelocity * dtScale;
        sh.scale += (1 - sh.scale) * Math.min(1, 0.09 * dtScale);
        sh.size += (sh.targetSize * sh.scale - sh.size) * Math.min(1, 0.18 * dtScale);

        let r: number;
        let g: number;
        let b: number;
        let alpha: number;
        let width: number;
        let shadow = 0;

        if (age <= activeMs) {
          const k = clamp(age / activeMs, 0, 1);
          [r, g, b] = sh.color;
          alpha = lerp(1, 0.72, k);
          width = baseWidth * lerp(1.3, 1.05, k);
          shadow = glowRadius * (1 - k * 0.55);
        } else {
          const gt = (age - activeMs) / totalGhost;
          const blend = clamp((age - activeMs) / colorFadeMs, 0, 1);
          const e = blend * blend * (3 - 2 * blend);
          r = lerp(sh.color[0], gr, e);
          g = lerp(sh.color[1], gg, e);
          b = lerp(sh.color[2], gb, e);
          alpha = lerp(0.78, 0.62, e);
          width = baseWidth * lerp(1.05, 0.8, e);
          shadow = glowRadius * Math.max(0, 1 - blend * 2.5);
          if (gt > 1) {
            const ft = clamp((age - activeMs - totalGhost) / fadeMs, 0, 1);
            alpha *= 1 - ft;
            if (alpha <= 0.004) continue;
          }
        }

        const radius = Math.max(0.5, (sh.size * 0.5) / Math.sqrt(sh.stretch));
        const wX = sh.stretch;

        ctx.save();
        ctx.translate(sh.x, sh.y);
        ctx.rotate(sh.direction);
        ctx.scale(wX, 1);
        ctx.beginPath();
        const rel = sh.rotation - sh.direction;
        for (let v = 0; v < sh.sides; v++) {
          const ang = rel + (v / sh.sides) * TAU;
          const rr = radius * (sh.jitter[v] ?? 1);
          const px = Math.cos(ang) * rr;
          const py = Math.sin(ang) * rr;
          if (v === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
        ctx.lineWidth = width;
        if (shadow > 0.3) {
          ctx.shadowColor = `rgb(${Math.round(sh.color[0])},${Math.round(sh.color[1])},${Math.round(sh.color[2])})`;
          ctx.shadowBlur = shadow;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
        ctx.restore();
      }

      if (pointer.has && s.enabled) {
        const headColor = s.colorCycle
          ? rotateHue(
              activeRgb.current,
              s.colorCycleSpeed * ((now - animationStart) / 1000),
            )
          : activeRgb.current;
        ctx.save();
        ctx.translate(pointer.x, pointer.y);
        ctx.rotate(now * 0.0015);
        ctx.beginPath();
        ctx.rect(-4, -4, 8, 8);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = `rgb(${headColor[0]},${headColor[1]},${headColor[2]})`;
        ctx.lineWidth = 1.15;
        ctx.shadowColor = ctx.strokeStyle;
        ctx.shadowBlur = Math.max(2, glowRadius);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 1.25, 0, TAU);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    }

    raf = requestAnimationFrame((t) => {
      lastFrame = t;
      raf = requestAnimationFrame(frame);
    });

    const onVisibility = () => {
      lastFrame = performance.now();
    };
    document.addEventListener("visibilitychange", onVisibility);
    disposables.push(() =>
      document.removeEventListener("visibilitychange", onVisibility),
    );

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      for (const dispose of disposables) {
        try {
          dispose();
        } catch {
          /* noop */
        }
      }
      resizeObserver?.disconnect();
    };
    // Live-update everything through settingsRef; only structural inputs re-init.
  }, [containerRef, respectReducedMotion]);

  const isFixed = !containerRef;

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      data-slot="geometric-trail-cursor"
      className={cn(
        "pointer-events-none overflow-hidden",
        isFixed ? "fixed inset-0" : "absolute inset-0",
        className,
      )}
      style={{ zIndex, backgroundColor, ...style }}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 block h-full w-full"
      />
      {children ? (
        <div className="pointer-events-none absolute inset-0">{children}</div>
      ) : null}
    </div>
  );
}

export default GeometricTrailCursor;
