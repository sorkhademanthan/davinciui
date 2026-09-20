"use client";

import * as React from "react";

export interface CursorMaskRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Image visible through the custom cursor mask. */
  backgroundImage: string;
  /** Image that sits above the background until the mask reveals it. */
  foregroundImage: string;
  /** PNG or SVG with transparency that defines the cursor's reveal shape. */
  cursorImage: string;
  /** Accessible description for the visual treatment. */
  alt?: string;
  /** Rendered width and height of the custom cursor in pixels. */
  cursorSize?: number;
  /** Opacity of the foreground image outside the cursor mask. */
  foregroundOpacity?: number;
  /** Solid ground placed behind the foreground image, outside the reveal mask. */
  foregroundBackground?: string;
  /** Cursor-follow smoothing from 0 (immediate) to 1 (slow). */
  smoothing?: number;
  /** Whether to replace the native pointer while over the component. */
  hideNativeCursor?: boolean;
  /** Disables movement while leaving the foreground image visible. */
  disabled?: boolean;
  /** Content rendered over the image treatment. */
  children?: React.ReactNode;
}

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

/**
 * Reveals one image through a cursor-following PNG or SVG mask while a second
 * image remains above it. The component is scoped to its own container and
 * does not use a viewport overlay or intercept page interaction.
 */
export function CursorMaskReveal({
  backgroundImage,
  foregroundImage,
  cursorImage,
  alt = "",
  cursorSize = 280,
  foregroundOpacity = 0.18,
  foregroundBackground = "#faf9f7",
  smoothing = 0.18,
  hideNativeCursor = true,
  disabled = false,
  className,
  children,
  ...props
}: CursorMaskRevealProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const maskRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    const mask = maskRef.current;
    if (!container || !mask || disabled) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");
    let frame = 0;
    let active = false;
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;

    const positionMask = () => {
      mask.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate3d(-50%, -50%, 0)`;
    };

    const render = () => {
      const amount = motionQuery.matches ? 1 : 1 - clamp(smoothing, 0, 0.96);
      currentX += (targetX - currentX) * amount;
      currentY += (targetY - currentY) * amount;
      positionMask();
      if (active && (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1)) {
        frame = requestAnimationFrame(render);
      } else {
        frame = 0;
      }
    };

    const move = (event: PointerEvent) => {
      if (coarsePointer.matches) return;
      const rect = container.getBoundingClientRect();
      targetX = event.clientX - rect.left;
      targetY = event.clientY - rect.top;
      if (!active) {
        active = true;
        currentX = targetX;
        currentY = targetY;
        mask.style.opacity = "1";
        positionMask();
      }
      if (!frame) frame = requestAnimationFrame(render);
    };

    const leave = () => {
      active = false;
      mask.style.opacity = "0";
    };

    const updatePointerMode = () => {
      if (coarsePointer.matches || motionQuery.matches) leave();
    };

    container.addEventListener("pointermove", move, { passive: true });
    container.addEventListener("pointerleave", leave);
    motionQuery.addEventListener("change", updatePointerMode);
    coarsePointer.addEventListener("change", updatePointerMode);
    return () => {
      cancelAnimationFrame(frame);
      container.removeEventListener("pointermove", move);
      container.removeEventListener("pointerleave", leave);
      motionQuery.removeEventListener("change", updatePointerMode);
      coarsePointer.removeEventListener("change", updatePointerMode);
    };
  }, [disabled, smoothing]);

  const maskStyle = {
    width: cursorSize,
    height: cursorSize,
    backgroundImage: `url("${backgroundImage}")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    WebkitMaskImage: `url("${cursorImage}")`,
    WebkitMaskSize: "contain",
    WebkitMaskPosition: "center",
    WebkitMaskRepeat: "no-repeat",
    maskImage: `url("${cursorImage}")`,
    maskSize: "contain",
    maskPosition: "center",
    maskRepeat: "no-repeat",
  } as React.CSSProperties;

  return (
    <div
      ref={containerRef}
      className={`relative isolate overflow-hidden ${hideNativeCursor && !disabled ? "cursor-none" : ""} ${className ?? ""}`}
      {...props}
    >
      <img
        src={backgroundImage}
        alt={alt}
        draggable={false}
        className="absolute inset-0 h-full w-full select-none object-cover"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ backgroundColor: foregroundBackground }}
      />
      <img
        src={foregroundImage}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
        style={{ opacity: foregroundOpacity }}
      />
      <div
        ref={maskRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-10 will-change-transform"
        style={{ ...maskStyle, opacity: 0 }}
      />
      {children ? <div className="relative z-20">{children}</div> : null}
    </div>
  );
}
