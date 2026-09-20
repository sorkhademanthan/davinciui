"use client";

import { useRef } from "react";
import { ElectricVijdiCursor } from "@workspace/ui/components/electric-vijdi-cursor";

export function ElectricVijdiCursorCardPreview() {
  const previewRef = useRef<HTMLDivElement>(null);

  return <div ref={previewRef} className="absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_72%_42%,#dcc4ff_0%,#f8f5ff_52%,#ece6f7_100%)] dark:bg-[radial-gradient(circle_at_72%_42%,#35205a_0%,#100b1c_42%,#060609_100%)]"><ElectricVijdiCursor containerRef={previewRef} quality="low" boltWidth={1} glowSize={0.7} trailLifetime={180} zIndex={10} /><span className="pointer-events-none absolute inset-0 flex items-center justify-center text-lg font-black tracking-[-0.07em] text-zinc-950 dark:text-white">DAVINCIUI</span></div>;
}
