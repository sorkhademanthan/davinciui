"use client";

import * as React from "react";
import { ChromaticCursor } from "@workspace/ui/components/chromatic-cursor";
import { createComponentPlayground } from "@/components/docs/previews/generic-playground";

type StageProps = Record<string, unknown>;

function CursorLabel() {
  return (
    <p className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-8 text-center text-[clamp(2.5rem,7vw,5.5rem)] font-black tracking-[-0.07em] text-zinc-950 dark:text-white">
      DAVINCIUI
    </p>
  );
}

function ChromaticCursorStage(props: StageProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className="relative h-full min-h-[600px] overflow-hidden bg-zinc-100 dark:bg-black"
    >
      <ChromaticCursor containerRef={ref} zIndex={10} {...props} />
      <CursorLabel />
    </div>
  );
}

export const {
  Preview: ChromaticCursorPlayground,
  PersonalizePanel: ChromaticCursorPersonalizePanel,
} = createComponentPlayground({
  slug: "chromatic-cursor",
  component: ChromaticCursorStage as React.ComponentType<StageProps>,
  componentName: "ChromaticCursor",
  defaults: {
    trailLength: 64,
    splitDistance: 4,
    fadeSpeed: 0.55,
    size: 11,
    tension: 0.34,
    red: "#FF493D",
    green: "#F4FFB0",
    blue: "#00CCFF",
  },
  fields: [
    { key: "red", label: "Red Channel", type: "color", section: "Channels" },
    {
      key: "green",
      label: "Green Channel",
      type: "color",
      section: "Channels",
    },
    { key: "blue", label: "Blue Channel", type: "color", section: "Channels" },
    {
      key: "splitDistance",
      label: "RGB Split",
      type: "slider",
      min: 0,
      max: 24,
      step: 0.5,
      unit: "px",
      section: "Channels",
    },
    {
      key: "trailLength",
      label: "Trail Length",
      type: "slider",
      min: 4,
      max: 120,
      step: 1,
      section: "Motion",
    },
    {
      key: "fadeSpeed",
      label: "Fade Speed",
      type: "slider",
      min: 0.05,
      max: 1,
      step: 0.01,
      section: "Motion",
    },
    {
      key: "size",
      label: "Size",
      type: "slider",
      min: 2,
      max: 40,
      step: 1,
      unit: "px",
      section: "Motion",
    },
    {
      key: "tension",
      label: "Tension",
      type: "slider",
      min: 0.05,
      max: 1,
      step: 0.01,
      section: "Motion",
    },
  ],
  stageClassName: "min-h-[600px]",
  intro: "Mix the RGB channels, trail length, and follow tension.",
});
