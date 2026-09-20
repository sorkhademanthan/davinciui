"use client";

import { useRef } from "react";
import { MagicCursorPro } from "@workspace/ui/components/magic-cursor-pro";

export function MagicCursorProCardPreview() {
  const previewRef = useRef<HTMLDivElement>(null);

  return <div ref={previewRef} className="absolute inset-0 overflow-hidden bg-[radial-gradient(ellipse_at_55%_-25%,#fff2d8_0%,#ffabb0_25%,#d96cff_48%,#45125b_70%,#100315_100%)] dark:bg-[radial-gradient(ellipse_at_55%_-25%,#6c514b_0%,#743d68_28%,#48205d_56%,#15061e_100%)]"><MagicCursorPro containerRef={previewRef} iconSize={26} stiffness={400} damping={35} mass={1} zIndex={10} /><span className="pointer-events-none absolute inset-0 flex items-center justify-center text-lg font-black tracking-[-0.07em] text-white">DAVINCIUI</span></div>;
}
