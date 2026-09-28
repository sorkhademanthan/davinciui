"use client";

import { useRef } from "react";
import { CircleCursor } from "@workspace/ui/components/circle-cursor";
import { useAmbientCursorDrive } from "./use-ambient-cursor-drive";

/**
 * Self-playing card thumbnail. Manual pointer input is off
 * (`disableManualInput`) — the follower dances along the ambient driver
 * while the visitor keeps their native cursor.
 */
export function CircleCursorCardPreview() {
  const previewRef = useRef<HTMLDivElement>(null);

  useAmbientCursorDrive(previewRef, { phase: 1.4, pauseOnRealInput: false });

  return <div ref={previewRef} className="absolute inset-0 overflow-hidden bg-zinc-100 dark:bg-black" style={{ containerType: "inline-size" }}><CircleCursor containerRef={previewRef} size={34} zIndex={10} disableManualInput hideNativeCursor={false} /><div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-3"><span className="whitespace-nowrap text-[clamp(1.7rem,11cqi,3.8rem)] font-black uppercase leading-none tracking-[-0.075em] text-zinc-950 dark:text-white">DAVINCIUI</span></div></div>;
}
