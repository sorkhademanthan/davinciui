"use client";

import * as React from "react";
import { TubesCursor } from "@workspace/ui/components/tubes-cursor";
import { createComponentPlayground } from "@/components/docs/previews/generic-playground";

type StageProps = Record<string, unknown>;

function CursorLabel() {
  return (
    <p className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-8 text-center text-[clamp(2.5rem,7vw,5.5rem)] font-black tracking-[-0.07em] text-zinc-950 dark:text-white">
      DAVINCIUI
    </p>
  );
}

// ─── Tubes Cursor ───────────────────────────────────────────────────────────

function TubesCursorStage(props: StageProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className="relative h-full min-h-[600px] cursor-none overflow-hidden bg-zinc-100 dark:bg-black"
    >
      <TubesCursor
        key={JSON.stringify(props)}
        containerRef={ref}
        zIndex={10}
        {...props}
      />
      <CursorLabel />
    </div>
  );
}

export const {
  Preview: TubesCursorPlayground,
  PersonalizePanel: TubesCursorPersonalizePanel,
} = createComponentPlayground({
  slug: "tubes-cursor",
  component: TubesCursorStage as React.ComponentType<StageProps>,
  componentName: "TubesCursor",
  defaults: {
    lightIntensity: 200,
    theme: "auto",
    tubeCount: 16,
    bloomThreshold: 0,
    bloomStrength: 1.5,
    bloomRadius: 0.5,
    randomizeOnClick: true,
    idleMotion: true,
    quality: "high",
  },
  fields: [
    {
      key: "lightIntensity",
      label: "Light Intensity",
      type: "slider",
      min: 0,
      max: 8,
      step: 0.1,
      section: "Lighting",
    },
    {
      key: "bloomStrength",
      label: "Bloom Strength",
      type: "slider",
      min: 0,
      max: 6,
      step: 0.1,
      section: "Lighting",
    },
    {
      key: "bloomRadius",
      label: "Bloom Radius",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      section: "Lighting",
    },
    {
      key: "bloomThreshold",
      label: "Bloom Threshold",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      section: "Lighting",
    },
    {
      key: "tubeCount",
      label: "Tube Count",
      type: "slider",
      min: 4,
      max: 64,
      step: 1,
      section: "Geometry",
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
    {
      key: "theme",
      label: "Theme",
      type: "select",
      options: [
        { label: "Auto", value: "auto" },
        { label: "Dark", value: "dark" },
        { label: "Light", value: "light" },
      ],
      section: "Appearance",
    },
    {
      key: "idleMotion",
      label: "Idle Motion",
      type: "switch",
      section: "Motion",
    },
    {
      key: "randomizeOnClick",
      label: "Randomize On Click",
      type: "switch",
      section: "Interaction",
    },
  ],
  stageClassName: "min-h-[600px]",
  intro:
    "Move through the light tubes and click to randomize the palette. Tune bloom and density.",
});
