"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

export type MotionHamburgerState = "closed" | "open";

export interface MotionHamburgerProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "children" | "color" | "onToggle"
  > {
  /** Initial toggle state. Changing this in the Framer Canvas resets the icon. */
  initialState?: MotionHamburgerState;
  /** Controlled open state. Omit for uncontrolled toggle behavior. */
  open?: boolean;
  /** Fired on every toggle with the next open state. Connect overlays, drawers, or nav variants in Framer. */
  onToggle?: (isOpen: boolean) => void;
  /** Alias for onToggle, useful for controlled usage. */
  onOpenChange?: (isOpen: boolean) => void;
  /** Icon box size in pixels. Geometry scales automatically via viewBox. */
  size?: number;
  /** Stroke color of the three lines. */
  color?: string;
  /** Stroke width in SVG units. */
  thickness?: number;
  /** Show a subtle circular ring around the icon. */
  showRing?: boolean;
  /** Ring stroke color. */
  ringColor?: string;
  /** Ring stroke width in pixels. */
  ringThickness?: number;
  /** Space between the icon box and the ring in pixels. */
  ringPadding?: number;
  /** Scale applied to the whole assembly on hover. */
  hoverGrowth?: number;
}

/**
 * Exact SVG path geometry. The top and bottom strokes are intentionally
 * longer than the visible hamburger lines — the hidden curved sections are
 * revealed/concealed with stroke-dasharray / stroke-dashoffset during the
 * hamburger-to-X morph. Do not simplify these paths.
 */
const TOP_PATH =
  "M5 10 L27 10 C29.5 10 30.4 7.2 27.9 5.2 C25.6 3.4 20.2 3.6 16 6 L16 26";
const BOTTOM_PATH =
  "M5 22 L27 22 C29.7 22 30.2 24.8 27.8 26.8 C24.6 29.4 13.2 29.2 6 16 L26 16";
const MIDDLE_PATH = "M5 16 L27 16";

/** Total path lengths (dash + gap of the OPEN state). */
const TOP_TOTAL = 20 + 61.219852447509766;
const BOTTOM_TOTAL = 20 + 75.70872497558594;

/** Visible straight segment length of each hamburger line (x = 5 → 27). */
const LINE_LENGTH = 22;

const TOP_CLOSED_DASH = `${LINE_LENGTH} ${TOP_TOTAL - LINE_LENGTH}`;
const BOTTOM_CLOSED_DASH = `${LINE_LENGTH} ${BOTTOM_TOTAL - LINE_LENGTH}`;

const TOP_OPEN_DASH = "20 61.219852447509766";
const BOTTOM_OPEN_DASH = "20 75.70872497558594";
const TOP_OPEN_OFFSET = "-41.219852447509766";
const BOTTOM_OPEN_OFFSET = "-55.70872497558594";

const EASE_DRAW = "cubic-bezier(0.33, 1, 0.68, 1)";
const EASE_OVERSHOOT = "cubic-bezier(0.68, -0.2, 0.265, 1.25)";

const SVG_ROTATE_TRANSITION = `transform 620ms ${EASE_OVERSHOOT}`;
const STROKE_TRANSITION = `stroke-dasharray 620ms ${EASE_DRAW}, stroke-dashoffset 620ms ${EASE_DRAW}`;
const MIDDLE_TRANSITION = `transform 520ms ${EASE_DRAW}, opacity 420ms ease`;
const RING_TRANSITION = `transform 620ms ${EASE_DRAW}, opacity 620ms ease`;
const HOVER_TRANSITION = `transform 320ms ${EASE_DRAW}`;

function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function MotionHamburger({
  initialState = "closed",
  open: controlledOpen,
  onToggle,
  onOpenChange,
  size = 48,
  color = "#FFFFFF",
  thickness = 2.5,
  showRing = false,
  ringColor = "rgba(255, 255, 255, 0.35)",
  ringThickness = 1,
  ringPadding = 6,
  hoverGrowth = 1.05,
  className,
  style,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  ...props
}: MotionHamburgerProps) {
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = React.useState(
    () => initialState === "open",
  );
  const [isHovered, setIsHovered] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  const isOpen = isControlled ? controlledOpen : internalOpen;

  // Keep the Framer Canvas in sync when the Initial State control changes.
  React.useEffect(() => {
    if (!isControlled) setInternalOpen(initialState === "open");
  }, [initialState, isControlled]);

  const normalizedSize = clamp(size, 24, 500);
  const normalizedThickness = clamp(thickness, 1, 8);
  const normalizedGrowth = clamp(hoverGrowth, 1, 1.3);
  const normalizedRingThickness = clamp(ringThickness, 0.5, 8);
  const normalizedRingPadding = clamp(ringPadding, 0, 64);

  const totalSize = showRing
    ? normalizedSize + normalizedRingPadding * 2
    : normalizedSize;
  const ringRadius = Math.max(
    1,
    totalSize / 2 - normalizedRingThickness / 2 - 1,
  );
  const hovered = isHovered || isFocused;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    const next = !isOpen;
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
    onToggle?.(next);
  };

  return (
    <div
      data-slot="motion-hamburger"
      data-state={isOpen ? "open" : "closed"}
      className={cn("motion-hamburger-root", className)}
      style={{ width: totalSize, height: totalSize, ...style }}
    >
      <style>{`
        .motion-hamburger-btn:focus-visible {
          outline: 2px solid currentColor;
          outline-offset: 4px;
        }
        @media (prefers-reduced-motion: reduce) {
          .motion-hamburger-anim,
          .motion-hamburger-anim * {
            transition-duration: 0.01ms !important;
            transition-timing-function: ease-out !important;
          }
        }
      `}</style>
      <div
        className="motion-hamburger-anim"
        style={{
          position: "relative",
          width: totalSize,
          height: totalSize,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: hovered ? `scale(${normalizedGrowth})` : "scale(1)",
          transition: HOVER_TRANSITION,
        }}
      >
        {showRing && (
          <svg
            aria-hidden="true"
            focusable="false"
            width={totalSize}
            height={totalSize}
            viewBox={`0 0 ${totalSize} ${totalSize}`}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              overflow: "visible",
              transformOrigin: "50% 50%",
              transform: isOpen ? "scale(1.05)" : "scale(1)",
              opacity: isOpen ? 0.55 : 1,
              transition: RING_TRANSITION,
            }}
          >
            <circle
              cx={totalSize / 2}
              cy={totalSize / 2}
              r={ringRadius}
              fill="none"
              stroke={ringColor}
              strokeWidth={normalizedRingThickness}
            />
          </svg>
        )}
        <button
          type="button"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          data-slot="motion-hamburger-button"
          onClick={handleClick}
          onMouseEnter={(event) => {
            setIsHovered(true);
            onMouseEnter?.(event);
          }}
          onMouseLeave={(event) => {
            setIsHovered(false);
            onMouseLeave?.(event);
          }}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          className="motion-hamburger-btn motion-hamburger-anim"
          style={{
            border: "none",
            background: "transparent",
            padding: 0,
            margin: 0,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: normalizedSize,
            height: normalizedSize,
            flexShrink: 0,
            color,
            WebkitTapHighlightColor: "transparent",
            touchAction: "manipulation",
          }}
          {...props}
        >
          <svg
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 32 32"
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              overflow: "visible",
              transformOrigin: "50% 50%",
              transform: isOpen ? "rotate(45deg) scale(1)" : "rotate(0deg) scale(1)",
              transition: SVG_ROTATE_TRANSITION,
            }}
          >
            <path
              d={TOP_PATH}
              fill="none"
              stroke="currentColor"
              strokeWidth={normalizedThickness}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: isOpen ? TOP_OPEN_DASH : TOP_CLOSED_DASH,
                strokeDashoffset: isOpen ? TOP_OPEN_OFFSET : "0",
                transition: STROKE_TRANSITION,
              }}
            />
            <path
              d={MIDDLE_PATH}
              fill="none"
              stroke="currentColor"
              strokeWidth={normalizedThickness}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transformBox: "fill-box",
                transformOrigin: "50% 50%",
                transform: isOpen ? "scaleX(0)" : "scaleX(1)",
                opacity: isOpen ? 0 : 1,
                transition: MIDDLE_TRANSITION,
              }}
            />
            <path
              d={BOTTOM_PATH}
              fill="none"
              stroke="currentColor"
              strokeWidth={normalizedThickness}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: isOpen ? BOTTOM_OPEN_DASH : BOTTOM_CLOSED_DASH,
                strokeDashoffset: isOpen ? BOTTOM_OPEN_OFFSET : "0",
                transition: STROKE_TRANSITION,
              }}
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

const propertyControls = {
  initialState: {
    type: "Enum",
    title: "Initial State",
    options: ["closed", "open"],
    optionTitles: ["Closed", "Open"],
    defaultValue: "closed",
    displaySegmentedControl: true,
    group: "State",
  },
  size: {
    type: "Number",
    title: "Size",
    min: 24,
    max: 500,
    step: 1,
    defaultValue: 48,
    group: "Icon",
  },
  color: {
    type: "Color",
    title: "Icon Color",
    defaultValue: "#FFFFFF",
    group: "Icon",
  },
  thickness: {
    type: "Number",
    title: "Line Thickness",
    min: 1,
    max: 8,
    step: 0.1,
    defaultValue: 2.5,
    group: "Icon",
  },
  showRing: {
    type: "Boolean",
    title: "Show Ring",
    defaultValue: false,
    group: "Ring",
  },
  ringColor: {
    type: "Color",
    title: "Ring Color",
    defaultValue: "rgba(255, 255, 255, 0.35)",
    group: "Ring",
  },
  ringThickness: {
    type: "Number",
    title: "Ring Thickness",
    min: 0.5,
    max: 8,
    step: 0.1,
    defaultValue: 1,
    group: "Ring",
  },
  ringPadding: {
    type: "Number",
    title: "Ring Padding",
    min: 0,
    max: 64,
    step: 1,
    defaultValue: 6,
    group: "Ring",
  },
  hoverGrowth: {
    type: "Number",
    title: "Hover Growth",
    min: 1,
    max: 1.3,
    step: 0.01,
    defaultValue: 1.05,
    group: "Hover",
  },
  onToggle: {
    type: "EventHandler",
    title: "On Toggle",
    group: "Events",
  },
};

(MotionHamburger as unknown as Record<string, unknown>).propertyControls =
  propertyControls;
(MotionHamburger as unknown as Record<string, unknown>).addPropertyControls =
  propertyControls;

export default MotionHamburger;
