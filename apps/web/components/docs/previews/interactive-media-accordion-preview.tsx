"use client";

import * as React from "react";
import { create } from "zustand";
import {
  InteractiveMediaAccordion,
  type InteractiveMediaAccordionTrigger,
} from "@workspace/ui/components/interactive-media-accordion";
import { configEquals, usePlaygroundStore } from "@/hooks/use-playground-store";
import {
  CustomizePanel,
  bindCustomizeUpdate,
  type CustomizeControl,
} from "@/components/customize-panel";

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

const CONTROLS: CustomizeControl[] = [
  {
    type: "select",
    key: "trigger",
    label: "Trigger",
    options: [
      { label: "Scroll", value: "scroll" },
      { label: "Hover", value: "hover" },
      { label: "Click", value: "click" },
    ],
    group: "Interaction",
  },
  { type: "toggle", key: "autoPlay", label: "Auto play", group: "Interaction" },
  { type: "slider", key: "height", label: "Height", min: 320, max: 640, step: 8, unit: "px", group: "Layout" },
  { type: "slider", key: "gap", label: "Gap", min: 4, max: 28, step: 1, unit: "px", group: "Layout" },
  { type: "slider", key: "collapsedWidth", label: "Collapsed width", min: 72, max: 200, step: 2, unit: "px", group: "Layout" },
  { type: "slider", key: "radius", label: "Corner radius", min: 16, max: 80, step: 1, unit: "px", group: "Layout" },
  { type: "slider", key: "titleSize", label: "Title size", min: 24, max: 56, step: 1, unit: "px", group: "Layout" },
  { type: "slider", key: "duration", label: "Duration", min: 200, max: 1200, step: 25, unit: "ms", group: "Motion" },
  { type: "slider", key: "scrollStep", label: "Scroll distance", min: 400, max: 1200, step: 40, unit: "px", group: "Motion" },
];

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
    <div className="h-full w-full overflow-y-auto overscroll-contain bg-white px-4 py-10 dark:bg-black">
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

  return (
    <CustomizePanel
      slug="interactive-media-accordion"
      controls={CONTROLS}
      values={config}
      defaults={DEFAULT_CONFIG}
      onChange={bindCustomizeUpdate(update)}
      onReset={() => usePlaygroundStore.getState().resetPreview("interactive-media-accordion")}
    />
  );
}
