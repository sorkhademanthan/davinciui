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

const ITEMS = [
  {
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=600&auto=format&fit=crop",
    alt: "Matterhorn peak above the clouds",
  },
  {
    src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=600&auto=format&fit=crop",
    alt: "Sunlit mountain valley",
  },
  {
    src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600&auto=format&fit=crop",
    alt: "Fog over green hills",
  },
];

const MINI_GUTTER = 8;
const MINI_RADIUS = 10;
const MINI_PREVIEW = 16;
const MINI_DIM = 0.3;

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function MiniStackLayer({
  item,
  index,
  count,
  progress,
  stageH,
  active,
}: {
  item: (typeof ITEMS)[number];
  index: number;
  count: number;
  progress: MotionValue<number>;
  stageH: number;
  active: boolean;
}) {
  const transitions = Math.max(1, count - 1);
  const cardH = Math.max(1, stageH - MINI_GUTTER * 2);
  const startY = Math.max(0, cardH - MINI_PREVIEW);

  const y = useTransform(progress, (v: number) => {
    if (index === 0) return 0;
    // Mirror the full component: only the next card peeks (preview strip);
    // later cards park fully below so the last card can't cover the strip.
    const seg = clamp01(v) * transitions;
    const k = Math.min(Math.floor(seg + 1e-6), Math.max(0, transitions - 1));
    const ti = index - 1;
    if (ti < k) return 0;
    if (ti === k) return (1 - clamp01(seg - k)) * startY;
    return cardH;
  });
  const dimOpacity = useTransform(progress, (v: number) => {
    if (index >= count - 1) return 0;
    const nextStart = index / transitions;
    const nextLocal = clamp01((v - nextStart) * transitions);
    return nextLocal * MINI_DIM;
  });

  return (
    <motion.div
      aria-hidden={!active}
      className="absolute overflow-hidden bg-[#17171a]"
      style={{
        inset: MINI_GUTTER,
        zIndex: index + 1,
        borderRadius: MINI_RADIUS,
        y,
        willChange: index === 0 ? undefined : "transform",
      }}
    >
      <img
        src={item.src}
        alt=""
        draggable={false}
        loading={index < 2 ? "eager" : "lazy"}
        className="block h-full w-full select-none object-cover"
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-black"
        style={{ opacity: dimOpacity }}
      />
    </motion.div>
  );
}

/**
 * Interactive mini Stacked Scroll Gallery for gallery cards.
 * The card itself is the scroll container — scrolling over the card scrubs
 * the layered rise-from-bottom transition via a sticky stage, exactly like
 * the full component: the next panel travels up and covers the current one.
 */
export function StackedScrollGalleryCardPreview() {
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
      <div className="absolute inset-0 overflow-hidden bg-[#0a0a0b]">
        <div
          className="absolute overflow-hidden bg-[#17171a]"
          style={{ inset: MINI_GUTTER, borderRadius: MINI_RADIUS }}
        >
          <img
            src={item.src}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-y-auto overflow-x-hidden bg-[#0a0a0b] [&::-webkit-scrollbar]:hidden"
      style={{
        scrollbarWidth: "none",
        overscrollBehaviorY: "contain",
      }}
    >
      <div className="relative" style={{ height: ITEMS.length * stageH }}>
        <div
          className="sticky top-0 w-full overflow-hidden bg-[#0a0a0b]"
          style={{ height: stageH }}
        >
          {ITEMS.map((item, i) => (
            <MiniStackLayer
              key={item.src}
              item={item}
              index={i}
              count={ITEMS.length}
              progress={progress}
              stageH={stageH}
              active={i === active}
            />
          ))}
          {/* Scroll progress ticks */}
          <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 gap-1">
            {ITEMS.map((item, i) => (
              <span
                key={item.src}
                className={
                  i === active
                    ? "h-1 w-4 rounded-full bg-white/90"
                    : "h-1 w-1 rounded-full bg-white/50"
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
