"use client";

import * as React from "react";

export interface ElectricVijdiCursorProps {
  /** Main color of the electrical body and bloom. */
  color?: string;
  /** Multiplies the overall brightness of the effect. */
  intensity?: number;
  /** Width of the white-hot center line in pixels. */
  boltWidth?: number;
  /** Multiplies the outer bloom radius. */
  glowSize?: number;
  /** Milliseconds a sampled cursor position remains visible. */
  trailLifetime?: number;
  /** Maximum perpendicular displacement of each bolt node in pixels. */
  jitter?: number;
  /** Controls how often and how far secondary arcs appear. */
  branchIntensity?: number;
  /** Controls the number of short-lived sparks around energetic bends. */
  sparkIntensity?: number;
  /** Multiplies the influence cursor velocity has on the effect. */
  speedResponse?: number;
  /** Rendering detail and DPR cap. */
  quality?: "low" | "medium" | "high";
  /** Stacking order for the non-interactive viewport overlay. */
  zIndex?: number;
  /** Disables the effect without unmounting it. */
  disabled?: boolean;
  /** Optional host that constrains pointer tracking and canvas rendering. */
  containerRef?: React.RefObject<HTMLElement | null>;
  /** Optional class name applied to the canvas. */
  className?: string;
}

type TrailPoint = { x: number; y: number; time: number; velocity: number; seed: number };
type Spark = { x: number; y: number; vx: number; vy: number; born: number; life: number; size: number };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const noise = (seed: number, step: number, phase: number) => {
  const value = Math.sin(seed * 12.9898 + step * 78.233 + phase * 37.719) * 43758.5453;
  return value - Math.floor(value);
};

/** A pointer-transparent canvas that turns recent pointer movement into a violet electrical bolt. */
export function ElectricVijdiCursor({
  color = "#A855F7",
  intensity = 1,
  boltWidth = 1.2,
  glowSize = 1,
  trailLifetime = 240,
  jitter = 9,
  branchIntensity = 1,
  sparkIntensity = 1,
  speedResponse = 1,
  quality = "medium",
  zIndex = 9999,
  disabled = false,
  containerRef,
  className,
}: ElectricVijdiCursorProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const settingsRef = React.useRef({ color, intensity, boltWidth, glowSize, trailLifetime, jitter, branchIntensity, sparkIntensity, speedResponse, quality, zIndex, disabled });
  settingsRef.current = { color, intensity, boltWidth, glowSize, trailLifetime, jitter, branchIntensity, sparkIntensity, speedResponse, quality, zIndex, disabled };

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || disabled || window.matchMedia("(pointer: coarse)").matches) return;
    const container = containerRef?.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const trail: TrailPoint[] = [];
    const sparks: Spark[] = [];
    let frame = 0;
    let running = false;
    let width = 0;
    let height = 0;
    let lastPointer: TrailPoint | null = null;
    let seed = 1;

    const resize = () => {
      const qualityValue = settingsRef.current.quality;
      const dprCap = qualityValue === "low" ? 1 : 2;
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      const bounds = container?.getBoundingClientRect();
      width = bounds?.width ?? window.innerWidth;
      height = bounds?.height ?? window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const wake = () => {
      if (!running) {
        running = true;
        frame = requestAnimationFrame(render);
      }
    };

    const addSample = (x: number, y: number, time: number, velocity: number) => {
      trail.push({ x, y, time, velocity, seed: seed++ });
      if (trail.length > 180) trail.splice(0, trail.length - 180);
      const sparkle = settingsRef.current.sparkIntensity;
      if (sparkle > 0 && velocity > 0.25 && noise(seed, 3, 1) < 0.08 * sparkle) {
        const angle = noise(seed, 4, 1) * Math.PI * 2;
        sparks.push({ x, y, vx: Math.cos(angle) * (0.25 + noise(seed, 5, 1)), vy: Math.sin(angle) * (0.25 + noise(seed, 6, 1)), born: time, life: 80 + noise(seed, 7, 1) * 70, size: 0.6 + noise(seed, 8, 1) * 1.2 });
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (reducedMotion.matches) return;
      const bounds = container?.getBoundingClientRect();
      const pointerX = event.clientX - (bounds?.left ?? 0);
      const pointerY = event.clientY - (bounds?.top ?? 0);
      const now = performance.now();
      if (!lastPointer) {
        addSample(pointerX, pointerY, now, 0);
      } else {
        const dx = pointerX - lastPointer.x;
        const dy = pointerY - lastPointer.y;
        const distance = Math.hypot(dx, dy);
        const elapsed = Math.max(8, now - lastPointer.time);
        const velocity = distance / elapsed;
        const spacing = settingsRef.current.quality === "high" ? 4 : settingsRef.current.quality === "low" ? 7 : 5;
        const steps = Math.max(1, Math.ceil(distance / spacing));
        for (let step = 1; step <= steps; step += 1) {
          const progress = step / steps;
          addSample(lastPointer.x + dx * progress, lastPointer.y + dy * progress, lastPointer.time + elapsed * progress, velocity);
        }
      }
      lastPointer = { x: pointerX, y: pointerY, time: now, velocity: 0, seed: 0 };
      wake();
    };

    const traceBolt = (now: number, phase: number) => {
      const { jitter: baseJitter, trailLifetime: life, speedResponse } = settingsRef.current;
      for (let index = 1; index < trail.length; index += 1) {
        const from = trail[index - 1];
        const to = trail[index];
        if (!from || !to) continue;
        const age = now - to.time;
        if (age < 0 || age > life) continue;
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const length = Math.hypot(dx, dy);
        if (length < 0.1) continue;
        const normalX = -dy / length;
        const normalY = dx / length;
        const detail = settingsRef.current.quality === "high" ? 5 : settingsRef.current.quality === "low" ? 2 : 3;
        const subdivisions = Math.max(2, Math.ceil(length / detail));
        const energy = Math.pow(1 - age / life, 1.55);
        const effectiveJitter = baseJitter * (0.55 + clamp(to.velocity * speedResponse, 0, 1.2) * 0.45) * energy;
        context.moveTo(from.x, from.y);
        for (let node = 1; node < subdivisions; node += 1) {
          const progress = node / subdivisions;
          const envelope = Math.sin(progress * Math.PI);
          const offset = (noise(to.seed, node, phase) * 2 - 1) * effectiveJitter * envelope;
          context.lineTo(from.x + dx * progress + normalX * offset, from.y + dy * progress + normalY * offset);
        }
        context.lineTo(to.x, to.y);
      }
    };

    const render = (now: number) => {
      const settings = settingsRef.current;
      const life = Math.max(100, settings.trailLifetime);
      while (trail[0] && now - trail[0].time > life) trail.shift();
      while (sparks[0] && now - sparks[0].born > sparks[0].life) sparks.shift();
      context.clearRect(0, 0, width, height);
      if (!trail.length && !sparks.length) {
        running = false;
        frame = 0;
        return;
      }

      const phase = Math.floor(now / 32);
      context.save();
      context.globalCompositeOperation = "lighter";
      const passes = [
        { width: (8 + settings.boltWidth * 2) * settings.glowSize, alpha: 0.09 * settings.intensity, blur: 22 * settings.glowSize, stroke: settings.color },
        { width: (2.8 + settings.boltWidth) * settings.glowSize, alpha: 0.44 * settings.intensity, blur: 10 * settings.glowSize, stroke: settings.color },
        { width: settings.boltWidth, alpha: 0.95 * settings.intensity, blur: 4, stroke: "#fffaff" },
      ];
      for (const pass of passes) {
        context.beginPath();
        traceBolt(now, phase);
        context.strokeStyle = pass.stroke;
        context.globalAlpha = pass.alpha * (0.9 + noise(19, 2, phase) * 0.1);
        context.lineWidth = pass.width;
        context.shadowColor = pass.stroke;
        context.shadowBlur = pass.blur;
        context.lineCap = "round";
        context.lineJoin = "round";
        context.stroke();
      }

      // Sparse secondary arcs share the main segment seeds, so they flicker rather than teleport.
      context.lineCap = "round";
      for (let index = 1; index < trail.length; index += 1) {
        const point = trail[index];
        const previous = trail[index - 1];
        if (!point || !previous) continue;
        const age = now - point.time;
        const energy = Math.pow(1 - age / life, 1.55);
        if (age < 0 || energy <= 0 || noise(point.seed, 20, phase) > 0.055 * settings.branchIntensity * energy) continue;
        const dx = point.x - previous.x;
        const dy = point.y - previous.y;
        const length = Math.hypot(dx, dy) || 1;
        const side = noise(point.seed, 21, phase) > 0.5 ? 1 : -1;
        const normalX = (-dy / length) * side;
        const normalY = (dx / length) * side;
        const branchLength = (8 + noise(point.seed, 22, phase) * 16) * settings.branchIntensity * energy;
        context.beginPath();
        context.moveTo(point.x, point.y);
        context.lineTo(point.x + normalX * branchLength * 0.5 + dx / length * 3, point.y + normalY * branchLength * 0.5 + dy / length * 3);
        context.lineTo(point.x + normalX * branchLength, point.y + normalY * branchLength);
        context.strokeStyle = settings.color;
        context.globalAlpha = 0.5 * energy * settings.intensity;
        context.lineWidth = Math.max(0.6, settings.boltWidth * 0.8);
        context.shadowColor = settings.color;
        context.shadowBlur = 8 * settings.glowSize;
        context.stroke();
      }

      for (const spark of sparks) {
        const age = now - spark.born;
        const energy = Math.pow(1 - age / spark.life, 1.7);
        context.globalAlpha = energy * settings.intensity;
        context.fillStyle = "#fffaff";
        context.shadowColor = settings.color;
        context.shadowBlur = 8 * settings.glowSize;
        context.beginPath();
        context.arc(spark.x + spark.vx * age, spark.y + spark.vy * age, spark.size * energy, 0, Math.PI * 2);
        context.fill();
      }

      const head = trail[trail.length - 1];
      if (head) {
        context.globalAlpha = 0.55 * settings.intensity;
        context.fillStyle = settings.color;
        context.shadowColor = settings.color;
        context.shadowBlur = 14 * settings.glowSize;
        context.beginPath();
        context.arc(head.x, head.y, 3.5 * settings.glowSize, 0, Math.PI * 2);
        context.fill();
        context.globalAlpha = settings.intensity;
        context.fillStyle = "#fffaff";
        context.shadowBlur = 5;
        context.beginPath();
        context.arc(head.x, head.y, 1.15 * settings.boltWidth, 0, Math.PI * 2);
        context.fill();
      }
      context.restore();
      frame = requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize);
    if (container) container.addEventListener("pointermove", onPointerMove, { passive: true });
    else window.addEventListener("pointermove", onPointerMove, { passive: true });
    const resetPointer = () => {
      lastPointer = null;
    };
    container?.addEventListener("pointerleave", resetPointer);
    const resizeObserver = container && typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    if (resizeObserver && container) resizeObserver.observe(container);
    const stopForReducedMotion = () => {
      if (reducedMotion.matches) {
        trail.length = 0;
        sparks.length = 0;
        context.clearRect(0, 0, width, height);
      }
    };
    reducedMotion.addEventListener("change", stopForReducedMotion);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      if (container) container.removeEventListener("pointermove", onPointerMove);
      else window.removeEventListener("pointermove", onPointerMove);
      container?.removeEventListener("pointerleave", resetPointer);
      resizeObserver?.disconnect();
      reducedMotion.removeEventListener("change", stopForReducedMotion);
    };
  }, [containerRef, disabled, quality]);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} style={{ position: containerRef ? "absolute" : "fixed", inset: 0, pointerEvents: "none", zIndex, background: "transparent" }} />;
}
