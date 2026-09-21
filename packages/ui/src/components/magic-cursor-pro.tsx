"use client";

import * as React from "react";

export type MagicCursorProTheme = "auto" | "light" | "dark";

export interface MagicCursorProProps {
  /** Optional PNG, SVG, or data URL that replaces the default arrow icon. */
  customIcon?: string;
  /** Swap the default arrow's fill and outline colors. */
  invertDefaultIcon?: boolean;
  /** Width and height of the cursor icon in pixels. */
  iconSize?: number;
  /** Color scheme of the default arrow icon. `"auto"` follows the site theme live. */
  theme?: MagicCursorProTheme;
  /** CSS blend mode used to maintain contrast across changing backgrounds. */
  mixBlendMode?: React.CSSProperties["mixBlendMode"];
  /** Enable the subtle compression and rebound on primary-pointer clicks. */
  clickSquish?: boolean;
  /** Spring stiffness that pulls the cursor toward the real pointer. */
  stiffness?: number;
  /** Spring damping. Higher values feel tighter and less bouncy. */
  damping?: number;
  /** Spring mass. Higher values add visible weight and lag. */
  mass?: number;
  /** Hide the browser cursor while Magic Cursor Pro is active. */
  hideSystemCursor?: boolean;
  /** Hide the effect on portrait layouts as well as touch devices. */
  disableOnPortrait?: boolean;
  /** Stacking order of the non-interactive cursor overlay. */
  zIndex?: number;
  /** Turn the cursor off without unmounting it. */
  disabled?: boolean;
  /** Optional host that constrains pointer tracking and cursor rendering. */
  containerRef?: React.RefObject<HTMLElement | null>;
  /** Additional class name applied to the cursor wrapper. */
  className?: string;
}

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

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
const useThemeScheme = (theme: MagicCursorProTheme): "light" | "dark" => {
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

/** A spring-driven custom cursor with a compact outlined arrow and tactile click feedback. */
export function MagicCursorPro({
  customIcon,
  invertDefaultIcon = false,
  iconSize = 34,
  theme = "auto",
  mixBlendMode = "normal",
  clickSquish = true,
  stiffness = 400,
  damping = 35,
  mass = 1,
  hideSystemCursor = true,
  disableOnPortrait = true,
  zIndex = 9999,
  disabled = false,
  containerRef,
  className,
}: MagicCursorProProps) {
  const scheme = useThemeScheme(theme);
  const light = theme === "auto" ? scheme === "light" : theme === "light";
  const cursorRef = React.useRef<HTMLDivElement>(null);
  const iconRef = React.useRef<HTMLDivElement>(null);
  const settingsRef = React.useRef({ stiffness, damping, mass, clickSquish });
  settingsRef.current = { stiffness, damping, mass, clickSquish };

  React.useEffect(() => {
    const cursor = cursorRef.current;
    const icon = iconRef.current;
    if (!cursor || !icon || disabled) return;
    const container = containerRef?.current;

    const coarsePointer = window.matchMedia("(pointer: coarse)");
    const portrait = window.matchMedia("(orientation: portrait)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hiddenCursorStyle = document.createElement("style");
    let frame = 0;
    let active = false;
    let lastTime = performance.now();
    const initialBounds = container?.getBoundingClientRect();
    let currentX = (initialBounds?.width ?? window.innerWidth) / 2;
    let currentY = (initialBounds?.height ?? window.innerHeight) / 2;
    let targetX = currentX;
    let targetY = currentY;
    let velocityX = 0;
    let velocityY = 0;

    const shouldDisable = () =>
      coarsePointer.matches || reducedMotion.matches || (disableOnPortrait && portrait.matches);

    const setSystemCursor = (hidden: boolean) => {
      if (!hideSystemCursor) return;
      if (hidden) {
        hiddenCursorStyle.textContent = container
          ? "[data-magic-cursor-pro-active], [data-magic-cursor-pro-active] * { cursor: none !important; }"
          : "html.magic-cursor-pro-active, html.magic-cursor-pro-active * { cursor: none !important; }";
        document.head.appendChild(hiddenCursorStyle);
        if (container) container.setAttribute("data-magic-cursor-pro-active", "");
        else document.documentElement.classList.add("magic-cursor-pro-active");
      } else {
        hiddenCursorStyle.remove();
        if (container) container.removeAttribute("data-magic-cursor-pro-active");
        else document.documentElement.classList.remove("magic-cursor-pro-active");
      }
    };

    const render = (now: number) => {
      const delta = clamp((now - lastTime) / 1000, 0, 0.032);
      lastTime = now;
      const settings = settingsRef.current;
      const safeMass = Math.max(0.1, settings.mass);
      velocityX += ((targetX - currentX) * settings.stiffness - velocityX * settings.damping) / safeMass * delta;
      velocityY += ((targetY - currentY) * settings.stiffness - velocityY * settings.damping) / safeMass * delta;
      currentX += velocityX * delta;
      currentY += velocityY * delta;
      cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate3d(-50%, -50%, 0)`;
      if (active || Math.abs(velocityX) + Math.abs(velocityY) > 0.08) {
        frame = requestAnimationFrame(render);
      } else {
        frame = 0;
      }
    };

    const wake = () => {
      if (!frame) {
        lastTime = performance.now();
        frame = requestAnimationFrame(render);
      }
    };

    const move = (event: PointerEvent) => {
      if (shouldDisable()) return;
      const bounds = container?.getBoundingClientRect();
      targetX = event.clientX - (bounds?.left ?? 0);
      targetY = event.clientY - (bounds?.top ?? 0);
      active = true;
      cursor.style.opacity = "1";
      wake();
    };

    const hide = () => {
      active = false;
      cursor.style.opacity = "0";
    };

    const press = () => {
      if (!settingsRef.current.clickSquish || shouldDisable()) return;
      icon.style.transform = "scale(0.76, 1.14)";
    };

    const release = () => {
      icon.style.transform = "scale(1)";
    };

    const updateAvailability = () => {
      const unavailable = shouldDisable();
      cursor.style.display = unavailable ? "none" : "block";
      if (unavailable) hide();
      setSystemCursor(!unavailable);
    };

    updateAvailability();
    if (container) {
      container.addEventListener("pointermove", move, { passive: true });
      container.addEventListener("pointerleave", hide);
      container.addEventListener("pointerdown", press, { passive: true });
      container.addEventListener("pointerup", release, { passive: true });
    } else {
      window.addEventListener("pointermove", move, { passive: true });
      window.addEventListener("pointerleave", hide);
      window.addEventListener("pointerdown", press, { passive: true });
      window.addEventListener("pointerup", release, { passive: true });
    }
    window.addEventListener("blur", release);
    coarsePointer.addEventListener("change", updateAvailability);
    portrait.addEventListener("change", updateAvailability);
    reducedMotion.addEventListener("change", updateAvailability);
    return () => {
      cancelAnimationFrame(frame);
      setSystemCursor(false);
      if (container) {
        container.removeEventListener("pointermove", move);
        container.removeEventListener("pointerleave", hide);
        container.removeEventListener("pointerdown", press);
        container.removeEventListener("pointerup", release);
      } else {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerleave", hide);
        window.removeEventListener("pointerdown", press);
        window.removeEventListener("pointerup", release);
      }
      window.removeEventListener("blur", release);
      coarsePointer.removeEventListener("change", updateAvailability);
      portrait.removeEventListener("change", updateAvailability);
      reducedMotion.removeEventListener("change", updateAvailability);
    };
  }, [containerRef, disabled, disableOnPortrait, hideSystemCursor]);

  // Dark arrow on light stages, light arrow on dark stages; the contrasting
  // outline keeps the icon readable while the spring settles across blends.
  const baseFill = light ? "#09090b" : "#ffffff";
  const baseStroke = light ? "#ffffff" : "#09090b";
  const defaultFill = invertDefaultIcon ? baseStroke : baseFill;
  const defaultStroke = invertDefaultIcon ? baseFill : baseStroke;

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className={`pointer-events-none ${containerRef ? "absolute" : "fixed"} left-0 top-0 ${className ?? ""}`}
      style={{ zIndex, opacity: 0, mixBlendMode, willChange: "transform" }}
    >
      <div
        ref={iconRef}
        className="flex items-center justify-center"
        style={{ width: iconSize, height: iconSize, transition: "transform 130ms cubic-bezier(0.22, 1.35, 0.36, 1)" }}
      >
        {customIcon ? (
          <img src={customIcon} alt="" draggable={false} className="h-full w-full select-none object-contain" />
        ) : (
          <svg viewBox="0 0 28 34" className="h-full w-full drop-shadow-[0_2px_6px_rgba(0,0,0,0.28)] dark:drop-shadow-[0_2px_8px_rgba(0,0,0,0.75)]" fill="none">
            <path d="M3 2.5 24.5 16 14.2 19.2 10.8 30.8 3 2.5Z" fill={defaultFill} stroke={defaultStroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
          </svg>
        )}
      </div>
    </div>
  );
}
