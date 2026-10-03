"use client";

import { AshReveal } from "@workspace/ui/components/burn-plus";
import { useState } from "react";
import { useTheme } from "next-themes";
import type {
  BurnPlusDirection,
  BurnPlusFit,
  BurnPlusTransition,
  BurnPlusTrigger,
} from "@workspace/ui/components/burn-plus";
import { create } from "zustand";
import {
  PlaygroundColorPicker,
  PlaygroundSectionTitle,
  PlaygroundSlider,
  PlaygroundSwitch,
} from "@/components/playground-primitives";
import { cn } from "@/lib/utils";

type BurnPlusConfig = {
  burn: number;
  density: number;
  distortion: number;
  edgeSoftness: number;
  noiseScale: number;
  octaves: number;
  seed: number;
  edgeComplexity: number;
  start: number;
  end: number;
  completeAt: number;
  duration: number;
  delay: number;
  loop: boolean;
  loopDelay: number;
  invert: boolean;
  autoplay: boolean;
  fit: BurnPlusFit;
  trigger: BurnPlusTrigger;
  direction: BurnPlusDirection;
  transition: BurnPlusTransition;
  background: string;
};

const DEFAULT_CONFIG: BurnPlusConfig = {
  burn: 0,
  density: 0.18,
  distortion: 0.12,
  edgeSoftness: 0.22,
  noiseScale: 1,
  octaves: 4,
  seed: 1,
  edgeComplexity: 0.05,
  start: 0.08,
  end: 0.72,
  completeAt: 0.72,
  duration: 3200,
  delay: 0,
  loop: true,
  loopDelay: 1400,
  invert: false,
  autoplay: true,
  fit: "cover",
  trigger: "load",
  direction: "reveal",
  transition: "easeInOut",
  background: "#000000",
};

const useBurnPlusStore = create<{
  config: BurnPlusConfig;
  update: (next: Partial<BurnPlusConfig>) => void;
  reset: () => void;
}>((set) => ({
  config: DEFAULT_CONFIG,
  update: (next) => set((state) => ({ config: { ...state.config, ...next } })),
  reset: () => set({ config: DEFAULT_CONFIG }),
}));

export function BurnPlusPreview() {
  const config = useBurnPlusStore((state) => state.config);
  const [runId, setRunId] = useState(0);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";
  // Follow the theme until the user picks a custom burn background.
  const resolvedBackground =
    !isDark && config.background === DEFAULT_CONFIG.background
      ? "#f5f5f4"
      : config.background;

  return (
    <section
      className={cn(
        "h-full min-h-0 w-full overflow-hidden transition-colors duration-500",
        isDark ? "bg-black" : "bg-[#f5f5f4]",
      )}
      style={{ containerType: "inline-size" }}
    >
      <AshReveal
        key={`${runId}-${resolvedBackground}`}
        {...config}
        background={resolvedBackground}
        className="h-full min-h-0 w-full"
        media="/images/spiral-3d-slider/orange-haze.jpg"
        fit="fill"
        ariaLabel="Burn reveal demo — portrait emerging through an organic burn mask"
      />
      <button
        type="button"
        onClick={() => setRunId((value) => value + 1)}
        className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/25 bg-black/70 px-4 py-2 text-xs font-medium text-white shadow-lg backdrop-blur-md transition-colors hover:bg-black/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        Replay animation
      </button>
    </section>
  );
}

function BurnPlusSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (val: string) => void;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-foreground/90">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-10 w-full cursor-pointer rounded-md border border-border/70 bg-transparent px-2.5 text-sm text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/25 [&>option]:bg-background",
        )}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

export function BurnPlusPersonalizePanel() {
  const config = useBurnPlusStore((state) => state.config);
  const update = useBurnPlusStore((state) => state.update);
  const reset = useBurnPlusStore((state) => state.reset);

  return (
    <div className="h-full overflow-auto bg-background [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="space-y-7 px-4 pb-12 pt-20">
        <header className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tighter text-foreground">
            Personalize
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground/90">
            Drive the burn field, endpoints, and animation live.
          </p>
        </header>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={reset}
            className="rounded-md border border-border/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Reset
          </button>
        </div>

        <section className="space-y-3">
          <PlaygroundSectionTitle>Burn Field</PlaygroundSectionTitle>
          <PlaygroundSlider label="Burn" min={0} max={1} step={0.01} value={config.burn} onChange={(burn) => update({ burn, trigger: "manual" })} />
          <PlaygroundSlider label="Density" min={0} max={1} step={0.01} value={config.density} onChange={(density) => update({ density })} />
          <PlaygroundSlider label="Distortion" min={0} max={1} step={0.01} value={config.distortion} onChange={(distortion) => update({ distortion })} />
          <BurnPlusSelect label="Media fit" value={config.fit} options={["cover", "contain", "fill"] as const} onChange={(fit) => update({ fit: fit as BurnPlusFit })} />
        </section>

        <section className="space-y-3">
          <PlaygroundSectionTitle>Advance</PlaygroundSectionTitle>
          <PlaygroundSlider label="Edge softness" min={0} max={1} step={0.01} value={config.edgeSoftness} onChange={(edgeSoftness) => update({ edgeSoftness })} />
          <PlaygroundSlider label="Noise scale" min={0.25} max={4} step={0.05} value={config.noiseScale} onChange={(noiseScale) => update({ noiseScale })} />
          <PlaygroundSlider label="Octaves" min={1} max={5} step={1} value={config.octaves} onChange={(octaves) => update({ octaves })} />
          <PlaygroundSlider label="Seed" min={0} max={10} step={0.5} value={config.seed} onChange={(seed) => update({ seed })} />
          <PlaygroundSlider label="Edge complexity" min={0} max={1} step={0.01} value={config.edgeComplexity} onChange={(edgeComplexity) => update({ edgeComplexity })} />
          <PlaygroundSlider label="Start" min={0} max={1} step={0.01} value={config.start} onChange={(start) => update({ start: Math.min(start, config.end) })} />
          <PlaygroundSlider label="End" min={0} max={1} step={0.01} value={config.end} onChange={(end) => update({ end: Math.max(end, config.start) })} />
          <PlaygroundSlider label="Clean completion" min={0} max={1} step={0.01} value={config.completeAt} onChange={(completeAt) => update({ completeAt })} />
          <PlaygroundSwitch label="Invert mask" checked={config.invert} onChange={(invert) => update({ invert })} />
          <PlaygroundColorPicker label="Background" value={config.background} onChange={(background) => update({ background })} defaultColor={DEFAULT_CONFIG.background} />
        </section>

        <section className="space-y-3">
          <PlaygroundSectionTitle>Animation</PlaygroundSectionTitle>
          <BurnPlusSelect label="Trigger" value={config.trigger} options={["manual", "load", "hover", "tap", "inview", "scroll"]} onChange={(trigger) => update({ trigger: trigger as BurnPlusTrigger })} />
          <BurnPlusSelect label="Direction" value={config.direction} options={["reveal", "hide", "alternate"]} onChange={(direction) => update({ direction: direction as BurnPlusDirection })} />
          <BurnPlusSelect label="Transition" value={config.transition} options={["linear", "easeIn", "easeOut", "easeInOut", "custom"]} onChange={(transition) => update({ transition: transition as BurnPlusTransition })} />
          <PlaygroundSlider label="Duration (ms)" min={200} max={6000} step={50} value={config.duration} onChange={(duration) => update({ duration })} />
          <PlaygroundSlider label="Delay (ms)" min={0} max={3000} step={50} value={config.delay} onChange={(delay) => update({ delay })} />
          <PlaygroundSwitch label="Autoplay" checked={config.autoplay} onChange={(autoplay) => update({ autoplay })} />
          <PlaygroundSwitch label="Loop" checked={config.loop} onChange={(loop) => update({ loop })} />
        </section>
      </div>
    </div>
  );
}
