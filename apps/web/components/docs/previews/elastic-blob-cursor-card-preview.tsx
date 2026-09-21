"use client";

import { useEffect, useRef } from "react";
import { ElasticBlobCursor } from "@workspace/ui/components/elastic-blob-cursor";

/**
 * Self-presenting card thumbnail. Cards can't rely on hover, so a lightweight
 * ambient driver steers a virtual pointer in slow loops by dispatching
 * synthetic pointermove events (which ElasticBlobCursor already listens for).
 * Real user input simply interleaves and takes over momentarily.
 */
export function ElasticBlobCursorCardPreview() {
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = previewRef.current;
    if (!host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let driving = true;
    const start = performance.now();

    const observer = new IntersectionObserver(
      ([entry]) => {
        driving = entry?.isIntersecting ?? true;
        if (driving) {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(tick);
        } else {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { threshold: 0.05 },
    );
    observer.observe(host);

    const tick = (now: number) => {
      raf = 0;
      if (!driving) return;
      raf = requestAnimationFrame(tick);
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
    raf = requestAnimationFrame(tick);

    return () => {
      driving = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={previewRef}
      className="absolute inset-0 overflow-hidden bg-zinc-100 dark:bg-black"
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
