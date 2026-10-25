"use client";

import { useEffect } from "react";

import { SunlightEffect } from "@workspace/ui/components/sunlight-effect";
import { create } from "zustand";
import { configEquals, usePlaygroundStore } from "@/hooks/use-playground-store";
import {
  PlaygroundColorPicker,
  PlaygroundSectionTitle,
  PlaygroundSlider,
} from "@/components/playground-primitives";

type SunlightEffectConfig = {
  colors: [string, string, string, string, string];
  backgroundColor: string;
  bloomColor: string;
  bloom: number;
  intensity: number;
  density: number;
  spotty: number;
  midSize: number;
  midIntensity: number;
  speed: number;
  scale: number;
  rotation: number;
  offsetX: number;
  offsetY: number;
};

const DEFAULT_CONFIG: SunlightEffectConfig = {
  colors: ["#55ffad", "#27ffc6", "#d4ff58", "#f4ffd2", "#00df9d"],
  backgroundColor: "#020b07",
  bloomColor: "#6dff94",
  bloom: 1.12,
  intensity: 1.35,
  density: 1,
  spotty: 0.18,
  midSize: 0.82,
  midIntensity: 1.72,
  speed: 1.2,
  scale: 1,
  rotation: 0,
  offsetX: 0,
  offsetY: 0,
};

const useSunlightEffectStore = create<{
  config: SunlightEffectConfig;
  update: (next: Partial<SunlightEffectConfig>) => void;
  setColor: (index: number, color: string) => void;
  reset: () => void;
}>((set) => ({
  config: DEFAULT_CONFIG,
  update: (next) => set((state) => ({ config: { ...state.config, ...next } })),
  setColor: (index, color) =>
    set((state) => {
      const colors = [...state.config.colors] as SunlightEffectConfig["colors"];
      colors[index] = color;
      return { config: { ...state.config, colors } };
    }),
  reset: () => set({ config: DEFAULT_CONFIG }),
}));

function generateCode(config: SunlightEffectConfig) {
  return `import { SunlightEffect } from "@/components/ui/sunlight-effect"

<SunlightEffect
  colors={${JSON.stringify(config.colors)}}
  backgroundColor=${JSON.stringify(config.backgroundColor)}
  bloomColor=${JSON.stringify(config.bloomColor)}
  bloom={${config.bloom}}
  intensity={${config.intensity}}
  density={${config.density}}
  spotty={${config.spotty}}
  midSize={${config.midSize}}
  midIntensity={${config.midIntensity}}
  speed={${config.speed}}
  scale={${config.scale}}
  rotation={${config.rotation}}
  offsetX={${config.offsetX}}
  offsetY={${config.offsetY}}
/>`;
}

export function SunlightEffectPreview() {
  const config = useSunlightEffectStore((state) => state.config);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const api = usePlaygroundStore.getState();
      api.registerPreviewReset("sunlight-effect", () => useSunlightEffectStore.getState().reset());
      api.setPersonalizedCode("sunlight-effect", generateCode(config), !configEquals(config, DEFAULT_CONFIG));
    }, 180);
    return () => window.clearTimeout(timer);
  }, [config]);

  return (
    <section
      className="relative h-full min-h-[560px] w-full overflow-hidden bg-[#020b07]"
      style={{ containerType: "inline-size" }}
    >
      <SunlightEffect {...config} />
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-5">
        <span
          className="whitespace-nowrap text-[clamp(2.15rem,14cqi,8.5rem)] font-black uppercase leading-none tracking-[-0.075em] text-[#efffd9]"
          style={{
            WebkitTextStroke: "1px rgba(2, 11, 7, 0.62)",
            textShadow: "0 8px 30px rgba(0, 0, 0, 0.52)",
          }}
        >
          DAVINCIUI
        </span>
      </div>
    </section>
  );
}

export function SunlightEffectPersonalizePanel() {
  const config = useSunlightEffectStore((state) => state.config);
  const update = useSunlightEffectStore((state) => state.update);
  const setColor = useSunlightEffectStore((state) => state.setColor);
  const reset = useSunlightEffectStore((state) => state.reset);

  return (
    <div className="h-full overflow-auto bg-background [scrollbar-width:thin]">
      <div className="space-y-7 px-4 pb-12 pt-5">
        <header className="space-y-2">
          <p className="text-sm leading-relaxed text-muted-foreground/90">
            Shape the rays, luminous core, palette, and inward light flow.
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
          <PlaygroundSectionTitle>Colors</PlaygroundSectionTitle>
          {config.colors.map((color, index) => (
            <PlaygroundColorPicker
              key={index}
              label={`Ray ${index + 1}`}
              value={color}
              onChange={(nextColor) => setColor(index, nextColor)}
              defaultColor={DEFAULT_CONFIG.colors[index]}
            />
          ))}
          <PlaygroundColorPicker
            label="Background"
            value={config.backgroundColor}
            onChange={(backgroundColor) => update({ backgroundColor })}
            defaultColor={DEFAULT_CONFIG.backgroundColor}
          />
          <PlaygroundColorPicker
            label="Bloom"
            value={config.bloomColor}
            onChange={(bloomColor) => update({ bloomColor })}
            defaultColor={DEFAULT_CONFIG.bloomColor}
          />
        </section>

        <section className="space-y-3">
          <PlaygroundSectionTitle>Light</PlaygroundSectionTitle>
          <PlaygroundSlider
            label="Bloom"
            min={0}
            max={2.5}
            step={0.01}
            value={config.bloom}
            onChange={(bloom) => update({ bloom })}
          />
          <PlaygroundSlider
            label="Intensity"
            min={0}
            max={3}
            step={0.01}
            value={config.intensity}
            onChange={(intensity) => update({ intensity })}
          />
        </section>

        <section className="space-y-3">
          <PlaygroundSectionTitle>Rays</PlaygroundSectionTitle>
          <PlaygroundSlider
            label="Density"
            min={0.2}
            max={3}
            step={0.01}
            value={config.density}
            onChange={(density) => update({ density })}
          />
          <PlaygroundSlider
            label="Spotty"
            min={0}
            max={1}
            step={0.01}
            value={config.spotty}
            onChange={(spotty) => update({ spotty })}
          />
        </section>

        <section className="space-y-3">
          <PlaygroundSectionTitle>Center</PlaygroundSectionTitle>
          <PlaygroundSlider
            label="Mid size"
            min={0}
            max={1.5}
            step={0.01}
            value={config.midSize}
            onChange={(midSize) => update({ midSize })}
          />
          <PlaygroundSlider
            label="Mid intensity"
            min={0}
            max={3}
            step={0.01}
            value={config.midIntensity}
            onChange={(midIntensity) => update({ midIntensity })}
          />
        </section>

        <section className="space-y-3">
          <PlaygroundSectionTitle>Motion</PlaygroundSectionTitle>
          <PlaygroundSlider
            label="Speed"
            min={0}
            max={2}
            step={0.01}
            value={config.speed}
            onChange={(speed) => update({ speed })}
          />
        </section>

        <section className="space-y-3">
          <PlaygroundSectionTitle>Transform</PlaygroundSectionTitle>
          <PlaygroundSlider
            label="Scale"
            min={0.25}
            max={3}
            step={0.01}
            value={config.scale}
            onChange={(scale) => update({ scale })}
          />
          <PlaygroundSlider
            label="Rotation"
            min={-180}
            max={180}
            step={1}
            unit="°"
            value={config.rotation}
            onChange={(rotation) => update({ rotation })}
          />
          <PlaygroundSlider
            label="Offset X"
            min={-1}
            max={1}
            step={0.01}
            value={config.offsetX}
            onChange={(offsetX) => update({ offsetX })}
          />
          <PlaygroundSlider
            label="Offset Y"
            min={-1}
            max={1}
            step={0.01}
            value={config.offsetY}
            onChange={(offsetY) => update({ offsetY })}
          />
        </section>
      </div>
    </div>
  );
}
