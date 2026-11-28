"use client";

import * as React from "react";
import { CircleCursor } from "@workspace/ui/components/circle-cursor";
import { createComponentPlayground } from "@/components/docs/previews/generic-playground";

type StageProps = Record<string, unknown>;

function CursorLabel() {
  return (
    <p className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-8 text-center text-[clamp(2.5rem,7vw,5.5rem)] font-black tracking-[-0.07em] text-zinc-950 dark:text-white">
      DAVINCIUI
    </p>
  );
}

function CircleCursorStage(props: StageProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className="relative h-full min-h-[600px] overflow-hidden bg-zinc-100 dark:bg-black"
    >
      <CircleCursor containerRef={ref} zIndex={10} {...props} />
      <CursorLabel />
    </div>
  );
}

export const {
  Preview: CircleCursorPlayground,
  PersonalizePanel: CircleCursorPersonalizePanel,
} = createComponentPlayground({
  slug: "circle-cursor",
  component: CircleCursorStage as React.ComponentType<StageProps>,
  componentName: "CircleCursor",
  defaults: {
    size: 46,
    color: "#FF3B0A",
    followSpeed: 0.16,
    hideNativeCursor: true,
  },
  fields: [
    {
      key: "size",
      label: "Size",
      type: "slider",
      min: 8,
      max: 140,
      step: 1,
      unit: "px",
      section: "Appearance",
    },
    { key: "color", label: "Color", type: "color", section: "Appearance" },
    {
      key: "followSpeed",
      label: "Follow Speed",
      type: "slider",
      min: 0.04,
      max: 0.4,
      step: 0.01,
      section: "Motion",
    },
    {
      key: "hideNativeCursor",
      label: "Hide Native Cursor",
      type: "switch",
      section: "Motion",
    },
  ],
  elementClassName: undefined,
  stageClassName: "min-h-[600px]",
  intro:
    "Tune the follower circle's scale, color, and tracking. Move across the stage to feel the inertia.",
});
