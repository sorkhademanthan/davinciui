"use client";

import * as React from "react";
import { AnimatedPillButton } from "@workspace/ui/components/animated-pill-button";
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

// ─── Animated Pill Button ───────────────────────────────────────────────────

export const {
  Preview: AnimatedPillButtonPlayground,
  PersonalizePanel: AnimatedPillButtonPersonalizePanel,
} = createComponentPlayground({
  slug: "animated-pill-button",
  component: CenterStage as unknown as React.ComponentType<StageProps>,
  componentName: "AnimatedPillButton",
  defaults: {
    size: "md",
    backgroundColor: "#ffffff",
    activeColor: "#111111",
    textColor: "#111111",
    activeTextColor: "#ffffff",
  },
  fields: [
    {
      key: "size",
      label: "Size",
      type: "select",
      options: [
        { label: "Small", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
      ],
      section: "Layout",
    },
    {
      key: "backgroundColor",
      label: "Fill",
      type: "color",
      section: "Palette",
    },
    { key: "activeColor", label: "Active Fill", type: "color", section: "Palette" },
    { key: "textColor", label: "Text", type: "color", section: "Palette" },
    {
      key: "activeTextColor",
      label: "Active Text",
      type: "color",
      section: "Palette",
    },
  ],
  render: (config) => (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden px-6"
      style={{ containerType: "inline-size" }}
    >
      <AnimatedPillButton
        size={config.size as "sm" | "md" | "lg"}
        backgroundColor={String(config.backgroundColor)}
        activeColor={String(config.activeColor)}
        textColor={String(config.textColor)}
        activeTextColor={String(config.activeTextColor)}
      >
        Reserve Now
      </AnimatedPillButton>
    </div>
  ),
  code: (config) => `import { AnimatedPillButton } from "@/components/ui/animated-pill-button"

<AnimatedPillButton
  size="${config.size}"
  backgroundColor="${config.backgroundColor}"
  activeColor="${config.activeColor}"
  textColor="${config.textColor}"
  activeTextColor="${config.activeTextColor}"
>
  Reserve Now
</AnimatedPillButton>`,
  intro: "Set the pill's scale and its resting and active palette.",
});
