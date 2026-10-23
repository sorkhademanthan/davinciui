"use client";

import { useRef } from "react";
import { FluidCursor } from "@workspace/ui/components/fluid-cursor";
import { useAmbientCursorDrive } from "./use-ambient-cursor-drive";

export function FluidCursorPreview() {
  const previewRef = useRef<HTMLDivElement>(null);

  // Self-playing: without this the canvas sits empty until the visitor
  // moves their mouse, which reads as "no preview".
  useAmbientCursorDrive(previewRef);

  return (
    <div
      ref={previewRef}
      className="relative h-full min-h-[600px] overflow-hidden bg-zinc-100 dark:bg-black"
    >
      <FluidCursor containerRef={previewRef} zIndex={10}>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-8">
          <p className="text-center text-[clamp(2.5rem,7vw,5.5rem)] font-black tracking-[-0.07em] text-zinc-950 dark:text-white">
            DAVINCIUI
          </p>
        </div>
      </FluidCursor>
    </div>
  );
}

export function FluidCursorExampleStage({
  intensity = 1,
  curl = 28,
  label = "Move your cursor",
}: {
  intensity?: number;
  curl?: number;
  label?: string;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={stageRef}
      className="relative flex h-[260px] w-full cursor-none items-center justify-center overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-950"
    >
      <FluidCursor
        containerRef={stageRef}
        intensity={intensity}
        curl={curl}
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
