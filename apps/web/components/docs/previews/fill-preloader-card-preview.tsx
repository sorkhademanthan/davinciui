"use client";

import * as React from "react";
import { useTheme } from "next-themes";

/**
 * Miniature looping version of the full fill-preloader sequence for the
 * gallery card: fill rises with a visible counter, holds at 100%,
 * then the whole overlay slides away revealing DAVINCI behind it.
 * Palette follows the site color scheme.
 */
export function FillPreloaderCardPreview() {
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const fillRef = React.useRef<HTMLDivElement>(null);
  const counterRef = React.useRef<HTMLSpanElement>(null);
  const { resolvedTheme } = useTheme();
  const light = resolvedTheme === "light";
  const overlayBg = light ? "#e8e6e3" : "#111111";
  const counterColor = light ? "#09090b" : "#ffffff";

  React.useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const FILL_MS = 2200;
    const HOLD_MS = 450;
    const EXIT_MS = 750;
    const SHOW_MS = 1400;
    const CYCLE_MS = FILL_MS + HOLD_MS + EXIT_MS + SHOW_MS;

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const tick = (now: number) => {
      const elapsed = (now - start) % CYCLE_MS;
      const overlay = overlayRef.current;
      const fill = fillRef.current;
      const counter = counterRef.current;

      if (elapsed < FILL_MS) {
        // Loading: blue surface rises, counter ticks up.
        const t = elapsed / FILL_MS;
        const eased =
          t < 0.12
            ? (t / 0.12) * 0.05
            : t < 0.55
              ? 0.05 + ((t - 0.12) / 0.43) * 0.75
              : t < 0.8
                ? 0.8 + ((t - 0.55) / 0.25) * 0.16
                : 0.96 + ((t - 0.8) / 0.2) * 0.04;
        const progress = Math.min(1, Math.max(0, eased));
        if (overlay) overlay.style.transform = "translateY(0%)";
        if (fill) fill.style.transform = `scaleY(${progress})`;
        if (counter) counter.textContent = `${Math.round(progress * 100)}%`;
      } else if (elapsed < FILL_MS + HOLD_MS) {
        // Complete: full blue, 100% held briefly.
        if (overlay) overlay.style.transform = "translateY(0%)";
        if (fill) fill.style.transform = "scaleY(1)";
        if (counter) counter.textContent = "100%";
      } else if (elapsed < FILL_MS + HOLD_MS + EXIT_MS) {
        // Exiting: entire overlay slides up, DAVINCI revealed underneath.
        const t =
          (elapsed - FILL_MS - HOLD_MS) / EXIT_MS;
        if (overlay)
          overlay.style.transform = `translateY(${-easeInOutCubic(Math.min(1, Math.max(0, t))) * 100}%)`;
        if (fill) fill.style.transform = "scaleY(1)";
        if (counter) counter.textContent = "100%";
      } else {
        // Revealed: overlay parked off-screen, DAVINCI visible.
        if (overlay) overlay.style.transform = "translateY(-100%)";
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
          DAVINCI
        </span>
      </div>
      {/* Loader overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0"
        style={{ backgroundColor: overlayBg }}
      >
        <div
          ref={fillRef}
          aria-hidden="true"
          className="absolute inset-0 bg-[#0b5ffb]"
          style={{ transform: "scaleY(0)", transformOrigin: "bottom center" }}
        />
        <span
          ref={counterRef}
          aria-hidden="true"
          className="absolute bottom-2 right-3 text-4xl font-semibold tabular-nums leading-none tracking-tight select-none"
          style={{ color: counterColor }}
        >
          0%
        </span>
      </div>
    </div>
  );
}
