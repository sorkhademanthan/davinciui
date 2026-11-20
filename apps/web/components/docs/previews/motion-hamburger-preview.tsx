"use client";

import * as React from "react";
import { create } from "zustand";
import { useTheme } from "next-themes";
import { MotionHamburger } from "@workspace/ui/components/motion/motion-hamburger";
import { cn } from "@/lib/utils";
import { configEquals, usePlaygroundStore } from "@/hooks/use-playground-store";
import {
  CustomizePanel,
  bindCustomizeUpdate,
  type CustomizeControl,
} from "@/components/customize-panel";

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

const CONTROLS: CustomizeControl[] = [
  { type: "toggle", key: "startOpen", label: "Start open", group: "State" },
  { type: "slider", key: "size", label: "Size", min: 24, max: 240, step: 1, unit: "px", group: "Icon" },
  { type: "slider", key: "thickness", label: "Line thickness", min: 1, max: 8, step: 0.1, group: "Icon" },
  { type: "color", key: "color", label: "Icon color", defaultColor: "#FFFFFF", group: "Icon" },
  { type: "toggle", key: "showRing", label: "Show ring", group: "Ring" },
  { type: "color", key: "ringColor", label: "Ring color", defaultColor: "#FFFFFF", group: "Ring" },
  { type: "slider", key: "ringThickness", label: "Ring thickness", min: 0.5, max: 8, step: 0.1, group: "Ring" },
  { type: "slider", key: "ringPadding", label: "Ring padding", min: 0, max: 32, step: 1, unit: "px", group: "Ring" },
  { type: "slider", key: "hoverGrowth", label: "Hover growth", min: 1, max: 1.3, step: 0.01, group: "Hover" },
];

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

  return (
    <CustomizePanel
      slug="motion-hamburger"
      controls={CONTROLS}
      values={config}
      defaults={DEFAULT_CONFIG}
      onChange={bindCustomizeUpdate(update)}
      onReset={() => usePlaygroundStore.getState().resetPreview("motion-hamburger")}
    />
  );
}
