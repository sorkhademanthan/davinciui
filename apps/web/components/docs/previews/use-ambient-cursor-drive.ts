"use client";

import { useEffect, type RefObject } from "react";

interface AmbientDriveOptions {
  /** Pause ambient motion this long after real user input. @default 900 */
  resumeDelayMs?: number;
  /** Horizontal sweep radius as fraction of host width. @default 0.36 */
  radiusX?: number;
  /** Vertical sweep radius as fraction of host height. @default 0.30 */
  radiusY?: number;
  /** Speed multiplier for the Lissajous path. @default 1 */
  speed?: number;
  /** Phase offset so cards don't move in lockstep. @default 0 */
  phase?: number;
  /** How long after scrolling stops before ambient motion resumes. @default 160 */
  scrollResumeMs?: number;
  /**
   * Whether real user input briefly pauses the driver. Set to false when the
   * effect ignores manual input anyway (e.g. `disableManualInput` followers)
   * so the show never freezes under the visitor's cursor. @default true
   */
  pauseOnRealInput?: boolean;
}

/**
 * Self-playing driver for cursor card thumbnails.
 *
 * Steers a virtual pointer along a Lissajous path by dispatching synthetic
 * `pointermove` events, which every cursor component already listens for —
 * so trails paint continuously with no hover or input required.
 *
 * - Real user input takes over momentarily (no streaks between virtual/real).
 * - Offscreen cards cost no frames (IntersectionObserver gated).
 * - Scroll-safe: the host rect is cached (no per-frame forced layout), event
 *   dispatch pauses while the page scrolls, and the virtual clock freezes
 *   during the pause so the pointer resumes exactly where it left off
 *   instead of streaking across the card.
 * - Respects `prefers-reduced-motion`.
 */
export function useAmbientCursorDrive(
  hostRef: RefObject<HTMLElement | null>,
  options: AmbientDriveOptions = {},
) {
  const {
    resumeDelayMs = 900,
    radiusX = 0.36,
    radiusY = 0.3,
    speed = 1,
    phase = 0,
    scrollResumeMs = 160,
    pauseOnRealInput = true,
  } = options;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let visible = true;
    let driving = false;
    let lastRealInput = 0;
    let lastScroll = -Infinity;
    let pausedTotal = 0;
    let pauseStart = 0;
    const start = performance.now();

    // Cached geometry — reading getBoundingClientRect() every frame across
    // every card forces synchronous layouts and janks page scroll.
    let rect = host.getBoundingClientRect();
    const refreshRect = () => {
      rect = host.getBoundingClientRect();
    };

    const updateDriving = () => {
      const next = visible;
      if (next === driving) return;
      driving = next;
      cancelAnimationFrame(raf);
      raf = 0;
      if (driving) {
        refreshRect();
        raf = requestAnimationFrame(tick);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? true;
        updateDriving();
      },
      { threshold: 0.05 },
    );
    observer.observe(host);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(refreshRect);
      resizeObserver.observe(host);
    }
    window.addEventListener("resize", refreshRect);

    // Trusted (real) pointer activity pauses the ambient driver briefly so
    // user motion draws cleanly without connecting streaks.
    const onRealInput = (e: Event) => {
      if (!pauseOnRealInput) return;
      if (e instanceof PointerEvent && !e.isTrusted) return;
      lastRealInput = performance.now();
    };
    host.addEventListener("pointermove", onRealInput);
    host.addEventListener("pointerdown", onRealInput);

    // Any page scroll pauses dispatch; geometry is refreshed once scrolling
    // settles instead of on every scroll frame.
    const onScroll = () => {
      lastScroll = performance.now();
    };
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });

    const tick = (now: number) => {
      raf = 0;
      if (!driving) return;
      raf = requestAnimationFrame(tick);
      // Freeze the virtual clock while paused so the pointer resumes from
      // the same spot instead of teleporting (which would streak the trail).
      if (now - lastScroll < scrollResumeMs) {
        if (pauseStart === 0) pauseStart = now;
        return;
      }
      if (pauseStart > 0) {
        pausedTotal += now - pauseStart;
        pauseStart = 0;
        refreshRect();
      }
      // Let fresh user motion own the trail for a beat.
      if (now - lastRealInput < resumeDelayMs) return;
      if (rect.width < 2 || rect.height < 2) return;
      const t = ((now - start - pausedTotal) / 1000) * speed + phase;
      const x = rect.left + rect.width * (0.5 + radiusX * Math.sin(t * 0.85));
      const y = rect.top + rect.height * (0.5 + radiusY * Math.sin(t * 1.31 + 1.2));
      host.dispatchEvent(
        new PointerEvent("pointermove", {
          bubbles: true,
          cancelable: true,
          clientX: x,
          clientY: y,
          pointerType: "mouse",
        }),
      );
    };
    updateDriving();

    return () => {
      driving = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener("resize", refreshRect);
      window.removeEventListener("scroll", onScroll, { capture: true });
      host.removeEventListener("pointermove", onRealInput);
      host.removeEventListener("pointerdown", onRealInput);
    };
    // Re-init only if the host identity changes; tunables are stable per card.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hostRef, resumeDelayMs, scrollResumeMs, pauseOnRealInput]);
}
