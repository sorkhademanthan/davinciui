"use client";

import { useRef } from "react";
import { CircleCursor } from "@workspace/ui/components/circle-cursor";

export function CircleCursorPreview() {
  const previewRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={previewRef}
      className="relative h-full min-h-[600px] overflow-hidden bg-zinc-100 dark:bg-black"
    >
      <CircleCursor containerRef={previewRef} zIndex={10} />
      <p className="pointer-events-none absolute inset-0 flex items-center justify-center px-8 text-center text-[clamp(2.5rem,7vw,5.5rem)] font-black tracking-[-0.07em] text-zinc-950 dark:text-white">
        DAVINCIUI
      </p>
    </div>
  );
}

export function CircleCursorExampleStage({
  size = 48,
  color = "#f97316",
  label = "Move your cursor",
}: {
  size?: number;
  color?: string;
  label?: string;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={stageRef}
      className="relative flex h-[260px] w-full cursor-none items-center justify-center overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-950"
    >
      <CircleCursor
        containerRef={stageRef}
        size={size}
        color={color}
        zIndex={10}
      />
      <div className="pointer-events-none relative z-20 text-center">
        <p className="text-3xl font-semibold tracking-[-0.04em] text-zinc-950 dark:text-white">
          DAVINCIUI
        </p>
        <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
          {label}
        </p>
      </div>
    </div>
  );
}
