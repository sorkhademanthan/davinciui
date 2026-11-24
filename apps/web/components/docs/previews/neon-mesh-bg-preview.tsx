"use client";

import { useEffect } from "react";

import { NeonMeshBG } from "@workspace/ui/components/neon-mesh-bg";
import { create } from "zustand";
import { configEquals, usePlaygroundStore } from "@/hooks/use-playground-store";
import {
  CustomizePanel,
  bindCustomizeUpdate,
  type CustomizeControl,
} from "@/components/customize-panel";

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

const NEON_MESH_BG_PRESETS: Record<string, Partial<NeonMeshBGConfig>> = {
  default: { backgroundColor: "#050505", primaryColor: "#40134e", secondaryColor: "#873491", highlightColor: "#eed5f2" },
  midnight: { backgroundColor: "#020617", primaryColor: "#1e3a8a", secondaryColor: "#3b82f6", highlightColor: "#bfdbfe" },
  ember: { backgroundColor: "#1a0a0a", primaryColor: "#7c2d12", secondaryColor: "#ea580c", highlightColor: "#fed7aa" },
  ocean: { backgroundColor: "#020f1a", primaryColor: "#0f4c5c", secondaryColor: "#06b6d4", highlightColor: "#a5f3fc" },
  mono: { backgroundColor: "#050505", primaryColor: "#262626", secondaryColor: "#525252", highlightColor: "#e5e5e5" },
};

const CONTROLS: CustomizeControl[] = [
  { type: "slider", key: "scale", label: "Scale", min: 0.4, max: 3.5, step: 0.05, group: "Mesh" },
  { type: "slider", key: "warp", label: "Warp", min: 0, max: 2.5, step: 0.05, group: "Mesh" },
  { type: "slider", key: "contrast", label: "Contrast", min: 0.5, max: 3, step: 0.05, group: "Mesh" },
  { type: "slider", key: "gridSize", label: "Grid size", min: 2, max: 10, step: 0.5, group: "Pixel grid" },
  { type: "slider", key: "gridStrength", label: "Grid strength", min: 0, max: 1, step: 0.01, group: "Pixel grid" },
  { type: "slider", key: "glowStrength", label: "Glow strength", min: 0, max: 2, step: 0.05, group: "Glow" },
  { type: "slider", key: "glowSpread", label: "Glow spread", min: 0, max: 1, step: 0.01, group: "Glow" },
  { type: "slider", key: "speed", label: "Speed", min: 0, max: 2, step: 0.01, group: "Motion" },
  { type: "toggle", key: "animate", label: "Animate", group: "Motion" },
  { type: "color", key: "backgroundColor", label: "Background", group: "Colors" },
  { type: "color", key: "primaryColor", label: "Primary", group: "Colors" },
  { type: "color", key: "secondaryColor", label: "Secondary", group: "Colors" },
  { type: "color", key: "highlightColor", label: "Highlight", group: "Colors" },
];

const useNeonMeshBGStore = create<{
  config: NeonMeshBGConfig;
  update: (next: Partial<NeonMeshBGConfig>) => void;
  reset: () => void;
  applyPreset: (preset: string) => void;
}>((set) => ({
  config: DEFAULT_CONFIG,
  update: (next) => set((state) => ({ config: { ...state.config, ...next } })),
  reset: () => set({ config: DEFAULT_CONFIG }),
  applyPreset: (preset) =>
    set((state) => ({ config: { ...state.config, ...(NEON_MESH_BG_PRESETS[preset] ?? {}) } })),
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

  return (
    <CustomizePanel
      slug="neon-mesh-bg"
      controls={CONTROLS}
      values={config}
      defaults={DEFAULT_CONFIG}
      onChange={bindCustomizeUpdate(update)}
      onReset={() => usePlaygroundStore.getState().resetPreview("neon-mesh-bg")}
      presets={Object.keys(NEON_MESH_BG_PRESETS).map((preset) => ({ label: preset.charAt(0).toUpperCase() + preset.slice(1), value: preset }))}
      activePreset={Object.keys(NEON_MESH_BG_PRESETS).find((p) => JSON.stringify(NEON_MESH_BG_PRESETS[p]) === JSON.stringify({ backgroundColor: config.backgroundColor, primaryColor: config.primaryColor, secondaryColor: config.secondaryColor, highlightColor: config.highlightColor })) ?? "default"}
      onPresetChange={(preset) => useNeonMeshBGStore.getState().applyPreset(preset)}
    />
  );
}
