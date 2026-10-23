"use client";

import { HoverCards } from "@workspace/ui/components/hover-cards";
import { hoverCardsDemoItems } from "./hover-cards-preview";

export function HoverCardsCardPreview() {
  return (
    <HoverCards
      items={hoverCardsDemoItems}
      className="absolute inset-0 min-h-0"
      backdropBlur={18}
      showText={false}
      autoPlay
      autoPlayInterval={2600}
    />
  );
}
