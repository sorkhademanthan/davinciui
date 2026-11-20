"use client";

import { AshReveal } from "@workspace/ui/components/burn-plus";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import type {
  BurnPlusDirection,
  BurnPlusFit,
  BurnPlusTransition,
  BurnPlusTrigger,
} from "@workspace/ui/components/burn-plus";
import { create } from "zustand";
import { configEquals, isDarkPreviewTheme, usePlaygroundStore } from "@/hooks/use-playground-store";
import { CustomizePanel, type CustomizeControl } from "@/components/customize-panel";
import { cn } from "@/lib/utils";

type BurnPlusConfig = {
  burn: number;
  density: number;
  distortion: number;
  edgeSoftness: number;
  noiseScale: number;
  octaves: number;
  seed: number;
  edgeComplexity: number;
  start: number;
  end: number;
  completeAt: number;
  duration: number;
  delay: number;
  loop: boolean;
  loopDelay: number;
  invert: boolean;
  autoplay: boolean;
  fit: BurnPlusFit;
  trigger: BurnPlusTrigger;
  direction: BurnPlusDirection;
  transition: BurnPlusTransition;
  background: string;
};

const DEFAULT_CONFIG: BurnPlusConfig = {
  burn: 0,
  density: 0.18,
  distortion: 0.12,
  edgeSoftness: 0.22,
  noiseScale: 1,
  octaves: 4,
  seed: 1,
  edgeComplexity: 0.05,
  start: 0.08,
  end: 0.72,
  completeAt: 0.72,
  duration: 3200,
  delay: 0,
  loop: true,
  loopDelay: 1400,
  invert: false,
  autoplay: true,
  fit: "cover",
  trigger: "load",
  direction: "reveal",
  transition: "easeInOut",
  background: "#000000",
};

const useBurnPlusStore = create<{
  config: BurnPlusConfig;
  update: (next: Partial<BurnPlusConfig>) => void;
  reset: () => void;
}>((set) => ({
  config: DEFAULT_CONFIG,
  update: (next) => set((state) => ({ config: { ...state.config, ...next } })),
  reset: () => set({ config: DEFAULT_CONFIG }),
}));

function generateCode(config: BurnPlusConfig) {
  const background =
    !isDarkPreviewTheme() && config.background === DEFAULT_CONFIG.background
      ? "#f5f5f4"
      : config.background;
  return `import { AshReveal } from "@/components/ui/burn-plus"

<AshReveal
  burn={${config.burn}}
  density={${config.density}}
  distortion={${config.distortion}}
  edgeSoftness={${config.edgeSoftness}}
  noiseScale={${config.noiseScale}}
  octaves={${config.octaves}}
  seed={${config.seed}}
  edgeComplexity={${config.edgeComplexity}}
  start={${config.start}}
  end={${config.end}}
  completeAt={${config.completeAt}}
  duration={${config.duration}}
  delay={${config.delay}}
  loop={${config.loop}}
  loopDelay={${config.loopDelay}}
  invert={${config.invert}}
  autoplay={${config.autoplay}}
  fit=${JSON.stringify(config.fit)}
  trigger=${JSON.stringify(config.trigger)}
  direction=${JSON.stringify(config.direction)}
  transition=${JSON.stringify(config.transition)}
  background=${JSON.stringify(background)}
  media="/images/spiral-3d-slider/orange-haze.webp"
/>`;
}

export function BurnPlusPreview() {
  const config = useBurnPlusStore((state) => state.config);
  const [runId, setRunId] = useState(0);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";
  // Follow the theme until the user picks a custom burn background.
  const resolvedBackground =
    !isDark && config.background === DEFAULT_CONFIG.background
      ? "#f5f5f4"
      : config.background;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const api = usePlaygroundStore.getState();
      api.registerPreviewReset("burn-plus", () => useBurnPlusStore.getState().reset());
      api.setPersonalizedCode("burn-plus", generateCode(config), !configEquals(config, DEFAULT_CONFIG));
    }, 180);
    return () => window.clearTimeout(timer);
  }, [config]);

  return (
    <section
      className={cn(
        "h-full min-h-0 w-full overflow-hidden transition-colors duration-500",
        isDark ? "bg-black" : "bg-[#f5f5f4]",
      )}
      style={{ containerType: "inline-size" }}
    >
      <AshReveal
        key={`${runId}-${resolvedBackground}`}
        {...config}
        background={resolvedBackground}
        className="h-full min-h-0 w-full"
        media="/images/spiral-3d-slider/orange-haze.webp"
        fit="fill"
        ariaLabel="Burn reveal demo — portrait emerging through an organic burn mask"
      />
      <button
        type="button"
        onClick={() => setRunId((value) => value + 1)}
        className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/25 bg-black/70 px-4 py-2 text-xs font-medium text-white shadow-lg backdrop-blur-md transition-colors hover:bg-black/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        Replay animation
      </button>
    </section>
  );
}

const CONTROLS: CustomizeControl[] = [
  { type: "slider", key: "burn", label: "Burn", min: 0, max: 1, step: 0.01 },
  { type: "slider", key: "density", label: "Density", min: 0, max: 1, step: 0.01 },
  { type: "slider", key: "distortion", label: "Distortion", min: 0, max: 1, step: 0.01 },
  {
    type: "select",
    key: "fit",
    label: "Media fit",
    options: [
      { label: "Cover", value: "cover" },
      { label: "Contain", value: "contain" },
      { label: "Fill", value: "fill" },
    ],
  },
  { type: "slider", key: "edgeSoftness", label: "Edge softness", min: 0, max: 1, step: 0.01, advanced: true },
  { type: "slider", key: "noiseScale", label: "Noise scale", min: 0.25, max: 4, step: 0.05, advanced: true },
  { type: "slider", key: "octaves", label: "Octaves", min: 1, max: 5, step: 1, advanced: true },
  { type: "slider", key: "seed", label: "Seed", min: 0, max: 10, step: 0.5, advanced: true },
  { type: "slider", key: "edgeComplexity", label: "Edge complexity", min: 0, max: 1, step: 0.01, advanced: true },
  { type: "slider", key: "start", label: "Start", min: 0, max: 1, step: 0.01, advanced: true },
  { type: "slider", key: "end", label: "End", min: 0, max: 1, step: 0.01, advanced: true },
  { type: "slider", key: "completeAt", label: "Clean completion", min: 0, max: 1, step: 0.01, advanced: true },
  { type: "toggle", key: "invert", label: "Invert mask", advanced: true },
  { type: "color", key: "background", label: "Background", defaultColor: DEFAULT_CONFIG.background, advanced: true },
  {
    type: "select",
    key: "trigger",
    label: "Trigger",
    options: [
      { label: "Manual", value: "manual" },
      { label: "Load", value: "load" },
      { label: "Hover", value: "hover" },
      { label: "Tap", value: "tap" },
      { label: "Inview", value: "inview" },
      { label: "Scroll", value: "scroll" },
    ],
  },
  {
    type: "select",
    key: "direction",
    label: "Direction",
    options: [
      { label: "Reveal", value: "reveal" },
      { label: "Hide", value: "hide" },
      { label: "Alternate", value: "alternate" },
    ],
  },
  {
    type: "select",
    key: "transition",
    label: "Transition",
    options: [
      { label: "Linear", value: "linear" },
      { label: "EaseIn", value: "easeIn" },
      { label: "EaseOut", value: "easeOut" },
      { label: "EaseInOut", value: "easeInOut" },
      { label: "Custom", value: "custom" },
    ],
  },
  { type: "slider", key: "duration", label: "Duration (ms)", min: 200, max: 6000, step: 50 },
  { type: "slider", key: "delay", label: "Delay (ms)", min: 0, max: 3000, step: 50 },
  { type: "toggle", key: "autoplay", label: "Autoplay" },
  { type: "toggle", key: "loop", label: "Loop" },
];

export function BurnPlusPersonalizePanel() {
  const config = useBurnPlusStore((state) => state.config);
  const update = useBurnPlusStore((state) => state.update);

  return (
    <CustomizePanel
      slug="burn-plus"
      controls={CONTROLS}
      values={config}
      defaults={DEFAULT_CONFIG}
      onChange={(key, value) => {
        if (key === "burn") {
          update({ burn: value as number, trigger: "manual" });
        } else if (key === "start") {
          const start = value as number;
          update({ start: Math.min(start, config.end) });
        } else if (key === "end") {
          const end = value as number;
          update({ end: Math.max(end, config.start) });
        } else {
          update({ [key]: value } as Partial<BurnPlusConfig>);
        }
      }}
      onReset={() => usePlaygroundStore.getState().resetPreview("burn-plus")}
    />
  );
}
