"use client";

import { useRef } from "react";
import { TubesCursor } from "@workspace/ui/components/tubes-cursor";
import { useAmbientCursorDrive } from "./use-ambient-cursor-drive";

/**
 * Self-playing card thumbnail. The ambient driver steers a virtual pointer
 * so the neon bundle chases continuously with no hover required, while the
 * renderer's own idle motion keeps the scene warm underneath.
 */
export function TubesCursorCardPreview() {
  const previewRef = useRef<HTMLDivElement>(null);

  useAmbientCursorDrive(previewRef, { phase: 4.9, speed: 0.9 });

  return (
    <div
      ref={previewRef}
      className="absolute inset-0 overflow-hidden bg-zinc-100 dark:bg-black"
      style={{ containerType: "inline-size" }}
    >
      <TubesCursor
        containerRef={previewRef}
        quality="low"
        zIndex={10}
        idleMotion
      />
      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-3">
        <span className="whitespace-nowrap text-[clamp(1.7rem,11cqi,3.8rem)] font-black uppercase leading-none tracking-[-0.075em] text-zinc-950 dark:text-white">
          DAVINCIUI
        </span>
      </div>
    </div>
  );
}
