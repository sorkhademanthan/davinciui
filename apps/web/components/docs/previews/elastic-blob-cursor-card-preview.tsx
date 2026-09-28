"use client";

import { useRef } from "react";
import { ElasticBlobCursor } from "@workspace/ui/components/elastic-blob-cursor";
import { useAmbientCursorDrive } from "./use-ambient-cursor-drive";

/**
 * Self-playing card thumbnail. Manual pointer input is off
 * (`disableManualInput`) — the blob stretches along the ambient driver
 * while the visitor keeps their native cursor.
 */
export function ElasticBlobCursorCardPreview() {
  const previewRef = useRef<HTMLDivElement>(null);

  useAmbientCursorDrive(previewRef, { phase: 3.5, radiusX: 0.34, pauseOnRealInput: false });

  return (
    <div
      ref={previewRef}
      className="absolute inset-0 overflow-hidden bg-zinc-100 dark:bg-black"
      style={{ containerType: "inline-size" }}
    >
      <ElasticBlobCursor containerRef={previewRef} mode="container" size={34} zIndex={10} disableManualInput hideNativeCursor={false} />
      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-3 mix-blend-difference">
        <span className="whitespace-nowrap text-[clamp(1.7rem,11cqi,3.8rem)] font-black uppercase leading-none tracking-[-0.075em] text-white">
          DAVINCIUI
        </span>
      </div>
    </div>
  );
}
