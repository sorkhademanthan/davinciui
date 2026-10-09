"use client";

import * as React from "react";
import { create } from "zustand";
import {
  InteractiveMediaAccordion,
  type InteractiveMediaAccordionTrigger,
} from "@workspace/ui/components/interactive-media-accordion";
import { cn } from "@/lib/utils";
import { configEquals, usePlaygroundStore } from "@/hooks/use-playground-store";
import {
  PlaygroundSectionTitle,
  PlaygroundSlider,
} from "@/components/playground-primitives";

interface InteractiveMediaAccordionConfig {
  trigger: InteractiveMediaAccordionTrigger;
  height: number;
  gap: number;
  collapsedWidth: number;
  radius: number;
  titleSize: number;
  duration: number;
  scrollStep: number;
  autoPlay: boolean;
}

const DEFAULT_CONFIG: InteractiveMediaAccordionConfig = {
  trigger: "scroll",
  height: 480,
  gap: 14,
  collapsedWidth: 132,
  radius: 48,
  titleSize: 40,
  duration: 650,
  scrollStep: 800,
  autoPlay: false,
};

interface InteractiveMediaAccordionStore {
  config: InteractiveMediaAccordionConfig;
  update: (updates: Partial<InteractiveMediaAccordionConfig>) => void;
  reset: () => void;
}

const useInteractiveMediaAccordionStore =
  create<InteractiveMediaAccordionStore>((set) => ({
    config: DEFAULT_CONFIG,
    update: (updates) =>
      set((state) => ({ config: { ...state.config, ...updates } })),
    reset: () => set({ config: DEFAULT_CONFIG }),
  }));

function generateCode(config: InteractiveMediaAccordionConfig): string {
  return `import { InteractiveMediaAccordion } from "@/components/ui/interactive-media-accordion"

const items = [
  { id: "mist", media: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1600&q=80", title: "Mountains of Mist", description: "Wander into nature's hands." },
  { id: "dunes", media: "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=1600&q=80", title: "Golden Dunes", description: "Where the desert breathes." },
  { id: "tide", media: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80", title: "Emerald Tide", description: "Chase the endless horizon." },
  { id: "aurora", media: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1600&q=80", title: "Northern Aurora", description: "Light dancing on winter skies." },
  { id: "forest", media: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&q=80", title: "Silent Forest", description: "Listen to the trees whisper." },
]

<InteractiveMediaAccordion
  items={items}
  trigger=${JSON.stringify(config.trigger)}
  height={${config.height}}
  gap={${config.gap}}
  collapsedWidth={${config.collapsedWidth}}
  radius={${config.radius}}
  titleSize={${config.titleSize}}
  duration={${config.duration}}
  scrollStep={${config.scrollStep}}
  autoPlay={${config.autoPlay}}
/>`;
}

export function InteractiveMediaAccordionPlayground() {
  const config = useInteractiveMediaAccordionStore((state) => state.config);

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const api = usePlaygroundStore.getState();
      api.registerPreviewReset("interactive-media-accordion", () => useInteractiveMediaAccordionStore.getState().reset());
      api.setPersonalizedCode("interactive-media-accordion", generateCode(config), !configEquals(config, DEFAULT_CONFIG));
    }, 180);
    return () => window.clearTimeout(timeoutId);
  }, [config]);

  return (
    <div className="h-full w-full overflow-y-auto overscroll-contain bg-black px-4 py-10">
      <InteractiveMediaAccordion
        trigger={config.trigger}
        height={config.height}
        gap={config.gap}
        collapsedWidth={config.collapsedWidth}
        radius={config.radius}
        titleSize={config.titleSize}
        duration={config.duration}
        scrollStep={config.scrollStep}
        autoPlay={config.autoPlay}
        autoPlayInterval={4000}
        className="mx-auto max-w-[1080px]"
      />
    </div>
  );
}

export function InteractiveMediaAccordionPersonalizePanel() {
  const config = useInteractiveMediaAccordionStore((state) => state.config);
  const update = useInteractiveMediaAccordionStore((state) => state.update);
  const reset = useInteractiveMediaAccordionStore((state) => state.reset);

  return (
    <div className="h-full overflow-auto bg-background [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="space-y-7 px-4 pb-10 pt-20">
        <header className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tighter">Personalize</h2>
          <p className="text-sm leading-relaxed text-muted-foreground/90">
            Shape the accordion geometry, text scale, and motion response.
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
          <PlaygroundSectionTitle>Interaction</PlaygroundSectionTitle>
          <div className="grid grid-cols-3 gap-1.5">
            {(["scroll", "hover", "click"] as const).map((trigger) => (
              <button
                key={trigger}
                type="button"
                onClick={() => update({ trigger })}
                className={cn(
                  "rounded-md border px-3 py-2 text-xs font-semibold capitalize transition-colors",
                  config.trigger === trigger
                    ? "border-foreground/60 bg-foreground text-background"
                    : "border-border/70 text-muted-foreground hover:text-foreground",
                )}
              >
                {trigger}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {([false, true] as const).map((autoPlay) => (
              <button
                key={String(autoPlay)}
                type="button"
                onClick={() => update({ autoPlay })}
                className={cn(
                  "rounded-md border px-3 py-2 text-xs font-semibold transition-colors",
                  config.autoPlay === autoPlay
                    ? "border-foreground/60 bg-foreground text-background"
                    : "border-border/70 text-muted-foreground hover:text-foreground",
                )}
              >
                {autoPlay ? "Auto play on" : "Auto play off"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <PlaygroundSectionTitle>Layout</PlaygroundSectionTitle>
          <PlaygroundSlider label="Height" min={320} max={640} step={8} value={config.height} unit="px" onChange={(height) => update({ height })} />
          <PlaygroundSlider label="Gap" min={4} max={28} step={1} value={config.gap} unit="px" onChange={(gap) => update({ gap })} />
          <PlaygroundSlider label="Collapsed width" min={72} max={200} step={2} value={config.collapsedWidth} unit="px" onChange={(collapsedWidth) => update({ collapsedWidth })} />
          <PlaygroundSlider label="Corner radius" min={16} max={80} step={1} value={config.radius} unit="px" onChange={(radius) => update({ radius })} />
          <PlaygroundSlider label="Title size" min={24} max={56} step={1} value={config.titleSize} unit="px" onChange={(titleSize) => update({ titleSize })} />
        </div>

        <div className="space-y-4">
          <PlaygroundSectionTitle>Motion</PlaygroundSectionTitle>
          <PlaygroundSlider label="Duration" min={200} max={1200} step={25} value={config.duration} unit="ms" onChange={(duration) => update({ duration })} />
          <PlaygroundSlider label="Scroll distance" min={400} max={1200} step={40} value={config.scrollStep} unit="px" onChange={(scrollStep) => update({ scrollStep })} />
        </div>
      </div>
    </div>
  );
}
