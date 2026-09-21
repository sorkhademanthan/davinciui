"use client";

import { useEffect, useRef } from "react";
import { FluidCursor } from "@workspace/ui/components/fluid-cursor";

/**
 * Card thumbnail with hover-only motion. The ambient driver steers a virtual
 * pointer along a Lissajous path by dispatching synthetic pointermove events
 * (which FluidCursor already listens for on window), but it runs ONLY while
 * the pointer is over the card — otherwise the stage stays black and still.
 * Real user input simply interleaves and takes over momentarily.
 */
export function FluidCursorCardPreview() {
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = previewRef.current;
    if (!host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let hovering = false;
    let visible = true;
    let driving = false;
    const start = performance.now();

    const updateDriving = () => {
      const next = hovering && visible;
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

    const onEnter = () => {
      hovering = true;
      updateDriving();
    };
    const onLeave = () => {
      hovering = false;
      updateDriving();
    };
    host.addEventListener("pointerenter", onEnter);
    host.addEventListener("pointerleave", onLeave);

    const tick = (now: number) => {
      raf = 0;
      if (!driving) return;
      raf = requestAnimationFrame(tick);
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

    return () => {
      driving = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      host.removeEventListener("pointerenter", onEnter);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={previewRef}
      className="absolute inset-0 overflow-hidden bg-zinc-100 dark:bg-black"
      style={{ containerType: "inline-size" }}
    >
      <FluidCursor containerRef={previewRef} resolution={96} pressureIterations={14} zIndex={10}>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-3">
          <span className="whitespace-nowrap text-[clamp(1.7rem,11cqi,3.8rem)] font-black uppercase leading-none tracking-[-0.075em] text-zinc-950 dark:text-white">
            DAVINCIUI
          </span>
        </div>
      </FluidCursor>
    </div>
  );
}
