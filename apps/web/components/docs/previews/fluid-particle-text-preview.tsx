"use client";

import { useTheme } from "next-themes";
import { FluidParticleText } from "@workspace/ui/components/fluid-particle-text";

interface FluidParticleTextPreviewProps {
  fontFamily: string;
}

export function FluidParticleTextPreview({
  fontFamily,
}: FluidParticleTextPreviewProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <FluidParticleText
      preset="showcase"
      text="INK"
      fontFamily={fontFamily}
      padding={0.16}
      color={isDark ? "#f4f4f5" : "#18181b"}
      background={isDark ? "#09090b" : "#fafafa"}
      outline
      strokeWidth={2.25}
      fillOpacity={1}
      className="h-full w-full"
    />
  );
}
