"use client";

import * as React from "react";
import { LiquidChromeButton } from "@workspace/ui/components/liquid-chrome-button";
import { createComponentPlayground } from "@/components/docs/previews/generic-playground";

type StageProps = Record<string, unknown>;

// ─── Liquid Chrome Button ───────────────────────────────────────────────────

function LiquidChromeStage(props: StageProps) {
  return (
    <section className="relative flex h-full min-h-[560px] w-full items-center justify-center overflow-hidden bg-slate-100 p-8 dark:bg-[#090d13]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,rgba(95,140,172,.26),transparent_34%),linear-gradient(145deg,#f9fcff,#dce7ed_66%)] dark:bg-[radial-gradient(circle_at_50%_46%,rgba(108,157,196,.2),transparent_34%),linear-gradient(145deg,#0d1520,#07090d_66%)]" />
      <LiquidChromeButton ariaLabel="Open portfolio" {...props} />
    </section>
  );
}

export const {
  Preview: LiquidChromeButtonPlayground,
  PersonalizePanel: LiquidChromeButtonPersonalizePanel,
} = createComponentPlayground({
  slug: "liquid-chrome-button",
  component: LiquidChromeStage as unknown as React.ComponentType<StageProps>,
  componentName: "LiquidChromeButton",
  defaults: {
    size: 176,
    borderWidth: 15,
    speed: 1,
    glassOpacity: 0.44,
    icon: "cursor",
    decorative: false,
  },
  fields: [
    {
      key: "size",
      label: "Diameter",
      type: "slider",
      min: 40,
      max: 300,
      step: 1,
      unit: "px",
      section: "Layout",
    },
    {
      key: "borderWidth",
      label: "Ring Width",
      type: "slider",
      min: 2,
      max: 40,
      step: 1,
      unit: "px",
      section: "Layout",
    },
    {
      key: "speed",
      label: "Chrome Speed",
      type: "slider",
      min: 0,
      max: 4,
      step: 0.05,
      section: "Motion",
    },
    {
      key: "glassOpacity",
      label: "Glass Opacity",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      section: "Finish",
    },
    {
      key: "icon",
      label: "Icon",
      type: "select",
      options: [
        { label: "Cursor", value: "cursor" },
        { label: "Folder", value: "folder" },
        { label: "Lightning", value: "lightning" },
      ],
      section: "Content",
    },
    {
      key: "decorative",
      label: "Decorative",
      type: "switch",
      section: "Interaction",
    },
  ],
  stageClassName: "min-h-[560px]",
  codeExtras: '  ariaLabel="Open portfolio"',
  intro: "Shape the chrome lens, ring, and glass finish.",
});
