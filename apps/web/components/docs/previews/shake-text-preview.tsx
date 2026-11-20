"use client";

import * as React from "react";
import { create } from "zustand";
import { ShakeText } from "@workspace/ui/components/shake-text";
import { configEquals, usePlaygroundStore } from "@/hooks/use-playground-store";
import {
  CustomizePanel,
  bindCustomizeUpdate,
  type CustomizeControl,
} from "@/components/customize-panel";

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

const CONTROLS: CustomizeControl[] = [
  { type: "text", key: "text", label: "Text", placeholder: "DAVINCIUI", maxLength: 16, group: "Content" },
  { type: "slider", key: "shakeIntensity", label: "Intensity", min: 0.2, max: 2.5, step: 0.1, group: "Shake" },
  { type: "slider", key: "shakeDuration", label: "Duration", min: 0.2, max: 1.5, step: 0.05, unit: "s", group: "Shake" },
  { type: "color", key: "frontColor", label: "Foreground", defaultColor: DEFAULT_CONFIG.frontColor, group: "Colors" },
  ...DEFAULT_CONFIG.layerColors.map((color, index) => ({
    type: "color" as const,
    key: `layerColors.${index}`,
    label: `Layer ${index + 1}`,
    defaultColor: color,
    group: "Colors",
  })),
];

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
  const applyControlUpdate = bindCustomizeUpdate(update);
  const values = {
    ...config,
    ...Object.fromEntries(
      config.layerColors.map((color, index) => [`layerColors.${index}`, color]),
    ),
  };
  const defaults = {
    ...DEFAULT_CONFIG,
    ...Object.fromEntries(
      DEFAULT_CONFIG.layerColors.map((color, index) => [
        `layerColors.${index}`,
        color,
      ]),
    ),
  };

  return (
    <CustomizePanel
      slug="shake-text"
      controls={CONTROLS}
      values={values}
      defaults={defaults}
      onChange={(key, value) => {
        if (key.startsWith("layerColors.")) {
          const index = Number(key.slice("layerColors.".length));
          const layerColors = [
            ...config.layerColors,
          ] as ShakeTextPlaygroundConfig["layerColors"];
          layerColors[index] = String(value);
          update({ layerColors });
        } else if (key === "text") {
          update({ text: String(value) || "DAVINCIUI" });
        } else {
          applyControlUpdate(key, value);
        }
      }}
      onReset={() => usePlaygroundStore.getState().resetPreview("shake-text")}
    />
  );
}
