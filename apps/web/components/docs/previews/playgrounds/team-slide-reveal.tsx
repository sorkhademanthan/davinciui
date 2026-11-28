"use client";

import * as React from "react";
import { TeamSlideReveal } from "@workspace/ui/components/team-slide-reveal";
import { createComponentPlayground } from "@/components/docs/previews/generic-playground";

type StageProps = Record<string, unknown>;

// ─── Team Slide Reveal ──────────────────────────────────────────────────────

export const {
  Preview: TeamSlideRevealPlayground,
  PersonalizePanel: TeamSlideRevealPersonalizePanel,
} = createComponentPlayground({
  slug: "team-slide-reveal",
  component: TeamSlideReveal as unknown as React.ComponentType<StageProps>,
  componentName: "TeamSlideReveal",
  defaults: {
    name: "Takahashi Aya",
    role: "CEO, Pentaclay",
    testimonial:
      "The strongest work starts with curiosity. We listen closely, make room for ideas to evolve, and build things that feel unmistakably human.",
    radius: 14,
    duration: 480,
    compact: false,
  },
  fields: [
    { key: "name", label: "Name", type: "text", section: "Content" },
    { key: "role", label: "Role", type: "text", section: "Content" },
    {
      key: "testimonial",
      label: "Testimonial",
      type: "textarea",
      section: "Content",
    },
    {
      key: "radius",
      label: "Corner Radius",
      type: "slider",
      min: 0,
      max: 40,
      step: 1,
      unit: "px",
      section: "Layout",
    },
    {
      key: "duration",
      label: "Reveal Duration",
      type: "slider",
      min: 100,
      max: 1400,
      step: 10,
      unit: "ms",
      section: "Motion",
    },
    { key: "compact", label: "Compact", type: "switch", section: "Layout" },
  ],
  render: (config) => (
    <div
      className="flex h-full w-full items-center justify-center overflow-hidden bg-zinc-100 p-5 dark:bg-zinc-950 sm:p-8"
      style={{ containerType: "inline-size" }}
    >
      <div className="aspect-[.73] h-[min(82%,32rem)] max-h-full max-w-[82cqi] shadow-2xl">
        <TeamSlideReveal
          name={String(config.name)}
          role={String(config.role)}
          testimonial={String(config.testimonial)}
          radius={Number(config.radius)}
          duration={Number(config.duration)}
          compact={Boolean(config.compact)}
          className="h-full w-full"
        />
      </div>
    </div>
  ),
  code: (config) => `import { TeamSlideReveal } from "@/components/ui/team-slide-reveal"

<div className="aspect-[.73] h-[32rem] max-w-full shadow-2xl">
  <TeamSlideReveal
    name="${config.name}"
    role="${config.role}"
    testimonial="${config.testimonial}"
    radius={${config.radius}}
    duration={${config.duration}}
    compact={${config.compact}}
    className="h-full w-full"
  />
</div>`,
  intro: "Edit the profile copy, corner radius, and reveal timing.",
});
