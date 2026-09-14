"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { PixelFlow } from "@workspace/ui/components/pixel-flow";
import type { PixelFlowPresetName } from "@workspace/ui/components/pixel-flow";
import { PIXEL_FLOW_PRESETS } from "@workspace/ui/components/pixel-flow";
import { cn } from "@/lib/utils";
import { usePlaygroundStore } from "@/hooks/use-playground-store";
import {
  PlaygroundColorPicker,
  PlaygroundSectionTitle,
  PlaygroundSlider,
  PlaygroundSwitch,
} from "@/components/playground-primitives";

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
      usePlaygroundStore.getState().setCode(generateCode(config));
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
  const resetConfig = usePixelFlowPlaygroundStore(
    (state) => state.resetConfig,
  );
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = <K extends keyof PixelFlowPlaygroundConfig>(
    key: K,
    value: PixelFlowPlaygroundConfig[K],
  ) => {
    updateConfig({ [key]: value } as Partial<PixelFlowPlaygroundConfig>);
  };

  return (
    <div className="h-full overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="space-y-6 px-4 pb-10 pt-20">
        <header className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tighter text-foreground">
            Personalize
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground/90">
            Shape the pixel grid, flow, palette, and render quality in real
            time.
          </p>
        </header>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={resetConfig}
            className="rounded-md border border-border/40 bg-white/50 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground dark:bg-white/[0.03]"
          >
            Reset
          </button>
        </div>

        <div className="space-y-3">
          <PlaygroundSectionTitle>Presets</PlaygroundSectionTitle>
          <div className="grid grid-cols-2 gap-1.5">
            {PRESET_ORDER.map((preset) => {
              const active = config.preset === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={cn(
                    "rounded-md border px-2 py-2 font-mono text-[10px] uppercase tracking-wide transition-colors",
                    active
                      ? "border-foreground/25 text-foreground shadow-sm"
                      : "border-border/40 text-muted-foreground hover:text-foreground",
                  )}
                >
                  {PRESET_LABELS[preset]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <PlaygroundSectionTitle>Content</PlaygroundSectionTitle>
          <PlaygroundSlider
            label="Width (0 = fill)"
            min={0}
            max={1400}
            step={10}
            value={config.containerWidth}
            unit="px"
            onChange={(value) => handleChange("containerWidth", value)}
          />
          <PlaygroundSlider
            label="Height (0 = fill)"
            min={0}
            max={900}
            step={10}
            value={config.containerHeight}
            unit="px"
            onChange={(value) => handleChange("containerHeight", value)}
          />
        </div>

        <div className="space-y-3">
          <PlaygroundSectionTitle>Pixel Grid</PlaygroundSectionTitle>
          <PlaygroundSlider
            label="Pixel size"
            min={1}
            max={12}
            step={0.5}
            value={config.pixelSize}
            unit="px"
            onChange={(value) => handleChange("pixelSize", value)}
          />
          <PlaygroundSlider
            label="Dithering"
            min={0}
            max={1}
            step={0.01}
            value={config.ditherStrength}
            onChange={(value) => handleChange("ditherStrength", value)}
          />
          <PlaygroundSlider
            label="Dot strength"
            min={0}
            max={1}
            step={0.01}
            value={config.dotStrength}
            onChange={(value) => handleChange("dotStrength", value)}
          />
        </div>

        <div className="space-y-3">
          <PlaygroundSectionTitle>Motion</PlaygroundSectionTitle>
          <PlaygroundSlider
            label="Speed"
            min={0}
            max={2}
            step={0.05}
            value={config.speed}
            unit="×"
            onChange={(value) => handleChange("speed", value)}
          />
          <PlaygroundSlider
            label="Warp strength"
            min={0}
            max={2.5}
            step={0.05}
            value={config.warpStrength}
            onChange={(value) => handleChange("warpStrength", value)}
          />
        </div>

        <div className="space-y-3">
          <PlaygroundSectionTitle>Noise</PlaygroundSectionTitle>
          <PlaygroundSlider
            label="Noise scale"
            min={0.5}
            max={6}
            step={0.1}
            value={config.noiseScale}
            onChange={(value) => handleChange("noiseScale", value)}
          />
          <PlaygroundSlider
            label="Detail (octaves)"
            min={1}
            max={6}
            step={1}
            value={config.octaves}
            onChange={(value) => handleChange("octaves", value)}
          />
        </div>

        <div className="space-y-3">
          <PlaygroundSectionTitle>Colors</PlaygroundSectionTitle>
          <PlaygroundColorPicker
            label="Background"
            value={config.backgroundColor}
            onChange={(value) =>
              value && handleChange("backgroundColor", value)
            }
          />
          <PlaygroundColorPicker
            label="Shadow"
            value={config.shadowColor}
            onChange={(value) => value && handleChange("shadowColor", value)}
          />
          <PlaygroundColorPicker
            label="Primary"
            value={config.primaryColor}
            onChange={(value) => value && handleChange("primaryColor", value)}
          />
          <PlaygroundColorPicker
            label="Electric"
            value={config.electricColor}
            onChange={(value) => value && handleChange("electricColor", value)}
          />
          <PlaygroundColorPicker
            label="Secondary"
            value={config.secondaryColor}
            onChange={(value) => value && handleChange("secondaryColor", value)}
          />
          <PlaygroundColorPicker
            label="Highlight"
            value={config.highlightColor}
            onChange={(value) => value && handleChange("highlightColor", value)}
          />
        </div>

        <div className="space-y-3">
          <PlaygroundSectionTitle>Rendering</PlaygroundSectionTitle>
          <PlaygroundSlider
            label="Brightness"
            min={0.4}
            max={1.6}
            step={0.01}
            value={config.brightness}
            onChange={(value) => handleChange("brightness", value)}
          />
          <PlaygroundSlider
            label="Saturation"
            min={0}
            max={2}
            step={0.01}
            value={config.saturation}
            onChange={(value) => handleChange("saturation", value)}
          />
        </div>

        <div className="space-y-3">
          <PlaygroundSectionTitle>Behavior</PlaygroundSectionTitle>
          <PlaygroundSwitch
            label="Animate"
            checked={config.animate}
            onChange={(value) => handleChange("animate", value)}
          />
          <PlaygroundSwitch
            label="Pause when offscreen"
            checked={config.pauseWhenOffscreen}
            onChange={(value) => handleChange("pauseWhenOffscreen", value)}
          />
          <PlaygroundSwitch
            label="Respect reduced motion"
            checked={config.respectReducedMotion}
            onChange={(value) => handleChange("respectReducedMotion", value)}
          />
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setShowAdvanced((prev) => !prev)}
            aria-expanded={showAdvanced}
            className="flex w-full items-center justify-between rounded-md border border-border/70 p-2.5 text-sm text-foreground/90"
          >
            Advanced
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {showAdvanced ? "Hide" : "Show"}
            </span>
          </button>
          {showAdvanced && (
            <div className="space-y-3">
              <PlaygroundSlider
                label="Pixel density"
                min={0.4}
                max={2.5}
                step={0.05}
                value={config.pixelDensity}
                onChange={(value) => handleChange("pixelDensity", value)}
              />
              <PlaygroundSlider
                label="Dot size"
                min={0}
                max={0.6}
                step={0.01}
                value={config.dotSize}
                onChange={(value) => handleChange("dotSize", value)}
              />
              <PlaygroundSlider
                label="Flow strength"
                min={0}
                max={2.5}
                step={0.05}
                value={config.flowStrength}
                onChange={(value) => handleChange("flowStrength", value)}
              />
              <PlaygroundSlider
                label="Contrast"
                min={0.5}
                max={2.5}
                step={0.01}
                value={config.contrast}
                onChange={(value) => handleChange("contrast", value)}
              />
              <PlaygroundSlider
                label="Softness"
                min={0}
                max={1}
                step={0.01}
                value={config.softness}
                onChange={(value) => handleChange("softness", value)}
              />
              <PlaygroundSlider
                label="Quality"
                min={0.25}
                max={1}
                step={0.05}
                value={config.quality}
                onChange={(value) => handleChange("quality", value)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
