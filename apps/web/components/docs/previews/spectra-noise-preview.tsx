"use client";

import { SpectraNoise } from "@workspace/ui/components/spectra-noise";
import { create } from "zustand";
import {
  PlaygroundColorPicker,
  PlaygroundSectionTitle,
  PlaygroundSlider,
  PlaygroundSwitch,
} from "@/components/playground-primitives";

type SpectraNoiseConfig = {
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

const useSpectraNoiseStore = create<{
  config: SpectraNoiseConfig;
  update: (next: Partial<SpectraNoiseConfig>) => void;
  reset: () => void;
}>((set) => ({
  config: DEFAULT_CONFIG,
  update: (next) => set((state) => ({ config: { ...state.config, ...next } })),
  reset: () => set({ config: DEFAULT_CONFIG }),
}));

export function SpectraNoisePreview() {
  const config = useSpectraNoiseStore((state) => state.config);

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
  const reset = useSpectraNoiseStore((state) => state.reset);

  return (
    <div className="h-full overflow-auto bg-background [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="space-y-7 px-4 pb-12 pt-20">
        <header className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tighter text-foreground">
            Personalize
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground/90">
            Recolor the spectrum, bend the field, and tune the film texture.
          </p>
        </header>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={reset}
            className="rounded-md border border-border/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Reset
          </button>
        </div>

        <section className="space-y-3">
          <PlaygroundSectionTitle>Color</PlaygroundSectionTitle>
          <PlaygroundColorPicker
            label="Glow color"
            value={config.glowColor}
            onChange={(glowColor) => update({ glowColor })}
            defaultColor={DEFAULT_CONFIG.glowColor}
          />
          <PlaygroundColorPicker
            label="Highlight color"
            value={config.highlightColor}
            onChange={(highlightColor) => update({ highlightColor })}
            defaultColor={DEFAULT_CONFIG.highlightColor}
          />
          <PlaygroundSlider
            label="Hue shift"
            min={0}
            max={360}
            step={1}
            unit="°"
            value={config.hueShift}
            onChange={(hueShift) => update({ hueShift })}
          />
          <PlaygroundSlider
            label="Effect intensity"
            min={0}
            max={2}
            step={0.05}
            value={config.effectIntensity}
            onChange={(effectIntensity) => update({ effectIntensity })}
          />
          <PlaygroundColorPicker
            label="Background"
            value={config.backgroundColor}
            onChange={(backgroundColor) => update({ backgroundColor })}
            defaultColor={DEFAULT_CONFIG.backgroundColor}
          />
        </section>

        <section className="space-y-3">
          <PlaygroundSectionTitle>Texture</PlaygroundSectionTitle>
          <PlaygroundSlider
            label="Noise intensity"
            min={0}
            max={1}
            step={0.01}
            value={config.noiseIntensity}
            onChange={(noiseIntensity) => update({ noiseIntensity })}
          />
        </section>

        <section className="space-y-3">
          <PlaygroundSectionTitle>Scanlines</PlaygroundSectionTitle>
          <PlaygroundSlider
            label="Scanline density"
            min={0.2}
            max={3}
            step={0.05}
            value={config.scanlineDensity}
            onChange={(scanlineDensity) => update({ scanlineDensity })}
          />
          <PlaygroundSlider
            label="Scanline intensity"
            min={0}
            max={1}
            step={0.01}
            value={config.scanlineIntensity}
            onChange={(scanlineIntensity) => update({ scanlineIntensity })}
          />
        </section>

        <section className="space-y-3">
          <PlaygroundSectionTitle>Distortion</PlaygroundSectionTitle>
          <PlaygroundSlider
            label="Warp amount"
            min={0}
            max={2}
            step={0.05}
            value={config.warpAmount}
            onChange={(warpAmount) => update({ warpAmount })}
          />
          <PlaygroundSlider
            label="Seed"
            min={0}
            max={100}
            step={1}
            value={config.seed}
            onChange={(seed) => update({ seed })}
          />
        </section>

        <section className="space-y-3">
          <PlaygroundSectionTitle>Motion</PlaygroundSectionTitle>
          <PlaygroundSlider
            label="Animation speed"
            min={0}
            max={3}
            step={0.05}
            value={config.animationSpeed}
            onChange={(animationSpeed) => update({ animationSpeed })}
          />
          <PlaygroundSwitch
            label="Paused"
            checked={config.paused}
            onChange={(paused) => update({ paused })}
          />
        </section>

        <section className="space-y-3">
          <PlaygroundSectionTitle>Rendering</PlaygroundSectionTitle>
          <PlaygroundSlider
            label="Resolution scale"
            min={0.5}
            max={1.5}
            step={0.25}
            value={config.resolutionScale}
            onChange={(resolutionScale) => update({ resolutionScale })}
          />
        </section>
      </div>
    </div>
  );
}
