"use client";

import * as React from "react";
import { create } from "zustand";
import { TextVideoMask } from "@workspace/ui/components/text-video-mask";
import { configEquals, usePlaygroundStore } from "@/hooks/use-playground-store";
import {
  CustomizePanel,
  bindCustomizeUpdate,
  type CustomizeControl,
} from "@/components/customize-panel";

export const TEXT_VIDEO_MASK_SAMPLE_VIDEO =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

type VideoFitOption = "cover" | "contain" | "fill";

interface TextVideoMaskConfig {
  text: string;
  videoFit: VideoFitOption;
  positionX: number;
  positionY: number;
  backgroundColor: string;
  fallbackColor: string;
}

const DEFAULT_CONFIG: TextVideoMaskConfig = {
  text: "DAVINCI.",
  videoFit: "cover",
  positionX: 20,
  positionY: 30,
  backgroundColor: "#000000",
  fallbackColor: "#FFFFFF",
};

const VIDEO_FIT_OPTIONS: VideoFitOption[] = ["cover", "contain", "fill"];

const CONTROLS: CustomizeControl[] = [
  { type: "text", key: "text", label: "Message", placeholder: "DAVINCI.", maxLength: 24, group: "Content" },
  { type: "select", key: "videoFit", label: "Video fit", options: VIDEO_FIT_OPTIONS.map((option) => ({ label: option.charAt(0).toUpperCase() + option.slice(1), value: option })), group: "Video" },
  { type: "slider", key: "positionX", label: "Position X", min: 0, max: 100, step: 1, unit: "%", group: "Video position" },
  { type: "slider", key: "positionY", label: "Position Y", min: 0, max: 100, step: 1, unit: "%", group: "Video position" },
  { type: "color", key: "backgroundColor", label: "Background", defaultColor: DEFAULT_CONFIG.backgroundColor, group: "Colors" },
  { type: "color", key: "fallbackColor", label: "Fallback text", defaultColor: DEFAULT_CONFIG.fallbackColor, group: "Colors" },
];

interface TextVideoMaskStore {
  config: TextVideoMaskConfig;
  updateConfig: (updates: Partial<TextVideoMaskConfig>) => void;
  resetConfig: () => void;
}

const useTextVideoMaskStore = create<TextVideoMaskStore>((set) => ({
  config: DEFAULT_CONFIG,
  updateConfig: (updates) =>
    set((state) => ({ config: { ...state.config, ...updates } })),
  resetConfig: () => set({ config: DEFAULT_CONFIG }),
}));

/**
 * Defaults follow the site's theme tokens instead of branching on
 * `useTheme()`. CSS variables resolve from the `.dark` class before paint,
 * so the preview is correct on first frame and during video capture.
 */
function resolveColors(config: TextVideoMaskConfig) {
  return {
    backgroundColor:
      config.backgroundColor === DEFAULT_CONFIG.backgroundColor
        ? "var(--background)"
        : config.backgroundColor,
    fallbackColor:
      config.fallbackColor === DEFAULT_CONFIG.fallbackColor
        ? "var(--foreground)"
        : config.fallbackColor,
  };
}

function generateCode(
  config: TextVideoMaskConfig,
  colors: { backgroundColor: string; fallbackColor: string },
) {
  return `import { TextVideoMask } from "@/components/ui/text-video-mask"

<TextVideoMask
  text=${JSON.stringify(config.text)}
  src="${TEXT_VIDEO_MASK_SAMPLE_VIDEO}"
  videoFit="${config.videoFit}"
  positionX={${config.positionX}}
  positionY={${config.positionY}}
  horizontalPadding={0}
  backgroundColor="${colors.backgroundColor}"
  fallbackColor="${colors.fallbackColor}"
  className="h-[560px] w-full"
/>`;
}

export function TextVideoMaskPlayground() {
  const config = useTextVideoMaskStore((state) => state.config);
  const colors = resolveColors(config);
  const { backgroundColor, fallbackColor } = colors;

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const api = usePlaygroundStore.getState();
      api.registerPreviewReset("text-video-mask", () => useTextVideoMaskStore.getState().resetConfig());
      api.setPersonalizedCode(
        "text-video-mask",
        generateCode(config, { backgroundColor, fallbackColor }),
        !configEquals(config, DEFAULT_CONFIG),
      );
    }, 180);
    return () => window.clearTimeout(timeoutId);
  }, [config, backgroundColor, fallbackColor]);

  return (
    <TextVideoMask
      text={config.text || "DAVINCI."}
      src={TEXT_VIDEO_MASK_SAMPLE_VIDEO}
      videoFit={config.videoFit}
      positionX={config.positionX}
      positionY={config.positionY}
      horizontalPadding={0}
      backgroundColor={colors.backgroundColor}
      fallbackColor={colors.fallbackColor}
      className="h-full w-full"
    />
  );
}

export function TextVideoMaskPersonalizePanel() {
  const config = useTextVideoMaskStore((state) => state.config);
  const updateConfig = useTextVideoMaskStore((state) => state.updateConfig);
  const applyControlUpdate = bindCustomizeUpdate(updateConfig);

  return (
    <CustomizePanel
      slug="text-video-mask"
      controls={CONTROLS}
      values={config}
      defaults={DEFAULT_CONFIG}
      onChange={(key, value) => {
        if (key === "text") {
          updateConfig({ text: String(value) || "DAVINCI." });
        } else {
          applyControlUpdate(key, value);
        }
      }}
      onReset={() =>
        usePlaygroundStore.getState().resetPreview("text-video-mask")
      }
    />
  );
}
