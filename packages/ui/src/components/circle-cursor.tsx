"use client";

import * as React from "react";

export type CircleCursorTheme = "auto" | "light" | "dark";

export interface CircleCursorProps {
  /** Diameter of the circle in pixels. */
  size?: number;
  /** Solid fill color of the circle. Used for both themes unless overridden by `lightColor` / `darkColor`. */
  color?: string;
  /** Fill color used on light backgrounds. Defaults to a deeper orange for contrast. */
  lightColor?: string;
  /** Fill color used on dark backgrounds. */
  darkColor?: string;
  /** Color scheme for the circle. `"auto"` follows the site theme live. */
  theme?: CircleCursorTheme;
  /** Interpolation factor per frame (0.12 – 0.22). Higher is tighter. */
  followSpeed?: number;
  /** Hide the browser cursor while the effect is active on fine-pointer devices. */
  hideNativeCursor?: boolean;
  /** Stacking order of the non-interactive cursor overlay. */
  zIndex?: number;
  /** Turn the cursor off without unmounting it. */
  disabled?: boolean;
  /** Optional host that constrains pointer tracking and cursor rendering. */
  containerRef?: React.RefObject<HTMLElement | null>;
  /** Additional class name applied to the cursor element. */
  className?: string;
}

/**
 * A single solid circular follower cursor.
 *
 * Pointer movement only updates the target coordinates; a single
 * `requestAnimationFrame` loop interpolates the rendered position toward the
 * target (`current += (target - current) * followSpeed`) and positions the
 * circle with a GPU-composited `translate3d` transform centered on the point.
 *
 * The circle is theme-aware: with `theme="auto"` (default) it follows the
 * site color scheme live (`.dark` / `.light` class, `data-theme`, then
 * `prefers-color-scheme`) and swaps between `lightColor` and `darkColor`.
 * Pass `color` to force a single color on both themes, or `theme="light"` /
 * `theme="dark"` to pin one variant.
 */

/** Read the page color scheme without requiring a theme provider. */
const resolveColorScheme = (): "light" | "dark" => {
  if (typeof document === "undefined") return "light";
  const root = document.documentElement;
  if (root.classList.contains("dark")) return "dark";
  if (root.classList.contains("light")) return "light";
  const dataTheme = root.dataset.theme;
  if (dataTheme === "dark" || dataTheme === "light") return dataTheme;
  if (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }
  return "light";
};

/** Resolve the effective scheme, following the site theme live when `"auto"`. */
const useThemeScheme = (theme: CircleCursorTheme): "light" | "dark" => {
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
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setScheme(resolveColorScheme());
    query.addEventListener("change", onChange);
    return () => {
      observer.disconnect();
      query.removeEventListener("change", onChange);
    };
  }, [theme]);
  return scheme;
};

export function CircleCursor({
  size = 46,
  color = "#FF3B0A",
  lightColor,
  darkColor,
  theme = "auto",
  followSpeed = 0.16,
  hideNativeCursor = true,
  zIndex = 9999,
  disabled = false,
  containerRef,
  className,
}: CircleCursorProps) {
  const cursorRef = React.useRef<HTMLDivElement>(null);
  const settingsRef = React.useRef({ followSpeed });
  settingsRef.current = { followSpeed };
  const scheme = useThemeScheme(theme);
  // Backward-compatible theming: `color` alone applies to both schemes.
  // When `color` is left at its default, light mode uses a deeper orange
  // (#EA580C) for contrast on white while dark mode keeps #FF3B0A.
  // Explicit `lightColor` / `darkColor` always win for their scheme.
  const isDefaultColor = color === "#FF3B0A";
  const effectiveColor =
    scheme === "light" ? (lightColor ?? (isDefaultColor ? "#EA580C" : color)) : (darkColor ?? color);

  React.useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor || disabled) return;
    const container = containerRef?.current;

    // This is a mouse-only effect: never run on touch/coarse pointers and
    // never hide the system cursor there.
    const finePointer = window.matchMedia("(pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hiddenCursorStyle = document.createElement("style");
    let frame = 0;
    let running = false;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let hasPointer = false;
    let visible = false;

    const isUnavailable = () => !finePointer.matches || reducedMotion.matches;

    const setSystemCursor = (hidden: boolean) => {
      if (!hideNativeCursor) return;
      if (hidden) {
        hiddenCursorStyle.textContent = container
          ? "[data-circle-cursor-active], [data-circle-cursor-active] * { cursor: none !important; }"
          : "html.circle-cursor-active, html.circle-cursor-active * { cursor: none !important; }";
        document.head.appendChild(hiddenCursorStyle);
        if (container) container.setAttribute("data-circle-cursor-active", "");
        else document.documentElement.classList.add("circle-cursor-active");
      } else {
        hiddenCursorStyle.remove();
        if (container) container.removeAttribute("data-circle-cursor-active");
        else document.documentElement.classList.remove("circle-cursor-active");
      }
    };

    const show = () => {
      if (!visible) {
        visible = true;
        cursor.style.opacity = "1";
      }
    };

    const hide = () => {
      if (visible) {
        visible = false;
        cursor.style.opacity = "0";
      }
    };

    // Snap the rendered position to the pointer so re-entering the viewport
    // never produces a giant interpolation jump across the screen.
    const snapToTarget = () => {
      currentX = targetX;
      currentY = targetY;
      cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
    };

    const render = () => {
      if (isUnavailable()) {
        running = false;
        frame = 0;
        return;
      }
      const speed = settingsRef.current.followSpeed;
      currentX += (targetX - currentX) * speed;
      currentY += (targetY - currentY) * speed;
      cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
      frame = requestAnimationFrame(render);
    };

    const wake = () => {
      if (!running && !isUnavailable()) {
        running = true;
        frame = requestAnimationFrame(render);
      }
    };

    const move = (event: PointerEvent) => {
      if (isUnavailable()) return;
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      const bounds = container?.getBoundingClientRect();
      targetX = event.clientX - (bounds?.left ?? 0);
      targetY = event.clientY - (bounds?.top ?? 0);
      if (!hasPointer) {
        // Initialize both coordinate pairs on first movement so the circle
        // appears under the pointer instead of flying in from (0, 0).
        hasPointer = true;
        snapToTarget();
      }
      show();
      wake();
    };

    const handleEnter = (event: PointerEvent) => {
      if (isUnavailable()) return;
      const bounds = container?.getBoundingClientRect();
      targetX = event.clientX - (bounds?.left ?? 0);
      targetY = event.clientY - (bounds?.top ?? 0);
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
        // Restart the single RAF loop when returning to a capable device.
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
        targetX = event.clientX - (container?.getBoundingClientRect().left ?? 0);
        targetY = event.clientY - (container?.getBoundingClientRect().top ?? 0);
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
  }, [containerRef, disabled, hideNativeCursor]);

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className={className ?? ""}
      style={{
        position: containerRef ? "absolute" : "fixed",
        left: 0,
        top: 0,
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: "50%",
        backgroundColor: effectiveColor,
        pointerEvents: "none",
        zIndex,
        opacity: 0,
        willChange: "transform",
        transition: "opacity 120ms ease-out, background-color 200ms ease-out",
      }}
    />
  );
}

export default CircleCursor;
