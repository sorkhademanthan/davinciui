"use client";

import { useRef } from "react";
import { ElectricVijdiCursor } from "@workspace/ui/components/electric-vijdi-cursor";

export function ElectricVijdiCursorPreview() {
  const previewRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={previewRef} className="relative flex h-full min-h-[600px] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,#e4d5ff_0%,#f9f6ff_48%,#ece7f6_100%)] dark:bg-[radial-gradient(circle_at_center,#24133d_0%,#0b0811_45%,#050507_100%)]">
      <ElectricVijdiCursor containerRef={previewRef} quality="high" zIndex={10} />
      <p className="pointer-events-none relative px-8 text-center text-[clamp(2.5rem,7vw,5.5rem)] font-black tracking-[-0.07em] text-zinc-950 dark:text-white">DAVINCIUI</p>
    </div>
  );
}
