"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { create } from "zustand";
import { EncryptedText } from "@workspace/ui/components/encrypted-text";
import { configEquals, usePlaygroundStore } from "@/hooks/use-playground-store";
import { CustomizePanel, type CustomizeControl } from "@/components/customize-panel";

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

const CONTROLS: CustomizeControl[] = [
  { type: "text", key: "text", label: "Message", placeholder: "DAVINCIUI", maxLength: 18 },
  { type: "slider", key: "scrambleDuration", label: "Encrypted phase", min: 100, max: 1600, step: 20, unit: "ms" },
  { type: "slider", key: "revealDuration", label: "Decryption", min: 300, max: 2600, step: 20, unit: "ms" },
  { type: "slider", key: "holdDuration", label: "Readable hold", min: 300, max: 3200, step: 50, unit: "ms" },
  { type: "color", key: "encryptedColor", label: "Encrypted", defaultColor: "#5f845c" },
  { type: "color", key: "revealedColor", label: "Decrypted", defaultColor: "#f5f5f4" },
];

export function EncryptedTextPersonalizePanel() {
  const config = useEncryptedTextStore((state) => state.config);
  const updateConfig = useEncryptedTextStore((state) => state.updateConfig);

  return (
    <CustomizePanel
      slug="encrypted-text"
      controls={CONTROLS}
      values={config}
      defaults={DEFAULT_CONFIG}
      onChange={(key, value) => {
        if (key === "text") {
          updateConfig({
            text:
              String(value).slice(0, 18).toUpperCase() || "DAVINCIUI",
          });
        } else {
          updateConfig({ [key]: value } as Partial<EncryptedTextConfig>);
        }
      }}
      onReset={() => usePlaygroundStore.getState().resetPreview("encrypted-text")}
    />
  );
}
