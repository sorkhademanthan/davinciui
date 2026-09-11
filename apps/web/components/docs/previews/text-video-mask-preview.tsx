"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { create } from "zustand";
import { TextVideoMask } from "@workspace/ui/components/text-video-mask";
import { usePlaygroundStore } from "@/hooks/use-playground-store";
import {
  PlaygroundColorPicker,
  PlaygroundInput,
  PlaygroundSectionTitle,
  PlaygroundSlider,
} from "@/components/playground-primitives";
import { cn } from "@/lib/utils";

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

function resolveColors(config: TextVideoMaskConfig, isDark: boolean) {
  return {
    backgroundColor:
      config.backgroundColor === DEFAULT_CONFIG.backgroundColor
        ? isDark
          ? "#000000"
          : "#f8fafc"
        : config.backgroundColor,
    fallbackColor:
      config.fallbackColor === DEFAULT_CONFIG.fallbackColor
        ? isDark
          ? "#f5f5f5"
          : "#18181b"
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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const colors = resolveColors(config, isDark);

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      usePlaygroundStore.getState().setCode(generateCode(config, colors));
    }, 180);
    return () => window.clearTimeout(timeoutId);
  }, [config, colors.backgroundColor, colors.fallbackColor]);

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
  const resetConfig = useTextVideoMaskStore((state) => state.resetConfig);

  return (
    <div className="h-full overflow-auto bg-background [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="space-y-7 px-4 pb-10 pt-20">
        <header className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tighter text-foreground">
            Personalize
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground/90">
            Set the mask text, footage fit and which area of the video shows
            through the glyphs.
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
                text: event.target.value.slice(0, 24) || "DAVINCI.",
              })
            }
            placeholder="DAVINCI."
          />
        </div>

        <div className="space-y-3">
          <PlaygroundSectionTitle>Video Fit</PlaygroundSectionTitle>
          <div className="grid grid-cols-3 gap-1.5">
            {VIDEO_FIT_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => updateConfig({ videoFit: option })}
                className={cn(
                  "rounded-md border px-2 py-2 text-xs font-semibold capitalize transition-colors",
                  config.videoFit === option
                    ? "border-foreground/60 bg-foreground text-background"
                    : "border-border/70 text-muted-foreground hover:text-foreground",
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <PlaygroundSectionTitle>Video Position</PlaygroundSectionTitle>
          <PlaygroundSlider
            label="Position X"
            min={0}
            max={100}
            step={1}
            value={config.positionX}
            unit="%"
            onChange={(positionX) => updateConfig({ positionX })}
          />
          <PlaygroundSlider
            label="Position Y"
            min={0}
            max={100}
            step={1}
            value={config.positionY}
            unit="%"
            onChange={(positionY) => updateConfig({ positionY })}
          />
        </div>

        <div className="space-y-3">
          <PlaygroundSectionTitle>Colors</PlaygroundSectionTitle>
          <PlaygroundColorPicker
            label="Background"
            value={config.backgroundColor}
            onChange={(backgroundColor) => updateConfig({ backgroundColor })}
            defaultColor="#000000"
          />
          <PlaygroundColorPicker
            label="Fallback text"
            value={config.fallbackColor}
            onChange={(fallbackColor) => updateConfig({ fallbackColor })}
            defaultColor="#FFFFFF"
          />
        </div>
      </div>
    </div>
  );
}
