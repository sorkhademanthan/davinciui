"use client";

import * as React from "react";
import { GlassSceneDock } from "@workspace/ui/components/glass-scene-dock";
import { createComponentPlayground } from "@/components/docs/previews/generic-playground";

type StageProps = Record<string, unknown>;

// ─── Glass Scene Dock ───────────────────────────────────────────────────────

export const {
  Preview: GlassSceneDockPlayground,
  PersonalizePanel: GlassSceneDockPersonalizePanel,
} = createComponentPlayground({
  slug: "glass-scene-dock",
  component: GlassSceneDock as unknown as React.ComponentType<StageProps>,
  componentName: "GlassSceneDock",
  defaults: {
    defaultIndex: 0,
    mode: "preview",
    enableScroll: true,
    enableHover: true,
    transitionDuration: 650,
  },
  fields: [
    {
      key: "mode",
      label: "Mode",
      type: "select",
      options: [
        { label: "Card", value: "card" },
        { label: "Preview", value: "preview" },
        { label: "Fullscreen", value: "fullscreen" },
      ],
      section: "Layout",
    },
    {
      key: "defaultIndex",
      label: "Default Scene",
      type: "slider",
      min: 0,
      max: 5,
      step: 1,
      section: "Layout",
    },
    {
      key: "transitionDuration",
      label: "Transition",
      type: "slider",
      min: 100,
      max: 1600,
      step: 20,
      unit: "ms",
      section: "Motion",
    },
    {
      key: "enableScroll",
      label: "Scroll Control",
      type: "switch",
      section: "Interaction",
    },
    {
      key: "enableHover",
      label: "Hover Control",
      type: "switch",
      section: "Interaction",
    },
  ],
  elementClassName: "h-full w-full",
  intro: "Tune how the glass scene dock advances and transitions.",
});
