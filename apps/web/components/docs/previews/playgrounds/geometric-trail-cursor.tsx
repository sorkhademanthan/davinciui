"use client";

import * as React from "react";
import { GeometricTrailCursor } from "@workspace/ui/components/geometric-trail-cursor";
import { createComponentPlayground } from "@/components/docs/previews/generic-playground";

type StageProps = Record<string, unknown>;

function CursorLabel() {
  return (
    <p className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-8 text-center text-[clamp(2.5rem,7vw,5.5rem)] font-black tracking-[-0.07em] text-zinc-950 dark:text-white">
      DAVINCIUI
    </p>
  );
}

// ─── Geometric Trail Cursor ─────────────────────────────────────────────────

function GeometricTrailStage(props: StageProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className="relative h-full min-h-[600px] cursor-none overflow-hidden bg-zinc-100 dark:bg-black"
    >
      <GeometricTrailCursor containerRef={ref} zIndex={1} {...props} />
      <CursorLabel />
    </div>
  );
}

export const {
  Preview: GeometricTrailCursorPlayground,
  PersonalizePanel: GeometricTrailCursorPersonalizePanel,
} = createComponentPlayground({
  slug: "geometric-trail-cursor",
  component: GeometricTrailStage as React.ComponentType<StageProps>,
  componentName: "GeometricTrailCursor",
  defaults: {
    activeColor: "#22D3EE",
    colorCycle: true,
    colorCycleSpeed: 40,
    ghostColor: "#181818",
    backgroundColor: "#000000",
    minSize: 16,
    maxSize: 150,
    spacing: 16,
    density: 1,
    velocityScale: 1.4,
    rotationAmount: 0.15,
    activeDuration: 180,
    colorFadeDuration: 520,
    persistence: 0.9,
    strokeWidth: 1.5,
    glow: 6,
    minSides: 3,
    maxSides: 6,
    maxShapes: 1200,
  },
  fields: [
    {
      key: "activeColor",
      label: "Active Color",
      type: "color",
      section: "Color",
    },
    { key: "ghostColor", label: "Ghost Color", type: "color", section: "Color" },
    {
      key: "backgroundColor",
      label: "Background",
      type: "color",
      section: "Color",
    },
    { key: "colorCycle", label: "Color Cycle", type: "switch", section: "Color" },
    {
      key: "colorCycleSpeed",
      label: "Cycle Speed",
      type: "slider",
      min: 0,
      max: 180,
      step: 1,
      unit: "°/s",
      section: "Color",
    },
    {
      key: "minSize",
      label: "Min Size",
      type: "slider",
      min: 4,
      max: 80,
      step: 1,
      unit: "px",
      section: "Geometry",
    },
    {
      key: "maxSize",
      label: "Max Size",
      type: "slider",
      min: 20,
      max: 320,
      step: 2,
      unit: "px",
      section: "Geometry",
    },
    {
      key: "spacing",
      label: "Spacing",
      type: "slider",
      min: 2,
      max: 60,
      step: 1,
      unit: "px",
      section: "Trail",
    },
    {
      key: "density",
      label: "Density",
      type: "slider",
      min: 0.1,
      max: 4,
      step: 0.1,
      section: "Trail",
    },
    {
      key: "velocityScale",
      label: "Velocity Scale",
      type: "slider",
      min: 0,
      max: 4,
      step: 0.1,
      section: "Trail",
    },
    {
      key: "rotationAmount",
      label: "Rotation",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      section: "Trail",
    },
    {
      key: "activeDuration",
      label: "Active Duration",
      type: "slider",
      min: 0,
      max: 1000,
      step: 10,
      unit: "ms",
      section: "Timing",
    },
    {
      key: "colorFadeDuration",
      label: "Fade Duration",
      type: "slider",
      min: 0,
      max: 2000,
      step: 20,
      unit: "ms",
      section: "Timing",
    },
    {
      key: "persistence",
      label: "Persistence",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      section: "Timing",
    },
    {
      key: "strokeWidth",
      label: "Stroke Width",
      type: "slider",
      min: 0.25,
      max: 6,
      step: 0.25,
      unit: "px",
      section: "Geometry",
    },
    {
      key: "glow",
      label: "Glow",
      type: "slider",
      min: 0,
      max: 24,
      step: 1,
      section: "Geometry",
    },
    {
      key: "minSides",
      label: "Min Sides",
      type: "slider",
      min: 3,
      max: 10,
      step: 1,
      section: "Geometry",
    },
    {
      key: "maxSides",
      label: "Max Sides",
      type: "slider",
      min: 3,
      max: 12,
      step: 1,
      section: "Geometry",
    },
    {
      key: "maxShapes",
      label: "Max Shapes",
      type: "slider",
      min: 100,
      max: 3000,
      step: 50,
      section: "Performance",
    },
  ],
  stageClassName: "min-h-[600px]",
  intro:
    "Move across the stage to emit geometry. Tune the palette, trail density, and lifespan.",
});
