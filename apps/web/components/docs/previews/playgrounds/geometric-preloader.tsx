"use client";

import * as React from "react";
import { GeometricPreloader } from "@workspace/ui/components/geometric-preloader";
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
