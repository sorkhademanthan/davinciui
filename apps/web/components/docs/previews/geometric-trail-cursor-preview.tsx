"use client";

import { useRef } from "react";
import { useTheme } from "next-themes";
import { GeometricTrailCursor } from "@workspace/ui/components/geometric-trail-cursor";

export function GeometricTrailCursorPreview() {
  const previewRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  return (
    <div
      ref={previewRef}
      className="relative h-full min-h-[600px] overflow-hidden bg-zinc-100 dark:bg-black"
    >
      <GeometricTrailCursor
        containerRef={previewRef}
        activeColor={isDark ? "#22D3EE" : "#2563EB"}
        ghostColor={isDark ? "#181818" : "#B4B4BC"}
        backgroundColor={isDark ? "#000000" : "#F4F4F5"}
        zIndex={1}
      />
      <p className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-8 text-center text-[clamp(2.5rem,7vw,5.5rem)] font-black tracking-[-0.07em] text-zinc-950 dark:text-white">DAVINCIUI</p>
    </div>
  );
}
