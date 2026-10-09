"use client";

import * as React from "react";
import { create } from "zustand";
import { KineticText, type KineticTextDirection } from "@workspace/ui/components/gsap-text";
import { cn } from "@/lib/utils";
import { configEquals, usePlaygroundStore } from "@/hooks/use-playground-store";
import {
  PlaygroundInput,
  PlaygroundSectionTitle,
  PlaygroundSlider,
} from "@/components/playground-primitives";

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

const DIRECTIONS: Array<{ label: string; value: KineticTextDirection }> = [
  { label: "Up", value: "up" },
  { label: "Down", value: "down" },
  { label: "Both", value: "both" },
];

export function GSAPTextPersonalizePanel() {
  const config = useKineticTextPlayground((s) => s.config);
  const update = useKineticTextPlayground((s) => s.updateConfig);
  const reset = useKineticTextPlayground((s) => s.resetConfig);

  return (
    <div className="h-full overflow-auto bg-background [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="space-y-7 px-4 pb-10 pt-20">
        <header className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tighter">Personalize</h2>
          <p className="text-sm leading-relaxed text-muted-foreground/90">
            Tune the kinetic text — layers, distance and duration control the overlapping motion.
          </p>
        </header>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={reset}
            className="rounded-md border border-border/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            Reset
          </button>
        </div>

        <div>
          <PlaygroundSectionTitle>Presets</PlaygroundSectionTitle>
          <div className="grid grid-cols-3 gap-1.5">
            {PRESETS.map((p) => {
              const active = p.config.text === config.text && p.config.direction === config.direction;
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => update({ ...p.config })}
                  className={cn(
                    "rounded-md border px-2 py-2 font-mono text-[10px] uppercase tracking-wide",
                    active ? "border-foreground/25 text-foreground shadow-sm" : "border-border/70 text-muted-foreground",
                  )}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <PlaygroundSectionTitle>Content</PlaygroundSectionTitle>
          <PlaygroundInput
            value={config.text}
            onChange={(e) => update({ text: e.target.value.slice(0, 32) || "DAVINCIUI" })}
            placeholder="DAVINCIUI"
          />
        </div>

        <div className="space-y-4">
          <PlaygroundSectionTitle>Kinetic text</PlaygroundSectionTitle>
          <PlaygroundSlider label="Layers" min={1} max={30} step={1} value={config.layerCount} onChange={(v) => update({ layerCount: v })} />
          <PlaygroundSlider label="Distance" min={40} max={500} step={10} value={config.distance} unit="px" onChange={(v) => update({ distance: v })} />
          <PlaygroundSlider label="Duration" min={0.5} max={12} step={0.5} value={config.duration} unit="s" onChange={(v) => update({ duration: v })} />
        </div>

        <div>
          <PlaygroundSectionTitle>Direction</PlaygroundSectionTitle>
          <div className="grid grid-cols-3 gap-1.5">
            {DIRECTIONS.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => update({ direction: d.value })}
                className={cn(
                  "rounded-md border px-2 py-2 font-mono text-[10px] uppercase tracking-wide",
                  config.direction === d.value
                    ? "border-foreground/25 text-foreground shadow-sm"
                    : "border-border/70 text-muted-foreground",
                )}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
