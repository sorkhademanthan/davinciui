"use client";

import { useRef } from "react";
import { ChromaticCursor } from "@workspace/ui/components/chromatic-cursor";

export function ChromaticCursorPreview() {
  const previewRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={previewRef} className="relative h-full min-h-[600px] overflow-hidden bg-black">
      <ChromaticCursor containerRef={previewRef} hideSystemCursor trailLength={64} splitDistance={4} fadeSpeed={0.1} size={8} tension={0.2} zIndex={10} />
    </div>
  );
}
