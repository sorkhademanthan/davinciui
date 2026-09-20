"use client";

import * as React from "react";

export interface ChromaticCursorProps {
  /** Maximum number of samples retained in each colored trail. */
  trailLength?: number;
  /** Perpendicular RGB separation in pixels. */
  splitDistance?: number;
  /** Trail fade rate from 0.05 (long) to 1 (quick). */
  fadeSpeed?: number;
  /** Cursor head radius and stroke scale in pixels. */
  size?: number;
  /** Follow smoothing from 0.05 (soft) to 1 (direct). */
  tension?: number;
  /** Red channel color. */
  red?: string;
  /** Green channel color. */
  green?: string;
  /** Blue channel color. */
  blue?: string;
  /** Hide the native cursor while the effect is active. */
  hideSystemCursor?: boolean;
  /** Optional host that constrains pointer tracking and canvas rendering. */
  containerRef?: React.RefObject<HTMLElement | null>;
  /** Stacking order for the pointer-transparent overlay. */
  zIndex?: number;
  /** Disables the effect without unmounting it. */
  disabled?: boolean;
  /** Optional class name applied to the canvas. */
  className?: string;
}

type Point = { x: number; y: number; time: number };
type Channel = { color: string; direction: number };

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

/** A lightweight RGB canvas cursor with softly split, glowing trails. */
export function ChromaticCursor({
  trailLength = 64,
  splitDistance = 4,
  fadeSpeed = 0.1,
  size = 8,
  tension = 0.2,
  red = "#FF3C3C",
  green = "#78FFA0",
  blue = "#0095FF",
  hideSystemCursor = false,
  containerRef,
  zIndex = 9999,
  disabled = false,
  className,
}: ChromaticCursorProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const settingsRef = React.useRef({ trailLength, splitDistance, fadeSpeed, size, tension, red, green, blue });
  settingsRef.current = { trailLength, splitDistance, fadeSpeed, size, tension, red, green, blue };

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || disabled || window.matchMedia("(pointer: coarse)").matches) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const container = containerRef?.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const cursorStyle = document.createElement("style");
    const trail: Point[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let running = false;
    let hasPointer = false;
    let smoothX = 0;
    let smoothY = 0;
    let targetX = 0;
    let targetY = 0;

    const resize = () => {
      const bounds = container?.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = bounds?.width ?? window.innerWidth;
      height = bounds?.height ?? window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const setNativeCursor = (hidden: boolean) => {
      if (!hideSystemCursor) return;
      if (hidden) {
        cursorStyle.textContent = container
          ? "[data-chromatic-cursor-active], [data-chromatic-cursor-active] * { cursor: none !important; }"
          : "html.chromatic-cursor-active, html.chromatic-cursor-active * { cursor: none !important; }";
        document.head.appendChild(cursorStyle);
        if (container) container.setAttribute("data-chromatic-cursor-active", "");
        else document.documentElement.classList.add("chromatic-cursor-active");
      } else {
        cursorStyle.remove();
        if (container) container.removeAttribute("data-chromatic-cursor-active");
        else document.documentElement.classList.remove("chromatic-cursor-active");
      }
    };

    const wake = () => {
      if (!running) {
        running = true;
        frame = requestAnimationFrame(render);
      }
    };

    const move = (event: PointerEvent) => {
      if (reducedMotion.matches) return;
      const bounds = container?.getBoundingClientRect();
      targetX = event.clientX - (bounds?.left ?? 0);
      targetY = event.clientY - (bounds?.top ?? 0);
      if (!hasPointer) {
        smoothX = targetX;
        smoothY = targetY;
        hasPointer = true;
      }
      wake();
    };

    const drawChannel = (points: Point[], channel: Channel, alpha: number, settings: typeof settingsRef.current) => {
      if (points.length < 2) return;
      context.save();
      context.globalCompositeOperation = "lighter";
      context.globalAlpha = alpha;
      context.strokeStyle = channel.color;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.lineWidth = Math.max(1.15, settings.size * 0.26);
      context.shadowColor = channel.color;
      context.shadowBlur = settings.size * 0.9;
      context.setLineDash([Math.max(5, settings.size * 1.35), Math.max(4, settings.size * 0.85)]);
      context.beginPath();
      points.forEach((point, index) => {
        const before = points[Math.max(0, index - 1)] ?? point;
        const after = points[Math.min(points.length - 1, index + 1)] ?? point;
        const dx = after.x - before.x;
        const dy = after.y - before.y;
        const length = Math.hypot(dx, dy) || 1;
        const offsetX = (-dy / length) * settings.splitDistance * channel.direction;
        const offsetY = (dx / length) * settings.splitDistance * channel.direction;
        if (index === 0) context.moveTo(point.x + offsetX, point.y + offsetY);
        else {
          const previous = points[index - 1] ?? point;
          const midpointX = (previous.x + point.x) / 2 + offsetX;
          const midpointY = (previous.y + point.y) / 2 + offsetY;
          context.quadraticCurveTo(previous.x + offsetX, previous.y + offsetY, midpointX, midpointY);
        }
      });
      context.stroke();
      context.setLineDash([]);
      context.restore();
    };

    const render = (now: number) => {
      const settings = settingsRef.current;
      const lifetime = 340 + (1 - clamp(settings.fadeSpeed, 0.05, 1)) * 1060;
      const ease = clamp(settings.tension, 0.05, 1) * 0.38;
      if (hasPointer) {
        smoothX += (targetX - smoothX) * ease;
        smoothY += (targetY - smoothY) * ease;
        const previous = trail[trail.length - 1];
        if (!previous || Math.hypot(smoothX - previous.x, smoothY - previous.y) > 0.75) {
          trail.push({ x: smoothX, y: smoothY, time: now });
        }
      }
      const maximum = Math.max(8, Math.round(settings.trailLength));
      if (trail.length > maximum) trail.splice(0, trail.length - maximum);
      while (trail[0] && now - trail[0].time > lifetime) trail.shift();
      context.clearRect(0, 0, width, height);

      if (!trail.length) {
        running = false;
        frame = 0;
        return;
      }

      const visible = trail.filter((point) => now - point.time <= lifetime);
      const head = visible[visible.length - 1];
      const age = head ? clamp(1 - (now - head.time) / lifetime, 0, 1) : 0;
      const channels: Channel[] = [
        { color: settings.red, direction: 1 },
        { color: settings.green, direction: 0 },
        { color: settings.blue, direction: -1 },
      ];
      channels.forEach((channel) => drawChannel(visible, channel, 0.9 * age, settings));
      drawChannel(visible, { color: "#ffffff", direction: 0 }, 0.92 * age, { ...settings, splitDistance: 0, size: settings.size * 0.56 });

      if (head) {
        context.save();
        context.globalCompositeOperation = "lighter";
        const radius = Math.max(2.5, settings.size * 0.55);
        const glow = context.createRadialGradient(head.x, head.y, 0, head.x, head.y, radius * 2.6);
        glow.addColorStop(0, "rgba(255,255,255,0.95)");
        glow.addColorStop(0.18, "rgba(255,255,255,0.52)");
        glow.addColorStop(0.48, "rgba(123,243,255,0.22)");
        glow.addColorStop(1, "rgba(123,243,255,0)");
        context.fillStyle = glow;
        context.beginPath();
        context.arc(head.x, head.y, radius * 2.6, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = "#ffffff";
        context.shadowColor = "#ffffff";
        context.shadowBlur = radius * 1.4;
        context.beginPath();
        context.arc(head.x, head.y, radius * 0.42, 0, Math.PI * 2);
        context.fill();
        context.restore();
      }

      frame = requestAnimationFrame(render);
    };

    const clearForReducedMotion = () => {
      if (!reducedMotion.matches) return;
      trail.length = 0;
      hasPointer = false;
      context.clearRect(0, 0, width, height);
    };

    resize();
    setNativeCursor(true);
    if (container) container.addEventListener("pointermove", move, { passive: true });
    else window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("resize", resize);
    const resizeObserver = container && typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    if (resizeObserver && container) resizeObserver.observe(container);
    reducedMotion.addEventListener("change", clearForReducedMotion);

    return () => {
      cancelAnimationFrame(frame);
      setNativeCursor(false);
      if (container) container.removeEventListener("pointermove", move);
      else window.removeEventListener("pointermove", move);
      window.removeEventListener("resize", resize);
      resizeObserver?.disconnect();
      reducedMotion.removeEventListener("change", clearForReducedMotion);
    };
  }, [containerRef, disabled, hideSystemCursor]);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} style={{ position: containerRef ? "absolute" : "fixed", inset: 0, pointerEvents: "none", zIndex, background: "transparent" }} />;
}
