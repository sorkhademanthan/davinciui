"use client";

import { useEffect } from "react";
import { InkFlow } from "@workspace/ui/components/ink-flow";
import { create } from "zustand";
import { configEquals, usePlaygroundStore } from "@/hooks/use-playground-store";
import {
  PlaygroundColorPicker,
  PlaygroundSectionTitle,
  PlaygroundSlider,
} from "@/components/playground-primitives";

type InkFlowConfig = {
  speed: number;
  scale: number;
  saturation: number;
  contrast: number;
  paperColor: string;
  softInkColor: string;
  deepInkColor: string;
  accentColor: string;
};

const DEFAULT_CONFIG: InkFlowConfig = {
  speed: 0.22,
  scale: 1,
  saturation: 1,
  contrast: 1,
  paperColor: "#F6EFD3",
  softInkColor: "#9DA5B6",
  deepInkColor: "#3C2FAA",
  accentColor: "#F5AED9",
};

const useInkFlowStore = create<{
  config: InkFlowConfig;
  update: (next: Partial<InkFlowConfig>) => void;
  reset: () => void;
}>((set) => ({
  config: DEFAULT_CONFIG,
  update: (next) => set((state) => ({ config: { ...state.config, ...next } })),
  reset: () => set({ config: DEFAULT_CONFIG }),
}));

function generateCode(config: InkFlowConfig) {
  return `import { InkFlow } from "@/components/ui/ink-flow"

<InkFlow
  speed={${config.speed}}
  scale={${config.scale}}
  saturation={${config.saturation}}
  contrast={${config.contrast}}
  paperColor=${JSON.stringify(config.paperColor)}
  softInkColor=${JSON.stringify(config.softInkColor)}
  deepInkColor=${JSON.stringify(config.deepInkColor)}
  accentColor=${JSON.stringify(config.accentColor)}
/>`;
}

export function InkFlowPreview() {
  const config = useInkFlowStore((state) => state.config);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const api = usePlaygroundStore.getState();
      api.registerPreviewReset("ink-flow", () => useInkFlowStore.getState().reset());
      api.setPersonalizedCode("ink-flow", generateCode(config), !configEquals(config, DEFAULT_CONFIG));
    }, 180);
    return () => window.clearTimeout(timer);
  }, [config]);

  return (
    <section
      className="relative h-full min-h-[560px] w-full overflow-hidden bg-[#e9e1c8]"
      style={{ containerType: "inline-size" }}
    >
      <InkFlow {...config} />

      <div className="relative z-10 flex h-full min-h-[560px] items-center justify-center px-5 py-16 text-center">
        <h2
          className="whitespace-nowrap text-[clamp(1.75rem,12cqi,7rem)] font-black uppercase leading-none tracking-[-0.075em] text-[#24225f]"
          style={{
            WebkitTextStroke: "1px rgba(233, 225, 200, 0.36)",
            textShadow: "0 8px 28px rgba(45, 42, 147, 0.2)",
          }}
        >
          DAVINCIUI
        </h2>
      </div>
    </section>
  );
}

export function InkFlowPersonalizePanel() {
  const config = useInkFlowStore((state) => state.config);
  const update = useInkFlowStore((state) => state.update);
  const reset = useInkFlowStore((state) => state.reset);

  return (
    <div className="h-full overflow-auto bg-background [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="space-y-7 px-4 pb-12 pt-20">
        <header className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tighter text-foreground">
            Personalize
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground/90">
            Shape the pigment scale, pace, and editorial palette.
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
          <PlaygroundSectionTitle>Flow</PlaygroundSectionTitle>
          <PlaygroundSlider label="Flow speed" min={0} max={2} step={0.01} value={config.speed} onChange={(speed) => update({ speed })} />
          <PlaygroundSlider label="Ink scale" min={0.4} max={3} step={0.05} value={config.scale} onChange={(scale) => update({ scale })} />
          <PlaygroundSlider label="Saturation" min={0} max={2} step={0.05} value={config.saturation} onChange={(saturation) => update({ saturation })} />
          <PlaygroundSlider label="Contrast" min={0.5} max={2} step={0.05} value={config.contrast} onChange={(contrast) => update({ contrast })} />
        </section>

        <section>
          <PlaygroundSectionTitle>Palette</PlaygroundSectionTitle>
          <div className="space-y-2">
            <PlaygroundColorPicker label="Paper" value={config.paperColor} onChange={(paperColor) => update({ paperColor })} defaultColor={DEFAULT_CONFIG.paperColor} />
            <PlaygroundColorPicker label="Soft ink" value={config.softInkColor} onChange={(softInkColor) => update({ softInkColor })} defaultColor={DEFAULT_CONFIG.softInkColor} />
            <PlaygroundColorPicker label="Deep ink" value={config.deepInkColor} onChange={(deepInkColor) => update({ deepInkColor })} defaultColor={DEFAULT_CONFIG.deepInkColor} />
            <PlaygroundColorPicker label="Accent vein" value={config.accentColor} onChange={(accentColor) => update({ accentColor })} defaultColor={DEFAULT_CONFIG.accentColor} />
          </div>
        </section>
      </div>
    </div>
  );
}
