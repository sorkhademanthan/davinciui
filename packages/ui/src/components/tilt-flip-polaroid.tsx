"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@workspace/ui/lib/utils";

export interface TiltFlipPolaroidImage {
  src: string;
  alt: string;
}

export interface TiltFlipPolaroidProps {
  image: TiltFlipPolaroidImage;
  /** Caption printed below the photo. @default "12/07/24" */
  date?: string;
  /** Handwritten note on the back face. New lines are preserved. */
  backText?: string;
  /** Controlled flipped state. */
  flipped?: boolean;
  /** Initial flipped state when uncontrolled. @default false */
  defaultFlipped?: boolean;
  /** Fires whenever a flip is requested, in both controlled and uncontrolled modes. */
  onFlippedChange?: (flipped: boolean) => void;
  /** Maximum tilt in degrees on each axis. @default 15 */
  maxTilt?: number;
  /** Perspective distance for the tilt stage. @default 1000 */
  perspective?: number;
  /** Disable pointer tilt while keeping click, tap, and keyboard flipping. @default true */
  tiltEnabled?: boolean;
  /** Allow selecting the handwritten back text. @default false */
  selectableBack?: boolean;
  /** Card width in CSS pixels. @default 396 */
  width?: number;
  /** Card height in CSS pixels. @default 443 */
  height?: number;
  className?: string;
  /** Escape hatch for overriding the exposed CSS custom properties. */
  style?: React.CSSProperties;
}

export const TILT_FLIP_POLAROID_DEFAULT_BACK_TEXT = `jeju, april.
i wandered into this field alone and
just stood there for way too long.
closed my eyes, felt the wind,
thought about nothing.
brought myself flowers for once. ⚘`;

const TILT_SPRING = { stiffness: 100, damping: 18, mass: 1 } as const;
const FLIP_SPRING = { stiffness: 400, damping: 40, mass: 1 } as const;
const TILT_AXIS_LIMIT = 1;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}

function useCoarsePointer() {
  const [coarse, setCoarse] = React.useState(false);

  React.useEffect(() => {
    const query = window.matchMedia("(hover: none), (pointer: coarse)");
    const update = () => setCoarse(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return coarse;
}

export function TiltFlipPolaroid({
  image,
  date = "12/07/24",
  backText = TILT_FLIP_POLAROID_DEFAULT_BACK_TEXT,
  flipped,
  defaultFlipped = false,
  onFlippedChange,
  maxTilt = 15,
  perspective = 1000,
  tiltEnabled = true,
  selectableBack = false,
  width = 396,
  height = 443,
  className,
  style,
}: TiltFlipPolaroidProps) {
  const controlled = flipped !== undefined;
  const [uncontrolledFlipped, setUncontrolledFlipped] =
    React.useState(defaultFlipped);
  const isFlipped = controlled ? flipped : uncontrolledFlipped;

  const reduceMotion = usePrefersReducedMotion();
  const coarsePointer = useCoarsePointer();
  const tiltActive = tiltEnabled && !reduceMotion && !coarsePointer;

  const requestedFlippedRef = React.useRef(isFlipped);
  const onFlippedChangeRef = React.useRef(onFlippedChange);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const tiltRef = React.useRef<HTMLDivElement | null>(null);

  onFlippedChangeRef.current = onFlippedChange;

  React.useEffect(() => {
    requestedFlippedRef.current = isFlipped;
  }, [isFlipped]);

  const tiltXTarget = useMotionValue(0);
  const tiltYTarget = useMotionValue(0);
  const rotateX = useSpring(tiltXTarget, TILT_SPRING);
  const rotateY = useSpring(tiltYTarget, TILT_SPRING);

  const flipTarget = useMotionValue(defaultFlipped ? 180 : 0);
  const flipRotation = useSpring(flipTarget, FLIP_SPRING);

  React.useEffect(() => {
    flipTarget.set(reduceMotion ? 0 : isFlipped ? 180 : 0);
  }, [flipTarget, isFlipped, reduceMotion]);

  const writeTiltData = React.useCallback((x: number, y: number) => {
    const node = tiltRef.current;
    if (!node) return;
    node.dataset.tiltX = x.toFixed(3);
    node.dataset.tiltY = y.toFixed(3);
  }, []);

  const resetTilt = React.useCallback(() => {
    tiltXTarget.set(0);
    tiltYTarget.set(0);
    writeTiltData(0, 0);
  }, [tiltXTarget, tiltYTarget, writeTiltData]);

  React.useEffect(() => {
    if (!tiltActive) resetTilt();
  }, [resetTilt, tiltActive]);

  const flip = React.useCallback(() => {
    const next = !requestedFlippedRef.current;
    requestedFlippedRef.current = next;
    if (!controlled) setUncontrolledFlipped(next);
    onFlippedChangeRef.current?.(next);
  }, [controlled]);

  const handlePointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!tiltActive || event.pointerType === "touch") return;

      const node = rootRef.current;
      if (!node) return;

      const rect = node.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const nx = clamp(
        (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2),
        -TILT_AXIS_LIMIT,
        TILT_AXIS_LIMIT,
      );
      const ny = clamp(
        (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2),
        -TILT_AXIS_LIMIT,
        TILT_AXIS_LIMIT,
      );

      const degrees = Math.max(0, maxTilt);
      const x = -ny * degrees;
      const y = nx * degrees;

      tiltXTarget.set(x);
      tiltYTarget.set(y);
      writeTiltData(x, y);
    },
    [maxTilt, tiltActive, tiltXTarget, tiltYTarget, writeTiltData],
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      if (event.repeat) return;
      event.preventDefault();
      flip();
    },
    [flip],
  );

  const showCrossfade = reduceMotion;
  const frontVisible = !isFlipped;
  const backVisible = isFlipped;

  const label = image.alt ? `Flip photo: ${image.alt}` : "Flip photo";
  const cardWidth = Math.max(1, width);
  const cardHeight = Math.max(1, height);
  const stagePerspective = Math.max(1, perspective);

  const cssVars = {
    "--tfp-bg": "#FDF2F2",
    "--tfp-card": "#FFFFFF",
    "--tfp-ink": "#333333",
    "--tfp-placeholder": "#EEEEEE",
    "--tfp-inset": "12px",
    "--tfp-caption": "64px",
    "--tfp-radius": "3px",
    "--tfp-photo-radius": "1.5px",
    "--tfp-shadow":
      "0 8px 24px rgba(80, 40, 50, 0.22), 0 1px 3px rgba(0, 0, 0, 0.12)",
    "--tfp-font":
      'var(--font-caveat, "Caveat"), "Segoe Script", cursive',
    "--tfp-date-size": "20px",
    "--tfp-back-size": "22px",
    "--tfp-back-line": "26px",
    "--tfp-width": `${cardWidth}px`,
    "--tfp-height": `${cardHeight}px`,
  } as React.CSSProperties;

  const faceStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    borderRadius: "var(--tfp-radius)",
    backgroundColor: "var(--tfp-card)",
    boxShadow: "var(--tfp-shadow)",
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    overflow: "hidden",
  };

  return (
    <div
      ref={rootRef}
      role="button"
      tabIndex={0}
      aria-pressed={isFlipped}
      aria-label={label}
      data-slot="tilt-flip-polaroid"
      data-flipped={isFlipped ? "true" : "false"}
      data-reduced={reduceMotion ? "true" : "false"}
      data-tilt-active={tiltActive ? "true" : "false"}
      className={cn(
        "relative select-none rounded-[var(--tfp-radius)] outline-none",
        "focus-visible:ring-2 focus-visible:ring-[#333]/35 focus-visible:ring-offset-4 focus-visible:ring-offset-[#FDF2F2]",
        className,
      )}
      style={{
        ...cssVars,
        width: cardWidth,
        height: cardHeight,
        perspective: `${stagePerspective}px`,
        cursor: "pointer",
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
        userSelect: selectableBack ? "text" : "none",
        ...style,
      }}
      onClick={flip}
      onKeyDown={handleKeyDown}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
      onPointerCancel={resetTilt}
    >
      <motion.div
        ref={tiltRef}
        data-slot="tilt-flip-polaroid-tilt"
        data-tfp-tilt=""
        data-tilt-x="0.000"
        data-tilt-y="0.000"
        style={{
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transformOrigin: "center",
          rotateX,
          rotateY,
          willChange: "transform",
        }}
      >
        <motion.div
          data-slot="tilt-flip-polaroid-flip"
          data-tfp-flip=""
          style={{
            width: "100%",
            height: "100%",
            transformStyle: "preserve-3d",
            transformOrigin: "center",
            rotateY: flipRotation,
            willChange: "transform",
          }}
        >
          <div
            aria-hidden={!frontVisible}
            data-face="front"
            style={{
              ...faceStyle,
              opacity: showCrossfade ? (isFlipped ? 0 : 1) : 1,
              transition: showCrossfade
                ? "opacity 150ms linear"
                : undefined,
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "var(--tfp-inset)",
                left: "var(--tfp-inset)",
                right: "var(--tfp-inset)",
                height:
                  "calc(var(--tfp-height) - var(--tfp-inset) - var(--tfp-caption))",
                borderRadius: "var(--tfp-photo-radius)",
                overflow: "hidden",
                backgroundColor: "var(--tfp-placeholder)",
              }}
            >
              <img
                src={image.src}
                alt={image.alt}
                draggable={false}
                decoding="async"
                data-tfp-photo=""
                style={{
                  display: "block",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
            <div
              data-tfp-date=""
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 14,
                textAlign: "center",
                fontFamily: "var(--tfp-font)",
                fontSize: "var(--tfp-date-size)",
                fontWeight: 500,
                lineHeight: 1.2,
                color: "var(--tfp-ink)",
              }}
            >
              {date}
            </div>
          </div>

          <div
            aria-hidden={!backVisible}
            data-face="back"
            style={{
              ...faceStyle,
              transform: showCrossfade ? "none" : "rotateY(180deg)",
              opacity: showCrossfade ? (isFlipped ? 1 : 0) : 1,
              transition: showCrossfade
                ? "opacity 150ms linear"
                : undefined,
              pointerEvents:
                selectableBack && isFlipped ? "auto" : "none",
              userSelect: selectableBack ? "text" : "none",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                padding: "0 45px",
              }}
            >
              <p
                data-tfp-back-text=""
                style={{
                  margin: 0,
                  whiteSpace: "pre-line",
                  textAlign: "center",
                  fontFamily: "var(--tfp-font)",
                  fontSize: "var(--tfp-back-size)",
                  fontWeight: 500,
                  lineHeight: "var(--tfp-back-line)",
                  color: "var(--tfp-ink)",
                }}
              >
                {backText}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default TiltFlipPolaroid;
