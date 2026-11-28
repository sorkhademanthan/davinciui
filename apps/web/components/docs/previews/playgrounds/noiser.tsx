"use client";

import * as React from "react";
import { Noiser } from "@workspace/ui/components/noiser";
import { createComponentPlayground } from "@/components/docs/previews/generic-playground";

type StageProps = Record<string, unknown>;

function NoiserStage(props: StageProps) {
  return (
    <div
      className="relative h-full min-h-[360px] overflow-hidden bg-[radial-gradient(ellipse_at_25%_20%,#603c9a_0%,transparent_48%),linear-gradient(135deg,#11101c_0%,#29244a_55%,#10131f_100%)]"
      style={{ containerType: "inline-size" }}
    >
      <Noiser {...props} />
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-4">
        <span
          className="whitespace-nowrap text-[clamp(2rem,11cqi,7rem)] font-black uppercase leading-none tracking-[-0.075em] text-white"
          style={{
            WebkitTextStroke: "0.8px rgba(17, 16, 28, 0.55)",
            textShadow: "0 4px 18px rgba(0, 0, 0, 0.42)",
          }}
        >
          DAVINCIUI
        </span>
      </div>
    </div>
  );
}

export const {
  Preview: NoiserPlayground,
  PersonalizePanel: NoiserPersonalizePanel,
} = createComponentPlayground({
  slug: "noiser",
  component: NoiserStage as React.ComponentType<StageProps>,
  componentName: "Noiser",
  defaults: {
    noiseType: "gaussian",
    frequency: 0.32,
    octaves: 2,
    seed: 8,
    colorMode: "duo",
    colorA: "#f5efff",
    colorB: "#a38bff",
    colorC: "#22d3ee",
    noiseOpacity: 0.72,
    colorOpacity: 0.78,
    animated: true,
    fps: 12,
  },
  fields: [
    {
      key: "noiseType",
      label: "Noise Type",
      type: "select",
      options: [
        { label: "Gaussian", value: "gaussian" },
        { label: "Uniform", value: "uniform" },
      ],
      section: "Noise",
    },
    {
      key: "frequency",
      label: "Frequency",
      type: "slider",
      min: 0.02,
      max: 1.2,
      step: 0.01,
      section: "Noise",
    },
    {
      key: "octaves",
      label: "Octaves",
      type: "slider",
      min: 1,
      max: 6,
      step: 1,
      section: "Noise",
    },
    {
      key: "seed",
      label: "Seed",
      type: "slider",
      min: 0,
      max: 100,
      step: 1,
      section: "Noise",
    },
    {
      key: "colorMode",
      label: "Color Mode",
      type: "select",
      options: [
        { label: "Mono", value: "mono" },
        { label: "Duo", value: "duo" },
        { label: "Multi", value: "multi" },
      ],
      section: "Color",
    },
    { key: "colorA", label: "Color A", type: "color", section: "Color" },
    { key: "colorB", label: "Color B", type: "color", section: "Color" },
    { key: "colorC", label: "Color C", type: "color", section: "Color" },
    {
      key: "noiseOpacity",
      label: "Noise Opacity",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      section: "Finish",
    },
    {
      key: "colorOpacity",
      label: "Color Opacity",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      section: "Finish",
    },
    {
      key: "animated",
      label: "Animated",
      type: "switch",
      section: "Finish",
    },
    {
      key: "fps",
      label: "FPS",
      type: "slider",
      min: 1,
      max: 30,
      step: 1,
      section: "Finish",
    },
  ],
  stageClassName: "min-h-[360px]",
  intro:
    "Sculpt procedural grain: noise type, palette, and animation rate.",
});
