"use client";

import * as React from "react";
import { create } from "zustand";
import { useTheme } from "next-themes";
import {
  MediaTextHover,
  type MediaTextHoverMode,
} from "@workspace/ui/components/media-text-hover";
import { configEquals, usePlaygroundStore } from "@/hooks/use-playground-store";
import {
  CustomizePanel,
  bindCustomizeUpdate,
  type CustomizeControl,
} from "@/components/customize-panel";

const PREVIEW_VIDEO =
  "/preview-videos/component-animations/spiral3dslider.mp4";

interface MediaTextHoverConfig {
  text: string;
  mode: MediaTextHoverMode;
  splitIndex: number;
  mediaWidth: number;
  mediaHeight: number;
  mediaRadius: number;
  fontSize: number;
  springStiffness: number;
  springDamping: number;
}

const DEFAULT_CONFIG: MediaTextHoverConfig = {
  text: "DAVINCIUI",
  mode: "fixed",
  splitIndex: 5,
  // 2:1 media window, height matched to the exact cap-height of the 92px
  // Impact headline (~64px) — same proportions as the gallery card (42×21).
  // Shared by the right-side preview and fullscreen mode.
  mediaWidth: 128,
  mediaHeight: 64,
  mediaRadius: 0,
  fontSize: 92,
  springStiffness: 260,
  springDamping: 30,
};

interface MediaTextHoverStore {
  config: MediaTextHoverConfig;
  update: (updates: Partial<MediaTextHoverConfig>) => void;
  reset: () => void;
}

const useMediaTextHoverStore = create<MediaTextHoverStore>((set) => ({
  config: DEFAULT_CONFIG,
  update: (updates) =>
    set((state) => ({ config: { ...state.config, ...updates } })),
  reset: () => set({ config: DEFAULT_CONFIG }),
}));

function generateCode(config: MediaTextHoverConfig): string {
  return `import { MediaTextHover } from "@/components/ui/media-text-hover"

<MediaTextHover
  text=${JSON.stringify(config.text)}
  splitIndex={${config.splitIndex}}
  mode=${JSON.stringify(config.mode)}
  mediaSrc="/videos/brand-film.mp4"
  mediaWidth={${config.mediaWidth}}
  mediaHeight={${config.mediaHeight}}
  mediaRadius={${config.mediaRadius}}
  fontSize={${config.fontSize}}
  springStiffness={${config.springStiffness}}
  springDamping={${config.springDamping}}
/>`;
}

export function MediaTextHoverPlayground() {
  const config = useMediaTextHoverStore((state) => state.config);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const api = usePlaygroundStore.getState();
      api.registerPreviewReset("media-text-hover", () => useMediaTextHoverStore.getState().reset());
      api.setPersonalizedCode("media-text-hover", generateCode(config), !configEquals(config, DEFAULT_CONFIG));
    }, 180);
    return () => window.clearTimeout(timeoutId);
  }, [config]);

  return (
    <div className="flex h-full min-h-[440px] w-full items-center justify-center overflow-hidden bg-zinc-100 px-4 py-16 dark:bg-black lg:min-h-[520px]">
      <MediaTextHover
        text={config.text}
        splitIndex={Math.min(config.splitIndex, config.text.length)}
        mode={config.mode}
        mediaSrc={PREVIEW_VIDEO}
        mediaWidth={config.mediaWidth}
        mediaHeight={config.mediaHeight}
        mediaRadius={config.mediaRadius}
        fontFamily="Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif"
        fontSize={`clamp(2.75rem, ${config.fontSize / 11}vw, ${config.fontSize}px)`}
        fontWeight={400}
        letterSpacing="-0.025em"
        textColor={isDark ? "#ffffff" : "#18181b"}
        springStiffness={config.springStiffness}
        springDamping={config.springDamping}
        className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-white/70"
      />
    </div>
  );
}

export function MediaTextHoverPersonalizePanel() {
  const config = useMediaTextHoverStore((state) => state.config);
  const update = useMediaTextHoverStore((state) => state.update);
  const updateValue = bindCustomizeUpdate(update);
  const maxSplit = Math.max(1, Array.from(config.text).length - 1);

  const controls: CustomizeControl[] = [
    { type: "text", key: "text", label: "Text", placeholder: "DAVINCIUI", maxLength: 20, group: "Content" },
    { type: "slider", key: "splitIndex", label: "Split position", min: 1, max: maxSplit, step: 1, group: "Content" },
    { type: "select", key: "mode", label: "Mode", options: [
      { label: "Fixed", value: "fixed" },
      { label: "Dynamic", value: "dynamic" },
    ], group: "Content" },
    { type: "slider", key: "mediaWidth", label: "Width", min: 80, max: 360, step: 4, unit: "px", group: "Media window" },
    { type: "slider", key: "mediaHeight", label: "Height", min: 48, max: 160, step: 2, unit: "px", group: "Media window" },
    { type: "slider", key: "mediaRadius", label: "Corner radius", min: 0, max: 48, step: 1, unit: "px", group: "Media window" },
    { type: "slider", key: "fontSize", label: "Type size", min: 48, max: 130, step: 1, unit: "px", group: "Media window" },
    { type: "slider", key: "springStiffness", label: "Stiffness", min: 80, max: 500, step: 10, group: "Spring" },
    { type: "slider", key: "springDamping", label: "Damping", min: 10, max: 60, step: 1, group: "Spring" },
  ];

  return (
    <CustomizePanel
      slug="media-text-hover"
      controls={controls}
      values={config}
      defaults={DEFAULT_CONFIG}
      onChange={(key, value) => {
        if (key === "text") {
          const text = String(value).slice(0, 20).toUpperCase() || " ";
          update({
            text,
            splitIndex: Math.min(
              config.splitIndex,
              Math.max(1, text.length - 1),
            ),
          });
          return;
        }
        updateValue(key, value);
      }}
      onReset={() => usePlaygroundStore.getState().resetPreview("media-text-hover")}
    />
  );
}
