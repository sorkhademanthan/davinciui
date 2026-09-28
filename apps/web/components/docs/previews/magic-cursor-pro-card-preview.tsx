"use client";

import { useRef } from "react";
import { MagicCursorPro } from "@workspace/ui/components/magic-cursor-pro";
import { useAmbientCursorDrive } from "./use-ambient-cursor-drive";

/**
 * Self-playing card thumbnail. Manual pointer input is off
 * (`disableManualInput`) — the spring cursor glides along the ambient driver
 * while the visitor keeps their native cursor.
 */
export function MagicCursorProCardPreview() {
  const previewRef = useRef<HTMLDivElement>(null);

  useAmbientCursorDrive(previewRef, { phase: 2.8, pauseOnRealInput: false });

  return <div ref={previewRef} className="absolute inset-0 overflow-hidden bg-zinc-100 dark:bg-black" style={{ containerType: "inline-size" }}><MagicCursorPro containerRef={previewRef} iconSize={42} stiffness={400} damping={35} mass={1} zIndex={10} disableManualInput hideSystemCursor={false} /><div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-3"><span className="whitespace-nowrap text-[clamp(1.7rem,11cqi,3.8rem)] font-black uppercase leading-none tracking-[-0.075em] text-zinc-950 dark:text-white">DAVINCIUI</span></div></div>;
}
