"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { ScrollBlurOverlay } from "@workspace/ui/components/scroll-blur-overlay";

/**
 * Interactive mini ScrollBlurOverlay for gallery cards. Scrolling over the
 * card scrubs a frosted sheet upward over a vivid scene — fully reversible.
 */
export function ScrollBlurOverlayCardPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const [stageH, setStageH] = useState(192);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const update = () => {
      if (el.clientHeight > 0) setStageH(el.clientHeight);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Capture wheel intent over the card so scrolling scrubs the preview
  // instead of the page. Pinch-zoom (ctrlKey) is never intercepted.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || reduceMotion) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) return;
      const delta =
        e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1);
      if (delta === 0) return;
      const max = el.scrollHeight - el.clientHeight;
      const atTop = el.scrollTop <= 0;
      const atBottom = el.scrollTop >= max - 1;
      if ((delta > 0 && !atBottom) || (delta < 0 && !atTop)) {
        e.preventDefault();
        e.stopPropagation();
        el.scrollTop += delta;
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [reduceMotion]);

  if (reduceMotion) {
    return (
      <div className="absolute inset-0 overflow-hidden bg-zinc-950">
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=60&w=800&auto=format&fit=crop"
          alt=""
          aria-hidden="true"
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <span className="absolute bottom-2 left-2 rounded bg-black/55 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-white">
          Frost
        </span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-y-auto overflow-x-hidden bg-zinc-950 [&::-webkit-scrollbar]:hidden"
      style={{ scrollbarWidth: "none", overscrollBehaviorY: "contain" }}
    >
      <section className="relative w-full overflow-hidden" style={{ height: stageH }}>
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=60&w=800&auto=format&fit=crop"
          alt=""
          aria-hidden="true"
          draggable={false}
          className="absolute inset-0 h-full w-full select-none object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <p className="absolute bottom-2 left-2.5 text-[13px] font-bold tracking-tight text-white">
          Clear air
        </p>
      </section>

      <section
        className="relative w-full overflow-hidden bg-[#0c0c0e]"
        style={{ height: stageH * 1.1 }}
      >
        <ScrollBlurOverlay
          maxBlur={16}
          startLine={70}
          threshold={240}
          backgroundColor="#ffffff"
          opacity={0.1}
          extendAbove
        />
        <div className="relative z-20 flex h-full flex-col justify-center p-2.5">
          <p className="text-[13px] font-bold tracking-tight text-white">
            Frost settles
          </p>
          <p className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-white/55">
            Scroll over card
          </p>
        </div>
      </section>
    </div>
  );
}
