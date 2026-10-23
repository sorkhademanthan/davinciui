"use client";

import { useRef } from "react";
import { TubesCursor } from "@workspace/ui/components/tubes-cursor";

export function TubesCursorPreview() {
  const previewRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={previewRef}
      className="relative h-full min-h-[600px] overflow-hidden bg-zinc-100 dark:bg-black"
    >
      <TubesCursor
        containerRef={previewRef}
        quality="high"
        zIndex={10}
        idleMotion={false}
      >
        <div className="absolute inset-0 flex items-center justify-center px-8">
          <p className="pointer-events-none text-center text-[clamp(2.5rem,7vw,5.5rem)] font-black tracking-[-0.07em] text-zinc-950 dark:text-white">
            DAVINCIUI
          </p>
        </div>
      </TubesCursor>
    </div>
  );
}

export function TubesCursorExampleStage({
  tubeColors = ["#7c3aed", "#22d3ee", "#f472b6"],
  lightColors = ["#8b5cf6", "#06b6d4", "#ec4899", "#f59e0b"],
  label = "Move your cursor",
}: {
  tubeColors?: string[];
  lightColors?: string[];
  label?: string;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={stageRef}
      className="relative h-[260px] w-full cursor-none overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-950"
    >
      <TubesCursor
        containerRef={stageRef}
        tubeColors={tubeColors}
        lightColors={lightColors}
        quality="medium"
        zIndex={10}
        idleMotion
      />
      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center text-center">
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
