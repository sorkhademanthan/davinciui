"use client";

import * as React from "react";
import { StaircasePreloader } from "@workspace/ui/components/staircase-preloader";
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
