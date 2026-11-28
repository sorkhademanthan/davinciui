"use client";

import * as React from "react";
import { ProfileCarousel } from "@workspace/ui/components/profile-carousel";
import { createComponentPlayground } from "@/components/docs/previews/generic-playground";
import { profileCarouselDemoProfiles } from "@/components/docs/previews/profile-carousel-preview";

type StageProps = Record<string, unknown>;

// ─── Profile Carousel ───────────────────────────────────────────────────────

function ProfileCarouselStage(props: StageProps) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <ProfileCarousel
        profiles={profileCarouselDemoProfiles}
        initialIndex={0}
        {...props}
      />
    </div>
  );
}

export const {
  Preview: ProfileCarouselPlayground,
  PersonalizePanel: ProfileCarouselPersonalizePanel,
} = createComponentPlayground({
  slug: "profile-carousel",
  component: ProfileCarouselStage as unknown as React.ComponentType<StageProps>,
  componentName: "ProfileCarousel",
  defaults: {
    initialIndex: 0,
    loop: true,
    draggable: true,
    transitionDuration: 600,
    autoplay: false,
    autoplayInterval: 5000,
  },
  fields: [
    {
      key: "initialIndex",
      label: "Initial Index",
      type: "slider",
      min: 0,
      max: Math.max(0, profileCarouselDemoProfiles.length - 1),
      step: 1,
      section: "Navigation",
    },
    {
      key: "transitionDuration",
      label: "Transition",
      type: "slider",
      min: 100,
      max: 1600,
      step: 20,
      unit: "ms",
      section: "Motion",
    },
    {
      key: "autoplay",
      label: "Autoplay",
      type: "switch",
      section: "Motion",
    },
    {
      key: "autoplayInterval",
      label: "Autoplay Interval",
      type: "slider",
      min: 2500,
      max: 12000,
      step: 100,
      unit: "ms",
      section: "Motion",
    },
    { key: "loop", label: "Loop", type: "switch", section: "Navigation" },
    {
      key: "draggable",
      label: "Draggable",
      type: "switch",
      section: "Navigation",
    },
  ],
  stageClassName: "min-h-[520px]",
  intro: "Control the profile deck's navigation and autoplay.",
});
