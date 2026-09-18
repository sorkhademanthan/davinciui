"use client";

import * as React from "react";

const HERO_IMAGE = "/images/da-vinci-hero.svg";

const WORD = "DA VINCI";

/**
 * Miniature looping version of the Da Vinci preloader sequence for the
 * gallery card: DA VINCI assembles from clipped slices on off-white, a
 * hero-image window opens inside the wordmark, expands to fullscreen
 * (one image, pure clip-path geometry), then the overlay fades revealing
 * the hero underneath. Loops forever.
 */
export function DaVinciPreloaderCardPreview() {
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const wordmarkRef = React.useRef<HTMLDivElement>(null);
  const revealRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const overlay = overlayRef.current;
    const wordmark = wordmarkRef.current;
    const reveal = revealRef.current;
    const charInners = wordmark
      ? Array.from(wordmark.querySelectorAll<HTMLElement>("[data-dv-card-char]"))
      : [];
    let raf = 0;
    const start = performance.now();

    const ASSEMBLE_MS = 900;
    const HOLD_MS = 500;
    const WINDOW_MS = 500;
    const SETTLE_MS = 300;
    const EXPAND_MS = 1000;
    const EXIT_MS = 500;
    const SHOW_MS = 1200;
    const CYCLE_MS =
      ASSEMBLE_MS + HOLD_MS + WINDOW_MS + SETTLE_MS + EXPAND_MS + EXIT_MS + SHOW_MS;

    const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
    const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
    const easeInOut = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    // clip-path insets as [top, right, bottom, left] in percent.
    const POINT: [number, number, number, number] = [50, 50, 50, 50];
    const WINDOW: [number, number, number, number] = [41, 35, 41, 35];
    const FULL: [number, number, number, number] = [0, 0, 0, 0];
    const lerpInset = (
      a: [number, number, number, number],
      b: [number, number, number, number],
      t: number,
    ) => {
      const e = easeInOut(t);
      const v = a.map((from, i) => from + (b[i]! - from) * e);
      return `inset(${v[0]!.toFixed(2)}% ${v[1]!.toFixed(2)}% ${v[2]!.toFixed(2)}% ${v[3]!.toFixed(2)}%)`;
    };

    const setChars = (progress: number) => {
      charInners.forEach((el, i) => {
        const local = easeOut(progress * 1.5 - i * 0.06);
        el.style.transform = `translateY(${((1 - local) * 112).toFixed(1)}%)`;
        el.style.opacity = `${(0.35 + 0.65 * local).toFixed(3)}`;
      });
    };

    const tick = (now: number) => {
      const elapsed = (now - start) % CYCLE_MS;
      let t = elapsed;

      // Assemble
      if (t < ASSEMBLE_MS) {
        if (overlay) {
          overlay.style.transform = "translateY(0%)";
          overlay.style.opacity = "1";
        }
        if (wordmark) {
          wordmark.style.opacity = "1";
          wordmark.style.transform = "translateY(0%)";
        }
        if (reveal) reveal.style.clipPath = lerpInset(POINT, POINT, 0);
        setChars(t / ASSEMBLE_MS);
        raf = requestAnimationFrame(tick);
        return;
      }
      t -= ASSEMBLE_MS;
      setChars(1);

      // Hold
      if (t < HOLD_MS) {
        raf = requestAnimationFrame(tick);
        return;
      }
      t -= HOLD_MS;

      // Window opens inside the wordmark
      if (t < WINDOW_MS) {
        if (reveal) reveal.style.clipPath = lerpInset(POINT, WINDOW, t / WINDOW_MS);
        raf = requestAnimationFrame(tick);
        return;
      }
      t -= WINDOW_MS;
      if (reveal) reveal.style.clipPath = lerpInset(POINT, WINDOW, 1);

      // Settle
      if (t < SETTLE_MS) {
        raf = requestAnimationFrame(tick);
        return;
      }
      t -= SETTLE_MS;

      // Expand — image consumes the typography
      if (t < EXPAND_MS) {
        const p = t / EXPAND_MS;
        if (reveal) reveal.style.clipPath = lerpInset(WINDOW, FULL, p);
        if (wordmark) {
          wordmark.style.opacity = `${(1 - easeInOut(p)).toFixed(3)}`;
          wordmark.style.transform = `translateY(${(-30 * easeInOut(p)).toFixed(1)}%)`;
        }
        raf = requestAnimationFrame(tick);
        return;
      }
      t -= EXPAND_MS;
      if (reveal) reveal.style.clipPath = lerpInset(WINDOW, FULL, 1);
      if (wordmark) {
        wordmark.style.opacity = "0";
        wordmark.style.transform = "translateY(-30%)";
      }

      // Exit — overlay fades over the identical hero crop
      if (t < EXIT_MS) {
        if (overlay) overlay.style.opacity = `${(1 - t / EXIT_MS).toFixed(3)}`;
        raf = requestAnimationFrame(tick);
        return;
      }
      t -= EXIT_MS;
      if (overlay) {
        overlay.style.opacity = "0";
        overlay.style.transform = "translateY(-100%)";
      }

      // Show hero underneath, then loop (next cycle resets overlay)
      if (t < SHOW_MS) {
        raf = requestAnimationFrame(tick);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ backgroundColor: "#E7E1D5", containerType: "inline-size" }}
    >
      {/* Hero underneath — same asset as the reveal layer */}
      <img
        src={HERO_IMAGE}
        alt=""
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 flex items-center justify-center px-3">
        <span className="whitespace-nowrap text-[clamp(1.75rem,12cqi,3rem)] font-black leading-none tracking-[-0.04em] text-zinc-950 select-none">
          DAVINCIUI
        </span>
      </div>

      {/* Loader overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 overflow-hidden"
        style={{ backgroundColor: "#F3F1F1" }}
      >
        <div className="absolute inset-0 flex items-center justify-center px-[4cqw]">
          <div
            ref={wordmarkRef}
            className="flex flex-row flex-nowrap items-baseline justify-center whitespace-nowrap"
            style={{
              color: "#141414",
              fontSize: "clamp(1.1rem, 8.5cqi, 2rem)",
              fontWeight: 500,
              letterSpacing: "0.01em",
              lineHeight: 1,
              fontFamily:
                '"Helvetica Neue", Helvetica, Arial, sans-serif',
            }}
          >
            {WORD.split("").map((char, i) =>
              char === " " ? (
                <span
                  key={i}
                  aria-hidden="true"
                  className="inline-block shrink-0"
                  style={{ width: "0.32em" }}
                />
              ) : (
                <span
                  key={i}
                  className="inline-block shrink-0 overflow-hidden pb-[0.06em]"
                >
                  <span data-dv-card-char className="inline-block">
                    {char}
                  </span>
                </span>
              ),
            )}
          </div>
        </div>
        <div
          ref={revealRef}
          className="absolute inset-0"
          style={{ clipPath: "inset(50% 50% 50% 50%)" }}
        >
          <img
            src={HERO_IMAGE}
            alt=""
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
