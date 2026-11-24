"use client";

import { useEffect } from "react";

import { SpectraNoise } from "@workspace/ui/components/spectra-noise";
import type { SpectraNoisePresetName } from "@workspace/ui/components/spectra-noise";
import { create } from "zustand";
import { configEquals, usePlaygroundStore } from "@/hooks/use-playground-store";
import {
  CustomizePanel,
  bindCustomizeUpdate,
  type CustomizeControl,
} from "@/components/customize-panel";

type SpectraNoiseConfig = {
  preset: SpectraNoisePresetName;
  hueShift: number;
  noiseIntensity: number;
  scanlineDensity: number;
  scanlineIntensity: number;
  warpAmount: number;
  animationSpeed: number;
  resolutionScale: number;
  paused: boolean;
  seed: number;
  backgroundColor: string;
  glowColor: string;
  highlightColor: string;
  effectIntensity: number;
};

const DEFAULT_CONFIG: SpectraNoiseConfig = {
  preset: "default",
  hueShift: 0,
  noiseIntensity: 0.35,
  scanlineDensity: 1.5,
  scanlineIntensity: 0.25,
  warpAmount: 1,
  animationSpeed: 0.35,
  resolutionScale: 1,
  paused: false,
  seed: 7,
  backgroundColor: "#03090b",
  glowColor: "#127c74",
  highlightColor: "#c5f58a",
  effectIntensity: 1,
};

const SPECTRA_NOISE_PRESETS: Record<string, Partial<SpectraNoiseConfig>> = {
  default: { backgroundColor: "#03090b", glowColor: "#127c74", highlightColor: "#c5f58a" },
  emerald: { backgroundColor: "#020a06", glowColor: "#10b981", highlightColor: "#a7f3d0" },
  violet: { backgroundColor: "#0a0512", glowColor: "#7c3aed", highlightColor: "#ddd6fe" },
  sunset: { backgroundColor: "#1a0a0a", glowColor: "#f97316", highlightColor: "#fde68a" },
  mono: { backgroundColor: "#050505", glowColor: "#737373", highlightColor: "#e5e5e5" },
};

const CONTROLS: CustomizeControl[] = [
  { type: "select", key: "preset", label: "Preset", options: Object.keys(SPECTRA_NOISE_PRESETS).map((p) => ({ label: p, value: p })), group: "Preset" },
  { type: "color", key: "glowColor", label: "Glow", defaultColor: DEFAULT_CONFIG.glowColor, group: "Color" },
  { type: "color", key: "highlightColor", label: "Highlight", defaultColor: DEFAULT_CONFIG.highlightColor, group: "Color" },
  { type: "color", key: "backgroundColor", label: "Background", defaultColor: DEFAULT_CONFIG.backgroundColor, group: "Color" },
  { type: "slider", key: "hueShift", label: "Hue", min: 0, max: 360, step: 1, unit: "deg", group: "Color" },
  { type: "slider", key: "effectIntensity", label: "Effect", min: 0, max: 2, step: 0.05, group: "Color" },
  { type: "slider", key: "noiseIntensity", label: "Noise", min: 0, max: 1, step: 0.01, group: "Texture" },
  { type: "slider", key: "scanlineDensity", label: "Scanline density", min: 0.2, max: 3, step: 0.05, group: "Scanlines" },
  { type: "slider", key: "scanlineIntensity", label: "Scanline intensity", min: 0, max: 1, step: 0.01, group: "Scanlines" },
  { type: "slider", key: "warpAmount", label: "Warp", min: 0, max: 2, step: 0.05, group: "Distortion" },
  { type: "slider", key: "seed", label: "Seed", min: 0, max: 100, step: 1, group: "Distortion" },
  { type: "slider", key: "animationSpeed", label: "Speed", min: 0, max: 3, step: 0.05, group: "Motion" },
  { type: "slider", key: "resolutionScale", label: "Resolution", min: 0.5, max: 1.5, step: 0.25, group: "Rendering" },
  { type: "toggle", key: "paused", label: "Paused", group: "Motion" },
];

const useSpectraNoiseStore = create<{
  config: SpectraNoiseConfig;
  update: (next: Partial<SpectraNoiseConfig>) => void;
  reset: () => void;
  applyPreset: (preset: string) => void;
}>((set) => ({
  config: DEFAULT_CONFIG,
  update: (next) => set((state) => ({ config: { ...state.config, ...next } })),
  reset: () => set({ config: DEFAULT_CONFIG }),
  applyPreset: (preset) =>
    set((state) => ({
      config: { ...state.config, preset: preset as SpectraNoisePresetName, ...(SPECTRA_NOISE_PRESETS[preset] ?? {}) },
    })),
}));

function generateCode(config: SpectraNoiseConfig) {
  return `import { SpectraNoise } from "@/components/ui/spectra-noise"

<SpectraNoise
  hueShift={${config.hueShift}}
  noiseIntensity={${config.noiseIntensity}}
  scanlineDensity={${config.scanlineDensity}}
  scanlineIntensity={${config.scanlineIntensity}}
  warpAmount={${config.warpAmount}}
  animationSpeed={${config.animationSpeed}}
  resolutionScale={${config.resolutionScale}}
  paused={${config.paused}}
  seed={${config.seed}}
  preset=${JSON.stringify(config.preset)}
  backgroundColor=${JSON.stringify(config.backgroundColor)}
  glowColor=${JSON.stringify(config.glowColor)}
  highlightColor=${JSON.stringify(config.highlightColor)}
  effectIntensity={${config.effectIntensity}}
/>`;
}

export function SpectraNoisePreview() {
  const config = useSpectraNoiseStore((state) => state.config);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const api = usePlaygroundStore.getState();
      api.registerPreviewReset("spectra-noise", () => useSpectraNoiseStore.getState().reset());
      api.setPersonalizedCode("spectra-noise", generateCode(config), !configEquals(config, DEFAULT_CONFIG));
    }, 180);
    return () => window.clearTimeout(timer);
  }, [config]);

  return (
    <section
      className="relative h-full min-h-[560px] w-full overflow-hidden bg-[#030604]"
      style={{ containerType: "inline-size" }}
    >
      <SpectraNoise {...config} />

      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-5">
        <span
          className="whitespace-nowrap text-[clamp(1.75rem,12cqi,7rem)] font-black uppercase leading-none tracking-[-0.075em] text-white"
          style={{
            WebkitTextStroke: "1px rgba(3, 6, 4, 0.55)",
            textShadow: "0 8px 28px rgba(0, 0, 0, 0.55)",
          }}
        >
          DAVINCIUI
        </span>
      </div>
    </section>
  );
}

export function SpectraNoisePersonalizePanel() {
  const config = useSpectraNoiseStore((state) => state.config);
  const update = useSpectraNoiseStore((state) => state.update);

  return (
    <CustomizePanel
      slug="spectra-noise"
      controls={CONTROLS}
      values={config}
      defaults={DEFAULT_CONFIG}
      onChange={bindCustomizeUpdate(update)}
      onReset={() => usePlaygroundStore.getState().resetPreview("spectra-noise")}
      presets={Object.keys(SPECTRA_NOISE_PRESETS).map((preset) => ({ label: preset.charAt(0).toUpperCase() + preset.slice(1), value: preset }))}
      activePreset={config.preset}
      onPresetChange={(preset) => useSpectraNoiseStore.getState().applyPreset(preset)}
    />
  );
}
