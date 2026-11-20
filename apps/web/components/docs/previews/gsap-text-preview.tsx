"use client";

import * as React from "react";
import { create } from "zustand";
import { KineticText, type KineticTextDirection } from "@workspace/ui/components/gsap-text";
import { configEquals, usePlaygroundStore } from "@/hooks/use-playground-store";
import { CustomizePanel, type CustomizeControl } from "@/components/customize-panel";

// ─────────────────────────────────────────────────────────────
// Store — canonical KineticText props, exact Framer reference
// as the default showcase.
// ─────────────────────────────────────────────────────────────

interface KineticTextPlaygroundConfig {
  text: string;
  layerCount: number;
  distance: number;
  duration: number;
  direction: KineticTextDirection;
}

const DEFAULT_CONFIG: KineticTextPlaygroundConfig = {
  text: "DAVINCIUI",
  layerCount: 10,
  distance: 300,
  duration: 7,
  direction: "both",
};

const PRESETS: Array<{ name: string; config: KineticTextPlaygroundConfig }> = [
  { name: "Both", config: { text: "DAVINCIUI", layerCount: 10, distance: 300, duration: 7, direction: "both" } },
  { name: "Up", config: { text: "DAVINCIUI", layerCount: 10, distance: 300, duration: 7, direction: "up" } },
  { name: "Down", config: { text: "DAVINCIUI", layerCount: 10, distance: 300, duration: 7, direction: "down" } },
];

interface KineticTextPlaygroundStore {
  config: KineticTextPlaygroundConfig;
  updateConfig: (u: Partial<KineticTextPlaygroundConfig>) => void;
  resetConfig: () => void;
}

const useKineticTextPlayground = create<KineticTextPlaygroundStore>((set) => ({
  config: DEFAULT_CONFIG,
  updateConfig: (u) => set((s) => ({ config: { ...s.config, ...u } })),
  resetConfig: () => set({ config: DEFAULT_CONFIG }),
}));

function generateCode(c: KineticTextPlaygroundConfig) {
  return `import { KineticText } from "@/components/ui/gsap-text"

<KineticText
  text=${JSON.stringify(c.text)}
  direction=${JSON.stringify(c.direction)}
  layerCount={${c.layerCount}}
  distance={${c.distance}}
  duration={${c.duration}}
/>`;
}

// ─────────────────────────────────────────────────────────────
// Playground — full-bleed black stage that fills the preview pane
// ─────────────────────────────────────────────────────────────

export function GSAPTextPlayground() {
  const config = useKineticTextPlayground((s) => s.config);

  React.useEffect(() => {
    const t = window.setTimeout(() => {
      const api = usePlaygroundStore.getState();
      api.registerPreviewReset("gsap-text", () => useKineticTextPlayground.getState().resetConfig());
      api.setPersonalizedCode("gsap-text", generateCode(config), !configEquals(config, DEFAULT_CONFIG));
    }, 180);
    return () => window.clearTimeout(t);
  }, [config]);

  return (
    <div className="flex h-full min-h-[420px] w-full items-center justify-center overflow-hidden bg-background p-6 lg:min-h-[520px]">
      <KineticText
        text={config.text}
        htmlTag="h1"
        textClassName="scale-x-[1.04]"
        direction={config.direction}
        layerCount={config.layerCount}
        distance={config.distance}
        duration={config.duration}
      />
    </div>
  );
}

export function GSAPTextPreview() {
  return <GSAPTextPlayground />;
}

// ─────────────────────────────────────────────────────────────
// Personalize panel
// ─────────────────────────────────────────────────────────────

const CONTROLS: CustomizeControl[] = [
  { type: "text", key: "text", label: "Content", placeholder: "DAVINCIUI", maxLength: 32 },
  { type: "slider", key: "layerCount", label: "Layers", min: 1, max: 30, step: 1 },
  { type: "slider", key: "distance", label: "Distance", min: 40, max: 500, step: 10, unit: "px" },
  { type: "slider", key: "duration", label: "Duration", min: 0.5, max: 12, step: 0.5, unit: "s" },
  {
    type: "select",
    key: "direction",
    label: "Direction",
    options: [
      { label: "Up", value: "up" },
      { label: "Down", value: "down" },
      { label: "Both", value: "both" },
    ],
  },
];

export function GSAPTextPersonalizePanel() {
  const config = useKineticTextPlayground((s) => s.config);
  const update = useKineticTextPlayground((s) => s.updateConfig);
  const activePreset = PRESETS.find(
    (p) => p.config.text === config.text && p.config.direction === config.direction,
  )?.name;

  return (
    <CustomizePanel
      slug="gsap-text"
      controls={CONTROLS}
      values={config}
      defaults={DEFAULT_CONFIG}
      onChange={(key, value) => {
        if (key === "text") {
          update({ text: String(value).slice(0, 32) || "DAVINCIUI" });
        } else {
          update({ [key]: value } as Partial<KineticTextPlaygroundConfig>);
        }
      }}
      onReset={() => usePlaygroundStore.getState().resetPreview("gsap-text")}
      presets={PRESETS.map((p) => ({ label: p.name, value: p.name }))}
      activePreset={activePreset}
      onPresetChange={(name) => {
        const preset = PRESETS.find((p) => p.name === name);
        if (preset) update({ ...preset.config });
      }}
    />
  );
}
