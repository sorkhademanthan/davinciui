"use client";

import { FluidParticleText } from "@workspace/ui/components/fluid-particle-text";

interface FluidParticleTextPreviewProps {
  fontFamily: string;
}

export function FluidParticleTextPreview({
  fontFamily,
}: FluidParticleTextPreviewProps) {
  return (
    <FluidParticleText
      preset="showcase"
      text="INK"
      fontFamily={fontFamily}
      padding={0.16}
      color="#000000"
      background="#ffffff"
      outline={false}
      strokeWidth={0}
      fillOpacity={1}
      strokeOpacity={0}
      className="h-full w-full"
    />
  );
}
