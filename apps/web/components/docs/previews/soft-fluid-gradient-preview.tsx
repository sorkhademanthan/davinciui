"use client";

import { useEffect } from "react";

import { SoftFluidGradient } from "@workspace/ui/components/soft-fluid-gradient";
import { create } from "zustand";
import { configEquals, usePlaygroundStore } from "@/hooks/use-playground-store";
import {
  CustomizePanel,
  bindCustomizeUpdate,
  type CustomizeControl,
} from "@/components/customize-panel";

type SoftFluidGradientConfig = {
  speed: number;
  density: number;
};

const DEFAULT_CONFIG: SoftFluidGradientConfig = {
  speed: 0.26,
  density: 1,
};

const SOFT_FLUID_GRADIENT_PRESETS: Record<string, Partial<SoftFluidGradientConfig>> = {
  default: { speed: 0.26, density: 1 },
  calm: { speed: 0.12, density: 0.7 },
  energetic: { speed: 0.45, density: 1.3 },
  dense: { speed: 0.3, density: 1.8 },
  subtle: { speed: 0.18, density: 0.5 },
};

const CONTROLS: CustomizeControl[] = [
  { type: "slider", key: "speed", label: "Speed", min: 0, max: 2, step: 0.01, group: "Flow" },
  { type: "slider", key: "density", label: "Density (loops)", min: 0.35, max: 3, step: 0.05, group: "Flow" },
];

const useSoftFluidGradientStore = create<{
  config: SoftFluidGradientConfig;
  update: (next: Partial<SoftFluidGradientConfig>) => void;
  reset: () => void;
  applyPreset: (preset: string) => void;
}>((set) => ({
  config: DEFAULT_CONFIG,
  update: (next) => set((state) => ({ config: { ...state.config, ...next } })),
  reset: () => set({ config: DEFAULT_CONFIG }),
  applyPreset: (preset) =>
    set((state) => ({ config: { ...state.config, ...(SOFT_FLUID_GRADIENT_PRESETS[preset] ?? {}) } })),
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

  return (
    <CustomizePanel
      slug="soft-fluid-gradient"
      controls={CONTROLS}
      values={config}
      defaults={DEFAULT_CONFIG}
      onChange={bindCustomizeUpdate(update)}
      presets={Object.keys(SOFT_FLUID_GRADIENT_PRESETS).map((preset) => ({ label: preset.charAt(0).toUpperCase() + preset.slice(1), value: preset }))}
      onPresetChange={(preset) => useSoftFluidGradientStore.getState().applyPreset(preset)}
      onReset={() =>
        usePlaygroundStore.getState().resetPreview("soft-fluid-gradient")
      }
    />
  );
}
