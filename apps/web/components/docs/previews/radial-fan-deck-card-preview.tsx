"use client";

import { RadialFanDeck } from "@workspace/ui/components/radial-fan-deck";

export function RadialFanDeckCardPreview() {
  return (
    <RadialFanDeck
      cardWidth={142}
      scrollProgress={0}
      className="h-full min-h-0"
      ariaLabel="Radial fan deck card preview"
    />
  );
}
