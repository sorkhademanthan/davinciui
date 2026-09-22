"use client";

import { useRef } from "react";
import { ChromaticCursor } from "@workspace/ui/components/chromatic-cursor";

export function ChromaticCursorPreview() {
  const previewRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={previewRef} className="relative h-full min-h-[600px] overflow-hidden bg-zinc-100 dark:bg-black">
      <ChromaticCursor containerRef={previewRef} zIndex={10} />
      <p className="pointer-events-none absolute inset-0 flex items-center justify-center px-8 text-center text-[clamp(2.5rem,7vw,5.5rem)] font-black tracking-[-0.07em] text-zinc-950 dark:text-white">DAVINCIUI</p>
    </div>
  );
}
