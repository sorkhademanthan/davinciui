"use client";

import * as React from "react";
import { PreloaderPro } from "@workspace/ui/components/cinematic-panel-preloader";
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

// ─── Preloader Pro ──────────────────────────────────────────────────────────

export const {
  Preview: PreloaderProPlayground,
  PersonalizePanel: PreloaderProPersonalizePanel,
} = createComponentPlayground({
  slug: "cinematic-panel-preloader",
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
      <ReplayableStage title="Cinematic Panel Preloader" runId={String(renderVersion)}>
        <PreloaderPro {...props} />
      </ReplayableStage>
    );
  },
  intro: "Edit the hero word, progress line, and replay behavior.",
});
