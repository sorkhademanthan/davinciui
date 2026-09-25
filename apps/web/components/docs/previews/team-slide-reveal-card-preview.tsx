"use client";

import { TeamSlideReveal } from "@workspace/ui/components/team-slide-reveal";

/** Uses the production interaction, scaled only by the card's container. */
export function TeamSlideRevealCardPreview() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-zinc-100 p-3 transition-colors dark:bg-zinc-950" style={{ containerType: "inline-size" }}>
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
