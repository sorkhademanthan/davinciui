"use client";

import * as React from "react";
import { CircleCursor } from "@workspace/ui/components/circle-cursor";
import { ChromaticCursor } from "@workspace/ui/components/chromatic-cursor";
import { MagicCursorPro } from "@workspace/ui/components/magic-cursor-pro";
import { ElectricVijdiCursor } from "@workspace/ui/components/electric-vijdi-cursor";
import { ElasticBlobCursor } from "@workspace/ui/components/elastic-blob-cursor";
import { FluidCursor } from "@workspace/ui/components/fluid-cursor";
import { GeometricTrailCursor } from "@workspace/ui/components/geometric-trail-cursor";
import { TubesCursor } from "@workspace/ui/components/tubes-cursor";
import { createComponentPlayground } from "@/components/docs/previews/generic-playground";
import { useAmbientCursorDrive } from "@/components/docs/previews/use-ambient-cursor-drive";

type StageProps = Record<string, unknown>;

function CursorLabel() {
  return (
    <p className="pointer-events-none absolute inset-0 flex items-center justify-center px-8 text-center text-[clamp(2.5rem,7vw,5.5rem)] font-black tracking-[-0.07em] text-zinc-950 dark:text-white">
      DAVINCIUI
    </p>
  );
}

function CircleCursorStage(props: StageProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className="relative h-full min-h-[600px] overflow-hidden bg-zinc-100 dark:bg-black"
    >
      <CircleCursor containerRef={ref} zIndex={10} {...props} />
      <CursorLabel />
    </div>
  );
}

export const {
  Preview: CircleCursorPlayground,
  PersonalizePanel: CircleCursorPersonalizePanel,
} = createComponentPlayground({
  slug: "circle-cursor",
  component: CircleCursorStage as React.ComponentType<StageProps>,
  componentName: "CircleCursor",
  defaults: {
    size: 46,
    color: "#FF3B0A",
    followSpeed: 0.16,
    hideNativeCursor: true,
  },
  fields: [
    {
      key: "size",
      label: "Size",
      type: "slider",
      min: 8,
      max: 140,
      step: 1,
      unit: "px",
      section: "Appearance",
    },
    { key: "color", label: "Color", type: "color", section: "Appearance" },
    {
      key: "followSpeed",
      label: "Follow Speed",
      type: "slider",
      min: 0.04,
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
  elementClassName: undefined,
  stageClassName: "min-h-[600px]",
  intro:
    "Tune the follower circle's scale, color, and tracking. Move across the stage to feel the inertia.",
});

function ChromaticCursorStage(props: StageProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className="relative h-full min-h-[600px] overflow-hidden bg-zinc-100 dark:bg-black"
    >
      <ChromaticCursor containerRef={ref} zIndex={10} {...props} />
      <CursorLabel />
    </div>
  );
}

export const {
  Preview: ChromaticCursorPlayground,
  PersonalizePanel: ChromaticCursorPersonalizePanel,
} = createComponentPlayground({
  slug: "chromatic-cursor",
  component: ChromaticCursorStage as React.ComponentType<StageProps>,
  componentName: "ChromaticCursor",
  defaults: {
    trailLength: 64,
    splitDistance: 4,
    fadeSpeed: 0.55,
    size: 11,
    tension: 0.34,
    red: "#FF493D",
    green: "#F4FFB0",
    blue: "#00CCFF",
  },
  fields: [
    { key: "red", label: "Red Channel", type: "color", section: "Channels" },
    {
      key: "green",
      label: "Green Channel",
      type: "color",
      section: "Channels",
    },
    { key: "blue", label: "Blue Channel", type: "color", section: "Channels" },
    {
      key: "splitDistance",
      label: "RGB Split",
      type: "slider",
      min: 0,
      max: 24,
      step: 0.5,
      unit: "px",
      section: "Channels",
    },
    {
      key: "trailLength",
      label: "Trail Length",
      type: "slider",
      min: 4,
      max: 120,
      step: 1,
      section: "Motion",
    },
    {
      key: "fadeSpeed",
      label: "Fade Speed",
      type: "slider",
      min: 0.05,
      max: 1,
      step: 0.01,
      section: "Motion",
    },
    {
      key: "size",
      label: "Size",
      type: "slider",
      min: 2,
      max: 40,
      step: 1,
      unit: "px",
      section: "Motion",
    },
    {
      key: "tension",
      label: "Tension",
      type: "slider",
      min: 0.05,
      max: 1,
      step: 0.01,
      section: "Motion",
    },
  ],
  stageClassName: "min-h-[600px]",
  intro: "Mix the RGB channels, trail length, and follow tension.",
});

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

function ElectricVijdiStage(props: StageProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className="relative flex h-full min-h-[600px] items-center justify-center overflow-hidden bg-zinc-100 dark:bg-[radial-gradient(circle_at_center,#24133d_0%,#0b0811_45%,#050507_100%)]"
    >
      <ElectricVijdiCursor containerRef={ref} zIndex={10} {...props} />
      <CursorLabel />
    </div>
  );
}

export const {
  Preview: ElectricVijdiCursorPlayground,
  PersonalizePanel: ElectricVijdiCursorPersonalizePanel,
} = createComponentPlayground({
  slug: "electric-vijdi-cursor",
  component: ElectricVijdiStage as React.ComponentType<StageProps>,
  componentName: "ElectricVijdiCursor",
  defaults: {
    color: "#A855F7",
    intensity: 1,
    boltWidth: 1.2,
    glowSize: 1,
    trailLifetime: 240,
    jitter: 9,
    branchIntensity: 1,
    sparkIntensity: 1,
    speedResponse: 1,
    quality: "high",
  },
  fields: [
    { key: "color", label: "Bolt Color", type: "color", section: "Look" },
    {
      key: "intensity",
      label: "Intensity",
      type: "slider",
      min: 0.1,
      max: 3,
      step: 0.1,
      section: "Look",
    },
    {
      key: "boltWidth",
      label: "Bolt Width",
      type: "slider",
      min: 0.2,
      max: 6,
      step: 0.1,
      section: "Look",
    },
    {
      key: "glowSize",
      label: "Glow Size",
      type: "slider",
      min: 0,
      max: 4,
      step: 0.1,
      section: "Look",
    },
    {
      key: "trailLifetime",
      label: "Trail Lifetime",
      type: "slider",
      min: 40,
      max: 900,
      step: 10,
      unit: "ms",
      section: "Motion",
    },
    {
      key: "jitter",
      label: "Jitter",
      type: "slider",
      min: 0,
      max: 30,
      step: 1,
      section: "Motion",
    },
    {
      key: "branchIntensity",
      label: "Branching",
      type: "slider",
      min: 0,
      max: 3,
      step: 0.1,
      section: "Motion",
    },
    {
      key: "sparkIntensity",
      label: "Sparks",
      type: "slider",
      min: 0,
      max: 3,
      step: 0.1,
      section: "Motion",
    },
    {
      key: "quality",
      label: "Quality",
      type: "select",
      options: [
        { label: "Low", value: "low" },
        { label: "Medium", value: "medium" },
        { label: "High", value: "high" },
      ],
      section: "Performance",
    },
  ],
  stageClassName: "min-h-[600px]",
  intro: "Control the lightning bolt's color, bloom, branching, and lifetime.",
});

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

function FluidCursorStage(props: StageProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  useAmbientCursorDrive(ref);
  return (
    <div
      ref={ref}
      className="relative h-full min-h-[600px] overflow-hidden bg-zinc-100 dark:bg-black"
    >
      <FluidCursor containerRef={ref} zIndex={10} {...props}>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-8">
          <p className="text-center text-[clamp(2.5rem,7vw,5.5rem)] font-black tracking-[-0.07em] text-zinc-950 dark:text-white">
            DAVINCIUI
          </p>
        </div>
      </FluidCursor>
    </div>
  );
}

export const {
  Preview: FluidCursorPlayground,
  PersonalizePanel: FluidCursorPersonalizePanel,
} = createComponentPlayground({
  slug: "fluid-cursor",
  component: FluidCursorStage as React.ComponentType<StageProps>,
  componentName: "FluidCursor",
  defaults: {
    intensity: 1,
    force: 1,
    curl: 28,
    trailSize: 0.22,
    velocityDissipation: 0.992,
    dyeDissipation: 0.975,
    colorSpeed: 0.12,
    brightness: 1,
    glow: 0.15,
    saturation: 0.85,
    colorMode: "spectral",
    resolution: 128,
  },
  fields: [
    {
      key: "intensity",
      label: "Intensity",
      type: "slider",
      min: 0.1,
      max: 3,
      step: 0.05,
      section: "Dye",
    },
    {
      key: "trailSize",
      label: "Trail Size",
      type: "slider",
      min: 0.05,
      max: 0.6,
      step: 0.01,
      section: "Dye",
    },
    {
      key: "colorSpeed",
      label: "Hue Speed",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      section: "Dye",
    },
    {
      key: "saturation",
      label: "Saturation",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      section: "Dye",
    },
    {
      key: "brightness",
      label: "Brightness",
      type: "slider",
      min: 0.2,
      max: 2.5,
      step: 0.05,
      section: "Dye",
    },
    {
      key: "force",
      label: "Splat Force",
      type: "slider",
      min: 0.1,
      max: 3,
      step: 0.05,
      section: "Physics",
    },
    {
      key: "curl",
      label: "Vorticity",
      type: "slider",
      min: 0,
      max: 60,
      step: 1,
      section: "Physics",
    },
    {
      key: "velocityDissipation",
      label: "Velocity Drag",
      type: "slider",
      min: 0.9,
      max: 0.999,
      step: 0.001,
      section: "Physics",
    },
    {
      key: "dyeDissipation",
      label: "Dye Drag",
      type: "slider",
      min: 0.9,
      max: 0.999,
      step: 0.001,
      section: "Physics",
    },
    {
      key: "glow",
      label: "Glow",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      section: "Physics",
    },
    {
      key: "colorMode",
      label: "Color Mode",
      type: "select",
      options: [
        { label: "Spectral", value: "spectral" },
        { label: "Mono", value: "mono" },
      ],
      section: "Physics",
    },
    {
      key: "resolution",
      label: "Resolution",
      type: "slider",
      min: 64,
      max: 256,
      step: 16,
      section: "Performance",
    },
  ],
  stageClassName: "min-h-[600px]",
  intro: "Tune the fluid simulation's dye, splat force, and vorticity.",
});

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

// ─── Tubes Cursor ───────────────────────────────────────────────────────────

function TubesCursorStage(props: StageProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className="relative h-full min-h-[600px] cursor-none overflow-hidden bg-zinc-100 dark:bg-black"
    >
      <TubesCursor
        key={JSON.stringify(props)}
        containerRef={ref}
        zIndex={10}
        {...props}
      />
      <CursorLabel />
    </div>
  );
}

export const {
  Preview: TubesCursorPlayground,
  PersonalizePanel: TubesCursorPersonalizePanel,
} = createComponentPlayground({
  slug: "tubes-cursor",
  component: TubesCursorStage as React.ComponentType<StageProps>,
  componentName: "TubesCursor",
  defaults: {
    lightIntensity: 2.4,
    theme: "auto",
    tubeCount: 24,
    bloomThreshold: 0,
    bloomStrength: 1.5,
    bloomRadius: 0.5,
    randomizeOnClick: true,
    idleMotion: true,
    quality: "high",
  },
  fields: [
    {
      key: "lightIntensity",
      label: "Light Intensity",
      type: "slider",
      min: 0,
      max: 8,
      step: 0.1,
      section: "Lighting",
    },
    {
      key: "bloomStrength",
      label: "Bloom Strength",
      type: "slider",
      min: 0,
      max: 6,
      step: 0.1,
      section: "Lighting",
    },
    {
      key: "bloomRadius",
      label: "Bloom Radius",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      section: "Lighting",
    },
    {
      key: "bloomThreshold",
      label: "Bloom Threshold",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      section: "Lighting",
    },
    {
      key: "tubeCount",
      label: "Tube Count",
      type: "slider",
      min: 4,
      max: 64,
      step: 1,
      section: "Geometry",
    },
    {
      key: "quality",
      label: "Quality",
      type: "select",
      options: [
        { label: "Low", value: "low" },
        { label: "Medium", value: "medium" },
        { label: "High", value: "high" },
      ],
      section: "Performance",
    },
    {
      key: "theme",
      label: "Theme",
      type: "select",
      options: [
        { label: "Auto", value: "auto" },
        { label: "Dark", value: "dark" },
        { label: "Light", value: "light" },
      ],
      section: "Appearance",
    },
    {
      key: "idleMotion",
      label: "Idle Motion",
      type: "switch",
      section: "Motion",
    },
    {
      key: "randomizeOnClick",
      label: "Randomize On Click",
      type: "switch",
      section: "Interaction",
    },
  ],
  stageClassName: "min-h-[600px]",
  intro:
    "Move through the light tubes and click to randomize the palette. Tune bloom and density.",
});
