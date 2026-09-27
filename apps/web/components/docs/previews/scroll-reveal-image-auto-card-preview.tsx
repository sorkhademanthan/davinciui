"use client";

import { motion, useReducedMotion } from "framer-motion";
import * as React from "react";

const IMAGES = [
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

/**
 * Auto-playing mini ScrollRevealImage for gallery cards.
 * Cycles the reveal sequence on its own — no scrolling required.
 */
export function ScrollRevealImageAutoCardPreview() {
  const reduceMotion = useReducedMotion() ?? false;
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      setActive((a) => (a + 1) % IMAGES.length);
    }, 2200);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

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
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-black">
      {IMAGES.map((image, index) => {
        const visible = index <= active;
        return (
          <motion.div
            key={image.src}
            className="absolute inset-0 overflow-hidden"
            style={{ zIndex: index + 1 }}
            initial={false}
            animate={{
              clipPath: visible ? "inset(0% 0 0 0)" : "inset(100% 0 0 0)",
            }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <img
              src={image.src}
              alt=""
              className="h-full w-full scale-[1.08] object-cover"
              draggable={false}
              loading={index === 0 ? "eager" : "lazy"}
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
      })}
      {/* Autoplay progress ticks */}
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
  );
}
