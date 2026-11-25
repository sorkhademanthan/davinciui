"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ShaderText,
  type ShaderTextProps,
} from "@workspace/ui/components/shader-text";

type ShaderTextMeasurement = Pick<
  ShaderTextProps,
  "fontFamily" | "fontStyle" | "fontWeight" | "letterSpacing" | "lineHeight"
>;

let measurementCanvas: HTMLCanvasElement | null = null;

/**
 * The ShaderText root is an inline-block with `padding: 0.14lh·f` vertically
 * and `0.08·f` horizontally on each side (see shader-text.tsx). Its intrinsic
 * width is therefore `glyphWidth(f) + letterSpacing·(n-1) + 0.16·f`, and its
 * height is `lineHeight·(lines + 0.28)·f`. Fitting must account for both the
 * padding and the letter-spacing, otherwise the computed size overflows the
 * container and `overflow-hidden` clips the leading/trailing glyphs.
 *
 * Width is linear in the font size, so we measure once at `max` px:
 *   width(f) = (glyphWidth(max)/max)·f + spacingPx + 0.16·f
 * and solve for the largest f that fits the available width (and height).
 */
export function computeShaderFitFontSize(
  containerWidth: number,
  containerHeight: number,
  text: string,
  {
    fontFamily = 'Inter, "Helvetica Neue", Arial, sans-serif',
    fontStyle = "normal",
    fontWeight = 800,
    letterSpacing = 0,
    lineHeight = 1,
  }: ShaderTextMeasurement = {},
  min = 16,
  max = 160,
): number {
  if (containerWidth <= 0 || typeof document === "undefined") return max;

  measurementCanvas ??= document.createElement("canvas");
  const context = measurementCanvas.getContext("2d");
  if (!context) return min;

  context.font = `${fontStyle} ${fontWeight} ${max}px ${fontFamily}`;

  const lines = String(text ?? "").split("\n");
  const safeLineHeight = Number.isFinite(lineHeight) && lineHeight > 0 ? lineHeight : 1;
  const safeLetterSpacing = Number.isFinite(letterSpacing) ? letterSpacing : 0;

  // Keep the glyphs off the container edges (also absorbs Math.ceil padding).
  const SAFETY = 16;
  const availableWidth = Math.max(1, containerWidth - SAFETY);
  const availableHeight =
    containerHeight > 0 ? Math.max(1, containerHeight - SAFETY) : Infinity;

  // Horizontal padding on both sides, as a ratio of the font size.
  const padXRatio = 0.16;

  let limit = max;

  for (const line of lines) {
    const glyphWidthAtMax = context.measureText(line === "" ? " " : line).width;
    const glyphPerPx = glyphWidthAtMax / max;
    // Letter-spacing is applied in px regardless of font size, so it is a
    // constant additive term (may be negative).
    const spacingPx =
      Math.max(0, Array.from(line).length - 1) * safeLetterSpacing;
    const widthPerPx = glyphPerPx + padXRatio;
    if (widthPerPx <= 0) continue;
    const widthLimit = (availableWidth - spacingPx) / widthPerPx;
    limit = Math.min(limit, widthLimit);
  }

  // Vertical padding is `0.14lh·f` top and bottom → 0.28lh·f total.
  const heightPerPx = safeLineHeight * (lines.length + 0.28);
  if (availableHeight !== Infinity && heightPerPx > 0) {
    limit = Math.min(limit, availableHeight / heightPerPx);
  }

  // Floor (not round) so we never nudge past what actually fits.
  return Math.floor(Math.min(max, Math.max(min, limit)));
}

type ShaderTextFitPreviewProps = Omit<ShaderTextProps, "fontSize"> & {
  minFontSize?: number;
  maxFontSize?: number;
  onFontSizeChange?: (fontSize: number) => void;
};

/** ShaderText that always fits its own box — no clipping at any size. */
export function ShaderTextFitPreview({
  minFontSize = 16,
  maxFontSize = 160,
  onFontSizeChange,
  ...props
}: ShaderTextFitPreviewProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [hostSize, setHostSize] = useState({ width: 0, height: 0 });
  const [fontNonce, setFontNonce] = useState(0);

  useEffect(() => {
    const el = hostRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      const width = Math.round(rect?.width ?? 0);
      const height = Math.round(rect?.height ?? 0);
      setHostSize((prev) =>
        prev.width === width && prev.height === height
          ? prev
          : { width, height },
      );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!("fonts" in document)) return;

    let cancelled = false;
    void document.fonts.ready.then(() => {
      if (!cancelled) setFontNonce((value) => value + 1);
    });

    return () => {
      cancelled = true;
    };
  }, [props.fontFamily, props.fontStyle, props.fontWeight]);

  const fontSize = useMemo(() => {
    void fontNonce;
    return computeShaderFitFontSize(
      hostSize.width,
      hostSize.height,
      props.text ?? " ",
      {
        fontFamily: props.fontFamily,
        fontStyle: props.fontStyle,
        fontWeight: props.fontWeight,
        letterSpacing: props.letterSpacing,
        lineHeight: props.lineHeight,
      },
      minFontSize,
      maxFontSize,
    );
  }, [
    fontNonce,
    hostSize.width,
    hostSize.height,
    maxFontSize,
    minFontSize,
    props.fontFamily,
    props.fontStyle,
    props.fontWeight,
    props.letterSpacing,
    props.lineHeight,
    props.text,
  ]);

  useEffect(() => {
    if (hostSize.width > 0) onFontSizeChange?.(fontSize);
  }, [fontSize, hostSize.width, onFontSizeChange]);

  return (
    <div
      ref={hostRef}
      className="flex h-full min-w-0 w-full items-center justify-center overflow-hidden"
    >
      <ShaderText {...props} fontSize={fontSize} />
    </div>
  );
}
