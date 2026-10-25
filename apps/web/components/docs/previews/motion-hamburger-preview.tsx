"use client";

import * as React from "react";
import { create } from "zustand";
import { useTheme } from "next-themes";
import { MotionHamburger } from "@workspace/ui/components/motion/motion-hamburger";
import {
  PlaygroundColorPicker,
  PlaygroundSectionTitle,
  PlaygroundSlider,
  PlaygroundSwitch,
} from "@/components/playground-primitives";
import { cn } from "@/lib/utils";
import { configEquals, usePlaygroundStore } from "@/hooks/use-playground-store";

type MotionHamburgerConfig = {
  startOpen: boolean;
  size: number;
  color: string;
  thickness: number;
  showRing: boolean;
  ringColor: string;
  ringThickness: number;
  ringPadding: number;
  hoverGrowth: number;
};

const DEFAULT_CONFIG: MotionHamburgerConfig = {
  startOpen: false,
  size: 120,
  color: "#FFFFFF",
  thickness: 2.5,
  showRing: false,
  ringColor: "#FFFFFF",
  ringThickness: 1,
  ringPadding: 6,
  hoverGrowth: 1.05,
};

const useMotionHamburgerStore = create<{
  config: MotionHamburgerConfig;
  update: (next: Partial<MotionHamburgerConfig>) => void;
  reset: () => void;
}>((set) => ({
  config: DEFAULT_CONFIG,
  update: (next) => set((state) => ({ config: { ...state.config, ...next } })),
  reset: () => set({ config: DEFAULT_CONFIG }),
}));

function generateCode(
  config: MotionHamburgerConfig,
  iconColor: string,
  ringColor: string,
) {
  return `import { MotionHamburger } from "@/components/ui/motion-hamburger"

<MotionHamburger
  initialState=${JSON.stringify(config.startOpen ? "open" : "closed")}
  size={${config.size}}
  color=${JSON.stringify(iconColor)}
  thickness={${config.thickness}}
  showRing={${config.showRing}}
  ringColor=${JSON.stringify(ringColor)}
  ringThickness={${config.ringThickness}}
  ringPadding={${config.ringPadding}}
  hoverGrowth={${config.hoverGrowth}}
/>`;
}

export function MotionHamburgerPreview() {
  const config = useMotionHamburgerStore((state) => state.config);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);
  // Site default theme is dark — render the dark stage until hydrated.
  const isDark = mounted ? resolvedTheme === "dark" : true;

  // Uncustomized colors follow the theme so the icon stays visible in both.
  const iconColor =
    config.color === DEFAULT_CONFIG.color
      ? isDark
        ? "#FFFFFF"
        : "#18181B"
      : config.color;
  const ringColor =
    config.ringColor === DEFAULT_CONFIG.ringColor
      ? isDark
        ? "rgba(255, 255, 255, 0.35)"
        : "rgba(24, 24, 27, 0.35)"
      : config.ringColor;

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      const api = usePlaygroundStore.getState();
      api.registerPreviewReset("motion-hamburger", () => useMotionHamburgerStore.getState().reset());
      api.setPersonalizedCode(
        "motion-hamburger",
        generateCode(config, iconColor, ringColor),
        !configEquals(config, DEFAULT_CONFIG),
      );
    }, 180);
    return () => window.clearTimeout(timer);
  }, [config, iconColor, ringColor]);

  return (
    <section
      className={cn(
        "relative flex h-full min-h-[560px] w-full flex-col items-center justify-center overflow-hidden px-6 text-center",
        isDark ? "bg-[#0c0c0e]" : "bg-[#fafafa]",
      )}
      style={{ containerType: "inline-size" }}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0",
          isDark
            ? "bg-[radial-gradient(ellipse_at_50%_42%,rgba(255,255,255,0.09),transparent_64%)]"
            : "bg-[radial-gradient(ellipse_at_50%_42%,rgba(24,24,27,0.08),transparent_64%)]",
        )}
      />
      <div className="relative flex items-center justify-center">
        <MotionHamburger
          initialState={config.startOpen ? "open" : "closed"}
          size={config.size}
          color={iconColor}
          thickness={config.thickness}
          showRing={config.showRing}
          ringColor={ringColor}
          ringThickness={config.ringThickness}
          ringPadding={config.ringPadding}
          hoverGrowth={config.hoverGrowth}
        />
      </div>
    </section>
  );
}

export function MotionHamburgerPersonalizePanel() {
  const config = useMotionHamburgerStore((state) => state.config);
  const update = useMotionHamburgerStore((state) => state.update);
  const reset = useMotionHamburgerStore((state) => state.reset);

  return (
    <div className="h-full overflow-auto bg-background [scrollbar-width:thin]">
      <div className="space-y-7 px-4 pb-12 pt-5">
        <header className="space-y-2">
          <p className="text-sm leading-relaxed text-muted-foreground/90">
            Tune the icon size, stroke, ring, and hover feel.
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
          <PlaygroundSectionTitle>State</PlaygroundSectionTitle>
          <PlaygroundSwitch
            label="Start open"
            checked={config.startOpen}
            onChange={(startOpen) => update({ startOpen })}
          />
        </section>

        <section className="space-y-3">
          <PlaygroundSectionTitle>Icon</PlaygroundSectionTitle>
          <PlaygroundSlider
            label="Size"
            value={config.size}
            min={24}
            max={240}
            step={1}
            unit="px"
            onChange={(size) => update({ size })}
          />
          <PlaygroundSlider
            label="Line Thickness"
            value={config.thickness}
            min={1}
            max={8}
            step={0.1}
            onChange={(thickness) => update({ thickness })}
          />
          <PlaygroundColorPicker
            label="Icon Color"
            value={config.color}
            defaultColor="#FFFFFF"
            onChange={(color) => update({ color })}
          />
        </section>

        <section className="space-y-3">
          <PlaygroundSectionTitle>Ring</PlaygroundSectionTitle>
          <PlaygroundSwitch
            label="Show Ring"
            checked={config.showRing}
            onChange={(showRing) => update({ showRing })}
          />
          <PlaygroundColorPicker
            label="Ring Color"
            value={config.ringColor}
            defaultColor="#FFFFFF"
            onChange={(ringColor) => update({ ringColor })}
          />
          <PlaygroundSlider
            label="Ring Thickness"
            value={config.ringThickness}
            min={0.5}
            max={8}
            step={0.1}
            onChange={(ringThickness) => update({ ringThickness })}
          />
          <PlaygroundSlider
            label="Ring Padding"
            value={config.ringPadding}
            min={0}
            max={32}
            step={1}
            unit="px"
            onChange={(ringPadding) => update({ ringPadding })}
          />
        </section>

        <section className="space-y-3">
          <PlaygroundSectionTitle>Hover</PlaygroundSectionTitle>
          <PlaygroundSlider
            label="Hover Growth"
            value={config.hoverGrowth}
            min={1}
            max={1.3}
            step={0.01}
            onChange={(hoverGrowth) => update({ hoverGrowth })}
          />
        </section>
      </div>
    </div>
  );
}
