"use client";

import { useRef } from "react";
import { ElectricVijdiCursor } from "@workspace/ui/components/electric-vijdi-cursor";

export function ElectricVijdiCursorPreview() {
  const previewRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={previewRef}
      className="relative flex h-full min-h-[600px] items-center justify-center overflow-hidden bg-zinc-100 dark:bg-[radial-gradient(circle_at_center,#24133d_0%,#0b0811_45%,#050507_100%)]"
    >
      <ElectricVijdiCursor
        containerRef={previewRef}
        quality="high"
        zIndex={10}
      />
      <p className="pointer-events-none relative px-8 text-center text-[clamp(2.5rem,7vw,5.5rem)] font-black tracking-[-0.07em] text-zinc-950 dark:text-white">
        DAVINCIUI
      </p>
    </div>
  );
}

export function ElectricVijdiCursorExampleStage({
  color = "#8b5cf6",
  intensity = 1,
  label = "Move your cursor",
}: {
  color?: string;
  intensity?: number;
  label?: string;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={stageRef}
      className="relative flex h-[260px] w-full cursor-none items-center justify-center overflow-hidden rounded-xl bg-zinc-950"
    >
      <ElectricVijdiCursor
        containerRef={stageRef}
        color={color}
        intensity={intensity}
        zIndex={10}
      />
      <div className="pointer-events-none relative z-20 text-center">
        <p className="text-3xl font-semibold tracking-[-0.04em] text-white">
          DAVINCIUI
        </p>
        <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-white/50">
          {label}
        </p>
      </div>
    </div>
  );
}
