"use client";

import * as React from "react";

/**
 * Miniature looping version of the editorial wipe sequence for the gallery
 * card: one cream reveal train with a beige leading edge sweeps left to
 * right over olive while the giant counter ticks up, then the whole overlay
 * slides away revealing the dark page line underneath. Loops forever.
 */
export function EditorialWipePreloaderCardPreview() {
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const trainRef = React.useRef<HTMLDivElement>(null);
  const darkNumberRef = React.useRef<HTMLSpanElement>(null);
  const lightMaskRef = React.useRef<HTMLDivElement>(null);
  const lightNumberRef = React.useRef<HTMLSpanElement>(null);
  const labelDarkRef = React.useRef<HTMLSpanElement>(null);
  const labelLightRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const FILL_MS = 2600;
    const HOLD_MS = 450;
    const EXIT_MS = 750;
    const SHOW_MS = 1400;
    const CYCLE_MS = FILL_MS + HOLD_MS + EXIT_MS + SHOW_MS;

    // Staged progression matching the full component.
    const staged = (t: number): number => {
      const keys = [0, 20, 55, 80, 95, 100];
      const times = [0, 0.16, 0.45, 0.68, 0.86, 1];
      for (let i = 1; i < times.length; i++) {
        if (t <= times[i]!) {
          const local = (t - times[i - 1]!) / (times[i]! - times[i - 1]!);
          const eased = local < 0.5 ? 2 * local * local : 1 - Math.pow(-2 * local + 2, 2) / 2;
          return keys[i - 1]! + (keys[i]! - keys[i - 1]!) * eased;
        }
      }
      return 100;
    };

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const render = (p: number) => {
      const train = trainRef.current;
      const mask = lightMaskRef.current;
      if (train) train.style.transform = `translate3d(${p - 101}cqw, 0, 0)`;
      if (mask)
        mask.style.clipPath = `inset(0 ${Math.max(0, 100 - p)}cqw 0 0)`;
      const text = `${Math.round(p)}`;
      if (darkNumberRef.current) darkNumberRef.current.textContent = text;
      if (lightNumberRef.current) lightNumberRef.current.textContent = text;
      const labelOpacity = Math.min(1, Math.max(0, (p - 38) / 30));
      if (labelDarkRef.current)
        labelDarkRef.current.style.opacity = `${labelOpacity}`;
      if (labelLightRef.current)
        labelLightRef.current.style.opacity = `${labelOpacity}`;
    };

    const tick = (now: number) => {
      const elapsed = (now - start) % CYCLE_MS;
      const overlay = overlayRef.current;

      if (elapsed < FILL_MS) {
        if (overlay) overlay.style.transform = "translateY(0%)";
        render(staged(elapsed / FILL_MS));
      } else if (elapsed < FILL_MS + HOLD_MS) {
        if (overlay) overlay.style.transform = "translateY(0%)";
        render(100);
      } else if (elapsed < FILL_MS + HOLD_MS + EXIT_MS) {
        const t = (elapsed - FILL_MS - HOLD_MS) / EXIT_MS;
        if (overlay)
          overlay.style.transform = `translateY(${-easeInOutCubic(Math.min(1, Math.max(0, t))) * 100}%)`;
      } else {
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
        <span
          className="whitespace-nowrap font-black leading-none tracking-[-0.04em] text-zinc-950 select-none dark:text-zinc-50"
          style={{ fontSize: "clamp(1.75rem, 11cqi, 3rem)" }}
        >
          DAVINCIUI
        </span>
      </div>
      {/* Loader overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 overflow-hidden"
        style={{ backgroundColor: "#1A241E" }}
      >
        <div
          ref={trainRef}
          aria-hidden="true"
          className="absolute top-0 bottom-0 left-0"
          style={{ width: "122cqw" }}
        >
          <div
            aria-hidden="true"
            className="absolute top-0 bottom-0 left-0"
            style={{ width: "100cqw", backgroundColor: "#E4E0D7" }}
          />
          <div
            aria-hidden="true"
            className="absolute top-0 bottom-0"
            style={{
              left: "100cqw",
              width: "22cqw",
              backgroundColor: "#C7B39E",
            }}
          />
        </div>
        <div
          aria-hidden="true"
          className="absolute leading-[0.72] whitespace-nowrap select-none"
          style={{ left: "5cqw", bottom: "11%" }}
        >
          <span
            ref={labelDarkRef}
            className="mb-1 block text-[6px] font-normal uppercase"
            style={{ letterSpacing: "0.02em", color: "#8A8A8A" }}
          >
            LOADING
          </span>
          <span
            ref={darkNumberRef}
            className="block tabular-nums"
            style={{
              fontSize: "24cqw",
              lineHeight: 0.72,
              letterSpacing: "-0.05em",
              color: "#8A8A8A",
            }}
          >
            0
          </span>
        </div>
        <div
          ref={lightMaskRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div
            className="absolute leading-[0.72] whitespace-nowrap select-none"
            style={{ left: "5cqw", bottom: "11%" }}
          >
            <span
              ref={labelLightRef}
              className="mb-1 block text-[6px] font-normal uppercase"
              style={{ letterSpacing: "0.02em", color: "#AAA0A1" }}
            >
              LOADING
            </span>
            <span
              ref={lightNumberRef}
              className="block tabular-nums"
              style={{
                fontSize: "24cqw",
                lineHeight: 0.72,
                letterSpacing: "-0.05em",
                color: "#AAA0A1",
              }}
            >
              0
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
