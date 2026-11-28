"use client";

import * as React from "react";
import { LensDriftGrid } from "@workspace/ui/components/lens-drift-grid";
import { createComponentPlayground } from "@/components/docs/previews/generic-playground";

type StageProps = Record<string, unknown>;

// ─── Lens Drift Grid ────────────────────────────────────────────────────────

export const {
  Preview: LensDriftGridPlayground,
  PersonalizePanel: LensDriftGridPersonalizePanel,
} = createComponentPlayground({
  slug: "lens-drift-grid",
  component: LensDriftGrid as unknown as React.ComponentType<StageProps>,
  componentName: "LensDriftGrid",
  defaults: {
    tileWidth: 238,
    tileHeight: 272,
    gap: 0,
    lensStrength: 0.24,
    hoverNudge: 16,
    inertia: 0.94,
    wheelSensitivity: 0.42,
    autoDrift: true,
    driftResumeMs: 2400,
    interactive: true,
    theme: "system",
  },
  fields: [
    {
      key: "tileWidth",
      label: "Tile Width",
      type: "slider",
      min: 80,
      max: 480,
      step: 2,
      unit: "px",
      section: "Grid",
    },
    {
      key: "tileHeight",
      label: "Tile Height",
      type: "slider",
      min: 80,
      max: 520,
      step: 2,
      unit: "px",
      section: "Grid",
    },
    {
      key: "gap",
      label: "Gap",
      type: "slider",
      min: 0,
      max: 60,
      step: 1,
      unit: "px",
      section: "Grid",
    },
    {
      key: "lensStrength",
      label: "Lens Strength",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      section: "Lens",
    },
    {
      key: "hoverNudge",
      label: "Hover Nudge",
      type: "slider",
      min: 0,
      max: 60,
      step: 1,
      unit: "px",
      section: "Lens",
    },
    {
      key: "inertia",
      label: "Inertia",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      section: "Motion",
    },
    {
      key: "wheelSensitivity",
      label: "Wheel Sensitivity",
      type: "slider",
      min: 0,
      max: 2,
      step: 0.01,
      section: "Motion",
    },
    {
      key: "autoDrift",
      label: "Auto Drift",
      type: "switch",
      section: "Motion",
    },
    {
      key: "driftResumeMs",
      label: "Drift Resume",
      type: "slider",
      min: 0,
      max: 8000,
      step: 100,
      unit: "ms",
      section: "Motion",
    },
    {
      key: "interactive",
      label: "Interactive",
      type: "switch",
      section: "Motion",
    },
    {
      key: "theme",
      label: "Theme",
      type: "select",
      options: [
        { label: "System", value: "system" },
        { label: "Light", value: "light" },
        { label: "Dark", value: "dark" },
      ],
      section: "Surface",
    },
  ],
  elementClassName: "h-full w-full",
  intro: "Tune the lens warp, tile geometry, and idle drift.",
});
