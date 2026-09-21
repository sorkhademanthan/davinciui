"use client";

import { useRef } from "react";
import { useTheme } from "next-themes";
import { GeometricTrailCursor } from "@workspace/ui/components/geometric-trail-cursor";

/** Mirrors the component page preview, constrained to the catalog card. */
export function GeometricTrailCursorCardPreview() {
  const previewRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  return (
    <div
      ref={previewRef}
      className="absolute inset-0 overflow-hidden bg-zinc-100 dark:bg-black"
    >
      <GeometricTrailCursor
        containerRef={previewRef}
        activeColor={isDark ? "#22D3EE" : "#2563EB"}
        ghostColor={isDark ? "#26262B" : "#A1A1AA"}
        backgroundColor={isDark ? "#000000" : "#F4F4F5"}
        minSize={12}
        maxSize={48}
        spacing={9}
        density={1.2}
        velocityScale={0.85}
        activeDuration={340}
        colorFadeDuration={700}
        ghostDuration={1800}
        strokeWidth={1.25}
        glow={4}
        maxShapes={160}
        zIndex={10}
      />
    </div>
  );
}
