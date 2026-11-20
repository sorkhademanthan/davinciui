"use client";

import { useEffect } from "react";
import { LiquidChrome } from "@workspace/ui/components/liquid-chrome";
import {
  LIQUID_CHROME_DEFAULT_CONFIG,
  type LiquidChromeConfig,
  configEquals,
  usePlaygroundStore,
} from "@/hooks/use-playground-store";
import {
  CustomizePanel,
  bindCustomizeUpdate,
  type CustomizeControl,
} from "@/components/customize-panel";

const PRESETS: Array<{ name: string; config: LiquidChromeConfig }> = [
  {
    name: "Default",
    config: LIQUID_CHROME_DEFAULT_CONFIG,
  },
  {
    name: "Purple",
    config: {
      baseColor: "#4c1d95",
      speed: 1.2,
      amplitude: 0.8,
    },
  },
  {
    name: "Fast Ripple",
    config: {
      baseColor: "#e5e7eb",
      speed: 3.0,
      amplitude: 0.5,
    },
  },
  {
    name: "Gold",
    config: {
      baseColor: "#ca8a04",
      speed: 0.8,
      amplitude: 1.2,
    },
  },
];

const CONTROLS: CustomizeControl[] = [
  { type: "color", key: "baseColor", label: "Base color", group: "Palette" },
  { type: "slider", key: "speed", label: "Speed", min: 0.1, max: 5, step: 0.1, unit: "x", group: "Motion" },
  { type: "slider", key: "amplitude", label: "Distortion amplitude", min: 0.1, max: 3, step: 0.1, group: "Motion" },
];

function hexToRgbArray(hex: string): [number, number, number] {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex[0]! + hex[0]! + hex[1]! + hex[1]! + hex[2]! + hex[2]!;
  }
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r / 255, g / 255, b / 255];
}

function generateCode(config: LiquidChromeConfig) {
  const rgb = hexToRgbArray(config.baseColor);
  const rgbString = `[${rgb[0].toFixed(2)}, ${rgb[1].toFixed(2)}, ${rgb[2].toFixed(2)}]`;
  
  return `<LiquidChrome 
  baseColor={${rgbString}}
  speed={${config.speed}}
  amplitude={${config.amplitude}}
  interactive={true}
/>`;
}

export function LiquidChromePlayground() {
  const config = usePlaygroundStore((state) => state.liquidChromeConfig);
  const renderVersion = usePlaygroundStore((state) => state.liquidChromeRenderVersion);

  useEffect(() => {
    const code = generateCode(config);
    const timeoutId = setTimeout(() => {
      const api = usePlaygroundStore.getState();
      api.registerPreviewReset("liquid-chrome", () => api.resetLiquidChromeConfig());
      api.setPersonalizedCode("liquid-chrome", code, !configEquals(config, LIQUID_CHROME_DEFAULT_CONFIG));
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [config]);

  const rgbArray = hexToRgbArray(config.baseColor);

  return (
    <div className="relative h-full w-full bg-[#f3f4f6] dark:bg-background">
      <div className="relative h-full w-full overflow-hidden rounded-none">
        <LiquidChrome
          key={renderVersion}
          baseColor={rgbArray}
          speed={config.speed}
          amplitude={config.amplitude}
          interactive={true}
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </div>
  );
}

export function LiquidChromePersonalizePanel() {
  const config = usePlaygroundStore((state) => state.liquidChromeConfig);
  const activePreset = usePlaygroundStore((state) => state.activeLiquidChromePreset);
  const setConfig = usePlaygroundStore((state) => state.setLiquidChromeConfig);
  const setActivePreset = usePlaygroundStore((state) => state.setActiveLiquidChromePreset);
  const updateConfig = usePlaygroundStore((state) => state.updateLiquidChromeConfig);
  const resetPreview = usePlaygroundStore((state) => state.resetLiquidChromePreview);

  const handleChange = (key: keyof LiquidChromeConfig, value: string | number) => {
    updateConfig({ [key]: value } as Partial<LiquidChromeConfig>);

    if (activePreset === "Custom") {
      return;
    }

    const matchedPreset = PRESETS.find(
      (preset) => JSON.stringify(preset.config) === JSON.stringify({ ...config, [key]: value }),
    );
    setActivePreset(matchedPreset?.name ?? "Custom");
  };

  const handlePresetChange = (presetName: string) => {
    const preset = PRESETS.find((item) => item.name === presetName);
    if (!preset) {
      return;
    }

    setConfig({ ...preset.config });
    setActivePreset(presetName);
    resetPreview();
  };

  const update = (updates: Partial<LiquidChromeConfig>) => {
    if (updates.baseColor !== undefined) {
      handleChange("baseColor", updates.baseColor);
    }
    if (updates.speed !== undefined) {
      handleChange("speed", updates.speed);
    }
    if (updates.amplitude !== undefined) {
      handleChange("amplitude", updates.amplitude);
    }
  };

  return (
    <CustomizePanel
      slug="liquid-chrome"
      controls={CONTROLS}
      values={config}
      defaults={LIQUID_CHROME_DEFAULT_CONFIG}
      onChange={bindCustomizeUpdate(update)}
      onReset={() => usePlaygroundStore.getState().resetPreview("liquid-chrome")}
      presets={PRESETS.map((preset) => ({ label: preset.name, value: preset.name }))}
      activePreset={activePreset}
      onPresetChange={handlePresetChange}
    />
  );
}
