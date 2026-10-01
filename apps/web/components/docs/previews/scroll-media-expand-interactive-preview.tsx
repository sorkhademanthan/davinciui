"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

const SRC =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=85&w=1800&auto=format&fit=crop";

/* Phase boundaries mirror the full ScrollMediaExpand component exactly —
   the pill is rendered at rest on mount and every frame scrubs from there. */
const WIDTH_IN: readonly [number, number] = [0.08, 0.72];
const HEIGHT_IN: readonly [number, number] = [0.3, 0.86];
const RADIUS_IN: readonly [number, number] = [0.06, 0.34];
const RADIUS_OUT: readonly [number, number] = [0.74, 1];
const INNER_IN: readonly [number, number] = [0.08, 0.8];
const OVERLAY_IN: readonly [number, number] = [0.4, 0.56];
const LABEL_FADE: readonly [number, number] = [0.66, 0.82];
const HINT_OUT: readonly [number, number] = [0, 0.08];

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
 * Full-scale interactive ScrollMediaExpand for the docs preview pane
 * (right side + fullscreen). Scroll the pane: the wheel scrubs the
 * timeline in place — the pill is present from the first frame and
 * blooms into the fullscreen scene without moving the page.
 */
export function ScrollMediaExpandInteractivePreview({
  className,
}: {
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const labelLeftRef = useRef<HTMLSpanElement>(null);
  const labelRightRef = useRef<HTMLSpanElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const [stageSize, setStageSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const update = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w > 0 && h > 0) setStageSize({ w, h });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Capture wheel intent over the preview so scrolling scrubs the timeline
  // instead of the page. Pinch-zoom (ctrlKey) is never intercepted, and at
  // either end of the track the page resumes scrolling naturally.
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
      const mobile = stageW < 640;
      const iw = mobile
        ? clamp(stageW * 0.22, 90, 140)
        : clamp(stageW * 0.14, 150, 220);
      const ih = mobile
        ? clamp(stageW * 0.05, 22, 32)
        : clamp(stageW * 0.026, 28, 42);

      // The pill is the rest state: geometry always starts here, so it is
      // already present before and during every frame of the animation.
      const w = lerp(iw, stageW, smootherstep(WIDTH_IN[0], WIDTH_IN[1], p));
      const h = lerp(ih, stageH, smootherstep(HEIGHT_IN[0], HEIGHT_IN[1], p));
      const radiusP = smootherstep(RADIUS_IN[0], RADIUS_IN[1], p);
      const r = lerp(
        lerp(999, mobile ? 12 : 16, radiusP),
        0,
        smootherstep(RADIUS_OUT[0], RADIUS_OUT[1], p),
      );
      media.style.width = `${w.toFixed(1)}px`;
      media.style.height = `${h.toFixed(1)}px`;
      media.style.borderRadius = `${r.toFixed(1)}px`;

      const innerP = smootherstep(INNER_IN[0], INNER_IN[1], p);
      const innerScale = lerp(1.12, 1, innerP);
      inner.style.transform = `scale(${innerScale.toFixed(3)})`;

      const gap = mobile ? 10 : 16;
      const offset = w / 2 + gap;
      const labelFadeP = smoothstep(LABEL_FADE[0], LABEL_FADE[1], p);
      const left = labelLeftRef.current;
      if (left) {
        left.style.transform = `translate(calc(-100% - ${offset.toFixed(1)}px), -50%)`;
        left.style.opacity = (1 - labelFadeP).toFixed(2);
        left.style.filter = `blur(${(2.5 * labelFadeP).toFixed(2)}px)`;
      }
      const right = labelRightRef.current;
      if (right) {
        right.style.transform = `translate(${offset.toFixed(1)}px, -50%)`;
        right.style.opacity = (1 - labelFadeP).toFixed(2);
        right.style.filter = `blur(${(2.5 * labelFadeP).toFixed(2)}px)`;
      }

      const overlay = overlayRef.current;
      const scrim = scrimRef.current;
      const overlayP = smootherstep(OVERLAY_IN[0], OVERLAY_IN[1], p);
      if (scrim) {
        scrim.style.opacity = (0.9 * overlayP).toFixed(2);
        scrim.style.visibility = overlayP <= 0 ? "hidden" : "visible";
      }
      if (overlay) {
        const o = overlayP;
        overlay.style.opacity = o.toFixed(2);
        overlay.style.transform = `translate(-50%, calc(-50% + ${(8 * (1 - o)).toFixed(1)}px)) scale(${(0.96 + 0.04 * o).toFixed(3)})`;
        overlay.style.filter =
          o >= 1 ? "blur(0px)" : `blur(${(4 * (1 - o)).toFixed(1)}px)`;
        overlay.style.visibility = o <= 0 ? "hidden" : "visible";
      }

      const hint = hintRef.current;
      if (hint) {
        const hO = 1 - smoothstep(HINT_OUT[0], HINT_OUT[1], p);
        hint.style.opacity = hO.toFixed(2);
        hint.style.visibility = hO <= 0 ? "hidden" : "visible";
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
  }, [reduceMotion, stageSize]);

  if (reduceMotion) {
    return (
      <div
        className={cn(
          "relative flex h-full min-h-[480px] w-full items-center justify-center gap-3 bg-background px-6",
          className,
        )}
      >
        <span className="text-[13px] font-semibold text-foreground">©2026</span>
        <div className="relative aspect-video w-full max-w-md flex-none overflow-hidden rounded-2xl bg-muted">
          <img
            src={SRC}
            alt="Showreel"
            className="block h-full w-full object-cover"
            draggable={false}
          />
        </div>
        <span className="text-[13px] font-semibold text-foreground">
          Showreel
        </span>
      </div>
    );
  }

  const stageH = stageSize.h > 0 ? stageSize.h : 600;
  const stageW = stageSize.w > 0 ? stageSize.w : 960;
  const mobile = stageW < 640;
  const restWidth = mobile
    ? clamp(stageW * 0.22, 90, 140)
    : clamp(stageW * 0.14, 150, 220);
  const restHeight = mobile
    ? clamp(stageW * 0.05, 22, 32)
    : clamp(stageW * 0.026, 28, 42);

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 overflow-y-auto overflow-x-hidden bg-background [&::-webkit-scrollbar]:hidden",
        className,
      )}
      style={{ scrollbarWidth: "none", overscrollBehaviorY: "contain" }}
    >
      <div className="relative" style={{ height: 3 * stageH }}>
        <div
          ref={stageRef}
          className="sticky top-0 flex w-full items-center justify-center overflow-hidden bg-background"
          style={{ height: stageH }}
        >
          <div
            ref={mediaRef}
            className="relative shrink-0 overflow-hidden bg-muted"
            style={{
              width: restWidth,
              height: restHeight,
              borderRadius: 999,
            }}
          >
            <div ref={innerRef} className="absolute inset-0">
              <img
                src={SRC}
                alt=""
                aria-hidden="true"
                draggable={false}
                loading="eager"
                className="block h-full w-full select-none object-cover"
                style={{ objectPosition: "50% 35%" }}
              />
            </div>
            <div
              ref={scrimRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                opacity: 0,
                visibility: "hidden",
                background:
                  "radial-gradient(ellipse at center, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.12) 45%, rgba(0,0,0,0) 68%)",
              }}
            />
            <div
              ref={overlayRef}
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 z-10"
              style={{ opacity: 0, visibility: "hidden" }}
            >
              <div className="flex items-center gap-2.5 rounded-full bg-black/35 py-1.5 pl-1.5 pr-4 ring-1 ring-white/25 backdrop-blur-md">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white">
                  <Play className="h-3 w-3 fill-zinc-950 text-zinc-950" />
                </span>
                <span className="whitespace-nowrap text-[13px] font-medium tracking-wide text-white">
                  Play showreel
                </span>
              </div>
            </div>
          </div>
          <span
            ref={labelLeftRef}
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 z-10 whitespace-nowrap text-[12px] font-semibold uppercase tracking-[0.18em] text-foreground md:text-[13px]"
          >
            ©2026
          </span>
          <span
            ref={labelRightRef}
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 z-10 whitespace-nowrap text-[12px] font-semibold uppercase tracking-[0.18em] text-foreground md:text-[13px]"
          >
            Showreel
          </span>
          <div ref={hintRef} aria-hidden="true" className="hidden" />
        </div>
      </div>
    </div>
  );
}
