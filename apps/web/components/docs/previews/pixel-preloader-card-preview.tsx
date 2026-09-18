"use client";

import * as React from "react";
import { useTheme } from "next-themes";

function mulberry32(seed: number) {
  let state = seed >>> 0;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash2(x: number, y: number, seed: number) {
  let h = (x * 374761393 + y * 668265263 + seed * 974634211) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/**
 * Miniature looping version of the pixel preloader for the gallery card:
 * a fine cell grid fills bottom-up behind a jagged orange frontier with
 * vertical spikes, holds at full white, then fades to reveal DAVINCI.
 */
export function PixelPreloaderCardPreview() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const hostRef = React.useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const paletteRef = React.useRef({ dark: "#0d0d0d", light: "#f3efe7" });
  paletteRef.current =
    resolvedTheme === "light"
      ? { dark: "#d9d6d0", light: "#faf8f3" }
      : { dark: "#0d0d0d", light: "#f3efe7" };

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rand = mulberry32(1337);
    const SEED = 1337;
    let raf = 0;
    let cols = 0;
    let rows = 0;
    let w = 0;
    let h = 0;
    let cell = 6;
    let base: Float32Array = new Float32Array(0);
    let baseTarget: Float32Array = new Float32Array(0);
    let spike: Float32Array = new Float32Array(0);
    let spikeTarget: Float32Array = new Float32Array(0);
    let seeds: Float32Array = new Float32Array(0);
    let frame = 0;

    const FILL_MS = 2600;
    const HOLD_MS = 500;
    const EXIT_MS = 700;
    const SHOW_MS = 1300;
    const CYCLE_MS = FILL_MS + HOLD_MS + EXIT_MS + SHOW_MS;
    const start = performance.now();

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.min(160, Math.max(48, Math.round(w / 5)));
      cell = w / cols;
      rows = Math.max(1, Math.ceil(h / cell));
      base = new Float32Array(cols);
      baseTarget = new Float32Array(cols);
      spike = new Float32Array(cols);
      spikeTarget = new Float32Array(cols);
      seeds = new Float32Array(cols);
      for (let i = 0; i < cols; i++) {
        const v = (rand() * 2 - 1 + rand() * 2 - 1) / 2;
        base[i] = v;
        baseTarget[i] = v;
        seeds[i] = Math.floor(rand() * 100000);
      }
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(host);

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      frame += 1;
      const elapsed = (now - start) % CYCLE_MS;
      const pal = paletteRef.current;
      const BG = pal.dark;
      const FG = pal.light;

      let visual: number;
      let overlayAlpha = 1;
      if (elapsed < FILL_MS) {
        const t = elapsed / FILL_MS;
        const eased =
          t < 0.12
            ? (t / 0.12) * 0.05
            : t < 0.55
              ? 0.05 + ((t - 0.12) / 0.43) * 0.75
              : t < 0.8
                ? 0.8 + ((t - 0.55) / 0.25) * 0.16
                : 0.96 + ((t - 0.8) / 0.2) * 0.04;
        visual = Math.min(1, Math.max(0, eased));
      } else if (elapsed < FILL_MS + HOLD_MS) {
        visual = 1;
      } else if (elapsed < FILL_MS + HOLD_MS + EXIT_MS) {
        visual = 1;
        overlayAlpha =
          1 - (elapsed - FILL_MS - HOLD_MS) / EXIT_MS;
      } else {
        visual = 0;
        overlayAlpha = 0;
      }

      for (let x = 0; x < cols; x++) {
        if (rand() < 0.02) {
          baseTarget[x] = (rand() * 2 - 1 + rand() * 2 - 1) / 2;
        }
        base[x]! += (baseTarget[x]! - base[x]!) * 0.07;
        if (rand() < 0.01 && spikeTarget[x]! <= 0.5) {
          spikeTarget[x] = 2 + Math.pow(rand(), 3) * 18;
        }
        spike[x]! += (spikeTarget[x]! - spike[x]!) * 0.12;
        spikeTarget[x]! *= 0.985;
        if (spikeTarget[x]! < 0.4) spikeTarget[x] = 0;
      }

      ctx.globalAlpha = 1;
      canvas.style.opacity = String(overlayAlpha);
      if (overlayAlpha <= 0) {
        ctx.clearRect(0, 0, w, h);
        return;
      }
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, w, h);

      const baseY = h * (1 - visual);
      const frontier = new Float32Array(cols);
      for (let x = 0; x < cols; x++) {
        frontier[x] =
          baseY +
          (Math.sin((x / cols) * Math.PI * 6 + seeds[x]!) * 0.5 +
            base[x]!) *
            3.5 *
            cell -
          spike[x]! * cell;
      }

      ctx.fillStyle = FG;
      for (let x = 0; x < cols; x++) {
        const top = Math.min(h, frontier[x]! + 2 * cell);
        if (top < h) ctx.fillRect(x * cell, top, cell + 0.5, h - top);
      }

      if (visual > 0.0005 && visual < 0.9995) {
        const depth = 10 * cell;
        const epoch = Math.floor(frame / 8);
        for (let x = 0; x < cols; x++) {
          const fx = frontier[x]!;
          const rowTop = Math.max(0, Math.floor((fx - depth) / cell));
          const rowBottom = Math.min(
            rows - 1,
            Math.ceil((fx + 2 * cell) / cell),
          );
          const spiking = spike[x]! > 2;
          for (let r = rowTop; r <= rowBottom; r++) {
            const cellY = r * cell;
            const d = (cellY - fx) / cell;
            if (d > 2) continue;
            const flickers = hash2(x, r, SEED + epoch) < 0.14;
            const pick = flickers
              ? hash2(x, r, SEED + epoch * 7919 + 13)
              : hash2(x, r, SEED);
            const orangePeak = 0.6 * Math.exp(-((d + 1) * (d + 1)) / 9);
            const bonus = spiking && d < 1 ? 0.22 : 0;
            const whiteP = 0.1 + Math.max(0, d + 2) * 0.16;
            if (pick < orangePeak + bonus) {
              ctx.fillStyle = "#ff4d23";
              ctx.fillRect(x * cell, cellY, cell + 0.5, cell + 0.5);
            } else if (pick < orangePeak + bonus + whiteP) {
              ctx.fillStyle = FG;
              ctx.fillRect(x * cell, cellY, cell + 0.5, cell + 0.5);
            }
          }
        }
      } else if (visual >= 0.9995) {
        ctx.fillStyle = FG;
        ctx.fillRect(0, 0, w, h);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className="absolute inset-0 overflow-hidden bg-white dark:bg-zinc-950"
      style={{ containerType: "inline-size" }}
    >
      {/* Page content sitting underneath the overlay */}
      <div className="absolute inset-0 flex items-center justify-center px-3">
        <span className="whitespace-nowrap text-[clamp(1.75rem,11cqi,3rem)] font-black leading-none tracking-[-0.04em] text-zinc-950 select-none dark:text-zinc-50">
          DAVINCI
        </span>
      </div>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
