"use client";

import * as React from "react";
import { create } from "zustand";
import { KineticText } from "@workspace/ui/components/kinetic-text";
import { cn } from "@/lib/utils";
import { usePlaygroundStore } from "@/hooks/use-playground-store";
import { PlaygroundInput, PlaygroundSectionTitle, PlaygroundSlider } from "@/components/playground-primitives";

interface KineticTextPlaygroundConfig {
  text: string;
  sliceCount: number;
  amplitude: number;
  duration: number;
}

const DEFAULT_CONFIG: KineticTextPlaygroundConfig = {
  text: "GSAP TEXT",
  sliceCount: 20,
  amplitude: 150,
  duration: 2,
};

const PRESETS = [
  { name: "GSAP", text: "GSAP TEXT", sliceCount: 20, amplitude: 150, duration: 2 },
  { name: "Kinetic", text: "KINETIC TYPE", sliceCount: 20, amplitude: 120, duration: 2 },
  { name: "Editorial", text: "DESIGN\nIN MOTION", sliceCount: 14, amplitude: 180, duration: 3 },
] as const;

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
  const text = c.text.includes("\n") ? `{"${c.text.replaceAll("\n", "\\n")}"}` : `"${c.text}"`;
  return `import { KineticText } from "@/components/ui/kinetic-text"

<KineticText
  text=${text}
  sliceCount={${c.sliceCount}}
  amplitude={${c.amplitude}}
  duration={${c.duration}}
/>`;
}

export function KineticTextPlayground() {
  const config = useKineticTextPlayground((s) => s.config);

  React.useEffect(() => {
    const t = window.setTimeout(() => usePlaygroundStore.getState().setCode(generateCode(config)), 180);
    return () => window.clearTimeout(t);
  }, [config]);

  return (
    <div className="flex min-h-[420px] w-full items-center justify-center bg-black p-6 lg:min-h-[520px]">
      <KineticText
        text={config.text}
        sliceCount={config.sliceCount}
        amplitude={config.amplitude}
        duration={config.duration}
      />
    </div>
  );
}

export function KineticTextPreview() {
  return <KineticTextPlayground />;
}

export function KineticTextPersonalizePanel() {
  const config = useKineticTextPlayground((s) => s.config);
  const update = useKineticTextPlayground((s) => s.updateConfig);
  const reset = useKineticTextPlayground((s) => s.resetConfig);

  return (
    <div className="h-full overflow-auto bg-background [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="space-y-7 px-4 pb-10 pt-20">
        <header className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tighter">Personalize</h2>
          <p className="text-sm leading-relaxed text-muted-foreground/90">Tune the kinetic motion — amount, distance and duration control the overlapping clone layers.</p>
        </header>

        <div className="flex justify-end">
          <button type="button" onClick={reset} className="rounded-md border border-border/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground">
            Reset
          </button>
        </div>

        <div>
          <PlaygroundSectionTitle>Presets</PlaygroundSectionTitle>
          <div className="grid grid-cols-3 gap-1.5">
            {PRESETS.map((p) => {
              const active = p.text === config.text && p.sliceCount === config.sliceCount && p.amplitude === config.amplitude;
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => update({ text: p.text, sliceCount: p.sliceCount, amplitude: p.amplitude, duration: p.duration })}
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
          <PlaygroundInput value={config.text} onChange={(e) => update({ text: e.target.value.slice(0, 48) || "GSAP TEXT" })} placeholder="GSAP TEXT" />
        </div>

        <div className="space-y-4">
          <PlaygroundSectionTitle>Motion</PlaygroundSectionTitle>
          <PlaygroundSlider label="Amount" min={3} max={32} step={1} value={config.sliceCount} onChange={(v) => update({ sliceCount: v })} />
          <PlaygroundSlider label="Distance" min={40} max={220} step={5} value={config.amplitude} unit="px" onChange={(v) => update({ amplitude: v })} />
          <PlaygroundSlider label="Duration" min={0.5} max={12} step={0.1} value={config.duration} unit="s" onChange={(v) => update({ duration: v })} />
        </div>
      </div>
    </div>
  );
}