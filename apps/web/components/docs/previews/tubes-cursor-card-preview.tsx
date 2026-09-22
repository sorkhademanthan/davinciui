"use client";

import { useRef } from "react";
import { TubesCursor } from "@workspace/ui/components/tubes-cursor";

/**
 * The renderer stays warm with a small ambient motion. Its visual layer is
 * revealed on hover, where direct pointer movement takes over as usual.
 */
export function TubesCursorCardPreview() {
  const previewRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={previewRef}
      className="group/tubes-preview absolute inset-0 overflow-hidden bg-zinc-100 dark:bg-black"
      style={{ containerType: "inline-size" }}
    >
      <TubesCursor
        containerRef={previewRef}
        quality="low"
        zIndex={10}
        idleMotion
        className="opacity-0 transition-opacity duration-150 group-hover/tubes-preview:opacity-100"
      />
      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-3">
        <span className="whitespace-nowrap text-[clamp(1.7rem,11cqi,3.8rem)] font-black uppercase leading-none tracking-[-0.075em] text-zinc-950 dark:text-white">
          DAVINCIUI
        </span>
      </div>
    </div>
  );
}
