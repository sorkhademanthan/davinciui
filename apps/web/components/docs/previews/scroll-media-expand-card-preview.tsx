"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Play } from "lucide-react";
import { useAutoplayScrollScrub } from "./use-autoplay-scroll-scrub";

const SRC =
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=60&w=800&auto=format&fit=crop";

/* Phase boundaries mirror the full ScrollMediaExpand component. */
const WIDTH_IN: readonly [number, number] = [0.08, 0.72];
const HEIGHT_IN: readonly [number, number] = [0.2, 0.78];
const RADIUS_IN: readonly [number, number] = [0.18, 0.78];
const INNER_IN: readonly [number, number] = [0.08, 0.8];
const OVERLAY_IN: readonly [number, number] = [0.32, 0.48];
const LABEL_FADE: readonly [number, number] = [0.66, 0.82];

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function smoothstep(start: number, end: number, value: number) {
  const t = clamp((value - start) / (end - start), 0, 1);
  return t * t * (3 - 2 * t);
}

function smootherstep(start: number, end: number, value: number) {
  const t = clamp((value - start) / (end - start), 0, 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/**
 * Interactive mini ScrollMediaExpand for gallery cards.
 * Scrolling over the card scrubs a tiny pill into a card-filling
 * scene — labels glued to the media edges, CTA fading in mid-way.
 */
export function ScrollMediaExpandCardPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const labelLeftRef = useRef<HTMLSpanElement>(null);
  const labelRightRef = useRef<HTMLSpanElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const [stageH, setStageH] = useState(192);

  // Self-playing: gently ping-pong the scrub while visible so the pill
  // blooms into the fullscreen scene with no manual wheel input.
  useAutoplayScrollScrub(containerRef, { phase: 0.7, durationMs: 6000 });

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

  useEffect(() => {
    if (reduceMotion) return;
    const el = containerRef.current;
    const stage = stageRef.current;
    const media = mediaRef.current;
    const inner = innerRef.current;
    if (!el || !stage || !media || !inner) return;

    let raf = 0;
    const render = (progress: number) => {
      const stageW = stage.clientWidth || 1;
      const stageH = stage.clientHeight || 1;
      const p = clamp(progress, 0, 1);
      const iw = clamp(stageW * 0.07, 24, 34);
      const ih = 10;

      const w = lerp(iw, stageW, smootherstep(WIDTH_IN[0], WIDTH_IN[1], p));
      const h = lerp(ih, stageH, smootherstep(HEIGHT_IN[0], HEIGHT_IN[1], p));
      const r = lerp(999, 0, smootherstep(RADIUS_IN[0], RADIUS_IN[1], p));
      media.style.width = `${w.toFixed(1)}px`;
      media.style.height = `${h.toFixed(1)}px`;
      media.style.borderRadius = `${r.toFixed(1)}px`;

      const innerP = smootherstep(INNER_IN[0], INNER_IN[1], p);
      inner.style.transform = `scale(${lerp(1.12, 1, innerP).toFixed(3)})`;

      const gap = 6;
      const offset = w / 2 + gap;
      const labelFadeP = smoothstep(LABEL_FADE[0], LABEL_FADE[1], p);
      const labelOpacity = 1 - labelFadeP;
      const left = labelLeftRef.current;
      if (left) {
        left.style.transform = `translate(calc(-100% - ${offset.toFixed(1)}px), -50%)`;
        left.style.opacity = labelOpacity.toFixed(2);
        left.style.filter = `blur(${(2.5 * labelFadeP).toFixed(2)}px)`;
      }
      const right = labelRightRef.current;
      if (right) {
        right.style.transform = `translate(${offset.toFixed(1)}px, -50%)`;
        right.style.opacity = labelOpacity.toFixed(2);
        right.style.filter = `blur(${(2.5 * labelFadeP).toFixed(2)}px)`;
      }

      const overlay = overlayRef.current;
      if (overlay) {
        const o = smootherstep(OVERLAY_IN[0], OVERLAY_IN[1], p);
        overlay.style.opacity = o.toFixed(2);
        overlay.style.visibility = o <= 0 ? "hidden" : "visible";
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = el.scrollHeight - el.clientHeight;
        render(max <= 0 ? 0 : el.scrollTop / max);
      });
    };

    render(0);
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduceMotion]);

  if (reduceMotion) {
    return (
      <div className="absolute inset-0 flex items-center justify-center gap-2 bg-white px-4 dark:bg-black">
        <span className="text-[8px] font-medium text-zinc-900 dark:text-zinc-100">
          ©2026
        </span>
        <div className="relative h-24 w-44 flex-none overflow-hidden rounded-lg">
          <img
            src={SRC}
            alt=""
            aria-hidden="true"
            className="block h-full w-full object-cover"
            draggable={false}
          />
        </div>
        <span className="text-[8px] font-medium text-zinc-900 dark:text-zinc-100">
          Showreel
        </span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-y-auto overflow-x-hidden bg-white dark:bg-black [&::-webkit-scrollbar]:hidden"
      style={{ scrollbarWidth: "none", overscrollBehaviorY: "contain" }}
    >
      <div className="relative" style={{ height: 2.5 * stageH }}>
        <div
          ref={stageRef}
          className="sticky top-0 flex w-full items-center justify-center overflow-hidden bg-white dark:bg-black"
          style={{ height: stageH }}
        >
          <div
            ref={mediaRef}
            className="relative shrink-0 overflow-hidden bg-zinc-200 dark:bg-zinc-900"
          >
            <div ref={innerRef} className="absolute inset-0">
              <img
                src={SRC}
                alt=""
                aria-hidden="true"
                draggable={false}
                loading="lazy"
                className="block h-full w-full select-none object-cover"
              />
            </div>
            <div
              ref={overlayRef}
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
              style={{ opacity: 0, visibility: "hidden" }}
            >
              <div className="flex items-center gap-1 rounded-full bg-black/35 py-0.5 pl-0.5 pr-1.5 ring-1 ring-white/25 backdrop-blur-md">
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white">
                  <Play className="h-2 w-2 fill-zinc-950 text-zinc-950" />
                </span>
                <span className="whitespace-nowrap text-[8px] font-medium tracking-wide text-white">
                  Play showreel
                </span>
              </div>
            </div>
          </div>
          <span
            ref={labelLeftRef}
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 z-10 whitespace-nowrap text-[8px] font-medium tracking-wide text-zinc-900 dark:text-zinc-100"
          >
            ©2026
          </span>
          <span
            ref={labelRightRef}
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 z-10 whitespace-nowrap text-[8px] font-medium tracking-wide text-zinc-900 dark:text-zinc-100"
          >
            Showreel
          </span>
        </div>
      </div>
    </div>
  );
}
