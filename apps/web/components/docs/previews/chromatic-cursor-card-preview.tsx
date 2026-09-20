"use client";

import { useRef } from "react";
import { ChromaticCursor } from "@workspace/ui/components/chromatic-cursor";

export function ChromaticCursorCardPreview() {
  const previewRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={previewRef} className="absolute inset-0 overflow-hidden bg-black">
      <ChromaticCursor containerRef={previewRef} hideSystemCursor trailLength={36} splitDistance={3} fadeSpeed={0.24} size={5} tension={0.28} zIndex={10} />
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-lg font-black tracking-[-0.07em] text-white">DAVINCIUI</span>
    </div>
  );
}
