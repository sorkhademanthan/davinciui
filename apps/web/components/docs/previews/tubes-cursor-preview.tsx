"use client";

import { useRef } from "react";
import { TubesCursor } from "@workspace/ui/components/tubes-cursor";

export function TubesCursorPreview() {
  const previewRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={previewRef} className="relative h-full min-h-[600px] overflow-hidden bg-zinc-100 dark:bg-black">
      <TubesCursor containerRef={previewRef} quality="high" zIndex={10} idleMotion={false}>
        <div className="absolute inset-0 flex items-center justify-center px-8">
          <p className="pointer-events-none text-center text-[clamp(2.5rem,7vw,5.5rem)] font-black tracking-[-0.07em] text-zinc-950 dark:text-white">
            DAVINCIUI
          </p>
        </div>
      </TubesCursor>
    </div>
  );
}
