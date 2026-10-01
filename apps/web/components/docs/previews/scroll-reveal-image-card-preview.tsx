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

interface MiniImage {
  src: string;
  alt: string;
}

const IMAGES: MiniImage[] = [
  {
    src: "/images/spiral-3d-slider/dark-glitch.jpg",
    alt: "Editorial portrait crossed by dark horizontal light trails",
  },
  {
    src: "/images/spiral-3d-slider/red-echo.jpg",
    alt: "Red fashion portrait swept through a long exposure",
  },
  {
    src: "/images/spiral-3d-slider/crimson-profile.jpg",
    alt: "Crimson profile emerging from a deep green shadow",
  },
];

function MiniRevealLayer({
  image,
  index,
  count,
  progress,
}: {
  image: MiniImage;
  index: number;
  count: number;
  progress: MotionValue<number>;
}) {
  const step = count > 1 ? 1 / (count - 1) : 1;
  const revealStart = Math.max(0, (index - 1) * step);
  const revealEnd = index * step;
  const clipPath = useTransform(
    progress,
    [revealStart, revealEnd || 1],
    index === 0
      ? ["inset(0% 0 0 0)", "inset(0% 0 0 0)"]
      : ["inset(100% 0 0 0)", "inset(0% 0 0 0)"],
  );

  return (
    <motion.div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden"
      style={{ clipPath, zIndex: index + 1 }}
    >
      <img
        src={image.src}
        alt=""
        className="h-full w-full scale-[1.08] object-cover"
        draggable={false}
        style={{ filter: "brightness(0.62) saturate(0.9)" }}
      />
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute left-1/2 top-1/2 z-10 h-[74%] w-[34%] -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-black shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        <img
          src={image.src}
          alt={image.alt}
          className="h-full w-full scale-[1.04] object-cover"
          draggable={false}
          loading={index === 0 ? "eager" : "lazy"}
          style={{ filter: "brightness(1.12) saturate(1.08)" }}
        />
      </div>
    </motion.div>
  );
}

/**
 * Interactive mini ScrollRevealImage for gallery cards.
 * The card itself is the scroll container — scrolling over the card scrubs
 * the reveal sequence via a sticky stage pinned inside a 300% track.
 */
export function ScrollRevealImageCardPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ container: containerRef });
  const progress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 30,
    mass: 0.18,
    restDelta: 0.001,
  });
  const [active, setActive] = useState(0);
  // Measured stage height (the visible card media height) — the track is
  // exactly one stage per image, no container-query units needed.
  const [stageH, setStageH] = useState(192);

  // Self-playing: gently ping-pong the scrub while visible so frames
  // arrive in their centered window with no manual wheel input.
  useAutoplayScrollScrub(containerRef, { phase: 0.45, durationMs: 7200 });

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
      IMAGES.length - 1,
      Math.max(0, Math.floor(v * IMAGES.length)),
    );
    setActive((prev) => (prev === next ? prev : next));
  });

  if (reduceMotion) {
    const image = IMAGES[0]!;
    return (
      <div className="absolute inset-0 overflow-hidden bg-black">
        <img
          src={image.src}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-80"
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
      <div className="relative" style={{ height: IMAGES.length * stageH }}>
        <div
          className="sticky top-0 w-full overflow-hidden bg-black"
          style={{ height: stageH }}
        >
          {IMAGES.map((image, index) => (
            <MiniRevealLayer
              key={`${image.src}-${index}`}
              image={image}
              index={index}
              count={IMAGES.length}
              progress={progress}
            />
          ))}
          {/* Scroll progress ticks */}
          <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 gap-1">
            {IMAGES.map((image, i) => (
              <span
                key={image.src}
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
