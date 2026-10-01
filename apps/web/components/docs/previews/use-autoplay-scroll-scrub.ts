"use client";

import { useEffect, type RefObject } from "react";

interface AutoplayScrubOptions {
  /** Full 0→1→0 loop length. @default 6400 */
  durationMs?: number;
  /** 0..1 offset so cards don't move in lockstep. @default 0 */
  phase?: number;
  /** Pause autoplay after real user scrub. @default 3200 */
  resumeDelayMs?: number;
}

/**
 * Self-playing driver for scroll-scrub card thumbnails.
 *
 * Gently ping-pongs the scroll container's scrollTop (0 → max → 0) while
 * the card is visible, so scroll-driven previews animate with no manual
 * wheel input. Real wheel / touch input takes over for a beat, and
 * `prefers-reduced-motion` disables the loop entirely.
 */
export function useAutoplayScrollScrub(
  containerRef: RefObject<HTMLElement | null>,
  options: AutoplayScrubOptions = {},
) {
  const { durationMs = 6400, phase = 0, resumeDelayMs = 3200 } = options;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let visible = true;
    let lastRealInput = -Infinity;
    const start = performance.now();

    const observer = new IntersectionObserver(
      ([entry]) => {
        const next = entry?.isIntersecting ?? true;
        if (next === visible) return;
        visible = next;
        cancelAnimationFrame(raf);
        raf = 0;
        if (visible) raf = requestAnimationFrame(tick);
      },
      { threshold: 0.05 },
    );
    observer.observe(el);

    const onRealInput = () => {
      lastRealInput = performance.now();
    };
    el.addEventListener("wheel", onRealInput, { passive: true });
    el.addEventListener("touchstart", onRealInput, { passive: true });
    el.addEventListener("pointerdown", onRealInput, { passive: true });

    const tick = (now: number) => {
      raf = 0;
      if (!visible) return;
      raf = requestAnimationFrame(tick);
      if (now - lastRealInput < resumeDelayMs) return;
      const max = el.scrollHeight - el.clientHeight;
      if (max <= 2) return;
      // Triangle wave: 0 → 1 → 0 over durationMs, phase-offset per card.
      const cycle = ((now - start) / durationMs + phase) % 2;
      const p = cycle < 1 ? cycle : 2 - cycle;
      // Ease in-out so the ends linger instead of snapping direction.
      const eased = p * p * (3 - 2 * p);
      el.scrollTop = eased * max;
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      el.removeEventListener("wheel", onRealInput);
      el.removeEventListener("touchstart", onRealInput);
      el.removeEventListener("pointerdown", onRealInput);
    };
    // Re-init only if the host identity changes; tunables are stable per card.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, durationMs, resumeDelayMs]);
}
