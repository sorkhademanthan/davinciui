"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { TextMorph } from "@workspace/ui/components/text-morph";
import { configEquals, usePlaygroundStore } from "@/hooks/use-playground-store";
import {
  CustomizePanel,
  bindCustomizeUpdate,
  type CustomizeControl,
} from "@/components/customize-panel";

interface TextMorphPlaygroundConfig {
  words: string[];
  interval: number;
  morphDuration: number;
}

const DEFAULT_CONFIG: TextMorphPlaygroundConfig = {
  words: ["DAVINCIUI", "COMPONENTS"],
  interval: 2400,
  morphDuration: 680,
};

const PRESETS = [
  { name: "DavinciUI", words: ["DAVINCIUI", "COMPONENTS"] },
  { name: "Metrics", words: ["1.2K", "8.4K", "25K"] },
  { name: "Pricing", words: ["$29", "$49", "$99"] },
] as const;

const CONTROLS: CustomizeControl[] = [
  { type: "text", key: "words", label: "Values", placeholder: "DAVINCIUI, COMPONENTS", group: "Content" },
  { type: "slider", key: "interval", label: "Rest interval", min: 800, max: 5000, step: 100, unit: "ms", group: "Timing" },
  { type: "slider", key: "morphDuration", label: "Morph duration", min: 280, max: 1200, step: 20, unit: "ms", group: "Timing" },
];

interface TextMorphPlaygroundStore {
  config: TextMorphPlaygroundConfig;
  updateConfig: (updates: Partial<TextMorphPlaygroundConfig>) => void;
  resetConfig: () => void;
}

const useTextMorphPlayground = create<TextMorphPlaygroundStore>((set) => ({
  config: DEFAULT_CONFIG,
  updateConfig: (updates) =>
    set((state) => ({ config: { ...state.config, ...updates } })),
  resetConfig: () => set({ config: DEFAULT_CONFIG }),
}));

function generateCode(config: TextMorphPlaygroundConfig) {
  return `import { TextMorph } from "@/components/ui/text-morph"

<TextMorph
  words={${JSON.stringify(config.words)}}
  interval={${config.interval}}
  morphDuration={${config.morphDuration}}
  className="text-4xl font-bold tracking-tight md:text-5xl"
/>`;
}

export function TextMorphPlayground() {
  const config = useTextMorphPlayground((state) => state.config);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const api = usePlaygroundStore.getState();
      api.registerPreviewReset("text-morph", () => useTextMorphPlayground.getState().resetConfig());
      api.setPersonalizedCode("text-morph", generateCode(config), !configEquals(config, DEFAULT_CONFIG));
    }, 180);
    return () => window.clearTimeout(timeoutId);
  }, [config]);

  return (
    <div className="flex h-full min-h-[440px] w-full items-center justify-center overflow-hidden px-8 py-16">
      <div className="text-center text-4xl font-bold tracking-tight text-foreground md:text-5xl">
        <TextMorph
          words={config.words}
          interval={config.interval}
          morphDuration={config.morphDuration}
        />
      </div>
    </div>
  );
}

export function TextMorphPersonalizePanel() {
  const config = useTextMorphPlayground((state) => state.config);
  const updateConfig = useTextMorphPlayground((state) => state.updateConfig);
  const applyControlUpdate = bindCustomizeUpdate(updateConfig);
  const values = { ...config, words: config.words.join(", ") };
  const defaults = {
    ...DEFAULT_CONFIG,
    words: DEFAULT_CONFIG.words.join(", "),
  };
  const activePreset =
    PRESETS.find((preset) => preset.words.join("|") === config.words.join("|"))
      ?.name ?? "Custom";

  return (
    <CustomizePanel
      slug="text-morph"
      controls={CONTROLS}
      values={values}
      defaults={defaults}
      onChange={(key, value) => {
        if (key === "words") {
          const words = String(value)
            .split(",")
            .map((word) => word.trim())
            .filter(Boolean)
            .slice(0, 6);
          updateConfig({ words: words.length > 0 ? words : [""] });
        } else {
          applyControlUpdate(key, value);
        }
      }}
      onReset={() => usePlaygroundStore.getState().resetPreview("text-morph")}
      presets={PRESETS.map((preset) => ({
        label: preset.name,
        value: preset.name,
      }))}
      activePreset={activePreset}
      onPresetChange={(name) => {
        const preset = PRESETS.find((candidate) => candidate.name === name);
        if (preset) updateConfig({ words: [...preset.words] });
      }}
    />
  );
}
