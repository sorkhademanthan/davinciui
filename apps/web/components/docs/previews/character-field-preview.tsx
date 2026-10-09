"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { CharacterField } from "@workspace/ui/components/character-field";
import type { CharacterFieldSet } from "@workspace/ui/components/character-field";
import { cn } from "@/lib/utils";
import { configEquals, usePlaygroundStore } from "@/hooks/use-playground-store";
import {
  PlaygroundColorPicker,
  PlaygroundInput,
  PlaygroundSectionTitle,
  PlaygroundSlider,
  PlaygroundSwitch,
} from "@/components/playground-primitives";

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

interface CharacterFieldPlaygroundStore {
  config: CharacterFieldPlaygroundConfig;
  updateConfig: (updates: Partial<CharacterFieldPlaygroundConfig>) => void;
  resetConfig: () => void;
}

const useCharacterFieldPlaygroundStore = create<CharacterFieldPlaygroundStore>(
  (set) => ({
    config: CHARACTER_FIELD_DEFAULT_CONFIG,
    updateConfig: (updates) =>
      set((state) => ({
        config: { ...state.config, ...updates },
      })),
    resetConfig: () => set({ config: CHARACTER_FIELD_DEFAULT_CONFIG }),
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

export function CharacterFieldPersonalizePanel() {
  const config = useCharacterFieldPlaygroundStore((state) => state.config);
  const updateConfig = useCharacterFieldPlaygroundStore(
    (state) => state.updateConfig,
  );
  const resetConfig = useCharacterFieldPlaygroundStore(
    (state) => state.resetConfig,
  );

  const handleChange = <K extends keyof CharacterFieldPlaygroundConfig>(
    key: K,
    value: CharacterFieldPlaygroundConfig[K],
  ) => {
    updateConfig({ [key]: value } as Partial<CharacterFieldPlaygroundConfig>);
  };

  return (
    <div className="h-full overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="space-y-6 px-4 pb-10 pt-20">
        <header className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tighter text-foreground">
            Personalize
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground/90">
            Shape the glyph pool, density, palette, and mutation rhythm in real
            time.
          </p>
        </header>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={resetConfig}
            className="rounded-md border border-border/40 bg-white/50 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground dark:bg-white/[0.03]"
          >
            Reset
          </button>
        </div>

        <div className="space-y-3">
          <PlaygroundSectionTitle>Content</PlaygroundSectionTitle>
          <div className="grid grid-cols-3 gap-1.5">
            {CHARACTER_SETS.map((set) => {
              const active = config.characterSet === set;
              return (
                <button
                  key={set}
                  type="button"
                  onClick={() => handleChange("characterSet", set)}
                  className={cn(
                    "rounded-md border px-2 py-2 font-mono text-[10px] uppercase tracking-wide transition-colors",
                    active
                      ? "border-foreground/25 text-foreground shadow-sm"
                      : "border-border/40 text-muted-foreground hover:text-foreground",
                  )}
                >
                  {set}
                </button>
              );
            })}
          </div>
          {config.characterSet === "custom" && (
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-foreground/90">
                Custom characters
              </span>
              <PlaygroundInput
                value={config.customCharacters}
                onChange={(e) =>
                  handleChange("customCharacters", e.target.value)
                }
                placeholder="DAVINCI01"
                maxLength={128}
              />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <PlaygroundSectionTitle>Typography</PlaygroundSectionTitle>
          <PlaygroundSlider
            label="Font size"
            min={8}
            max={28}
            step={1}
            value={config.fontSize}
            unit="px"
            onChange={(value) => handleChange("fontSize", value)}
          />
          <PlaygroundSlider
            label="Character spacing"
            min={0}
            max={12}
            step={0.5}
            value={config.characterSpacing}
            unit="px"
            onChange={(value) => handleChange("characterSpacing", value)}
          />
          <PlaygroundSlider
            label="Line height"
            min={1}
            max={2.4}
            step={0.05}
            value={config.lineHeight}
            onChange={(value) => handleChange("lineHeight", value)}
          />
          <PlaygroundSlider
            label="Density"
            min={0.4}
            max={2.2}
            step={0.05}
            value={config.density}
            onChange={(value) => handleChange("density", value)}
          />
        </div>

        <div className="space-y-3">
          <PlaygroundSectionTitle>Appearance</PlaygroundSectionTitle>
          <PlaygroundColorPicker
            label="Background"
            value={config.backgroundColor}
            onChange={(value) =>
              value && handleChange("backgroundColor", value)
            }
          />
          <PlaygroundColorPicker
            label="Character color"
            value={config.characterColor}
            onChange={(value) =>
              value && handleChange("characterColor", value)
            }
          />
          <PlaygroundColorPicker
            label="Highlight color"
            value={config.highlightColor}
            onChange={(value) =>
              value && handleChange("highlightColor", value)
            }
          />
          <PlaygroundSlider
            label="Base opacity"
            min={0.05}
            max={1}
            step={0.01}
            value={config.baseOpacity}
            onChange={(value) => handleChange("baseOpacity", value)}
          />
          <PlaygroundSlider
            label="Brightness variation"
            min={0}
            max={1}
            step={0.01}
            value={config.brightnessVariation}
            onChange={(value) => handleChange("brightnessVariation", value)}
          />
        </div>

        <div className="space-y-3">
          <PlaygroundSectionTitle>Animation</PlaygroundSectionTitle>
          <PlaygroundSlider
            label="Mutation speed"
            min={0}
            max={3}
            step={0.05}
            value={config.mutationSpeed}
            unit="×"
            onChange={(value) => handleChange("mutationSpeed", value)}
          />
          <PlaygroundSlider
            label="Mutation amount"
            min={0}
            max={1}
            step={0.01}
            value={config.mutationAmount}
            onChange={(value) => handleChange("mutationAmount", value)}
          />
          <PlaygroundSlider
            label="Min update delay"
            min={0}
            max={2000}
            step={10}
            value={config.minUpdateDelay}
            unit="ms"
            onChange={(value) => handleChange("minUpdateDelay", value)}
          />
          <PlaygroundSlider
            label="Max update delay"
            min={100}
            max={8000}
            step={50}
            value={config.maxUpdateDelay}
            unit="ms"
            onChange={(value) => handleChange("maxUpdateDelay", value)}
          />
          <PlaygroundSlider
            label="Flicker intensity"
            min={0}
            max={1}
            step={0.01}
            value={config.flickerIntensity}
            onChange={(value) => handleChange("flickerIntensity", value)}
          />
          <PlaygroundSwitch
            label="Smooth fade"
            checked={config.smoothFade}
            onChange={(value) => handleChange("smoothFade", value)}
          />
        </div>
      </div>
    </div>
  );
}
