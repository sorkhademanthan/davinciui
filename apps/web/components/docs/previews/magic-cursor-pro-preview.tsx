"use client";

import { useRef } from "react";
import { MagicCursorPro } from "@workspace/ui/components/magic-cursor-pro";

export function MagicCursorProPreview() {
  const previewRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={previewRef} className="relative h-full min-h-[600px] overflow-hidden bg-[radial-gradient(ellipse_at_54%_-8%,#fff1d7_0%,#ffadad_20%,#d968ff_38%,#471160_63%,#100315_100%)] dark:bg-[radial-gradient(ellipse_at_54%_-8%,#72514a_0%,#823c67_22%,#522065_45%,#1b0826_72%,#09020e_100%)]">
      <MagicCursorPro containerRef={previewRef} stiffness={400} damping={35} mass={1} mixBlendMode="normal" />
      <div className="pointer-events-none flex h-full min-h-[600px] flex-col items-center justify-center px-8 text-center text-white">
        <p className="text-[clamp(2.5rem,7vw,5.5rem)] font-black tracking-[-0.07em]">DAVINCIUI</p>
      </div>
    </div>
  );
}
