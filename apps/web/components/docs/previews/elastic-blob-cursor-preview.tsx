"use client";

import { useRef } from "react";
import { ElasticBlobCursor } from "@workspace/ui/components/elastic-blob-cursor";

export function ElasticBlobCursorPreview() {
  const previewRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={previewRef}
      data-slot="elastic-blob-preview"
      className="relative h-full min-h-[600px] cursor-none overflow-hidden bg-zinc-100 dark:bg-black"
    >
      <ElasticBlobCursor containerRef={previewRef} mode="container" zIndex={10} />
      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-8 mix-blend-difference">
        <p className="text-center text-[clamp(2.5rem,7vw,5.5rem)] font-black tracking-[-0.07em] text-white">
          DAVINCIUI
        </p>
      </div>
      <p className="pointer-events-none absolute inset-x-0 bottom-6 text-center text-sm text-zinc-500 dark:text-white/40">
        Move across the stage — the blob stretches along your direction of travel
      </p>
    </div>
  );
}
