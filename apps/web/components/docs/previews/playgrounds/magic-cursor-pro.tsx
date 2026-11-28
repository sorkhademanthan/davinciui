"use client";

import * as React from "react";
import { MagicCursorPro } from "@workspace/ui/components/magic-cursor-pro";
import { createComponentPlayground } from "@/components/docs/previews/generic-playground";

type StageProps = Record<string, unknown>;

function CursorLabel() {
  return (
    <p className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-8 text-center text-[clamp(2.5rem,7vw,5.5rem)] font-black tracking-[-0.07em] text-zinc-950 dark:text-white">
      DAVINCIUI
    </p>
  );
}

function MagicCursorStage(props: StageProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className="relative h-full min-h-[600px] overflow-hidden bg-zinc-100 dark:bg-black"
    >
      <MagicCursorPro containerRef={ref} zIndex={10} {...props} />
      <CursorLabel />
    </div>
  );
}

export const {
  Preview: MagicCursorProPlayground,
  PersonalizePanel: MagicCursorProPersonalizePanel,
} = createComponentPlayground({
  slug: "magic-cursor-pro",
  component: MagicCursorStage as React.ComponentType<StageProps>,
  componentName: "MagicCursorPro",
  defaults: {
    mixBlendMode: "normal",
    stiffness: 400,
    damping: 35,
    mass: 1,
    clickSquish: true,
    hideSystemCursor: true,
  },
  fields: [
    {
      key: "stiffness",
      label: "Stiffness",
      type: "slider",
      min: 80,
      max: 900,
      step: 10,
      section: "Spring",
    },
    {
      key: "damping",
      label: "Damping",
      type: "slider",
      min: 5,
      max: 80,
      step: 1,
      section: "Spring",
    },
    {
      key: "mass",
      label: "Mass",
      type: "slider",
      min: 0.2,
      max: 4,
      step: 0.1,
      section: "Spring",
    },
    {
      key: "mixBlendMode",
      label: "Blend Mode",
      type: "select",
      options: [
        { label: "Normal", value: "normal" },
        { label: "Difference", value: "difference" },
        { label: "Exclusion", value: "exclusion" },
        { label: "Overlay", value: "overlay" },
      ],
      section: "Appearance",
    },
    {
      key: "clickSquish",
      label: "Click Squish",
      type: "switch",
      section: "Appearance",
    },
    {
      key: "hideSystemCursor",
      label: "Hide Native Cursor",
      type: "switch",
      section: "Appearance",
    },
  ],
  stageClassName: "min-h-[600px]",
  intro: "Dial in the spring feel and blend mode of the custom cursor.",
});
