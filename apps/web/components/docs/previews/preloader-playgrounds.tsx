"use client";

import * as React from "react";
import { GeometricPreloader } from "@workspace/ui/components/geometric-preloader";
import { PixelPreloader } from "@workspace/ui/components/pixel-preloader";
import { StaircasePreloader } from "@workspace/ui/components/staircase-preloader";
import { FillPreloader } from "@workspace/ui/components/fill-preloader";
import { EditorialWipePreloader } from "@workspace/ui/components/editorial-wipe-preloader";
import { PreloaderPro } from "@workspace/ui/components/preloader-pro";
import { createComponentPlayground } from "@/components/docs/previews/generic-playground";

function ReplayableStage({
  title,
  runId,
  children,
}: {
  title: string;
  runId: string;
  children: React.ReactNode;
}) {
  const [replay, setReplay] = React.useState(0);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-border/40 bg-background/80 px-4 py-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {title}
        </span>
        <button
          type="button"
          onClick={() => setReplay((value) => value + 1)}
          className="rounded-md border border-border/40 bg-white/50 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground dark:bg-white/[0.03]"
        >
          Replay
        </button>
      </div>
      <div
        className="relative flex-1 overflow-hidden bg-white dark:bg-zinc-950"
        style={{ transform: "translateZ(0)" }}
      >
        <React.Fragment key={`${runId}-${replay}`}>{children}</React.Fragment>
      </div>
    </div>
  );
}

// ─── Geometric Preloader ────────────────────────────────────────────────────

export const {
  Preview: GeometricPreloaderPlayground,
  PersonalizePanel: GeometricPreloaderPersonalizePanel,
} = createComponentPlayground({
  slug: "geometric-preloader",
  component: GeometricPreloader as unknown as React.ComponentType<
    Record<string, unknown>
  >,
  componentName: "GeometricPreloader",
  defaults: {
    duration: 2200,
    holdDuration: 180,
    exitDuration: 720,
    accentColor: "#ff4d23",
    theme: "auto",
    showLabel: true,
  },
  fields: [
    {
      key: "duration",
      label: "Load Duration",
      type: "slider",
      min: 500,
      max: 8000,
      step: 100,
      unit: "ms",
      section: "Timing",
    },
    {
      key: "holdDuration",
      label: "Hold",
      type: "slider",
      min: 0,
      max: 2000,
      step: 50,
      unit: "ms",
      section: "Timing",
    },
    {
      key: "exitDuration",
      label: "Exit",
      type: "slider",
      min: 200,
      max: 2500,
      step: 50,
      unit: "ms",
      section: "Timing",
    },
    { key: "accentColor", label: "Accent", type: "color", section: "Color" },
    {
      key: "theme",
      label: "Theme",
      type: "select",
      options: [
        { label: "Auto", value: "auto" },
        { label: "Dark", value: "dark" },
        { label: "Light", value: "light" },
      ],
      section: "Color",
    },
    { key: "showLabel", label: "Show Counter", type: "switch", section: "Content" },
  ],
  stageClassName: "min-h-[560px]",
  render: (config, renderVersion) => {
    const props =
      config as unknown as React.ComponentProps<typeof GeometricPreloader>;
    return (
      <ReplayableStage title="Geometric Preloader" runId={String(renderVersion)}>
        <GeometricPreloader {...props} />
      </ReplayableStage>
    );
  },
  intro: "Tune the diamond reveal timing and the brand accent.",
});

// ─── Pixel Preloader ────────────────────────────────────────────────────────

export const {
  Preview: PixelPreloaderPlayground,
  PersonalizePanel: PixelPreloaderPersonalizePanel,
} = createComponentPlayground({
  slug: "pixel-preloader",
  component: PixelPreloader as unknown as React.ComponentType<
    Record<string, unknown>
  >,
  componentName: "PixelPreloader",
  defaults: {
    duration: 4500,
    seed: 1337,
    cellSize: 6,
    accentColor: "#ff4d23",
    theme: "auto",
    showPercentage: true,
    completionHold: 450,
    exitDuration: 700,
  },
  fields: [
    {
      key: "duration",
      label: "Load Duration",
      type: "slider",
      min: 800,
      max: 10000,
      step: 100,
      unit: "ms",
      section: "Timing",
    },
    {
      key: "completionHold",
      label: "Hold",
      type: "slider",
      min: 0,
      max: 2000,
      step: 50,
      unit: "ms",
      section: "Timing",
    },
    {
      key: "exitDuration",
      label: "Exit",
      type: "slider",
      min: 100,
      max: 2500,
      step: 50,
      unit: "ms",
      section: "Timing",
    },
    {
      key: "seed",
      label: "Noise Seed",
      type: "slider",
      min: 1,
      max: 5000,
      step: 1,
      section: "Pattern",
    },
    {
      key: "cellSize",
      label: "Cell Size",
      type: "slider",
      min: 2,
      max: 24,
      step: 1,
      unit: "px",
      section: "Pattern",
    },
    { key: "accentColor", label: "Accent", type: "color", section: "Color" },
    {
      key: "theme",
      label: "Theme",
      type: "select",
      options: [
        { label: "Auto", value: "auto" },
        { label: "Dark", value: "dark" },
        { label: "Light", value: "light" },
      ],
      section: "Color",
    },
    {
      key: "showPercentage",
      label: "Show Percentage",
      type: "switch",
      section: "Content",
    },
  ],
  stageClassName: "min-h-[560px]",
  render: (config, renderVersion) => {
    const props = config as unknown as React.ComponentProps<typeof PixelPreloader>;
    return (
      <ReplayableStage title="Pixel Preloader" runId={String(renderVersion)}>
        <PixelPreloader {...props} />
      </ReplayableStage>
    );
  },
  intro: "Tune the pixel frontier density, seed, and accent.",
});

// ─── Staircase Preloader ────────────────────────────────────────────────────

export const {
  Preview: StaircasePreloaderPlayground,
  PersonalizePanel: StaircasePreloaderPersonalizePanel,
} = createComponentPlayground({
  slug: "staircase-preloader",
  component: StaircasePreloader as unknown as React.ComponentType<
    Record<string, unknown>
  >,
  componentName: "StaircasePreloader",
  defaults: {
    color: "#FF3D00",
    stepCount: 8,
    holdDuration: 200,
    exitDuration: 850,
    stagger: 55,
  },
  fields: [
    { key: "color", label: "Curtain Color", type: "color", section: "Color" },
    {
      key: "stepCount",
      label: "Strip Count",
      type: "slider",
      min: 2,
      max: 24,
      step: 1,
      section: "Geometry",
    },
    {
      key: "holdDuration",
      label: "Hold",
      type: "slider",
      min: 0,
      max: 1500,
      step: 25,
      unit: "ms",
      section: "Timing",
    },
    {
      key: "exitDuration",
      label: "Exit",
      type: "slider",
      min: 200,
      max: 2500,
      step: 50,
      unit: "ms",
      section: "Timing",
    },
    {
      key: "stagger",
      label: "Stagger",
      type: "slider",
      min: 0,
      max: 300,
      step: 5,
      unit: "ms",
      section: "Timing",
    },
  ],
  stageClassName: "min-h-[560px]",
  render: (config, renderVersion) => {
    const props =
      config as unknown as React.ComponentProps<typeof StaircasePreloader>;
    return (
      <ReplayableStage title="Staircase Preloader" runId={String(renderVersion)}>
        <StaircasePreloader {...props} />
      </ReplayableStage>
    );
  },
  intro: "Tune the stepped curtain: strip count, stagger, and exit.",
});

// ─── Fill Preloader ─────────────────────────────────────────────────────────

export const {
  Preview: FillPreloaderPlayground,
  PersonalizePanel: FillPreloaderPersonalizePanel,
} = createComponentPlayground({
  slug: "fill-preloader",
  component: FillPreloader as unknown as React.ComponentType<
    Record<string, unknown>
  >,
  componentName: "FillPreloader",
  defaults: {
    fillColor: "#0b5ffb",
    theme: "auto",
    duration: 2800,
    completionHold: 300,
    exitDuration: 900,
    showCounter: true,
    fontWeight: 600,
    counterOffsetX: 32,
    counterOffsetY: 24,
  },
  fields: [
    { key: "fillColor", label: "Fill Color", type: "color", section: "Color" },
    {
      key: "theme",
      label: "Theme",
      type: "select",
      options: [
        { label: "Auto", value: "auto" },
        { label: "Dark", value: "dark" },
        { label: "Light", value: "light" },
      ],
      section: "Color",
    },
    {
      key: "duration",
      label: "Load Duration",
      type: "slider",
      min: 500,
      max: 8000,
      step: 100,
      unit: "ms",
      section: "Timing",
    },
    {
      key: "completionHold",
      label: "Hold",
      type: "slider",
      min: 0,
      max: 2000,
      step: 50,
      unit: "ms",
      section: "Timing",
    },
    {
      key: "exitDuration",
      label: "Exit",
      type: "slider",
      min: 200,
      max: 2500,
      step: 50,
      unit: "ms",
      section: "Timing",
    },
    {
      key: "fontWeight",
      label: "Counter Weight",
      type: "slider",
      min: 100,
      max: 900,
      step: 100,
      section: "Counter",
    },
    {
      key: "counterOffsetX",
      label: "Counter X",
      type: "slider",
      min: 0,
      max: 160,
      step: 2,
      unit: "px",
      section: "Counter",
    },
    {
      key: "counterOffsetY",
      label: "Counter Y",
      type: "slider",
      min: 0,
      max: 160,
      step: 2,
      unit: "px",
      section: "Counter",
    },
    { key: "showCounter", label: "Show Counter", type: "switch", section: "Counter" },
  ],
  stageClassName: "min-h-[560px]",
  render: (config, renderVersion) => {
    const props = config as unknown as React.ComponentProps<typeof FillPreloader>;
    return (
      <ReplayableStage title="Fill Preloader" runId={String(renderVersion)}>
        <FillPreloader {...props} />
      </ReplayableStage>
    );
  },
  intro: "Tune the rising fill color, speed, and counter placement.",
});

// ─── Editorial Wipe Preloader ───────────────────────────────────────────────

export const {
  Preview: EditorialWipePreloaderPlayground,
  PersonalizePanel: EditorialWipePreloaderPersonalizePanel,
} = createComponentPlayground({
  slug: "editorial-wipe-preloader",
  component: EditorialWipePreloader as unknown as React.ComponentType<
    Record<string, unknown>
  >,
  componentName: "EditorialWipePreloader",
  defaults: {
    duration: 3800,
    completionHold: 450,
    exitDuration: 900,
    darkColor: "#1A241E",
    lightColor: "#E4E0D7",
    accentColor: "#C7B39E",
    counterDarkColor: "#8A8A8A",
    counterLightColor: "#AAA0A1",
    showLoadingLabel: true,
    loadingLabel: "LOADING",
    startValue: 0,
    endValue: 100,
    mode: "container",
  },
  fields: [
    {
      key: "duration",
      label: "Load Duration",
      type: "slider",
      min: 800,
      max: 10000,
      step: 100,
      unit: "ms",
      section: "Timing",
    },
    {
      key: "completionHold",
      label: "Hold",
      type: "slider",
      min: 0,
      max: 2500,
      step: 50,
      unit: "ms",
      section: "Timing",
    },
    {
      key: "exitDuration",
      label: "Exit",
      type: "slider",
      min: 200,
      max: 3000,
      step: 50,
      unit: "ms",
      section: "Timing",
    },
    { key: "darkColor", label: "Dark Field", type: "color", section: "Color" },
    { key: "lightColor", label: "Reveal Surface", type: "color", section: "Color" },
    { key: "accentColor", label: "Edge Accent", type: "color", section: "Color" },
    {
      key: "counterDarkColor",
      label: "Counter On Dark",
      type: "color",
      section: "Color",
    },
    {
      key: "counterLightColor",
      label: "Counter On Light",
      type: "color",
      section: "Color",
    },
    {
      key: "loadingLabel",
      label: "Label",
      type: "text",
      section: "Content",
    },
    {
      key: "showLoadingLabel",
      label: "Show Label",
      type: "switch",
      section: "Content",
    },
    {
      key: "startValue",
      label: "Start Value",
      type: "slider",
      min: 0,
      max: 99,
      step: 1,
      section: "Counter",
    },
    {
      key: "endValue",
      label: "End Value",
      type: "slider",
      min: 1,
      max: 100,
      step: 1,
      section: "Counter",
    },
    {
      key: "mode",
      label: "Mode",
      type: "select",
      options: [
        { label: "Container", value: "container" },
        { label: "Viewport", value: "viewport" },
      ],
      section: "Layout",
    },
  ],
  stageClassName: "min-h-[560px]",
  render: (config, renderVersion) => {
    const props =
      config as unknown as React.ComponentProps<typeof EditorialWipePreloader>;
    return (
      <ReplayableStage
        title="Editorial Wipe Preloader"
        runId={String(renderVersion)}
      >
        <EditorialWipePreloader {...props} />
      </ReplayableStage>
    );
  },
  intro: "Compose the editorial wipe palette, copy, and counter range.",
});

// ─── Preloader Pro ──────────────────────────────────────────────────────────

export const {
  Preview: PreloaderProPlayground,
  PersonalizePanel: PreloaderProPersonalizePanel,
} = createComponentPlayground({
  slug: "preloader-pro",
  component: PreloaderPro as unknown as React.ComponentType<
    Record<string, unknown>
  >,
  componentName: "PreloaderPro",
  defaults: {
    mode: "preview",
    duration: 2200,
    completionHold: 180,
    exitDuration: 900,
    progressColor: "#D3001B",
    loaderBackground: "#FFFFFF",
    text: "DAVINCIUI",
    theme: "auto",
    showProgress: true,
    autoStart: true,
    loop: true,
  },
  fields: [
    { key: "text", label: "Hero Text", type: "text", section: "Content" },
    {
      key: "duration",
      label: "Load Duration",
      type: "slider",
      min: 500,
      max: 8000,
      step: 100,
      unit: "ms",
      section: "Timing",
    },
    {
      key: "completionHold",
      label: "Hold",
      type: "slider",
      min: 0,
      max: 2000,
      step: 50,
      unit: "ms",
      section: "Timing",
    },
    {
      key: "exitDuration",
      label: "Exit",
      type: "slider",
      min: 200,
      max: 2500,
      step: 50,
      unit: "ms",
      section: "Timing",
    },
    { key: "progressColor", label: "Progress", type: "color", section: "Color" },
    {
      key: "loaderBackground",
      label: "Loader Panel",
      type: "color",
      section: "Color",
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
      section: "Color",
    },
    { key: "showProgress", label: "Show Progress", type: "switch", section: "Content" },
    { key: "autoStart", label: "Auto Start", type: "switch", section: "Playback" },
    { key: "loop", label: "Loop", type: "switch", section: "Playback" },
  ],
  stageClassName: "min-h-[560px]",
  render: (config, renderVersion) => {
    const props = config as unknown as React.ComponentProps<typeof PreloaderPro>;
    return (
      <ReplayableStage title="Preloader Pro" runId={String(renderVersion)}>
        <PreloaderPro {...props} />
      </ReplayableStage>
    );
  },
  intro: "Edit the hero word, progress line, and replay behavior.",
});
