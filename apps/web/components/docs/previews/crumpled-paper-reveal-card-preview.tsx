"use client";

import { CrumpledPaperReveal } from "@workspace/ui/components/crumpled-paper-reveal";
import { crumpledPaperRevealDemoImage } from "./crumpled-paper-reveal-preview";

export function CrumpledPaperRevealCardPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="w-[150px] max-w-[72%]">
        <CrumpledPaperReveal
          image={crumpledPaperRevealDemoImage}
          trigger="hover"
          aspect="4:5"
          shape="Tight Wad"
          duration={1}
          previewMode
          autoPlayInterval={3400}
        />
      </div>
    </div>
  );
}
