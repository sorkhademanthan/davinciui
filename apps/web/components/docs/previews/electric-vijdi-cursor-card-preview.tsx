"use client";

import { useRef } from "react";
import { ElectricVijdiCursor } from "@workspace/ui/components/electric-vijdi-cursor";

export function ElectricVijdiCursorCardPreview() {
  const previewRef = useRef<HTMLDivElement>(null);

  return <div ref={previewRef} className="absolute inset-0 overflow-hidden bg-zinc-100 dark:bg-[radial-gradient(circle_at_72%_42%,#35205a_0%,#100b1c_42%,#060609_100%)]" style={{ containerType: "inline-size" }}><ElectricVijdiCursor containerRef={previewRef} quality="low" boltWidth={1} glowSize={0.7} trailLifetime={180} zIndex={10} /><div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-3"><span className="whitespace-nowrap text-[clamp(1.7rem,11cqi,3.8rem)] font-black uppercase leading-none tracking-[-0.075em] text-zinc-950 dark:text-white" style={{ textShadow: "0 3px 14px rgba(0, 0, 0, 0.18)" }}>DAVINCIUI</span></div></div>;
}
