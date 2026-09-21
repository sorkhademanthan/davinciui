"use client";

import * as React from "react";

export type ElasticBlobCursorTheme = "auto" | "light" | "dark";
export type ElasticBlobCursorMode = "global" | "container";

export interface ElasticBlobCursorProps {
  /** Diameter of the blob in pixels at rest. */
  size?: number;
  /** Solid fill color. Used for both themes unless overridden by `lightColor` / `darkColor`. */
  color?: string;
  /** Fill color used on light backgrounds. Defaults to near-black for contrast. */
  lightColor?: string;
  /** Fill color used on dark backgrounds. */
  darkColor?: string;
  /** Color scheme for the blob. `"auto"` follows the site theme live. */
  theme?: ElasticBlobCursorTheme;
  /** Position interpolation per frame (0.12–0.20). Higher is tighter. */
  followStrength?: number;
  /** Maximum horizontal stretch (e.g. 1.4 = 140% width at full speed). */
  maxStretch?: number;
  /** Maximum vertical compression amount (e.g. 0.22 → down to 78% height). */
  compression?: number;
  /** How strongly pointer speed maps to deformation. Higher deforms earlier. */
  velocitySensitivity?: number;
  /** Shortest-arc rotation interpolation per frame. */
  rotationSmoothing?: number;
  /** Stretch interpolation per frame while deforming (recovery is slower). */
  deformationSmoothing?: number;
  /** `"global"` follows across the viewport; `"container"` stays inside `containerRef`. */
  mode?: ElasticBlobCursorMode;
  /** Hide the browser cursor while the effect is active on fine-pointer devices. */
  hideNativeCursor?: boolean;
  /** Stacking order of the non-interactive cursor overlay. */
  zIndex?: number;
  /** Turn the cursor off without unmounting it. */
  disabled?: boolean;
  /** Host that constrains tracking/rendering. Required for `mode="container"`. */
  containerRef?: React.RefObject<HTMLElement | null>;
  /** Additional class name applied to the cursor element. */
  className?: string;
}

/**
 * A soft elastic blob that chases the pointer with inertia and stretches
 * along the movement direction.
 *
 * Pointer movement only updates a target point; a single
 * `requestAnimationFrame` loop interpolates the rendered position toward it,
 * derives a smoothed speed + shortest-arc rotation from the target delta, and
 * writes one GPU-composited transform per frame:
 * `translate3d → translate(-50%,-50%) → rotate → scale`.
 *
 * At rest the blob is a circle (`scale 1, 1`); speed stretches it along the
 * travel direction (`scaleX > 1`, `scaleY < 1`, both clamped) with a barely
 * visible border-radius shift, and it relaxes back when the pointer slows.
 * No React state updates happen per frame — everything lives in refs.
 */

const SPEED_SMOOTHING = 0.15;
const RECOVERY_SMOOTHING = 0.1;
const FULL_STRETCH_SPEED = 3200;
const ANGLE_UPDATE_THRESHOLD = 60;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** Interpolate orientations along the shortest arc. Orientations are
 *  π-periodic (an oval rotated by θ looks identical at θ + π), so 180°
 *  direction flips need no rotation at all — the axis is already aligned. */
function lerpAngle(from: number, to: number, factor: number): number {
  let delta = (to - from) % Math.PI;
  if (delta > Math.PI / 2) delta -= Math.PI;
  if (delta < -Math.PI / 2) delta += Math.PI;
  return from + delta * factor;
}

/** Fold a direction into an orientation in [0, π). */
function toOrientation(radians: number): number {
  return ((radians % Math.PI) + Math.PI) % Math.PI;
}

/** Read the page color scheme without requiring a theme provider. */
const resolveColorScheme = (): "light" | "dark" => {
  if (typeof document === "undefined") return "dark";
  const root = document.documentElement;
  if (root.classList.contains("dark")) return "dark";
  if (root.classList.contains("light")) return "light";
  const dataTheme = root.dataset.theme;
  if (dataTheme === "dark" || dataTheme === "light") return dataTheme;
  if (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: light)").matches
  ) {
    return "light";
  }
  return "dark";
};

/** Resolve the effective scheme, following the site theme live when `"auto"`. */
const useThemeScheme = (theme: ElasticBlobCursorTheme): "light" | "dark" => {
  const [scheme, setScheme] = React.useState<"light" | "dark">(() =>
    theme === "auto" || typeof document === "undefined" ? resolveColorScheme() : theme,
  );
  React.useEffect(() => {
    if (theme !== "auto") {
      setScheme(theme);
      return;
    }
    setScheme(resolveColorScheme());
    const observer = new MutationObserver(() => setScheme(resolveColorScheme()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "style"],
    });
    const query = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => setScheme(resolveColorScheme());
    query.addEventListener("change", onChange);
    return () => {
      observer.disconnect();
      query.removeEventListener("change", onChange);
    };
  }, [theme]);
  return scheme;
};

export function ElasticBlobCursor({
  size = 60,
  color = "#FFFFFF",
  lightColor,
  darkColor,
  theme = "auto",
  followStrength = 0.16,
  maxStretch = 1.4,
  compression = 0.22,
  velocitySensitivity = 0.8,
  rotationSmoothing = 0.15,
  deformationSmoothing = 0.18,
  mode = "global",
  hideNativeCursor = true,
  zIndex = 9999,
  disabled = false,
  containerRef,
  className,
}: ElasticBlobCursorProps) {
  const cursorRef = React.useRef<HTMLDivElement>(null);
  const settingsRef = React.useRef({
    followStrength,
    maxStretch,
    compression,
    velocitySensitivity,
    rotationSmoothing,
    deformationSmoothing,
  });
  settingsRef.current = {
    followStrength,
    maxStretch,
    compression,
    velocitySensitivity,
    rotationSmoothing,
    deformationSmoothing,
  };
  const scheme = useThemeScheme(theme);
  // Reference look is a white blob on black. On light stages white is
  // invisible, so fall back to near-black unless overridden.
  const isDefaultColor = color === "#FFFFFF";
  const effectiveColor =
    scheme === "light" ? (lightColor ?? (isDefaultColor ? "#18181B" : color)) : (darkColor ?? color);

  React.useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor || disabled) return;
    // Container mode requires a host; without one it behaves as global.
    const container = mode === "container" ? (containerRef?.current ?? null) : null;

    // Mouse-only effect: never run on touch/coarse pointers and never hide
    // the system cursor there. Reduced-motion users keep the native cursor.
    const finePointer = window.matchMedia("(pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hiddenCursorStyle = document.createElement("style");
    let frame = 0;
    let running = false;
    let lastTime = 0;
    let targetX = 0;
    let targetY = 0;
    let prevTargetX = 0;
    let prevTargetY = 0;
    let currentX = 0;
    let currentY = 0;
    let smoothedSpeed = 0;
    let angle = 0;
    let targetAngle = 0;
    let scaleX = 1;
    let scaleY = 1;
    let enter = 0.8;
    let enterTarget = 0.8;
    let hasPointer = false;
    let visible = false;

    const isUnavailable = () => !finePointer.matches || reducedMotion.matches;

    const setSystemCursor = (hidden: boolean) => {
      if (!hideNativeCursor) return;
      if (hidden) {
        hiddenCursorStyle.textContent = container
          ? "[data-elastic-blob-cursor-active], [data-elastic-blob-cursor-active] * { cursor: none !important; }"
          : "html.elastic-blob-cursor-active, html.elastic-blob-cursor-active * { cursor: none !important; }";
        document.head.appendChild(hiddenCursorStyle);
        if (container) container.setAttribute("data-elastic-blob-cursor-active", "");
        else document.documentElement.classList.add("elastic-blob-cursor-active");
      } else {
        hiddenCursorStyle.remove();
        if (container) container.removeAttribute("data-elastic-blob-cursor-active");
        else document.documentElement.classList.remove("elastic-blob-cursor-active");
      }
    };

    const show = () => {
      if (!visible) {
        visible = true;
        enterTarget = 1;
        cursor.style.opacity = "1";
      }
    };

    const hide = () => {
      if (visible) {
        visible = false;
        enterTarget = 0.8;
        cursor.style.opacity = "0";
      }
    };

    // Snap every coordinate pair to the pointer so entering never produces a
    // giant interpolation jump across the screen.
    const snapToTarget = () => {
      currentX = targetX;
      currentY = targetY;
      prevTargetX = targetX;
      prevTargetY = targetY;
      smoothedSpeed = 0;
      scaleX = 1;
      scaleY = 1;
      enter = 0.8;
      cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
    };

    const render = (now: number) => {
      if (isUnavailable()) {
        running = false;
        frame = 0;
        return;
      }
      const s = settingsRef.current;
      const dt = clamp((now - lastTime) / 1000 || 1 / 60, 1 / 240, 1 / 20);
      lastTime = now;

      // Position follows the target with a slight pull.
      const follow = clamp(s.followStrength, 0.01, 1);
      currentX += (targetX - currentX) * follow;
      currentY += (targetY - currentY) * follow;

      // Velocity comes from the target delta so deformation reflects the
      // pointer — not the lagging blob — and stays framerate-independent.
      const dx = targetX - prevTargetX;
      const dy = targetY - prevTargetY;
      prevTargetX = targetX;
      prevTargetY = targetY;
      const rawSpeed = Math.hypot(dx, dy) / dt;
      const normalized = clamp((rawSpeed * s.velocitySensitivity) / FULL_STRETCH_SPEED, 0, 1);
      smoothedSpeed += (normalized - smoothedSpeed) * SPEED_SMOOTHING;

      // Rotation tracks fresh movement only; the resting circle keeps its
      // last orientation, which is visually irrelevant.
      if (rawSpeed > ANGLE_UPDATE_THRESHOLD && (dx !== 0 || dy !== 0)) {
        targetAngle = toOrientation(Math.atan2(dy, dx));
      }
      angle = lerpAngle(angle, targetAngle, clamp(s.rotationSmoothing, 0.01, 1));

      // Deformation targets: stretch along travel, compress across it.
      const stretchRange = Math.max(0, s.maxStretch - 1);
      const targetScaleX = clamp(1 + smoothedSpeed * stretchRange, 1, Math.max(1, s.maxStretch));
      const targetScaleY = clamp(1 - smoothedSpeed * s.compression, 1 - s.compression, 1);
      // Stretch out fast, relax back slowly for a soft elastic recovery.
      const outRate = clamp(s.deformationSmoothing, 0.01, 1);
      scaleX += (targetScaleX - scaleX) * (targetScaleX > scaleX ? outRate : RECOVERY_SMOOTHING);
      scaleY += (targetScaleY - scaleY) * (targetScaleY < scaleY ? outRate : RECOVERY_SMOOTHING);

      // Entrance scale (0.8 → 1) rides along without extra elements.
      enter += (enterTarget - enter) * 0.18;

      const ex = scaleX * enter;
      const ey = scaleY * enter;
      cursor.style.transform =
        `translate3d(${currentX}px, ${currentY}px, 0) ` +
        `translate(-50%, -50%) rotate(${angle}rad) scale(${ex}, ${ey})`;
      // Whisper-quiet organic radius shift; the scale does the real work.
      const w = smoothedSpeed;
      cursor.style.borderRadius =
        `${50 - 4 * w}% ${50 + 4 * w}% ${50 + 3 * w}% ${50 - 3 * w}% / ` +
        `${50 + 3 * w}% ${50 - 3 * w}% ${50 + 4 * w}% ${50 - 4 * w}%`;

      frame = requestAnimationFrame(render);
    };

    const wake = () => {
      if (!running && !isUnavailable()) {
        running = true;
        lastTime = performance.now();
        frame = requestAnimationFrame(render);
      }
    };

    const pointToTarget = (clientX: number, clientY: number) => {
      const bounds = container?.getBoundingClientRect();
      targetX = clientX - (bounds?.left ?? 0);
      targetY = clientY - (bounds?.top ?? 0);
    };

    const move = (event: PointerEvent) => {
      if (isUnavailable()) return;
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      pointToTarget(event.clientX, event.clientY);
      if (!hasPointer) {
        hasPointer = true;
        snapToTarget();
      }
      show();
      wake();
    };

    const handleEnter = (event: PointerEvent) => {
      if (isUnavailable()) return;
      pointToTarget(event.clientX, event.clientY);
      snapToTarget();
      show();
      wake();
    };

    const updateAvailability = () => {
      const unavailable = isUnavailable();
      cursor.style.display = unavailable ? "none" : "block";
      if (unavailable) {
        hasPointer = false;
        hide();
      } else {
        wake();
      }
      setSystemCursor(!unavailable);
    };

    updateAvailability();

    const moveTarget = container ?? window;
    moveTarget.addEventListener("pointermove", move as EventListener, { passive: true });
    // `pointerleave` on window is unreliable; leaving the viewport surfaces as
    // a mouseout with no related target on the document.
    const handleMouseOut = (event: MouseEvent) => {
      if (!event.relatedTarget) hide();
    };
    const handleMouseOver = (event: MouseEvent) => {
      if (isUnavailable()) return;
      if (!visible && hasPointer) {
        pointToTarget(event.clientX, event.clientY);
        snapToTarget();
        show();
        wake();
      }
    };
    document.documentElement.addEventListener("mouseleave", hide);
    document.addEventListener("mouseout", handleMouseOut);
    document.addEventListener("mouseover", handleMouseOver);
    if (container) {
      container.addEventListener("pointerleave", hide);
      container.addEventListener("pointerenter", handleEnter as EventListener);
    } else {
      window.addEventListener("blur", hide);
    }
    finePointer.addEventListener("change", updateAvailability);
    reducedMotion.addEventListener("change", updateAvailability);

    return () => {
      cancelAnimationFrame(frame);
      setSystemCursor(false);
      moveTarget.removeEventListener("pointermove", move as EventListener);
      document.documentElement.removeEventListener("mouseleave", hide);
      document.removeEventListener("mouseout", handleMouseOut);
      document.removeEventListener("mouseover", handleMouseOver);
      if (container) {
        container.removeEventListener("pointerleave", hide);
        container.removeEventListener("pointerenter", handleEnter as EventListener);
      } else {
        window.removeEventListener("blur", hide);
      }
      finePointer.removeEventListener("change", updateAvailability);
      reducedMotion.removeEventListener("change", updateAvailability);
    };
  }, [containerRef, disabled, hideNativeCursor, mode]);

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className={className ?? ""}
      style={{
        position: containerRef && mode === "container" ? "absolute" : "fixed",
        left: 0,
        top: 0,
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: "50%",
        backgroundColor: effectiveColor,
        transformOrigin: "center center",
        pointerEvents: "none",
        zIndex,
        opacity: 0,
        willChange: "transform",
        transition: "opacity 120ms ease-out, background-color 200ms ease-out",
      }}
    />
  );
}

export default ElasticBlobCursor;
