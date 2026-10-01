"use client";

import * as React from "react";
import { TeamSlideReveal } from "@workspace/ui/components/team-slide-reveal";

/**
 * Uses the production interaction, scaled only by the card's container.
 * Clicks are isolated from the gallery card's wrapping link so the
 * profile ↔ summary swap can be toggled right on the card — the rest
 * of the card (title row, padding) still navigates to the docs.
 */
export function TeamSlideRevealCardPreview() {
  const keepInteractionOnCard = React.useCallback(
    (event: React.MouseEvent) => {
      // Stop the click reaching the wrapping anchor (Next.js navigation)
      // and cancel the anchor's native default navigation.
      event.stopPropagation();
      if (event.cancelable) event.preventDefault();
    },
    [],
  );

  return (
    <div
      className="absolute inset-0 flex items-center justify-center overflow-hidden bg-zinc-100 p-3 transition-colors dark:bg-zinc-950"
      style={{ containerType: "inline-size" }}
      onClickCapture={keepInteractionOnCard}
    >
      <div className="aspect-[.73] h-full max-w-[70cqi] shadow-xl">
        <TeamSlideReveal
          radius={9}
          duration={420}
          compact
          testimonial="I’m driven, curious, and committed to turning ideas into something bigger."
        />
      </div>
    </div>
  );
}
