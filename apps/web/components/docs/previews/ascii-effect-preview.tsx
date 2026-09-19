"use client";

import { AsciiEffect } from "@workspace/ui/components/ascii-effect";
import { useTheme } from "next-themes";
import type { ReactNode } from "react";

const imageSrc = "/images/players/messi-ascii.png";

function PreviewFrame({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="relative size-full min-h-[420px] overflow-hidden bg-white dark:bg-black">
      {children}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent p-4 pt-16 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45 dark:text-white/45">
        <span>{label}</span>
        <span>Render / Live</span>
      </div>
    </div>
  );
}

function useAsciiTheme() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  return {
    backgroundColor: isDark ? "#07090d" : "#ffffff",
    isDark,
  };
}

export function AsciiImagePreview() {
  const { backgroundColor } = useAsciiTheme();
  return (
    <PreviewFrame label="Messi · Image">
      <AsciiEffect variant="image" imageSrc={imageSrc} fontSize={10} scale={1.25} fit="cover" brightnessBoost={1.6} threshold={0.05} contrast={1.2} posterize={12} dither="none" colors={["#f4f4f5", "#d4d4d8"]} backgroundColor={backgroundColor} />
    </PreviewFrame>
  );
}

export function AsciiFlowPreview() {
  const { backgroundColor } = useAsciiTheme();
  return (
    <PreviewFrame label="Flow">
      <AsciiEffect
        variant="flow"
        imageSrc={imageSrc}
        fontSize={10}
        scale={1.25}
        fit="cover"
        brightnessBoost={1.6}
        threshold={0.05}
        contrast={1.2}
        posterize={12}
        dither="none"
        colors={["#f4f4f5", "#d4d4d8"]}
        flowSpeed={0.22}
        flowStrength={12}
        mouseRadius={150}
        mouseStrength={22}
        backgroundColor={backgroundColor}
      />
    </PreviewFrame>
  );
}

export function AsciiGlitchPreview() {
  const { backgroundColor } = useAsciiTheme();
  return (
    <PreviewFrame label="Glitch">
      <AsciiEffect
        variant="glitch"
        imageSrc={imageSrc}
        fontSize={10}
        scale={1.25}
        fit="cover"
        brightnessBoost={1.6}
        threshold={0.05}
        contrast={1.2}
        posterize={12}
        dither="none"
        colors={["#f4f4f5", "#d4d4d8"]}
        glitchIntensity={0.8}
        glitchFrequency={1.8}
        backgroundColor={backgroundColor}
      />
    </PreviewFrame>
  );
}

export function AsciiCatalogPreview() {
  return (
    <AsciiEffect variant="flow" imageSrc={imageSrc} fontSize={10} scale={1.25} fit="cover" brightnessBoost={1.6} threshold={0.05} contrast={1.2} posterize={12} dither="none" colors={["#f4f4f5", "#d4d4d8"]} />
  );
}
