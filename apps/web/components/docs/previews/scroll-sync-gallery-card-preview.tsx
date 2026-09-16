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

interface MiniColumn {
  heights: number[];
}

const Q = "?q=80&w=300&auto=format&fit=crop";

// Four columns with deliberately mismatched image heights — the editorial
// collage look. Each column's heights are fixed pixels so the duplicated
// content math stays deterministic at any card size.
const COLUMNS: MiniColumn[] = [
  { heights: [64, 44, 72, 52] },
  { heights: [48, 76, 56, 60] },
  { heights: [72, 52, 44, 68] },
  { heights: [56, 64, 72, 48] },
];

const COLUMN_IMAGES: string[][] = [
  [
    `https://images.unsplash.com/photo-1506905925346-21bda4d32df4${Q}`,
    `https://images.unsplash.com/photo-1529139574466-a303027c1d8b${Q}`,
    `https://images.unsplash.com/photo-1493863641943-9b68992a8d07${Q}`,
    `https://images.unsplash.com/photo-1534528741775-53994a69daeb${Q}`,
  ],
  [
    `https://images.unsplash.com/photo-1490481651871-ab68de25d43d${Q}`,
    `https://images.unsplash.com/photo-1506794778202-cad84cf45f1d${Q}`,
    `https://images.unsplash.com/photo-1517841905240-472988babdf9${Q}`,
    `https://images.unsplash.com/photo-1473580044384-7ba9967e16a0${Q}`,
  ],
  [
    `https://images.unsplash.com/photo-1469334031218-e382a71b716b${Q}`,
    `https://images.unsplash.com/photo-1501281668745-f7f57925c3b4${Q}`,
    `https://images.unsplash.com/photo-1483985988355-763728e1935b${Q}`,
    `https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05${Q}`,
  ],
  [
    `https://images.unsplash.com/photo-1445205170230-053b83016050${Q}`,
    `https://images.unsplash.com/photo-1531123897727-8f129e1688ce${Q}`,
    `https://images.unsplash.com/photo-1515886657613-9f3515b0c78f${Q}`,
    `https://images.unsplash.com/photo-1500648767791-00dcc994a43e${Q}`,
  ],
];

// Per-column travel ranges around the centered middle copy.
// Alternating directions, different speeds — mirrors the full component.
const COLUMN_RANGES: Array<[number, number]> = [
  [24, -64],
  [-56, 20],
  [28, -72],
  [-48, 24],
];

const MINI_GAP = 3;
const REPEAT = 3;

function MiniSyncColumn({
  index,
  progress,
}: {
  index: number;
  progress: MotionValue<number>;
}) {
  const heights = COLUMNS[index]!.heights;
  const images = COLUMN_IMAGES[index]!;
  const setH = heights.reduce((a, b) => a + b, 0) + MINI_GAP * (heights.length - 1);
  const base = -setH;
  const [from, to] = COLUMN_RANGES[index] ?? [0, -40];
  const y = useTransform(progress, [0, 1], [base + from, base + to]);

  return (
    <div className="h-full min-w-0 flex-1 overflow-hidden">
      <motion.div className="flex w-full flex-col" style={{ gap: MINI_GAP, y }}>
        {Array.from({ length: REPEAT }, (_, r) =>
          heights.map((h, i) => (
            <img
              key={`${r}-${i}`}
              src={images[i % images.length]}
              alt=""
              aria-hidden="true"
              draggable={false}
              loading={r === 1 && i < 2 ? "eager" : "lazy"}
              className="block w-full select-none object-cover"
              style={{ height: h }}
            />
          )),
        )}
      </motion.div>
    </div>
  );
}

/**
 * Interactive mini Scroll Sync Gallery for gallery cards.
 * The card itself is the scroll container — scrolling over the card scrubs
 * four columns at different speeds and alternating directions via a sticky
 * stage, exactly like the full component.
 */
export function ScrollSyncGalleryCardPreview() {
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
  // exactly 2.5 stages, no container-query units needed.
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
    const next = Math.min(2, Math.max(0, Math.floor(Math.min(0.999999, Math.max(0, v)) * 3)));
    setActive((prev) => (prev === next ? prev : next));
  });

  if (reduceMotion) {
    return (
      <div className="absolute inset-0 flex overflow-hidden bg-[#0b0b0c]" style={{ gap: MINI_GAP }}>
        {COLUMN_IMAGES.map((images, ci) => (
          <div key={ci} className="flex min-w-0 flex-1 flex-col" style={{ gap: MINI_GAP }}>
            {COLUMNS[ci]!.heights.slice(0, 3).map((h, i) => (
              <img
                key={i}
                src={images[i % images.length]}
                alt=""
                aria-hidden="true"
                className="block w-full object-cover"
                style={{ height: h }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-y-auto overflow-x-hidden bg-[#0b0b0c] [&::-webkit-scrollbar]:hidden"
      style={{
        scrollbarWidth: "none",
        overscrollBehaviorY: "contain",
      }}
    >
      <div className="relative" style={{ height: 2.5 * stageH }}>
        <div
          className="sticky top-0 flex w-full overflow-hidden bg-[#0b0b0c]"
          style={{ height: stageH, gap: MINI_GAP }}
        >
          {COLUMNS.map((_, i) => (
            <MiniSyncColumn key={i} index={i} progress={progress} />
          ))}
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
