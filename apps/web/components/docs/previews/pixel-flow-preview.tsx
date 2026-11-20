"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { PixelFlow } from "@workspace/ui/components/pixel-flow";
import type { PixelFlowPresetName } from "@workspace/ui/components/pixel-flow";
import { PIXEL_FLOW_PRESETS } from "@workspace/ui/components/pixel-flow";
import { configEquals, usePlaygroundStore } from "@/hooks/use-playground-store";
import {
  CustomizePanel,
  bindCustomizeUpdate,
  type CustomizeControl,
} from "@/components/customize-panel";

const PRESET_ORDER: PixelFlowPresetName[] = [
  "reference-purple",
  "monochrome",
  "electric-blue",
  "aurora",
  "warm",
];

const PRESET_LABELS: Record<PixelFlowPresetName, string> = {
  "reference-purple": "Reference Purple",
  monochrome: "Monochrome",
  "electric-blue": "Electric Blue",
  aurora: "Aurora",
  warm: "Warm",
};

interface PixelFlowPlaygroundConfig {
  preset: PixelFlowPresetName;
  containerWidth: number;
  containerHeight: number;
  pixelSize: number;
  pixelDensity: number;
  dotSize: number;
  dotStrength: number;
  ditherStrength: number;
  speed: number;
  flowStrength: number;
  warpStrength: number;
  noiseScale: number;
  octaves: number;
  contrast: number;
  softness: number;
  backgroundColor: string;
  shadowColor: string;
  primaryColor: string;
  electricColor: string;
  secondaryColor: string;
  highlightColor: string;
  brightness: number;
  saturation: number;
  quality: number;
  animate: boolean;
  pauseWhenOffscreen: boolean;
  respectReducedMotion: boolean;
}

function configForPreset(preset: PixelFlowPresetName): PixelFlowPlaygroundConfig {
  const palette = PIXEL_FLOW_PRESETS[preset];
  return {
    preset,
    containerWidth: 0,
    containerHeight: 0,
    pixelSize: 4,
    pixelDensity: 1,
    dotSize: 0.2,
    dotStrength: 0.12,
    ditherStrength: 1,
    speed: 0.75,
    flowStrength: 1,
    warpStrength: 1,
    noiseScale: palette.noiseScale,
    octaves: 4,
    contrast: 1.25,
    softness: 0.65,
    backgroundColor: palette.backgroundColor,
    shadowColor: palette.shadowColor,
    primaryColor: palette.primaryColor,
    electricColor: palette.electricColor,
    secondaryColor: palette.secondaryColor,
    highlightColor: palette.highlightColor,
    brightness: 1,
    saturation: 0.92,
    quality: 1,
    animate: true,
    pauseWhenOffscreen: true,
    respectReducedMotion: true,
  };
}

const PIXEL_FLOW_DEFAULT_CONFIG = configForPreset("reference-purple");

const CONTROLS: CustomizeControl[] = [
  { type: "slider", key: "containerWidth", label: "Width", min: 0, max: 1400, step: 10, unit: "px", group: "Content" },
  { type: "slider", key: "containerHeight", label: "Height", min: 0, max: 900, step: 10, unit: "px", group: "Content" },
  { type: "slider", key: "pixelSize", label: "Pixel size", min: 1, max: 12, step: 0.5, unit: "px", group: "Pixel grid" },
  { type: "slider", key: "ditherStrength", label: "Dithering", min: 0, max: 1, step: 0.01, group: "Pixel grid" },
  { type: "slider", key: "dotStrength", label: "Dot strength", min: 0, max: 1, step: 0.01, group: "Pixel grid" },
  { type: "slider", key: "speed", label: "Speed", min: 0, max: 2, step: 0.05, unit: "x", group: "Motion" },
  { type: "slider", key: "warpStrength", label: "Warp strength", min: 0, max: 2.5, step: 0.05, group: "Motion" },
  { type: "slider", key: "noiseScale", label: "Noise scale", min: 0.5, max: 6, step: 0.1, group: "Noise" },
  { type: "slider", key: "octaves", label: "Detail", min: 1, max: 6, step: 1, group: "Noise" },
  { type: "color", key: "backgroundColor", label: "Background", defaultColor: PIXEL_FLOW_DEFAULT_CONFIG.backgroundColor, group: "Colors" },
  { type: "color", key: "shadowColor", label: "Shadow", defaultColor: PIXEL_FLOW_DEFAULT_CONFIG.shadowColor, group: "Colors" },
  { type: "color", key: "primaryColor", label: "Primary", defaultColor: PIXEL_FLOW_DEFAULT_CONFIG.primaryColor, group: "Colors" },
  { type: "color", key: "electricColor", label: "Electric", defaultColor: PIXEL_FLOW_DEFAULT_CONFIG.electricColor, group: "Colors" },
  { type: "color", key: "secondaryColor", label: "Secondary", defaultColor: PIXEL_FLOW_DEFAULT_CONFIG.secondaryColor, group: "Colors" },
  { type: "color", key: "highlightColor", label: "Highlight", defaultColor: PIXEL_FLOW_DEFAULT_CONFIG.highlightColor, group: "Colors" },
  { type: "slider", key: "brightness", label: "Brightness", min: 0.4, max: 1.6, step: 0.01, group: "Rendering" },
  { type: "slider", key: "saturation", label: "Saturation", min: 0, max: 2, step: 0.01, group: "Rendering" },
  { type: "toggle", key: "animate", label: "Animate", group: "Behavior" },
  { type: "toggle", key: "pauseWhenOffscreen", label: "Pause offscreen", group: "Behavior" },
  { type: "toggle", key: "respectReducedMotion", label: "Reduced motion", group: "Behavior" },
  { type: "slider", key: "pixelDensity", label: "Pixel density", min: 0.4, max: 2.5, step: 0.05, advanced: true },
  { type: "slider", key: "dotSize", label: "Dot size", min: 0, max: 0.6, step: 0.01, advanced: true },
  { type: "slider", key: "flowStrength", label: "Flow strength", min: 0, max: 2.5, step: 0.05, advanced: true },
  { type: "slider", key: "contrast", label: "Contrast", min: 0.5, max: 2.5, step: 0.01, advanced: true },
  { type: "slider", key: "softness", label: "Softness", min: 0, max: 1, step: 0.01, advanced: true },
  { type: "slider", key: "quality", label: "Quality", min: 0.25, max: 1, step: 0.05, advanced: true },
];

interface PixelFlowPlaygroundStore {
  config: PixelFlowPlaygroundConfig;
  updateConfig: (updates: Partial<PixelFlowPlaygroundConfig>) => void;
  applyPreset: (preset: PixelFlowPresetName) => void;
  resetConfig: () => void;
}

const usePixelFlowPlaygroundStore = create<PixelFlowPlaygroundStore>(
  (set) => ({
    config: PIXEL_FLOW_DEFAULT_CONFIG,
    updateConfig: (updates) =>
      set((state) => ({
        config: { ...state.config, ...updates },
      })),
    applyPreset: (preset) => set({ config: configForPreset(preset) }),
    resetConfig: () => set({ config: PIXEL_FLOW_DEFAULT_CONFIG }),
  }),
);

function generateCode(config: PixelFlowPlaygroundConfig) {
  return `import { PixelFlow } from "@/components/ui/pixel-flow"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl">
  <PixelFlow
    preset="${config.preset}"
    pixelSize={${config.pixelSize}}
    pixelDensity={${config.pixelDensity}}
    dotSize={${config.dotSize}}
    dotStrength={${config.dotStrength}}
    ditherStrength={${config.ditherStrength}}
    speed={${config.speed}}
    flowStrength={${config.flowStrength}}
    warpStrength={${config.warpStrength}}
    noiseScale={${config.noiseScale}}
    octaves={${config.octaves}}
    contrast={${config.contrast}}
    softness={${config.softness}}
    backgroundColor="${config.backgroundColor}"
    shadowColor="${config.shadowColor}"
    primaryColor="${config.primaryColor}"
    electricColor="${config.electricColor}"
    secondaryColor="${config.secondaryColor}"
    highlightColor="${config.highlightColor}"
    brightness={${config.brightness}}
    saturation={${config.saturation}}
    quality={${config.quality}}
  />
  <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6">
    <span className="whitespace-nowrap font-black uppercase leading-none tracking-[-0.055em] text-white text-[clamp(3rem,8.5vw,6rem)]">
      DAVINCIUI
    </span>
  </div>
</div>`;
}

export function PixelFlowPlayground() {
  const config = usePixelFlowPlaygroundStore((state) => state.config);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const api = usePlaygroundStore.getState();
      api.registerPreviewReset("pixel-flow", () => usePixelFlowPlaygroundStore.getState().resetConfig());
      api.setPersonalizedCode("pixel-flow", generateCode(config), !configEquals(config, PIXEL_FLOW_DEFAULT_CONFIG));
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [config]);

  return (
    <div
      className="flex h-full w-full items-center justify-center overflow-hidden bg-[#0d0820]"
      style={{ containerType: "inline-size" }}
    >
      <div
        className="relative h-full w-full overflow-hidden"
        style={{
          width:
            config.containerWidth > 0 ? `${config.containerWidth}px` : "100%",
          height:
            config.containerHeight > 0
              ? `${config.containerHeight}px`
              : "100%",
          maxWidth: "100%",
          maxHeight: "100%",
          backgroundColor: config.backgroundColor,
        }}
      >
        <PixelFlow
          className="h-full min-h-full w-full"
          preset={config.preset}
          pixelSize={config.pixelSize}
          pixelDensity={config.pixelDensity}
          dotSize={config.dotSize}
          dotStrength={config.dotStrength}
          ditherStrength={config.ditherStrength}
          speed={config.speed}
          flowStrength={config.flowStrength}
          warpStrength={config.warpStrength}
          noiseScale={config.noiseScale}
          octaves={config.octaves}
          contrast={config.contrast}
          softness={config.softness}
          backgroundColor={config.backgroundColor}
          shadowColor={config.shadowColor}
          primaryColor={config.primaryColor}
          electricColor={config.electricColor}
          secondaryColor={config.secondaryColor}
          highlightColor={config.highlightColor}
          brightness={config.brightness}
          saturation={config.saturation}
          quality={config.quality}
          animate={config.animate}
          pauseWhenOffscreen={config.pauseWhenOffscreen}
          respectReducedMotion={config.respectReducedMotion}
        />
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6">
          <span
            className="whitespace-nowrap font-black uppercase leading-none tracking-[-0.055em] text-white text-[clamp(3rem,8.5vw,6rem)]"
            style={{
              WebkitTextStroke: "0.7px rgba(5, 8, 12, 0.55)",
              textShadow: "0 4px 24px rgba(0, 0, 0, 0.55)",
            }}
          >
            DAVINCIUI
          </span>
        </div>
      </div>
    </div>
  );
}

export function PixelFlowPersonalizePanel() {
  const config = usePixelFlowPlaygroundStore((state) => state.config);
  const updateConfig = usePixelFlowPlaygroundStore(
    (state) => state.updateConfig,
  );
  const applyPreset = usePixelFlowPlaygroundStore(
    (state) => state.applyPreset,
  );

  return (
    <CustomizePanel
      slug="pixel-flow"
      controls={CONTROLS}
      values={config}
      defaults={PIXEL_FLOW_DEFAULT_CONFIG}
      onChange={bindCustomizeUpdate(updateConfig)}
      onReset={() => usePlaygroundStore.getState().resetPreview("pixel-flow")}
      presets={PRESET_ORDER.map((preset) => ({
        label: PRESET_LABELS[preset],
        value: preset,
      }))}
      activePreset={config.preset}
      onPresetChange={(preset) => applyPreset(preset as PixelFlowPresetName)}
    />
  );
}
