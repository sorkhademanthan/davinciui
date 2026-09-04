"use client";

import * as React from "react";
import { create } from "zustand";
import { ShakeText, type ShakeTextHandle, type ShakeTextTrigger } from "@workspace/ui/components/shake-text";
import { cn } from "@/lib/utils";
import { usePlaygroundStore } from "@/hooks/use-playground-store";
import {
  PlaygroundInput,
  PlaygroundSectionTitle,
  PlaygroundSlider,
} from "@/components/playground-primitives";

// ─────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────

interface ShakeTextPlaygroundConfig {
  text: string;
  trigger: ShakeTextTrigger;
  shakeIntensity: number;
  shakeDuration: number;
}

const DEFAULT_CONFIG: ShakeTextPlaygroundConfig = {
  text: "SHAKER",
  trigger: "mount",
  shakeIntensity: 1,
  shakeDuration: 0.65,
};

const PRESETS: Array<{ name: string; config: ShakeTextPlaygroundConfig }> = [
  { name: "Mount", config: { text: "SHAKER", trigger: "mount", shakeIntensity: 1, shakeDuration: 0.65 } },
  { name: "Hover", config: { text: "SHAKER", trigger: "hover", shakeIntensity: 1, shakeDuration: 0.65 } },
  { name: "Click", config: { text: "BOUNCE", trigger: "click", shakeIntensity: 1.4, shakeDuration: 0.7 } },
];

interface ShakeTextPlaygroundStore {
  config: ShakeTextPlaygroundConfig;
  updateConfig: (u: Partial<ShakeTextPlaygroundConfig>) => void;
  resetConfig: () => void;
}

const useShakeTextPlayground = create<ShakeTextPlaygroundStore>((set) => ({
  config: DEFAULT_CONFIG,
  updateConfig: (u) => set((s) => ({ config: { ...s.config, ...u } })),
  resetConfig: () => set({ config: DEFAULT_CONFIG }),
}));

function generateCode(c: ShakeTextPlaygroundConfig) {
  return `import { ShakeText } from "@/components/ui/shake-text"

<ShakeText
  text=${JSON.stringify(c.text)}
  trigger=${JSON.stringify(c.trigger)}
  shakeIntensity={${c.shakeIntensity}}
  shakeDuration={${c.shakeDuration}}
/>`;
}

// ─────────────────────────────────────────────────────────────
// Playground — light stage that fills the preview pane
// ─────────────────────────────────────────────────────────────

export function ShakeTextPlayground() {
  const config = useShakeTextPlayground((s) => s.config);
  const shakeRef = React.useRef<ShakeTextHandle>(null);

  React.useEffect(() => {
    const t = window.setTimeout(() => usePlaygroundStore.getState().setCode(generateCode(config)), 180);
    return () => window.clearTimeout(t);
  }, [config]);

  return (
    <div className="flex h-full min-h-[420px] w-full items-center justify-center overflow-hidden bg-[#e8e6e1] p-6 dark:bg-[#111111] lg:min-h-[520px]">
      <ShakeText
        ref={shakeRef}
        text={config.text}
        trigger={config.trigger}
        shakeIntensity={config.shakeIntensity}
        shakeDuration={config.shakeDuration}
      />
    </div>
  );
}

export function ShakeTextPreview() {
  return <ShakeTextPlayground />;
}

export function ShakeTextManualExample() {
  const shakeRef = React.useRef<ShakeTextHandle>(null);

  return (
    <div className="flex min-h-[280px] w-full flex-col items-center justify-center gap-8 overflow-hidden bg-[#e8e6e1] p-6 dark:bg-[#111111]">
      <ShakeText ref={shakeRef} text="SHAKER" trigger="manual" />
      <button
        type="button"
        onClick={() => shakeRef.current?.shake()}
        className="rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background transition-transform hover:scale-105 active:scale-95"
      >
        Shake it
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Personalize panel
// ─────────────────────────────────────────────────────────────

const TRIGGERS: Array<{ label: string; value: ShakeTextTrigger }> = [
  { label: "Mount", value: "mount" },
  { label: "Hover", value: "hover" },
  { label: "Click", value: "click" },
  { label: "Manual", value: "manual" },
];

export function ShakeTextPersonalizePanel() {
  const config = useShakeTextPlayground((s) => s.config);
  const update = useShakeTextPlayground((s) => s.updateConfig);
  const reset = useShakeTextPlayground((s) => s.resetConfig);

  return (
    <div className="h-full overflow-auto bg-background [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="space-y-7 px-4 pb-10 pt-20">
        <header className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tighter">Personalize</h2>
          <p className="text-sm leading-relaxed text-muted-foreground/90">
            Tune the shaker — text, trigger, intensity and duration. Hover or click the stage to replay.
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
              const active = p.config.text === config.text && p.config.trigger === config.trigger;
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
            onChange={(e) => update({ text: e.target.value.slice(0, 16) || "SHAKER" })}
            placeholder="SHAKER"
          />
        </div>

        <div className="space-y-4">
          <PlaygroundSectionTitle>Shake</PlaygroundSectionTitle>
          <PlaygroundSlider label="Intensity" min={0.2} max={2.5} step={0.1} value={config.shakeIntensity} onChange={(v) => update({ shakeIntensity: v })} />
          <PlaygroundSlider label="Duration" min={0.2} max={1.5} step={0.05} value={config.shakeDuration} unit="s" onChange={(v) => update({ shakeDuration: v })} />
        </div>

        <div>
          <PlaygroundSectionTitle>Trigger</PlaygroundSectionTitle>
          <div className="grid grid-cols-4 gap-1.5">
            {TRIGGERS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => update({ trigger: t.value })}
                className={cn(
                  "rounded-md border px-2 py-2 font-mono text-[10px] uppercase tracking-wide",
                  config.trigger === t.value
                    ? "border-foreground/25 text-foreground shadow-sm"
                    : "border-border/70 text-muted-foreground",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
