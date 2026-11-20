"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { create } from "zustand";
import { configEquals, usePlaygroundStore } from "@/hooks/use-playground-store";
import { AmbientAudioToggle } from "@workspace/ui/components/ambient-audio-toggle";
import { CustomizePanel, type CustomizeControl } from "@/components/customize-panel";

type AmbientAudioToggleConfig = {
  visualizer: "wave" | "bars";
  volume: number;
  loop: boolean;
  activeColor: string;
  inactiveColor: string;
  playingColor: string;
  pausedColor: string;
  labelPlaying: string;
  labelPaused: string;
  hideLabel: boolean;
  labelPosition: "left" | "right" | "above" | "below";
  labelGap: number;
  waveformWidth: number;
  waveformHeight: number;
  lineWeight: number;
  lineCap: "round" | "square";
  barCount: number;
  pausedAmount: number;
  animationSpeed: number;
  intensity: number;
  transition: number;
};

const DEFAULT_CONFIG: AmbientAudioToggleConfig = {
  visualizer: "wave",
  volume: 65,
  loop: true,
  activeColor: "#a7f3d0",
  inactiveColor: "#64748b",
  playingColor: "#f8fafc",
  pausedColor: "#94a3b8",
  labelPlaying: "Playing",
  labelPaused: "Play ambient audio",
  hideLabel: false,
  labelPosition: "right",
  labelGap: 10,
  waveformWidth: 148,
  waveformHeight: 44,
  lineWeight: 2.4,
  lineCap: "round",
  barCount: 28,
  pausedAmount: 0.2,
  animationSpeed: 1.1,
  intensity: 1,
  transition: 0.35,
};

type AmbientAudioColorKey =
  | "activeColor"
  | "inactiveColor"
  | "playingColor"
  | "pausedColor";

const LIGHT_COLOR_DEFAULTS: Record<AmbientAudioColorKey, string> = {
  activeColor: "#047857",
  inactiveColor: "#94a3b8",
  playingColor: "#09090b",
  pausedColor: "#64748b",
};

const DARK_COLOR_DEFAULTS: Record<AmbientAudioColorKey, string> = {
  activeColor: "#a7f3d0",
  inactiveColor: "#64748b",
  playingColor: "#f8fafc",
  pausedColor: "#94a3b8",
};

const useAmbientAudioToggleStore = create<{
  config: AmbientAudioToggleConfig;
  touchedColors: Record<AmbientAudioColorKey, boolean>;
  update: (next: Partial<AmbientAudioToggleConfig>) => void;
  updateColor: (key: AmbientAudioColorKey, value: string) => void;
  reset: () => void;
}>((set) => ({
  config: DEFAULT_CONFIG,
  touchedColors: {
    activeColor: false,
    inactiveColor: false,
    playingColor: false,
    pausedColor: false,
  },
  update: (next) => set((state) => ({ config: { ...state.config, ...next } })),
  updateColor: (key, value) =>
    set((state) => ({
      config: { ...state.config, [key]: value },
      touchedColors: { ...state.touchedColors, [key]: true },
    })),
  reset: () =>
    set({
      config: DEFAULT_CONFIG,
      touchedColors: {
        activeColor: false,
        inactiveColor: false,
        playingColor: false,
        pausedColor: false,
      },
    }),
}));

function generateCode(
  config: AmbientAudioToggleConfig,
  touchedColors: Record<AmbientAudioColorKey, boolean>,
  themeDefaults: Record<AmbientAudioColorKey, string>,
) {
  const color = (key: AmbientAudioColorKey) =>
    touchedColors[key] ? config[key] : themeDefaults[key];
  return `import { AmbientAudioToggle } from "@/components/ui/ambient-audio-toggle"

<AmbientAudioToggle
  src="/audio/ambient-music.mp3"
  persistenceKey="site-ambient-track"
  loop={${config.loop}}
  volume={${config.volume}}
  visualizer=${JSON.stringify(config.visualizer)}
  barCount={${config.barCount}}
  activeColor=${JSON.stringify(color("activeColor"))}
  inactiveColor=${JSON.stringify(color("inactiveColor"))}
  playingColor=${JSON.stringify(color("playingColor"))}
  pausedColor=${JSON.stringify(color("pausedColor"))}
  labelPlaying=${JSON.stringify(config.labelPlaying)}
  labelPaused=${JSON.stringify(config.labelPaused)}
  hideLabel={${config.hideLabel}}
  labelPosition=${JSON.stringify(config.labelPosition)}
  labelGap={${config.labelGap}}
  waveformWidth={${config.waveformWidth}}
  waveformHeight={${config.waveformHeight}}
  lineWeight={${config.lineWeight}}
  lineCap=${JSON.stringify(config.lineCap)}
  pausedAmount={${config.pausedAmount}}
  animationSpeed={${config.animationSpeed}}
  intensity={${config.intensity}}
  transition={${config.transition}}
/>`;
}

export function AmbientAudioTogglePreview() {
  const config = useAmbientAudioToggleStore((state) => state.config);
  const touchedColors = useAmbientAudioToggleStore(
    (state) => state.touchedColors,
  );
  const { resolvedTheme } = useTheme();
  const themeDefaults =
    resolvedTheme === "light" ? LIGHT_COLOR_DEFAULTS : DARK_COLOR_DEFAULTS;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const api = usePlaygroundStore.getState();
      api.registerPreviewReset("ambient-audio-toggle", () => useAmbientAudioToggleStore.getState().reset());
      api.setPersonalizedCode(
        "ambient-audio-toggle",
        generateCode(config, touchedColors, themeDefaults),
        !configEquals(config, DEFAULT_CONFIG),
      );
    }, 180);
    return () => window.clearTimeout(timer);
  }, [config, touchedColors, themeDefaults]);

  return (
    <section
      className="relative flex h-full min-h-[560px] w-full flex-col items-center justify-center overflow-hidden bg-[#eef4f0] px-6 text-center dark:bg-[#101815]"
      style={{ containerType: "inline-size" }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(4,120,87,0.14),transparent_64%)] dark:bg-[radial-gradient(ellipse_at_50%_40%,rgba(70,132,104,0.32),transparent_64%)]" />
      <div className="relative flex items-center justify-center">
        <AmbientAudioToggle
          {...config}
          activeColor={
            touchedColors.activeColor
              ? config.activeColor
              : themeDefaults.activeColor
          }
          inactiveColor={
            touchedColors.inactiveColor
              ? config.inactiveColor
              : themeDefaults.inactiveColor
          }
          playingColor={
            touchedColors.playingColor
              ? config.playingColor
              : themeDefaults.playingColor
          }
          pausedColor={
            touchedColors.pausedColor
              ? config.pausedColor
              : themeDefaults.pausedColor
          }
          src="/audio/ambient-toggle-demo.wav"
          persistenceKey="davinciui-ambient-audio-preview"
          className="min-h-[64px] rounded-2xl px-5 py-3"
        />
      </div>
    </section>
  );
}

const CONTROLS: CustomizeControl[] = [
  { type: "slider", key: "volume", label: "Volume", min: 0, max: 100, step: 5, unit: "%" },
  { type: "toggle", key: "loop", label: "Loop track" },
  {
    type: "select",
    key: "visualizer",
    label: "Visualizer",
    options: [
      { label: "Wave", value: "wave" },
      { label: "Bars", value: "bars" },
    ],
  },
  { type: "slider", key: "barCount", label: "Bar count", min: 4, max: 80, step: 1 },
  { type: "slider", key: "waveformWidth", label: "Width", min: 24, max: 400, step: 1, unit: "px" },
  { type: "slider", key: "waveformHeight", label: "Height", min: 12, max: 120, step: 1, unit: "px" },
  { type: "slider", key: "lineWeight", label: "Line weight", min: 0.5, max: 12, step: 0.5, unit: "px" },
  {
    type: "select",
    key: "lineCap",
    label: "Line cap",
    options: [
      { label: "Round caps", value: "round" },
      { label: "Square caps", value: "square" },
    ],
  },
  { type: "color", key: "activeColor", label: "Active waveform" },
  { type: "color", key: "inactiveColor", label: "Inactive waveform" },
  { type: "color", key: "playingColor", label: "Playing label" },
  { type: "color", key: "pausedColor", label: "Paused label" },
  { type: "slider", key: "animationSpeed", label: "Speed", min: 0.25, max: 4, step: 0.05 },
  { type: "slider", key: "intensity", label: "Intensity", min: 0, max: 2, step: 0.05 },
  { type: "slider", key: "pausedAmount", label: "Paused amount", min: 0, max: 1, step: 0.01 },
  { type: "slider", key: "transition", label: "Transition", min: 0, max: 2, step: 0.05, unit: "s" },
  { type: "toggle", key: "hideLabel", label: "Hide label" },
  {
    type: "select",
    key: "labelPosition",
    label: "Position",
    options: [
      { label: "Left", value: "left" },
      { label: "Right", value: "right" },
      { label: "Above", value: "above" },
      { label: "Below", value: "below" },
    ],
  },
  { type: "slider", key: "labelGap", label: "Gap", min: 0, max: 40, step: 1, unit: "px" },
];

export function AmbientAudioTogglePersonalizePanel() {
  const config = useAmbientAudioToggleStore((state) => state.config);
  const touchedColors = useAmbientAudioToggleStore(
    (state) => state.touchedColors,
  );
  const update = useAmbientAudioToggleStore((state) => state.update);
  const updateColor = useAmbientAudioToggleStore((state) => state.updateColor);
  const { resolvedTheme } = useTheme();
  const themeDefaults =
    resolvedTheme === "light" ? LIGHT_COLOR_DEFAULTS : DARK_COLOR_DEFAULTS;
  const visibleColors: Record<AmbientAudioColorKey, string> = {
    activeColor: touchedColors.activeColor
      ? config.activeColor
      : themeDefaults.activeColor,
    inactiveColor: touchedColors.inactiveColor
      ? config.inactiveColor
      : themeDefaults.inactiveColor,
    playingColor: touchedColors.playingColor
      ? config.playingColor
      : themeDefaults.playingColor,
    pausedColor: touchedColors.pausedColor
      ? config.pausedColor
      : themeDefaults.pausedColor,
  };

  const controls = CONTROLS.map((control) =>
    control.type === "color"
      ? {
          ...control,
          defaultColor:
            themeDefaults[control.key as AmbientAudioColorKey],
        }
      : control,
  );

  return (
    <CustomizePanel
      slug="ambient-audio-toggle"
      controls={controls}
      values={{ ...config, ...visibleColors }}
      defaults={{ ...DEFAULT_CONFIG, ...themeDefaults }}
      onChange={(key, value) => {
        if (
          key === "activeColor" ||
          key === "inactiveColor" ||
          key === "playingColor" ||
          key === "pausedColor"
        ) {
          updateColor(key as AmbientAudioColorKey, value as string);
        } else {
          update({ [key]: value } as Partial<AmbientAudioToggleConfig>);
        }
      }}
      onReset={() => usePlaygroundStore.getState().resetPreview("ambient-audio-toggle")}
    />
  );
}
