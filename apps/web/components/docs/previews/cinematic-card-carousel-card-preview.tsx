"use client";

import { cn } from "@/lib/utils";
import { useReducedMotion } from "framer-motion";
import * as React from "react";

const MINI_ITEMS = [
  {
    id: "long-take",
    src: "/images/spiral-3d-slider/blue-double.jpg",
    alt: "Blue double-exposure portrait",
  },
  {
    id: "loading-dock",
    src: "/images/spiral-3d-slider/dark-glitch.jpg",
    alt: "Editorial portrait with light trails",
  },
  {
    id: "first-light",
    src: "/images/spiral-3d-slider/prism-portrait.jpg",
    alt: "Portrait in green and magenta light",
  },
  {
    id: "silver-reel",
    src: "/images/spiral-3d-slider/silver-motion.jpg",
    alt: "Silver portrait in soft exposure",
  },
  {
    id: "red-echo",
    src: "/images/spiral-3d-slider/red-echo.jpg",
    alt: "Red fashion portrait",
  },
];

const CARD_W = 92;
const CARD_H = Math.round((CARD_W * 490) / 320); // ~141

/** Compact depth curve for the 192px card slot — same language, tighter offsets. */
function miniDepth(absRel: number) {
  const d = Math.min(absRel, 2);
  return {
    x: d >= 2 ? 92 : d >= 1 ? 54 + (d - 1) * 38 : d * 54,
    scale: 1 - d * 0.12,
    opacity: 1 - d * 0.21,
    blur: d * 1.75,
    brightness: 1 - d * 0.05,
  };
}

const mod = (n: number, m: number) => ((n % m) + m) % m;

export function CinematicCardCarouselCardPreview() {
  const reduceMotion = useReducedMotion() ?? false;
  const [active, setActive] = React.useState(2);

  React.useEffect(() => {
    if (reduceMotion) return;

    const interval = window.setInterval(() => {
      setActive((current) => mod(current + 1, MINI_ITEMS.length));
    }, 1800);

    return () => window.clearInterval(interval);
  }, [reduceMotion]);

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden bg-[#fafaf8] transition-colors duration-300 dark:bg-[#0a0a0b]"
    >
      <div className="absolute left-1/2 top-1/2 h-0 w-0">
        {MINI_ITEMS.map((item, index) => {
          const raw = mod(index - active, MINI_ITEMS.length);
          const rel = raw > MINI_ITEMS.length / 2 ? raw - MINI_ITEMS.length : raw;
          const abs = Math.abs(rel);
          if (abs > 2) return null;
          const s = miniDepth(abs);
          return (
            <div
              key={item.id}
              className={cn(
                "absolute left-0 top-0 overflow-hidden rounded-[10px] bg-zinc-200 dark:bg-zinc-900",
                "transition-[transform,filter,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
              )}
              style={{
                width: CARD_W,
                height: CARD_H,
                marginLeft: -CARD_W / 2,
                marginTop: -CARD_H / 2,
                zIndex: 10 - Math.round(abs) * 3,
                opacity: s.opacity,
                transform: `translateX(${Math.sign(rel) * s.x}px) scale(${s.scale})`,
                filter: `blur(${s.blur}px) brightness(${s.brightness})`,
                boxShadow:
                  abs < 0.5
                    ? "0 14px 34px rgba(0,0,0,0.18)"
                    : "0 8px 20px rgba(0,0,0,0.1)",
              }}
            >
              <img
                src={item.src}
                alt=""
                draggable={false}
                loading="lazy"
                className={cn("absolute inset-0 h-full w-full object-cover", "select-none")}
              />
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 45%, transparent 75%)",
                }}
              />
              {abs < 0.5 && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-2.5 left-2.5 block h-px w-4 bg-white/70"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
