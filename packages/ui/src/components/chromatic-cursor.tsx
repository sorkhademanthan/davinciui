"use client";

import * as React from "react";

export type ChromaticCursorTheme = "auto" | "light" | "dark";
export type ChromaticCursorQuality = "low" | "medium" | "high";

export interface ChromaticCursorProps {
  /** Maximum number of samples retained in each colored trail. */
  trailLength?: number;
  /** Perpendicular RGB separation in pixels. */
  splitDistance?: number;
  /** Trail fade rate from 0.05 (long) to 1 (quick). */
  fadeSpeed?: number;
  /** Cursor head radius and stroke scale in pixels. */
  size?: number;
  /** Draw the soft additive glow around the trail. Disable on tiny thumbnails. */
  glow?: boolean;
  /** Follow responsiveness from 0.05 (soft) to 1 (tight). */
  tension?: number;
  /** Red channel color. */
  red?: string;
  /** Green channel color. */
  green?: string;
  /** Blue channel color. */
  blue?: string;
  /** Color scheme for blending and core rendering. `"auto"` follows the site theme live. */
  theme?: ChromaticCursorTheme;
  /** Rendering detail and DPR cap. */
  quality?: ChromaticCursorQuality;
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

const QUALITY_DPR: Record<ChromaticCursorQuality, number> = {
  low: 1,
  medium: 1.5,
  high: 2,
};

const FALLBACK_GLOW_LIGHT = "rgba(0,149,255,";

/** Parse `#rgb` / `#rrggbb` into an rgba() string; returns null for other formats. */
const withAlpha = (color: string, alpha: number) => {
  const hex = color.trim().replace(/^#/, "");
  const full =
    hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

/** Read the page color scheme without requiring a theme provider. */
const resolveColorScheme = (): "light" | "dark" => {
  if (typeof document === "undefined") return "dark";
  const root = document.documentElement;
  if (root.classList.contains("dark")) return "dark";
  if (root.classList.contains("light")) return "light";
  const dataTheme = root.dataset.theme;
  if (dataTheme === "dark" || dataTheme === "light") return dataTheme;
  if (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: light)").matches
  ) {
    return "light";
  }
  return "dark";
};

/** A lightweight RGB canvas cursor with softly split, glowing trails. */
export function ChromaticCursor({
  trailLength = 64,
  splitDistance = 4,
  fadeSpeed = 0.55,
  size = 11,
  glow = true,
  tension = 0.34,
  red = "#FF493D",
  green = "#F4FFB0",
  blue = "#00CCFF",
  theme = "auto",
  quality = "high",
  hideSystemCursor = false,
  containerRef,
  zIndex = 9999,
  disabled = false,
  className,
}: ChromaticCursorProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const settingsRef = React.useRef({ trailLength, splitDistance, fadeSpeed, size, glow, tension, red, green, blue, quality });
  settingsRef.current = { trailLength, splitDistance, fadeSpeed, size, glow, tension, red, green, blue, quality };
  const themeRef = React.useRef(theme);
  themeRef.current = theme;

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || disabled || window.matchMedia("(pointer: coarse)").matches) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const container = containerRef?.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const cursorStyle = document.createElement("style");
    const trail: Point[] = [];
    let scheme: "light" | "dark" =
      themeRef.current === "auto" ? resolveColorScheme() : themeRef.current;
    let width = 0;
    let height = 0;
    let frame = 0;
    let running = false;
    let hasPointer = false;
    let headX = 0;
    let headY = 0;
    let targetX = 0;
    let targetY = 0;
    let lastTime = 0;
    let lastSampleTime = 0;
    let appliedDpr = 0;

    const resize = () => {
      const bounds = container?.getBoundingClientRect();
      const dpr = Math.min(
        window.devicePixelRatio || 1,
        QUALITY_DPR[settingsRef.current.quality] ?? 2,
      );
      appliedDpr = dpr;
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
        lastTime = performance.now();
        frame = requestAnimationFrame(render);
      }
    };

    const pushPoint = (x: number, y: number, time: number) => {
      const previous = trail[trail.length - 1];
      if (previous && Math.hypot(x - previous.x, y - previous.y) < 0.6) return;
      trail.push({ x, y, time });
      const maximum = Math.max(8, Math.round(settingsRef.current.trailLength));
      if (trail.length > maximum) trail.splice(0, trail.length - maximum);
    };

    const move = (event: PointerEvent) => {
      if (reducedMotion.matches) return;
      const bounds = container?.getBoundingClientRect();
      const x = event.clientX - (bounds?.left ?? 0);
      const y = event.clientY - (bounds?.top ?? 0);
      const now = performance.now();
      if (!hasPointer) {
        hasPointer = true;
        headX = x;
        headY = y;
        targetX = x;
        targetY = y;
        trail.length = 0;
        pushPoint(x, y, now);
        lastSampleTime = now;
      } else {
        targetX = x;
        targetY = y;
      }
      wake();
    };

    const drawChannel = (
      points: Point[],
      color: string,
      direction: number,
      alpha: number,
      composite: GlobalCompositeOperation,
      lineWidth: number,
      offset: number,
      now: number,
      lifetime: number,
    ) => {
      const count = points.length;
      if (count < 2) return;
      // Each frame sample is an independent rounded capsule. Slow movement
      // makes neighboring capsules overlap into a ribbon; fast movement opens
      // visible gaps, matching the reference's speed-dependent dashed trail.
      context.save();
      context.globalCompositeOperation = composite;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.strokeStyle = color;
      const glowOn = settingsRef.current.glow && composite === "lighter";
      context.shadowColor = glowOn ? color : "transparent";
      context.shadowBlur = glowOn ? lineWidth * 0.8 : 0;
      for (let index = 1; index < count; index += 1) {
        const previous = points[index - 1];
        const current = points[index];
        if (!previous || !current) continue;
        const dx = current.x - previous.x;
        const dy = current.y - previous.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 0.5) continue;
        const tangentX = dx / distance;
        const tangentY = dy / distance;
        const before = points[Math.max(0, index - 2)] ?? previous;
        const after = points[Math.min(count - 1, index + 1)] ?? current;
        const smoothDx = after.x - before.x;
        const smoothDy = after.y - before.y;
        const smoothLength = Math.hypot(smoothDx, smoothDy) || 1;
        const normalX = (-smoothDy / smoothLength) * offset * direction;
        const normalY = (smoothDx / smoothLength) * offset * direction;
        const progress = index / (count - 1); // 0 tail -> 1 head
        const shape = Math.pow(progress, 0.42);
        const ageFade = clamp(1 - (now - current.time) / lifetime, 0, 1);
        const segmentAlpha = alpha * shape * Math.pow(ageFade, 1.1);
        if (segmentAlpha <= 0.004) continue;
        const capsuleLength = Math.min(
          distance,
          Math.max(18, lineWidth * 5),
        );
        context.globalAlpha = segmentAlpha;
        context.lineWidth = Math.max(0.7, lineWidth * (0.64 + 0.36 * shape));
        context.beginPath();
        context.moveTo(
          current.x - tangentX * capsuleLength + normalX,
          current.y - tangentY * capsuleLength + normalY,
        );
        context.lineTo(current.x + normalX, current.y + normalY);
        context.stroke();
      }
      context.restore();
    };

    const render = (now: number) => {
      const settings = settingsRef.current;
      if (themeRef.current !== "auto") scheme = themeRef.current;
      const light = scheme === "light";
      const dprCap = QUALITY_DPR[settings.quality] ?? 2;
      if (appliedDpr !== Math.min(window.devicePixelRatio || 1, dprCap)) resize();
      const lifetime = 240 + (1 - clamp(settings.fadeSpeed, 0.05, 1)) * 900;
      // Frame-rate independent follow: tension maps to a spring rate so the
      // feel is identical on 60Hz and 120Hz+ displays.
      const previousFrameTime = lastTime || now;
      const previousHeadX = headX;
      const previousHeadY = headY;
      const delta = clamp((now - previousFrameTime) / 1000, 0.001, 0.05);
      lastTime = now;
      const rate = 8 + clamp(settings.tension, 0.05, 1) * 36;
      const ease = 1 - Math.exp(-rate * delta);
      if (hasPointer) {
        headX += (targetX - headX) * ease;
        headY += (targetY - headY) * ease;
        // Sample at a stable 60 Hz so persistence does not collapse on
        // 120/144 Hz displays and frame drops do not create giant gaps.
        const sampleInterval = 1000 / 60;
        let samples = 0;
        while (lastSampleTime + sampleInterval <= now && samples < 6) {
          const sampleTime = lastSampleTime + sampleInterval;
          const progress = clamp(
            (sampleTime - previousFrameTime) /
              Math.max(1, now - previousFrameTime),
            0,
            1,
          );
          pushPoint(
            previousHeadX + (headX - previousHeadX) * progress,
            previousHeadY + (headY - previousHeadY) * progress,
            sampleTime,
          );
          lastSampleTime = sampleTime;
          samples += 1;
        }
      }
      const maximum = Math.max(8, Math.round(settings.trailLength));
      if (trail.length > maximum) trail.splice(0, trail.length - maximum);
      let start = 0;
      while (start < trail.length && now - (trail[start]?.time ?? 0) > lifetime) start += 1;
      if (start > 0) trail.splice(0, start);
      context.clearRect(0, 0, width, height);

      if (!trail.length) {
        if (hasPointer) {
          // Keep the loop alive briefly so a resting pointer still eases
          // toward its target instead of freezing mid-glide.
          if (Math.hypot(targetX - headX, targetY - headY) > 0.2) {
            frame = requestAnimationFrame(render);
            return;
          }
          hasPointer = false;
        }
        running = false;
        frame = 0;
        return;
      }

      const head = { x: headX, y: headY, time: trail[trail.length - 1]?.time ?? now };
      const headAge = clamp(1 - (now - head.time) / lifetime, 0, 1);
      // Additive glow on dark stages; normal blending on light stages where
      // "lighter" would wash out to white.
      const composite: GlobalCompositeOperation = light ? "source-over" : "lighter";
      const lineWidth = Math.max(2.4, settings.size * 0.42);
      const channels: Channel[] = [
        { color: settings.red, direction: 1 },
        { color: settings.green, direction: 0 },
        { color: settings.blue, direction: -1 },
      ];
      channels.forEach((channel) =>
        drawChannel(trail, channel.color, channel.direction, light ? 0.9 : 0.92, composite, lineWidth, settings.splitDistance, now, lifetime),
      );
      // Bright core on dark, ink core on light so the trail reads on any stage.
      drawChannel(trail, light ? "#18181b" : "#ffffff", 0, 0.94, composite, lineWidth * 0.3, 0, now, lifetime);

      if (head) {
        context.save();
        context.globalCompositeOperation = composite;
        context.globalAlpha = 0.35 + 0.65 * headAge;
        const radius = Math.max(3, settings.size * 0.48);
        if (light) {
          const halo = withAlpha(settings.blue, 0.3) ?? `${FALLBACK_GLOW_LIGHT}0.3)`;
          const haloSoft = withAlpha(settings.blue, 0.12) ?? `${FALLBACK_GLOW_LIGHT}0.12)`;
          const glow = context.createRadialGradient(head.x, head.y, 0, head.x, head.y, radius * 2.6);
          glow.addColorStop(0, "rgba(24,24,27,0.9)");
          glow.addColorStop(0.35, halo);
          glow.addColorStop(0.65, haloSoft);
          glow.addColorStop(1, "rgba(255,255,255,0)");
          context.fillStyle = glow;
          context.beginPath();
          context.arc(head.x, head.y, radius * 2.6, 0, Math.PI * 2);
          context.fill();
          context.fillStyle = "#18181b";
          context.shadowColor = settings.glow ? settings.blue : "transparent";
          context.shadowBlur = settings.glow ? radius : 0;
          context.beginPath();
          context.arc(head.x, head.y, radius * 0.58, 0, Math.PI * 2);
          context.fill();
          context.shadowBlur = 0;
        } else {
          const glow = context.createRadialGradient(head.x, head.y, 0, head.x, head.y, radius * 1.9);
          glow.addColorStop(0, "rgba(255,255,255,0.95)");
          glow.addColorStop(0.24, "rgba(255,255,255,0.58)");
          glow.addColorStop(0.56, "rgba(96,232,255,0.18)");
          glow.addColorStop(1, "rgba(123,243,255,0)");
          context.fillStyle = glow;
          context.beginPath();
          context.arc(head.x, head.y, radius * 1.9, 0, Math.PI * 2);
          context.fill();
          context.fillStyle = "#ffffff";
          context.shadowColor = settings.glow ? "#ffffff" : "transparent";
          context.shadowBlur = settings.glow ? radius : 0;
          context.beginPath();
          context.arc(head.x, head.y, radius * 0.58, 0, Math.PI * 2);
          context.fill();
          context.shadowBlur = 0;
        }
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

    const syncScheme = () => {
      if (themeRef.current === "auto") scheme = resolveColorScheme();
    };

    resize();
    setNativeCursor(true);
    if (container) container.addEventListener("pointermove", move, { passive: true });
    else window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("resize", resize);
    const resizeObserver = container && typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    if (resizeObserver && container) resizeObserver.observe(container);
    reducedMotion.addEventListener("change", clearForReducedMotion);
    const schemeObserver =
      typeof MutationObserver !== "undefined" ? new MutationObserver(syncScheme) : null;
    schemeObserver?.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "style"],
    });

    return () => {
      cancelAnimationFrame(frame);
      setNativeCursor(false);
      if (container) container.removeEventListener("pointermove", move);
      else window.removeEventListener("pointermove", move);
      window.removeEventListener("resize", resize);
      resizeObserver?.disconnect();
      schemeObserver?.disconnect();
      reducedMotion.removeEventListener("change", clearForReducedMotion);
    };
  }, [containerRef, disabled, hideSystemCursor]);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} style={{ position: containerRef ? "absolute" : "fixed", inset: 0, pointerEvents: "none", zIndex, background: "transparent" }} />;
}
