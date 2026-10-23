"use client";

import { useRef } from "react";
import { MagicCursorPro } from "@workspace/ui/components/magic-cursor-pro";

export function MagicCursorProPreview() {
  const previewRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={previewRef}
      className="relative h-full min-h-[600px] overflow-hidden bg-zinc-100 dark:bg-black"
    >
      <MagicCursorPro
        containerRef={previewRef}
        stiffness={400}
        damping={35}
        mass={1}
        mixBlendMode="normal"
      />
      <div className="pointer-events-none flex h-full min-h-[600px] flex-col items-center justify-center px-8 text-center">
        <p className="text-[clamp(2.5rem,7vw,5.5rem)] font-black tracking-[-0.07em] text-zinc-950 dark:text-white">
          DAVINCIUI
        </p>
      </div>
    </div>
  );
}

export function MagicCursorProExampleStage({
  mixBlendMode = "normal",
  stiffness = 400,
  label = "Move your cursor",
}: {
  mixBlendMode?: React.CSSProperties["mixBlendMode"];
  stiffness?: number;
  label?: string;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={stageRef}
      className="relative flex h-[260px] w-full cursor-none items-center justify-center overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-950"
    >
      <MagicCursorPro
        containerRef={stageRef}
        stiffness={stiffness}
        damping={35}
        mass={1}
        mixBlendMode={mixBlendMode}
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
