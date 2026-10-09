"use client";

import { useEffect, type RefObject } from "react";

interface AmbientInnerDriveOptions {
  resumeDelayMs?: number;
  radiusX?: number;
  radiusY?: number;
  /** Vertical center of the sweep as a fraction of host height. @default 0.5 */
  centerY?: number;
  speed?: number;
  phase?: number;
  scrollResumeMs?: number;
  pauseOnRealInput?: boolean;
}

/**
 * Self-playing driver for text-effect card thumbnails (Fluid Particle Text,
 * Glitch Liquid Text) whose pointer listeners live on the component's own
 * root element — a child of the preview wrapper.
 *
 * Synthetic events dispatched on an ancestor never reach a descendant's
 * listeners (events bubble up, not down), so this resolves the inner
 * target (the component root) each frame and dispatches there.
 *
 * It also dispatches a `pointerenter` when driving starts: effects like
 * GlitchLiquidText gate `pointermove` behind a hovering flag that is
 * only set on enter, so move-only playback would sit idle.
 *
 * The sweep is biased to the text band (narrow Y radius around centerY)
 * so the virtual pointer lingers on the glyphs — the same melt you get
 * from manually moving the cursor across the DAVINCIUI text.
 */
export function useAmbientInnerDrive(
  hostRef: RefObject<HTMLElement | null>,
  options: AmbientInnerDriveOptions = {},
) {
  const {
    resumeDelayMs = 900,
    radiusX = 0.38,
    radiusY = 0.16,
    centerY = 0.5,
    speed = 0.7,
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
    let entered = false;
    let lastRealInput = 0;
    let lastScroll = -Infinity;
    let pausedTotal = 0;
    let pauseStart = 0;
    const start = performance.now();

    let rect = host.getBoundingClientRect();
    const refreshRect = () => {
      const el = hostRef.current;
      if (el) rect = el.getBoundingClientRect();
    };

    /** The component root carrying the pointer listeners. */
    const resolveTarget = (): HTMLElement => {
      const el = hostRef.current;
      if (!el) return host;
      const inner = el.firstElementChild;
      return (inner as HTMLElement | null) ?? el;
    };

    const fireEnter = (x: number, y: number) => {
      const target = resolveTarget();
      for (const type of ["pointerover", "pointerenter"] as const) {
        target.dispatchEvent(
          new PointerEvent(type, {
            bubbles: type === "pointerover",
            cancelable: true,
            clientX: x,
            clientY: y,
            pointerType: "mouse",
          }),
        );
      }
      entered = true;
    };

    const updateDriving = () => {
      const next = visible;
      if (next === driving) return;
      driving = next;
      cancelAnimationFrame(raf);
      raf = 0;
      if (driving) {
        refreshRect();
        entered = false;
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

    const onRealInput = (e: Event) => {
      if (!pauseOnRealInput) return;
      if (e instanceof PointerEvent && !e.isTrusted) return;
      lastRealInput = performance.now();
    };
    host.addEventListener("pointermove", onRealInput);
    host.addEventListener("pointerdown", onRealInput);

    const onScroll = () => {
      lastScroll = performance.now();
    };
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });

    const tick = (now: number) => {
      raf = 0;
      if (!driving) return;
      raf = requestAnimationFrame(tick);
      if (now - lastScroll < scrollResumeMs) {
        if (pauseStart === 0) pauseStart = now;
        return;
      }
      if (pauseStart > 0) {
        pausedTotal += now - pauseStart;
        pauseStart = 0;
        refreshRect();
      }
      if (now - lastRealInput < resumeDelayMs) {
        entered = false;
        return;
      }
      if (rect.width < 2 || rect.height < 2) return;
      const t = ((now - start - pausedTotal) / 1000) * speed + phase;
      // Horizontal sweeps across the full glyph width, vertical drift kept
      // tight around the text band so the pointer stays on the type.
      const x =
        rect.left + rect.width * (0.5 + radiusX * Math.sin(t * 0.9));
      const y =
        rect.top +
        rect.height *
          (centerY + radiusY * Math.sin(t * 1.27 + 1.2));
      if (!entered) fireEnter(x, y);
      resolveTarget().dispatchEvent(
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
