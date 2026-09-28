"use client";

import { useRef } from "react";
import { ChromaticCursor } from "@workspace/ui/components/chromatic-cursor";
import { useAmbientCursorDrive } from "./use-ambient-cursor-drive";

/**
 * Self-playing card thumbnail. The ambient driver steers a virtual pointer
 * so the RGB trails paint continuously with no hover required.
 */
export function ChromaticCursorCardPreview() {
  const previewRef = useRef<HTMLDivElement>(null);

  useAmbientCursorDrive(previewRef, { phase: 0.7 });

  return (
    <div
      ref={previewRef}
      className="absolute inset-0 overflow-hidden bg-zinc-100 dark:bg-black"
      style={{ containerType: "inline-size" }}
    >
      <ChromaticCursor containerRef={previewRef} size={8} zIndex={10} />
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-3">
        <span
          className="whitespace-nowrap text-[clamp(1.7rem,11cqi,3.8rem)] font-black uppercase leading-none tracking-[-0.075em] text-zinc-950 dark:text-white"
        >
          DAVINCIUI
        </span>
      </div>
    </div>
  );
}
