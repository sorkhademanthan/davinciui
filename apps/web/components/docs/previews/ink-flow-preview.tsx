"use client";

import { useEffect } from "react";
import { InkFlow } from "@workspace/ui/components/ink-flow";
import { create } from "zustand";
import { configEquals, usePlaygroundStore } from "@/hooks/use-playground-store";
import {
  CustomizePanel,
  bindCustomizeUpdate,
  type CustomizeControl,
} from "@/components/customize-panel";

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

const CONTROLS: CustomizeControl[] = [
  { type: "slider", key: "speed", label: "Speed", min: 0, max: 2, step: 0.01, group: "Flow" },
  { type: "slider", key: "scale", label: "Ink scale", min: 0.4, max: 3, step: 0.05, group: "Flow" },
  { type: "slider", key: "saturation", label: "Saturation", min: 0, max: 2, step: 0.05, group: "Flow" },
  { type: "slider", key: "contrast", label: "Contrast", min: 0.5, max: 2, step: 0.05, group: "Flow" },
  { type: "color", key: "paperColor", label: "Paper", defaultColor: DEFAULT_CONFIG.paperColor, group: "Palette" },
  { type: "color", key: "softInkColor", label: "Soft ink", defaultColor: DEFAULT_CONFIG.softInkColor, group: "Palette" },
  { type: "color", key: "deepInkColor", label: "Deep ink", defaultColor: DEFAULT_CONFIG.deepInkColor, group: "Palette" },
  { type: "color", key: "accentColor", label: "Accent", defaultColor: DEFAULT_CONFIG.accentColor, group: "Palette" },
];

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

  return (
    <CustomizePanel
      slug="ink-flow"
      controls={CONTROLS}
      values={config}
      defaults={DEFAULT_CONFIG}
      onChange={bindCustomizeUpdate(update)}
      onReset={() => usePlaygroundStore.getState().resetPreview("ink-flow")}
    />
  );
}
