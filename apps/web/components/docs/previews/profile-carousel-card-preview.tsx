"use client";

import { cn } from "@/lib/utils";
import { useReducedMotion } from "framer-motion";
import * as React from "react";

const MINI_PROFILES = [
  {
    id: "blue-double",
    src: "/images/spiral-3d-slider/blue-double.webp",
    alt: "Blue double-exposure portrait",
  },
  {
    id: "dark-glitch",
    src: "/images/spiral-3d-slider/dark-glitch.webp",
    alt: "Editorial portrait with light trails",
  },
  {
    id: "prism-portrait",
    src: "/images/spiral-3d-slider/prism-portrait.webp",
    alt: "Portrait in green and magenta light",
  },
  {
    id: "silver-motion",
    src: "/images/spiral-3d-slider/silver-motion.webp",
    alt: "Silver portrait in soft exposure",
  },
  {
    id: "red-echo",
    src: "/images/spiral-3d-slider/red-echo.webp",
    alt: "Red fashion portrait",
  },
];

const COUNT = MINI_PROFILES.length;
const CARD_W = 64;
const CARD_H = 98;
const GAP = 8;
const STEP = CARD_W + GAP;
const LEAD = 12 - CARD_W * 0.5;

const mod = (n: number, m: number) => ((n % m) + m) % m;

function MiniPortrait({ src, alt }: { src: string; alt: string }) {
  return (
    <div
      className="shrink-0 grow-0 overflow-hidden rounded-[8px] bg-zinc-200 dark:bg-zinc-800"
      style={{ width: CARD_W, height: CARD_H }}
    >
      <img
        src={src}
        alt=""
        aria-hidden="true"
        draggable={false}
        loading="lazy"
        className="h-full w-full select-none object-cover"
      />
      <span className="sr-only">{alt}</span>
    </div>
  );
}

function MiniDetail({ src }: { src: string }) {
  return (
    <div
      className="flex shrink-0 grow-0 flex-col overflow-hidden rounded-[8px] bg-white shadow-[0_6px_18px_rgba(0,0,0,0.12)] dark:bg-zinc-950 dark:shadow-[0_6px_18px_rgba(0,0,0,0.5)]"
      style={{ width: CARD_W, height: CARD_H }}
    >
      <div className="h-[55%] w-full shrink-0 overflow-hidden bg-zinc-200 dark:bg-zinc-800">
        <img
          src={src}
          alt=""
          aria-hidden="true"
          draggable={false}
          loading="lazy"
          className="h-full w-full select-none object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col justify-center gap-1 px-1.5">
        <span className="block h-1 w-4/5 rounded-full bg-zinc-900 dark:bg-zinc-100" />
        <span className="block h-1 w-3/5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
        <span className="mt-0.5 flex items-center justify-between">
          <span className="block h-1 w-1/4 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          <span className="block h-2.5 w-2/5 rounded-full bg-zinc-950 dark:bg-zinc-50" />
        </span>
      </div>
    </div>
  );
}

export function ProfileCarouselCardPreview() {
  const reduceMotion = useReducedMotion() ?? false;
  const trackRef = React.useRef<HTMLDivElement>(null);
  const instantRef = React.useRef(false);
  // Middle copy of the tripled strip; the detail card sits one slot ahead.
  const [pos, setPos] = React.useState(COUNT);
  const posRef = React.useRef(pos);
  posRef.current = pos;

  React.useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      posRef.current += 1;
      setPos(posRef.current);
    }, 1800);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  React.useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const instant = instantRef.current || reduceMotion;
    instantRef.current = false;
    track.style.transition = instant
      ? "none"
      : "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)";
    track.style.transform = `translate3d(${LEAD - posRef.current * STEP}px, 0, 0)`;
  });

  const handleTransitionEnd = (
    event: React.TransitionEvent<HTMLDivElement>,
  ) => {
    if (event.target !== trackRef.current) return;
    const p = posRef.current;
    const rel = p - COUNT;
    if (rel < 0 || rel >= COUNT) {
      instantRef.current = true;
      const next = p - Math.floor(rel / COUNT) * COUNT;
      posRef.current = next;
      setPos(next);
    }
  };

  const detailSlot = pos + 1;
  const extended = Array.from({ length: COUNT * 3 }, (_, i) => ({
    ...MINI_PROFILES[mod(i, COUNT)]!,
    slot: i,
    key: `${MINI_PROFILES[mod(i, COUNT)]!.id}--${Math.floor(i / COUNT)}`,
  }));

  return (
    <div
      aria-hidden="true"
      className={cn(
        "absolute inset-0 overflow-hidden bg-white",
        "transition-colors duration-300 dark:bg-[#0a0a0b]",
      )}
    >
      <div className="flex h-full w-full items-center">
        <div
          ref={trackRef}
          onTransitionEnd={handleTransitionEnd}
          className="flex w-max flex-nowrap items-stretch will-change-transform"
          style={{ columnGap: GAP }}
        >
          {extended.map((item) =>
            item.slot === detailSlot ? (
              <MiniDetail key={item.key} src={item.src} />
            ) : (
              <MiniPortrait key={item.key} src={item.src} alt={item.alt} />
            ),
          )}
        </div>
      </div>
    </div>
  );
}
