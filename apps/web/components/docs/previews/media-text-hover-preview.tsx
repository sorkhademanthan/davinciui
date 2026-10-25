"use client";

import * as React from "react";
import { create } from "zustand";
import { useTheme } from "next-themes";
import {
  MediaTextHover,
  type MediaTextHoverMode,
} from "@workspace/ui/components/media-text-hover";
import { cn } from "@/lib/utils";
import { configEquals, usePlaygroundStore } from "@/hooks/use-playground-store";
import {
  PlaygroundInput,
  PlaygroundSectionTitle,
  PlaygroundSlider,
} from "@/components/playground-primitives";

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
  const reset = useMediaTextHoverStore((state) => state.reset);
  const maxSplit = Math.max(1, Array.from(config.text).length - 1);

  return (
    <div className="h-full overflow-auto bg-background [scrollbar-width:thin]">
      <div className="space-y-7 px-4 pb-10 pt-5">
        <header className="space-y-2">
          <p className="text-sm leading-relaxed text-muted-foreground/90">
            Shape the headline split, media window, and spring response.
          </p>
        </header>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={reset}
            className="rounded-md border border-border/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            Reset
          </button>
        </div>

        <div className="space-y-4">
          <PlaygroundSectionTitle>Content</PlaygroundSectionTitle>
          <PlaygroundInput
            value={config.text}
            onChange={(event) => {
              const text = event.target.value.slice(0, 20).toUpperCase() || " ";
              update({
                text,
                splitIndex: Math.min(config.splitIndex, Math.max(1, text.length - 1)),
              });
            }}
            placeholder="DAVINCIUI"
          />
          <PlaygroundSlider
            label="Split position"
            min={1}
            max={maxSplit}
            step={1}
            value={Math.min(config.splitIndex, maxSplit)}
            onChange={(value) => update({ splitIndex: Math.round(value) })}
          />
          <div className="grid grid-cols-2 gap-1.5">
            {(["fixed", "dynamic"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => update({ mode })}
                className={cn(
                  "rounded-md border px-3 py-2 text-xs font-semibold capitalize transition-colors",
                  config.mode === mode
                    ? "border-foreground/60 bg-foreground text-background"
                    : "border-border/70 text-muted-foreground hover:text-foreground",
                )}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <PlaygroundSectionTitle>Media window</PlaygroundSectionTitle>
          <PlaygroundSlider label="Width" min={80} max={360} step={4} value={config.mediaWidth} unit="px" onChange={(mediaWidth) => update({ mediaWidth })} />
          <PlaygroundSlider label="Height" min={48} max={160} step={2} value={config.mediaHeight} unit="px" onChange={(mediaHeight) => update({ mediaHeight })} />
          <PlaygroundSlider label="Corner radius" min={0} max={48} step={1} value={config.mediaRadius} unit="px" onChange={(mediaRadius) => update({ mediaRadius })} />
          <PlaygroundSlider label="Type size" min={48} max={130} step={1} value={config.fontSize} unit="px" onChange={(fontSize) => update({ fontSize })} />
        </div>

        <div className="space-y-4">
          <PlaygroundSectionTitle>Spring</PlaygroundSectionTitle>
          <PlaygroundSlider label="Stiffness" min={80} max={500} step={10} value={config.springStiffness} onChange={(springStiffness) => update({ springStiffness })} />
          <PlaygroundSlider label="Damping" min={10} max={60} step={1} value={config.springDamping} onChange={(springDamping) => update({ springDamping })} />
        </div>
      </div>
    </div>
  );
}
