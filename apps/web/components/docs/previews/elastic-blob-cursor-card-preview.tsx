"use client";

import { useEffect, useRef } from "react";
import { ElasticBlobCursor } from "@workspace/ui/components/elastic-blob-cursor";

/**
 * Hover-driven card thumbnail. A lightweight ambient driver steers a virtual
 * pointer in slow loops so a stationary hover demonstrates the same elastic
 * response as the docs. Fresh real pointer input owns the blob temporarily.
 */
export function ElasticBlobCursorCardPreview() {
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = previewRef.current;
    if (!host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let hovering = false;
    let visible = true;
    let driving = false;
    let lastRealInput = 0;
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
    const onRealInput = (event: PointerEvent) => {
      if (!event.isTrusted) return;
      lastRealInput = performance.now();
    };
    host.addEventListener("pointerenter", onEnter);
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("pointermove", onRealInput);

    const tick = (now: number) => {
      raf = 0;
      if (!driving) return;
      raf = requestAnimationFrame(tick);
      if (now - lastRealInput < 900) return;
      const rect = host.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return;
      const t = (now - start) / 1000;
      const x = rect.left + rect.width * (0.5 + 0.34 * Math.sin(t * 0.9));
      const y = rect.top + rect.height * (0.5 + 0.3 * Math.sin(t * 1.4 + 1.1));
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
      host.removeEventListener("pointermove", onRealInput);
    };
  }, []);

  return (
    <div
      ref={previewRef}
      className="absolute inset-0 cursor-none overflow-hidden bg-zinc-100 dark:bg-black"
      style={{ containerType: "inline-size" }}
    >
      <ElasticBlobCursor containerRef={previewRef} mode="container" size={34} zIndex={10} />
      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-3 mix-blend-difference">
        <span className="whitespace-nowrap text-[clamp(1.7rem,11cqi,3.8rem)] font-black uppercase leading-none tracking-[-0.075em] text-white">
          DAVINCIUI
        </span>
      </div>
    </div>
  );
}
