"use client";

import * as React from "react";
import { SilkAurora } from "@workspace/ui/components/silk-aurora";
import { Noiser } from "@workspace/ui/components/noiser";
import { createComponentPlayground } from "@/components/docs/previews/generic-playground";

type StageProps = Record<string, unknown>;

function SilkAuroraStage(props: StageProps) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#060505]">
      <SilkAurora className="h-full w-full min-h-0" {...props} />
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-4 text-center">
        <span className="text-5xl font-black uppercase tracking-[-0.055em] text-white sm:text-6xl">
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
