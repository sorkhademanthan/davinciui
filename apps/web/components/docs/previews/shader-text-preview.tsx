"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import {
  SHADER_TEXT_PRESETS,
  type ShaderTextPresetName,
} from "@workspace/ui/components/shader-text";
import { ShaderTextFitPreview } from "@/components/docs/previews/shader-text-fit-preview";
import { cn } from "@/lib/utils";
import { configEquals, usePlaygroundStore } from "@/hooks/use-playground-store";
import {
  PlaygroundInput,
  PlaygroundSectionTitle,
  PlaygroundSlider,
} from "@/components/playground-primitives";

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
  const resetConfig = useShaderTextPlayground((state) => state.resetConfig);

  return (
    <div className="h-full overflow-auto bg-background [scrollbar-width:thin]">
      <div className="space-y-7 px-4 pb-10 pt-5">
        <header className="space-y-2">
          <p className="text-sm leading-relaxed text-muted-foreground/90">
            Pick a fragment-shader preset, then tune the flow. Every preset is a
            different GLSL program clipped inside the glyphs.
          </p>
        </header>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={resetConfig}
            className="rounded-md border border-border/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            Reset
          </button>
        </div>

        <div>
          <PlaygroundSectionTitle>Preset</PlaygroundSectionTitle>
          <div className="grid grid-cols-3 gap-1.5">
            {SHADER_TEXT_PRESETS.map((preset) => {
              const active = preset === config.preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => updateConfig({ preset })}
                  className={cn(
                    "rounded-md border px-2 py-2 font-mono text-[10px] capitalize tracking-wide transition-colors",
                    active
                      ? "border-foreground/25 text-foreground shadow-sm"
                      : "border-border/70 text-muted-foreground",
                  )}
                >
                  {preset}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <PlaygroundSectionTitle>Text</PlaygroundSectionTitle>
          <PlaygroundInput
            value={config.text}
            onChange={(event) =>
              updateConfig({ text: event.target.value.slice(0, 24) || " " })
            }
            placeholder="DAVINCIUI"
          />
        </div>

        <div className="space-y-3">
          <PlaygroundSectionTitle>Motion</PlaygroundSectionTitle>
          <PlaygroundSlider
            label="Speed"
            min={0}
            max={4}
            step={0.05}
            value={config.speed}
            unit="x"
            onChange={(speed) => updateConfig({ speed })}
          />
          <PlaygroundSlider
            label="Scale"
            min={0.4}
            max={5}
            step={0.05}
            value={config.scale}
            unit="x"
            onChange={(scale) => updateConfig({ scale })}
          />
          <PlaygroundSlider
            label="Softness"
            min={0}
            max={1}
            step={0.01}
            value={config.softness}
            onChange={(softness) => updateConfig({ softness })}
          />
        </div>
      </div>
    </div>
  );
}
