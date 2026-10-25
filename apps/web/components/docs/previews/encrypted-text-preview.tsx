"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { create } from "zustand";
import { EncryptedText } from "@workspace/ui/components/encrypted-text";
import { configEquals, usePlaygroundStore } from "@/hooks/use-playground-store";
import {
  PlaygroundColorPicker,
  PlaygroundInput,
  PlaygroundSectionTitle,
  PlaygroundSlider,
} from "@/components/playground-primitives";

interface EncryptedTextConfig {
  text: string;
  scrambleDuration: number;
  revealDuration: number;
  holdDuration: number;
  encryptedColor: string;
  revealedColor: string;
}

const DEFAULT_CONFIG: EncryptedTextConfig = {
  text: "DAVINCIUI",
  scrambleDuration: 520,
  revealDuration: 1100,
  holdDuration: 1500,
  encryptedColor: "#5f845c",
  revealedColor: "#f5f5f4",
};

const PREVIEW_FONT_SIZE = "clamp(2rem, 7vw, 5.25rem)";

interface EncryptedTextStore {
  config: EncryptedTextConfig;
  updateConfig: (updates: Partial<EncryptedTextConfig>) => void;
  resetConfig: () => void;
}

const useEncryptedTextStore = create<EncryptedTextStore>((set) => ({
  config: DEFAULT_CONFIG,
  updateConfig: (updates) =>
    set((state) => ({ config: { ...state.config, ...updates } })),
  resetConfig: () => set({ config: DEFAULT_CONFIG }),
}));

function generateCode(config: EncryptedTextConfig) {
  return `import { EncryptedText } from "@/components/ui/encrypted-text"

<EncryptedText
  text=${JSON.stringify(config.text)}
  fontSize="${PREVIEW_FONT_SIZE}"
  scrambleDuration={${config.scrambleDuration}}
  revealDuration={${config.revealDuration}}
  holdDuration={${config.holdDuration}}
  encryptedColor="${config.encryptedColor}"
  revealedColor="${config.revealedColor}"
/>`;
}

export function EncryptedTextPlayground() {
  const config = useEncryptedTextStore((state) => state.config);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const encryptedColor =
    config.encryptedColor === DEFAULT_CONFIG.encryptedColor
      ? isDark
        ? "#8fb58b"
        : "#466944"
      : config.encryptedColor;
  const revealedColor =
    config.revealedColor === DEFAULT_CONFIG.revealedColor
      ? isDark
        ? "#f5f5f4"
        : "#18181b"
      : config.revealedColor;

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const api = usePlaygroundStore.getState();
      api.registerPreviewReset("encrypted-text", () => useEncryptedTextStore.getState().resetConfig());
      api.setPersonalizedCode("encrypted-text", generateCode(config), !configEquals(config, DEFAULT_CONFIG));
    }, 180);
    return () => window.clearTimeout(timeoutId);
  }, [config]);

  return (
    <div className="flex h-full min-h-[420px] w-full items-center justify-center overflow-hidden bg-[#f6f7f2] px-6 py-16 dark:bg-[#0c100d] lg:min-h-[520px]">
      <EncryptedText
        text={config.text}
        fontSize={PREVIEW_FONT_SIZE}
        scrambleDuration={config.scrambleDuration}
        revealDuration={config.revealDuration}
        holdDuration={config.holdDuration}
        encryptedColor={encryptedColor}
        revealedColor={revealedColor}
      />
    </div>
  );
}

export function EncryptedTextPersonalizePanel() {
  const config = useEncryptedTextStore((state) => state.config);
  const updateConfig = useEncryptedTextStore((state) => state.updateConfig);
  const resetConfig = useEncryptedTextStore((state) => state.resetConfig);

  return (
    <div className="h-full overflow-auto bg-background [scrollbar-width:thin]">
      <div className="space-y-7 px-4 pb-10 pt-5">
        <header className="space-y-2">
          <p className="text-sm leading-relaxed text-muted-foreground/90">
            Set the resolved message, cipher timing and two text states.
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
          <PlaygroundSectionTitle>Message</PlaygroundSectionTitle>
          <PlaygroundInput
            value={config.text}
            onChange={(event) =>
              updateConfig({
                text:
                  event.target.value.slice(0, 18).toUpperCase() || "DAVINCIUI",
              })
            }
            placeholder="DAVINCIUI"
          />
        </div>

        <div className="space-y-4">
          <PlaygroundSectionTitle>Timing</PlaygroundSectionTitle>
          <PlaygroundSlider
            label="Encrypted phase"
            min={100}
            max={1600}
            step={20}
            value={config.scrambleDuration}
            unit="ms"
            onChange={(scrambleDuration) => updateConfig({ scrambleDuration })}
          />
          <PlaygroundSlider
            label="Decryption"
            min={300}
            max={2600}
            step={20}
            value={config.revealDuration}
            unit="ms"
            onChange={(revealDuration) => updateConfig({ revealDuration })}
          />
          <PlaygroundSlider
            label="Readable hold"
            min={300}
            max={3200}
            step={50}
            value={config.holdDuration}
            unit="ms"
            onChange={(holdDuration) => updateConfig({ holdDuration })}
          />
        </div>

        <div className="space-y-3">
          <PlaygroundSectionTitle>Colors</PlaygroundSectionTitle>
          <PlaygroundColorPicker
            label="Encrypted"
            value={config.encryptedColor}
            onChange={(encryptedColor) => updateConfig({ encryptedColor })}
            defaultColor="#5f845c"
          />
          <PlaygroundColorPicker
            label="Decrypted"
            value={config.revealedColor}
            onChange={(revealedColor) => updateConfig({ revealedColor })}
            defaultColor="#f5f5f4"
          />
        </div>
      </div>
    </div>
  );
}
