"use client";

import * as React from "react";
import { SilkAurora } from "@workspace/ui/components/silk-aurora";
import { createComponentPlayground } from "@/components/docs/previews/generic-playground";

type StageProps = Record<string, unknown>;

function SilkAuroraStage(props: StageProps) {
  return (
    <div
      className="relative h-full w-full overflow-hidden bg-[#060505]"
      style={{ containerType: "inline-size" }}
    >
      <SilkAurora className="h-full w-full min-h-0" {...props} />
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-4 text-center">
          <span className="whitespace-nowrap text-[clamp(2.6rem,9cqi,9.5rem)] font-black uppercase leading-none tracking-[-0.055em] text-white">
          DAVINCIUI
        </span>
      </div>
    </div>
  );
}

export const {
  Preview: SilkAuroraPlayground,
  PersonalizePanel: SilkAuroraPersonalizePanel,
} = createComponentPlayground({
  slug: "silk-aurora",
  component: SilkAuroraStage as React.ComponentType<StageProps>,
  componentName: "SilkAurora",
  defaults: {
    preset: "default",
    baseColor: "#060505",
    midColor: "#19130f",
    sheenColor: "#ffe2a9",
    accentColor: "#c58d5d",
    speed: 0.75,
    intensity: 0.9,
    grain: 0.85,
    vignette: 1,
    mouseInfluence: 1,
    interactive: true,
  },
  presets: [
    { name: "Default", config: { baseColor: "#060505", midColor: "#19130f", sheenColor: "#ffe2a9", accentColor: "#c58d5d", speed: 0.75, intensity: 0.9, grain: 0.85, vignette: 1, mouseInfluence: 1, interactive: true } },
    { name: "Midnight", config: { baseColor: "#02030a", midColor: "#0a0f1f", sheenColor: "#9fb4ff", accentColor: "#5b8cff", speed: 0.75, intensity: 0.9, grain: 0.85, vignette: 1, mouseInfluence: 1, interactive: true } },
    { name: "Aurora", config: { baseColor: "#061018", midColor: "#0f2a2a", sheenColor: "#b8f2e6", accentColor: "#6ee7b7", speed: 0.75, intensity: 0.9, grain: 0.85, vignette: 1, mouseInfluence: 1, interactive: true } },
    { name: "Sunset", config: { baseColor: "#1a0b0b", midColor: "#3a1a1a", sheenColor: "#ffd6a5", accentColor: "#ff8fab", speed: 0.75, intensity: 0.9, grain: 0.85, vignette: 1, mouseInfluence: 1, interactive: true } },
    { name: "Mono", config: { baseColor: "#0a0a0a", midColor: "#1f1f1f", sheenColor: "#e5e5e5", accentColor: "#a3a3a3", speed: 0.75, intensity: 0.9, grain: 0.85, vignette: 1, mouseInfluence: 1, interactive: true } },
  ],
  fields: [
    { key: "baseColor", label: "Base", type: "color", section: "Palette" },
    { key: "midColor", label: "Mid Tone", type: "color", section: "Palette" },
    { key: "sheenColor", label: "Sheen", type: "color", section: "Palette" },
    { key: "accentColor", label: "Accent", type: "color", section: "Palette" },
    {
      key: "speed",
      label: "Speed",
      type: "slider",
      min: 0,
      max: 3,
      step: 0.05,
      section: "Motion",
    },
    {
      key: "intensity",
      label: "Intensity",
      type: "slider",
      min: 0,
      max: 3,
      step: 0.05,
      section: "Motion",
    },
    {
      key: "grain",
      label: "Grain",
      type: "slider",
      min: 0,
      max: 2,
      step: 0.01,
      section: "Finish",
    },
    {
      key: "vignette",
      label: "Vignette",
      type: "slider",
      min: 0,
      max: 2,
      step: 0.01,
      section: "Finish",
    },
    {
      key: "mouseInfluence",
      label: "Cursor Influence",
      type: "slider",
      min: 0,
      max: 3,
      step: 0.05,
      section: "Finish",
    },
    {
      key: "interactive",
      label: "Interactive",
      type: "switch",
      section: "Finish",
    },
  ],
  elementClassName: undefined,
  stageClassName: "min-h-[420px] bg-[#060505]",
  codeExtras: '  className="h-full w-full"',
  intro:
    "Blend the aurora palette, motion, and finish. Personalization updates both the preview and usage snippet.",
});
