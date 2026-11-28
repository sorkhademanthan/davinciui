"use client";

import * as React from "react";
import { ServicesShowcase } from "@workspace/ui/components/services-showcase";
import { createComponentPlayground } from "@/components/docs/previews/generic-playground";

type StageProps = Record<string, unknown>;

// ─── Services Showcase ──────────────────────────────────────────────────────

export const {
  Preview: ServicesShowcasePlayground,
  PersonalizePanel: ServicesShowcasePersonalizePanel,
} = createComponentPlayground({
  slug: "services-showcase",
  component: ServicesShowcase as unknown as React.ComponentType<StageProps>,
  componentName: "ServicesShowcase",
  defaults: {
    density: "comfortable",
    interactive: true,
    autoPlay: false,
  },
  fields: [
    {
      key: "density",
      label: "Density",
      type: "select",
      options: [
        { label: "Comfortable", value: "comfortable" },
        { label: "Compact", value: "compact" },
      ],
      section: "Layout",
    },
    {
      key: "interactive",
      label: "Interactive",
      type: "switch",
      section: "Motion",
    },
    { key: "autoPlay", label: "Auto Play", type: "switch", section: "Motion" },
  ],
  elementClassName: "h-full min-h-0",
  intro: "Tune the service card stack's density and interaction.",
});
