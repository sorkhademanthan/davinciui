"use client";

import { useRef } from "react";
import { useTheme } from "next-themes";
import { GeometricTrailCursor } from "@workspace/ui/components/geometric-trail-cursor";
import { useAmbientCursorDrive } from "./use-ambient-cursor-drive";

/**
 * Self-playing card thumbnail. A lightweight ambient driver steers a
 * virtual pointer along a Lissajous path so the trail paints continuously
 * with no hover or input required. See `useAmbientCursorDrive`.
 */
export function GeometricTrailCursorCardPreview() {
  const previewRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  useAmbientCursorDrive(previewRef);

  return (
    <div
      ref={previewRef}
      className="absolute inset-0 overflow-hidden bg-zinc-100 dark:bg-black"
      style={{ containerType: "inline-size" }}
    >
      <GeometricTrailCursor
        containerRef={previewRef}
        activeColor={isDark ? "#22D3EE" : "#2563EB"}
        ghostColor={isDark ? "#2E2E33" : "#A1A1AA"}
        backgroundColor={isDark ? "#000000" : "#F4F4F5"}
        minSize={10}
        maxSize={64}
        spacing={10}
        density={1.4}
        velocityScale={1.1}
        activeDuration={380}
        colorFadeDuration={750}
        ghostDuration={3200}
        strokeWidth={1.4}
        glow={6}
        maxShapes={240}
        zIndex={1}
      />
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-3">
        <span className="whitespace-nowrap text-[clamp(1.7rem,11cqi,3.8rem)] font-black uppercase leading-none tracking-[-0.075em] text-zinc-950 dark:text-white">
          DAVINCIUI
        </span>
      </div>
    </div>
  );
}
