"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

/* ------------------------------------------------------------------ */
/* types                                                               */
/* ------------------------------------------------------------------ */

export type AnimatedPillButtonSize = "sm" | "md" | "lg";

export interface AnimatedPillButtonProps {
  children?: React.ReactNode;
  label?: string;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  size?: AnimatedPillButtonSize;
  backgroundColor?: string;
  activeColor?: string;
  textColor?: string;
  activeTextColor?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

const SIZE_SCALE: Record<AnimatedPillButtonSize, number> = {
  sm: 0.85,
  md: 1,
  lg: 1.15,
};

function isCoarsePointer() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches
  );
}

/* ------------------------------------------------------------------ */
/* component — one data-active flag drives every layer, so enter/leave */
/* always reverses smoothly from the current progress.                */
/* ------------------------------------------------------------------ */

export function AnimatedPillButton({
  children,
  label = "Reserve Now",
  href,
  onClick,
  size = "md",
  backgroundColor,
  activeColor,
  textColor,
  activeTextColor,
  disabled = false,
  className,
  style,
  ariaLabel,
}: AnimatedPillButtonProps) {
  const rootRef = React.useRef<HTMLButtonElement | HTMLAnchorElement | null>(null);
  const fillRef = React.useRef<HTMLSpanElement | null>(null);
  const darkRef = React.useRef<HTMLSpanElement | null>(null);
  const kbRef = React.useRef(false);
  const [active, setActive] = React.useState(false);

  /* Subtle run-once scroll entrance, independent from the hover system. */
  React.useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.setAttribute("data-inview", "true");
      return;
    }
    el.setAttribute("data-inview", "false");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          el.setAttribute("data-inview", "true");
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* Track Tab so only keyboard focus triggers the active treatment —
     mouse clicks must not latch it on. */
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

  /* Point the expansion origin at the real interaction coordinates.
     Fill left/top carry no transition, so the origin jumps instantly while
     scale continues from its current value. The text mask swaps origin with
     transitions briefly suppressed, so its radius also continues smoothly. */
  const commitOrigin = React.useCallback((clientX: number, clientY: number) => {
    const btn = rootRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const fill = fillRef.current;
    if (fill) {
      fill.style.left = `${x}px`;
      fill.style.top = `${y}px`;
    }
    const dark = darkRef.current;
    if (dark) {
      dark.style.transition = "none";
      dark.style.setProperty("--apb-ox", `${x}px`);
      dark.style.setProperty("--apb-oy", `${y}px`);
      void dark.offsetWidth;
      dark.style.transition = "";
    }
  }, []);

  const activateAt = React.useCallback(
    (clientX: number, clientY: number) => {
      if (disabled) return;
      commitOrigin(clientX, clientY);
      setActive(true);
    },
    [commitOrigin, disabled],
  );

  const activateCenter = React.useCallback(() => {
    const btn = rootRef.current;
    if (!btn || disabled) return;
    const rect = btn.getBoundingClientRect();
    activateAt(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }, [activateAt, disabled]);

  const content = children ?? label;

  /* Explicit color props always win (inline vars beat the stylesheet).
     When none are passed, the stylesheet supplies theme-aware defaults:
     reference black/white in light mode, auto-inverted in dark mode. */
  const customized =
    backgroundColor !== undefined ||
    activeColor !== undefined ||
    textColor !== undefined ||
    activeTextColor !== undefined;

  const handlers = {
    onPointerEnter: (e: React.PointerEvent) => {
      if (e.pointerType === "touch") return;
      activateAt(e.clientX, e.clientY);
    },
    onPointerLeave: () => {
      if (!disabled) setActive(false);
    },
    onPointerDown: (e: React.PointerEvent) => {
      if (disabled) return;
      kbRef.current = false;
      if (e.pointerType === "touch" || isCoarsePointer())
        activateAt(e.clientX, e.clientY);
    },
    onPointerUp: (e: React.PointerEvent) => {
      if (disabled) return;
      if (e.pointerType === "touch" || isCoarsePointer()) setActive(false);
    },
    onPointerCancel: () => {
      if (!disabled) setActive(false);
    },
    onFocus: () => {
      if (disabled) return;
      if (kbRef.current) {
        kbRef.current = false;
        activateCenter();
      }
    },
    onBlur: () => {
      if (!disabled) setActive(false);
    },
  };

  const shared = {
    ref: (el: HTMLButtonElement | HTMLAnchorElement | null) => {
      rootRef.current = el;
    },
    className: cn("apb-root", className),
    style: {
      ...(customized
        ? {
            ["--apb-bg" as string]: backgroundColor ?? "#000000",
            ["--apb-active" as string]: activeColor ?? "#19CBEA",
            ["--apb-txt" as string]: textColor ?? "#FFFFFF",
            ["--apb-active-txt" as string]: activeTextColor ?? "#000000",
          }
        : null),
      ["--apb-scale" as string]: SIZE_SCALE[size],
      ...style,
    } as React.CSSProperties,
    "data-active": active,
    "data-slot": "animated-pill-button",
    "data-size": size,
    "aria-label": ariaLabel,
    ...handlers,
  };

  const inner = (
    <>
      <span ref={fillRef} aria-hidden="true" className="apb-fill" />
      <span className="apb-white">{content}</span>
      <span ref={darkRef} aria-hidden="true" className="apb-dark">
        <span className="apb-dark-label">{content}</span>
        <span aria-hidden="true" className="apb-spacer" />
      </span>
      <span aria-hidden="true" className="apb-icon">
        <span className="apb-dot" />
        <svg
          className="apb-arrow"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          focusable="false"
        >
          <path d="M4 12h15" />
          <path d="M13.5 6.5 19 12l-5.5 5.5" />
        </svg>
      </span>
    </>
  );

  if (href && !disabled) {
    return (
      <a
        {...shared}
        ref={shared.ref as React.Ref<HTMLAnchorElement>}
        href={href}
        onClick={onClick as React.MouseEventHandler<HTMLAnchorElement> | undefined}
      >
        <style>{APB_CSS}</style>
        {inner}
      </a>
    );
  }
  return (
    <button
      {...shared}
      ref={shared.ref as React.Ref<HTMLButtonElement>}
      type="button"
      disabled={disabled}
      aria-disabled={disabled || undefined}
      onClick={onClick as React.MouseEventHandler<HTMLButtonElement> | undefined}
    >
      <style>{APB_CSS}</style>
      {inner}
    </button>
  );
}

const APB_CSS = `
.apb-root {
  --apb-ease: cubic-bezier(0.76, 0, 0.24, 1);
  --apb-anchor: 2.55em;
  --apb-bg: #000000;
  --apb-active: #19CBEA;
  --apb-txt: #FFFFFF;
  --apb-active-txt: #000000;
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 1.1em;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  cursor: pointer;
  background: var(--apb-bg, #000000);
  color: var(--apb-txt, #FFFFFF);
  border: none;
  border-radius: 9999px;
  font-family: inherit;
  font-weight: 550;
  font-size: calc(clamp(13px, 4.5cqi, 19px) * var(--apb-scale, 1));
  letter-spacing: 0.01em;
  line-height: 1.15;
  padding: 1em 1.2em 1em 2em;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  opacity: 0;
  translate: 0 14px;
}
.apb-root[data-inview="true"] {
  opacity: 1;
  translate: 0 0;
  transition: opacity 500ms ease, translate 500ms ease;
}
/* Theme-aware defaults: reference black pill in light mode,
   auto-inverted white pill in dark mode. Explicit color props
   (inline vars) always take precedence over both. */
.dark .apb-root {
  --apb-bg: #FAFAF9;
  --apb-txt: #0A0A0A;
}
.apb-root:disabled { cursor: not-allowed; opacity: 0.55; }
.apb-root:focus { outline: none; }
.apb-root:focus-visible { outline: 2px solid var(--apb-active, #19CBEA); outline-offset: 4px; }

/* cyan expansion layer — oversized circle centered on the interaction
   point (written imperatively per entry; left/top carry no transition). */
.apb-fill {
  position: absolute;
  z-index: 1;
  left: calc(100% - var(--apb-anchor));
  top: 50%;
  width: 300%;
  aspect-ratio: 1 / 1;
  transform: translate(-50%, -50%);
  scale: 0;
  border-radius: 50%;
  background: var(--apb-active, #19CBEA);
  pointer-events: none;
  will-change: scale;
  transition: scale 550ms var(--apb-ease);
}
.apb-root[data-active="true"] .apb-fill { scale: 1; }

/* base label above the fill */
.apb-white {
  position: relative;
  z-index: 2;
  color: var(--apb-txt, #FFFFFF);
  user-select: none;
}

/* dark duplicate revealed by the same circular mask */
.apb-dark {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 1.1em;
  padding: 1em 1.2em 1em 2em;
  color: var(--apb-active-txt, #000000);
  font: inherit;
  letter-spacing: inherit;
  line-height: inherit;
  white-space: nowrap;
  pointer-events: none;
  clip-path: circle(0 at var(--apb-ox, calc(100% - var(--apb-anchor))) var(--apb-oy, 50%));
  transition: clip-path 550ms var(--apb-ease);
  will-change: clip-path;
}
.apb-root[data-active="true"] .apb-dark { clip-path: circle(220% at var(--apb-ox, calc(100% - var(--apb-anchor))) var(--apb-oy, 50%)); }
.apb-dark-label { user-select: none; }
.apb-spacer { flex: none; width: 2.7em; height: 2.7em; visibility: hidden; }

/* morphing dot → arrow circle */
.apb-icon {
  position: relative;
  z-index: 4;
  flex: none;
  width: 2.7em;
  height: 2.7em;
  display: grid;
  place-items: center;
  pointer-events: none;
}
.apb-dot {
  grid-area: 1 / 1;
  width: 0.62em;
  height: 0.62em;
  border-radius: 50%;
  background: var(--apb-active, #19CBEA);
  scale: 1;
  transition: scale 450ms var(--apb-ease), background-color 300ms ease;
  will-change: scale;
}
.apb-root[data-active="true"] .apb-dot { scale: 4.35; background: #0B0B0C; }
.apb-arrow {
  grid-area: 1 / 1;
  width: 1.25em;
  height: 1.25em;
  color: #FFFFFF;
  opacity: 0;
  transform: rotate(135deg) scale(0.5);
  transition: opacity 220ms ease 150ms, transform 300ms var(--apb-ease) 150ms;
  will-change: transform, opacity;
}
.apb-root[data-active="true"] .apb-arrow { opacity: 1; transform: rotate(0deg) scale(1); }

@media (prefers-reduced-motion: reduce) {
  .apb-root { opacity: 1; translate: none; transition: none; }
  .apb-fill, .apb-dark { display: none; }
  .apb-dot, .apb-arrow { transition-duration: 120ms; transition-delay: 0ms; }
  .apb-root[data-active="true"] { background: var(--apb-active, #19CBEA); color: var(--apb-active-txt, #000000); transition: background-color 120ms ease, color 120ms ease; }
  .apb-root[data-active="true"] .apb-white { color: var(--apb-active-txt, #000000); }
  .apb-root[data-active="true"] .apb-dot { background: #0B0B0C; }
}
`;

export default AnimatedPillButton;
