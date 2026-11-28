"use client";

import * as React from "react";
import { FillPreloader } from "@workspace/ui/components/fill-preloader";
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
