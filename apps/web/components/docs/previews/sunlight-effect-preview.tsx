"use client";

import { useEffect } from "react";

import { SunlightEffect } from "@workspace/ui/components/sunlight-effect";
import { create } from "zustand";
import { configEquals, usePlaygroundStore } from "@/hooks/use-playground-store";
import {
  CustomizePanel,
  bindCustomizeUpdate,
  type CustomizeControl,
} from "@/components/customize-panel";

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

const CONTROLS: CustomizeControl[] = [
  ...DEFAULT_CONFIG.colors.map((color, index) => ({
    type: "color" as const,
    key: `colors.${index}`,
    label: `Ray ${index + 1}`,
    defaultColor: color,
    group: "Colors",
  })),
  { type: "color", key: "backgroundColor", label: "Background", defaultColor: DEFAULT_CONFIG.backgroundColor, group: "Colors" },
  { type: "color", key: "bloomColor", label: "Bloom", defaultColor: DEFAULT_CONFIG.bloomColor, group: "Colors" },
  { type: "slider", key: "bloom", label: "Bloom", min: 0, max: 2.5, step: 0.01, group: "Light" },
  { type: "slider", key: "intensity", label: "Intensity", min: 0, max: 3, step: 0.01, group: "Light" },
  { type: "slider", key: "density", label: "Density", min: 0.2, max: 3, step: 0.01, group: "Rays" },
  { type: "slider", key: "spotty", label: "Spotty", min: 0, max: 1, step: 0.01, group: "Rays" },
  { type: "slider", key: "midSize", label: "Mid size", min: 0, max: 1.5, step: 0.01, group: "Center" },
  { type: "slider", key: "midIntensity", label: "Mid intensity", min: 0, max: 3, step: 0.01, group: "Center" },
  { type: "slider", key: "speed", label: "Speed", min: 0, max: 2, step: 0.01, group: "Motion" },
  { type: "slider", key: "scale", label: "Scale", min: 0.25, max: 3, step: 0.01, group: "Transform" },
  { type: "slider", key: "rotation", label: "Rotation", min: -180, max: 180, step: 1, unit: "°", group: "Transform" },
  { type: "slider", key: "offsetX", label: "Offset X", min: -1, max: 1, step: 0.01, group: "Transform" },
  { type: "slider", key: "offsetY", label: "Offset Y", min: -1, max: 1, step: 0.01, group: "Transform" },
];

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
  const applyControlUpdate = bindCustomizeUpdate(update);
  const values = {
    ...config,
    ...Object.fromEntries(
      config.colors.map((color, index) => [`colors.${index}`, color]),
    ),
  };
  const defaults = {
    ...DEFAULT_CONFIG,
    ...Object.fromEntries(
      DEFAULT_CONFIG.colors.map((color, index) => [`colors.${index}`, color]),
    ),
  };

  return (
    <CustomizePanel
      slug="sunlight-effect"
      controls={CONTROLS}
      values={values}
      defaults={defaults}
      onChange={(key, value) => {
        if (key.startsWith("colors.")) {
          const index = Number(key.slice("colors.".length));
          setColor(index, String(value));
        } else {
          applyControlUpdate(key, value);
        }
      }}
      onReset={() =>
        usePlaygroundStore.getState().resetPreview("sunlight-effect")
      }
    />
  );
}
