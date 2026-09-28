"use client";

import { useRef } from "react";
import { FluidCursor } from "@workspace/ui/components/fluid-cursor";
import { useAmbientCursorDrive } from "./use-ambient-cursor-drive";

/**
 * Self-playing card thumbnail. The ambient driver steers a virtual pointer
 * along a Lissajous path so liquid light drifts continuously with no hover
 * required. Offscreen cards cost no frames (driver is visibility-gated).
 */
export function FluidCursorCardPreview() {
  const previewRef = useRef<HTMLDivElement>(null);

  useAmbientCursorDrive(previewRef, { phase: 4.2 });

  return (
    <div
      ref={previewRef}
      className="absolute inset-0 overflow-hidden bg-zinc-100 dark:bg-black"
      style={{ containerType: "inline-size" }}
    >
      <FluidCursor containerRef={previewRef} resolution={96} pressureIterations={14} zIndex={10}>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-3">
          <span className="whitespace-nowrap text-[clamp(1.7rem,11cqi,3.8rem)] font-black uppercase leading-none tracking-[-0.075em] text-zinc-950 dark:text-white">
            DAVINCIUI
          </span>
        </div>
      </FluidCursor>
    </div>
  );
}
