"use client";

import * as React from "react";
import { create } from "zustand";
import { ShakeText } from "@workspace/ui/components/shake-text";
import { configEquals, usePlaygroundStore } from "@/hooks/use-playground-store";
import {
  PlaygroundColorPicker,
  PlaygroundInput,
  PlaygroundSectionTitle,
  PlaygroundSlider,
} from "@/components/playground-primitives";

// ─────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────

interface ShakeTextPlaygroundConfig {
  text: string;
  shakeIntensity: number;
  shakeDuration: number;
  frontColor: string;
  layerColors: [string, string, string, string];
}

const DEFAULT_CONFIG: ShakeTextPlaygroundConfig = {
  text: "DAVINCIUI",
  shakeIntensity: 1,
  shakeDuration: 1.4,
  frontColor: "#fff8e7",
  layerColors: ["#50adbf", "#5f845c", "#e76168", "#fdda76"],
};

const PREVIEW_FONT_SIZE = "clamp(2.5rem, 7.5vw, 6.5rem)";

interface ShakeTextPlaygroundStore {
  config: ShakeTextPlaygroundConfig;
  updateConfig: (u: Partial<ShakeTextPlaygroundConfig>) => void;
  resetConfig: () => void;
}

const useShakeTextPlayground = create<ShakeTextPlaygroundStore>((set) => ({
  config: DEFAULT_CONFIG,
  updateConfig: (u) => set((s) => ({ config: { ...s.config, ...u } })),
  resetConfig: () => set({ config: DEFAULT_CONFIG }),
}));

function generateCode(c: ShakeTextPlaygroundConfig) {
  return `import { ShakeText } from "@/components/ui/shake-text"

<ShakeText
  text=${JSON.stringify(c.text)}
  fontSize="${PREVIEW_FONT_SIZE}"
  shakeIntensity={${c.shakeIntensity}}
  shakeDuration={${c.shakeDuration}}
  frontColor="${c.frontColor}"
  layerColors={${JSON.stringify(c.layerColors)}}
/>`;
}

// ─────────────────────────────────────────────────────────────
// Playground — light stage that fills the preview pane
// ─────────────────────────────────────────────────────────────

export function ShakeTextPlayground() {
  const config = useShakeTextPlayground((s) => s.config);

  React.useEffect(() => {
    const t = window.setTimeout(() => {
      const api = usePlaygroundStore.getState();
      api.registerPreviewReset("shake-text", () => useShakeTextPlayground.getState().resetConfig());
      api.setPersonalizedCode("shake-text", generateCode(config), !configEquals(config, DEFAULT_CONFIG));
    }, 180);
    return () => window.clearTimeout(t);
  }, [config]);

  return (
    <div className="flex h-full min-h-[420px] w-full items-center justify-center overflow-hidden bg-[#e8e6e1] p-6 dark:bg-[#111111] lg:min-h-[520px]">
      <ShakeText
        text={config.text}
        fontSize={PREVIEW_FONT_SIZE}
        shakeIntensity={config.shakeIntensity}
        shakeDuration={config.shakeDuration}
        frontColor={config.frontColor}
        layerColors={config.layerColors}
      />
    </div>
  );
}

export function ShakeTextPreview() {
  return <ShakeTextPlayground />;
}

// ─────────────────────────────────────────────────────────────
// Personalize panel
// ─────────────────────────────────────────────────────────────

export function ShakeTextPersonalizePanel() {
  const config = useShakeTextPlayground((s) => s.config);
  const update = useShakeTextPlayground((s) => s.updateConfig);
  const reset = useShakeTextPlayground((s) => s.resetConfig);

  const updateLayerColor = (index: number, color: string) => {
    const layerColors = [...config.layerColors] as [string, string, string, string];
    layerColors[index] = color;
    update({ layerColors });
  };

  return (
    <div className="h-full overflow-auto bg-background [scrollbar-width:thin]">
      <div className="space-y-7 px-4 pb-10 pt-5">
        <header className="space-y-2">
          <p className="text-sm leading-relaxed text-muted-foreground/90">
            Tune the continuous layered motion, content and colors.
          </p>
        </header>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={reset}
            className="rounded-md border border-border/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            Reset
          </button>
        </div>

        <div>
          <PlaygroundSectionTitle>Content</PlaygroundSectionTitle>
          <PlaygroundInput
            value={config.text}
            onChange={(e) => update({ text: e.target.value.slice(0, 16) || "DAVINCIUI" })}
            placeholder="DAVINCIUI"
          />
        </div>

        <div className="space-y-4">
          <PlaygroundSectionTitle>Shake</PlaygroundSectionTitle>
          <PlaygroundSlider label="Intensity" min={0.2} max={2.5} step={0.1} value={config.shakeIntensity} onChange={(v) => update({ shakeIntensity: v })} />
          <PlaygroundSlider label="Duration" min={0.2} max={1.5} step={0.05} value={config.shakeDuration} unit="s" onChange={(v) => update({ shakeDuration: v })} />
        </div>

        <div className="space-y-3">
          <PlaygroundSectionTitle>Colors</PlaygroundSectionTitle>
          <PlaygroundColorPicker
            label="Foreground"
            value={config.frontColor}
            onChange={(frontColor) => update({ frontColor })}
            defaultColor="#fff8e7"
          />
          {config.layerColors.map((color, index) => (
            <PlaygroundColorPicker
              key={index}
              label={`Layer ${index + 1}`}
              value={color}
              onChange={(value) => updateLayerColor(index, value)}
              defaultColor={DEFAULT_CONFIG.layerColors[index]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
