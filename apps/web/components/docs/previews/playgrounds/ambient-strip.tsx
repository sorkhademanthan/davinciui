"use client";

import * as React from "react";
import { AmbientStrip } from "@workspace/ui/components/ambient-strip";
import { createComponentPlayground } from "@/components/docs/previews/generic-playground";
import { ambientStripDemoItems } from "@/components/docs/previews/ambient-strip-items";

type StageProps = Record<string, unknown>;

// ─── Ambient Strip ───────────────────────────────────────────────────────────

export const {
  Preview: AmbientStripPlayground,
  PersonalizePanel: AmbientStripPersonalizePanel,
} = createComponentPlayground({
  slug: "ambient-strip",
  component: AmbientStrip as unknown as React.ComponentType<StageProps>,
  componentName: "AmbientStrip",
  defaults: {
    expandScale: 1.18,
    gap: 14,
    blur: 72,
    loop: true,
  },
  fields: [
    {
      key: "expandScale",
      label: "Expand Scale",
      type: "slider",
      min: 1,
      max: 1.6,
      step: 0.01,
      section: "Layout",
    },
    {
      key: "gap",
      label: "Gap",
      type: "slider",
      min: 0,
      max: 48,
      step: 1,
      unit: "px",
      section: "Layout",
    },
    {
      key: "blur",
      label: "Backdrop Blur",
      type: "slider",
      min: 0,
      max: 120,
      step: 2,
      unit: "px",
      section: "Finish",
    },
    {
      key: "loop",
      label: "Infinite Loop",
      type: "switch",
      section: "Motion",
    },
  ],
  fixedProps: {
    items: ambientStripDemoItems,
  },
  elementClassName: "h-full min-h-[520px]",
  stageClassName: "min-h-[520px]",
  intro: "Tune the strip's spacing, expansion, and backdrop blur.",
});
