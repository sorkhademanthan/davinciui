"use client";

import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useState } from "react";

interface MiniColumn {
  heights: number[];
}

const LOCAL = (file: string) => `/images/spiral-3d-slider/${file}`;

// Three columns with deliberately mismatched image heights — the editorial
// collage look. Each column's heights are fixed pixels so the duplicated
// content math stays deterministic at any card size.
const COLUMNS: MiniColumn[] = [
  { heights: [120, 84, 135] },
  { heights: [90, 142, 104] },
  { heights: [135, 96, 84] },
];

const COLUMN_IMAGES: string[][] = [
  [
    LOCAL("green-portrait.jpg"),
    LOCAL("blue-double.jpg"),
    LOCAL("prism-portrait.jpg"),
  ],
  [
    LOCAL("dark-glitch.jpg"),
    LOCAL("red-echo.jpg"),
    LOCAL("crimson-profile.jpg"),
  ],
  [
    LOCAL("white-motion.jpg"),
    LOCAL("visor-portrait.jpg"),
    LOCAL("catalog-preview.jpg"),
  ],
];

// Per-column travel ranges around the centered middle copy.
// Alternating directions, different speeds — mirrors the full component.
const COLUMN_RANGES: Array<[number, number]> = [
  [24, -64],
  [-56, 20],
  [28, -72],
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
 * Auto-playing mini Scroll Sync Gallery for gallery cards.
 * The columns drift continuously on their own — three columns at
 * different speeds and alternating directions, mirroring the full
 * component with no scrolling required.
 */
export function ScrollSyncGalleryCardPreview() {
  const reduceMotion = useReducedMotion() ?? false;
  const progress = useMotionValue(0);
  const [active, setActive] = useState(0);

  // Continuous back-and-forth drift (mirrored so the loop has no seam).
  useEffect(() => {
    if (reduceMotion) return;
    const controls = animate(progress, 1, {
      duration: 7,
      repeat: Infinity,
      repeatType: "mirror",
      ease: "easeInOut",
    });
    return () => controls.stop();
  }, [progress, reduceMotion]);

  useMotionValueEvent(progress, "change", (v) => {
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
    <div className="absolute inset-0 overflow-hidden bg-[#0b0b0c]">
      <div className="flex h-full w-full" style={{ gap: MINI_GAP }}>
        {COLUMNS.map((_, i) => (
          <MiniSyncColumn key={i} index={i} progress={progress} />
        ))}
        {/* Drift position ticks */}
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
  );
}
