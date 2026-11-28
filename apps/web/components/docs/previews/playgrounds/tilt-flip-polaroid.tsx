"use client";

import * as React from "react";
import { TiltFlipPolaroid, type TiltFlipPolaroidImage } from "@workspace/ui/components/tilt-flip-polaroid";
import { createComponentPlayground } from "@/components/docs/previews/generic-playground";

type StageProps = Record<string, unknown>;

const tiltImage: TiltFlipPolaroidImage = {
  src: "https://images.unsplash.com/photo-1610846202780-b4d9837371ea?w=900&q=85&auto=format&fit=crop",
  alt: "Lone figure passing through a muted green field",
};

// ─── Tilt Flip Polaroid ─────────────────────────────────────────────────────

function TiltFlipStage(props: StageProps) {
  return (
    <div className="flex h-full min-h-[520px] w-full items-center justify-center bg-[#FAFAFA] p-6 transition-colors duration-300 dark:bg-[#0A0A0B]">
      <TiltFlipPolaroid image={tiltImage} {...props} />
    </div>
  );
}

export const {
  Preview: TiltFlipPolaroidPlayground,
  PersonalizePanel: TiltFlipPolaroidPersonalizePanel,
} = createComponentPlayground({
  slug: "tilt-flip-polaroid",
  component: TiltFlipStage as unknown as React.ComponentType<StageProps>,
  componentName: "TiltFlipPolaroid",
  defaults: {
    date: "11/07/24",
    backText:
      "Every good story starts with a single frame.\nKeep this one close.",
    maxTilt: 15,
    perspective: 1000,
    tiltEnabled: true,
    selectableBack: false,
    width: 396,
    height: 443,
  },
  fields: [
    { key: "date", label: "Date Caption", type: "text", section: "Content" },
    {
      key: "backText",
      label: "Back Note",
      type: "textarea",
      section: "Content",
    },
    {
      key: "maxTilt",
      label: "Max Tilt",
      type: "slider",
      min: 0,
      max: 40,
      step: 1,
      unit: "°",
      section: "Interaction",
    },
    {
      key: "perspective",
      label: "Perspective",
      type: "slider",
      min: 400,
      max: 2400,
      step: 20,
      unit: "px",
      section: "Interaction",
    },
    {
      key: "width",
      label: "Card Width",
      type: "slider",
      min: 220,
      max: 640,
      step: 2,
      unit: "px",
      section: "Layout",
    },
    {
      key: "height",
      label: "Card Height",
      type: "slider",
      min: 240,
      max: 720,
      step: 2,
      unit: "px",
      section: "Layout",
    },
    {
      key: "tiltEnabled",
      label: "Pointer Tilt",
      type: "switch",
      section: "Interaction",
    },
    {
      key: "selectableBack",
      label: "Selectable Back",
      type: "switch",
      section: "Interaction",
    },
  ],
  stageClassName: "min-h-[520px]",
  codeExtras: "  image={polaroidImage}",
  intro: "Edit the polaroid copy and its tilt geometry.",
});
