"use client";

import * as React from "react";
import { AnimatedMetric } from "@workspace/ui/components/animated-metric";
import { createComponentPlayground } from "@/components/docs/previews/generic-playground";

type StageProps = Record<string, unknown>;

// ─── Animated Metric ────────────────────────────────────────────────────────

export const {
  Preview: AnimatedMetricPlayground,
  PersonalizePanel: AnimatedMetricPersonalizePanel,
} = createComponentPlayground({
  slug: "animated-metric",
  component: AnimatedMetric as unknown as React.ComponentType<StageProps>,
  componentName: "AnimatedMetric",
  defaults: {
    value: 50,
    suffix: "k+",
    prefix: "",
    label: "",
    duration: 1500,
    decimals: 0,
    once: true,
    loop: true,
    loopDelay: 1500,
    threshold: 0.25,
  },
  fields: [
    {
      key: "value",
      label: "Value",
      type: "slider",
      min: 0,
      max: 100000,
      step: 1,
      section: "Content",
    },
    { key: "prefix", label: "Prefix", type: "text", section: "Content" },
    { key: "suffix", label: "Suffix", type: "text", section: "Content" },
    { key: "label", label: "Label", type: "text", section: "Content" },
    {
      key: "duration",
      label: "Count Duration",
      type: "slider",
      min: 200,
      max: 6000,
      step: 50,
      unit: "ms",
      section: "Motion",
    },
    {
      key: "decimals",
      label: "Decimals",
      type: "slider",
      min: 0,
      max: 4,
      step: 1,
      section: "Content",
    },
    {
      key: "loopDelay",
      label: "Loop Delay",
      type: "slider",
      min: 0,
      max: 6000,
      step: 50,
      unit: "ms",
      section: "Motion",
    },
    { key: "loop", label: "Loop", type: "switch", section: "Motion" },
    { key: "once", label: "Animate Once", type: "switch", section: "Motion" },
    {
      key: "threshold",
      label: "Trigger Threshold",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      section: "Motion",
    },
  ],
  render: (config) => (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden px-6"
      style={{ containerType: "inline-size" }}
    >
      <AnimatedMetric
        value={Number(config.value)}
        prefix={String(config.prefix)}
        suffix={String(config.suffix)}
        label={String(config.label)}
        duration={Number(config.duration)}
        decimals={Number(config.decimals)}
        once={Boolean(config.once)}
        loop={Boolean(config.loop)}
        loopDelay={Number(config.loopDelay)}
        threshold={Number(config.threshold)}
      />
    </div>
  ),
  code: (config) => `import { AnimatedMetric } from "@/components/ui/animated-metric"

<AnimatedMetric
  value={${config.value}}
  prefix="${config.prefix}"
  suffix="${config.suffix}"
  label="${config.label}"
  duration={${config.duration}}
  decimals={${config.decimals}}
  loop={${config.loop}}
  loopDelay={${config.loopDelay}}
/>`,
  intro: "Set the number, copy, and counting motion.",
});
