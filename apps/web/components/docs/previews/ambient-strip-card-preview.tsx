"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";

import { ambientStripDemoItems } from "./ambient-strip-items";

const MINI_ITEMS = ambientStripDemoItems
  .filter((item) => item.type !== "video")
  .slice(0, 7);

const CARD_W = 92;
const CARD_H = Math.round(CARD_W * 1.35);
const ACTIVE_W = 104;
const ACTIVE_H = Math.round(ACTIVE_W * 1.35);
const GAP = 8;
const STEP = CARD_W + GAP;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export function AmbientStripCardPreview() {
  const reduceMotion = useReducedMotion() ?? false;
  const [active, setActive] = React.useState(3);

  React.useEffect(() => {
    if (reduceMotion) return;

    const interval = window.setInterval(() => {
      setActive((current) => (current + 1) % MINI_ITEMS.length);
    }, 2600);

    return () => window.clearInterval(interval);
  }, [reduceMotion]);

  const shift = -(active * STEP + CARD_W / 2);

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden bg-[#c8c8c8]"
    >
      <div className="absolute inset-0">
        {MINI_ITEMS.map((item, index) => (
          <img
            key={item.src}
            src={item.src}
            alt=""
            draggable={false}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full select-none object-cover transition-opacity duration-700 ease-out"
            style={{
              opacity: index === active ? 1 : 0,
              filter: "blur(44px) saturate(1.35)",
              transform: "scale(1.6)",
            }}
          />
        ))}
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <div className="absolute left-1/2 top-1/2 h-0 w-0">
        <div
          className="absolute left-0 top-0 w-0"
          style={{
            transform: `translateX(${shift}px)`,
            transition: reduceMotion ? "none" : `transform 700ms ${EASE}`,
          }}
        >
          {MINI_ITEMS.map((item, index) => {
            const isActive = index === active;
            const width = isActive ? ACTIVE_W : CARD_W;
            const height = isActive ? ACTIVE_H : CARD_H;

            return (
              <div
                key={item.src}
                className="absolute overflow-hidden rounded-[9px] bg-neutral-900"
                style={{
                  left: index * STEP,
                  top: 0,
                  width,
                  height,
                  marginTop: height / -2,
                  zIndex: isActive ? 10 : 1,
                  opacity: isActive ? 1 : 0.86,
                  boxShadow: isActive
                    ? "0 18px 36px -18px rgba(0, 0, 0, 0.55)"
                    : "0 6px 16px -10px rgba(0, 0, 0, 0.35)",
                  transition: reduceMotion
                    ? "none"
                    : `width 700ms ${EASE}, height 700ms ${EASE}, opacity 700ms ${EASE}, box-shadow 700ms ${EASE}`,
                }}
              >
                <img
                  src={item.src}
                  alt=""
                  draggable={false}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full select-none object-cover"
                />
                <div
                  className="absolute inset-x-0 bottom-0 h-[60%]"
                  style={{
                    opacity: isActive ? 1 : 0,
                    background:
                      "linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent 64%)",
                    transition: reduceMotion ? "none" : `opacity 500ms ${EASE}`,
                  }}
                />
                <div
                  className="absolute inset-x-2.5 bottom-2.5 overflow-hidden"
                  style={{
                    opacity: isActive ? 1 : 0,
                    transition: reduceMotion ? "none" : `opacity 500ms ${EASE}`,
                  }}
                >
                  <p className="truncate text-[10px] font-medium leading-tight text-white">
                    {item.title}
                  </p>
                  <span
                    className="mt-1 block h-px w-4 bg-white/60"
                    aria-hidden="true"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
