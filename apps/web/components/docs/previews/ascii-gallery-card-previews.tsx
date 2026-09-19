"use client";

import { AsciiEffect } from "@workspace/ui/components/ascii-effect";
import { AsciiImage } from "@workspace/ui/components/ascii-image";
import { useTheme } from "next-themes";

export function AsciiGalleryImageCardPreview() {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme !== "light";

  return (
    <div className="relative size-full">
      <AsciiImage
        src="/images/players/ronaldo-ascii.png"
        alt="Cristiano Ronaldo rendered as ASCII art"
        preset="classic"
        resolution="medium"
        backgroundMode="edge"
        backgroundThreshold={0.1}
        fit="cover"
        position="center"
        foreground={dark ? "#f4f4f5" : "#18181b"}
        background={dark ? "#111827" : "#e5e7eb"}
      />
      <PlayerLabel>RONALDO · ASCII PORTRAIT</PlayerLabel>
    </div>
  );
}

export function AsciiGalleryEffectCardPreview({ animated = true }: { animated?: boolean }) {
  const { resolvedTheme } = useTheme();

  return (
    <div className="relative size-full">
      <AsciiEffect
        imageSrc="/images/players/messi-ascii.png"
        alt="Lionel Messi rendered with flowing ASCII characters"
        variant={animated ? "flow" : "image"}
        fontSize={10}
        scale={1.25}
        fit="cover"
        brightnessBoost={2.4}
        threshold={0.035}
        contrast={1.25}
        posterize={16}
        dither="none"
        colors={["#f4f4f5", "#d4d4d8"]}
        flowSpeed={0.12}
        flowStrength={4}
        backgroundColor={resolvedTheme === "light" ? "#f4f4f5" : "#09090b"}
        className="size-full"
      />
      <PlayerLabel>MESSI · ASCII FLOW</PlayerLabel>
    </div>
  );
}

function PlayerLabel({ children }: { children: string }) {
  return (
    <span className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/65 px-2 py-1 font-mono text-[9px] tracking-[0.12em] text-white/85">
      {children}
    </span>
  );
}
