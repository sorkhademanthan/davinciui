"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

/* ------------------------------------------------------------------ */
/* types                                                               */
/* ------------------------------------------------------------------ */

export type LiquidRevealButtonMode = "card" | "preview" | "fullscreen";

export interface LiquidRevealButtonProps {
  children?: React.ReactNode;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  mode?: LiquidRevealButtonMode;
  backgroundColor?: string;
  hoverColor?: string;
  textColor?: string;
  hoverTextColor?: string;
  borderColor?: string;
  /** Renders the black demo cursor that tracks the pointer over the stage. */
  showDemoCursor?: boolean;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  ariaLabel?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

const DEFAULTS = {
  backgroundColor: "#E5FF46",
  hoverColor: "#111111",
  textColor: "#141414",
  hoverTextColor: "#FFFFFF",
  borderColor: "#141414",
};

/* Animation tuning (matched against the reference recording). */
const ENTER_RATE = 0.12; // radius approach per frame — ~390ms to full cover
const EXIT_RATE = 0.15; // retract per frame — ~330ms to restore
const POS_LERP = 0.2; // pointer-follow smoothing (responsive, not rubbery)
const SETTLE_PX = 0.6;

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function farthestCornerRadius(x: number, y: number, w: number, h: number) {
  if (w <= 0 || h <= 0) return 1;
  const dx = Math.max(x, w - x);
  const dy = Math.max(y, h - y);
  return Math.hypot(dx, dy) + 10;
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function isCoarsePointer() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches
  );
}

/* ------------------------------------------------------------------ */
/* demo cursor — fixed black dot, viewport coordinates, no portal      */
/* ------------------------------------------------------------------ */

function DemoCursor({ scopeRef }: { scopeRef: React.RefObject<HTMLElement | null> }) {
  const dotRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const dot = dotRef.current;
    const scope = scopeRef.current;
    if (!dot || !scope) return;

    let raf = 0;
    let running = false;
    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let visible = false;
    let disposed = false;
    const reduced = prefersReducedMotion();

    const paint = () => {
      dot.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
    };

    const loop = () => {
      if (disposed) return;
      if (reduced) {
        x = tx;
        y = ty;
      } else {
        x += (tx - x) * 0.35;
        y += (ty - y) * 0.35;
      }
      paint();
      if (!visible && Math.hypot(tx - x, ty - y) < 0.5) {
        running = false;
        raf = 0;
        dot.style.opacity = "0";
        return;
      }
      raf = requestAnimationFrame(loop);
    };

    const kick = () => {
      if (!running && !disposed) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const inside = scope.contains(e.target as Node | null);
      if (!inside) {
        if (visible) {
          visible = false;
          kick();
        }
        return;
      }
      tx = e.clientX;
      ty = e.clientY;
      if (!visible) {
        visible = true;
        x = tx;
        y = ty;
        dot.style.opacity = "1";
        paint();
      }
      kick();
    };

    const onLeave = () => {
      if (visible) {
        visible = false;
        kick();
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [scopeRef]);

  return (
    <span
      ref={dotRef}
      aria-hidden
      className="lrb-cursor"
      style={{ opacity: 0 }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* component                                                           */
/* ------------------------------------------------------------------ */

export function LiquidRevealButton({
  children = "View all projects",
  href,
  onClick,
  mode = "preview",
  backgroundColor = DEFAULTS.backgroundColor,
  hoverColor = DEFAULTS.hoverColor,
  textColor = DEFAULTS.textColor,
  hoverTextColor = DEFAULTS.hoverTextColor,
  borderColor = DEFAULTS.borderColor,
  showDemoCursor = false,
  className,
  style,
  id,
  ariaLabel,
  disabled = false,
  type = "button",
}: LiquidRevealButtonProps) {
  const btnRef = React.useRef<HTMLButtonElement | HTMLAnchorElement | null>(null);
  const overlayRef = React.useRef<HTMLSpanElement>(null);
  const stageRef = React.useRef<HTMLSpanElement>(null);

  /* All animation state lives in a ref — zero React re-renders per frame. */
  const st = React.useRef({
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
    r: 0,
    targetR: 0,
    maxR: 1,
    engaged: false, // pointer / focus / press is active
    pressed: false, // touch press in progress
    cx: 0, // last viewport pointer position
    cy: 0,
    rectL: 0,
    rectT: 0,
    rectW: 0,
    rectH: 0,
  });
  const rafRef = React.useRef(0);

  const paint = React.useCallback(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const s = st.current;
    if (s.r <= SETTLE_PX && s.targetR === 0) {
      overlay.style.visibility = "hidden";
      overlay.style.clipPath = `circle(0px at ${s.x.toFixed(1)}px ${s.y.toFixed(1)}px)`;
      return;
    }
    overlay.style.visibility = "visible";
    if (s.r >= s.maxR) {
      overlay.style.clipPath = "none";
      return;
    }
    overlay.style.clipPath = `circle(${s.r.toFixed(1)}px at ${s.x.toFixed(1)}px ${s.y.toFixed(1)}px)`;
  }, []);

  const step = React.useCallback(() => {
    const s = st.current;
    s.x += (s.tx - s.x) * POS_LERP;
    s.y += (s.ty - s.y) * POS_LERP;
    const rate = s.targetR > s.r ? ENTER_RATE : EXIT_RATE;
    s.r += (s.targetR - s.r) * rate;
    if (Math.abs(s.targetR - s.r) < SETTLE_PX) s.r = s.targetR;
    paint();
    const settled =
      s.r === s.targetR && Math.hypot(s.tx - s.x, s.ty - s.y) < 0.3;
    if (settled && !s.engaged) {
      rafRef.current = 0;
      return;
    }
    rafRef.current = requestAnimationFrame(step);
  }, [paint]);

  const kick = React.useCallback(() => {
    if (!rafRef.current) rafRef.current = requestAnimationFrame(step);
  }, [step]);

  const readRect = React.useCallback(() => {
    const btn = btnRef.current;
    if (!btn) return null;
    const rect = btn.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    const s = st.current;
    s.rectL = rect.left;
    s.rectT = rect.top;
    s.rectW = rect.width;
    s.rectH = rect.height;
    return rect;
  }, []);

  const enterAt = React.useCallback(
    (clientX: number, clientY: number) => {
      const rect = readRect();
      if (!rect) return;
      const s = st.current;
      // Interrupt from the CURRENT radius — never reset to 0 mid-flight.
      const firstTouch = !s.engaged && s.r === 0 && s.targetR === 0;
      s.x = firstTouch ? clientX - rect.left : s.x;
      s.y = firstTouch ? clientY - rect.top : s.y;
      s.tx = clientX - rect.left;
      s.ty = clientY - rect.top;
      s.cx = clientX;
      s.cy = clientY;
      s.maxR = farthestCornerRadius(s.tx, s.ty, rect.width, rect.height);
      s.engaged = true;
      if (prefersReducedMotion()) {
        s.r = s.maxR;
        s.targetR = s.maxR;
        paint();
        return;
      }
      s.targetR = s.maxR;
      kick();
    },
    [kick, paint, readRect],
  );

  const moveTo = React.useCallback(
    (clientX: number, clientY: number) => {
      const s = st.current;
      if (!s.engaged) return;
      const btn = btnRef.current;
      const rect = btn?.getBoundingClientRect();
      if (!rect || rect.width <= 0) return;
      s.rectL = rect.left;
      s.rectT = rect.top;
      s.rectW = rect.width;
      s.rectH = rect.height;
      s.tx = clientX - rect.left;
      s.ty = clientY - rect.top;
      s.cx = clientX;
      s.cy = clientY;
      s.maxR = farthestCornerRadius(s.tx, s.ty, rect.width, rect.height);
      if (s.targetR > 0) s.targetR = s.maxR;
      if (prefersReducedMotion()) {
        s.x = s.tx;
        s.y = s.ty;
        paint();
        return;
      }
      kick();
    },
    [kick, paint],
  );

  const leaveToward = React.useCallback(
    (clientX: number, clientY: number) => {
      const s = st.current;
      if (!s.engaged && s.r === 0) return;
      const btn = btnRef.current;
      const rect = btn?.getBoundingClientRect();
      if (rect && rect.width > 0) {
        s.rectL = rect.left;
        s.rectT = rect.top;
        s.tx = clientX - rect.left;
        s.ty = clientY - rect.top;
      }
      s.engaged = false;
      s.pressed = false;
      if (prefersReducedMotion()) {
        s.r = 0;
        s.targetR = 0;
        paint();
        return;
      }
      // Contract toward the exit location — never toward the center.
      s.targetR = 0;
      kick();
    },
    [kick, paint],
  );

  /* ---- keep the mask glued while scrolling / resizing ---- */
  React.useEffect(() => {
    const onScroll = () => {
      const s = st.current;
      if (!s.engaged) return;
      const btn = btnRef.current;
      const rect = btn?.getBoundingClientRect();
      if (!rect || rect.width <= 0) return;
      const dx = rect.left - s.rectL;
      const dy = rect.top - s.rectT;
      s.rectL = rect.left;
      s.rectT = rect.top;
      s.rectW = rect.width;
      s.rectH = rect.height;
      s.x -= dx;
      s.y -= dy;
      s.tx -= dx;
      s.ty -= dy;
      s.maxR = farthestCornerRadius(s.tx, s.ty, rect.width, rect.height);
      if (s.targetR > 0) s.targetR = s.maxR;
      // Pointer now outside the button (e.g. scrolled away) → retract.
      const m = 2;
      if (
        s.cx < rect.left - m ||
        s.cx > rect.right + m ||
        s.cy < rect.top - m ||
        s.cy > rect.bottom + m
      ) {
        leaveToward(s.cx, s.cy);
      } else if (!rafRef.current) {
        paint();
      }
    };
    const onBlur = () => {
      const s = st.current;
      if (s.engaged) leaveToward(s.cx, s.cy);
    };
    window.addEventListener("scroll", onScroll, { capture: true, passive: true });
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("scroll", onScroll, { capture: true } as EventListenerOptions);
      window.removeEventListener("blur", onBlur);
    };
  }, [leaveToward, paint]);

  React.useEffect(() => {
    const btn = btnRef.current;
    if (!btn || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      const s = st.current;
      const rect = btn.getBoundingClientRect();
      if (rect.width <= 0) return;
      s.rectL = rect.left;
      s.rectT = rect.top;
      s.rectW = rect.width;
      s.rectH = rect.height;
      s.maxR = farthestCornerRadius(
        clamp(s.tx, 0, rect.width),
        clamp(s.ty, 0, rect.height),
        rect.width,
        rect.height,
      );
      if (s.targetR > 0) s.targetR = s.maxR;
    });
    ro.observe(btn);
    return () => ro.disconnect();
  }, []);

  /* ---- full cleanup on unmount ---- */
  React.useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, []);

  const handlePointerEnter = (e: React.PointerEvent) => {
    if (disabled || e.pointerType === "touch") return;
    enterAt(e.clientX, e.clientY);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (disabled) return;
    if (e.pointerType === "touch" && !st.current.pressed) return;
    moveTo(e.clientX, e.clientY);
  };
  const handlePointerLeave = (e: React.PointerEvent) => {
    if (disabled || e.pointerType === "touch") return;
    leaveToward(e.clientX, e.clientY);
  };
  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    if (e.pointerType === "touch" || isCoarsePointer()) {
      st.current.pressed = true;
      enterAt(e.clientX, e.clientY);
    }
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    if (disabled) return;
    if (e.pointerType === "touch" || st.current.pressed) {
      leaveToward(e.clientX, e.clientY);
    }
  };
  const handleFocus = () => {
    if (disabled || isCoarsePointer()) return;
    const btn = btnRef.current;
    const rect = btn?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return;
    enterAt(rect.left + rect.width / 2, rect.top + rect.height / 2);
  };
  const handleBlur = () => {
    const s = st.current;
    if (s.engaged) leaveToward(s.tx + s.rectL, s.ty + s.rectT);
  };

  const setBtnRef = (el: HTMLButtonElement | HTMLAnchorElement | null) => {
    btnRef.current = el;
  };

  const pill = (
    <>
      <span className="lrb-label" style={{ color: textColor }}>
        {children}
      </span>
      <span
        ref={overlayRef}
        aria-hidden="true"
        className="lrb-reveal"
        style={{
          backgroundColor: hoverColor,
          visibility: "hidden",
          clipPath: "circle(0px at 50% 50%)",
        }}
      >
        <span className="lrb-label" style={{ color: hoverTextColor }}>
          {children}
        </span>
      </span>
    </>
  );

  const shared = {
    ref: setBtnRef,
    id,
    className: cn("lrb-pill", className),
    style: {
      backgroundColor,
      borderColor,
      ...style,
    } as React.CSSProperties,
    "data-mode": mode,
    "aria-label": ariaLabel,
    onPointerEnter: handlePointerEnter,
    onPointerMove: handlePointerMove,
    onPointerLeave: handlePointerLeave,
    onPointerDown: handlePointerDown,
    onPointerUp: handlePointerUp,
    onPointerCancel: handlePointerUp,
    onFocus: handleFocus,
    onBlur: handleBlur,
  };

  return (
    <span ref={stageRef} className="lrb-scope">
      <style>{LRB_CSS}</style>
      {href ? (
        <a
          {...shared}
          ref={setBtnRef as React.Ref<HTMLAnchorElement>}
          href={href}
          onClick={onClick as React.MouseEventHandler<HTMLAnchorElement> | undefined}
        >
          {pill}
        </a>
      ) : (
        <button
          {...shared}
          ref={setBtnRef as React.Ref<HTMLButtonElement>}
          type={type}
          disabled={disabled}
          onClick={onClick as React.MouseEventHandler<HTMLButtonElement> | undefined}
        >
          {pill}
        </button>
      )}
      {showDemoCursor && <DemoCursor scopeRef={stageRef} />}
    </span>
  );
}

const LRB_CSS = `
.lrb-scope { display: inline-flex; }
.lrb-pill {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  border-radius: 9999px;
  border-style: solid;
  border-width: max(1px, 0.08em);
  overflow: hidden;
  cursor: pointer;
  font-family: inherit;
  font-weight: 650;
  font-size: clamp(13px, 4cqi, 22px);
  letter-spacing: -0.01em;
  line-height: 1.1;
  padding: 0.85em 2.1em;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.lrb-pill[data-mode="card"] { font-size: clamp(12px, 4cqi, 15px); }
.lrb-pill[data-mode="fullscreen"] { font-size: clamp(15px, 4cqi, 26px); }
.lrb-pill:focus { outline: none; }
.lrb-pill:focus-visible { outline: 2px solid currentColor; outline-offset: 4px; }
.lrb-pill:disabled { cursor: default; }
.lrb-label {
  position: relative;
  z-index: 1;
  display: inline-block;
  user-select: none;
}
.lrb-reveal {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: inherit;
  font: inherit;
  letter-spacing: inherit;
  line-height: inherit;
  pointer-events: none;
  will-change: clip-path;
}
.lrb-reveal .lrb-label { z-index: auto; }
.lrb-cursor {
  position: fixed;
  left: 0;
  top: 0;
  width: 22px;
  height: 22px;
  border-radius: 9999px;
  background: #111111;
  pointer-events: none;
  z-index: 80;
  transition: opacity 180ms ease;
}
@media (prefers-reduced-motion: reduce) {
  .lrb-pill { transition: none; }
  .lrb-cursor { transition: none; }
}
`;

export default LiquidRevealButton;
