"use client";

import * as React from "react";
import { useTheme } from "next-themes";

const SQUARES = Array.from({ length: 7 }, (_, index) => index);

/**
 * Miniature looping version of the geometric preloader for the gallery
 * card: nested squares counter-rotate while a staged counter ticks and
 * each square ignites in orange, then a true diamond clip-path reveal
 * uncovers DAVINCIUI underneath. Loops forever, follows the site theme.
 */
export function GeometricPreloaderCardPreview() {
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const counterRef = React.useRef<HTMLSpanElement>(null);
  const squareRefs = React.useRef<Array<HTMLSpanElement | null>>([]);
  const { resolvedTheme } = useTheme();
  const light = resolvedTheme === "light";
  const overlayBg = light ? "#e8e6e3" : "#111111";
  const lineColor = light ? "#1b1b19" : "#f5f1e8";
  const accent = "#ff4d23";
  const colorsRef = React.useRef({ lineColor, accent });
  colorsRef.current = { lineColor, accent };

  React.useEffect(() => {
    let raf = 0;
    const start = performance.now();

    const COUNT_MS = 2200;
    const HOLD_MS = 450;
    const EXIT_MS = 800;
    const SHOW_MS = 1400;
    const CYCLE_MS = COUNT_MS + HOLD_MS + EXIT_MS + SHOW_MS;
    const KEYS = [0, 8, 55, 82, 94, 100];
    const TIMES = [0, 0.15, 0.5, 0.72, 0.88, 1];

    const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
    const smooth = (t: number) => {
      const c = clamp01(t);
      return c * c * (3 - 2 * c);
    };
    const easeInOut = (t: number) => {
      const c = clamp01(t);
      return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
    };
    const staged = (t: number) => {
      const c = clamp01(t);
      for (let i = 1; i < TIMES.length; i += 1) {
        const t1 = TIMES[i] ?? 1;
        if (c <= t1) {
          const t0 = TIMES[i - 1] ?? 0;
          const v0 = KEYS[i - 1] ?? 0;
          const v1 = KEYS[i] ?? 100;
          return v0 + (v1 - v0) * smooth(t1 <= t0 ? 1 : (c - t0) / (t1 - t0));
        }
      }
      return 100;
    };
    const diamond = (t: number) => {
      const SPLIT = 0.45;
      if (t <= SPLIT) {
        const c = (easeInOut(t / SPLIT) * 50).toFixed(2);
        const mc = (100 - Number(c)).toFixed(2);
        return (
          `polygon(${c}% 0%, ${mc}% 0%, 100% ${c}%, 100% ${mc}%, ` +
          `${mc}% 100%, ${c}% 100%, 0% ${mc}%, 0% ${c}%)`
        );
      }
      const v = easeInOut((t - SPLIT) / (1 - SPLIT));
      const f = (n: number) => n.toFixed(2);
      return (
        `polygon(50% ${f(v * 50)}%, ${f(100 - v * 50)}% 50%, ` +
        `50% ${f(100 - v * 50)}%, ${f(v * 50)}% 50%)`
      );
    };

    let lastValue = -1;
    const tick = (now: number) => {
      const elapsed = (now - start) % CYCLE_MS;
      const overlay = overlayRef.current;
      const counter = counterRef.current;
      const { lineColor: line, accent: acc } = colorsRef.current;

      if (elapsed < COUNT_MS + HOLD_MS) {
        const value =
          elapsed < COUNT_MS
            ? Math.round(staged(elapsed / COUNT_MS))
            : 100;
        if (value !== lastValue) {
          lastValue = value;
          if (counter) counter.textContent = `${value}%`;
          for (let i = 0; i < SQUARES.length; i += 1) {
            const el = squareRefs.current[i];
            if (!el) continue;
            const lit = value >= ((i + 1) / SQUARES.length) * 100;
            el.style.borderColor = lit ? acc : `${line}55`;
            el.style.opacity = lit ? "1" : "0.7";
          }
        }
        if (overlay) {
          overlay.style.clipPath = "none";
          overlay.style.transform = "translateY(0%)";
        }
      } else if (elapsed < COUNT_MS + HOLD_MS + EXIT_MS) {
        const t =
          (elapsed - COUNT_MS - HOLD_MS) / EXIT_MS;
        if (overlay) overlay.style.clipPath = diamond(t);
      } else if (overlay) {
        overlay.style.clipPath = "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)";
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
        <span className="whitespace-nowrap text-[clamp(1.5rem,10cqi,2.75rem)] font-black leading-none tracking-[-0.04em] text-zinc-950 select-none dark:text-zinc-50">
          DAVINCIUI
        </span>
      </div>
      {/* Loader overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 flex items-center justify-center"
        style={{ backgroundColor: overlayBg, willChange: "clip-path" }}
      >
        <div className="relative size-[min(40cqi,11rem)]">
          {SQUARES.map((index) => {
            const size = 100 - index * 11;
            const reverse = index % 2 === 1;
            return (
              <span
                key={index}
                ref={(el) => {
                  squareRefs.current[index] = el;
                }}
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 aspect-square border"
                style={{
                  width: `${size}%`,
                  borderColor: `${lineColor}55`,
                  opacity: 0.7,
                  animation: `geometric-card-spin-${reverse ? "ccw" : "cw"} ${2.2 + index * 0.3}s linear infinite`,
                  animationDelay: `${index * -0.25}s`,
                }}
              />
            );
          })}
          <span
            ref={counterRef}
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center text-[clamp(.65rem,2.4cqi,1rem)] font-medium tabular-nums tracking-[.18em]"
            style={{ color: accent }}
          >
            0%
          </span>
        </div>
      </div>
      <style>{`@keyframes geometric-card-spin-cw { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } } @keyframes geometric-card-spin-ccw { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(-360deg); } }`}</style>
    </div>
  );
}
