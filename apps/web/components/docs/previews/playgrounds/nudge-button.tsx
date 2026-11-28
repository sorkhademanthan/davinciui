"use client";

import * as React from "react";
import { NudgeButton } from "@workspace/ui/components/nudge-button";
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

// ─── Nudge Button ───────────────────────────────────────────────────────────

export const {
  Preview: NudgeButtonPlayground,
  PersonalizePanel: NudgeButtonPersonalizePanel,
} = createComponentPlayground({
  slug: "nudge-button",
  component: CenterStage as unknown as React.ComponentType<StageProps>,
  componentName: "NudgeButton",
  defaults: {
    outer: "#1F44E5",
    middle: "#E23A1D",
    inner: "#F5A301",
    reveal: "#FFFFFF",
    duration: 850,
  },
  fields: [
    { key: "outer", label: "Outer Layer", type: "color", section: "Palette" },
    { key: "middle", label: "Middle Layer", type: "color", section: "Palette" },
    { key: "inner", label: "Inner Layer", type: "color", section: "Palette" },
    { key: "reveal", label: "Reveal", type: "color", section: "Palette" },
    {
      key: "duration",
      label: "Interaction Length",
      type: "slider",
      min: 200,
      max: 2000,
      step: 10,
      unit: "ms",
      section: "Motion",
    },
  ],
  render: (config) => (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden px-6"
      style={{ containerType: "inline-size" }}
    >
      <NudgeButton
        colors={{
          outer: String(config.outer),
          middle: String(config.middle),
          inner: String(config.inner),
          reveal: String(config.reveal),
        }}
        duration={Number(config.duration)}
      >
        BUY NUDGE
      </NudgeButton>
    </div>
  ),
  code: (config) => `import { NudgeButton } from "@/components/ui/nudge-button"

<NudgeButton
  colors={{
    outer: "${config.outer}",
    middle: "${config.middle}",
    inner: "${config.inner}",
    reveal: "${config.reveal}",
  }}
  duration={${config.duration}}
>
  BUY NUDGE
</NudgeButton>`,
  intro: "Recolor the stacked layers and adjust the interaction timing.",
});
