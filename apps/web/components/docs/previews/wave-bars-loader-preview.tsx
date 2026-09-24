"use client";

import * as React from "react";
import { create } from "zustand";
import { useTheme } from "next-themes";
import { WaveBarsLoader } from "@workspace/ui/components/wave-bars-loader";
import {
  PlaygroundColorPicker,
  PlaygroundSectionTitle,
  PlaygroundSlider,
  PlaygroundSwitch,
} from "@/components/playground-primitives";
import { cn } from "@/lib/utils";

type WaveBarsLoaderConfig = {
  size: number;
  color: string;
  speed: number;
  gap: number;
  barWidth: number;
  borderRadius: number;
  glow: boolean;
  glowIntensity: number;
  paused: boolean;
};

const DEFAULT_CONFIG: WaveBarsLoaderConfig = {
  size: 60,
  color: "#42E6C6",
  speed: 1,
  gap: 60 * 0.11,
  barWidth: 60 * 0.32,
  borderRadius: 60 * 0.32 * 0.3,
  glow: true,
  glowIntensity: 1,
  paused: false,
};

const useWaveBarsLoaderStore = create<{
  config: WaveBarsLoaderConfig;
  update: (next: Partial<WaveBarsLoaderConfig>) => void;
  reset: () => void;
}>((set) => ({
  config: DEFAULT_CONFIG,
  update: (next) => set((state) => ({ config: { ...state.config, ...next } })),
  reset: () => set({ config: DEFAULT_CONFIG }),
}));

/**
 * Primary reference preview — mint bars on a very dark purple stage in dark
 * mode, deep teal bars on a light stage in light mode, centered, no extras.
 * Wired to the personalize store so the toolbar pill can tune it live.
 */
export function WaveBarsLoaderPreview() {
  const config = useWaveBarsLoaderStore((state) => state.config);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);
  // Site default theme is dark — render the dark stage until hydrated.
  const isDark = mounted ? resolvedTheme === "dark" : true;

  // Uncustomized bars follow the theme so the loader stays visible in both.
  const barColor =
    config.color === DEFAULT_CONFIG.color
      ? isDark
        ? "#42E6C6"
        : "#0D9488"
      : config.color;

  return (
    <section
      className={cn(
        "relative flex h-full min-h-[560px] w-full items-center justify-center overflow-hidden p-8",
        isDark ? "bg-[#120B1D]" : "bg-[#fafafa]",
      )}
      style={{ containerType: "inline-size" }}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0",
          isDark
            ? "bg-[radial-gradient(ellipse_at_50%_42%,rgba(66,230,198,0.08),transparent_64%)]"
            : "bg-[radial-gradient(ellipse_at_50%_42%,rgba(13,148,136,0.10),transparent_64%)]",
        )}
      />
      <div className="relative flex items-center justify-center">
        <WaveBarsLoader
          size={config.size}
          color={barColor}
          speed={config.speed}
          gap={config.gap}
          barWidth={config.barWidth}
          borderRadius={config.borderRadius}
          glow={config.glow}
          glowIntensity={config.glowIntensity}
          paused={config.paused}
        />
      </div>
    </section>
  );
}

export function WaveBarsLoaderPersonalizePanel() {
  const config = useWaveBarsLoaderStore((state) => state.config);
  const update = useWaveBarsLoaderStore((state) => state.update);
  const reset = useWaveBarsLoaderStore((state) => state.reset);

  return (
    <div className="h-full overflow-auto bg-background [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="space-y-7 px-4 pb-12 pt-20">
        <header className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tighter text-foreground">
            Personalize
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground/90">
            Tune the bar size, color, speed, geometry, and glow.
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
          <PlaygroundSectionTitle>Loader</PlaygroundSectionTitle>
          <PlaygroundSlider
            label="Size"
            value={config.size}
            min={16}
            max={160}
            step={1}
            unit="px"
            onChange={(size) => update({ size })}
          />
          <PlaygroundColorPicker
            label="Bar Color"
            value={config.color}
            defaultColor="#42E6C6"
            onChange={(color) => update({ color })}
          />
          <PlaygroundSlider
            label="Speed"
            value={config.speed}
            min={0.1}
            max={3}
            step={0.1}
            onChange={(speed) => update({ speed })}
          />
          <PlaygroundSwitch
            label="Paused"
            checked={config.paused}
            onChange={(paused) => update({ paused })}
          />
        </section>

        <section className="space-y-3">
          <PlaygroundSectionTitle>Geometry</PlaygroundSectionTitle>
          <PlaygroundSlider
            label="Gap"
            value={config.gap}
            min={0}
            max={32}
            step={0.5}
            unit="px"
            onChange={(gap) => update({ gap })}
          />
          <PlaygroundSlider
            label="Bar Width"
            value={config.barWidth}
            min={4}
            max={64}
            step={0.5}
            unit="px"
            onChange={(barWidth) => update({ barWidth })}
          />
          <PlaygroundSlider
            label="Corner Radius"
            value={config.borderRadius}
            min={0}
            max={32}
            step={0.5}
            unit="px"
            onChange={(borderRadius) => update({ borderRadius })}
          />
        </section>

        <section className="space-y-3">
          <PlaygroundSectionTitle>Glow</PlaygroundSectionTitle>
          <PlaygroundSwitch
            label="Show Glow"
            checked={config.glow}
            onChange={(glow) => update({ glow })}
          />
          <PlaygroundSlider
            label="Glow Intensity"
            value={config.glowIntensity}
            min={0}
            max={2.5}
            step={0.1}
            onChange={(glowIntensity) => update({ glowIntensity })}
          />
        </section>
      </div>
    </div>
  );
}

/**
 * Shared stage for the Size / Color / Speed / Glow variant previews.
 * Matches the Default stage (full-height, centered, theme-aware) so every
 * bottom variant tab sits at the center of the screen. The inner row keeps
 * `items-end` so loaders of different heights stay baseline-aligned while
 * the group as a whole stays centered.
 */
function WaveBarsVariantStage({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);
  // Site default theme is dark — render the dark stage until hydrated.
  const isDark = mounted ? resolvedTheme === "dark" : true;

  return (
    <div
      className={cn(
        "flex h-full min-h-[560px] w-full items-center justify-center p-8",
        isDark ? "bg-[#120B1D]" : "bg-[#fafafa]",
      )}
    >
      <div className="flex flex-wrap items-end justify-center gap-10">
        {children}
      </div>
    </div>
  );
}

export function WaveBarsLoaderSizePreview() {
  return (
    <WaveBarsVariantStage>
      <WaveBarsLoader size={32} />
      <WaveBarsLoader size={60} />
      <WaveBarsLoader size={96} />
    </WaveBarsVariantStage>
  );
}

export function WaveBarsLoaderColorPreview() {
  return (
    <WaveBarsVariantStage>
      <WaveBarsLoader color="#42E6C6" />
      <WaveBarsLoader color="#7C6CFF" />
      <WaveBarsLoader color="#FF6B6B" />
    </WaveBarsVariantStage>
  );
}

export function WaveBarsLoaderSpeedPreview() {
  return (
    <WaveBarsVariantStage>
      <WaveBarsLoader speed={0.5} />
      <WaveBarsLoader speed={1} />
      <WaveBarsLoader speed={2} />
    </WaveBarsVariantStage>
  );
}

export function WaveBarsLoaderGlowPreview() {
  return (
    <WaveBarsVariantStage>
      <WaveBarsLoader glow={false} />
      <WaveBarsLoader glow />
      <WaveBarsLoader glow glowIntensity={2} />
    </WaveBarsVariantStage>
  );
}
