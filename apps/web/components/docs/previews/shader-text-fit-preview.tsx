"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ShaderText,
  type ShaderTextProps,
} from "@workspace/ui/components/shader-text";

type ShaderTextMeasurement = Pick<
  ShaderTextProps,
  "fontFamily" | "fontStyle" | "fontWeight" | "letterSpacing"
>;

let measurementCanvas: HTMLCanvasElement | null = null;

export function computeShaderFitFontSize(
  containerWidth: number,
  text: string,
  {
    fontFamily = 'Inter, "Helvetica Neue", Arial, sans-serif',
    fontStyle = "normal",
    fontWeight = 800,
    letterSpacing = 0,
  }: ShaderTextMeasurement = {},
  min = 16,
  max = 160,
): number {
  if (containerWidth <= 0 || typeof document === "undefined") return max;

  measurementCanvas ??= document.createElement("canvas");
  const context = measurementCanvas.getContext("2d");
  if (!context) return min;

  context.font = `${fontStyle} ${fontWeight} ${max}px ${fontFamily}`;

  const availableWidth = Math.max(1, containerWidth - 16);
  const fittedSize = String(text || " ")
    .split("\n")
    .reduce((smallestSize, line) => {
      const characters = Array.from(line || " ");
      const spacing = Math.max(0, characters.length - 1) * letterSpacing;
      const glyphWidth = context.measureText(line || " ").width;
      const lineSize =
        glyphWidth > 0
          ? (max * Math.max(1, availableWidth - spacing)) / glyphWidth
          : max;
      return Math.min(smallestSize, lineSize);
    }, max);

  return Math.round(Math.min(max, Math.max(min, fittedSize)));
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
  const [hostWidth, setHostWidth] = useState(0);
  const [fontNonce, setFontNonce] = useState(0);

  useEffect(() => {
    const el = hostRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const w = Math.round(entries[0]?.contentRect.width ?? 0);
      setHostWidth((prev) => (prev === w ? prev : w));
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
      hostWidth,
      props.text ?? " ",
      {
        fontFamily: props.fontFamily,
        fontStyle: props.fontStyle,
        fontWeight: props.fontWeight,
        letterSpacing: props.letterSpacing,
      },
      minFontSize,
      maxFontSize,
    );
  }, [
    fontNonce,
    hostWidth,
    maxFontSize,
    minFontSize,
    props.fontFamily,
    props.fontStyle,
    props.fontWeight,
    props.letterSpacing,
    props.text,
  ]);

  useEffect(() => {
    if (hostWidth > 0) onFontSizeChange?.(fontSize);
  }, [fontSize, hostWidth, onFontSizeChange]);

  return (
    <div
      ref={hostRef}
      className="flex h-full min-w-0 w-full items-center justify-center overflow-hidden"
    >
      <ShaderText {...props} fontSize={fontSize} />
    </div>
  );
}
