"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { CharacterField } from "@workspace/ui/components/character-field";
import type { CharacterFieldSet } from "@workspace/ui/components/character-field";
import { configEquals, usePlaygroundStore } from "@/hooks/use-playground-store";
import { CustomizePanel, bindCustomizeUpdate, type CustomizeControl } from "@/components/customize-panel";

const CHARACTER_SETS: CharacterFieldSet[] = [
  "mixed",
  "letters",
  "numbers",
  "symbols",
  "custom",
];

interface CharacterFieldPlaygroundConfig {
  characterSet: CharacterFieldSet;
  customCharacters: string;
  fontSize: number;
  characterSpacing: number;
  lineHeight: number;
  density: number;
  backgroundColor: string;
  characterColor: string;
  highlightColor: string;
  baseOpacity: number;
  brightnessVariation: number;
  mutationSpeed: number;
  mutationAmount: number;
  minUpdateDelay: number;
  maxUpdateDelay: number;
  flickerIntensity: number;
  smoothFade: boolean;
}

const CHARACTER_FIELD_DEFAULT_CONFIG: CharacterFieldPlaygroundConfig = {
  characterSet: "mixed",
  customCharacters: "DAVINCIUI",
  fontSize: 14,
  characterSpacing: 2,
  lineHeight: 1.5,
  density: 1,
  backgroundColor: "#060a09",
  characterColor: "#1d3a34",
  highlightColor: "#8fc0b5",
  baseOpacity: 0.6,
  brightnessVariation: 0.55,
  mutationSpeed: 1.8,
  mutationAmount: 0.16,
  minUpdateDelay: 60,
  maxUpdateDelay: 1400,
  flickerIntensity: 0.35,
  smoothFade: true,
};

const CHARACTER_FIELD_PRESETS: Record<string, Partial<CharacterFieldPlaygroundConfig>> = {
  default: { backgroundColor: "#060a09", characterColor: "#1d3a34", highlightColor: "#8fc0b5" },
  matrix: { backgroundColor: "#020a04", characterColor: "#1f7a3d", highlightColor: "#7cff9a" },
  terminal: { backgroundColor: "#0a0a0a", characterColor: "#2f7d32", highlightColor: "#81c784" },
  amber: { backgroundColor: "#0a0602", characterColor: "#7a5a1f", highlightColor: "#ffc107" },
  mono: { backgroundColor: "#0a0a0a", characterColor: "#525252", highlightColor: "#e5e5e5" },
};

interface CharacterFieldPlaygroundStore {
  config: CharacterFieldPlaygroundConfig;
  updateConfig: (updates: Partial<CharacterFieldPlaygroundConfig>) => void;
  resetConfig: () => void;
  applyPreset: (preset: string) => void;
}

const useCharacterFieldPlaygroundStore = create<CharacterFieldPlaygroundStore>(
  (set) => ({
    config: CHARACTER_FIELD_DEFAULT_CONFIG,
    updateConfig: (updates) =>
      set((state) => ({
        config: { ...state.config, ...updates },
      })),
    resetConfig: () => set({ config: CHARACTER_FIELD_DEFAULT_CONFIG }),
    applyPreset: (preset) =>
      set((state) => ({
        config: { ...state.config, ...(CHARACTER_FIELD_PRESETS[preset] ?? {}) },
      })),
  }),
);

function generateCode(config: CharacterFieldPlaygroundConfig) {
  const customLine =
    config.characterSet === "custom"
      ? `\n  customCharacters="${config.customCharacters}"`
      : "";
  return `import { CharacterField } from "@/components/ui/character-field"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl">
  <CharacterField
    characterSet="${config.characterSet}"${customLine}
    fontSize={${config.fontSize}}
    characterSpacing={${config.characterSpacing}}
    lineHeight={${config.lineHeight}}
    density={${config.density}}
    backgroundColor="${config.backgroundColor}"
    characterColor="${config.characterColor}"
    highlightColor="${config.highlightColor}"
    baseOpacity={${config.baseOpacity}}
    brightnessVariation={${config.brightnessVariation}}
    mutationSpeed={${config.mutationSpeed}}
    mutationAmount={${config.mutationAmount}}
    minUpdateDelay={${config.minUpdateDelay}}
    maxUpdateDelay={${config.maxUpdateDelay}}
    flickerIntensity={${config.flickerIntensity}}
    smoothFade={${config.smoothFade}}
  />
  <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6">
    <span className="whitespace-nowrap font-black uppercase leading-none tracking-[-0.055em] text-white text-[clamp(3rem,8.5vw,6rem)]">
      DAVINCIUI
    </span>
  </div>
</div>`;
}

export function CharacterFieldPlayground() {
  const config = useCharacterFieldPlaygroundStore((state) => state.config);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const api = usePlaygroundStore.getState();
      api.registerPreviewReset("character-field", () => useCharacterFieldPlaygroundStore.getState().resetConfig());
      api.setPersonalizedCode("character-field", generateCode(config), !configEquals(config, CHARACTER_FIELD_DEFAULT_CONFIG));
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [config]);

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ backgroundColor: config.backgroundColor }}
    >
      <CharacterField
        className="h-full min-h-full w-full"
        characterSet={config.characterSet}
        customCharacters={config.customCharacters}
        fontSize={config.fontSize}
        characterSpacing={config.characterSpacing}
        lineHeight={config.lineHeight}
        density={config.density}
        backgroundColor={config.backgroundColor}
        characterColor={config.characterColor}
        highlightColor={config.highlightColor}
        baseOpacity={config.baseOpacity}
        brightnessVariation={config.brightnessVariation}
        mutationSpeed={config.mutationSpeed}
        mutationAmount={config.mutationAmount}
        minUpdateDelay={config.minUpdateDelay}
        maxUpdateDelay={config.maxUpdateDelay}
        flickerIntensity={config.flickerIntensity}
        smoothFade={config.smoothFade}
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
  );
}

const CONTROLS: CustomizeControl[] = [
  {
    type: "select",
    key: "characterSet",
    label: "Character set",
    options: CHARACTER_SETS.map((set) => ({ label: set, value: set })),
  },
  { type: "text", key: "customCharacters", label: "Custom characters", placeholder: "DAVINCI01", maxLength: 128 },
  { type: "slider", key: "fontSize", label: "Font size", min: 8, max: 28, step: 1, unit: "px" },
  { type: "slider", key: "characterSpacing", label: "Character spacing", min: 0, max: 12, step: 0.5, unit: "px" },
  { type: "slider", key: "lineHeight", label: "Line height", min: 1, max: 2.4, step: 0.05 },
  { type: "slider", key: "density", label: "Density", min: 0.4, max: 2.2, step: 0.05 },
  { type: "color", key: "backgroundColor", label: "Background" },
  { type: "color", key: "characterColor", label: "Character color" },
  { type: "color", key: "highlightColor", label: "Highlight color" },
  { type: "slider", key: "baseOpacity", label: "Base opacity", min: 0.05, max: 1, step: 0.01 },
  { type: "slider", key: "brightnessVariation", label: "Brightness variation", min: 0, max: 1, step: 0.01 },
  { type: "slider", key: "mutationSpeed", label: "Mutation speed", min: 0, max: 3, step: 0.05, unit: "×" },
  { type: "slider", key: "mutationAmount", label: "Mutation amount", min: 0, max: 1, step: 0.01 },
  { type: "slider", key: "minUpdateDelay", label: "Min update delay", min: 0, max: 2000, step: 10, unit: "ms" },
  { type: "slider", key: "maxUpdateDelay", label: "Max update delay", min: 100, max: 8000, step: 50, unit: "ms" },
  { type: "slider", key: "flickerIntensity", label: "Flicker intensity", min: 0, max: 1, step: 0.01 },
  { type: "toggle", key: "smoothFade", label: "Smooth fade" },
];

export function CharacterFieldPersonalizePanel() {
  const config = useCharacterFieldPlaygroundStore((state) => state.config);
  const updateConfig = useCharacterFieldPlaygroundStore(
    (state) => state.updateConfig,
  );

  return (
    <CustomizePanel
      slug="character-field"
      controls={CONTROLS}
      values={config}
      defaults={CHARACTER_FIELD_DEFAULT_CONFIG}
      onChange={bindCustomizeUpdate(updateConfig)}
      onReset={() => usePlaygroundStore.getState().resetPreview("character-field")}
      presets={Object.keys(CHARACTER_FIELD_PRESETS).map((preset) => ({ label: preset.charAt(0).toUpperCase() + preset.slice(1), value: preset }))}
      onPresetChange={(preset) => useCharacterFieldPlaygroundStore.getState().applyPreset(preset)}
    />
  );
}
