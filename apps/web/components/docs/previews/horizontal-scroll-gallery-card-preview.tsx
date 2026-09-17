"use client";

import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

const Q = "?q=60&w=600&auto=format&fit=crop";

interface MiniItem {
  src: string;
  label: string;
  /** Width in px at card scale — deliberately varied like the reference. */
  w: number;
}

const ITEMS: MiniItem[] = [
  {
    src: `https://images.unsplash.com/photo-1501004318641-b39e6451bec6${Q}`,
    label: "Green Fern",
    w: 118,
  },
  {
    src: `https://images.unsplash.com/photo-1490750967868-88aa4486c946${Q}`,
    label: "Yellow Flower",
    w: 158,
  },
  {
    src: `https://images.unsplash.com/photo-1494972308805-463bc619d34e${Q}`,
    label: "Orange Flower",
    w: 142,
  },
  {
    src: `https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07${Q}`,
    label: "Purple Flower",
    w: 124,
  },
  {
    src: `https://images.unsplash.com/photo-1522383225653-ed111181a951${Q}`,
    label: "Blossom",
    w: 150,
  },
];

const MINI_GAP = 6;
const MINI_INSET = 10;
const MINI_H = 118;

/**
 * Interactive mini HorizontalScrollGallery for gallery cards.
 * Scrolling over the card scrubs a variable-width film strip
 * horizontally via a sticky stage, mirroring the full component.
 */
export function HorizontalScrollGalleryCardPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ container: containerRef });
  const progress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 30,
    mass: 0.4,
    restDelta: 0.001,
  });
  const [active, setActive] = useState(0);
  const [stageH, setStageH] = useState(192);
  const [travel, setTravel] = useState(280);

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

  // Dimension-driven travel: track width minus visible stage width.
  useEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      const stage = stageRef.current;
      if (!track || !stage) return;
      setTravel(Math.max(0, track.scrollWidth - stage.clientWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    if (stageRef.current) ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, []);

  const x = useTransform(progress, [0, 1], [0, -travel]);

  // Capture wheel intent over the card so scrolling scrubs the preview
  // instead of the page. Pinch-zoom (ctrlKey) is never intercepted.
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
      2,
      Math.max(0, Math.floor(Math.min(0.999999, Math.max(0, v)) * 3)),
    );
    setActive((prev) => (prev === next ? prev : next));
  });

  if (reduceMotion) {
    return (
      <div className="absolute inset-0 overflow-x-auto bg-white dark:bg-black">
        <div className="flex h-full items-center" style={{ gap: MINI_GAP, paddingInline: MINI_INSET }}>
          {ITEMS.slice(0, 4).map((item) => (
            <figure
              key={item.label}
              className="relative flex-none overflow-hidden rounded-md bg-zinc-200 dark:bg-zinc-900"
              style={{ width: item.w, height: MINI_H }}
            >
              <img
                src={item.src}
                alt=""
                aria-hidden="true"
                className="block h-full w-full object-cover"
                draggable={false}
              />
            </figure>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-y-auto overflow-x-hidden bg-white dark:bg-black [&::-webkit-scrollbar]:hidden"
      style={{
        scrollbarWidth: "none",
        overscrollBehaviorY: "contain",
      }}
    >
      <div className="relative" style={{ height: 2.5 * stageH }}>
        <div
          ref={stageRef}
          className="sticky top-0 flex w-full flex-col overflow-hidden bg-white dark:bg-black"
          style={{ height: stageH }}
        >
          <div className="flex w-full flex-1 items-center">
            <motion.div
              ref={trackRef}
              className="flex w-max items-stretch"
              style={{ gap: MINI_GAP, paddingInline: MINI_INSET, x, willChange: "transform" }}
            >
              {ITEMS.map((item) => (
                <figure
                  key={item.label}
                  className="relative flex-none overflow-hidden rounded-md bg-zinc-200 dark:bg-zinc-900"
                  style={{ width: item.w, height: MINI_H, flex: "0 0 auto" }}
                >
                  <img
                    src={item.src}
                    alt=""
                    aria-hidden="true"
                    draggable={false}
                    loading="lazy"
                    className="block h-full w-full object-cover"
                  />
                  <figcaption className="absolute bottom-[6px] left-[7px] rounded-[3px] bg-white/70 px-1 py-px text-[7px] font-medium tracking-wide text-zinc-900 dark:bg-black/45 dark:text-white/90">
                    {item.label}
                  </figcaption>
                </figure>
              ))}
            </motion.div>
          </div>
          {/* Scroll progress ticks */}
          <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
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
