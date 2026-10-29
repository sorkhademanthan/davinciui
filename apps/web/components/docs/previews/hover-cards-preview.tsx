"use client";

import { HoverCards } from "@workspace/ui/components/hover-cards";

import { hoverCardsDemoItems } from "./hover-cards-items";

export function HoverCardsPreview() {
  return (
    <HoverCards
      items={hoverCardsDemoItems}
      showText={false}
      className="h-full min-h-[560px]"
    />
  );
}
