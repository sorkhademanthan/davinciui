"use client";

import * as React from "react";
import { create } from "zustand";
import { useTheme } from "next-themes";
import { WaveBarsLoader } from "@workspace/ui/components/wave-bars-loader";
import {
  CustomizePanel,
  bindCustomizeUpdate,
  type CustomizeControl,
} from "@/components/customize-panel";
import { cn } from "@/lib/utils";
import { configEquals, usePlaygroundStore } from "@/hooks/use-playground-store";

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

const CONTROLS: CustomizeControl[] = [
  { type: "slider", key: "size", label: "Size", min: 16, max: 160, step: 1, unit: "px", group: "Loader" },
  { type: "color", key: "color", label: "Bar color", defaultColor: "#42E6C6", group: "Loader" },
  { type: "slider", key: "speed", label: "Speed", min: 0.1, max: 3, step: 0.1, group: "Loader" },
  { type: "toggle", key: "paused", label: "Paused", group: "Loader" },
  { type: "slider", key: "gap", label: "Gap", min: 0, max: 32, step: 0.5, unit: "px", group: "Geometry" },
  { type: "slider", key: "barWidth", label: "Bar width", min: 4, max: 64, step: 0.5, unit: "px", group: "Geometry" },
  { type: "slider", key: "borderRadius", label: "Corner radius", min: 0, max: 32, step: 0.5, unit: "px", group: "Geometry" },
  { type: "toggle", key: "glow", label: "Show glow", group: "Glow" },
  { type: "slider", key: "glowIntensity", label: "Glow intensity", min: 0, max: 2.5, step: 0.1, group: "Glow" },
];

const useWaveBarsLoaderStore = create<{
  config: WaveBarsLoaderConfig;
  update: (next: Partial<WaveBarsLoaderConfig>) => void;
  reset: () => void;
}>((set) => ({
  config: DEFAULT_CONFIG,
  update: (next) => set((state) => ({ config: { ...state.config, ...next } })),
  reset: () => set({ config: DEFAULT_CONFIG }),
}));

function generateCode(config: WaveBarsLoaderConfig, barColor: string) {
  return `import { WaveBarsLoader } from "@/components/ui/wave-bars-loader"

<WaveBarsLoader
  size={${config.size}}
  color=${JSON.stringify(barColor)}
  speed={${config.speed}}
  gap={${config.gap}}
  barWidth={${config.barWidth}}
  borderRadius={${config.borderRadius}}
  glow={${config.glow}}
  glowIntensity={${config.glowIntensity}}
  paused={${config.paused}}
/>`;
}

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

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      const api = usePlaygroundStore.getState();
      api.registerPreviewReset("wave-bars-loader", () => useWaveBarsLoaderStore.getState().reset());
      api.setPersonalizedCode(
        "wave-bars-loader",
        generateCode(config, barColor),
        !configEquals(config, DEFAULT_CONFIG),
      );
    }, 180);
    return () => window.clearTimeout(timer);
  }, [config, barColor]);

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

  return (
    <CustomizePanel
      slug="wave-bars-loader"
      controls={CONTROLS}
      values={config}
      defaults={DEFAULT_CONFIG}
      onChange={bindCustomizeUpdate(update)}
      onReset={() => usePlaygroundStore.getState().resetPreview("wave-bars-loader")}
    />
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
