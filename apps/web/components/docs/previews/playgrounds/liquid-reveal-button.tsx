"use client";

import * as React from "react";
import { LiquidRevealButton } from "@workspace/ui/components/liquid-reveal-button";
import { createComponentPlayground } from "@/components/docs/previews/generic-playground";

type StageProps = Record<string, unknown>;

// ─── Liquid Reveal Button ───────────────────────────────────────────────────

function CenterStage(props: StageProps) {
  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden px-6"
      style={{ containerType: "inline-size" }}
    >
      {props.children as React.ReactNode}
    </div>
  );
}

export const {
  Preview: LiquidRevealButtonPlayground,
  PersonalizePanel: LiquidRevealButtonPersonalizePanel,
} = createComponentPlayground({
  slug: "liquid-reveal-button",
  component: CenterStage as unknown as React.ComponentType<StageProps>,
  componentName: "LiquidRevealButton",
  defaults: {
    mode: "preview",
    backgroundColor: "#E5FF46",
    hoverColor: "#111111",
    textColor: "#141414",
    hoverTextColor: "#FFFFFF",
    borderColor: "#141414",
    showDemoCursor: true,
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
      key: "backgroundColor",
      label: "Base Fill",
      type: "color",
      section: "Palette",
    },
    { key: "hoverColor", label: "Hover Fill", type: "color", section: "Palette" },
    { key: "textColor", label: "Text", type: "color", section: "Palette" },
    {
      key: "hoverTextColor",
      label: "Hover Text",
      type: "color",
      section: "Palette",
    },
    {
      key: "borderColor",
      label: "Border",
      type: "color",
      section: "Palette",
    },
    {
      key: "showDemoCursor",
      label: "Demo Cursor",
      type: "switch",
      section: "Interaction",
    },
  ],
  render: (config) => (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden px-6"
      style={{ containerType: "inline-size" }}
    >
      <LiquidRevealButton
        mode={config.mode as "card" | "preview" | "fullscreen"}
        backgroundColor={String(config.backgroundColor)}
        hoverColor={String(config.hoverColor)}
        textColor={String(config.textColor)}
        hoverTextColor={String(config.hoverTextColor)}
        borderColor={String(config.borderColor)}
        showDemoCursor={Boolean(config.showDemoCursor)}
      >
        View all projects
      </LiquidRevealButton>
    </div>
  ),
  code: (config) => `import { LiquidRevealButton } from "@/components/ui/liquid-reveal-button"

<LiquidRevealButton
  mode="${config.mode}"
  backgroundColor="${config.backgroundColor}"
  hoverColor="${config.hoverColor}"
  textColor="${config.textColor}"
  hoverTextColor="${config.hoverTextColor}"
  borderColor="${config.borderColor}"
  showDemoCursor={${config.showDemoCursor}}
>
  View all projects
</LiquidRevealButton>`,
  intro: "Restyle the liquid fill, hover state, and demo cursor.",
});
