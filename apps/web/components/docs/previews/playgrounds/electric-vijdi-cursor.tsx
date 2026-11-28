"use client";

import * as React from "react";
import { ElectricVijdiCursor } from "@workspace/ui/components/electric-vijdi-cursor";
import { createComponentPlayground } from "@/components/docs/previews/generic-playground";

type StageProps = Record<string, unknown>;

function CursorLabel() {
  return (
    <p className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-8 text-center text-[clamp(2.5rem,7vw,5.5rem)] font-black tracking-[-0.07em] text-zinc-950 dark:text-white">
      DAVINCIUI
    </p>
  );
}

function ElectricVijdiStage(props: StageProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className="relative flex h-full min-h-[600px] items-center justify-center overflow-hidden bg-zinc-100 dark:bg-[radial-gradient(circle_at_center,#24133d_0%,#0b0811_45%,#050507_100%)]"
    >
      <ElectricVijdiCursor containerRef={ref} zIndex={10} {...props} />
      <CursorLabel />
    </div>
  );
}

export const {
  Preview: ElectricVijdiCursorPlayground,
  PersonalizePanel: ElectricVijdiCursorPersonalizePanel,
} = createComponentPlayground({
  slug: "electric-vijdi-cursor",
  component: ElectricVijdiStage as React.ComponentType<StageProps>,
  componentName: "ElectricVijdiCursor",
  defaults: {
    color: "#A855F7",
    intensity: 1,
    boltWidth: 1.2,
    glowSize: 1,
    trailLifetime: 240,
    jitter: 9,
    branchIntensity: 1,
    sparkIntensity: 1,
    speedResponse: 1,
    quality: "high",
  },
  fields: [
    { key: "color", label: "Bolt Color", type: "color", section: "Look" },
    {
      key: "intensity",
      label: "Intensity",
      type: "slider",
      min: 0.1,
      max: 3,
      step: 0.1,
      section: "Look",
    },
    {
      key: "boltWidth",
      label: "Bolt Width",
      type: "slider",
      min: 0.2,
      max: 6,
      step: 0.1,
      section: "Look",
    },
    {
      key: "glowSize",
      label: "Glow Size",
      type: "slider",
      min: 0,
      max: 4,
      step: 0.1,
      section: "Look",
    },
    {
      key: "trailLifetime",
      label: "Trail Lifetime",
      type: "slider",
      min: 40,
      max: 900,
      step: 10,
      unit: "ms",
      section: "Motion",
    },
    {
      key: "jitter",
      label: "Jitter",
      type: "slider",
      min: 0,
      max: 30,
      step: 1,
      section: "Motion",
    },
    {
      key: "branchIntensity",
      label: "Branching",
      type: "slider",
      min: 0,
      max: 3,
      step: 0.1,
      section: "Motion",
    },
    {
      key: "sparkIntensity",
      label: "Sparks",
      type: "slider",
      min: 0,
      max: 3,
      step: 0.1,
      section: "Motion",
    },
    {
      key: "quality",
      label: "Quality",
      type: "select",
      options: [
        { label: "Low", value: "low" },
        { label: "Medium", value: "medium" },
        { label: "High", value: "high" },
      ],
      section: "Performance",
    },
  ],
  stageClassName: "min-h-[600px]",
  intro: "Control the lightning bolt's color, bloom, branching, and lifetime.",
});
