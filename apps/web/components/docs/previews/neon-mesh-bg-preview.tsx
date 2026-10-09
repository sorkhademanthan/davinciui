"use client";

import { useEffect } from "react";

import { NeonMeshBG } from "@workspace/ui/components/neon-mesh-bg";
import { create } from "zustand";
import { configEquals, usePlaygroundStore } from "@/hooks/use-playground-store";
import {
  PlaygroundColorPicker,
  PlaygroundSectionTitle,
  PlaygroundSlider,
  PlaygroundSwitch,
} from "@/components/playground-primitives";

type NeonMeshBGConfig = {
  scale: number;
  warp: number;
  contrast: number;
  gridSize: number;
  gridStrength: number;
  glowStrength: number;
  glowSpread: number;
  speed: number;
  animate: boolean;
  backgroundColor: string;
  primaryColor: string;
  secondaryColor: string;
  highlightColor: string;
};

const DEFAULT_CONFIG: NeonMeshBGConfig = {
  scale: 1.6,
  warp: 1.15,
  contrast: 1.6,
  gridSize: 6.5,
  gridStrength: 0.92,
  glowStrength: 1,
  glowSpread: 0.65,
  speed: 0.35,
  animate: true,
  backgroundColor: "#050505",
  primaryColor: "#40134e",
  secondaryColor: "#873491",
  highlightColor: "#eed5f2",
};

const useNeonMeshBGStore = create<{
  config: NeonMeshBGConfig;
  update: (next: Partial<NeonMeshBGConfig>) => void;
  reset: () => void;
}>((set) => ({
  config: DEFAULT_CONFIG,
  update: (next) => set((state) => ({ config: { ...state.config, ...next } })),
  reset: () => set({ config: DEFAULT_CONFIG }),
}));

function generateCode(config: NeonMeshBGConfig) {
  return `import { NeonMeshBG } from "@/components/ui/neon-mesh-bg"

<NeonMeshBG
  scale={${config.scale}}
  warp={${config.warp}}
  contrast={${config.contrast}}
  gridSize={${config.gridSize}}
  gridStrength={${config.gridStrength}}
  glowStrength={${config.glowStrength}}
  glowSpread={${config.glowSpread}}
  speed={${config.speed}}
  animate={${config.animate}}
  backgroundColor=${JSON.stringify(config.backgroundColor)}
  primaryColor=${JSON.stringify(config.primaryColor)}
  secondaryColor=${JSON.stringify(config.secondaryColor)}
  highlightColor=${JSON.stringify(config.highlightColor)}
/>`;
}

export function NeonMeshBGPreview() {
  const config = useNeonMeshBGStore((state) => state.config);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const api = usePlaygroundStore.getState();
      api.registerPreviewReset("neon-mesh-bg", () => useNeonMeshBGStore.getState().reset());
      api.setPersonalizedCode("neon-mesh-bg", generateCode(config), !configEquals(config, DEFAULT_CONFIG));
    }, 180);
    return () => window.clearTimeout(timer);
  }, [config]);

  return (
    <section
      className="relative h-full min-h-[560px] w-full overflow-hidden bg-[#050505]"
      style={{ containerType: "inline-size" }}
    >
      <NeonMeshBG {...config} />
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-4">
        <span
          className="whitespace-nowrap text-[clamp(2.25rem,9.5cqi,7rem)] font-black uppercase leading-none tracking-[-0.075em] text-white"
          style={{
            WebkitTextStroke: "1px rgba(5, 8, 12, 0.52)",
            textShadow: "0 4px 22px rgba(0, 0, 0, 0.48)",
          }}
        >
          DAVINCIUI
        </span>
      </div>
    </section>
  );
}

export function NeonMeshBGPersonalizePanel() {
  const config = useNeonMeshBGStore((state) => state.config);
  const update = useNeonMeshBGStore((state) => state.update);
  const reset = useNeonMeshBGStore((state) => state.reset);

  return (
    <div className="h-full overflow-auto bg-background [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="space-y-7 px-4 pb-12 pt-20">
        <header className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tighter text-foreground">
            Personalize
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground/90">
            Tune the neon mesh density, pixel matrix, glow, and drift speed.
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
          <PlaygroundSectionTitle>Mesh</PlaygroundSectionTitle>
          <PlaygroundSlider
            label="Scale"
            min={0.4}
            max={3.5}
            step={0.05}
            value={config.scale}
            onChange={(scale) => update({ scale })}
          />
          <PlaygroundSlider
            label="Warp"
            min={0}
            max={2.5}
            step={0.05}
            value={config.warp}
            onChange={(warp) => update({ warp })}
          />
          <PlaygroundSlider
            label="Contrast"
            min={0.5}
            max={3}
            step={0.05}
            value={config.contrast}
            onChange={(contrast) => update({ contrast })}
          />
        </section>

        <section className="space-y-3">
          <PlaygroundSectionTitle>Pixel grid</PlaygroundSectionTitle>
          <PlaygroundSlider
            label="Grid size"
            min={2}
            max={10}
            step={0.5}
            value={config.gridSize}
            onChange={(gridSize) => update({ gridSize })}
          />
          <PlaygroundSlider
            label="Grid strength"
            min={0}
            max={1}
            step={0.01}
            value={config.gridStrength}
            onChange={(gridStrength) => update({ gridStrength })}
          />
        </section>

        <section className="space-y-3">
          <PlaygroundSectionTitle>Glow</PlaygroundSectionTitle>
          <PlaygroundSlider
            label="Glow strength"
            min={0}
            max={2}
            step={0.05}
            value={config.glowStrength}
            onChange={(glowStrength) => update({ glowStrength })}
          />
          <PlaygroundSlider
            label="Glow spread"
            min={0}
            max={1}
            step={0.01}
            value={config.glowSpread}
            onChange={(glowSpread) => update({ glowSpread })}
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
          <PlaygroundSwitch
            label="Animate"
            checked={config.animate}
            onChange={(animate) => update({ animate })}
          />
        </section>

        <section className="space-y-3">
          <PlaygroundSectionTitle>Colors</PlaygroundSectionTitle>
          <PlaygroundColorPicker
            label="Background"
            value={config.backgroundColor}
            onChange={(backgroundColor) => update({ backgroundColor })}
          />
          <PlaygroundColorPicker
            label="Primary"
            value={config.primaryColor}
            onChange={(primaryColor) => update({ primaryColor })}
          />
          <PlaygroundColorPicker
            label="Secondary"
            value={config.secondaryColor}
            onChange={(secondaryColor) => update({ secondaryColor })}
          />
          <PlaygroundColorPicker
            label="Highlight"
            value={config.highlightColor}
            onChange={(highlightColor) => update({ highlightColor })}
          />
        </section>
      </div>
    </div>
  );
}
