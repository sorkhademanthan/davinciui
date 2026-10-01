"use client";

import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useAutoplayScrollScrub } from "./use-autoplay-scroll-scrub";

const ITEMS = [
  {
    year: "2015",
    label: "01 / ORIGINS",
    background: "#1D4ED8",
    foreground: "#FFFFFF",
  },
  {
    year: "2017",
    label: "02 / BREAKTHROUGH",
    background: "#F97316",
    foreground: "#111111",
  },
  {
    year: "2020",
    label: "03 / REMOTE-FIRST",
    background: "#0D9488",
    foreground: "#FFFFFF",
  },
];

const MINI_ROTATION = 82;

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function smoothstep(start: number, end: number, value: number) {
  const t = clamp01((value - start) / (end - start));
  return t * t * (3 - 2 * t);
}

function MiniTimelineLayer({
  item,
  index,
  count,
  progress,
  active,
}: {
  item: (typeof ITEMS)[number];
  index: number;
  count: number;
  progress: MotionValue<number>;
  active: boolean;
}) {
  const transitions = Math.max(1, count - 1);
  const isLast = index === count - 1;

  // Mirror the full component: each outgoing panel is cropped in place
  // from right → left via clip-path while the next panel waits underneath.
  const clipPath = useTransform(progress, (v: number) => {
    if (isLast) return "inset(0 0% 0 0)";
    const seg = clamp01(v) * transitions;
    const eased = smoothstep(0, 1, clamp01(seg - index));
    if (eased >= 0.999) return "inset(0 100% 0 0)";
    return `inset(0 ${(eased * 100).toFixed(2)}% 0 0)`;
  });
  // Year rotation trails the collapse around the bottom-left anchor.
  const rotate = useTransform(progress, (v: number) => {
    if (isLast) return 0;
    const seg = clamp01(v) * transitions;
    const eased = smoothstep(0, 1, clamp01(seg - index));
    return -MINI_ROTATION * smoothstep(0.08, 1, eased);
  });

  return (
    <motion.div
      aria-hidden={!active}
      className="absolute inset-0 overflow-hidden"
      style={{
        background: item.background,
        color: item.foreground,
        zIndex: count - index,
        clipPath,
        willChange: "clip-path",
      }}
    >
      <div className="absolute" style={{ top: "10%", right: "10%" }}>
        <p className="m-0 text-[6px] font-medium uppercase tracking-[0.18em] opacity-70">
          {item.label}
        </p>
      </div>
      <motion.div
        aria-hidden="true"
        className="absolute whitespace-nowrap leading-[0.8]"
        style={{
          left: "4%",
          bottom: "4%",
          fontSize: 44,
          fontWeight: 400,
          letterSpacing: "-0.06em",
          transformOrigin: "left bottom",
          rotate,
          willChange: "transform",
        }}
      >
        {item.year}
      </motion.div>
    </motion.div>
  );
}

/**
 * Interactive mini Scroll Timeline for gallery cards.
 * The card itself is the scroll container — scrolling over the card scrubs
 * the horizontal collapse + year rotation via a sticky stage, exactly like
 * the full component: each outgoing panel is cropped to expose the next era.
 */
export function ScrollTimelineCardPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ container: containerRef });
  const progress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 30,
    mass: 0.5,
    restDelta: 0.001,
  });
  const [active, setActive] = useState(0);
  // Measured stage height (the visible card media height) — the track is
  // exactly one stage per item, no container-query units needed.
  const [stageH, setStageH] = useState(192);

  // Self-playing: gently ping-pong the scrub while visible so eras
  // collapse and years rotate with no manual wheel input.
  useAutoplayScrollScrub(containerRef, { phase: 1.6, durationMs: 6000 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      if (el.clientHeight > 0) setStageH(el.clientHeight);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Capture wheel intent over the card so scrolling scrubs the preview
  // instead of the page. Works even where overscroll-behavior is
  // unsupported. Pinch-zoom (ctrlKey) is never intercepted.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
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
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = Math.min(
      ITEMS.length - 1,
      Math.max(0, Math.floor(clamp01(v) * ITEMS.length)),
    );
    setActive((prev) => (prev === next ? prev : next));
  });

  if (reduceMotion) {
    const item = ITEMS[0]!;
    return (
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ background: item.background, color: item.foreground }}
      >
        <div className="absolute" style={{ top: "10%", right: "10%" }}>
          <p className="m-0 text-[6px] font-medium uppercase tracking-[0.18em] opacity-70">
            {item.label}
          </p>
        </div>
        <div
          aria-hidden="true"
          className="absolute whitespace-nowrap leading-[0.8]"
          style={{
            left: "4%",
            bottom: "4%",
            fontSize: 44,
            fontWeight: 400,
            letterSpacing: "-0.06em",
          }}
        >
          {item.year}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden"
      style={{
        scrollbarWidth: "none",
        overscrollBehaviorY: "contain",
        background: ITEMS[ITEMS.length - 1]!.background,
      }}
    >
      <div className="relative" style={{ height: ITEMS.length * stageH }}>
        <div
          className="sticky top-0 w-full overflow-hidden"
          style={{ height: stageH }}
        >
          {ITEMS.map((item, i) => (
            <MiniTimelineLayer
              key={item.year}
              item={item}
              index={i}
              count={ITEMS.length}
              progress={progress}
              active={i === active}
            />
          ))}
          {/* Scroll progress ticks — difference blend stays legible on every era color */}
          <div
            className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 gap-1 text-white mix-blend-difference"
          >
            {ITEMS.map((item, i) => (
              <span
                key={item.year}
                className={
                  i === active
                    ? "h-1 w-4 rounded-full bg-current opacity-90"
                    : "h-1 w-1 rounded-full bg-current opacity-50"
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
