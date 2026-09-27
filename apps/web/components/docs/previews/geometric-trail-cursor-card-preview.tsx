"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { GeometricTrailCursor } from "@workspace/ui/components/geometric-trail-cursor";

/**
 * Self-playing card thumbnail. A lightweight ambient driver steers a
 * virtual pointer along a Lissajous path by dispatching synthetic
 * pointermove events (which GeometricTrailCursor already listens for), so
 * the trail paints continuously with no hover or input required. Real
 * user input takes over momentarily: ambient motion pauses for a beat
 * after any trusted pointer activity to avoid streaks between the virtual
 * and real positions. Offscreen cards cost no frames.
 */
export function GeometricTrailCursorCardPreview() {
  const previewRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  useEffect(() => {
    const host = previewRef.current;
    if (!host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let visible = true;
    let driving = false;
    let lastRealInput = 0;
    const start = performance.now();

    const updateDriving = () => {
      const next = visible;
      if (next === driving) return;
      driving = next;
      cancelAnimationFrame(raf);
      raf = 0;
      if (driving) raf = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? true;
        updateDriving();
      },
      { threshold: 0.05 },
    );
    observer.observe(host);

    // Trusted (real) pointer activity pauses the ambient driver briefly so
    // user motion draws cleanly without connecting streaks.
    const onRealInput = (e: Event) => {
      if (e instanceof PointerEvent && !e.isTrusted) return;
      lastRealInput = performance.now();
    };
    host.addEventListener("pointermove", onRealInput);
    host.addEventListener("pointerdown", onRealInput);

    const tick = (now: number) => {
      raf = 0;
      if (!driving) return;
      raf = requestAnimationFrame(tick);
      // Let fresh user motion own the trail for a beat.
      if (now - lastRealInput < 900) return;
      const rect = host.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return;
      const t = (now - start) / 1000;
      const x = rect.left + rect.width * (0.5 + 0.36 * Math.sin(t * 0.85));
      const y = rect.top + rect.height * (0.5 + 0.3 * Math.sin(t * 1.31 + 1.2));
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
      host.removeEventListener("pointermove", onRealInput);
      host.removeEventListener("pointerdown", onRealInput);
    };
  }, []);

  return (
    <div
      ref={previewRef}
      className="absolute inset-0 overflow-hidden bg-zinc-100 dark:bg-black"
      style={{ containerType: "inline-size" }}
    >
      <GeometricTrailCursor
        containerRef={previewRef}
        activeColor={isDark ? "#22D3EE" : "#2563EB"}
        ghostColor={isDark ? "#2E2E33" : "#A1A1AA"}
        backgroundColor={isDark ? "#000000" : "#F4F4F5"}
        minSize={10}
        maxSize={64}
        spacing={10}
        density={1.4}
        velocityScale={1.1}
        activeDuration={380}
        colorFadeDuration={750}
        ghostDuration={3200}
        strokeWidth={1.4}
        glow={6}
        maxShapes={240}
        zIndex={1}
      />
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-3">
        <span className="whitespace-nowrap text-[clamp(1.7rem,11cqi,3.8rem)] font-black uppercase leading-none tracking-[-0.075em] text-zinc-950 dark:text-white">
          DAVINCIUI
        </span>
      </div>
    </div>
  );
}
