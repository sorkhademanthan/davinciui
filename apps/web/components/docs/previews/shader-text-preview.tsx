"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import {
  SHADER_TEXT_PRESETS,
  type ShaderTextPresetName,
} from "@workspace/ui/components/shader-text";
import { ShaderTextFitPreview } from "@/components/docs/previews/shader-text-fit-preview";
import { configEquals, usePlaygroundStore } from "@/hooks/use-playground-store";
import {
  CustomizePanel,
  bindCustomizeUpdate,
  type CustomizeControl,
} from "@/components/customize-panel";

interface ShaderTextPlaygroundConfig {
  text: string;
  preset: ShaderTextPresetName;
  speed: number;
  scale: number;
  softness: number;
}

const DEFAULT_CONFIG: ShaderTextPlaygroundConfig = {
  text: "DAVINCIUI",
  preset: "aurora",
  speed: 1.8,
  scale: 1.6,
  softness: 0.5,
};

const CONTROLS: CustomizeControl[] = [
  { type: "text", key: "text", label: "Text", placeholder: "DAVINCIUI", maxLength: 24, group: "Text" },
  { type: "slider", key: "speed", label: "Speed", min: 0, max: 4, step: 0.05, unit: "x", group: "Motion" },
  { type: "slider", key: "scale", label: "Scale", min: 0.4, max: 5, step: 0.05, unit: "x", group: "Motion" },
  { type: "slider", key: "softness", label: "Softness", min: 0, max: 1, step: 0.01, group: "Motion" },
];

interface ShaderTextPlaygroundStore {
  config: ShaderTextPlaygroundConfig;
  updateConfig: (updates: Partial<ShaderTextPlaygroundConfig>) => void;
  resetConfig: () => void;
}

const useShaderTextPlayground = create<ShaderTextPlaygroundStore>((set) => ({
  config: DEFAULT_CONFIG,
  updateConfig: (updates) =>
    set((state) => ({ config: { ...state.config, ...updates } })),
  resetConfig: () => set({ config: DEFAULT_CONFIG }),
}));

function generateCode(config: ShaderTextPlaygroundConfig, fontSize: number) {
  return `import { ShaderText } from "@/components/ui/shader-text"

<ShaderText
  text="${config.text}"
  preset="${config.preset}"
  fontSize={${fontSize}}
  speed={${config.speed}}
  scale={${config.scale}}
  softness={${config.softness}}
/>`;
}

export function ShaderTextPlayground() {
  const config = useShaderTextPlayground((state) => state.config);
  const [fitSize, setFitSize] = useState(80);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const api = usePlaygroundStore.getState();
      api.registerPreviewReset("shader-text", () => useShaderTextPlayground.getState().resetConfig());
      api.setPersonalizedCode("shader-text", generateCode(config, fitSize), !configEquals(config, DEFAULT_CONFIG));
    }, 180);
    return () => window.clearTimeout(timeoutId);
  }, [config, fitSize]);

  return (
    <div className="flex h-full min-h-[440px] w-full items-center justify-center overflow-hidden bg-zinc-200/70 px-8 py-16 dark:bg-[#0a0a0f]">
      <ShaderTextFitPreview
        text={config.text}
        preset={config.preset}
        fontFamily="Inter, sans-serif"
        fontWeight={800}
        speed={config.speed}
        scale={config.scale}
        softness={config.softness}
        maxFontSize={132}
        onFontSizeChange={setFitSize}
      />
    </div>
  );
}

export function ShaderTextPersonalizePanel() {
  const config = useShaderTextPlayground((state) => state.config);
  const updateConfig = useShaderTextPlayground((state) => state.updateConfig);
  const applyControlUpdate = bindCustomizeUpdate(updateConfig);

  return (
    <CustomizePanel
      slug="shader-text"
      controls={CONTROLS}
      values={config}
      defaults={DEFAULT_CONFIG}
      onChange={(key, value) => {
        if (key === "text") {
          updateConfig({ text: String(value) || " " });
        } else {
          applyControlUpdate(key, value);
        }
      }}
      onReset={() => usePlaygroundStore.getState().resetPreview("shader-text")}
      presets={SHADER_TEXT_PRESETS.map((preset) => ({
        label: preset.charAt(0).toUpperCase() + preset.slice(1),
        value: preset,
      }))}
      activePreset={config.preset}
      onPresetChange={(preset) =>
        updateConfig({ preset: preset as ShaderTextPresetName })
      }
    />
  );
}
