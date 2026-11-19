"use client";

import * as React from "react";

const COLUMN_COUNT = 8;

/**
 * Miniature looping version of the staircase preloader for the gallery
 * card: solid orange holds, then 8 strips lift upward with a left → right
 * stagger so the lower edge reads as a staircase, revealing DAVINCIUI behind.
 */
export function StaircasePreloaderCardPreview() {
  const columnRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  React.useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const HOLD_MS = 500;
    const EXIT_MS = 900;
    const STAGGER_MS = 60;
    const SHOW_MS = 1400;
    const CYCLE_MS = HOLD_MS + EXIT_MS + STAGGER_MS * (COLUMN_COUNT - 1) + SHOW_MS;

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const tick = (now: number) => {
      const elapsed = (now - start) % CYCLE_MS;

      for (let i = 0; i < COLUMN_COUNT; i++) {
        const node = columnRefs.current[i];
        if (!node) continue;
        const localStart = HOLD_MS + i * STAGGER_MS;
        const localEnd = localStart + EXIT_MS;

        if (elapsed < localStart) {
          node.style.transform = "translateY(0%)";
        } else if (elapsed < localEnd) {
          const t = (elapsed - localStart) / EXIT_MS;
          const eased = easeInOutCubic(Math.min(1, Math.max(0, t)));
          node.style.transform = `translateY(${-eased * 101}%)`;
        } else {
          node.style.transform = "translateY(-101%)";
        }
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className="absolute inset-0 overflow-hidden bg-white dark:bg-zinc-950"
      style={{ containerType: "inline-size" }}
    >
      {/* Page content sitting underneath the overlay */}
      <div className="absolute inset-0 flex items-center justify-center px-3">
        <span className="whitespace-nowrap text-[clamp(1.75rem,11cqi,3rem)] font-black leading-none tracking-[-0.04em] text-zinc-950 select-none dark:text-zinc-50">
          DAVINCIUI
        </span>
      </div>
      {/* Stepped curtain overlay */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: COLUMN_COUNT }, (_, index) => (
          <div
            key={index}
            ref={(node) => {
              columnRefs.current[index] = node;
            }}
            aria-hidden="true"
            className="absolute top-0 bottom-0 bg-[#FF3D00]"
            style={{
              left: `${(index * 100) / COLUMN_COUNT}%`,
              width: `calc(${100 / COLUMN_COUNT}% + 1.5px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
