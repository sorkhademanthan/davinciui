"use client";

import * as React from "react";
import { ElasticBlobCursor } from "@workspace/ui/components/elastic-blob-cursor";
import { createComponentPlayground } from "@/components/docs/previews/generic-playground";

type StageProps = Record<string, unknown>;

function ElasticBlobStage(props: StageProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className="relative h-full min-h-[600px] cursor-none overflow-hidden bg-zinc-100 dark:bg-black"
    >
      <ElasticBlobCursor containerRef={ref} mode="container" zIndex={10} {...props} />
      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-8 mix-blend-difference">
        <p className="text-center text-[clamp(2.5rem,7vw,5.5rem)] font-black tracking-[-0.07em] text-white">
          DAVINCIUI
        </p>
      </div>
    </div>
  );
}

export const {
  Preview: ElasticBlobCursorPlayground,
  PersonalizePanel: ElasticBlobCursorPersonalizePanel,
} = createComponentPlayground({
  slug: "elastic-blob-cursor",
  component: ElasticBlobStage as React.ComponentType<StageProps>,
  componentName: "ElasticBlobCursor",
  defaults: {
    size: 60,
    color: "#FFFFFF",
    maxStretch: 1.4,
    compression: 0.22,
    velocitySensitivity: 0.8,
    followStrength: 0.18,
    hideNativeCursor: true,
  },
  fields: [
    {
      key: "size",
      label: "Size",
      type: "slider",
      min: 10,
      max: 160,
      step: 1,
      unit: "px",
      section: "Appearance",
    },
    { key: "color", label: "Color", type: "color", section: "Appearance" },
    {
      key: "maxStretch",
      label: "Max Stretch",
      type: "slider",
      min: 1,
      max: 2.6,
      step: 0.05,
      section: "Deformation",
    },
    {
      key: "compression",
      label: "Compression",
      type: "slider",
      min: 0,
      max: 0.6,
      step: 0.01,
      section: "Deformation",
    },
    {
      key: "velocitySensitivity",
      label: "Velocity Sensitivity",
      type: "slider",
      min: 0.1,
      max: 2,
      step: 0.05,
      section: "Deformation",
    },
    {
      key: "followStrength",
      label: "Follow Strength",
      type: "slider",
      min: 0.05,
      max: 0.4,
      step: 0.01,
      section: "Motion",
    },
    {
      key: "hideNativeCursor",
      label: "Hide Native Cursor",
      type: "switch",
      section: "Motion",
    },
  ],
  stageClassName: "min-h-[600px]",
  intro: "Shape the blob's stretch, compression, and follow behavior.",
});
