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

interface MiniItem {
  title: string;
  media: string;
}

const ITEMS: MiniItem[] = [
  {
    title: "Aurora",
    media:
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=600&auto=format&fit=crop",
  },
  {
    title: "Kyoto",
    media:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=600&auto=format&fit=crop",
  },
  {
    title: "Dunes",
    media:
      "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?q=80&w=600&auto=format&fit=crop",
  },
];

/** Crossfade visibility of item `index` across the scroll track. */
function segmentVisibility(p: number, index: number, count: number) {
  if (count <= 1) return 1;
  const u = p * count - index;
  if (u < -0.45) return 0;
  if (u < 0) {
    const t = (u + 0.45) / 0.45;
    return t * t * (3 - 2 * t);
  }
  if (index === count - 1) return 1;
  if (u >= 1) return 0;
  if (u < 0.55) return 1;
  const t = (u - 0.55) / 0.45;
  return 1 - t * t * (3 - 2 * t);
}

function MiniMediaLayer({
  item,
  index,
  count,
  progress,
  active,
}: {
  item: MiniItem;
  index: number;
  count: number;
  progress: MotionValue<number>;
  active: boolean;
}) {
  const opacity = useTransform(progress, (v: number) =>
    segmentVisibility(v, index, count),
  );
  return (
    <motion.div
      aria-hidden={!active}
      className="absolute inset-0"
      style={{ opacity, zIndex: active ? 1 : 0 }}
    >
      <img
        src={item.media}
        alt=""
        draggable={false}
        loading={index <= 1 ? "eager" : "lazy"}
        className="h-full w-full scale-110 object-cover"
      />
    </motion.div>
  );
}

function MiniTitleLayer({
  item,
  index,
  count,
  progress,
  active,
}: {
  item: MiniItem;
  index: number;
  count: number;
  progress: MotionValue<number>;
  active: boolean;
}) {
  const opacity = useTransform(progress, (v: number) =>
    segmentVisibility(v, index, count),
  );
  return (
    <motion.span
      aria-hidden={!active}
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[2rem] font-medium uppercase leading-none tracking-[-0.04em] text-white"
      style={{
        opacity,
        fontFamily: "Inter, system-ui, sans-serif",
        textShadow:
          "0 1px 12px rgba(0,0,0,0.45), 0 4px 40px rgba(0,0,0,0.35)",
        zIndex: 2,
      }}
    >
      {item.title}
    </motion.span>
  );
}

/**
 * Interactive mini CMS Scroll Gallery for gallery cards.
 * The card itself is the scroll container — scrolling over the card drives
 * the backdrop + title crossfade via a sticky stage, and the glass dock
 * tracks (and jumps to) the active item.
 */
export function CMSScrollGalleryCardPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ container: containerRef });
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    mass: 0.9,
    restDelta: 0.001,
  });
  const [activeIndex, setActiveIndex] = useState(0);
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
      Math.max(0, Math.floor(Math.min(0.999999, Math.max(0, v)) * ITEMS.length)),
    );
    setActiveIndex((prev) => (prev === next ? prev : next));
  });

  const scrollToIndex = (i: number) => {
    const el = containerRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    el.scrollTo({ top: ((i + 0.5) / ITEMS.length) * max, behavior: "smooth" });
  };

  if (reduceMotion) {
    const item = ITEMS[0]!;
    return (
      <div className="absolute inset-0 overflow-hidden bg-[#dddddd]">
        <img
          src={item.media}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
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
      }}
    >
      <div className="relative" style={{ height: ITEMS.length * stageH }}>
        <div
          className="sticky top-0 w-full overflow-hidden bg-[#dddddd]"
          style={{ height: stageH }}
        >
          {ITEMS.map((item, i) => (
            <MiniMediaLayer
              key={item.media}
              item={item}
              index={i}
              count={ITEMS.length}
              progress={progress}
              active={i === activeIndex}
            />
          ))}
          {ITEMS.map((item, i) => (
            <MiniTitleLayer
              key={item.title}
              item={item}
              index={i}
              count={ITEMS.length}
              progress={progress}
              active={i === activeIndex}
            />
          ))}

          {/* Floating glass thumbnail dock */}
          <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <div className="flex flex-col items-center">
              <div
                aria-hidden="true"
                className="mb-[5px] flex h-[5px] w-[18px] items-center justify-center rounded-full bg-white/20"
                style={{ backdropFilter: "blur(20px)" }}
              >
                <div className="h-[2px] w-[13px] rounded-full bg-white/50" />
              </div>
              <div
                role="tablist"
                aria-label="Gallery items"
                className="flex flex-col gap-[5px] rounded-[9px] bg-white/20 p-[6px]"
                style={{
                  backdropFilter: "blur(30px)",
                  WebkitBackdropFilter: "blur(30px)",
                }}
              >
                {ITEMS.map((item, i) => (
                  <button
                    key={item.media}
                    role="tab"
                    aria-selected={i === activeIndex}
                    aria-label={`Go to ${item.title}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      scrollToIndex(i);
                    }}
                    className="relative shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                    style={{ width: 28, height: 28, borderRadius: 5 }}
                  >
                    <img
                      src={item.media}
                      alt=""
                      aria-hidden="true"
                      draggable={false}
                      loading="lazy"
                      className="h-full w-full rounded-[5px] object-cover"
                      style={{ pointerEvents: "none" }}
                    />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute rounded-[7px] border-[1.5px] border-white transition-all duration-300"
                      style={{
                        inset: -2.5,
                        opacity: i === activeIndex ? 1 : 0,
                        transform:
                          i === activeIndex ? "scale(1)" : "scale(0.92)",
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Scroll progress ticks */}
          <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 gap-1">
            {ITEMS.map((item, i) => (
              <span
                key={item.title}
                className={
                  i === activeIndex
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
