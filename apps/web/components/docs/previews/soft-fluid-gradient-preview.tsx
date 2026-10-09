"use client";

import { useEffect } from "react";

import { SoftFluidGradient } from "@workspace/ui/components/soft-fluid-gradient";
import { create } from "zustand";
import { configEquals, usePlaygroundStore } from "@/hooks/use-playground-store";
import {
  PlaygroundSectionTitle,
  PlaygroundSlider,
} from "@/components/playground-primitives";

type SoftFluidGradientConfig = {
  speed: number;
  density: number;
};

const DEFAULT_CONFIG: SoftFluidGradientConfig = {
  speed: 0.26,
  density: 1,
};

const useSoftFluidGradientStore = create<{
  config: SoftFluidGradientConfig;
  update: (next: Partial<SoftFluidGradientConfig>) => void;
  reset: () => void;
}>((set) => ({
  config: DEFAULT_CONFIG,
  update: (next) => set((state) => ({ config: { ...state.config, ...next } })),
  reset: () => set({ config: DEFAULT_CONFIG }),
}));

function generateCode(config: SoftFluidGradientConfig) {
  return `import { SoftFluidGradient } from "@/components/ui/soft-fluid-gradient"

<SoftFluidGradient
  speed={${config.speed}}
  density={${config.density}}
/>`;
}

export function SoftFluidGradientPreview() {
  const config = useSoftFluidGradientStore((state) => state.config);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const api = usePlaygroundStore.getState();
      api.registerPreviewReset("soft-fluid-gradient", () => useSoftFluidGradientStore.getState().reset());
      api.setPersonalizedCode("soft-fluid-gradient", generateCode(config), !configEquals(config, DEFAULT_CONFIG));
    }, 180);
    return () => window.clearTimeout(timer);
  }, [config]);

  return (
    <section
      className="relative h-full min-h-[560px] w-full overflow-hidden bg-[#c8d8e5]"
      style={{ containerType: "inline-size" }}
    >
      <SoftFluidGradient {...config} />
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

export function SoftFluidGradientPersonalizePanel() {
  const config = useSoftFluidGradientStore((state) => state.config);
  const update = useSoftFluidGradientStore((state) => state.update);
  const reset = useSoftFluidGradientStore((state) => state.reset);

  return (
    <div className="h-full overflow-auto bg-background [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="space-y-7 px-4 pb-12 pt-20">
        <header className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tighter text-foreground">
            Personalize
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground/90">
            Tune the flow speed and the breadth of the looping light field.
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
          <PlaygroundSlider
            label="Speed"
            min={0}
            max={2}
            step={0.01}
            value={config.speed}
            onChange={(speed) => update({ speed })}
          />
          <PlaygroundSlider
            label="Density (loops)"
            min={0.35}
            max={3}
            step={0.05}
            value={config.density}
            onChange={(density) => update({ density })}
          />
        </section>
      </div>
    </div>
  );
}
