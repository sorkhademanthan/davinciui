"use client";

import { TeamSlideReveal } from "@workspace/ui/components/team-slide-reveal";

export function TeamSlideRevealPreview() {
  return (
    <div className="flex h-full min-h-0 w-full items-center justify-center overflow-hidden bg-zinc-100 p-5 transition-colors dark:bg-zinc-950 sm:p-8" style={{ containerType: "inline-size" }}>
      <div className="aspect-[.73] h-[min(82%,32rem)] max-h-full max-w-[82cqi] shadow-2xl">
        <TeamSlideReveal />
      </div>
    </div>
  );
}
