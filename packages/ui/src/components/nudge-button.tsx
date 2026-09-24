"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

/* ------------------------------------------------------------------ */
/* types                                                               */
/* ------------------------------------------------------------------ */

export interface NudgeButtonColors {
  outer?: string;
  middle?: string;
  inner?: string;
  reveal?: string;
}

export interface NudgeButtonProps {
  children?: React.ReactNode;
  className?: string;
  colors?: NudgeButtonColors;
  /** Total interaction length in ms. Relative layer timing is preserved. */
  duration?: number;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit" | "reset";
  ariaLabel?: string;
}

const DEFAULT_COLORS = {
  outer: "#1F44E5",
  middle: "#E23A1D",
  inner: "#F5A301",
  reveal: "#FFFFFF",
} as const;

const BASE_DURATION = 850;
const EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

/** Staggered per-layer timing — earlier layers run larger, bands separate. */
const LAYER_TIMING = [
  { delay: 0, duration: 480 }, // blue outer
  { delay: 60, duration: 480 }, // red middle
  { delay: 130, duration: 470 }, // yellow inner
  { delay: 240, duration: 520 }, // white reveal
];

function farthestCornerRadius(x: number, y: number, w: number, h: number) {
  if (w <= 0 || h <= 0) return 1;
  return Math.hypot(Math.max(x, w - x), Math.max(y, h - y)) * 1.1;
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/* ------------------------------------------------------------------ */
/* component                                                           */
/* ------------------------------------------------------------------ */

export function NudgeButton({
  children = "BUY NUDGE",
  className,
  colors,
  duration = BASE_DURATION,
  disabled = false,
  onClick,
  type = "button",
  ariaLabel,
}: NudgeButtonProps) {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const layerRefs = React.useRef<Array<HTMLSpanElement | null>>([]);
  const kbRef = React.useRef(false);
  const doneTimer = React.useRef(0);

  const palette = React.useMemo(
    () => ({ ...DEFAULT_COLORS, ...colors }),
    [colors],
  );
  const scale = Math.max(0.2, duration / BASE_DURATION);

  /* Track Tab so focus-triggered runs happen for keyboard users only —
     mouse clicks must not restart the animation from the center. */
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab") kbRef.current = true;
    };
    const reset = () => {
      kbRef.current = false;
    };
    window.addEventListener("keydown", onKey, { capture: true });
    window.addEventListener("pointerdown", reset, { capture: true });
    return () => {
      window.removeEventListener("keydown", onKey, { capture: true });
      window.removeEventListener("pointerdown", reset, { capture: true });
    };
  }, []);

  /* Full cleanup on unmount — no leaked animations or timers. */
  React.useEffect(() => {
    const layers = layerRefs.current;
    return () => {
      window.clearTimeout(doneTimer.current);
      for (const el of layers) el?.getAnimations().forEach((a) => a.cancel());
    };
  }, []);

  const hideLayers = React.useCallback(() => {
    for (const el of layerRefs.current) {
      if (!el) continue;
      el.getAnimations().forEach((a) => a.cancel());
      el.style.visibility = "hidden";
      el.style.transform = "translate(-50%, -50%) scale(0)";
    }
  }, []);

  const run = React.useCallback(
    (clientX: number, clientY: number) => {
      const btn = btnRef.current;
      if (!btn || disabled) return;

      /* Reduced motion: one subtle short tint, no expanding rings. */
      if (prefersReducedMotion()) {
        btn.animate(
          [
            { backgroundColor: "#FFFFFF" },
            { backgroundColor: "#F1EEE2" },
            { backgroundColor: "#FFFFFF" },
          ],
          { duration: 220, easing: "ease-out" },
        );
        return;
      }

      const rect = btn.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const radius = farthestCornerRadius(x, y, rect.width, rect.height);
      const diameter = Math.ceil(radius * 2);

      window.clearTimeout(doneTimer.current);
      let longest = 0;
      layerRefs.current.forEach((el, i) => {
        if (!el) return;
        el.getAnimations().forEach((a) => a.cancel());
        // Size written once per trigger — the per-frame work is transform-only.
        el.style.width = `${diameter}px`;
        el.style.height = `${diameter}px`;
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        el.style.visibility = "visible";
        const t = LAYER_TIMING[i]!;
        const delay = Math.round(t.delay * scale);
        const animDuration = Math.max(1, Math.round(t.duration * scale));
        longest = Math.max(longest, delay + animDuration);
        el.animate(
          [
            { transform: "translate(-50%, -50%) scale(0)" },
            { transform: "translate(-50%, -50%) scale(1)" },
          ],
          { duration: animDuration, delay, easing: EASING, fill: "backwards" },
        );
      });
      // Reset only after the geometry has carried every band off-button.
      doneTimer.current = window.setTimeout(hideLayers, longest + 60);
    },
    [disabled, hideLayers, scale],
  );

  const runFromCenter = React.useCallback(() => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    run(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }, [run]);

  const handlePointerEnter = (e: React.PointerEvent) => {
    if (disabled || e.pointerType === "touch") return;
    run(e.clientX, e.clientY);
  };
  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    kbRef.current = false;
    if (e.pointerType === "touch") run(e.clientX, e.clientY);
  };
  const handleFocus = () => {
    if (disabled) return;
    if (kbRef.current) {
      kbRef.current = false;
      runFromCenter();
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") runFromCenter();
  };

  const layerColors = [palette.outer, palette.middle, palette.inner, palette.reveal];

  return (
    <button
      ref={btnRef}
      type={type}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      onClick={onClick}
      onPointerEnter={handlePointerEnter}
      onPointerDown={handlePointerDown}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      data-slot="nudge-button"
      className={cn("nb-pill", className)}
    >
      <style>{NB_CSS}</style>
      <span aria-hidden="true" className="nb-layers">
        {layerColors.map((c, i) => (
          <span
            key={i}
            ref={(el) => {
              layerRefs.current[i] = el;
            }}
            className="nb-ring"
            style={{ backgroundColor: c }}
          />
        ))}
      </span>
      <span className="nb-label">{children}</span>
    </button>
  );
}

const NB_CSS = `
.nb-pill {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  cursor: pointer;
  background: #FFFFFF;
  border: 1px solid #E6E1D4;
  border-radius: clamp(14px, 4cqi, 26px);
  box-shadow: 0 1px 2px rgba(20, 18, 8, 0.06);
  font-family: ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace;
  font-weight: 500;
  font-size: clamp(14px, 4.5cqi, 22px);
  letter-spacing: 0.04em;
  line-height: 1;
  color: #0A0A0A;
  padding: 1.05em 2.9em;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
.nb-pill:disabled { cursor: default; opacity: 0.7; }
.nb-pill:focus { outline: none; }
.nb-pill:focus-visible { outline: 2px solid #0A0A0A; outline-offset: 4px; }
.nb-layers {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
  border-radius: inherit;
}
.nb-ring {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  pointer-events: none;
  visibility: hidden;
  transform: translate(-50%, -50%) scale(0);
  will-change: transform;
}
.nb-label {
  position: relative;
  z-index: 10;
  user-select: none;
}
@media (prefers-reduced-motion: reduce) {
  .nb-ring { display: none; }
}
`;

export default NudgeButton;
