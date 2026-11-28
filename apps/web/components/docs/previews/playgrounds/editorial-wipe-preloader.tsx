"use client";

import * as React from "react";
import { EditorialWipePreloader } from "@workspace/ui/components/editorial-wipe-preloader";
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
